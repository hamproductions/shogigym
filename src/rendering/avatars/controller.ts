import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import { Color } from 'tsshogi'
import { TABLE_H } from '@/utils/roomMetrics'
import { UNITS_PER_M, createCharacter, type Character, type HandPose, type Seat } from './character'
import handMotion from './handMotion.json'
import { clamp01, damp, ease } from './ik'
import { playSound } from '@/appearance/settings'
import { disposePiece } from '@/rendering/board3d/piece'
import {
  AVATAR_MODELS,
  type AvatarInspect,
  type AvatarPhase,
  type Knock,
  type MotionKind,
  type AvatarController,
  type AvatarCues,
  type AvatarMove,
  type AvatarOptions,
} from '.'

const mm = (n: number) => n / 35.2
const UP = new THREE.Vector3(0, 1, 0)
const GRIP_Y = 0.38
const REACH = 0.24
const CLOSE = 0.07
const CARRY = 0.22
const DOWN = 0.06
const STEP = REACH + CLOSE + CARRY + DOWN
const WITHDRAW = 0.4
const LIFT: Record<MotionKind, number> = { slide: 0.12, carry: 0.45, drop: 0.45, capture: 0.35, promote: 0.6 }
const MOTIONS = handMotion.moves as Record<MotionKind, { samples: HandPose[] }>
const SHAPES = {
  open: { Index: [8, 5, 4], Middle: [8, 5, 4], Ring: [40, 45, 28], Little: [50, 50, 32] },
  grip: { Index: [14, 7, 5], Middle: [10, 5, 3], Ring: [50, 55, 32], Little: [55, 55, 36] },
  press: { Index: [6, 3, 3], Middle: [12, 5, 3], Ring: [40, 45, 28], Little: [50, 50, 32] },
}
const MOCAP = 0
const PAD_DEPTH = 0.15

const topOf = (mesh: THREE.Object3D) => {
  if (mesh.userData.top !== undefined) return mesh.userData.top as number
  let top = 0
  mesh.traverse((o) => {
    const g = (o as THREE.Mesh).geometry
    if (!g) return
    if (!g.boundingBox) g.computeBoundingBox()
    top = Math.max(top, g.boundingBox!.max.y)
  })
  mesh.userData.top = top
  return top
}

type HandShape = keyof typeof SHAPES

function motion(kind: MotionKind, u: number, shape: HandShape, to: HandShape = shape, w = 0): HandPose {
  const { samples } = MOTIONS[kind]
  const x = clamp01(u) * (samples.length - 1)
  const i = Math.min(samples.length - 2, Math.floor(x))
  const f = x - i
  const sample = (key: string) => samples[i][key].map((v, k) => v + (samples[i + 1][key][k] - v) * f)
  return Object.fromEntries(
    Object.keys(samples[i]).map((key) => {
      const m = sample(key)
      const finger = /Right(Index|Middle|Ring|Little)(Proximal|Intermediate|Distal)/.exec(key)
      if (!finger) return [key, m.map((v) => v * 0.6)]
      const j = ['Proximal', 'Intermediate', 'Distal'].indexOf(finger[2])
      const a = SHAPES[shape][finger[1] as 'Index'][j]
      const bend = (-(a + (SHAPES[to][finger[1] as 'Index'][j] - a) * w) * Math.PI) / 180
      return [key, [m[0] * MOCAP, m[1] * MOCAP, bend + (m[2] - bend) * MOCAP]]
    }),
  )
}

type Step = {
  mesh: THREE.Object3D
  from: THREE.Vector3
  to: THREE.Vector3
  fromQ: THREE.Quaternion
  toQ: THREE.Quaternion | null
  flip: THREE.Object3D | null
  done: () => void
}

type Action = {
  kind: MotionKind
  steps: Step[]
  index: number
  t: number
  wait: number
  lock: THREE.Vector3 | null
  last: THREE.Vector3 | null
  sound: Knock | null
  land: (() => void) | null
  placed: THREE.Vector3 | null
}

