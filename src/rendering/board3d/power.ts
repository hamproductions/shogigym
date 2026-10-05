import * as THREE from 'three'
import { Color, type ImmutablePosition, type PieceType } from 'tsshogi'
import { hasLegalMove } from '@/utils/shogi'
import { playSound } from '@/appearance/settings'
import { squareX, squareZ } from './dimensions'
import { pieceMesh } from './piece'
import { glowTexture, loadBrush, ringTexture, stampTexture } from './powerTextures'

export type PowerSquare = { file: number; rank: number }
export type PowerMove = {
  to: PowerSquare
  color: Color
  capture?: { type: PieceType; color: Color } | null
  check?: PowerSquare | null
  mate?: boolean
  promoted?: boolean
  delay?: number
  carried?: boolean
}
export type PowerContext = { scene: THREE.Scene; root: THREE.Object3D; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer }
export type Power = {
  onMove: (move: PowerMove) => void
  update: (dt: number) => void
  applyCamera: () => () => void
  timeScale: () => number
  dim: () => number
  clear: () => void
  dispose: () => void
}

type Fx = { t0: number; real: boolean; f: number; dur: number; tick: (t: number, f: number) => void; done?: () => void }
type Frame = {
  dim: number
  red: number
  flash: number
  invert: boolean
  scale: number
  light: { at: THREE.Vector3; color: number; power: number } | null
  orbit: { at: THREE.Vector3; w: number; angle: number; zoom: number } | null
}
type SparkOptions = {
  speed: number
  up?: number
  color: number
  color2?: number
  size: number
  life: number
  gravity?: number
  drag?: number
  flat?: boolean
  spread?: number
}

const SPARKS = 1800
const DEBRIS = 120
const UP = new THREE.Vector3(0, 1, 0)

const local = (sq: PowerSquare, y = 0) => new THREE.Vector3(squareX(sq.file), y, squareZ(sq.rank))
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeOut = (x: number) => 1 - (1 - clamp01(x)) ** 3
const smooth = (x: number) => clamp01(x) * clamp01(x) * (3 - 2 * clamp01(x))
const envelope = (t: number, a: number, b: number, c: number, d: number) =>
  t <= a || t >= d ? 0 : t < b ? (t - a) / (b - a) : t <= c ? 1 : 1 - (t - c) / (d - c)
const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const board3 = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

export function moveEvent(prev: ImmutablePosition, position: ImmutablePosition, usi?: string): PowerMove | null {
  if (!usi) return null
  const next = prev.clone()
  const move = next.createMoveByUSI(usi)
  if (!move || !next.doMove(move) || board3(next.sfen) !== board3(position.sfen)) return null
  const victim = prev.board.at(move.to)
  const king = position.checked ? position.board.findKing(position.color) : undefined
  return {
    to: move.to,
    color: move.color,
    capture: victim ? { type: victim.type, color: victim.color } : null,
    check: king ?? null,
    mate: !!king && !hasLegalMove(position),
    promoted: move.promote,
  }
}

const sparkVertex = `
attribute vec3 aColor;
attribute float aSize;
attribute float aAlpha;
uniform float uScale;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = aColor;
  vAlpha = aAlpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aAlpha > 0.0 ? aSize * uScale / -mv.z : 0.0;
  gl_Position = projectionMatrix * mv;
}`

const sparkFragment = `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(mix(vColor, vec3(1.0), smoothstep(0.22, 0.0, d) * 0.8), a * a * vAlpha);
}`

