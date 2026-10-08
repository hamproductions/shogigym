import * as THREE from 'three'
import type { RigidBody, World } from '@dimforge/rapier3d-compat'
import { MM_PER_SQUARE, SQ_D, komaDepth, komaTaper } from '@/rendering/board3d/dimensions'
import { piecePolygon } from '@/rendering/koma'
import { woodMaterial } from '@/rendering/board3d/materials'
import { disposePiece } from '@/rendering/board3d/piece'
import { PieceInstances } from './instances'
import { taikyokuPiece } from './pieces'
import { SIZE, type Cell, type Pos, type Side } from './notation'

export type CaptureRecord = { cell: Cell; by: Side; from: Pos }
type Options = {
  parent: THREE.Object3D
  make: (cell: Cell) => THREE.Object3D
  position: (pos: Pos) => THREE.Vector3
  onInvalidate: () => void
  floorY: number
  bins?: Record<Side, THREE.Vector3>
}
type Pending = { record: CaptureRecord; animate: boolean; deferred: boolean }
type Tile = { record: CaptureRecord; mesh: THREE.Object3D; body: RigidBody; instanced: boolean }

const WALL = 10 / MM_PER_SQUARE
const WIDTH = 350 / MM_PER_SQUARE
const DEPTH = 280 / MM_PER_SQUARE
const HEIGHT = 160 / MM_PER_SQUARE
export const CAPTURE_BOX = { width: WIDTH, depth: DEPTH, height: HEIGHT }
const GRAVITY = 9810 / MM_PER_SQUARE
const initialized = import('@dimforge/rapier3d-compat').then(async ({ default: physics }) => {
  await physics.init()
  return physics
})

const sameRecord = (a: CaptureRecord, b: CaptureRecord) =>
  a.cell.key === b.cell.key && a.cell.side === b.cell.side && a.by === b.by && a.from.file === b.from.file && a.from.rank === b.from.rank

export async function createCaptures(options: Options) {
  const physics = await initialized
  const world = new physics.World({ x: 0, y: -GRAVITY, z: 0 })
  world.numSolverIterations = 8
  return new Captures(options, world, physics)
}

class Captures {
  readonly bins: Record<Side, THREE.Vector3>
  private group = new THREE.Group()
  private boxMeshes: Record<Side, THREE.Mesh[]> = { b: [], w: [] }
  private instances = new PieceInstances(this.group, false, true)
  private records: CaptureRecord[] = []
  private pending: Pending[] = []
  private tiles: Tile[] = []
  private accumulator = 0
  private spawnTime = 0
  private changed = false
  private disposed = false
  private options: Options
  private world: World
  private physics: Awaited<typeof initialized>

  constructor(options: Options, world: World, physics: Awaited<typeof initialized>) {
    this.options = options
    this.world = world
    this.physics = physics
    this.bins = options.bins ?? {
      b: new THREE.Vector3(SIZE / 2 + WIDTH / 2 + 1.8, options.floorY, (SIZE * SQ_D) / 2 - DEPTH / 2),
      w: new THREE.Vector3(-SIZE / 2 - WIDTH / 2 - 1.8, options.floorY, (-SIZE * SQ_D) / 2 + DEPTH / 2),
    }
    options.parent.add(this.group)
    this.fixed(120, WALL, 120, new THREE.Vector3(0, options.floorY - WALL / 2, 0), false)
    for (const side of ['b', 'w'] as const) {
      const firstMesh = this.group.children.length
      const center = this.bins[side]
      this.fixed(WIDTH, WALL, DEPTH, center.clone().add(new THREE.Vector3(0, WALL / 2, 0)))
      this.fixed(WALL, HEIGHT, DEPTH, center.clone().add(new THREE.Vector3(-(WIDTH - WALL) / 2, HEIGHT / 2, 0)))
      this.fixed(WALL, HEIGHT, DEPTH, center.clone().add(new THREE.Vector3((WIDTH - WALL) / 2, HEIGHT / 2, 0)))
      this.fixed(WIDTH - 2 * WALL, HEIGHT, WALL, center.clone().add(new THREE.Vector3(0, HEIGHT / 2, -(DEPTH - WALL) / 2)))
      this.fixed(WIDTH - 2 * WALL, HEIGHT, WALL, center.clone().add(new THREE.Vector3(0, HEIGHT / 2, (DEPTH - WALL) / 2)))
      this.boxMeshes[side] = this.group.children.slice(firstMesh).filter((object): object is THREE.Mesh => object instanceof THREE.Mesh)
    }
  }