type Actor = {
  color: Color
  char: Character
  casters: THREE.Mesh[]
  uniforms: Fade
  action: Action | null
  out: number
  glance: number
  nextGlance: number
  focus: THREE.Vector3 | null
  focusFor: number
  nod: number
  bow: number
  happyFor: number
}

type Fade = { fade: { value: THREE.Vector2 }; band: { value: THREE.Vector4 }; board: { value: THREE.Vector4 }; arms: { value: THREE.Vector3[] } }

const FADE_HEAD = [
  'uniform vec2 avatarFade;',
  'uniform vec4 avatarBand;',
  'uniform vec4 avatarBoard;',
  'uniform vec3 avatarArms[8];',
  'float avatarArm(vec3 p, int i, float w) {',
  '  if (w <= 0.0) return 1.0;',
  '  vec3 a = avatarArms[i + 1];',
  '  vec3 d = avatarArms[i + 2] - a;',
  '  float h = dot(p - a, d) / max(dot(d, d), 1e-4);',
  '  float fore = h < 0.0 ? 1.0 : max(smoothstep(w * 0.55, w, length(p - a - d * clamp(h, 0.0, 1.0))), 1.0 - smoothstep(0.0, 0.45, h));',
  '  vec3 b = avatarArms[i + 3] - avatarArms[i + 2];',
  '  float hand = smoothstep(w * 0.55, w, length(p - avatarArms[i + 2] - b * clamp(dot(p - avatarArms[i + 2], b) / max(dot(b, b), 1e-4), 0.0, 1.0)));',
  '  return min(fore, hand);',
  '}',
  'void main() {',
].join('\n')

const FADE_GLSL = [
  '#include <clipping_planes_fragment>',
  '  vec3 avatarW = cameraPosition + transpose(mat3(viewMatrix)) * (-vViewPosition);',
  '  float avatarBody = min(avatarArm(avatarW, 0, avatarBand.w), avatarArm(avatarW, 4, avatarBand.w));',
  '  if (avatarBand.z > 0.5 && !gl_FrontFacing) discard;',
  '  float avatarK = min(smoothstep(avatarFade.x, avatarFade.y, length(vViewPosition)), 1.0 - avatarBand.z * avatarBody);',
  '  float avatarOver = step(avatarBoard.x, avatarW.x) * step(avatarW.x, avatarBoard.y) * step(avatarBoard.z, avatarW.z) * step(avatarW.z, avatarBoard.w);',
  '  avatarK = min(avatarK, 1.0 - avatarBand.x * avatarOver * smoothstep(avatarBand.y, avatarBand.y + 1.5, avatarW.y));',
  '  if (avatarK < 0.999 && avatarK <= fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))))) discard;',
].join('\n')