function sparkField() {
  const position = new Float32Array(SPARKS * 3)
  const color = new Float32Array(SPARKS * 3)
  const size = new Float32Array(SPARKS)
  const alpha = new Float32Array(SPARKS)
  const velocity = new Float32Array(SPARKS * 3)
  const life = new Float32Array(SPARKS)
  const span = new Float32Array(SPARKS)
  const gravity = new Float32Array(SPARKS)
  const drag = new Float32Array(SPARKS)
  const base = new Float32Array(SPARKS)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(color, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1))
  const material = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 400 } },
    vertexShader: sparkVertex,
    fragmentShader: sparkFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.renderOrder = 20
  const c1 = new THREE.Color()
  const c2 = new THREE.Color()
  let next = 0
  let alive = 0
  const spawn = (at: THREE.Vector3, n: number, o: SparkOptions) => {
    c1.set(o.color)
    c2.set(o.color2 ?? o.color)
    for (let k = 0; k < n; k++) {
      const i = next
      next = (next + 1) % SPARKS
      const theta = Math.random() * Math.PI * 2
      const y = o.flat ? Math.random() * 0.35 : Math.random() * 2 - 1
      const r = Math.sqrt(1 - y * y)
      const speed = o.speed * (0.35 + 0.65 * Math.random())
      const spread = o.spread ?? 0.25
      position.set([at.x + (Math.random() - 0.5) * spread, at.y + Math.random() * 0.1, at.z + (Math.random() - 0.5) * spread], i * 3)
      velocity.set([Math.cos(theta) * r * speed, Math.abs(y) * speed + (o.up ?? 0) * Math.random(), Math.sin(theta) * r * speed], i * 3)
      const mix = Math.random()
      color.set([c1.r + (c2.r - c1.r) * mix, c1.g + (c2.g - c1.g) * mix, c1.b + (c2.b - c1.b) * mix], i * 3)
      span[i] = life[i] = o.life * (0.5 + Math.random() * 0.7)
      base[i] = o.size * (0.6 + Math.random() * 0.8)
      gravity[i] = o.gravity ?? 9
      drag[i] = o.drag ?? 1.5
      alpha[i] = 1
      size[i] = base[i]
    }
    alive = SPARKS
  }
  const step = (dt: number) => {
    if (!alive) return
    let count = 0
    for (let i = 0; i < SPARKS; i++) {
      if (life[i] <= 0) continue
      life[i] -= dt
      if (life[i] <= 0) {
        alpha[i] = 0
        continue
      }
      count++
      const j = i * 3
      const keep = Math.exp(-drag[i] * dt)
      velocity[j + 1] -= gravity[i] * dt
      velocity[j] *= keep
      velocity[j + 1] *= keep
      velocity[j + 2] *= keep
      position[j] += velocity[j] * dt
      position[j + 1] += velocity[j + 1] * dt
      position[j + 2] += velocity[j + 2] * dt
      if (position[j + 1] < 0.03 && velocity[j + 1] < 0 && gravity[i] > 0) {
        position[j + 1] = 0.03
        velocity[j + 1] *= -0.35
        velocity[j] *= 0.6
        velocity[j + 2] *= 0.6
      }
      const k = life[i] / span[i]
      alpha[i] = Math.min(1, k * 1.6)
      size[i] = base[i] * (0.35 + 0.65 * k)
    }
    alive = count
    for (const name of ['position', 'aAlpha', 'aSize', 'aColor']) geometry.getAttribute(name).needsUpdate = true
  }
  const reset = () => {
    life.fill(0)
    alpha.fill(0)
    geometry.getAttribute('aAlpha').needsUpdate = true
    alive = 0
  }
  return { points, spawn, step, reset, material }
}

