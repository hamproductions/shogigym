import type * as THREE from 'three'
import type * as Room from '@/rendering/room'
import type { RoomDims } from '@/rendering/roomFloor'
import { CASUAL } from './dimensions'

type RoomModule = typeof Room

let loading: Promise<RoomModule> | null = null
let loaded: RoomModule | null = null

const loadRoom = () =>
  (loading ??= import('@/rendering/room').then((m) => {
    loaded = m
    return m
  }))

const idle = (run: () => void) => (typeof globalThis.requestIdleCallback === 'function' ? globalThis.requestIdleCallback(run) : globalThis.setTimeout(run, 0))

export interface Surroundings {
  need: () => void
  prefetch: () => () => void
}

export function surroundings(root: THREE.Group, dims: RoomDims): Surroundings {
  let built = false
  const build = (m: RoomModule) => {
    if (built) return
    built = true
    if (CASUAL) m.buildCasual(root, dims)
    else m.buildRoom(root, dims)
  }
  return {
    need: () => {
      if (built) return
      if (loaded) build(loaded)
      else void loadRoom().then(build)
    },
    prefetch: () => {
      const timer = globalThis.setTimeout(() => idle(() => void loadRoom()), 3000)
      return () => globalThis.clearTimeout(timer)
    },
  }
}
