import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportGame, parseGame } from '@/utils/kifu'
import { applyUsi } from '@/utils/shogi'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Load, Snapshot } from '@/app/hooks/useModeSwitch'
import { savedAtLabel, sideMark } from '@/utils/notation'
import { deleteGame, loadGames, storeGame, type GameResult, type StoredGame } from '@/app/games'
import { STRENGTH, useSettings } from '@/appearance/settings'
import { allLines, countMoves, mainLine } from '@/app/tree'
import { isGameMode, type Confirm, type Tab } from '@/app/types'

export type GameNotes = { title: string; comments: string[]; ending?: string; moves: string }

const IMPORTED = 'Imported game'
const LIVE_KEY = 'joseki-practice:live-game:v1'

type LiveGame = { id: string; start: string; moves: string[] }

function readLive(): LiveGame | null {
  try {
    return JSON.parse(localStorage.getItem(LIVE_KEY) ?? 'null')
  } catch {
    return null
  }
}

function writeLive(live: LiveGame | null) {
  try {
    if (live) localStorage.setItem(LIVE_KEY, JSON.stringify(live))
    else localStorage.removeItem(LIVE_KEY)
  } catch (error) {
    console.warn('live game not tracked', error)
  }
}

function firstIllegalMove(start: string, moves: string[]) {
  let at: string | null = start
  let valid = 0
  for (const usi of moves) {
    at = applyUsi(at, usi)
    if (!at) break
    valid++
  }
  return valid < moves.length ? valid : -1
}