function debrisField() {
  const geometry = new THREE.BoxGeometry(0.16, 0.05, 0.1)
  const material = new THREE.MeshStandardMaterial({ color: 0xd9a865, emissive: 0x5a3810, emissiveIntensity: 0.4, roughness: 0.75 })
  const mesh = new THREE.InstancedMesh(geometry, material, DEBRIS)
  mesh.frustumCulled = false
  const pos = Array.from({ length: DEBRIS }, () => new THREE.Vector3())
  const vel = Array.from({ length: DEBRIS }, () => new THREE.Vector3())
  const rot = Array.from({ length: DEBRIS }, () => new THREE.Euler())
  const spin = Array.from({ length: DEBRIS }, () => new THREE.Vector3())
  const life = new Float32Array(DEBRIS)
  const scale = new Float32Array(DEBRIS)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3()
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0)
  for (let i = 0; i < DEBRIS; i++) mesh.setMatrixAt(i, hidden)
  let next = 0
  let alive = 0
  const spawn = (at: THREE.Vector3, n: number, power: number) => {
    for (let k = 0; k < n; k++) {
      const i = next
      next = (next + 1) % DEBRIS
      const a = Math.random() * Math.PI * 2
      const sp = power * (0.4 + Math.random() * 0.8)
      pos[i].set(at.x + (Math.random() - 0.5) * 0.4, at.y + 0.15, at.z + (Math.random() - 0.5) * 0.4)
      vel[i].set(Math.cos(a) * sp, power * (0.6 + Math.random() * 0.9), Math.sin(a) * sp)
      rot[i].set(Math.random() * 6, Math.random() * 6, Math.random() * 6)
      spin[i].set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30)
      life[i] = 1.2 + Math.random() * 0.8
      scale[i] = 0.5 + Math.random() * 1.1
    }
    alive = DEBRIS
  }
  const step = (dt: number) => {
    if (!alive) return
    let count = 0
    for (let i = 0; i < DEBRIS; i++) {
      if (life[i] <= 0) continue
      life[i] -= dt
      if (life[i] <= 0) {
        mesh.setMatrixAt(i, hidden)
        continue
      }
      count++
      vel[i].y -= 22 * dt
      pos[i].addScaledVector(vel[i], dt)
      if (pos[i].y < 0.03 && vel[i].y < 0) {
        pos[i].y = 0.03
        vel[i].y *= -0.3
        vel[i].x *= 0.55
        vel[i].z *= 0.55
        spin[i].multiplyScalar(0.5)
      }
      rot[i].x += spin[i].x * dt
      rot[i].y += spin[i].y * dt
      rot[i].z += spin[i].z * dt
      const k = scale[i] * Math.min(1, life[i] * 3)
      mesh.setMatrixAt(i, m.compose(pos[i], q.setFromEuler(rot[i]), s.set(k, k, k)))
    }
    alive = count
    mesh.instanceMatrix.needsUpdate = true
  }
  const reset = () => {
    life.fill(0)
    for (let i = 0; i < DEBRIS; i++) mesh.setMatrixAt(i, hidden)
    mesh.instanceMatrix.needsUpdate = true
    alive = 0
  }
  return { mesh, spawn, step, reset, geometry, material }
}

const beamVertex = `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`

const beamFragment = `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uGrow;
uniform float uFromTop;
uniform float uFade;
uniform float uFlow;
uniform float uTime;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  float g = uFromTop > 0.5 ? 1.0 - vUv.y : vUv.y;
  if (g > uGrow) discard;
  float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.8);
  float along = mix(1.0, pow(1.0 - vUv.y, 1.4), uFade);
  float flow = mix(1.0, 0.45 + 0.55 * sin(vUv.y * 46.0 - uTime * 22.0), uFlow);
  float a = edge * along * flow * uOpacity;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), edge * edge * 0.55), a);
}`

const beamGeometry = new THREE.CylinderGeometry(1, 1, 1, 40, 1, true).translate(0, 0.5, 0)

function beam(color: number, radius: number, o: { fromTop?: boolean; fade?: boolean; flow?: boolean }) {
  const group = new THREE.Group()
  const layers = [
    { r: radius, color },
    { r: radius * 0.32, color: 0xffffff },
  ].map(({ r, color: c }) => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(c) },
        uOpacity: { value: 0 },
        uGrow: { value: 0 },
        uFromTop: { value: o.fromTop ? 1 : 0 },
        uFade: { value: o.fade ? 1 : 0 },
        uFlow: { value: o.flow ? 1 : 0 },
        uTime: { value: 0 },
      },
      vertexShader: beamVertex,
      fragmentShader: beamFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(beamGeometry, material)
    mesh.renderOrder = 15
    mesh.frustumCulled = false
    group.add(mesh)
    return { mesh, r, material }
  })
  return {
    group,
    length: (len: number) => layers.forEach(({ mesh, r }) => mesh.scale.set(r, len, r)),
    set: (opacity: number, grow: number, time: number) =>
      layers.forEach(({ material }, i) => {
        material.uniforms.uOpacity.value = opacity * (i ? 1.4 : 1)
        material.uniforms.uGrow.value = grow
        material.uniforms.uTime.value = time
      }),
    dispose: () => layers.forEach(({ material }) => material.dispose()),
  }
}

const vignetteFragment = `
uniform float uDim;
uniform float uRed;
varying vec2 vUv;
void main() {
  float r = length((vUv - 0.5) * vec2(1.0, 1.15)) * 1.5;
  float a = uDim * mix(0.35, 1.0, smoothstep(0.25, 1.05, r));
  gl_FragColor = vec4(mix(vec3(0.0), vec3(0.45, 0.0, 0.02), uRed * smoothstep(0.35, 1.0, r)), a);
}`

const hudVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

