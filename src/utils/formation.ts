import { Color, PieceType, Square, type ImmutablePosition } from 'tsshogi'

type Need = [PieceType, number, number]

const CASTLES: { name: string; needs: Need[] }[] = [
  {
    name: 'ビッグ4',
    needs: [
      [PieceType.KING, 9, 9],
      [PieceType.LANCE, 9, 8],
      [PieceType.SILVER, 8, 8],
      [PieceType.GOLD, 7, 9],
      [PieceType.GOLD, 7, 8],
      [PieceType.SILVER, 8, 7],
    ],
  },
  {
    name: '銀冠穴熊',
    needs: [
      [PieceType.KING, 9, 9],
      [PieceType.LANCE, 9, 8],
      [PieceType.SILVER, 8, 7],
      [PieceType.GOLD, 7, 8],
    ],
  },
  {
    name: '居飛車穴熊',
    needs: [
      [PieceType.KING, 9, 9],
      [PieceType.LANCE, 9, 8],
      [PieceType.SILVER, 8, 8],
    ],
  },
  {
    name: '振り飛車穴熊',
    needs: [
      [PieceType.KING, 1, 9],
      [PieceType.LANCE, 1, 8],
      [PieceType.SILVER, 2, 8],
    ],
  },
  {
    name: '穴熊',
    needs: [
      [PieceType.KING, 9, 9],
      [PieceType.LANCE, 9, 8],
    ],
  },
  {
    name: '穴熊',
    needs: [
      [PieceType.KING, 1, 9],
      [PieceType.LANCE, 1, 8],
    ],
  },
  {
    name: 'ミレニアム',
    needs: [
      [PieceType.KING, 8, 9],
      [PieceType.SILVER, 8, 8],
      [PieceType.KNIGHT, 7, 7],
    ],
  },
  {
    name: '銀冠',
    needs: [
      [PieceType.KING, 2, 8],
      [PieceType.SILVER, 2, 7],
      [PieceType.GOLD, 3, 8],
    ],
  },
  {
    name: 'ダイヤモンド美濃',
    needs: [
      [PieceType.KING, 2, 8],
      [PieceType.SILVER, 3, 8],
      [PieceType.GOLD, 4, 9],
      [PieceType.GOLD, 4, 7],
      [PieceType.SILVER, 5, 7],
    ],
  },
  {
    name: '高美濃',
    needs: [
      [PieceType.KING, 2, 8],
      [PieceType.SILVER, 3, 8],
      [PieceType.GOLD, 4, 9],
      [PieceType.GOLD, 4, 7],
    ],
  },
  {
    name: '本美濃',
    needs: [
      [PieceType.KING, 2, 8],
      [PieceType.SILVER, 3, 8],
      [PieceType.GOLD, 4, 9],
      [PieceType.GOLD, 5, 8],
    ],
  },
  {
    name: '片美濃',
    needs: [
      [PieceType.KING, 2, 8],
      [PieceType.SILVER, 3, 8],
      [PieceType.GOLD, 4, 9],
    ],
  },
  {
    name: '木村美濃',
    needs: [
      [PieceType.KING, 2, 8],
      [PieceType.GOLD, 3, 8],
      [PieceType.GOLD, 4, 9],
      [PieceType.SILVER, 4, 7],
    ],
  },
  {
    name: '天守閣美濃',
    needs: [
      [PieceType.KING, 8, 7],
      [PieceType.BISHOP, 8, 8],
      [PieceType.SILVER, 7, 8],
    ],
  },
  {
    name: '左美濃',
    needs: [
      [PieceType.KING, 8, 8],
      [PieceType.SILVER, 7, 8],
      [PieceType.GOLD, 6, 9],
    ],
  },
  {
    name: '菊水矢倉',
    needs: [
      [PieceType.KING, 8, 9],
      [PieceType.SILVER, 8, 8],
      [PieceType.GOLD, 7, 8],
      [PieceType.KNIGHT, 7, 7],
    ],
  },
  {
    name: '金矢倉',
    needs: [
      [PieceType.KING, 8, 8],
      [PieceType.SILVER, 7, 7],
      [PieceType.GOLD, 7, 8],
      [PieceType.GOLD, 6, 7],
    ],
  },
  {
    name: '銀矢倉',
    needs: [
      [PieceType.KING, 8, 8],
      [PieceType.SILVER, 7, 7],
      [PieceType.SILVER, 6, 7],
      [PieceType.GOLD, 7, 8],
    ],
  },
  {
    name: 'elmo囲い',
    needs: [
      [PieceType.KING, 7, 8],
      [PieceType.SILVER, 6, 8],
      [PieceType.GOLD, 7, 9],
    ],
  },
  {
    name: '箱入り娘',
    needs: [
      [PieceType.KING, 7, 8],
      [PieceType.GOLD, 6, 9],
      [PieceType.GOLD, 6, 8],
    ],
  },
  {
    name: 'カニ囲い',
    needs: [
      [PieceType.KING, 6, 9],
      [PieceType.GOLD, 7, 8],
      [PieceType.SILVER, 6, 8],
      [PieceType.GOLD, 5, 8],
    ],
  },
  {
    name: '舟囲い',
    needs: [
      [PieceType.KING, 7, 8],
      [PieceType.GOLD, 6, 9],
      [PieceType.GOLD, 5, 8],
    ],
  },
  {
    name: '舟囲い',
    needs: [
      [PieceType.KING, 7, 8],
      [PieceType.GOLD, 6, 9],
      [PieceType.SILVER, 6, 8],
    ],
  },
  {
    name: '金無双',
    needs: [
      [PieceType.KING, 3, 8],
      [PieceType.GOLD, 4, 8],
      [PieceType.GOLD, 5, 8],
    ],
  },
  {
    name: '中住まい',
    needs: [
      [PieceType.KING, 5, 8],
      [PieceType.GOLD, 7, 8],
      [PieceType.GOLD, 3, 8],
    ],
  },
  {
    name: '雁木',
    needs: [
      [PieceType.SILVER, 6, 7],
      [PieceType.SILVER, 5, 7],
      [PieceType.GOLD, 7, 8],
    ],
  },
  { name: '居玉', needs: [[PieceType.KING, 5, 9]] },
]