export function useAnalyzeGames(
  session: BoardSession,
  {
    load,
    setTab,
    setConfirm,
    analysisSnapshot,
    onSaveError,
    onOpen,
  }: {
    load: Load
    setTab: (tab: Tab) => void
    setConfirm: (confirm: Confirm) => void
    analysisSnapshot: () => Snapshot | undefined
    onSaveError: () => void
    onOpen: () => void
  },
) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { mode, game, tree, userSide, course } = session
  const [gameNotes, setGameNotes] = useState<GameNotes | null>(null)
  const [gameTitle, setGameTitle] = useState('')
  const [players, setPlayers] = useState<StoredGame['players']>()
  const [slotId, setSlotId] = useState<string | null>(null)
  const [autoRate, setAutoRate] = useState('')

  const importGame = (text: string): string | null => {
    const parsed = parseGame(text)
    if (parsed instanceof Error) return t('app.couldNotReadThatGame', { message: parsed.message })
    const bad = firstIllegalMove(parsed.startSfen, parsed.moves)
    if (bad >= 0) return t('app.moveIsNotLegalIn', { value: bad + 1, value2: parsed.moves[bad] })
    const run = () => {
      load(parsed.startSfen, 'sente', 'analyze', null)
      session.setGame({ start: parsed.startSfen, moves: parsed.moves, detectionPreset: parsed.detectionPreset, detectionResult: parsed.detectionResult })
      session.setCursor(0)
      setGameNotes({ title: parsed.title, comments: parsed.comments ?? [], ending: parsed.ending, moves: parsed.moves.join(' ') })
      setGameTitle(parsed.title || '')
      setPlayers(parsed.players)
      setSlotId(null)
      setTab('moves')
      onOpen()
    }
    const variations = countMoves(tree) - mainLine(tree).length
    if (mode === 'analyze' && game.moves.length > 0)
      setConfirm({
        text: t(variations > 0 ? 'app.loadGameReplaceVariations' : 'app.loadGameReplace', { count: parsed.moves.length, current: game.moves.length }),
        run,
        yes: t('app.loadIt'),
        no: t('app.cancel'),
      })
    else run()
    return null
  }

  const exportKif = () => {
    const lines = isGameMode(mode) && tree.children.length ? allLines(tree) : [game.moves]
    const ai = `Shogi Gym AI (${STRENGTH[settings.opponent].label})`
    const names =
      mode === 'spar'
        ? userSide === 'sente'
          ? { sente: t('app.you'), gote: ai }
          : { sente: ai, gote: t('app.you') }
        : gameNotes?.title && gameNotes.title !== IMPORTED
          ? { title: gameNotes.title }
          : course
            ? { title: course.title }
            : {}
    return exportGame(game.start, lines, names)
  }

  const saveSlot = (choice?: 'sente' | 'gote' | 'study') => {
    const id = slotId ?? String(Date.now())
    const when = savedAtLabel(new Date())
    const title = mode === 'spar' ? t('app.vsAiAs', { side: sideMark(userSide), when }) : `${gameTitle || t('app.analysis')} · ${when}`
    const ok = storeGame({
      id,
      title,
      savedAt: Date.now(),
      start: game.start,
      detectionPreset: game.detectionPreset,
      detectionResult: game.detectionResult,
      moves: tree.children.length ? mainLine(tree) : game.moves,
      tree: tree.children.length ? tree : undefined,
      userSide: choice && choice !== 'study' ? choice : userSide,
      players,
      ...(choice ? { role: choice === 'study' ? ('study' as const) : ('mine' as const) } : {}),
    })
    if (ok) setSlotId(id)
    return ok
  }

  const preserveAnalysis = () => {
    const previous = mode === 'analyze' ? { game, tree, userSide } : analysisSnapshot()
    if (!previous || (!previous.game.moves.length && !previous.tree?.children.length)) return true
    const when = savedAtLabel(new Date())
    const ok = storeGame({
      id: crypto.randomUUID(),
      title: `${gameTitle || t('app.analysis')} · ${when}`,
      savedAt: Date.now(),
      start: previous.game.start,
      detectionPreset: previous.game.detectionPreset,
      detectionResult: previous.game.detectionResult,
      moves: previous.tree?.children.length ? mainLine(previous.tree) : previous.game.moves,
      tree: previous.tree?.children.length ? previous.tree : undefined,
      userSide: previous.userSide,
      players,
    })
    if (!ok) onSaveError()
    return ok
  }

  const openSlot = (g: StoredGame) => {
    const run = () => {
      load(g.start, g.userSide, 'analyze', null)
      session.setGame({ start: g.start, moves: g.moves, detectionPreset: g.detectionPreset, detectionResult: g.detectionResult })
      if (g.tree) session.setTree(g.tree)
      session.setCursor(g.moves.length)
      setGameTitle(g.title)
      setPlayers(g.players)
      setSlotId(g.id)
      setTab('moves')
      onOpen()
    }
    if (mode === 'analyze' && game.moves.length > 0 && slotId !== g.id)
      setConfirm({ text: t('app.openTheGameOnThe', { title: g.title }), run, yes: t('app.openIt'), no: t('app.cancel') })
    else run()
  }

  const saveLive = (result?: GameResult) => {
    if (game.moves.length < 2) return true
    const live = readLive()
    const continues =
      live && live.start === game.start && live.moves.slice(0, Math.min(live.moves.length, game.moves.length, 2)).join(' ') === game.moves.slice(0, 2).join(' ')
    const id = continues ? live.id : `ai-${Date.now().toString(36)}`
    const existing = continues ? loadGames().find((g) => g.id === id) : undefined
    const ok = storeGame({
      id,
      title: existing?.title ?? t('app.vsAiAs', { side: sideMark(userSide), when: savedAtLabel(new Date()) }),
      savedAt: existing?.savedAt ?? Date.now(),
      start: game.start,
      detectionPreset: game.detectionPreset,
      detectionResult: game.detectionResult,
      moves: game.moves,
      tree: tree.children.length ? tree : undefined,
      userSide,
      result: result ?? existing?.result,
      vsAi: true,
    })
    writeLive({ id, start: game.start, moves: game.moves.slice(0, 2) })
    if (!ok) onSaveError()
    return ok
  }

  const reviewSlot = (g: StoredGame, _confirmReplace: number) => {
    const run = () => {
      if (!preserveAnalysis()) return
      load(g.start, g.userSide, 'analyze', null)
      session.setGame({ start: g.start, moves: g.moves, detectionPreset: g.detectionPreset, detectionResult: g.detectionResult })
      if (g.tree) session.setTree(g.tree)
      session.setCursor(0)
      setGameTitle(g.title)
      setPlayers(g.players)
      setSlotId(g.id)
      setAutoRate(g.moves.join(' '))
      setTab('moves')
      onOpen()
    }
    run()
  }

  const deleteSlot = (g: StoredGame) =>
    setConfirm({
      text: t('app.deleteThisCannotBeUndone', { title: g.title }),
      run: () => (deleteGame(g.id), g.id === slotId && setSlotId(null)),
      yes: t('app.delete'),
      no: t('app.keepIt'),
    })

  return {
    gameNotes,
    gameTitle,
    slotId,
    autoRating: mode === 'analyze' && autoRate === game.moves.join(' '),
    importGame,
    exportKif,
    saveSlot,
    preserveAnalysis,
    openSlot,
    deleteSlot,
    saveLive,
    forgetLive: () => writeLive(null),
    reviewSlot,
    openReview: (title: string, rate: string) => {
      setGameTitle(title)
      setAutoRate(rate)
    },
    forgetSlot: () => setSlotId(null),
    title: t('app.analyzeMoveBothSidesFreely'),
    instruction: () => t('app.tryAnythingTheAiTab'),
  }
}

export type AnalyzeGames = ReturnType<typeof useAnalyzeGames>
