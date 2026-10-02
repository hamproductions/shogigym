import type { MoveReview } from '../analysis'

const REVIEWS = 'joseki-practice:reviews:v1'
const EVALS = 'joseki-practice:evals:v1'
const LIMIT = 3000

const strip = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

function load<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}')
  } catch {
    return {}
  }
}

const reviews = load<MoveReview>(REVIEWS)
const evals = load<number>(EVALS)
let timer: ReturnType<typeof setTimeout> | null = null

function persist() {
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    for (const [key, map] of [
      [REVIEWS, reviews],
      [EVALS, evals],
    ] as const) {
      const keys = Object.keys(map)
      for (const k of keys.slice(0, Math.max(0, keys.length - LIMIT))) delete (map as Record<string, unknown>)[k]
      try {
        localStorage.setItem(key, JSON.stringify(map))
      } catch (error) {
        console.warn('analysis cache not persisted', error)
      }
    }
  }, 500)
}

export const reviewKey = (sfen: string, usi: string) => `${strip(sfen)}|${usi}`

export const cachedReview = (sfen: string, usi: string): MoveReview | undefined => reviews[reviewKey(sfen, usi)]

export function rememberReview(sfen: string, usi: string, review: MoveReview) {
  reviews[reviewKey(sfen, usi)] = review
  persist()
}

export const cachedEval = (sfen: string): number | undefined => evals[strip(sfen)]

export function rememberEval(sfen: string, cp: number) {
  evals[strip(sfen)] = cp
  persist()
}

export const allEvals = () => ({ ...evals })
