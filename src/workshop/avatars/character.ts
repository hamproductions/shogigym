import * as THREE from 'three'
import { VRMSpringBoneCollider, VRMSpringBoneColliderShapeCapsule, VRMSpringBoneColliderShapeSphere, type VRM, type VRMHumanBoneName } from '@pixiv/three-vrm'
import { armChain, basisQuaternion, clamp01, damp, solveArm, type ArmChain } from './ik'

export const UNITS_PER_M = 1000 / 35.2

export type Seat = { x: number; z: number; floor: number; style: 'seiza' | 'chair'; tableY: number; tableEdge: number }

export type HandPose = Record<string, number[]>

export type Goal = { at: THREE.Vector3; finger: THREE.Vector3; palm: THREE.Vector3; curl: number; grip: boolean; hand: HandPose | null }

export type Character = ReturnType<typeof createCharacter>

const UP = new THREE.Vector3(0, 1, 0)
const AX = new THREE.Vector3(1, 0, 0)
const AY = new THREE.Vector3(0, 1, 0)
const AZ = new THREE.Vector3(0, 0, 1)
const rad = (deg: number) => (deg * Math.PI) / 180
const FINGERS = ['Index', 'Middle', 'Ring', 'Little'] as const
const JOINTS = ['Proximal', 'Intermediate', 'Distal'] as const

type Side = 'right' | 'left'

export const SEIZA = { hip: 66, ankle: 50, lift: 0.042 }
const KNEEL = 24

function fitSprings(vrm: VRM, k: number) {
  const manager = vrm.springBoneManager
  if (!manager) return
  const raw = (name: VRMHumanBoneName) => vrm.humanoid.getRawBoneNode(name)
  const colliders: VRMSpringBoneCollider[] = []
  const add = (name: VRMHumanBoneName, radius: number, tail?: VRMHumanBoneName) => {
    const node = raw(name)
    const end = tail && raw(tail)
    if (!node) return
    const collider = new VRMSpringBoneCollider(end ? new VRMSpringBoneColliderShapeCapsule({ radius, tail: end.position.clone() }) : new VRMSpringBoneColliderShapeSphere({ radius }))
    node.add(collider)
    colliders.push(collider)
  }
  add('hips', 0.11)
  add('spine', 0.11)
  add('chest', 0.11, 'upperChest')
  add('leftShoulder', 0.05, 'leftUpperArm')
  add('rightShoulder', 0.05, 'rightUpperArm')
  for (const side of ['left', 'right'] as const) {
    add(`${side}UpperLeg`, 0.075, `${side}LowerLeg`)
    add(`${side}LowerLeg`, 0.05, `${side}Foot`)
    add(`${side}UpperArm`, 0.045, `${side}LowerArm`)
  }
  const group = { colliders, name: 'seated' }
  for (const joint of manager.joints) {
    joint.colliderGroups = [...joint.colliderGroups, group]
    joint.settings.hitRadius *= k
    joint.settings.stiffness *= k
    joint.settings.gravityPower *= k
  }
  for (const collider of manager.colliders) {
    const shape = collider.shape as { radius?: number }
    if (shape.radius !== undefined) shape.radius *= k
  }
}

function goal(): Goal {
  return { at: new THREE.Vector3(), finger: new THREE.Vector3(), palm: new THREE.Vector3(), curl: 0, grip: false, hand: null }
}

