import { useSyncExternalStore } from 'react'
import type { MoveReview } from '@/utils/analysis'

const LEGACY_REVIEWS = 'joseki-practice:reviews:v1'
const REVIEW = 'joseki-practice:review:'
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

const reviews = new Map<string, MoveReview | null>()
const reviewListeners = new Set<() => void>()
let reviewVersion = 0
const evals = load<number>(EVALS)
let timer: ReturnType<typeof setTimeout> | null = null

const idle = (task: () => void) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(task, { timeout: 5000 }) : setTimeout(task, 0))

function storeReview(key: string, review: MoveReview) {
  try {
    localStorage.setItem(REVIEW + key, JSON.stringify(review))
    return true
  } catch {
    return false
  }
}

function trimReviews(keep: number) {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(REVIEW)) keys.push(key)
  }
  for (const key of keys.slice(0, Math.max(0, keys.length - keep))) {
    localStorage.removeItem(key)
    reviews.delete(key.slice(REVIEW.length))
  }
}

export function freeAnalysisCache() {
  trimReviews(0)
  reviews.clear()
  for (const key of Object.keys(evals)) delete evals[key]
  try {
    localStorage.removeItem(EVALS)
  } catch (error) {
    console.warn('analysis cache not cleared', error)
  }
}

function migrateReviews() {
  try {
    const legacy = localStorage.getItem(LEGACY_REVIEWS)
    if (!legacy) return
    const saved = JSON.parse(legacy) as Record<string, MoveReview>
    localStorage.removeItem(LEGACY_REVIEWS)
    for (const [key, review] of Object.entries(saved)) storeReview(key, review)
  } catch (error) {
    console.warn('analysis cache not migrated', error)
  }
}

if (typeof window !== 'undefined') {
  migrateReviews()
  idle(() => trimReviews(LIMIT))
}

function flush() {
  if (timer) clearTimeout(timer)
  timer = null
  const keys = Object.keys(evals)
  for (const k of keys.slice(0, Math.max(0, keys.length - LIMIT))) delete evals[k]
  try {
    localStorage.setItem(EVALS, JSON.stringify(evals))
  } catch (error) {
    console.warn('analysis cache not persisted', error)
  }
}

if (typeof window !== 'undefined') window.addEventListener('pagehide', () => timer && flush())

function persistEvals() {
  if (!timer) timer = setTimeout(() => idle(flush), 2000)
}

export const reviewKey = (sfen: string, usi: string) => `${strip(sfen)}|${usi}`

export function cachedReview(sfen: string, usi: string): MoveReview | undefined {
  const key = reviewKey(sfen, usi)
  if (!reviews.has(key)) {
    let review: MoveReview | null = null
    try {
      const saved = localStorage.getItem(REVIEW + key)
      review = saved ? (JSON.parse(saved) as MoveReview) : null
    } catch {
      review = null
    }
    reviews.set(key, review)
  }
  return reviews.get(key) ?? undefined
}

export function rememberReview(sfen: string, usi: string, review: MoveReview) {
  const key = reviewKey(sfen, usi)
  reviews.set(key, review)
  reviewVersion++
  reviewListeners.forEach((listener) => listener())
  if (!storeReview(key, review)) {
    trimReviews(LIMIT / 2)
    storeReview(key, review)
  }
}

export function useReviewVersion() {
  return useSyncExternalStore(
    (listener) => {
      reviewListeners.add(listener)
      return () => {
        reviewListeners.delete(listener)
      }
    },
    () => reviewVersion,
    () => 0,
  )
}

export const cachedEval = (sfen: string): number | undefined => evals[strip(sfen)]

export function rememberEval(sfen: string, cp: number) {
  if (evals[strip(sfen)] === cp) return
  evals[strip(sfen)] = cp
  persistEvals()
}

export const allEvals = () => ({ ...evals })
