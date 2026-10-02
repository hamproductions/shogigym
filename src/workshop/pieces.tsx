import { Color, PieceType, Square } from 'tsshogi'
import { positionOf } from '../shogi'

type Step = { dx: number; dy: number; slide?: boolean }

const KING_STEPS: Step[] = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => ({ dx, dy }))).filter((s) => s.dx || s.dy)
const GOLD_STEPS: Step[] = KING_STEPS.filter((s) => !(s.dy === 1 && s.dx !== 0))
const SILVER_STEPS: Step[] = KING_STEPS.filter((s) => !(s.dy === 0 || (s.dy === 1 && s.dx === 0)))
const ROOK_SLIDES: Step[] = [
  { dx: 0, dy: -1, slide: true },
  { dx: 0, dy: 1, slide: true },
  { dx: -1, dy: 0, slide: true },
  { dx: 1, dy: 0, slide: true },
]
const BISHOP_SLIDES: Step[] = [
  { dx: -1, dy: -1, slide: true },
  { dx: 1, dy: -1, slide: true },
  { dx: -1, dy: 1, slide: true },
  { dx: 1, dy: 1, slide: true },
]

export const PIECE_INFO: Record<PieceType, { ja: string; reading: string; en: string; moves: string; steps: Step[]; promotes?: string }> = {
  [PieceType.PAWN]: { ja: '歩兵', reading: 'fuhyō', en: 'Pawn', moves: 'One square straight forward.', steps: [{ dx: 0, dy: -1 }], promotes: 'Promotes to と金 (tokin), which moves like a gold.' },
  [PieceType.LANCE]: { ja: '香車', reading: 'kyōsha', en: 'Lance', moves: 'Any number of squares straight forward. It cannot go back or sideways.', steps: [{ dx: 0, dy: -1, slide: true }], promotes: 'Promotes to 成香, which moves like a gold.' },
  [PieceType.KNIGHT]: { ja: '桂馬', reading: 'keima', en: 'Knight', moves: 'Jumps two squares forward and one to the side, over any piece. Only forward.', steps: [{ dx: -1, dy: -2 }, { dx: 1, dy: -2 }], promotes: 'Promotes to 成桂, which moves like a gold.' },
  [PieceType.SILVER]: { ja: '銀将', reading: 'ginshō', en: 'Silver general', moves: 'One square forward, or one square diagonally in any direction.', steps: SILVER_STEPS, promotes: 'Promotes to 成銀, which moves like a gold.' },
  [PieceType.GOLD]: { ja: '金将', reading: 'kinshō', en: 'Gold general', moves: 'One square in any direction except diagonally backward.', steps: GOLD_STEPS },
  [PieceType.BISHOP]: { ja: '角行', reading: 'kakugyō', en: 'Bishop', moves: 'Any number of squares diagonally.', steps: BISHOP_SLIDES, promotes: 'Promotes to 龍馬 (horse): a bishop that can also step one square up, down or sideways.' },
  [PieceType.ROOK]: { ja: '飛車', reading: 'hisha', en: 'Rook', moves: 'Any number of squares up, down or sideways.', steps: ROOK_SLIDES, promotes: 'Promotes to 龍王 (dragon): a rook that can also step one square diagonally.' },
  [PieceType.KING]: { ja: '玉将', reading: 'gyokushō', en: 'King', moves: 'One square in any direction. Checkmate the other king to win.', steps: KING_STEPS },
  [PieceType.PROM_PAWN]: { ja: 'と金', reading: 'tokin', en: 'Promoted pawn', moves: 'Moves like a gold. If captured, it goes back to being a plain pawn.', steps: GOLD_STEPS },
  [PieceType.PROM_LANCE]: { ja: '成香', reading: 'narikyō', en: 'Promoted lance', moves: 'Moves like a gold.', steps: GOLD_STEPS },
  [PieceType.PROM_KNIGHT]: { ja: '成桂', reading: 'narikei', en: 'Promoted knight', moves: 'Moves like a gold.', steps: GOLD_STEPS },
  [PieceType.PROM_SILVER]: { ja: '成銀', reading: 'narigin', en: 'Promoted silver', moves: 'Moves like a gold.', steps: GOLD_STEPS },
  [PieceType.HORSE]: { ja: '龍馬', reading: 'ryūma', en: 'Horse (promoted bishop)', moves: 'Any number of squares diagonally, plus one square up, down or sideways.', steps: [...BISHOP_SLIDES, ...ROOK_SLIDES.map((s) => ({ dx: s.dx, dy: s.dy }))] },
  [PieceType.DRAGON]: { ja: '龍王', reading: 'ryūō', en: 'Dragon (promoted rook)', moves: 'Any number of squares up, down or sideways, plus one square diagonally.', steps: [...ROOK_SLIDES, ...BISHOP_SLIDES.map((s) => ({ dx: s.dx, dy: s.dy }))] },
}