export function createCharacter(vrm: VRM, seat: Seat, root: THREE.Object3D, height: number, random: () => number) {
  const holder = new THREE.Group()
  root.add(holder)
  holder.add(vrm.scene)
  const bone = (name: VRMHumanBoneName) => vrm.humanoid.getNormalizedBoneNode(name)!
  vrm.scene.updateMatrixWorld(true)
  const rest = (name: VRMHumanBoneName) => vrm.scene.worldToLocal(bone(name).getWorldPosition(new THREE.Vector3()))
  const box = new THREE.Box3().setFromObject(vrm.scene)
  const k = (height * UNITS_PER_M) / (box.max.y - box.min.y)
  vrm.scene.scale.setScalar(k)
  fitSprings(vrm, k)
  const s = Math.sign(rest('leftToes').z - rest('leftFoot').z) || 1
  const toBoard = new THREE.Vector3(-seat.x, 0, -seat.z).normalize()
  holder.rotation.y = Math.atan2(s * toBoard.x, s * toBoard.z)
  holder.position.set(seat.x, 0, seat.z)

  const sides = (['right', 'left'] as Side[]).map((side) => {
    const cap = side === 'right' ? 'right' : 'left'
    const hand = rest(`${cap}Hand`)
    const finger = rest(`${cap}MiddleProximal`).sub(hand).normalize()
    const grip = rest(`${cap}IndexDistal`).add(rest(`${cap}MiddleDistal`)).multiplyScalar(0.5).addScaledVector(finger, 0.014).sub(hand)
    const restQ = basisQuaternion(finger, new THREE.Vector3(0, -1, 0), new THREE.Quaternion()).invert()
    const curlSign = -Math.sign(finger.x) || 1
    const fingers = FINGERS.flatMap((f) => JOINTS.map((j) => bone(`${cap}${f}${j}`)))
    const pads = [[bone(`${cap}IndexIntermediate`), bone(`${cap}IndexDistal`)]]
    const thumb = (['Metacarpal', 'Proximal', 'Distal'] as const).map((j) => bone(`${cap}Thumb${j}`))
    const chain: ArmChain = armChain(bone(`${cap}UpperArm`), bone(`${cap}LowerArm`), bone(`${cap}Hand`))
    const keys = [...FINGERS.flatMap((f) => JOINTS.map((j) => `Right${f}${j}`)), ...['Proximal', 'Intermediate', 'Distal'].map((j) => `RightThumb${j}`)]
    return { side, chain, restQ, grip, curlSign, digits: [...fingers, ...thumb], keys, pads, sign: side === 'right' ? 1 : -1 }
  })

  const legs = (['left', 'right'] as const).map((side) => ({ upper: bone(`${side}UpperLeg`), lower: bone(`${side}LowerLeg`), foot: bone(`${side}Foot`), out: side === 'right' ? 1 : -1 }))
  const rightSign = Math.sign(rest('rightUpperLeg').x) || 1
  const qa = new THREE.Quaternion()
  const kneel = (rise: number) => SEIZA.hip + (KNEEL - SEIZA.hip) * rise
  const poseLegs = (rise: number) => {
    for (const leg of legs) {
      leg.upper.quaternion.setFromAxisAngle(AY, rad(leg.out * rightSign * s * 7)).multiply(qa.setFromAxisAngle(AX, -s * rad(kneel(rise))))
      leg.lower.quaternion.setFromAxisAngle(AX, s * rad(kneel(rise) + 90))
      leg.foot.quaternion.setFromAxisAngle(AX, s * rad(SEIZA.ankle))
    }
  }
  if (seat.style === 'seiza') poseLegs(0)
  for (const leg of legs) {
    const yaw = rad(leg.out * rightSign * s * 7)
    if (seat.style === 'chair') {
      leg.upper.quaternion.setFromAxisAngle(AY, yaw).multiply(qa.setFromAxisAngle(AX, -s * rad(84)))
      leg.lower.quaternion.setFromAxisAngle(AX, s * rad(96))
      leg.foot.quaternion.setFromAxisAngle(AX, -s * rad(10))
    }
  }
  holder.updateWorldMatrix(true, true)
  const local = (o: THREE.Object3D) => root.worldToLocal(o.getWorldPosition(new THREE.Vector3()))
  if (seat.style === 'seiza') {
    const low = Math.min(...legs.flatMap((l) => [local(l.lower).y, local(l.foot).y]))
    holder.position.y = seat.floor + SEIZA.lift * UNITS_PER_M - low
  } else {
    holder.position.y = seat.floor + 0.075 * UNITS_PER_M - local(legs[0].upper).y
  }
  holder.updateWorldMatrix(true, true)
  const reachOut = Math.min(...legs.map((l) => Math.abs(local(l.lower).z))) - 0.07 * UNITS_PER_M
  const clearance = seat.tableEdge + 0.06 * UNITS_PER_M - reachOut
  if (seat.style === 'seiza' && clearance > 0) holder.position.addScaledVector(new THREE.Vector3(0, 0, Math.sign(seat.z)), clearance)
  const seated = holder.position.clone()
  const away = new THREE.Vector3(seat.x, 0, seat.z).normalize()
  const recoil = seat.style === 'seiza' ? { back: 15, up: 0, lean: rad(-16) } : { back: 0.5, up: 0.3, lean: rad(-10) }

  const spine = [bone('spine'), bone('chest'), bone('upperChest')]
  const shoulder = bone('rightShoulder')
  const neck = bone('neck')
  const head = bone('head')
  const look = new THREE.Object3D()
  if (vrm.lookAt) {
    vrm.lookAt.target = look
    vrm.lookAt.autoUpdate = true
  }

  const fresh = () => ({
    reach: goal(),
    reachW: 0,
    side: 'right' as Side,
    think: 0,
    thinkTarget: 0,
    flinch: 0,
    flinchTarget: 0,
    stretch: 0,
    excess: 0,
    rise: 0,
    bow: 0,
    slump: 0,
    nod: 0,
    happy: 0,
    sad: 0,
    lookAt: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    lean: 0,
    twist: 0,
    blink: 0,
    nextBlink: 1 + random() * 3,
    time: random() * 10,
    pole: new THREE.Vector3(),
  })
  const state = fresh()

  const fwd = new THREE.Vector3()
  const right = new THREE.Vector3()
  const down = new THREE.Vector3(0, -1, 0)
  const tmp = new THREE.Vector3()
  const tmp2 = new THREE.Vector3()
  const pole = new THREE.Vector3()
  const wrist = new THREE.Vector3()
  const wristB = new THREE.Vector3()
  const tip = new THREE.Vector3()
  const digitQ = new THREE.Quaternion()
  const euler = new THREE.Euler(0, 0, 0, 'XYZ')
  const pinchAt = new THREE.Vector3()
  const handQ = new THREE.Quaternion()
  const handQB = new THREE.Quaternion()
  const idle = { right: goal(), left: goal() }
  const think = goal()
  const guard = { right: goal(), left: goal() }
  const worldQ = new THREE.Quaternion()

  const setGoal = (g: Goal, at: THREE.Vector3, finger: THREE.Vector3, palm: THREE.Vector3, curl: number, grip: boolean) => {
    g.at.copy(at)
    g.finger.copy(finger).normalize()
    g.palm.copy(palm).normalize()
    g.curl = curl
    g.grip = grip
    return g
  }

  const resolve = (side: (typeof sides)[number], g: Goal, outWrist: THREE.Vector3, outQ: THREE.Quaternion) => {
    const palm = tmp2.copy(g.palm).addScaledVector(g.finger, -g.palm.dot(g.finger))
    basisQuaternion(g.finger, palm, outQ).multiply(side.restQ)
    outWrist.copy(g.at)
    if (g.grip) outWrist.sub(tmp.copy(side.grip).applyQuaternion(outQ).multiplyScalar(k))
  }

  const hips0 = holder.worldToLocal(bone('hips').getWorldPosition(new THREE.Vector3()))
  const shoulder0 = rest('rightUpperArm').sub(rest('hips')).multiplyScalar(k)
  const armReach = (rest('rightLowerArm').distanceTo(rest('rightUpperArm')) + rest('rightHand').distanceTo(rest('rightLowerArm')) + rest('rightMiddleDistal').distanceTo(rest('rightHand'))) * k * 0.9
  const thigh = rest('leftLowerLeg').distanceTo(rest('leftUpperLeg')) * k
  const headUp = rest('head').sub(rest('hips')).y * k
  const edge = Math.abs(seated.z) - seat.tableEdge + 0.12 * UNITS_PER_M
  const riseShift = (rise: number) => ({ f: thigh * (Math.sin(rad(SEIZA.hip)) - Math.sin(rad(kneel(rise)))), u: thigh * (Math.cos(rad(kneel(rise))) - Math.cos(rad(SEIZA.hip))) })
  const reachPlan = () => {
    const p = holder.worldToLocal(tmp.copy(state.reach.at))
    let best = { lean: 0, rise: 0 }
    for (let lean = 0; lean < rad(80); lean += rad(2)) {
      const rise = seat.style === 'seiza' ? clamp01((lean - rad(20)) / rad(30)) * 0.75 : 0
      const shift = riseShift(rise)
      if (s * (hips0.z + s * shift.f) + headUp * Math.sin(lean) > edge) break
      best = { lean, rise }
      const q = tmp2.set(hips0.x + shoulder0.x, hips0.y + shift.u + shoulder0.y * Math.cos(lean), hips0.z + s * (shift.f + shoulder0.y * Math.sin(lean)))
      if (q.distanceTo(p) <= armReach) break
    }
    return { ...best, yaw: Math.atan2(s * p.x, s * p.z) }
  }

  const update = (dt: number) => {
    state.time += dt
    state.think = damp(state.think, state.thinkTarget, 5, dt)
    state.flinch = damp(state.flinch, state.flinchTarget, state.flinchTarget > state.flinch ? 14 : 2, dt)
    const r = state.reachW > 0.001 ? reachPlan() : { lean: 0, rise: 0, yaw: 0 }
    state.rise = damp(state.rise, r.rise * Math.min(1, state.reachW * 2.5), 12, dt)
    const shift = riseShift(state.rise)
    holder.position.copy(seated).addScaledVector(away, recoil.back * state.flinch - shift.f).addScaledVector(UP, recoil.up * state.flinch + shift.u)
    if (seat.style === 'seiza') poseLegs(state.rise)
    shoulder.quaternion.setFromAxisAngle(AY, -s * rad(14) * state.reachW).multiply(qa.setFromAxisAngle(AZ, rightSign * rad(6) * state.reachW))
    const reachLean = r.lean * Math.min(1, state.reachW * 2.5)
    state.stretch = state.reachW > 0.5 ? Math.min(rad(15), Math.max(0, state.stretch + Math.max(-1, Math.min(1, (state.excess + 0.06 * UNITS_PER_M) / (0.2 * UNITS_PER_M))) * dt * 3)) : damp(state.stretch, 0, 6, dt)
    const leanTarget = rad(seat.style === 'seiza' ? 7 : 5) + reachLean + state.stretch + state.bow * rad(38) + state.slump * rad(16) + state.think * rad(4) + recoil.lean * state.flinch
    state.lean = damp(state.lean, leanTarget, state.reachW > 0.05 ? 16 : 8, dt)
    state.twist = damp(state.twist, Math.max(-0.5, Math.min(0.5, r.yaw * 0.35)) * state.reachW, 10, dt)
    const breath = Math.sin(state.time * 1.7) * rad(1.2)
    spine.forEach((b, i) => b.quaternion.setFromAxisAngle(AY, state.twist / 3).multiply(qa.setFromAxisAngle(AX, s * state.lean * [0.42, 0.33, 0.25][i])))
    spine[1].quaternion.multiply(qa.setFromAxisAngle(AX, -s * breath))

    holder.updateWorldMatrix(true, false)
    neck.parent!.updateWorldMatrix(true, false)
    const neckAt = neck.getWorldPosition(tmp)
    const dir = tmp2.copy(look.position.copy(state.lookAt)).sub(neckAt).applyQuaternion(neck.parent!.getWorldQuaternion(worldQ).invert())
    const yaw = Math.max(-1, Math.min(1, Math.atan2(s * dir.x, s * dir.z)))
    const elev = Math.atan2(dir.y, Math.hypot(dir.x, dir.z))
    state.yaw = damp(state.yaw, yaw, 6, dt)
    state.pitch = damp(state.pitch, Math.max(-0.8, Math.min(0.5, -elev)), 6, dt)
    const pitch = state.pitch + state.nod * rad(16) + state.bow * rad(20) + state.slump * rad(24) + state.think * rad(6)
    neck.quaternion.setFromAxisAngle(AY, state.yaw * 0.4).multiply(qa.setFromAxisAngle(AX, s * pitch * 0.4))
    head.quaternion.setFromAxisAngle(AY, state.yaw * 0.6).multiply(qa.setFromAxisAngle(AX, s * pitch * 0.6)).multiply(qa.setFromAxisAngle(AZ, s * state.think * rad(8)))

    holder.updateWorldMatrix(true, true)
    holder.getWorldQuaternion(worldQ)
    fwd.set(0, 0, s).applyQuaternion(worldQ)
    right.set(rightSign, 0, 0).applyQuaternion(worldQ)

    for (const side of sides) {
      const g = idle[side.side]
      const leg = legs.find((l) => l.out === side.sign)!
      const hip = leg.upper.getWorldPosition(tmp)
      const knee = leg.lower.getWorldPosition(new THREE.Vector3())
      const at = knee.lerp(hip, seat.style === 'seiza' ? 0.58 : 0.45).addScaledVector(UP, 0.07 * UNITS_PER_M).addScaledVector(right, side.sign * 0.015 * UNITS_PER_M)
      setGoal(g, at, tmp2.copy(fwd).addScaledVector(down, 0.3).addScaledVector(right, side.sign * 0.08), down, 0.45, false)
    }

    const headAt = head.getWorldPosition(new THREE.Vector3())
    setGoal(think, headAt.addScaledVector(fwd, 0.075 * UNITS_PER_M).addScaledVector(UP, -0.115 * UNITS_PER_M).addScaledVector(right, 0.01 * UNITS_PER_M), tmp2.copy(UP).addScaledVector(fwd, 0.25).addScaledVector(right, -0.5), fwd.clone().negate().addScaledVector(right, -0.3), 0.75, false)

    for (const side of sides) setGoal(guard[side.side], head.getWorldPosition(wristB).addScaledVector(fwd, (seat.style === 'seiza' ? 0.2 : 0.12) * UNITS_PER_M).addScaledVector(UP, -0.1 * UNITS_PER_M).addScaledVector(right, side.sign * 0.12 * UNITS_PER_M), UP, fwd, 0.2, false)

    for (const side of sides) {
      resolve(side, idle[side.side], wrist, handQ)
      let curl = idle[side.side].curl
      let hand: HandPose | null = null
      let handW = 0
      if (side.side === 'right' && state.think > 0.001) {
        resolve(side, think, wristB, handQB)
        wrist.lerp(wristB, state.think)
        handQ.slerp(handQB, state.think)
        curl += (think.curl - curl) * state.think
      }
      if (state.flinch > 0.001) {
        resolve(side, guard[side.side], wristB, handQB)
        wrist.lerp(wristB, state.flinch)
        handQ.slerp(handQB, state.flinch)
        curl += (guard[side.side].curl - curl) * state.flinch
      }
      if (side.side === state.side && state.reachW > 0.001) {
        resolve(side, state.reach, wristB, handQB)
        wrist.lerp(wristB, state.reachW)
        handQ.slerp(handQB, state.reachW)
        curl += (state.reach.curl - curl) * state.reachW
        hand = state.reach.hand
        handW = state.reachW
      }
      pole.copy(right).multiplyScalar(side.sign * 0.8).addScaledVector(down, 0.7).addScaledVector(fwd, -0.25)
      if (side.side === state.side) state.pole.copy(pole)
      const excess = solveArm(side.chain, wrist, pole, handQ)
      if (side.side === state.side) state.excess = excess
      const mirror = side.side === 'right' ? 1 : -1
      side.digits.forEach((b, i) => {
        if (i < 12) digitQ.setFromAxisAngle(AZ, side.curlSign * curl * (1 + Math.floor(i / 3) * 0.18) * [0.55, 0.85, 0.6][i % 3])
        else digitQ.setFromAxisAngle(AY, -side.curlSign * s * curl * [0.35, 0.25, 0.2][i - 12])
        const e = hand?.[side.keys[i]]
        if (e) digitQ.slerp(qa.setFromEuler(euler.set(e[0], mirror * e[1], mirror * e[2])), handW)
        b.quaternion.slerp(digitQ, 1 - Math.exp(-dt * 18))
      })
      side.chain.hand.updateWorldMatrix(true, true)
      tip.set(0, 0, 0)
      for (const [mid, end] of side.pads) {
        const a = mid.getWorldPosition(tmp)
        const b = end.getWorldPosition(tmp2)
        tip.add(b).addScaledVector(b.sub(a), 0.7)
      }
      tip.divideScalar(side.pads.length)
      if (side.side === state.side) pinchAt.copy(tip)
      side.grip.copy(side.chain.hand.worldToLocal(tip))
    }

    state.nextBlink -= dt
    if (state.nextBlink < 0) {
      state.blink = 0.14
      state.nextBlink = 2 + random() * 4
    }
    state.blink = Math.max(0, state.blink - dt)
    const blink = state.blink > 0 ? Math.sin((state.blink / 0.14) * Math.PI) : 0
    const em = vrm.expressionManager
    if (em) {
      em.setValue('blink', Math.max(blink, state.sad * 0.25))
      em.setValue('happy', state.happy * 0.6)
      em.setValue('sad', state.sad * 0.6)
    }
    vrm.humanoid.update()
    vrm.scene.updateWorldMatrix(true, true)
    vrm.update(dt)
  }

  const headPosition = (out: THREE.Vector3) => head.getWorldPosition(out)

  const armBones = sides.map((side) => [side.chain.upper, side.chain.lower, side.chain.hand, side.pads[0][1]])
  const arms = (out: THREE.Vector3[]) => {
    armBones.flat().forEach((b, i) => b.getWorldPosition(out[i]))
    for (let i = 0; i < 8; i += 4) out[i + 1].lerp(out[i + 2], 0.1)
    for (let i = 0; i < 8; i += 4) out[i].copy(out[i + 1])
  }

  const wall = (flinch: number) => {
    const z = seated.z + Math.sign(seat.z) * recoil.back * flinch
    const front = (seat.style === 'seiza' ? 0.5 : 0.25) * UNITS_PER_M
    const back = 0.3 * UNITS_PER_M
    const [a, b] = [z - Math.sign(seat.z) * front, z + Math.sign(seat.z) * back]
    return { minX: seat.x - 0.3 * UNITS_PER_M, maxX: seat.x + 0.3 * UNITS_PER_M, minZ: Math.min(a, b), maxZ: Math.max(a, b) }
  }

  const reset = () => {
    Object.assign(state, fresh())
    for (const side of sides) for (const b of side.digits) b.quaternion.identity()
  }

  const settle = () => {
    for (const joint of vrm.springBoneManager?.joints ?? []) joint.center = holder
    vrm.springBoneManager?.reset()
  }

  const dispose = () => {
    holder.removeFromParent()
  }

  return { vrm, holder, state, update, headPosition, arms, pinch: () => pinchAt, wall, settle, reset, dispose, forward: () => fwd, right: () => right }
}
