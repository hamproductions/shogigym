import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportGame, parseGame } from '@/utils/kifu'
import { applyUsi } from '@/utils/shogi'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Load, Snapshot } from '@/app/hooks/useModeSwitch'
import { savedAtLabel, sideMark } from '@/utils/notation'
import { deleteGame, gameId, loadGames, storeGame, type GameResult, type StoredGame } from '@/app/games'
import { STRENGTH, useSettings } from '@/appearance/settings'
import { allLines, countMoves, mainLine } from '@/app/tree'
import { isGameMode, type Confirm, type Tab } from '@/app/types'

export interface GameNotes {
  title: string
  comments: string[]
  ending?: string
  moves: string
}

const IMPORTED = 'Imported game'

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
  }: { load: Load; setTab: (tab: Tab) => void; setConfirm: (confirm: Confirm) => void; analysisSnapshot: () => Snapshot | undefined; onSaveError: () => void },
) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { mode, game, tree, userSide, course } = session
  const [gameNotes, setGameNotes] = useState<GameNotes | null>(null)
  const [gameTitle, setGameTitle] = useState('')
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
      setTab('moves')
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

  const saveSlot = () => {
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
      userSide,
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
      setSlotId(g.id)
      setTab('moves')
    }
    if (mode === 'analyze' && game.moves.length > 0 && slotId !== g.id)
      setConfirm({ text: t('app.openTheGameOnThe', { title: g.title }), run, yes: t('app.openIt'), no: t('app.cancel') })
    else run()
  }

  const saveFinished = (result: GameResult) => {
    if (game.moves.length < 2) return
    const id = gameId(game.start, game.moves)
    if (loadGames().some((g) => g.id === id)) return
    const when = savedAtLabel(new Date())
    storeGame({
      id,
      title: t('app.vsAiAs', { side: sideMark(userSide), when }),
      savedAt: Date.now(),
      start: game.start,
      detectionPreset: game.detectionPreset,
      detectionResult: game.detectionResult,
      moves: game.moves,
      tree: tree.children.length ? tree : undefined,
      userSide,
      result,
      vsAi: true,
    })
  }

  const reviewSlot = (g: StoredGame, _confirmReplace: number) => {
    const run = () => {
      if (!preserveAnalysis()) return
      load(g.start, g.userSide, 'analyze', null)
      session.setGame({ start: g.start, moves: g.moves, detectionPreset: g.detectionPreset, detectionResult: g.detectionResult })
      if (g.tree) session.setTree(g.tree)
      session.setCursor(0)
      setGameTitle(g.title)
      setSlotId(g.id)
      setAutoRate(g.moves.join(' '))
      setTab('moves')
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
    saveFinished,
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