function MoveDiagram({ steps }: { steps: Step[] }) {
  const cells = []
  for (let y = -2; y <= 2; y++)
    for (let x = -2; x <= 2; x++) {
      const step = steps.find((s) => (s.slide ? Math.sign(x) === s.dx && Math.sign(y) === s.dy && (s.dx === 0 || Math.abs(x) === Math.abs(y) || s.dy === 0) && (s.dx !== 0 || x === 0) && (s.dy !== 0 || y === 0) && (x || y) : s.dx === x && s.dy === y))
      const kind = x === 0 && y === 0 ? 'self' : step ? (step.slide ? 'slide' : 'step') : ''
      cells.push(<i key={`${x},${y}`} className={kind} />)
    }
  return (
    <div className="ws-piece-grid" aria-hidden="true">
      {cells}
    </div>
  )
}

export function PieceGuide({ sfen, from }: { sfen: string; from: Square | PieceType }) {
  const position = positionOf(sfen)
  const type = from instanceof Square ? position.board.at(from)?.type : from
  if (type === undefined) return null
  const info = PIECE_INFO[type]
  const inHand = !(from instanceof Square)
  const kingName = type === PieceType.KING && from instanceof Square && position.board.at(from)?.color === Color.BLACK ? '王将' : info.ja
  return (
    <div className="ws-piece-guide">
      <MoveDiagram steps={info.steps} />
      <div>
        <strong>
          {kingName} <span>{info.reading}</span>
        </strong>
        <span className="ws-piece-en">{info.en}</span>
        <p>{info.moves}</p>
        {info.promotes && !inHand && <p className="ws-muted">{info.promotes} A piece may promote when it moves into, out of, or inside the last three ranks.</p>}
        {inHand && <p className="ws-muted">A captured piece is yours: drop it on any empty square instead of moving. You cannot drop a pawn on a file where you already have an unpromoted pawn, or drop a pawn to give checkmate.</p>}
      </div>
    </div>
  )
}

const FILE = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const RANK = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

export function moveGloss(sfen: string, usi: string): string {
  const position = positionOf(sfen)
  const move = position.createMoveByUSI(usi)
  if (!move) return ''
  const to = `${FILE[move.to.file]}${RANK[move.to.rank]}`
  if (!(move.from instanceof Square)) return `Drop a ${PIECE_INFO[move.pieceType].en.toLowerCase()} on ${to}`
  const piece = PIECE_INFO[move.pieceType].en
  const capture = move.capturedPieceType !== null && move.capturedPieceType !== undefined ? `, taking the ${PIECE_INFO[move.capturedPieceType].en.toLowerCase()}` : ''
  return `${piece} to ${to}${capture}${move.promote ? ', promoting' : ''}`
}

export function sees(sfen: string, square: Square): Square[] {
  const position = positionOf(sfen)
  const piece = position.board.at(square)
  if (!piece) return []
  const dir = piece.color === Color.BLACK ? 1 : -1
  const out: Square[] = []
  for (const step of PIECE_INFO[piece.type].steps) {
    let file = square.file
    let rank = square.rank
    for (;;) {
      file -= step.dx * dir
      rank += step.dy * dir
      if (file < 1 || file > 9 || rank < 1 || rank > 9) break
      const to = new Square(file, rank)
      out.push(to)
      if (!step.slide || position.board.at(to)) break
    }
  }
  return out
}
