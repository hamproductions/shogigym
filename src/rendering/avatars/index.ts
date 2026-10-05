import type * as THREE from 'three'
import { Color } from 'tsshogi'
import { getSettings, subscribeSettings, type Environment } from '@/appearance/settings'

export type Knock = 'move' | 'capture'

export type MotionKind = 'slide' | 'carry' | 'drop' | 'capture' | 'promote'

export type AvatarMove = {
  kind: MotionKind
  flip?: THREE.Object3D
  sound?: Knock | null
  color: Color
  mesh: THREE.Object3D
  from: THREE.Vector3
  to: THREE.Vector3
  placed?: boolean
  land?: (() => void) | null
  capture?: { mesh: THREE.Object3D; to: THREE.Vector3; hide?: THREE.Object3D }
}

export type AvatarCues = { thinking: Color | null; resigned: Color | null; bowKey: string; nodKey: string; nodColor: Color | null }

export type Wall = { minX: number; maxX: number; minZ: number; maxZ: number; minY?: number; maxY?: number }

export type AvatarPhase = 'reach' | 'grip' | 'carry' | 'place' | 'press' | 'withdraw' | 'idle'

export type AvatarInspect = {
  color: Color
  phase: AvatarPhase
  kind: MotionKind | null
  t: number
  sample: number
  target: THREE.Vector3
  pole: THREE.Vector3
  pinch: THREE.Vector3
  piece: THREE.Vector3 | null
  hand: THREE.Object3D
  pose: Record<string, number[]> | null
  applied: Record<string, number[]>
}

export type AvatarController = {
  playMove: (move: AvatarMove) => void
  cue: (cues: AvatarCues) => void
  update: (dt: number, flip: number, orbit: boolean) => void
  walls: () => Wall[]
  swap: (from: THREE.Object3D, to: THREE.Object3D) => void
  reset: () => void
  inspect: () => AvatarInspect[]
  dispose: () => void
}

export type AvatarOptions = {
  root: THREE.Object3D
  camera: THREE.Camera
  environment: 'traditional' | 'casual'
  dims: { thick: number; leg: number; halfW: number; halfD: number }
  base: string
  random?: () => number
}

export const AVATAR_MODELS = [
  { color: Color.BLACK, file: 'avatars/sendagaya-shino.vrm', height: 1.6 },
  { color: Color.WHITE, file: 'avatars/sakurada-fumiriya.vrm', height: 1.74 },
] as const

export const avatarRoom = (environment: Environment) => (environment === 'traditional' || environment === 'casual' ? environment : null)

export const loadAvatars = (options: AvatarOptions) => import('./controller').then((m) => m.createAvatars(options))

let prefetched = false
function prefetchAvatars() {
  if (prefetched) return
  prefetched = true
  void import('./controller').catch(() => undefined)
}

export function avatarSlot(options: Omit<AvatarOptions, 'environment' | 'base'>) {
  const base = import.meta.env.BASE_URL
  const environment = avatarRoom(getSettings().environment)
  let controller: AvatarController | null = null
  let loading = false
  let failed = false
  let wanted = false
  let disposed = false
  let cues: AvatarCues | null = null
  const enabled = () => !!environment && getSettings().characters && !disposed
  const drop = () => {
    controller?.dispose()
    controller = null
  }
  const start = () => {
    if (!environment || loading || failed || controller || !enabled()) return
    loading = true
    loadAvatars({ ...options, environment, base })
      .then((c) => {
        loading = false
        if (!enabled()) return c.dispose()
        controller = c
        if (cues) c.cue(cues)
      })
      .catch((error) => {
        loading = false
        failed = true
        console.warn('characters not loaded', error)
      })
  }
  const unsubscribe = subscribeSettings(() => {
    if (!enabled()) drop()
    else if (wanted) start()
  })
  const idle = environment
    ? window.setTimeout(
        () =>
          (window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1)))(() => {
            if (!enabled()) return
            prefetchAvatars()
            wanted = true
            start()
          }),
        1500,
      )
    : 0
  return {
    request: () => {
      wanted = true
      start()
    },
    ready: () => !!controller,
    reset: () => controller?.reset(),
    walls: () => controller?.walls() ?? [],
    inspect: () => controller?.inspect() ?? [],
    swap: (from: THREE.Object3D, to: THREE.Object3D) => controller?.swap(from, to),
    playMove: (move: AvatarMove) => {
      if (!controller) return false
      controller.playMove(move)
      return true
    },
    cue: (next: AvatarCues) => {
      cues = next
      controller?.cue(next)
    },
    update: (dt: number, flip: number, orbit: boolean) => controller?.update(dt, flip, orbit),
    dispose: () => {
      disposed = true
      window.clearTimeout(idle)
      unsubscribe()
      drop()
    },
  }
}

export type AvatarSlot = Omit<ReturnType<typeof avatarSlot>, 'reset'> & { reset?: () => void }

const GOOD = new Set(['!!', '!', '★', '◎'])

export type CueInput = {
  playing: boolean
  aiTurn: boolean
  resigned: boolean
  userColor: Color
  toMove: Color
  fresh: boolean
  gameKey: string
  lastMove?: string
  ply: number
  stamp?: { square: string; text: string } | null
}

export function avatarCues({ playing, aiTurn, resigned, userColor, toMove, fresh, gameKey, lastMove, ply, stamp }: CueInput): AvatarCues {
  const opponent = userColor === Color.BLACK ? Color.WHITE : Color.BLACK
  const good = playing && !!lastMove && !!stamp && GOOD.has(stamp.text) && stamp.square === lastMove.slice(2, 4) && toMove !== userColor
  return {
    thinking: playing && aiTurn ? toMove : null,
    resigned: playing && resigned ? userColor : null,
    bowKey: playing && fresh ? gameKey : '',
    nodKey: good ? `${ply}|${lastMove}` : '',
    nodColor: good ? opponent : null,
  }
}
