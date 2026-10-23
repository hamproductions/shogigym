import * as THREE from 'three'

export type GroundObstacle = { minX: number; maxX: number; minZ: number; maxZ: number }

export function groundPath(from: THREE.Vector3, to: THREE.Vector3, bounds: GroundObstacle, obstacles: GroundObstacle[], clearance = 0.25) {
  const step = 0.25
  const columns = Math.ceil((bounds.maxX - bounds.minX) / step) + 1
  const rows = Math.ceil((bounds.maxZ - bounds.minZ) / step) + 1
  const index = (x: number, z: number) =>
    THREE.MathUtils.clamp(Math.round((z - bounds.minZ) / step), 0, rows - 1) * columns +
    THREE.MathUtils.clamp(Math.round((x - bounds.minX) / step), 0, columns - 1)
  const point = (key: number) => new THREE.Vector3(bounds.minX + (key % columns) * step, from.y, bounds.minZ + Math.floor(key / columns) * step)
  const clear = (x: number, z: number) =>
    x >= bounds.minX &&
    x <= bounds.maxX &&
    z >= bounds.minZ &&
    z <= bounds.maxZ &&
    !obstacles.some((box) => x > box.minX - clearance && x < box.maxX + clearance && z > box.minZ - clearance && z < box.maxZ + clearance)
  const segment = (a: THREE.Vector3, b: THREE.Vector3) => {
    const count = Math.max(1, Math.ceil(a.distanceTo(b) / 0.1))
    for (let i = 1; i <= count; i++) if (!clear(THREE.MathUtils.lerp(a.x, b.x, i / count), THREE.MathUtils.lerp(a.z, b.z, i / count))) return false
    return true
  }
  if (!clear(to.x, to.z)) return null
  if (segment(from, to)) return [from.clone(), to.clone()]
  const start = index(from.x, from.z)
  const goal = index(to.x, to.z)
  if (start === goal) return null
  const costs = new Float64Array(columns * rows).fill(Infinity)
  const scores = new Float64Array(columns * rows).fill(Infinity)
  const parents = new Int32Array(columns * rows).fill(-1)
  const closed = new Uint8Array(columns * rows)
  const open = new Set([start])
  costs[start] = 0
  scores[start] = point(start).distanceTo(to)
  while (open.size) {
    let current = -1
    for (const key of open) if (current < 0 || scores[key] < scores[current]) current = key
    if (current === goal) {
      const path = [to.clone()]
      for (let key = parents[goal]; key !== start; key = parents[key]) path.unshift(point(key))
      path.unshift(from.clone())
      const result = [path[0]]
      for (let i = 0; i < path.length - 1;) {
        let next = path.length - 1
        while (next > i + 1 && !segment(path[i], path[next])) next--
        result.push(path[next])
        i = next
      }
      return result
    }
    open.delete(current)
    closed[current] = 1
    const a = point(current)
    for (let dz = -1; dz <= 1; dz++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dz) continue
        const x = (current % columns) + dx
        const z = Math.floor(current / columns) + dz
        if (x < 0 || x >= columns || z < 0 || z >= rows) continue
        const next = z * columns + x
        if (closed[next]) continue
        const b = next === goal ? to : point(next)
        if (!segment(current === start ? from : a, b)) continue
        const cost = costs[current] + a.distanceTo(b)
        if (cost >= costs[next]) continue
        parents[next] = current
        costs[next] = cost
        scores[next] = cost + b.distanceTo(to)
        open.add(next)
      }
  }
  return null
}

export function groundPathLength(path: THREE.Vector3[]) {
  return path.slice(1).reduce((length, point, index) => length + point.distanceTo(path[index]), 0)
}

export function groundPathPoint(path: THREE.Vector3[], progress: number) {
  let distance = groundPathLength(path) * THREE.MathUtils.clamp(progress, 0, 1)
  for (let i = 1; i < path.length; i++) {
    const length = path[i - 1].distanceTo(path[i])
    if (distance <= length || i === path.length - 1)
      return {
        position: path[i - 1].clone().lerp(path[i], length ? Math.min(1, distance / length) : 1),
        heading: Math.atan2(path[i - 1].x - path[i].x, path[i - 1].z - path[i].z),
      }
    distance -= length
  }
  return { position: path[0].clone(), heading: 0 }
}

export type GroundWalker = { position: THREE.Vector3; heading: number; index: number; distance: number }

export function walkGroundPath(state: GroundWalker, path: THREE.Vector3[], dt: number, speed: number) {
  while (state.index < path.length && state.position.distanceTo(path[state.index]) < 0.00001) state.index++
  if (state.index >= path.length) return { moved: 0, complete: true }
  const target = path[state.index]
  const heading = Math.atan2(state.position.x - target.x, state.position.z - target.z)
  const turn = Math.atan2(Math.sin(heading - state.heading), Math.cos(heading - state.heading))
  state.heading += THREE.MathUtils.clamp(turn, -dt * 10, dt * 10)
  if (Math.abs(turn) > dt * 10 + 0.03) return { moved: 0, complete: false }
  const distance = state.position.distanceTo(target)
  const moved = Math.min(distance, Math.max(0, dt * speed))
  state.position.lerp(target, distance ? moved / distance : 1)
  state.distance += moved
  if (moved === distance) state.index++
  return { moved, complete: state.index >= path.length }
}
