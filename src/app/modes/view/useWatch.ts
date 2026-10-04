import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Record } from 'tsshogi'
import { scoreWinRate } from '../../../analysis'
import { analyze, useEngineStatus } from '../../../engine'
import { applyUsi, colorSide, otherSide, positionOf } from '../../../shogi'
import { STRENGTH, useSettings, type AiStrength } from '../../../appearance/settings'
import type { BoardSession } from '../../hooks/useBoardSession'
import type { Load } from '../../hooks/useModeSwitch'
import type { Game } from '../../types'
import { aiStrategyId, strategyMove } from '../../lib/book'

export function useWatch(session: BoardSession, load: Load, reviewReady: boolean, tossing: boolean) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { epoch } = useEngineStatus()
  const { mode, game, sfen, position, gameOver, atEnd, preview, playing, play, ai, setPlaying } = session
  const [bots, setBots] = useState<[AiStrength, AiStrength]>([settings.opponent, settings.opponent])
  const [strategies, setStrategies] = useState<[string, string]>([aiStrategyId(settings.aiStrategy), aiStrategyId(settings.aiStrategy)])
  const [started, setStarted] = useState(false)
  useEffect(() => { if (mode === 'view' && game.moves.length === 0) setStarted(false) }, [mode, game])
  const [firstBot, setFirstBot] = useState<'sente' | 'gote'>('sente')
  const strength = bots[session.toMove === firstBot ? 0 : 1]
  const strategy = strategies[session.toMove === firstBot ? 0 : 1]
  const start = useCallback((side: 'sente' | 'gote') => { setFirstBot(side); setStarted(true); setPlaying(true) }, [setPlaying])
  const [state, setState] = useState<{ game: Game; ending?: string; error?: string } | null>(null)
  const repetition = useMemo(() => {
    if (mode !== 'view') return null
    const record = new Record(positionOf(game.start))
    for (const usi of game.moves) {
      const move = record.position.createMoveByUSI(usi)
      if (!move || !record.append(move)) return null
    }
    if (!record.repetition) return null
    return record.perpetualCheck === null ? t('watch.repetition') : t('watch.perpetualCheck', { side: t(`common.${otherSide(colorSide(record.perpetualCheck))}`) })
  }, [mode, game, t])
  const ending = state?.game === game ? state.ending : undefined
  const error = state?.game === game ? state.error : undefined
  const result = repetition ?? ending ?? (gameOver ? t('app.checkmateWon', { winner: t(`common.${otherSide(colorSide(position.color))}`) }) : null)
  const canPlay = started && !tossing && (!atEnd || !result)
  const running = mode === 'view' && playing && canPlay && !error && (!atEnd || !!preview || ai)

  useEffect(() => {
    if (mode === 'view' && result && atEnd && !preview) setPlaying(false)
  }, [mode, result, atEnd, preview, setPlaying])

  useEffect(() => {
    if (!running || !atEnd || preview || (game.moves.length > 0 && !reviewReady)) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const level = STRENGTH[strength]
    const command = `position sfen ${game.start}${game.moves.length ? ` moves ${game.moves.join(' ')}` : ''}`
    const planned = strategy ? strategyMove(strategy, session.toMove, sfen) : undefined
    const analysis = planned ? Promise.resolve({ bestmove: planned.usi, candidates: [] }) : analyze(command, { multipv: level.pickFrom, movetime: level.movetime })
    analysis.then((analysis) => {
      if (cancelled) return
      if (analysis.bestmove === 'resign' || analysis.bestmove === 'win') {
        const winner = analysis.bestmove === 'win' ? session.toMove : otherSide(session.toMove)
        setState({ game, ending: t(analysis.bestmove === 'win' ? 'watch.declaration' : 'watch.resigned', { side: t(`common.${winner}`) }) })
        return
      }
      const top = analysis.candidates[0] ? scoreWinRate(analysis.candidates[0].score) : 0
      const pool = analysis.candidates.filter((c) => top - scoreWinRate(c.score) <= level.maxLoss)
      const usi = pool[Math.floor(Math.random() * pool.length)]?.move ?? analysis.bestmove
      if (!usi || !applyUsi(sfen, usi)) throw new Error(t('watch.invalidMove'))
      timer = setTimeout(() => { if (!cancelled) play(usi) }, 900)
    }).catch((cause: unknown) => {
      if (!cancelled) setState({ game, error: cause instanceof Error ? cause.message : String(cause) })
    })
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [running, atEnd, preview, reviewReady, game, sfen, strength, strategy, epoch, play, session.toMove, t])

  const toggle = () => {
    if (!canPlay) return
    if (error) setState((current) => current ? { ...current, error: undefined } : null)
    session.setPlaying(!playing)
  }

  return {
    running,
    canPlay,
    started,
    result,
    won: !!result && result !== t('watch.repetition'),
    toggle,
    bots,
    strategies,
    setStrategy: (index: number, value: string) => setStrategies((current) => current.map((strategy, i) => i === index ? value : strategy) as [string, string]),
    setBot: (index: number, value: AiStrength) => setBots((current) => current.map((bot, i) => i === index ? value : bot) as [AiStrength, AiStrength]),
    start,
    side: (index: number) => started ? index === 0 ? firstBot : otherSide(firstBot) : null,
    name: (index: number) => t(index === 0 ? 'watch.kamite' : 'watch.shimote'),
    bot: (side: 'sente' | 'gote') => t(side === firstBot ? 'watch.kamite' : 'watch.shimote'),
    restart: () => { setState(null); load(game.start, 'sente', 'view', null) },
    title: t('watch.title'),
    instruction: () => !ai ? t('engine.theAiNeedsACross') : error ?? result ?? (tossing ? t('watch.tossing') : running ? t('watch.playing') : t('watch.paused')),
  }
}

export type Watch = ReturnType<typeof useWatch>
