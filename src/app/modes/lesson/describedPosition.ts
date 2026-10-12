import { useEffect } from 'react'
import { PieceType, Square } from 'tsshogi'
import { useSession } from '@/app/hooks/session'
import { useLatest } from '@/app/hooks/useLatest'
import type { Course, JosekiNode } from '@/utils/model'
import { positionOf } from '@/utils/shogi'
import { figureMarks } from './figureMarks'

const DIGITS = '１２３４５６７８９'
const RANKS = '一二三四五六七八九'
const PIECES: Record<string, PieceType> = {
  歩: PieceType.PAWN,
  香: PieceType.LANCE,
  桂: PieceType.KNIGHT,
  銀: PieceType.SILVER,
  金: PieceType.GOLD,
  角: PieceType.BISHOP,
  飛: PieceType.ROOK,
  玉: PieceType.KING,
  王: PieceType.KING,
  と: PieceType.PROM_PAWN,
  成香: PieceType.PROM_LANCE,
  成桂: PieceType.PROM_KNIGHT,
  成銀: PieceType.PROM_SILVER,
  馬: PieceType.HORSE,
  龍: PieceType.DRAGON,
  竜: PieceType.DRAGON,
}
const MENTION = /([1-9１-９])([一二三四五六七八九])(成銀|成桂|成香|歩|香|桂|銀|金|角|飛|玉|王|と|馬|龍|竜)/g

export function describedPosition(courses: Course[], text: string): string | null {
  const wanted = [...text.matchAll(MENTION)].flatMap(([, file, rank, piece]) => {
    const square = Square.newByUSI(`${DIGITS.includes(file) ? DIGITS.indexOf(file) + 1 : file}${'abcdefghi'[RANKS.indexOf(rank)]}`)
    return square ? [{ square, type: PIECES[piece] }] : []
  })
  if (!wanted.length) return null
  const best = { sfen: null as string | null, score: 0 }
  const visit = (node: JosekiNode) => {
    const board = positionOf(node.sfen).board
    const score = wanted.filter(({ square, type }) => board.at(square)?.type === type).length
    if (score > best.score) Object.assign(best, { sfen: node.sfen, score })
    for (const branch of node.branches) if (branch.child) visit(branch.child)
  }
  for (const course of courses) visit(course.root)
  return best.sfen
}

export function useDescribedBoard(sfen: string | null, text: string) {
  const { game, setGame, setCursor, setSourceMarks } = useSession()
  const latest = useLatest(game)
  useEffect(() => {
    if (!sfen) return
    const previous = latest.current
    const shown = { start: sfen, moves: [] }
    const marks = figureMarks([], sfen, false, text)
    setGame(shown)
    setCursor(0)
    setSourceMarks(marks)
    return () => {
      setGame((current) => (current === shown ? previous : current))
      setSourceMarks((current) => (current === marks ? null : current))
    }
  }, [sfen, text, latest, setGame, setCursor, setSourceMarks])
}
