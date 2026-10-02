import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportGame, parseGame } from '../../../kifu'
import { applyUsi } from '../../../shogi'
import type { BoardSession } from '../../hooks/useBoardSession'
import type { Load } from '../../hooks/useModeSwitch'
import { savedAtLabel, sideMark } from '../../lib/notation'
import { deleteGame, storeGame, type StoredGame } from '../../games'
import { STRENGTH, useSettings } from '../../settings'
import { allLines, countMoves, mainLine } from '../../tree'
import { isGameMode, type Confirm, type Tab } from '../../types'

export type GameNotes = { title: string; comments: string[]; ending?: string; moves: string }

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

export function useAnalyzeGames(session: BoardSession, { load, setTab, setConfirm }: { load: Load; setTab: (tab: Tab) => void; setConfirm: (confirm: Confirm) => void }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { mode, game, tree, userSide, course } = session
  const [gameNotes, setGameNotes] = useState<GameNotes | null>(null)
  const [gameTitle, setGameTitle] = useState('')
  const [slotId, setSlotId] = useState<string | null>(null)
  const [autoRate, setAutoRate] = useState('')

  const importGame = (text: string): string | null => {
    const parsed = parseGame(text)
    if (parsed instanceof Error) return t('workshop.couldNotReadThatGame', { message: parsed.message })
    const bad = firstIllegalMove(parsed.startSfen, parsed.moves)
    if (bad >= 0) return t('workshop.moveIsNotLegalIn', { value: bad + 1, value2: parsed.moves[bad] })
    const run = () => {
      load(parsed.startSfen, 'sente', 'analyze', null)
      session.setGame({ start: parsed.startSfen, moves: parsed.moves })
      session.setCursor(0)
      setGameNotes({ title: parsed.title, comments: parsed.comments ?? [], ending: parsed.ending, moves: parsed.moves.join(' ') })
      setGameTitle(parsed.title || '')
      setTab('moves')
    }
    const variations = countMoves(tree) - mainLine(tree).length
    if (mode === 'analyze' && game.moves.length > 0) setConfirm({ text: t(variations > 0 ? 'workshop.loadGameReplaceVariations' : 'workshop.loadGameReplace', { count: parsed.moves.length, current: game.moves.length }), run, yes: t('workshop.loadIt'), no: t('workshop.cancel') })
    else run()
    return null
  }

  const exportKif = () => {
    const lines = isGameMode(mode) && tree.children.length ? allLines(tree) : [game.moves]
    const ai = `Shogi Gym AI (${STRENGTH[settings.opponent].label})`
    const names = mode === 'spar' ? (userSide === 'sente' ? { sente: t('workshop.you'), gote: ai } : { sente: ai, gote: t('workshop.you') }) : gameNotes?.title && gameNotes.title !== IMPORTED ? { title: gameNotes.title } : course ? { title: course.title } : {}
    return exportGame(game.start, lines, names)
  }

  const saveSlot = () => {
    const id = slotId ?? String(Date.now())
    const when = savedAtLabel(new Date())
    const title = mode === 'spar' ? t('workshop.vsAiAs', { side: sideMark(userSide), when }) : `${gameTitle || t('workshop.analysis')} · ${when}`
    const ok = storeGame({ id, title, savedAt: Date.now(), start: game.start, moves: tree.children.length ? mainLine(tree) : game.moves, tree: tree.children.length ? tree : undefined, userSide })
    if (ok) setSlotId(id)
    return ok
  }

  const openSlot = (g: StoredGame) => {
    const run = () => {
      load(g.start, g.userSide, 'analyze', null)
      session.setGame({ start: g.start, moves: g.moves })
      if (g.tree) session.setTree(g.tree)
      session.setCursor(g.moves.length)
      setGameTitle(g.title)
      setSlotId(g.id)
      setTab('moves')
    }
    if (mode === 'analyze' && game.moves.length > 0 && slotId !== g.id) setConfirm({ text: t('workshop.openTheGameOnThe', { title: g.title }), run, yes: t('workshop.openIt'), no: t('workshop.cancel') })
    else run()
  }

  const deleteSlot = (g: StoredGame) =>
    setConfirm({
      text: t('workshop.deleteThisCannotBeUndone', { title: g.title }),
      run: () => (deleteGame(g.id), g.id === slotId && setSlotId(null)),
      yes: t('workshop.delete'),
      no: t('workshop.keepIt'),
    })

  return {
    gameNotes,
    gameTitle,
    slotId,
    autoRating: mode === 'analyze' && autoRate === game.moves.join(' '),
    importGame,
    exportKif,
    saveSlot,
    openSlot,
    deleteSlot,
    openReview: (title: string, rate: string) => {
      setGameTitle(title)
      setAutoRate(rate)
    },
    forgetSlot: () => setSlotId(null),
    title: t('workshop.analyzeMoveBothSidesFreely'),
    instruction: () => t('workshop.tryAnythingTheAiTab'),
  }
}

export type AnalyzeGames = ReturnType<typeof useAnalyzeGames>
