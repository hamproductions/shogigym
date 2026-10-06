import { Color, type ImmutablePosition } from 'tsshogi'
import { currentFormation, finalizeFormationTags, formationTagsAt, type DetectionPreset, type DetectionResult } from './formationTags'

interface FormationHistory {
  sfens: string[]
  moves: string[]
  cursor: number
  detectionPreset?: DetectionPreset
}

export function formationOf(position: ImmutablePosition, color: Color, history?: FormationHistory) {
  const tags = history ? formationTagsAt(history.sfens, history.moves, history.cursor, history.detectionPreset)[color === Color.BLACK ? 0 : 1] : undefined
  return currentFormation(position, color, tags)
}

export function formationMoveTags(sfens: string[], moves: string[], preset?: DetectionPreset, result?: DetectionResult) {
  const annotations = formationTagsAt(sfens, moves, moves.length, preset).map((tags) => tags.filter((tag) => tag.annotation !== false))
  if (result) {
    const final = finalizeFormationTags(sfens, moves, { ...preset, ...result })
    final.forEach((tags, side) => {
      for (const tag of tags) {
        if (tag.annotation !== false && !annotations[side].some((existing) => existing.name === tag.name && existing.ply === tag.ply))
          annotations[side].push(tag)
      }
    })
  }
  return annotations
}

const ENGLISH: Record<string, string> = {
  振り飛車: 'Ranging Rook',
  美濃囲い: 'Mino',
  高美濃囲い: 'High Mino',
  片美濃囲い: 'Half Mino',
  ノーマル四間飛車: 'Classical Fourth File Rook',
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
