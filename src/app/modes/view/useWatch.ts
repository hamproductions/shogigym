import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Record } from 'tsshogi'
import { scoreWinRate } from '@/utils/analysis'
import { analyze, useEngineStatus } from '@/utils/engine'
import { applyUsi, colorSide, otherSide, positionOf } from '@/utils/shogi'
import { STRENGTH, useSettings, type AiStrength } from '@/appearance/settings'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Load } from '@/app/hooks/useModeSwitch'
import type { Game } from '@/app/types'
import { aiStrategyId, resolveAiStrategy, strategyReply } from '@/utils/book'

interface WatchState {
  game: Game
  ending?: string
  error?: string
  errorEpoch?: number
  winner?: 'sente' | 'gote'
}

interface WatchInput {
  state: WatchState | null
  epoch: number
  repetition: string | null
  started: boolean
  tossing: boolean
}

function deriveWatch(
  t: TFunction,
  { game, position, gameOver, atEnd, preview, playing, ai, mode }: BoardSession,
  { state, epoch, repetition, started, tossing }: WatchInput,
) {
  const current = state?.game === game ? state : null
  const ending = current?.ending
  const error = current && current.errorEpoch === epoch ? current.error : undefined
  const result = repetition ?? ending ?? (gameOver ? t('app.checkmateWon', { winner: t(`common.${otherSide(colorSide(position.color))}`) }) : null)
  const canPlay = started && !tossing && (!atEnd || !result)
  const running = mode === 'view' && playing && canPlay && !error && (!atEnd || !!preview || ai)
  return { ending, error, winner: current?.winner, result, canPlay, running }
}

export function useWatch(session: BoardSession, load: Load, reviewReady: boolean, tossing: boolean) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { epoch } = useEngineStatus()
  const { mode, game, sfen, atEnd, preview, playing, play, ai, setPlaying } = session
  const [bots, setBots] = useState<[AiStrength, AiStrength]>([settings.opponent, settings.opponent])
  const [strategies, setStrategies] = useState<[string, string]>([aiStrategyId(settings.aiStrategy), aiStrategyId(settings.aiStrategy)])
  const [activeStrategies, setActiveStrategies] = useState<[string, string]>(['', ''])
  const [started, setStarted] = useState(false)
  const [state, setState] = useState<WatchState | null>(null)
  const [seen, setSeen] = useState({ mode, game })
  if (seen.mode !== mode || seen.game !== game) {
    setSeen({ mode, game })
    if (mode === 'view') {
      if (game.moves.length === 0) setStarted(false)
      if (seen.mode !== mode) setState((current) => (current?.error ? { ...current, error: undefined } : current))
    }
  }
  const [firstBot, setFirstBot] = useState<'sente' | 'gote'>('sente')
  const botIndex = session.toMove === firstBot ? 0 : 1
  const strength = bots[botIndex]
  const strategy = activeStrategies[botIndex]
  const start = useCallback(
    (side: 'sente' | 'gote') => {
      setFirstBot(side)
      setActiveStrategies([resolveAiStrategy(strategies[0], side), resolveAiStrategy(strategies[1], otherSide(side))])
      setStarted(true)
      setPlaying(true)
    },
    [setPlaying, strategies],
  )
  const repetition = useMemo(() => {
    if (mode !== 'view') return null
    const record = new Record(positionOf(game.start))
    for (const usi of game.moves) {
      const move = record.position.createMoveByUSI(usi)
      if (!move || !record.append(move)) return null
    }
    if (!record.repetition) return null
    return record.perpetualCheck === null
      ? t('watch.repetition')
      : t('watch.perpetualCheck', { side: t(`common.${otherSide(colorSide(record.perpetualCheck))}`) })
  }, [mode, game, t])
  const { error, winner, result, canPlay, running } = deriveWatch(t, session, { state, epoch, repetition, started, tossing })

  useEffect(() => {
    if (mode === 'view' && result && atEnd && !preview) setPlaying(false)
  }, [mode, result, atEnd, preview, setPlaying])

  useEffect(() => {
    if (!running || !atEnd || preview || (game.moves.length > 0 && !reviewReady)) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const level = STRENGTH[strength]
    const command = `position sfen ${game.start}${game.moves.length ? ` moves ${game.moves.join(' ')}` : ''}`
    const search = (async () => {
      const planned = strategy ? await strategyReply(strategy, session.toMove, sfen, game.moves.length) : undefined
      if (cancelled) return { bestmove: '', candidates: [] }
      return planned ? { bestmove: planned.usi, candidates: [] } : analyze(command, { multipv: level.pickFrom, movetime: level.movetime, book: !!strategy })
    })()
    search
      .then((outcome) => {
        if (cancelled) return
        if (outcome.bestmove === 'resign' || outcome.bestmove === 'win') {
          const victor = outcome.bestmove === 'win' ? session.toMove : otherSide(session.toMove)
          setState({ game, winner: victor, ending: t(outcome.bestmove === 'win' ? 'watch.declaration' : 'watch.resigned', { side: t(`common.${victor}`) }) })
          return
        }
        const top = outcome.candidates[0] ? scoreWinRate(outcome.candidates[0].score) : 0
        const pool = outcome.candidates.filter((c) => top - scoreWinRate(c.score) <= level.maxLoss)
        const usi = pool[Math.floor(Math.random() * pool.length)]?.move ?? outcome.bestmove
        if (!usi || !applyUsi(sfen, usi)) throw new Error(t('watch.invalidMove'))
        timer = setTimeout(() => {
          if (!cancelled) play(usi)
        }, 900)
      })
      .catch((cause: unknown) => {
        if (!cancelled) setState({ game, error: cause instanceof Error ? cause.message : String(cause), errorEpoch: epoch })
      })
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [running, atEnd, preview, reviewReady, game, sfen, strength, strategy, epoch, play, session.toMove, t])

  const toggle = () => {
    if (!canPlay) return
    if (error) setState((current) => (current ? { ...current, error: undefined } : null))
    session.setPlaying(error ? true : !playing)
  }

  return {
    running,
    canPlay,
    started,
    result,
    winner,
    won: !!result && result !== t('watch.repetition'),
    toggle,
    bots,
    strategies,
    setStrategy: (index: number, value: string) => setStrategies((current) => current.map((entry, i) => (i === index ? value : entry)) as [string, string]),
    setBot: (index: number, value: AiStrength) => setBots((current) => current.map((entry, i) => (i === index ? value : entry)) as [AiStrength, AiStrength]),
    start,
    side: (index: number) => {
      if (!started) return null
      return index === 0 ? firstBot : otherSide(firstBot)
    },
    name: (index: number) => t(index === 0 ? 'watch.kamite' : 'watch.shimote'),
    bot: (side: 'sente' | 'gote') => t(side === firstBot ? 'watch.kamite' : 'watch.shimote'),
    restart: () => {
      setState(null)
      load(game.start, 'sente', 'view', null)
    },
    title: t('watch.title'),
    instruction: () => {
      if (!ai) return t('engine.theAiNeedsACross')
      const known = error ?? result
      if (known !== null && known !== undefined) return known
      if (tossing) return t('watch.tossing')
      return running ? t('watch.playing') : t('watch.paused')
    },
  }
}

export type Watch = ReturnType<typeof useWatch>
