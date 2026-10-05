import formations from '../../src/data/formations.json'
import { READINGS } from './readings'

export type Phrase = { text: string; say: string; natural?: boolean }

const readingsFor = (names: string[]): Record<string, string> =>
  Object.fromEntries(
    names.flatMap((name) => {
      if (!(name in READINGS)) throw new Error(`Missing reading: ${name}`)
      const kana = READINGS[name]
      return kana ? [[name, kana]] : []
    }),
  )

for (const { name } of formations.definitions) if (!(name in READINGS)) throw new Error(`Missing reading: ${name}`)

const named = (pairs: Record<string, string>, tail: string) => Object.entries(pairs).map(([text, kana]) => ({ text, say: `${kana}${tail}` }))

export const FORMATIONS = readingsFor([
  'ビッグ4',
  '銀冠穴熊',
  '居飛車穴熊',
  '振り飛車穴熊',
  '穴熊',
  'ミレニアム',
  '銀冠',
  'ダイヤモンド美濃',
  '高美濃',
  '本美濃',
  '片美濃',
  '木村美濃',
  '天守閣美濃',
  '左美濃',
  '金矢倉',
  '銀矢倉',
  '舟囲い',
  '金無双',
  '菊水矢倉',
  'elmo囲い',
  '箱入り娘',
  'カニ囲い',
  '中住まい',
  '雁木',
  '居飛車',
  '袖飛車',
  '右四間飛車',
  '中飛車',
  '四間飛車',
  '三間飛車',
  '向かい飛車',
  '石田流',
  '棒銀',
  '早繰り銀',
  '腰掛け銀',
  '斜め棒銀',
])

export const TESUJI = readingsFor([
  '桂頭攻め',
  '底歩',
  '合わせの歩',
  '焦点の歩',
  '叩きの歩',
  '垂れ歩',
  '突き捨ての歩',
  '王手飛車取り',
  '王手両取り',
  'ふんどしの桂',
  '割り打ちの銀',
  '両取り',
  '頭金',
  '両王手',
  '空き王手',
  '尻金',
  '肩銀',
  '一間竜',
  '吊るし桂',
  '捨て駒の王手',
  '腹銀',
])

const COUNT = ['いち', 'に', 'さん', 'し', 'ご', 'ろく', 'しち', 'はち', 'きゅう']

export const PHRASES: Phrase[] = [
  ...named(FORMATIONS, ''),
  ...named(TESUJI, ''),
  ...formations.definitions
    .filter(({ name }) => !FORMATIONS[name] && !TESUJI[name])
    .flatMap(({ name }) => (READINGS[name] ? [{ text: name, say: READINGS[name]! }] : [])),
  { text: 'あなたの振り歩先です', say: 'あなたがふりごまおおこないます' },
  { text: '振り駒を行います', say: 'ふりごまおおこないます' },
  ...Array.from({ length: 6 }, (_, n) => ({
    text: `${n >= 3 ? '歩' : 'と金'}が${n >= 3 ? n : 5 - n}枚出たので、上手は${n >= 3 ? '先手' : '後手'}です`,
    say: `${n >= 3 ? 'ふ' : 'ときん'}が${['さん', 'よん', 'ご'][n >= 3 ? n - 3 : 2 - n]}まいでたので、かみてわ${n >= 3 ? 'せんて' : 'ごて'}です`,
  })),
  ...Array.from({ length: 6 }, (_, n) => ({
    text: `${n >= 3 ? '歩' : 'と金'}が${n >= 3 ? n : 5 - n}枚出たので、あなたは${n >= 3 ? '先手' : '後手'}です`,
    say: `${n >= 3 ? 'ふ' : 'ときん'}が${['さん', 'よん', 'ご'][n >= 3 ? n - 3 : 2 - n]}まいでたので、あなたわ${n >= 3 ? 'せんて' : 'ごて'}です`,
  })),
  { text: 'よろしくお願いします', say: 'よろしくおねがいします！' },
  { text: 'ありがとうございました', say: 'ありがとうございました' },
  { text: '王手', say: 'おうて！' },
  { text: '詰み', say: 'つみ！' },
  { text: '秒読み', say: 'びょうよみ' },
  { text: '時間切れ', say: 'じかんぎれ' },
  ...[10, 20, 30, 40, 50].map((n) => ({ text: `${n}秒`, say: `${['じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう'][n / 10 - 1]}びょう` })),
  ...COUNT.map((say, i) => ({ text: String(i + 1), say })),
]
