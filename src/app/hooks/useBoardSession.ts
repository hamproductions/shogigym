import { useCallback, useMemo, useState } from 'react'
import { InitialPositionSFEN, type Color, type Move, type PieceType, type Square } from 'tsshogi'
import { engineSupported } from '@/utils/engine'
import type { Course } from '@/utils/model'
import { applyUsi, colorSide, hasLegalMove, positionOf, type Side } from '@/utils/shogi'
import { courseNodes } from '@/utils/book'
import { audioContext, getSettings, useSettings } from '@/appearance/settings'
import { addPath, emptyTree, isMainLine, mainContinuation, nodeAt, type Tree } from '@/app/tree'
import { isGameMode, type Game, type Mode, type Preview } from '@/app/types'
import { useLatest } from './useLatest'

type Selection = { from: Square | PieceType; color: Color } | null

export function useBoardSession() {
  const settings = useSettings()
  const [mode, setMode] = useState<Mode>('spar')
  const [course, setCourse] = useState<Course | null>(null)
  const [game, setGame] = useState<Game>({ start: InitialPositionSFEN.STANDARD, moves: [] })
  const [cursor, setCursor] = useState(0)
  const [userSide, setUserSide] = useState<Side>('sente')
  const [flipped, setFlipped] = useState(false)
  const [selection, setSelection] = useState<Selection>(null)
  const [promotion, setPromotion] = useState<Move[] | null>(null)
  const [peekFrom, setPeekFrom] = useState<Square | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [playing, setPlaying] = useState(false)
  const [tree, setTree] = useState<Tree>(emptyTree)
  const [plyBase, setPlyBase] = useState(0)

  const sfens = useMemo(() => {
    const out = [game.start]
    const p = positionOf(game.start)
    for (const usi of game.moves) {
      const move = p.createMoveByUSI(usi)
      if (!move || !p.doMove(move)) break
      out.push(p.sfen)
    }
    return out
  }, [game])
  const previewSfens = useMemo(() => {
    if (!preview) return null
    const out = [sfens[preview.base]]
    for (const usi of preview.moves) {
      const next = applyUsi(out.at(-1)!, usi)
      if (!next) break
      out.push(next)
    }
    return out
  }, [preview, sfens])

  const modeRef = useLatest(mode)
  const gameRef = useLatest(game)
  const treeRef = useLatest(tree)
  const sfensRef = useLatest(sfens)

  const liveSfen = sfens[cursor]
  const sfen = preview && previewSfens ? previewSfens[Math.min(preview.step, previewSfens.length - 1)] : liveSfen
  const position = useMemo(() => positionOf(sfen), [sfen])
  const toMove = colorSide(position.color)
  const lastMove = preview
    ? preview.step > 0
      ? preview.moves[preview.step - 1]
      : preview.base > 0
        ? game.moves[preview.base - 1]
        : undefined
    : cursor > 0
      ? game.moves[cursor - 1]
      : undefined
  const prevSfen =
    preview && previewSfens
      ? preview.step > 0
        ? previewSfens[preview.step - 1]
        : preview.base > 0
          ? sfens[preview.base - 1]
          : null
      : cursor > 0
        ? sfens[cursor - 1]
        : null
  const atEnd = cursor === game.moves.length
  const nodes = useMemo(() => (course ? courseNodes(course) : null), [course])
  const userTurn = mode !== 'view' && (mode === 'analyze' || (mode === 'lesson' && !course) || toMove === userSide || (mode === 'spar' && !atEnd))
  const gameOver = !preview && !hasLegalMove(position)
  const ai = engineSupported() && !course?.noEngine
  const assist = settings.assist || !isGameMode(mode)
  const onVariation = isGameMode(mode) && cursor > 0 && !isMainLine(tree, game.moves.slice(0, cursor))

  const [treeSource, setTreeSource] = useState({ game, mode })
  if (treeSource.game !== game || treeSource.mode !== mode) {
    setTreeSource({ game, mode })
    if (isGameMode(mode)) setTree((t) => addPath(t, game.moves))
  }

  const play = useCallback(
    (usi: string) => {
      setSelection(null)
      setPromotion(null)
      setPeekFrom(null)
      const at = sfensRef.current[cursor]
      const mv = at ? positionOf(at).createMoveByUSI(usi) : null
      if (!mv || !applyUsi(at, usi)) {
        setPlaying(false)
        return
      }
      if (getSettings().sound && navigator.userActivation?.isActive !== false) {
        try {
          audioContext()
        } catch (error) {
          console.warn('sound failed', error)
        }
      }
      const g = gameRef.current
      const path = [...g.moves.slice(0, cursor), usi]
      const existing = isGameMode(modeRef.current) ? nodeAt(treeRef.current, path) : null
      setGame({
        ...g,
        detectionResult: g.moves[cursor] === usi ? g.detectionResult : undefined,
        moves: g.moves[cursor] === usi ? g.moves : existing ? [...path, ...mainContinuation(existing)] : path,
      })
      setCursor(cursor + 1)
    },
    [cursor, sfensRef, gameRef, modeRef, treeRef],
  )

  const reset = (start: string, side: Side, nextMode: Mode, nextCourse: Course | null) => {
    setPreview(null)
    setPlaying(false)
    setTree(emptyTree())
    setPeekFrom(null)
    setPlyBase(0)
    setGame({ start, moves: [] })
    setCursor(0)
    setUserSide(side)
    setFlipped(side === 'gote')
    setMode(nextMode)
    setCourse(nextCourse)
    setSelection(null)
    setPromotion(null)
  }

  const startPreview = (moves: string[], title: string, step = 0) => {
    setPreview({ base: cursor, moves, step, title })
    setPlaying(true)
  }
  const keepPreview = () => {
    if (!preview) return
    const kept = preview.moves.slice(0, preview.step)
    setGame((g) => ({ ...g, detectionResult: undefined, moves: [...g.moves.slice(0, preview.base), ...kept] }))
    setCursor(preview.base + kept.length)
    setPreview(null)
    setPlaying(false)
  }
  const exitPreview = () => {
    setPreview(null)
    setPlaying(false)
  }
  const truncate = (length: number) => {
    setGame((g) => ({ ...g, detectionResult: undefined, moves: g.moves.slice(0, length) }))
    setCursor(length)
  }

  const nav = {
    canBack: preview ? preview.step > 0 : cursor > 0,
    canForward: preview ? preview.step < preview.moves.length : !atEnd,
    first: () => {
      if (mode === 'view') setPlaying(false)
      return preview ? setPreview({ ...preview, step: 0 }) : setCursor(0)
    },
    back: () => {
      if (mode === 'view') setPlaying(false)
      return preview ? setPreview({ ...preview, step: Math.max(0, preview.step - 1) }) : setCursor((c) => Math.max(0, c - 1))
    },
    forward: () => {
      if (mode === 'view') setPlaying(false)
      return preview ? setPreview({ ...preview, step: Math.min(preview.moves.length, preview.step + 1) }) : setCursor((c) => Math.min(game.moves.length, c + 1))
    },
    last: () => {
      if (mode === 'view') setPlaying(false)
      return preview ? setPreview({ ...preview, step: preview.moves.length }) : setCursor(game.moves.length)
    },
  }

  return {
    mode,
    modeRef,
    course,
    setCourse,
    setMode,
    game,
    setGame,
    cursor,
    setCursor,
    userSide,
    setUserSide,
    flipped,
    setFlipped,
    selection,
    setSelection,
    promotion,
    setPromotion,
    peekFrom,
    setPeekFrom,
    preview,
    setPreview,
    playing,
    setPlaying,
    tree,
    setTree,
    plyBase,
    setPlyBase,
    sfens,
    previewSfens,
    liveSfen,
    sfen,
    position,
    toMove,
    lastMove,
    prevSfen,
    atEnd,
    nodes,
    userTurn,
    gameOver,
    ai,
    assist,
    onVariation,
    play,
    reset,
    startPreview,
    keepPreview,
    exitPreview,
    truncate,
    nav,
  }
}

export type BoardSession = ReturnType<typeof useBoardSession>
