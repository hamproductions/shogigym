import type * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Color, ImmutablePosition, PieceType, Square } from 'tsshogi'
import type { AvatarCues, AvatarSlot, Wall } from '@/rendering/avatars'
import type { Surroundings } from './surroundings'
import type { BoardLoadingState } from '@/rendering/BoardLoading'

export type BoardArrow = { usi: string; color: string; dashed?: boolean; label?: string }

export type ZoneRect = { left: number; top: number; width: number; height: number }
export type StandZones = { under: ZoneRect; over: ZoneRect; board: ZoneRect }

export type Board3DProps = {
  assetsReady?: boolean
  loadingState?: BoardLoadingState
  appearanceKey?: string
  position: ImmutablePosition
  furigoma?: boolean
  onFurigoma?: (faces: boolean[]) => void
  flipped: boolean
  tilted: boolean
  orbit?: boolean
  lastMove?: string
  selected: Square | PieceType | null
  selectedColor?: Color
  targets: Square[]
  arrows: BoardArrow[]
  castles?: { squares: Square[]; color: string; label: string }[]
  peek?: Square[]
  heat?: { square: Square; color: number; opacity: number; label?: string }[]
  checkSquare?: Square | null
  snapKey?: string
  peekFrom?: Square | null
  stamp?: { square: string; text: string; color: string } | null
  onSquare: (square: Square) => void
  onHand: (color: Color, type: PieceType) => void
  onDrop: (from: Square | PieceType, to: Square) => void
  movable?: Color | null
  onArrow?: (usi: string) => void
  onZones?: (zones: StandZones | null) => void
  sideRoom?: number
  cues?: AvatarCues
}

export type Latest = { readonly current: Board3DProps }

export type Stand = { stand: THREE.Mesh; side: number; legs: THREE.Mesh[] }

export type Body = {
  obj: THREE.Object3D
  v: THREE.Vector3
  w: THREE.Vector3
  center: THREE.Vector3
  half: THREE.Vector3
  keepFlat: boolean
  grounded: boolean
  landed: boolean
  sleeping?: boolean
  quietFor?: number
}

export type Arena = {
  floor: number
  boxes: { minX: number; maxX: number; minZ: number; maxZ: number; top: number }[]
  halfX: number
  halfZ: number
  ceil: number
  walls: Wall[]
}

export type TableFlip = {
  start: number
  bodies: Body[]
  arena: Arena
  rig: THREE.Group
  dust: Dust
  slammed: boolean
  lastClatter: number
  release: boolean
  way: number
}

export type Dust = { points: THREE.Points; burst: (at: THREE.Vector3, count: number, power: number) => void; step: (dt: number) => void }

export type SceneState = {
  room: Surroundings
  avatars?: AvatarSlot
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  root: THREE.Group
  pieces: THREE.Group
  marks: THREE.Group
  board: THREE.Mesh
  legs: THREE.Mesh[]
  stands: Stand[]
  placeStands: () => void
  handMeshes: THREE.Object3D[]
  tags: THREE.Object3D[]
  tilt: number
  tiltTarget: number
  viewTilted?: boolean
  animations: {
    mesh: THREE.Object3D
    from: THREE.Vector3
    to: THREE.Vector3
    start: number
    duration?: number
    slide?: boolean
    fromQ?: THREE.Quaternion
    toQ?: THREE.Quaternion
    flip?: THREE.Object3D
    land?: (() => void) | null
  }[]
  drag: { mesh: THREE.Object3D; from: Square | PieceType } | null
  controls: OrbitControls | null
  tilePov?: THREE.Object3D | null
  tilePovFrame?: THREE.Matrix4 | null
  flip: TableFlip | null
  settled?: boolean
  droppedAt?: number
  onLand?: (() => void) | null
  settle?: () => void
  releaseFlip?: () => void
  lastTime?: number
}
