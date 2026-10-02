import type * as THREE from 'three'
import type { RoomDims } from '../roomFloor'
import { CASUAL } from './dimensions'

type RoomModule = typeof import('../room')

let loading: Promise<RoomModule> | null = null
let loaded: RoomModule | null = null

const loadRoom = () =>
  (loading ??= import('../room').then((m) => {
    loaded = m
    return m
  }))

export type Surroundings = { need: () => void; prefetch: () => () => void }

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
      const idle = (run: () => void) => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(run) : window.setTimeout(run, 0))
      const timer = window.setTimeout(() => idle(() => void loadRoom()), 3000)
      return () => window.clearTimeout(timer)
    },
  }
}
