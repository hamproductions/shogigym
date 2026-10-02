import { Color, PieceType, Square } from 'tsshogi'
import { applyUsi, positionOf } from '../shogi'
import { sees } from './pieces'

export type Tesuji = { ja: string; en: string; explain: string }

const VALUABLE = new Set([PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.DRAGON, PieceType.HORSE])

const T = {
  sokofu: { ja: '底歩', en: 'Bottom pawn', explain: 'A pawn dropped on your own back rank stops a rook attacking from the side. 底歩は岩より堅し.' },
  awase: { ja: '合わせの歩', en: 'Matching pawn', explain: 'A pawn from hand placed face to face with the enemy pawn, to open the file or pull the pawn forward.' },
  shoten: { ja: '焦点の歩', en: 'Focal pawn', explain: 'Dropped where several enemy pieces meet: whichever piece takes, another one loses its job.' },
  tataki: { ja: '叩きの歩', en: 'Striking pawn', explain: 'A pawn dropped right in front of an enemy piece to pull it forward or make it move out of place.' },
  tare: { ja: '垂れ歩', en: 'Dangling pawn', explain: 'A pawn dropped a little way from the enemy, ready to promote next move. It is hard to stop.' },
  tsukisute: { ja: '突き捨ての歩', en: 'Pawn sacrifice', explain: 'A pawn pushed into the enemy pawn on purpose, to open a line for your rook or bishop.' },
  ohteHisha: { ja: '王手飛車取り', en: 'Check and rook fork', explain: 'Check and attack the rook at once: the king must escape and the rook falls.' },
  ohteTori: { ja: '王手両取り', en: 'Check and fork', explain: 'Check and attack another valuable piece at once: after the king escapes, you take the piece.' },
  fundoshi: { ja: 'ふんどしの桂', en: 'Knight fork', explain: 'A knight attacking two pieces at once. Knights jump, so the fork cannot be blocked.' },
  wariuchi: { ja: '割り打ちの銀', en: 'Splitting silver', explain: 'A silver dropped between two pieces so its diagonal steps back attack both.' },
  ryodori: { ja: '両取り', en: 'Fork', explain: 'One move attacks two valuable pieces; the opponent can only save one.' },
  atamakin: { ja: '頭金', en: 'Gold on the head', explain: 'A gold dropped right in front of the king. When it is protected, this is often mate.' },
  haragin: { ja: '腹銀', en: 'Belly silver', explain: 'A silver dropped beside the king. It cuts off escape squares and threatens the king from the side.' },
} satisfies Record<string, Tesuji>

const ahead = (sq: Square, color: Color) => {
  const rank = sq.rank + (color === Color.BLACK ? -1 : 1)
  return rank >= 1 && rank <= 9 ? new Square(sq.file, rank) : null
}

export function detectTesuji(before: string, usi: string): Tesuji | null {
  const after = applyUsi(before, usi)
  if (!after) return null
  const pos = positionOf(after)
  const prev = positionOf(before)
  const to = Square.newByUSI(usi.slice(2, 4))
  if (!to) return null
  const piece = pos.board.at(to)
  if (!piece) return null
  const me = piece.color
  const drop = usi[1] === '*'
  const front = ahead(to, me)
  const frontPiece = front ? pos.board.at(front) : null
  const enemyAhead = frontPiece && frontPiece.color !== me ? frontPiece : null
  const enemySquares = pos.board.listNonEmptySquares().filter((sq) => pos.board.at(sq)!.color !== me)
  const attackers = enemySquares.filter((sq) => sees(after, sq).some((t) => t.equals(to))).length
  const hits = sees(after, to).map((sq) => pos.board.at(sq)).filter((p) => p && p.color !== me)
  const king = hits.some((p) => p!.type === PieceType.KING)
  const valuable = hits.filter((p) => VALUABLE.has(p!.type))

  if (king && hits.some((p) => p!.type === PieceType.ROOK || p!.type === PieceType.DRAGON)) return T.ohteHisha
  if (king && valuable.length > 0 && piece.type !== PieceType.PAWN) return T.ohteTori
  if (piece.type === PieceType.PAWN) {
    if (drop) {
      if ((me === Color.BLACK && to.rank === 9) || (me === Color.WHITE && to.rank === 1)) return T.sokofu
      if (enemyAhead?.type === PieceType.PAWN) return T.awase
      if (attackers >= 2) return T.shoten
      if (enemyAhead) return T.tataki
      const rel = me === Color.BLACK ? to.rank : 10 - to.rank
      if (rel === 4 && !frontPiece) return T.tare
    } else if (enemyAhead?.type === PieceType.PAWN && !prev.board.at(to)) return T.tsukisute
    return null
  }
  if (drop && piece.type === PieceType.GOLD && king && frontPiece?.type === PieceType.KING && frontPiece.color !== me) return T.atamakin
  if (drop && piece.type === PieceType.SILVER && enemySquares.some((sq) => pos.board.at(sq)!.type === PieceType.KING && sq.rank === to.rank && Math.abs(sq.file - to.file) === 1)) return T.haragin
  if (valuable.length >= 2 && attackers === 0) {
    if (piece.type === PieceType.KNIGHT) return T.fundoshi
    if (drop && piece.type === PieceType.SILVER) return T.wariuchi
    return T.ryodori
  }
  return null
}
