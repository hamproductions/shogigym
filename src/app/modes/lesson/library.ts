import type { Text } from '@/data/strategies'
import type { Setup } from '@/utils/catalog'

export type Category = 'basics' | 'skills' | 'joseki'

export const CATEGORIES: { id: Category; name: Text; about: Text }[] = [
  {
    id: 'basics',
    name: { ja: 'はじめての将棋', en: 'First steps' },
    about: { ja: '駒の動かし方とルール、入門講座', en: 'How the pieces move, the rules, beginner lessons' },
  },
  {
    id: 'skills',
    name: { ja: '上達のためのテクニック', en: 'Getting stronger' },
    about: { ja: '手筋、囲い崩し、寄せ、囲い、勉強法', en: 'Tactics, castle attacks, mating, castles, study' },
  },
  { id: 'joseki', name: { ja: '定跡', en: 'Joseki' }, about: { ja: '戦法を選び、その定跡を学ぶ', en: 'Pick a strategy and learn its lines' } },
]

const OPENINGS = '戦法、定跡'
const OPENING_PATHS = new Set([OPENINGS, '戦法・定跡'])
const PATH_GROUP: Record<string, string> = {
  ルール: '将棋のルール',
  基本の考え方: '初心者向け入門講座',
  終盤: '詰将棋、必至、寄せ',
  囲い: '囲い、駒組み',
  矢倉: '矢倉戦法',
  雁木: '矢倉戦法',
  対振り飛車: '対振り飛車、対抗型',
  奇襲対策: '奇襲戦法',
  駒落ち: '駒落ち定跡',
}
const TECHNIQUE_GROUP: Record<string, string> = { tesuji: '手筋', sabaki: '手筋', kuzushi: '囲い崩し' }

export const STRATEGY_GROUP: Record<string, string> = {
  shikenbisha: '四間飛車',
  sankenbisha: '三間飛車',
  hayaishida: '三間飛車',
  ishida: '三間飛車',
  nakabisha: '中飛車',
  gokigen: '中飛車',
  mukaibisha: '向かい飛車',
  'kakukoukan-furi': '角交換振り飛車',
  yagura: '矢倉戦法',
  'kyusen-yagura': '矢倉戦法',
  gangi: '矢倉戦法',
  kakugawari: '角換わり',
  ittezon: '角換わり',
  hayakurigin: '角換わり',
  koshikakegin: '角換わり',
  aigakari: '相掛かり',
  yokofudori: '横歩取り',
  'yoko-85hi': '横歩取り',
  'yoko-45kaku': '横歩取り',
  ibisha: '対振り飛車、対抗型',
  torisashi: '奇襲戦法',
  sujichigai: '奇襲戦法',
}

export const categoryOf = (setup: Setup): Category =>
  setup.technique ? 'skills' : setup.path ? (setup.path[0] === 'はじめての将棋' ? 'basics' : OPENING_PATHS.has(setup.path[0]) ? 'joseki' : 'skills') : 'joseki'

export const groupOf = (setup: Setup) => {
  const group = setup.technique ? TECHNIQUE_GROUP[setup.id] : setup.path?.[0] === '囲い' ? '囲い' : setup.path?.at(-1)
  return group ? (PATH_GROUP[group] ?? group) : undefined
}

export const josekiGroupOf = (setup: Setup) =>
  setup.path && OPENING_PATHS.has(setup.path[0]) ? (setup.path.length > 1 ? groupOf(setup)! : OPENINGS) : undefined

export const isOpeningBasics = (group: string) => group === OPENINGS
