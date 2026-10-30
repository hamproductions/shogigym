import { getSettings } from '@/appearance/settings'
import { sayParts } from '@/utils/voice'

const READING: Record<string, string> = {
  '☗': 'せんて、',
  '☖': 'ごて、',
  '▲': 'せんて、',
  '△': 'ごて、',
  '１': 'いち',
  '２': 'に',
  '３': 'さん',
  '４': 'よん',
  '５': 'ご',
  '６': 'ろく',
  '７': 'なな',
  '８': 'はち',
  '９': 'きゅう',
  一: 'いち、',
  二: 'に、',
  三: 'さん、',
  四: 'よん、',
  五: 'ご、',
  六: 'ろく、',
  七: 'なな、',
  八: 'はち、',
  九: 'きゅう、',
  同: 'どう、',
  歩: 'ふ',
  香: 'きょう',
  桂: 'けい',
  銀: 'ぎん',
  金: 'きん',
  角: 'かく',
  飛: 'ひしゃ',
  玉: 'ぎょく',
  王: 'おう',
  と: 'と',
  杏: 'なりきょう',
  圭: 'なりけい',
  全: 'なりぎん',
  馬: 'うま',
  竜: 'りゅう',
  龍: 'りゅう',
  成: 'なり',
  不: 'ならず',
  打: 'うつ',
  右: 'みぎ',
  左: 'ひだり',
  上: 'あがる',
  引: 'ひく',
  寄: 'よる',
  直: 'すぐ',
}

export function moveReading(text: string) {
  return [...text.replace('不成', '不')]
    .map((ch) => READING[ch] ?? '')
    .join('')
    .replace(/、$/, '')
}

let voice: SpeechSynthesisVoice | null = null

function japaneseVoice() {
  if (voice) return voice
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('ja'))
  voice = voices.find((v) => v.localService) ?? voices[0] ?? null
  return voice
}

export function speak(text: string) {
  const { sound, voice: enabled, volume } = getSettings()
  if (!sound || !enabled || typeof speechSynthesis === 'undefined' || !text) return
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.voice = japaneseVoice()
  utterance.volume = Math.min(1, volume * 1.5)
  utterance.rate = 1.05
  speechSynthesis.speak(utterance)
}

const FILES = '１２３４５６７８９'
const RANKS = '一二三四五六七八九'

export const squareName = (cell: number) => `${FILES[8 - (cell % 9)]}${RANKS[Math.floor(cell / 9)]}`
export const squareReading = (cell: number) => moveReading(squareName(cell))

const PIECES = ['成香', '成桂', '成銀']

export function moveParts(text: string) {
  const side = text[0]
  let rest = text.slice(1)
  const parts: string[] = []
  if (rest.startsWith('同')) {
    parts.push(`cam:${side}同`)
    rest = rest.slice(1).trimStart()
  } else {
    parts.push(`cam:${side}${rest.slice(0, 2)}`)
    rest = rest.slice(2)
  }
  const piece = PIECES.find((p) => rest.startsWith(p)) ?? rest[0]
  if (piece) parts.push(`cam:${piece}`)
  rest = rest.slice(piece?.length ?? 0)
  while (rest) {
    const token = rest.startsWith('不成') ? '不成' : rest[0]
    parts.push(`cam:${token}`)
    rest = rest.slice(token.length)
  }
  return parts
}

export const squareParts = (cell: number) => [`cam:sq:${squareName(cell)}`]

export function announce(parts: string[], fallback: string) {
  if (!parts.length) return
  void sayParts(parts).then((played) => {
    if (!played) speak(fallback)
  })
}
