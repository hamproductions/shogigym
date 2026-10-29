import { useCallback, useEffect, useMemo, useState } from 'react'
import { InitialPositionSFEN, Square, type Color, type Move, type PieceType } from 'tsshogi'
import { useEngineSupported } from '@/utils/engine'
import type { Course } from '@/utils/model'
import { applyUsi, colorSide, engineReady, hasLegalMove, positionOf, type Side } from '@/utils/shogi'
import { courseNodes } from '@/utils/book'
import { audioContext, getSettings, useSettings } from '@/appearance/settings'
import { addPath, emptyTree, isMainLine, mainContinuation, nodeAt, type Tree } from '@/app/tree'
import { isGameMode, type Game, type Mode, type Preview } from '@/app/types'
import type { BoardArrow } from '@/rendering/Board3D'
import type { SourceDiagram } from '@/utils/curriculum'
import { useLatest } from './useLatest'

type Selection = { from: Square | PieceType; color: Color } | null
export type SourceMarks = {
  at: string
  arrows: BoardArrow[]
  heat: { square: Square; color: number; opacity: number; label?: string }[]
  illustration?: Pick<SourceDiagram, 'crop' | 'pieces'>
}

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
  const [sourceMarks, setSourceMarks] = useState<SourceMarks | null>(null)
  const [landing, setLanding] = useState<string | null>(null)

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
  const userSideRef = useLatest(userSide)

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
  const [visualPosition, setVisualPosition] = useState({ sfen, environment: settings.environment })
  if (visualPosition.sfen !== sfen || visualPosition.environment !== settings.environment) {
    setVisualPosition({ sfen, environment: settings.environment })
    if (settings.environment === 'battlefield') {
      const advancing = visualPosition.environment === 'battlefield' && visualPosition.sfen === prevSfen && lastMove && applyUsi(prevSfen, lastMove) === sfen
      setLanding(advancing ? sfen : null)
    }
  }
  const nodes = useMemo(() => (course ? courseNodes(course, settings.lang) : null), [course, settings.lang])
  const userTurn = mode === 'view' ? !playing && !preview : mode === 'analyze' || (mode === 'lesson' && !course) || toMove === userSide
  const visualMoving = settings.environment === 'battlefield' && landing === sfen
  const opponentMoving = mode === 'spar' && !preview && atEnd && landing === liveSfen && toMove === userSide
  const gameOver = !preview && !hasLegalMove(position)
  const supported = useEngineSupported()
  const ai = supported && !course?.noEngine && engineReady(sfen)
  const assist = settings.assist || (!isGameMode(mode) && mode !== 'view')
  const onVariation = (isGameMode(mode) || mode === 'view') && cursor > 0 && !isMainLine(tree, game.moves.slice(0, cursor))

  const [treeSource, setTreeSource] = useState({ game, mode })
  if (treeSource.game !== game || treeSource.mode !== mode) {
    setTreeSource({ game, mode })
    if (isGameMode(mode) || mode === 'view') setTree((t) => addPath(t, game.moves))
  }

  useEffect(() => {
    if (landing === null) return
    const timer = setTimeout(() => setLanding(null), settings.environment === 'battlefield' ? 10000 : 1500)
    return () => clearTimeout(timer)
  }, [landing, settings.environment])
  const landed = useCallback((sfen: string) => setLanding((l) => (l === sfen ? null : l)), [])

  const play = useCallback(
    (usi: string, from = cursor) => {
      const at = sfensRef.current[from]
      const before = at ? positionOf(at) : null
      const next = before?.createMoveByUSI(usi) ? applyUsi(at, usi) : null
      setPromotion(null)
      if (modeRef.current === 'spar' && before && next && colorSide(before.color) !== userSideRef.current) {
        const after = positionOf(next)
        const environment = getSettings().environment
        setSelection((s) => (s && (!(s.from instanceof Square) || after.board.at(s.from)?.color === s.color) ? s : null))
        setPeekFrom((p) => (p && after.board.at(p) ? p : null))
        if (from === cursor && (environment === 'traditional' || environment === 'casual')) setLanding(next)
      } else {
        setSelection(null)
        setPeekFrom(null)
      }
      if (!next) {
        setPlaying(false)
        return
      }
      if (from === cursor && getSettings().environment === 'battlefield') setLanding(next)
      if (from === cursor && modeRef.current === 'tsume' && ['traditional', 'casual'].includes(getSettings().environment)) setLanding(next)
      if (getSettings().sound && navigator.userActivation?.isActive !== false) {
        try {
          audioContext()
        } catch (error) {
          console.warn('sound failed', error)
        }
      }
      const g = gameRef.current
      const path = [...g.moves.slice(0, from), usi]
      const existing = isGameMode(modeRef.current) || modeRef.current === 'view' ? nodeAt(treeRef.current, path) : null
      setGame({
        ...g,
        detectionResult: g.moves[from] === usi ? g.detectionResult : undefined,
        moves: g.moves[from] === usi ? g.moves : existing ? [...path, ...mainContinuation(existing)] : path,
      })
      if (from === cursor) setCursor(cursor + 1)
    },
    [cursor, sfensRef, gameRef, modeRef, treeRef, userSideRef],
  )

  const reset = useCallback((start: string, side: Side, nextMode: Mode, nextCourse: Course | null) => {
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
    setSourceMarks(null)
    setLanding(null)
  }, [])

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
    sourceMarks,
    setSourceMarks,
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
    opponentMoving,
    visualMoving,
    landing,
    landed,
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
