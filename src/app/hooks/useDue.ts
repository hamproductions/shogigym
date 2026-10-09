import { useSyncExternalStore } from 'react'
import { reviewCounts } from '@/app/practice'
import { subscribe } from '@/utils/srs'

let version = 0
let cache: { key: string; value: number } | null = null
subscribe(() => {
  version++
})

/** Cards waiting for review now; recomputed when progress changes or each minute. */
function snapshot() {
  const key = `${version}:${Math.floor(Date.now() / 60_000)}`
  if (cache?.key !== key) {
    const counts = reviewCounts()
    cache = { key, value: counts.due + counts.mistakes }
  }
  return cache.value
}

export const useDue = () => useSyncExternalStore(subscribe, snapshot, () => 0)