export function createPower(ctx: PowerContext): Power {
  const { scene, root, camera, renderer } = ctx
  const baseExposure = renderer.toneMappingExposure
  const fx = new THREE.Group()
  root.add(fx)
  const hud = new THREE.Group()
  scene.add(hud)
  const glowMap = glowTexture()
  const ringMap = ringTexture()
  const sparks = sparkField()
  const debris = debrisField()
  fx.add(sparks.points, debris.mesh)
  const light = new THREE.PointLight(0xffffff, 0, 14, 1.6)
  fx.add(light)
  const plane = new THREE.PlaneGeometry(1, 1)
  const floorPlane = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2)
  const hudMat = (m: THREE.Material, order: number) => {
    const mesh = new THREE.Mesh(plane, m)
    mesh.renderOrder = order
    mesh.frustumCulled = false
    mesh.position.z = -1
    mesh.visible = false
    hud.add(mesh)
    return mesh
  }
  const vignette = hudMat(
    new THREE.ShaderMaterial({
      uniforms: { uDim: { value: 0 }, uRed: { value: 0 } },
      vertexShader: hudVertex,
      fragmentShader: vignetteFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
    900,
  )
  const flash = hudMat(
    new THREE.MeshBasicMaterial({
      color: 0xfff6e8,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
    }),
    950,
  )
  const invert = hudMat(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneMinusDstColorFactor,
      blendDst: THREE.ZeroFactor,
    }),
    960,
  )
  const stamps = new Map<string, THREE.Texture>()
  const stampSpecs: Record<string, [string, string]> = { 王手: ['#ff3b2a', 'rgba(255,40,20,0.9)'], 詰み: ['#ffd66b', 'rgba(255,60,20,0.95)'] }
  let disposed = false
  void loadBrush().then(() => {
    if (disposed) return
    for (const [text, [fill, glow]] of Object.entries(stampSpecs)) {
      stamps.get(text)?.dispose()
      stamps.set(text, stampTexture(text, fill, glow))
    }
  })
  const stampMap = (text: string) => {
    let map = stamps.get(text)
    if (!map) stamps.set(text, (map = stampTexture(text, ...stampSpecs[text])))
    return map
  }

  let real = 0
  let sim = 0
  let scale = 1
  let dimNow = 0
  let trauma = 0
  let punches: { t0: number; amp: number }[] = []
  let effects: Fx[] = []
  let queue: { at: number; move: PowerMove }[] = []
  let frame: Frame = { dim: 0, red: 0, flash: 0, invert: false, scale: 1, light: null, orbit: null }
  let check: { stop: boolean } | null = null

  const add = (dur: number, tick: Fx['tick'], o: { real?: boolean; done?: () => void } = {}) => {
    const entry: Fx = { t0: o.real ? real : sim, real: !!o.real, f: -1, dur, tick, done: o.done }
    effects.push(entry)
    return entry
  }
  const glowLight = (at: THREE.Vector3, color: number, power: number) => {
    if (power > 0 && (!frame.light || power > frame.light.power)) frame.light = { at, color, power }
  }
  const punch = (amp: number) => punches.push({ t0: real, amp: amp * (calm() ? 0.25 : 1) })
  const shake = (amount: number) => (trauma = Math.min(1, trauma + amount * (calm() ? 0.15 : 1)))
  const flashTo = (amount: number) => (frame.flash = Math.max(frame.flash, amount * (calm() ? 0.3 : 1)))

  const flat = (map: THREE.Texture, color: number, at: THREE.Vector3, normal = true) => {
    const material = new THREE.MeshBasicMaterial({
      map,
      color,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: normal ? THREE.AdditiveBlending : THREE.NormalBlending,
    })
    const mesh = new THREE.Mesh(floorPlane, material)
    mesh.position.copy(at)
    mesh.renderOrder = 12
    fx.add(mesh)
    return { mesh, material, done: () => (fx.remove(mesh), material.dispose()) }
  }

  const ringWave = (at: THREE.Vector3, color: number, from: number, to: number, dur: number, opacity = 1) => {
    const ring = flat(ringMap, color, at.clone().setY(0.04))
    add(
      dur,
      (t) => {
        const k = easeOut(t / dur)
        ring.mesh.scale.setScalar(from + (to - from) * k)
        ring.material.opacity = opacity * (1 - k) ** 1.3
      },
      { done: ring.done },
    )
  }

  const glowDisc = (at: THREE.Vector3, color: number, size: number, dur: number, opacity = 1) => {
    const disc = flat(glowMap, color, at.clone().setY(0.05))
    disc.mesh.scale.setScalar(size)
    add(dur, (t) => (disc.material.opacity = opacity * (1 - clamp01(t / dur)) ** 2), { done: disc.done })
  }

  const impactFrame = (at: THREE.Vector3, size: number) => {
    const white = flat(ringMap, 0xffffff, at.clone().setY(0.06))
    const ink = flat(ringMap, 0x000000, at.clone().setY(0.06), false)
    white.mesh.scale.setScalar(size)
    ink.mesh.scale.setScalar(size * 1.25)
    add(
      0.2,
      (_, f) => {
        white.mesh.visible = f === 0
        white.material.opacity = 1.5
        ink.mesh.visible = f === 1
        ink.material.opacity = 0.9
      },
      { real: true, done: () => (white.done(), ink.done()) },
    )
  }

  const skyBeam = (at: THREE.Vector3, color: number, radius: number, height: number, hold: number, fade: number) => {
    const b = beam(color, radius, { fromTop: true, fade: true })
    b.group.position.copy(at)
    b.length(height)
    fx.add(b.group)
    add(
      hold + fade,
      (t) => {
        b.set(Math.min(1, t / 0.05) * (1 - clamp01((t - hold) / fade)), easeOut(t / 0.12), sim)
        glowLight(at.clone().setY(1.6), color, 22 * (1 - clamp01((t - hold) / fade)))
      },
      { done: () => (fx.remove(b.group), b.dispose()) },
    )
  }

  const ghost = (at: THREE.Vector3, type: PieceType, color: Color) => {
    const material = new THREE.MeshBasicMaterial({ color: 0xfff1d6, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })
    const mesh = pieceMesh(type, color)
    mesh.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        ;(o as THREE.Mesh).material = material
        o.castShadow = false
      }
    })
    mesh.position.copy(at)
    fx.add(mesh)
    const spin = (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 4)
    add(
      0.55,
      (t) => {
        const k = clamp01(t / 0.55)
        mesh.position.y = at.y + easeOut(k) * 1.8
        mesh.rotation.y = (color === Color.WHITE ? Math.PI : 0) + spin * k
        mesh.rotation.x = k * 1.2
        mesh.scale.setScalar(1 + k * 0.5)
        material.opacity = (1 - k) ** 1.5 * 1.2
      },
      {
        done: () => {
          fx.remove(mesh)
          material.dispose()
          sparks.spawn(at.clone().setY(1.8), 50, { speed: 4, color: 0xffffff, color2: 0xffc070, size: 0.1, life: 0.6, gravity: 4 })
        },
      },
    )
  }

  const stamp = (text: string, hold: number, height: number, focus?: THREE.Vector3) => {
    const lift = focus && fx.localToWorld(focus.clone()).project(camera).y > 0 ? -0.42 : 0.3
    const material = new THREE.MeshBasicMaterial({ map: stampMap(text), transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false })
    const mesh = hudMat(material, 1000)
    mesh.visible = true
    let landed = false
    const tilt = (Math.random() - 0.5) * 0.12
    add(
      0.14 + hold + 0.45,
      (t) => {
        const tan = Math.tan((camera.fov * Math.PI) / 360)
        const h = Math.min(height * 2 * tan, 2 * tan * camera.aspect * 0.48)
        let s: number
        if (t < 0.14) {
          const k = t / 0.14
          s = 2.6 - 1.6 * k * k
          material.opacity = k
        } else {
          if (!landed) {
            landed = true
            shake(0.4)
            punch(0.18)
          }
          const u = t - 0.14
          s = 1 + 0.08 * Math.exp(-u * 10) * Math.cos(u * 40) + Math.max(0, u - hold) * 0.12
          material.opacity = 1 - clamp01((u - hold) / 0.45)
        }
        mesh.scale.set(h * 2 * s, h * s, 1)
        mesh.position.set(0, tan * lift, -1)
        mesh.rotation.z = tilt
      },
      { real: true, done: () => (hud.remove(mesh), material.dispose()) },
    )
  }

  const baseImpact = (at: THREE.Vector3, move: PowerMove) => {
    const gold = move.promoted
    impactFrame(at, move.capture ? 1.3 : 0.8)
    ringWave(at, gold ? 0xffc94a : 0xfff0d0, 0.3, gold ? 2.4 : 1.5, 0.4, 0.9)
    glowDisc(at, gold ? 0xffb030 : 0xffe2b0, 1.1, 0.3, 0.8)
    sparks.spawn(at.clone().setY(0.1), gold ? 70 : 28, {
      speed: gold ? 5 : 3.6,
      up: 2.4,
      color: gold ? 0xffd040 : 0xffd9a0,
      color2: gold ? 0xffffff : 0xff9a40,
      size: 0.09,
      life: 0.5,
      flat: true,
    })
    add(0.25, (t) => glowLight(at.clone().setY(1.2), gold ? 0xffc040 : 0xffe0b0, 7 * (1 - t / 0.25)))
    if (gold) skyBeam(at, 0xffc23a, 0.32, 18, 0.18, 0.35)
    punch(move.capture ? 0.32 : 0.12)
  }

  const captureImpact = (at: THREE.Vector3, move: PowerMove) => {
    ringWave(at, 0xffffff, 0.5, 6.5, 0.7, 1)
    ringWave(at, 0xff8a3a, 0.3, 5, 0.55, 0.8)
    glowDisc(at, 0xffd8a0, 2.6, 0.45, 1)
    sparks.spawn(at.clone().setY(0.15), 160, { speed: 7.5, up: 4, color: 0xffe6b0, color2: 0xff7020, size: 0.11, life: 0.8 })
    debris.spawn(at, 36, 4.2)
    skyBeam(at, 0xfff0c8, 0.46, 26, 0.16, 0.4)
    if (move.capture && !move.carried) ghost(at.clone().setY(0), move.capture.type, move.capture.color)
    add(0.15, () => (frame.scale = Math.min(frame.scale, calm() ? 0.7 : 0.3)), { real: true })
    add(0.14, (t) => flashTo(0.22 * (1 - t / 0.14)), { real: true })
    shake(0.45)
    playSound('thump')
  }

  const checkFx = (from: THREE.Vector3, king: THREE.Vector3, quiet: boolean) => {
    const state = { stop: false }
    check = state
    const a = from.clone().setY(0.38)
    const b = king.clone().setY(0.38)
    const dir = b.clone().sub(a)
    const len = Math.max(0.01, dir.length())
    const ray = beam(0xff3020, 0.24, { flow: true })
    ray.group.position.copy(a)
    ray.group.quaternion.setFromUnitVectors(UP, dir.normalize())
    ray.length(len)
    fx.add(ray.group)
    const ring = flat(ringMap, 0xff2a1a, king.clone().setY(0.05))
    const halo = flat(glowMap, 0xff2010, king.clone().setY(0.045))
    let stopAt = Infinity
    const entry = add(
      Infinity,
      (t) => {
        if (state.stop && stopAt === Infinity) stopAt = t
        const out = 1 - clamp01((t - stopAt) / 0.3)
        const beat = 0.5 + 0.5 * Math.sin(t * 7.5)
        const rayK = (quiet ? envelope(t, 0, 0.1, 0.6, 1.2) : envelope(t, 0, 0.12, 1.4, 2.2) * 0.85 + 0.15 * smooth(t - 1)) * out
        ray.set(rayK, easeOut(t / 0.18), real)
        ring.mesh.scale.setScalar(0.8 + 0.12 * beat + 0.4 * Math.exp(-t * 6))
        ring.material.opacity = (0.55 + 0.45 * beat) * out * smooth(t / 0.15)
        halo.mesh.scale.setScalar(1.3 + 0.2 * beat)
        halo.material.opacity = (0.35 + 0.35 * beat) * out
        if (!quiet) {
          frame.dim = Math.max(frame.dim, smooth(t / 0.25) * (0.78 - 0.4 * smooth((t - 1.4) / 0.8)) * out)
          frame.red = Math.max(frame.red, (0.5 + 0.5 * (1 - smooth((t - 1.4) / 0.8))) * out)
        }
        glowLight(king.clone().setY(1), 0xff2a1a, (4 + 6 * beat) * out)
        if (t - stopAt > 0.3) entry.dur = t
      },
      {
        real: true,
        done: () => {
          fx.remove(ray.group)
          ray.dispose()
          ring.done()
          halo.done()
        },
      },
    )
    if (!quiet) {
      stamp('王手', 1.1, 0.36, king)
      shake(0.25)
      playSound('heartbeat')
    }
  }

  const finale = (king: THREE.Vector3) => {
    const toWorld = () => fx.localToWorld(king.clone().setY(0.4))
    add(
      0.06,
      (_, f) => {
        if (calm()) flashTo(0.35)
        else if (f === 0) frame.invert = true
        else flashTo(1)
      },
      { real: true },
    )
    add(0.6, (t) => flashTo(0.85 * (1 - t / 0.6) ** 2), { real: true })
    add(2.2, (t) => (frame.scale = Math.min(frame.scale, calm() ? 0.6 : 0.12 + 0.88 * smooth((t - 0.2) / 2))), { real: true })
    add(
      5.6,
      (t) => {
        frame.dim = Math.max(frame.dim, envelope(t, 0, 0.15, 4.2, 5.6) * 0.86)
        frame.red = Math.max(frame.red, envelope(t, 0, 0.15, 1.2, 2.6) * 0.6)
        const w = smooth((t - 0.25) / 0.9) * (1 - smooth((t - 4.2) / 1.3))
        frame.orbit = { at: toWorld(), w: calm() ? w * 0.2 : w, angle: 0.75 * smooth(t / 5.6), zoom: 0.42 }
      },
      { real: true },
    )
    const pillar = beam(0xffd27a, 0.95, { fromTop: true, fade: true })
    pillar.group.position.copy(king)
    pillar.length(44)
    fx.add(pillar.group)
    add(
      5.2,
      (t) => {
        const o = envelope(t, 0, 0.08, 3.4, 5.2)
        pillar.set(o * (0.85 + 0.15 * Math.sin(t * 30)), easeOut(t / 0.3), sim)
        glowLight(king.clone().setY(2), 0xffd080, 45 * o)
        if (t < 3.4)
          sparks.spawn(king.clone().setY(0.2), 3, {
            speed: 1.2,
            up: 7,
            color: 0xffe08a,
            color2: 0xffffff,
            size: 0.13,
            life: 1.6,
            gravity: -2.5,
            drag: 0.6,
            spread: 1.4,
          })
      },
      { done: () => (fx.remove(pillar.group), pillar.dispose()) },
    )
    for (const [i, c] of [0xffffff, 0xffc84a, 0xff6a2a].entries()) add(0.16 * i + 0.001, () => undefined, { done: () => ringWave(king, c, 0.5, 11, 1.1, 1) })
    glowDisc(king, 0xffe0a0, 4, 2.4, 1)
    sparks.spawn(king.clone().setY(0.2), 420, { speed: 10, up: 6, color: 0xffe9b0, color2: 0xff5a10, size: 0.14, life: 1.4, gravity: 7 })
    debris.spawn(king, 60, 5.5)
    add(0.45, () => undefined, { real: true, done: () => stamp('詰み', 3.2, 0.46, king) })
    shake(0.9)
    playSound('boom')
  }

  const fire = (move: PowerMove) => {
    if (check) check.stop = true
    check = null
    const at = local(move.to)
    baseImpact(at, move)
    if (move.capture) captureImpact(at, move)
    if (move.check) {
      const king = local(move.check)
      checkFx(at, king, !!move.mate)
      if (move.mate) finale(king)
    }
  }

  const onMove = (move: PowerMove) => {
    if (move.delay) queue.push({ at: real + move.delay, move })
    else fire(move)
  }

  const tmp = new THREE.Vector3()
  const tmp2 = new THREE.Vector2()
  const update = (dt: number) => {
    real += dt
    const sdt = dt * scale
    sim += sdt
    for (const item of queue.filter((q) => q.at <= real)) fire(item.move)
    queue = queue.filter((q) => q.at > real)
    frame = { dim: 0, red: 0, flash: 0, invert: false, scale: 1, light: null, orbit: null }
    for (const e of [...effects]) {
      e.f++
      const t = (e.real ? real : sim) - e.t0
      e.tick(Math.min(t, e.dur), e.f)
      if (t >= e.dur && effects.includes(e)) {
        effects.splice(effects.indexOf(e), 1)
        e.done?.()
      }
    }
    sparks.step(sdt)
    debris.step(sdt)
    trauma = Math.max(0, trauma - dt * 1.4)
    punches = punches.filter((p) => real - p.t0 < 0.5)
    scale = frame.scale
    dimNow += (frame.dim - dimNow) * (1 - Math.exp(-dt * 14))
    renderer.toneMappingExposure = baseExposure * (1 - 0.68 * dimNow)
    if (frame.light) {
      light.position.copy(frame.light.at)
      light.color.set(frame.light.color)
      light.intensity = frame.light.power
    } else light.intensity = 0
    const size = renderer.getDrawingBufferSize(tmp2)
    sparks.material.uniforms.uScale.value = (size.y * camera.projectionMatrix.elements[5]) / 2
    vignette.visible = dimNow > 0.005
    const vm = vignette.material as THREE.ShaderMaterial
    vm.uniforms.uDim.value = dimNow
    vm.uniforms.uRed.value = frame.red
    flash.visible = frame.flash > 0.005
    ;(flash.material as THREE.MeshBasicMaterial).opacity = frame.flash
    invert.visible = frame.invert
  }

  const savedP = new THREE.Vector3()
  const savedQ = new THREE.Quaternion()
  const aim = new THREE.Matrix4()
  const aimQ = new THREE.Quaternion()
  const right = new THREE.Vector3()
  const up = new THREE.Vector3()
  const fwd = new THREE.Vector3()
  const restore = () => {
    camera.position.copy(savedP)
    camera.quaternion.copy(savedQ)
    camera.updateMatrixWorld()
  }
  const applyCamera = () => {
    savedP.copy(camera.position)
    savedQ.copy(camera.quaternion)
    const orbit = frame.orbit
    if (orbit && orbit.w > 0.001) {
      tmp
        .copy(camera.position)
        .sub(orbit.at)
        .applyAxisAngle(UP, orbit.angle * orbit.w)
        .multiplyScalar(1 - orbit.zoom * orbit.w)
      camera.position.copy(orbit.at).add(tmp)
      aim.lookAt(camera.position, orbit.at, UP)
      aimQ.setFromRotationMatrix(aim)
      camera.quaternion.slerp(aimQ, orbit.w * 0.85)
    }
    right.set(1, 0, 0).applyQuaternion(camera.quaternion)
    up.set(0, 1, 0).applyQuaternion(camera.quaternion)
    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion)
    const dist = camera.position.length()
    let push = 0
    for (const p of punches) {
      const t = real - p.t0
      push += p.amp * (t < 0.035 ? t / 0.035 : Math.exp(-(t - 0.035) * 11))
    }
    const s = trauma * trauma * dist * 0.012
    const n = real * 38
    camera.position.addScaledVector(fwd, push * dist * 0.06)
    camera.position.addScaledVector(right, s * (Math.sin(n * 1.1) + Math.sin(n * 2.3 + 1)) * 0.5)
    camera.position.addScaledVector(up, s * (Math.sin(n * 1.7 + 2) + Math.sin(n * 2.9)) * 0.5)
    camera.updateMatrixWorld()
    const tan = Math.tan((camera.fov * Math.PI) / 360)
    hud.position.copy(camera.position)
    hud.quaternion.copy(camera.quaternion)
    hud.scale.setScalar(Math.min(camera.near * 1.5 + 0.02, camera.far * 0.5))
    for (const m of [vignette, flash, invert]) m.scale.set(tan * camera.aspect * 2.2, tan * 2.2, 1)
    hud.updateMatrixWorld()
    return restore
  }

  const clear = () => {
    for (const e of effects) e.done?.()
    effects = []
    queue = []
    punches = []
    trauma = 0
    check = null
    sparks.reset()
    debris.reset()
    frame = { dim: 0, red: 0, flash: 0, invert: false, scale: 1, light: null, orbit: null }
    dimNow = 0
    scale = 1
    light.intensity = 0
    vignette.visible = flash.visible = invert.visible = false
    renderer.toneMappingExposure = baseExposure
  }

  const dispose = () => {
    disposed = true
    clear()
    root.remove(fx)
    scene.remove(hud)
    sparks.points.geometry.dispose()
    sparks.material.dispose()
    debris.geometry.dispose()
    debris.material.dispose()
    debris.mesh.dispose()
    for (const m of [vignette, flash, invert]) (m.material as THREE.Material).dispose()
    plane.dispose()
    floorPlane.dispose()
    glowMap.dispose()
    ringMap.dispose()
    stamps.forEach((t) => t.dispose())
    light.dispose()
  }

  return { onMove, update, applyCamera, timeScale: () => scale, dim: () => dimNow, clear, dispose }
}