function patchFade(material: THREE.Material, uniforms: Fade) {
  if (material.userData.avatarFade) return
  material.userData.avatarFade = uniforms
  const base = material.onBeforeCompile.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    base(shader, renderer)
    shader.uniforms.avatarFade = uniforms.fade
    shader.uniforms.avatarBand = uniforms.band
    shader.uniforms.avatarBoard = uniforms.board
    shader.uniforms.avatarArms = uniforms.arms
    const outline = (material as { isOutline?: boolean }).isOutline ? '\n  if (avatarBand.z > 0.5) discard;' : ''
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', FADE_HEAD).replace('#include <clipping_planes_fragment>', FADE_GLSL + outline)
  }
  const key = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${key()}|avatarFadeProximity`
}

async function loadVrm(loader: GLTFLoader, url: string, uniforms: Fade) {
  const gltf = await loader.loadAsync(url)
  const vrm = gltf.userData.vrm as VRM
  VRMUtils.removeUnnecessaryVertices(gltf.scene)
  VRMUtils.combineSkeletons(gltf.scene)
  vrm.scene.traverse((o) => {
    o.frustumCulled = false
    o.castShadow = (o as THREE.Mesh).isMesh === true
    o.receiveShadow = false
    const m = (o as THREE.Mesh).material
    if (m) for (const mat of Array.isArray(m) ? m : [m]) patchFade(mat, uniforms)
  })
  return vrm
}

function seats(options: AvatarOptions): Record<Color, Seat> {
  const { environment, dims } = options
  if (environment === 'casual') {
    const floor = -dims.thick - TABLE_H
    const z = mm(400) + mm(220) - 2 + 0.6
    const seat = (sign: number): Seat => ({ x: 0, z: sign * z, floor: floor + mm(440) + 0.75, style: 'chair', tableY: -dims.thick, tableEdge: mm(400) })
    return { [Color.BLACK]: seat(1), [Color.WHITE]: seat(-1) }
  }
  const floor = -dims.thick - dims.leg + 1.2
  const seat = (sign: number): Seat => ({ x: 0, z: sign * (dims.halfD + 12.5), floor, style: 'seiza', tableY: 0, tableEdge: dims.halfD })
  return { [Color.BLACK]: seat(1), [Color.WHITE]: seat(-1) }
}

export async function createAvatars(options: AvatarOptions): Promise<AvatarController> {
  const loader = new GLTFLoader()
  loader.register((parser) => new VRMLoaderPlugin(parser))
  const { root, camera } = options
  const random = options.random ?? Math.random
  let clock = 0
  const uniforms = AVATAR_MODELS.map((): Fade => ({
    fade: { value: new THREE.Vector2() },
    band: { value: new THREE.Vector4() },
    board: { value: new THREE.Vector4() },
    arms: { value: Array.from({ length: 8 }, () => new THREE.Vector3()) },
  }))
  const vrms = await Promise.all(AVATAR_MODELS.map((m, i) => loadVrm(loader, `${options.base}${m.file}`, uniforms[i])))
  const seat = seats(options)
  const boardHalf = new THREE.Vector2(options.dims.halfW + 1.2, options.dims.halfD + 1.2)
  const actors: Actor[] = AVATAR_MODELS.map((m, i) => {
    const char = createCharacter(vrms[i], seat[m.color], root, m.height, random)
    const casters: THREE.Mesh[] = []
    char.vrm.scene.traverse((o) => (o as THREE.Mesh).isMesh && casters.push(o as THREE.Mesh))
    return {
      color: m.color,
      char,
      casters,
      uniforms: uniforms[i],
      action: null,
      out: 1,
      glance: 0,
      nextGlance: 3 + random() * 5,
      focus: null,
      focusFor: 0,
      nod: 0,
      bow: 0,
      happyFor: 0,
    }
  })
  for (const a of actors) {
    a.char.state.lookAt.copy(root.localToWorld(new THREE.Vector3(0, 0, 0)))
    a.char.update(1 / 60)
    a.char.settle()
  }
  let cues: AvatarCues = { thinking: null, resigned: null, bowKey: '', nodKey: '', nodColor: null }
  const actorOf = (color: Color) => actors.find((a) => a.color === color)!
  const world = (p: THREE.Vector3) => root.localToWorld(p.clone())

  const knock = (action: Action) => {
    if (action.sound) playSound(action.sound)
    action.land?.()
    action.sound = null
    action.land = null
  }

  const finish = (step: Step) => {
    step.mesh.position.copy(step.to)
    step.mesh.visible = true
    step.mesh.rotation.z = 0
    if (step.toQ) step.mesh.quaternion.copy(step.toQ)
    if (step.flip) {
      step.flip.removeFromParent()
      disposePiece(step.flip)
      step.flip = null
    }
    step.done()
  }

  const release = (action: Action) => {
    for (const step of action.steps.slice(action.index)) finish(step)
    action.index = action.steps.length
    action.sound = null
    action.land = null
  }

  const gripAt = (actor: Actor, p: THREE.Vector3) => world(p).addScaledVector(UP, GRIP_Y).addScaledVector(actor.char.forward(), 0.12)

  const aim = (actor: Actor, at: THREE.Vector3, hand: HandPose | null) => {
    const g = actor.char.state.reach
    const f = at.clone().sub(actor.char.vrm.humanoid.getNormalizedBoneNode('rightUpperArm')!.getWorldPosition(new THREE.Vector3())).setY(0)
    if (f.lengthSq() < 1e-8) f.copy(actor.char.forward())
    f.normalize()
    const r = actor.char.right()
    g.at.copy(at)
    g.finger.copy(f).addScaledVector(UP, -0.42).addScaledVector(r, -0.1).normalize()
    g.palm.copy(UP).negate().addScaledVector(f, -0.15).normalize()
    g.curl = 0.3
    g.grip = true
    g.hand = hand
  }

  const arc = (u: number) => ease(Math.min(1, u / 0.3, (1 - u) / 0.3))

  const stepAction = (actor: Actor, dt: number) => {
    const action = actor.action
    const st = actor.char.state
    if (!action) {
      actor.out += dt
      const u = Math.min(1, actor.out / WITHDRAW)
      st.reachW = Math.min(st.reachW, 1 - ease(u))
      if (st.reachW > 0.001) st.reach.at.addScaledVector(UP, (dt / WITHDRAW) * 1.6 * (1 - u))
      return
    }
    actor.out = 0
    action.t += dt
    const t = action.t
    if (action.placed) {
      if (t >= REACH) knock(action)
      const u = clamp01(t / REACH)
      aim(actor, world(action.placed).addScaledVector(UP, GRIP_Y + 0.4 * (1 - ease(u))), motion('slide', 0.5 + u * 0.4, 'open', 'press', ease(u)))
      st.reachW = ease(u)
      actor.focus = world(action.placed)
      if (t > REACH + 0.12) actor.action = null
      return
    }
    const step = action.steps[action.index]
    if (!step || (step.mesh.userData.held && !step.mesh.parent)) {
      release(action)
      actor.action = null
      return
    }
    const from = gripAt(actor, step.from)
    const to = gripAt(actor, step.to)
    const prog = (action.index + t / STEP) / action.steps.length
    const carryU = clamp01((t - REACH - CLOSE) / CARRY)
    const hand =
      t < REACH
        ? motion(action.kind, prog, 'open')
        : t < REACH + CLOSE
          ? motion(action.kind, prog, 'open', 'grip', ease((t - REACH) / CLOSE))
          : t < REACH + CLOSE + CARRY
            ? motion(action.kind, prog, 'grip', 'press', ease(clamp01((carryU - 0.7) / 0.3)))
            : motion(action.kind, prog, 'press')
    actor.focus = world(step.mesh.position)
    if (t < REACH) {
      const u = t / REACH
      if (action.last)
        aim(
          actor,
          action.last
            .clone()
            .lerp(from, ease(u))
            .addScaledVector(UP, 0.6 * Math.sin(Math.PI * u)),
          hand,
        )
      else {
        aim(
          actor,
          from
            .clone()
            .addScaledVector(UP, 0.5 * (1 - ease(u)))
            .addScaledVector(actor.char.forward(), -0.4 * (1 - ease(u))),
          hand,
        )
        st.reachW = ease(u)
      }
      return
    }
    st.reachW = 1
    if (t >= REACH + CLOSE && !action.lock && action.wait < 0.25 && actor.char.pinch().distanceTo(from) > 0.3) {
      action.wait += dt
      action.t = REACH + CLOSE - 1e-4
      aim(actor, from, hand)
      return
    }
    if (t < REACH + CLOSE) {
      aim(actor, from.addScaledVector(UP, -0.03 * Math.sin((Math.PI * (t - REACH)) / CLOSE)), hand)
      return
    }
    if (t < REACH + CLOSE + CARRY) {
      const u = (t - REACH - CLOSE) / CARRY
      aim(actor, from.lerp(to, ease(u)).addScaledVector(UP, LIFT[action.kind] * arc(u)), hand)
      if (step.toQ) step.mesh.quaternion.slerpQuaternions(step.fromQ, step.toQ, ease(u))
      if (step.flip) {
        step.flip.visible = true
        step.mesh.visible = false
        step.flip.rotation.z = Math.PI * ease(u)
        step.flip.userData.turn = ease(u)
      }
      return
    }
    if (t < STEP) {
      aim(actor, to.addScaledVector(UP, -0.03 * Math.sin((Math.PI * (t - REACH - CLOSE - CARRY)) / DOWN)), hand)
      return
    }
    finish(step)
    action.index++
    action.t = 0
    action.wait = 0
    action.lock = null
    action.last = to
    if (action.index < action.steps.length) return
    knock(action)
    actor.action = null
  }

  const pinchAt = new THREE.Vector3()
  const hold = new THREE.Vector3()
  const attach = (actor: Actor, dt: number) => {
    const action = actor.action
    const step = action?.steps[action.index]
    if (!action || !step || action.t < REACH + CLOSE) return
    const reached = clamp01(1.5 - actor.char.pinch().distanceTo(actor.char.state.reach.at) / 0.6)
    const pinch = root.worldToLocal(pinchAt.copy(actor.char.state.reach.at).lerp(actor.char.pinch(), reached))
    action.lock ??= step.mesh.position.clone().sub(pinch)
    action.lock.lerp(hold.set(0, -topOf(step.mesh) - PAD_DEPTH, 0), 1 - Math.exp(-dt * 30))
    step.mesh.position.copy(pinch).add(action.lock)
    step.flip?.position.copy(step.mesh.position)
    if (step.flip) step.flip.position.y += topOf(step.flip) * (step.flip.userData.turn ?? 0)
  }

  const playMove = (move: AvatarMove) => {
    const actor = actorOf(move.color)
    if (actor.action) release(actor.action)
    for (const other of actors)
      if (other.action?.steps.some((step) => step.mesh === move.mesh)) {
        release(other.action)
        other.action = null
      }
    const action: Action = {
      kind: move.kind,
      steps: [],
      index: 0,
      t: 0,
      wait: 0,
      lock: null,
      last: null,
      sound: move.sound ?? null,
      land: move.land ?? null,
      placed: move.placed ? move.to.clone() : null,
    }
    if (!move.placed) {
      const capture = move.capture
      if (capture) {
        const clone = capture.mesh
        clone.position.copy(move.to)
        root.add(clone)
        if (capture.hide) capture.hide.visible = false
        action.steps.push({
          mesh: clone,
          from: move.to.clone(),
          to: capture.hide?.position.clone() ?? capture.to.clone(),
          fromQ: clone.quaternion.clone(),
          toQ: capture.hide?.quaternion.clone() ?? null,
          flip: null,
          done: () => {
            clone.removeFromParent()
            disposePiece(clone)
            if (capture.hide) capture.hide.visible = true
            playSound('komadai')
          },
        })
      }
      move.mesh.userData.held = true
      move.mesh.userData.heldAt = performance.now()
      move.mesh.position.copy(move.from)
      const flip = move.flip ?? null
      if (flip) {
        flip.position.copy(move.from)
        flip.visible = true
        move.mesh.visible = false
        root.add(flip)
      }
      action.steps.push({
        mesh: move.mesh,
        from: move.from.clone(),
        to: move.to.clone(),
        fromQ: move.mesh.quaternion.clone(),
        toQ: null,
        flip,
        done: () => {
          move.mesh.userData.held = false
        },
      })
    }
    actor.action = action
    const other = actors.find((a) => a !== actor)
    if (other) {
      other.focus = world(move.to)
      other.focusFor = 1.6
    }
  }

  const cue = (next: AvatarCues) => {
    if (next.bowKey && next.bowKey !== cues.bowKey) for (const a of actors) a.bow = 1.8
    if (next.nodKey && next.nodKey !== cues.nodKey && next.nodColor !== null) {
      const a = actorOf(next.nodColor)
      a.nod = 0.9
      a.happyFor = 1.6
    }
    cues = next
  }

  const target = new THREE.Vector3()
  const rootAt = new THREE.Vector3()
  const camAt = new THREE.Vector3()
  const update = (dt: number, flip: number, orbit: boolean) => {
    const flinch = flip !== 0
    clock += dt
    if (flinch)
      for (const actor of actors)
        if (actor.action) {
          release(actor.action)
          actor.action = null
        }
    root.updateWorldMatrix(true, false)
    root.getWorldPosition(rootAt)
    const distance = camera.position.distanceTo(rootAt)
    const cam = root.worldToLocal(camAt.copy(camera.position))
    for (const actor of actors) {
      const side = actor.color === Color.BLACK ? 1 : -1
      actor.char.headPosition(target)
      const proximity = 1 - THREE.MathUtils.smoothstep(camera.position.distanceTo(target), 0.4 * UNITS_PER_M, 1.2 * UNITS_PER_M)
      const facing = THREE.MathUtils.smoothstep((cam.z * side) / Math.max(1e-3, cam.length()), 0, 0.012)
      const near = orbit ? proximity : Math.max(proximity, facing)
      actor.uniforms.fade.value.set(distance * 0.22, distance * 0.34)
      const top = orbit ? 0 : THREE.MathUtils.smoothstep(cam.y / Math.max(1e-3, cam.length()), 0.78, 0.9)
      actor.uniforms.band.value.set(top, rootAt.y + 0.16 * UNITS_PER_M, near, actor.char.state.reachW > 0.02 ? 0.085 * UNITS_PER_M : 0)
      actor.uniforms.board.value.set(rootAt.x - boardHalf.x, rootAt.x + boardHalf.x, rootAt.z - boardHalf.y, rootAt.z + boardHalf.y)
      const shadows = near < 0.5 && top < 0.5
      if (actor.casters[0]?.castShadow !== shadows) for (const m of actor.casters) m.castShadow = shadows
      const st = actor.char.state
      st.flinchTarget = flinch ? ((actor.color === Color.BLACK) === flip > 0 ? 0.4 : 1) : 0
      stepAction(actor, dt)
      const busy = !!actor.action
      st.thinkTarget = cues.thinking === actor.color && !busy && st.reachW < 0.3 ? 1 : 0
      st.slump = damp(st.slump, cues.resigned === actor.color ? 1 : 0, 3, dt)
      st.sad = damp(st.sad, cues.resigned === actor.color ? 1 : 0, 3, dt)
      actor.happyFor = Math.max(0, actor.happyFor - dt)
      st.happy = damp(st.happy, actor.happyFor > 0 ? 1 : 0, 6, dt)
      if (actor.bow > 0) {
        actor.bow = Math.max(0, actor.bow - dt)
        const u = 1 - actor.bow / 1.8
        st.bow = Math.sin(Math.PI * clamp01(u * 1.1)) ** 2
      } else st.bow = 0
      if (actor.nod > 0) {
        actor.nod = Math.max(0, actor.nod - dt)
        const u = 1 - actor.nod / 0.9
        st.nod = Math.max(0, Math.sin(u * Math.PI * 2)) * (1 - u * 0.5)
      } else st.nod = 0
      actor.focusFor = Math.max(0, actor.focusFor - dt)
      actor.nextGlance -= dt
      if (actor.nextGlance < 0 && !busy && st.thinkTarget === 0) {
        actor.glance = 1.3
        actor.nextGlance = 4 + random() * 6
      }
      actor.glance = Math.max(0, actor.glance - dt)
      const opponent = actors.find((a) => a !== actor)
      if (busy && actor.focus) target.copy(actor.focus)
      else if (actor.focusFor > 0 && actor.focus) target.copy(actor.focus)
      else if (actor.glance > 0 && opponent && cues.resigned === null) opponent.char.headPosition(target)
      else {
        const wander = Math.sin(clock / 2.3 + actor.color.length) * 1.6
        target.copy(root.localToWorld(new THREE.Vector3(wander, 0, actor.color === Color.BLACK ? 1.2 : -1.2)))
      }
      st.lookAt.lerp(target, 1 - Math.exp(-dt * 8))
      actor.char.update(dt)
      actor.char.arms(actor.uniforms.arms.value)
      for (const v of actor.uniforms.arms.value.slice(4)) v.setScalar(1e6)
      attach(actor, dt)
    }
  }

  const dispose = () => {
    for (const actor of actors) {
      if (actor.action) release(actor.action)
      actor.char.dispose()
      VRMUtils.deepDispose(actor.char.vrm.scene)
    }
  }

  const reset = () => {
    clock = 0
    for (const actor of actors) {
      if (actor.action) release(actor.action)
      for (const step of actor.action?.steps ?? []) for (const o of [step.flip, step.mesh]) if (o?.parent === root) o.removeFromParent()
      Object.assign(actor, { action: null, out: 1, glance: 0, nextGlance: 3 + random() * 5, focus: null, focusFor: 0, nod: 0, bow: 0, happyFor: 0 })
      actor.char.reset()
      actor.char.state.lookAt.copy(root.localToWorld(new THREE.Vector3(0, 0, 0)))
      actor.char.update(1 / 60)
      actor.char.settle()
    }
  }

  const phase = (actor: Actor): AvatarPhase => {
    const action = actor.action
    if (!action) return actor.char.state.reachW > 0.01 ? 'withdraw' : 'idle'
    const t = action.t
    return t < REACH ? 'reach' : t < REACH + CLOSE ? 'grip' : t < REACH + CLOSE + CARRY * 0.85 ? 'carry' : t < REACH + CLOSE + CARRY ? 'place' : 'press'
  }

  const inspect = (): AvatarInspect[] =>
    actors.map((actor) => {
      const action = actor.action
      const step = action?.steps[action.index]
      const st = actor.char.state
      const hand = actor.char.vrm.humanoid.getNormalizedBoneNode('rightHand')!
      const applied = Object.fromEntries(
        ['Index', 'Middle', 'Ring', 'Little'].flatMap((f) =>
          ['Proximal', 'Intermediate', 'Distal'].map((j) => [
            `Right${f}${j}`,
            new THREE.Euler()
              .setFromQuaternion(actor.char.vrm.humanoid.getNormalizedBoneNode(`right${f}${j}` as never)!.quaternion)
              .toArray()
              .slice(0, 3) as number[],
          ]),
        ),
      )
      return {
        color: actor.color,
        phase: phase(actor),
        kind: action?.kind ?? null,
        t: action?.t ?? 0,
        sample: action ? ((action.index + action.t / STEP) / action.steps.length) * (MOTIONS[action.kind].samples.length - 1) : -1,
        target: st.reach.at.clone(),
        pole: st.pole.clone(),
        pinch: actor.char.pinch().clone(),
        piece: step ? world(step.mesh.position) : null,
        hand,
        pose: st.reach.hand,
        applied,
      }
    })

  const walls = () => actors.map((a) => a.char.wall(a.color === Color.WHITE ? 1 : 0.4))

  const swap = (from: THREE.Object3D, to: THREE.Object3D) => {
    for (const actor of actors)
      for (const step of actor.action?.steps ?? [])
        if (step.mesh === from) {
          step.mesh = to
          to.userData.held = true
          to.userData.heldAt = performance.now()
          to.position.copy(from.position)
          to.quaternion.copy(from.quaternion)
          to.visible = from.visible
        }
  }

  return { playMove, cue, update, walls, swap, reset, inspect, dispose }
}
