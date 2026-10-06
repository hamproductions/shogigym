const HOUR = 3600_000
const DAY = 24 * HOUR
export const LADDER = [4 * HOUR, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY, 90 * DAY, 180 * DAY]

export interface Card {
  key: string
  level: number
  due: number
  mistakes: number
  reviews: number
  lastCorrect?: boolean
}

const STORAGE_KEY = 'joseki-practice:srs:v2'

function load(): Record<string, Card> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

let cards = load()
const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch (error) {
    console.warn('progress not persisted', error)
  }
  listeners.forEach((l) => l())
}

export const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const cardKey = (scope: string, id: string) => `${scope}#${id}`

export const positionKey = (sfen: string) => cardKey('pos', sfen.split(' ').slice(0, 3).join(' '))

export const getCard = (key: string): Card | undefined => cards[key]

export function record(key: string, correct: boolean, now = Date.now()) {
  const card = cards[key] ?? { key, level: 0, due: now, mistakes: 0, reviews: 0 }
  const level = correct ? Math.min(card.level + 1, LADDER.length) : 1
  cards = {
    ...cards,
    [key]: {
      ...card,
      level,
      due: now + LADDER[level - 1],
      mistakes: card.mistakes + (correct ? 0 : 1),
      reviews: card.reviews + 1,
      lastCorrect: correct,
    },
  }
  save()
}

export const isDue = (key: string, now = Date.now()) => {
  const card = cards[key]
  return !!card && card.due <= now
}

export const isLearned = (card: Card | undefined) => !!card && (card.lastCorrect ?? card.mistakes === 0)

export const isDifficult = (card: Card) => card.mistakes >= 3 && card.level < 4

export const allCards = () => Object.values(cards)

export function resetAll() {
  cards = {}
  save()
}

export function exportProgress(): string {
  return JSON.stringify(cards)
}

export function importProgress(json: string) {
  cards = JSON.parse(json)
  save()
}