  private fixed(width: number, height: number, depth: number, position: THREE.Vector3, visible = true) {
    this.world.createCollider(
      this.physics.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
        .setTranslation(position.x, position.y, position.z)
        .setFriction(0.65),
    )
    if (!visible) return
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), woodMaterial([219, 170, 98], 23 + this.group.children.length))
    mesh.position.copy(position)
    mesh.castShadow = mesh.receiveShadow = true
    this.group.add(mesh)
  }

  boxes() {
    return (['b', 'w'] as const).map((side) => {
      const bounds = new THREE.Box3()
      for (const mesh of this.boxMeshes[side]) {
        mesh.updateWorldMatrix(true, false)
        bounds.expandByObject(mesh, true)
      }
      return bounds
    })
  }

  sync(records: CaptureRecord[], animate: boolean, defer = false) {
    let shared = 0
    while (shared < records.length && shared < this.records.length && sameRecord(records[shared], this.records[shared])) shared++
    const truncated = shared < this.records.length
    const retained = this.records.slice(0, shared)
    for (const tile of [...this.tiles]) {
      if (retained.includes(tile.record)) continue
      this.instances.remove(tile.mesh)
      tile.mesh.removeFromParent()
      disposePiece(tile.mesh, true)
      this.world.removeRigidBody(tile.body)
      this.tiles.splice(this.tiles.indexOf(tile), 1)
    }
    this.pending = this.pending.filter(({ record }) => retained.includes(record))
    this.records = [...retained, ...records.slice(shared)]
    for (const record of this.records.slice(shared)) this.pending.push({ record, animate, deferred: animate && defer })
    if (truncated) for (const tile of this.tiles) tile.body.wakeUp()
    this.changed = true
    this.options.onInvalidate()
  }

  throw(record: CaptureRecord, mesh?: THREE.Object3D, origin?: THREE.Vector3) {
    const index = this.pending.findIndex((pending) => sameRecord(pending.record, record))
    if (index < 0) return false
    const pending = this.pending.splice(index, 1)[0]
    this.spawn(pending, mesh, origin)
    return true
  }

  private spawn({ record, animate }: Pending, provided?: THREE.Object3D, origin?: THREE.Vector3) {
    const mesh = provided ?? this.options.make(record.cell)
    const bin = this.bins[record.by]
    const x = (Math.random() - 0.5) * (WIDTH - 2 * WALL - 2)
    const z = (Math.random() - 0.5) * (DEPTH - 2 * WALL - 2)
    const target = bin.clone().add(new THREE.Vector3(x, HEIGHT + 0.8, z))
    const start = animate
      ? (origin?.clone() ?? (provided ? mesh.position.clone() : this.options.position(record.from).add(new THREE.Vector3(0, 0.8, 0))))
      : target.clone().add(new THREE.Vector3(0, Math.random() * 1.5, 0))
    const flight = 0.55 + Math.random() * 0.15
    const velocity = animate
      ? target
          .clone()
          .sub(start)
          .divideScalar(flight)
          .add(new THREE.Vector3(0, (GRAVITY * flight) / 2, 0))
      : new THREE.Vector3()
    const rotation =
      provided && animate
        ? mesh.quaternion.clone()
        : new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 0.9, Math.random() * Math.PI * 2, Math.random() * 0.9))
    const body = this.world.createRigidBody(
      this.physics.RigidBodyDesc.dynamic()
        .setTranslation(start.x, start.y, start.z)
        .setRotation(rotation)
        .setLinvel(velocity.x, velocity.y, velocity.z)
        .setAngvel({ x: (Math.random() - 0.5) * 9, y: (Math.random() - 0.5) * 12, z: (Math.random() - 0.5) * 9 })
        .setCcdEnabled(true)
        .setCanSleep(true)
        .setLinearDamping(0)
        .setAngularDamping(0.6),
    )
    const { face } = taikyokuPiece(record.cell.key, record.cell.side)
    const points = new Float32Array(
      piecePolygon(face.scale).flatMap(([px, py]) => {
        const thickness = (komaDepth(face.scale) + 0.024) * (1 - (1 - komaTaper(face.scale)) * (py / face.scale + 0.5))
        return [px, -0.025, -py, px, thickness, -py]
      }),
    )
    const collider = this.physics.ColliderDesc.convexHull(points)
    if (!collider) {
      this.world.removeRigidBody(body)
      disposePiece(mesh, true)
      throw new Error('Unable to build captured tile collider')
    }
    this.world.createCollider(collider.setFriction(0.62).setRestitution(0.08).setDensity(1).setContactSkin(0.002), body)
    mesh.position.copy(start)
    mesh.quaternion.copy(rotation)
    mesh.scale.setScalar(1)
    this.group.add(mesh)
    this.tiles.push({ record, mesh, body, instanced: false })
    this.changed = true
    this.options.onInvalidate()
  }

  tick(dt: number) {
    if (this.disposed) return false
    this.spawnTime -= dt
    const pending = this.pending.findIndex((entry) => !entry.deferred)
    if (pending >= 0 && this.spawnTime <= 0) {
      this.spawn(this.pending.splice(pending, 1)[0])
      this.spawnTime = 0.055
    }
    const awake = this.tiles.some(({ body }) => !body.isSleeping())
    if (!awake && !this.changed) return false
    this.accumulator = Math.min(0.05, this.accumulator + dt)
    while (this.accumulator >= 1 / 60) {
      this.world.timestep = 1 / 60
      this.world.step()
      this.accumulator -= 1 / 60
    }
    let membershipChanged = this.changed
    for (const tile of this.tiles) {
      const sleeping = tile.body.isSleeping()
      if (!sleeping && tile.instanced) {
        this.instances.remove(tile.mesh)
        this.group.add(tile.mesh)
        tile.instanced = false
        membershipChanged = true
      }
      if (sleeping && tile.instanced) continue
      const position = tile.body.translation()
      const rotation = tile.body.rotation()
      tile.mesh.position.set(position.x, position.y, position.z)
      tile.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
      if (sleeping) {
        this.instances.add(tile.mesh)
        tile.instanced = true
        membershipChanged = true
      }
    }
    if (membershipChanged) this.instances.update()
    this.changed = false
    return true
  }

  dispose() {
    this.disposed = true
    this.instances.dispose()
    for (const { mesh } of this.tiles) {
      mesh.removeFromParent()
      disposePiece(mesh)
    }
    this.tiles = []
    this.pending = []
    this.records = []
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry.dispose()
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture && value !== (material as THREE.MeshStandardMaterial).envMap) value.dispose()
        material.dispose()
      }
    })
    this.group.removeFromParent()
    this.world.free()
  }
}
