import * as THREE from 'three'

export type ArmChain = {
  upper: THREE.Object3D
  lower: THREE.Object3D
  hand: THREE.Object3D
  upperRest: THREE.Vector3
  lowerRest: THREE.Vector3
  a: number
  b: number
}

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const shoulder = new THREE.Vector3()
const elbow = new THREE.Vector3()
const wristAt = new THREE.Vector3()
const q1 = new THREE.Quaternion()
const q2 = new THREE.Quaternion()
const m1 = new THREE.Matrix4()
const candidate = new THREE.Vector3()
const bend = new THREE.Vector3()
const obstacle = new THREE.Box3()

function penetration(from: THREE.Vector3, to: THREE.Vector3, box: THREE.Box3) {
  let near = 0
  let far = 1
  for (const axis of ['x', 'y', 'z'] as const) {
    const delta = to[axis] - from[axis]
    if (Math.abs(delta) < 1e-8) {
      if (from[axis] < box.min[axis] || from[axis] > box.max[axis]) return 0
      continue
    }
    const a = (box.min[axis] - from[axis]) / delta
    const b = (box.max[axis] - from[axis]) / delta
    near = Math.max(near, Math.min(a, b))
    far = Math.min(far, Math.max(a, b))
    if (far <= near) return 0
  }
  return (far - near) * from.distanceTo(to)
}

export function armChain(upper: THREE.Object3D, lower: THREE.Object3D, hand: THREE.Object3D): ArmChain {
  return {
    upper,
    lower,
    hand,
    upperRest: lower.position.clone().normalize(),
    lowerRest: hand.position.clone().normalize(),
    a: lower.position.length(),
    b: hand.position.length(),
  }
}

export function solveArm(chain: ArmChain, wrist: THREE.Vector3, pole: THREE.Vector3, handWorld: THREE.Quaternion, obstacles: THREE.Box3[] = []) {
  const parent = chain.upper.parent!
  parent.updateWorldMatrix(true, false)
  chain.upper.updateMatrixWorld()
  shoulder.setFromMatrixPosition(chain.upper.matrixWorld)
  const scale = v1.setFromMatrixScale(chain.upper.matrixWorld).x
  const a = chain.a * scale
  const b = chain.b * scale
  const dir = v2.subVectors(wrist, shoulder)
  const raw = dir.length()
  dir.divideScalar(raw || 1)
  const d = Math.min((a + b) * 0.999, Math.max(Math.abs(a - b) + 1e-3, raw))
  const cosA = Math.min(1, Math.max(-1, (a * a + d * d - b * b) / (2 * a * d)))
  const sinA = Math.sqrt(1 - cosA * cosA)
  const perp = v3.copy(pole).addScaledVector(dir, -pole.dot(dir))
  if (perp.lengthSq() < 1e-8) perp.set(0, -1, 0).addScaledVector(dir, -dir.y)
  perp.normalize()
  elbow
    .copy(shoulder)
    .addScaledVector(dir, cosA * a)
    .addScaledVector(perp, sinA * a)
  wristAt.copy(shoulder).addScaledVector(dir, d)
  if (obstacles.length) {
    const radius = (a + b) * 0.05
    const cost = (at: THREE.Vector3) =>
      obstacles.reduce((sum, box) => {
        obstacle.copy(box).expandByScalar(radius)
        return sum + penetration(shoulder, at, obstacle) + penetration(at, wristAt, obstacle)
      }, 0)
    let best = cost(elbow)
    bend.copy(perp)
    if (best > 0) {
      for (let step = 1; step <= 12; step++) {
        for (const sign of [1, -1]) {
          candidate
            .copy(bend)
            .applyAxisAngle(dir, (sign * step * Math.PI) / 12)
            .multiplyScalar(sinA * a)
            .addScaledVector(dir, cosA * a)
            .add(shoulder)
          const next = cost(candidate)
          if (next < best) {
            best = next
            elbow.copy(candidate)
          }
        }
        if (best < 1e-6) break
      }
    }
  }
  const parentQ = parent.getWorldQuaternion(q1)
  const local = v1.subVectors(elbow, shoulder).normalize().applyQuaternion(q2.copy(parentQ).invert())
  chain.upper.quaternion.setFromUnitVectors(chain.upperRest, local)
  parentQ.multiply(chain.upper.quaternion)
  const fore = v1.subVectors(wristAt, elbow).normalize().applyQuaternion(q2.copy(parentQ).invert())
  chain.lower.quaternion.setFromUnitVectors(chain.lowerRest, fore)
  parentQ.multiply(chain.lower.quaternion)
  chain.hand.quaternion.copy(parentQ.invert().multiply(handWorld))
  return raw - (a + b)
}

export function basisQuaternion(x: THREE.Vector3, hint: THREE.Vector3, out: THREE.Quaternion) {
  const ax = v1.copy(x).normalize()
  const az = v2.crossVectors(ax, hint).normalize()
  const ay = v3.crossVectors(az, ax)
  return out.setFromRotationMatrix(m1.makeBasis(ax, ay, az))
}

export const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
export const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt))