const ROOK_FILE: Record<number, string> = {
  1: '居飛車',
  2: '居飛車',
  3: '袖飛車',
  4: '右四間飛車',
  5: '中飛車',
  6: '四間飛車',
  7: '三間飛車',
  8: '向かい飛車',
}

const view = (color: Color, file: number, rank: number) => (color === Color.BLACK ? new Square(file, rank) : new Square(10 - file, 10 - rank))

export function formationOf(position: ImmutablePosition, color: Color) {
  const at = (type: PieceType, file: number, rank: number) => {
    const piece = position.board.at(view(color, file, rank))
    return piece?.color === color && piece.type === type
  }
  const match = CASTLES.find((c) => c.needs.every(([type, file, rank]) => at(type, file, rank)))
  const castle = match?.name ?? null
  const squares = match ? match.needs.map(([, file, rank]) => view(color, file, rank)) : []
  let rookFile: number | null = null
  for (let rank = 9; rank >= 4 && rookFile === null; rank--)
    for (let file = 1; file <= 9; file++)
      if (at(PieceType.ROOK, file, rank)) {
        rookFile = file
        break
      }
  let strategy = rookFile === null ? null : (ROOK_FILE[rookFile] ?? null)
  if (rookFile === 7 && at(PieceType.PAWN, 7, 5)) strategy = '石田流'
  if (rookFile === 2) {
    if ((at(PieceType.SILVER, 2, 6) || at(PieceType.SILVER, 2, 5) || at(PieceType.SILVER, 1, 5)) && at(PieceType.PAWN, 2, 5)) strategy = '棒銀'
    else if (at(PieceType.SILVER, 3, 6) || at(PieceType.SILVER, 3, 5)) strategy = '早繰り銀'
    else if (at(PieceType.SILVER, 5, 6)) strategy = '腰掛け銀'
    else if (at(PieceType.SILVER, 4, 6) && at(PieceType.PAWN, 3, 5)) strategy = '斜め棒銀'
  }
  return { strategy, castle, squares }
}

const ENGLISH: Record<string, string> = {
  ビッグ4: 'Big Four',
  銀冠穴熊: 'Silver Crown Anaguma',
  居飛車穴熊: 'Static Rook Anaguma',
  振り飛車穴熊: 'Ranging Rook Anaguma',
  穴熊: 'Anaguma',
  ミレニアム: 'Millennium',
  銀冠: 'Silver Crown',
  ダイヤモンド美濃: 'Diamond Mino',
  高美濃: 'High Mino',
  本美濃: 'Mino',
  片美濃: 'Half Mino',
  木村美濃: 'Kimura Mino',
  天守閣美濃: 'Tenshukaku Mino',
  左美濃: 'Left Mino',
  金矢倉: 'Gold Yagura',
  銀矢倉: 'Silver Yagura',
  舟囲い: 'Boat castle',
  金無双: 'Double Gold',
  菊水矢倉: 'Kikusui Yagura',
  elmo囲い: 'Elmo castle',
  箱入り娘: 'Girl in the House',
  カニ囲い: 'Crab castle',
  中住まい: 'Central House',
  雁木: 'Gangi',
  居玉: 'King unmoved',
  居飛車: 'Static Rook',
  袖飛車: 'Side Rook',
  右四間飛車: 'Right Fourth File Rook',
  中飛車: 'Central Rook',
  四間飛車: 'Fourth File Rook',
  三間飛車: 'Third File Rook',
  向かい飛車: 'Opposing Rook',
  石田流: 'Ishida',
  棒銀: 'Climbing Silver',
  早繰り銀: 'Rapid Advancing Silver',
  腰掛け銀: 'Reclining Silver',
  斜め棒銀: 'Diagonal Climbing Silver',
}

export const formationName = (name: string, lang: string) => (lang === 'ja' ? name : (ENGLISH[name] ?? name))
