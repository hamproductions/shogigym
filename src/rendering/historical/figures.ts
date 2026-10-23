import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const FIGURES = [
  { id: 'king', name: '玉将', glyph: '玉', body: 'king', moves: '周囲8方向に1マス', promotion: null },
  { id: 'gold', name: '金将', glyph: '金', body: 'gold', moves: '前後・左右・斜め前に1マス', promotion: null },
  { id: 'silver', name: '銀将', glyph: '銀', body: 'silver', moves: '前と斜め4方向に1マス', promotion: 'prom-silver' },
  { id: 'knight', name: '桂馬', glyph: '桂', body: 'horse', moves: '前方2マス・左右1マスへ跳躍', promotion: 'prom-knight' },
  { id: 'lance', name: '香車', glyph: '香', body: 'light-cart', moves: '前方へ直進', promotion: 'prom-lance' },
  { id: 'rook', name: '飛車', glyph: '飛', body: 'chariot', moves: '縦横へ直進', promotion: 'dragon' },
  { id: 'bishop', name: '角行', glyph: '角', body: 'ox-cart', moves: '斜め4方向へ直進', promotion: 'dragon-horse' },
  { id: 'pawn', name: '歩兵', glyph: '歩', body: 'pawn', moves: '前に1マス', promotion: 'tokin' },
  { id: 'prom-silver', name: '成銀', glyph: '全', body: 'silver', moves: '金将と同じ', promotion: null },
  { id: 'prom-knight', name: '成桂', glyph: '圭', body: 'horse', moves: '金将と同じ', promotion: null },
  { id: 'prom-lance', name: '成香', glyph: '杏', body: 'light-cart', moves: '金将と同じ', promotion: null },
  { id: 'dragon', name: '龍王', glyph: '龍', body: 'chariot', moves: '飛車の動きと斜め1マス', promotion: null },
  { id: 'dragon-horse', name: '龍馬', glyph: '馬', body: 'ox-cart', moves: '角行の動きと縦横1マス', promotion: null },
  { id: 'tokin', name: 'と金', glyph: 'と', body: 'pawn', moves: '金将と同じ', promotion: null },
] as const

export type FigureId = (typeof FIGURES)[number]['id']
export type FigureSpec = (typeof FIGURES)[number]
export type Figure = THREE.Group & {
  userData: {
    spec: FigureSpec
    camp: number
    promoted: boolean
    arms: THREE.Group[]
    legs: THREE.Group[]
    wheels: THREE.Group[]
    body: THREE.Group
    contacts: THREE.Mesh[]
    readiness?: number
    gaitPhase?: number
  }
}

const box = new THREE.BoxGeometry(1, 1, 1)
const sphere = new THREE.SphereGeometry(1, 20, 14)
const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12)
const cone = new THREE.ConeGeometry(1, 1, 12)
const skirt = new THREE.CylinderGeometry(0.65, 1, 1, 12)
const ring = new THREE.TorusGeometry(1, 0.09, 6, 20)
const arc = new THREE.TorusGeometry(1, 0.1, 6, 16, Math.PI)
const fingerCurl = new THREE.TorusGeometry(0.022, 0.0075, 8, 14, Math.PI * 1.5)
const materials = new Map<string, THREE.MeshStandardMaterial>()
const templates = new Map<string, Figure>()
const inscriptions = new Map<FigureId, THREE.MeshStandardMaterial>()

function inscription(spec: FigureSpec) {
  let material = inscriptions.get(spec.id)
  if (material) return material
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f1dc9e'
  ctx.font = 'bold 108px "Noto Serif JP", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(spec.glyph, 64, 67)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  material = new THREE.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: 0.85 })
  inscriptions.set(spec.id, material)
  return material
}

function material(color: number, metalness = 0) {
  const key = `${color}/${metalness}`
  let m = materials.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, metalness, roughness: metalness ? 0.4 : 0.78 })
    materials.set(key, m)
  }
  return m
}

function part(parent: THREE.Object3D, geometry: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) {
  const mesh = new THREE.Mesh(geometry, m)
  mesh.position.set(x, y, z)
  mesh.scale.set(sx, sy, sz)
  mesh.castShadow = mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function rod(parent: THREE.Object3D, m: THREE.Material, a: number[], b: number[], radius: number) {
  const from = new THREE.Vector3(...(a as [number, number, number]))
  const to = new THREE.Vector3(...(b as [number, number, number]))
  const mesh = part(parent, cylinder, m, 0, 0, 0, radius, from.distanceTo(to), radius)
  mesh.position.copy(from).add(to).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.sub(from).normalize())
  return mesh
}

function joint(parent: THREE.Object3D, name: string, x: number, y: number, z: number) {
  const g = new THREE.Group()
  g.name = name
  g.position.set(x, y, z)
  parent.add(g)
  return g
}

function human(parent: THREE.Object3D, role: string, camp: number, promoted: boolean, arms: THREE.Group[], legs: THREE.Group[], seated = false) {
  const cloth = material(role === 'gold' ? 0x865526 : role === 'silver' ? 0x395a6b : camp ? 0xd7c9a8 : 0x314b61)
  const armor = material(camp ? 0x56574b : 0x202e36, 0.35)
  const trim = material(promoted || role === 'gold' ? 0xd2a94e : role === 'silver' ? 0xbcc5ca : 0x897657, 0.65)
  const skin = material(0xc89c78)
  const dark = material(0x292622)
  const royal = role === 'king'
  part(parent, skirt, royal ? material(0xb9843c) : cloth, 0, royal ? 0.45 : 0.55, 0, royal ? 0.27 : 0.21, royal ? 0.75 : 0.25, 0.17)
  part(parent, skirt, royal ? material(0xdfc795) : armor, 0, 0.81, 0, 0.205, 0.36, 0.13)
  part(parent, box, trim, 0, 0.64, -0.025, 0.4, 0.035, 0.25)
  if (role === 'gold' || role === 'silver') {
    const gold = role === 'gold'
    const mantle = part(parent, skirt, gold ? material(0xb18a3b, 0.55) : material(0x7f929f, 0.65), 0, 0.76, 0.06, gold ? 0.29 : 0.21, 0.43, 0.18)
    mantle.rotation.x = -0.08
    if (gold) {
      part(parent, cylinder, trim, 0, 0.94, 0.23, 0.19, 0.035, 0.19).rotation.x = Math.PI / 2
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6
        rod(parent, trim, [Math.cos(angle) * 0.19, 0.94 + Math.sin(angle) * 0.19, 0.23], [Math.cos(angle) * 0.25, 0.94 + Math.sin(angle) * 0.25, 0.23], 0.015)
      }
    } else {
      for (const sign of [-1, 1]) {
        rod(parent, trim, [sign * 0.07, 1.21, 0.12], [sign * 0.18, 1.52, 0.13], 0.027)
        part(parent, cone, trim, sign * 0.18, 1.57, 0.13, 0.027, 0.15, 0.027)
      }
      part(parent, box, material(0xbcc5ca, 0.65), 0, 0.77, 0.25, 0.12, 0.25, 0.035)
    }
  }
  if (!royal) {
    for (let row = 0; row < 5; row++) {
      part(parent, box, row % 2 ? armor : trim, 0, 0.7 + row * 0.065, -0.132, 0.28, 0.018, 0.018)
      for (const sign of [-1, 1]) {
        const plate = part(parent, box, armor, sign * 0.15, 0.51, 0, 0.14, 0.22, 0.27)
        plate.rotation.z = -sign * 0.15
        part(parent, box, trim, sign * 0.15, 0.45, -0.145, 0.12, 0.025, 0.015)
      }
    }
  }
  if (!royal) {
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        const shoulder = part(parent, box, armor, side * (0.23 + row * 0.015), 0.93 - row * 0.055, 0, 0.15, 0.045, 0.27)
        shoulder.rotation.z = side * 0.15
        for (const z of [-0.08, 0, 0.08]) part(parent, sphere, trim, side * 0.3, 0.93 - row * 0.055, z, 0.012, 0.012, 0.012)
      }
      rod(parent, material(0x7e3025), [side * 0.15, 0.9, -0.15], [side * 0.11, 0.66, -0.15], 0.012)
    }
    for (let row = 0; row < 3; row++) part(parent, box, armor, 0, 1.2 - row * 0.045, 0.1 + row * 0.02, 0.25 + row * 0.025, 0.035, 0.1)
    rod(parent, material(0x674529), [-0.22, 0.62, 0.07], [-0.3, 0.25, 0.18], 0.025)
  }
  for (const [i, sign] of [-1, 1].entries()) {
    const leg = joint(parent, `leg${i}`, sign * 0.105, 0.52, seated ? 0.07 : 0)
    leg.userData.seated = seated
    leg.userData.onVehicle = role === 'driver'
    if (seated) leg.rotation.z = sign * 0.45
    part(leg, cylinder, cloth, 0, -0.11, 0, 0.075, 0.22, 0.075)
    const knee = joint(leg, 'knee', 0, -0.22, 0)
    part(knee, sphere, armor, 0, 0, -0.02, 0.065, 0.06, 0.065)
    part(knee, box, armor, 0, -0.1, -0.015, 0.11, 0.2, 0.1)
    part(knee, box, dark, 0, -0.23, -0.04, 0.13, 0.065, 0.22).name = 'ground-contact-foot'
    legs.push(leg)
    const arm = joint(parent, `arm${i}`, sign * 0.21, 0.94, 0)
    arm.userData.role = role
    arm.userData.seated = seated
    part(arm, cylinder, cloth, 0, -0.11, 0, 0.061, 0.22, 0.061)
    part(arm, box, royal ? cloth : armor, sign * 0.015, -0.06, 0, royal ? 0.18 : 0.14, royal ? 0.25 : 0.14, 0.19)
    const elbow = joint(arm, 'elbow', 0, -0.22, 0)
    part(elbow, sphere, armor, 0, 0, 0, 0.06, 0.06, 0.06)
    part(elbow, cylinder, royal ? cloth : armor, 0, -0.105, 0, 0.05, 0.21, 0.05)
    const wrist = joint(elbow, 'wrist', 0, -0.23, 0)
    part(wrist, sphere, skin, 0, -0.005, 0, 0.028, 0.033, 0.028)
    const gripping = role === 'pawn' || role === 'driver' || (seated && i === 0) || (royal ? i === 0 : i === 1)
    const hand = joint(wrist, 'grip', 0, -0.035, 0)
    if (gripping) hand.rotation.x = -Math.PI / 2
    part(hand, sphere, skin, -sign * 0.022, 0, 0.003, 0.027, 0.043, 0.026)
    for (let finger = 0; finger < 4; finger++) {
      if (gripping) {
        const curl = part(hand, fingerCurl, skin, 0, -0.0255 + finger * 0.017, 0, 1, 1, 1)
        curl.rotation.x = Math.PI / 2
        curl.rotation.z = sign < 0 ? Math.PI : 0
      } else {
        const x = -sign * 0.022 + (finger - 1.5) * 0.012
        const tip = -0.065 + Math.abs(finger - 1.5) * 0.007
        rod(hand, skin, [x, -0.022, 0.006], [x, -0.047, -0.002], 0.0075)
        rod(hand, skin, [x, -0.047, -0.002], [x, tip, -0.019], 0.007)
        part(hand, sphere, skin, x, tip, -0.019, 0.007, 0.008, 0.007)
      }
    }
    rod(hand, skin, [-sign * 0.034, 0.03, -0.012], [sign * 0.009, 0.013, -0.021], 0.01)
    part(hand, sphere, skin, sign * 0.009, 0.013, -0.021, 0.012, 0.014, 0.012)
    arms.push(arm)
  }
  if (seated) part(parent, cylinder, material(0xa58a5a), 0, 0, 0, 0.012, 1, 0.012).name = 'rider-rein'
  if (role === 'driver') for (let i = 0; i < 2; i++) part(parent, cylinder, material(0xa58a5a), 0, 0, 0, 0.012, 1, 0.012).name = `rein${i}`
  part(parent, cylinder, skin, 0, 1.01, 0, 0.06, 0.12, 0.06)
  part(parent, sphere, skin, 0, 1.13, -0.01, 0.115, 0.145, 0.105)
  part(parent, sphere, skin, 0, 1.13, -0.11, 0.035, 0.045, 0.045)
  for (const x of [-0.045, 0.045]) part(parent, box, dark, x, 1.16, -0.104, 0.027, 0.012, 0.015)
  if (royal) {
    part(parent, cylinder, dark, 0, 1.27, 0, 0.115, 0.09, 0.105)
    part(parent, box, dark, 0, 1.41, 0.045, 0.065, 0.26, 0.075)
    part(parent, sphere, material(0x5c9576, 0.5), 0, 0.86, -0.145, 0.042, 0.055, 0.02)
    part(arms[0].getObjectByName('grip')!, box, material(0xd4b97a), 0, 0.08, 0, 0.035, 0.28, 0.02)
  } else if (role === 'pawn') {
    part(parent, cone, armor, 0, 1.29, 0, 0.21, 0.12, 0.21)
    const hand = arms[1].getObjectByName('grip')!
    rod(hand, material(0x805d36), [0, -0.65, 0], [0, 0.9, 0], 0.018)
    part(hand, cylinder, trim, 0, 0.86, 0, 0.026, 0.12, 0.026)
    part(hand, cone, material(0xb9c4c6, 0.7), 0, 1.02, 0, 0.038, 0.23, 0.018)
  } else {
    part(parent, sphere, armor, 0, 1.25, 0.015, 0.15, 0.11, 0.14)
    part(parent, box, trim, 0, 1.24, -0.12, 0.29, 0.03, 0.04)
    const crestMount = joint(parent, 'helmet-crest', 0, role === 'silver' ? 1.44 : 1.285, -0.05)
    const crest = part(crestMount, arc, trim, 0, 0, 0, 0.12, 0.12, 0.12)
    if (role === 'silver') {
      crest.rotation.z = Math.PI
      part(crestMount, box, trim, 0, -0.12, 0, 0.04, 0.1, 0.04)
    } else {
      for (const side of [-1, 1]) part(crestMount, box, trim, side * 0.115, -0.015, 0, 0.035, 0.06, 0.04)
    }
    if (role !== 'driver') {
      const hand = arms[1].getObjectByName('grip')!
      const weapon = joint(hand, 'weapon', 0, 0, 0)
      weapon.rotation.y = -Math.PI / 2
      weapon.scale.set(0.82, 0.74, 0.82)
      part(weapon, cylinder, dark, 0, 0, 0, 0.022, 0.17, 0.022)
      for (let wrap = 0; wrap < 7; wrap++) part(weapon, cylinder, trim, 0, -0.07 + wrap * 0.021, 0, 0.024, 0.006, 0.024)
      part(weapon, cylinder, trim, 0, 0.1, 0, 0.065, 0.015, 0.045)
      const shape = new THREE.Shape()
      shape.moveTo(-0.018, 0.11)
      shape.quadraticCurveTo(-0.015, 0.48, 0.06, 0.79)
      shape.lineTo(0.095, 0.83)
      shape.quadraticCurveTo(0.018, 0.45, 0.018, 0.11)
      shape.closePath()
      const blade = new THREE.ExtrudeGeometry(shape, {
        depth: 0.012,
        bevelEnabled: true,
        bevelSize: 0.003,
        bevelThickness: 0.003,
        bevelSegments: 1,
        steps: 1,
        curveSegments: 12,
      })
      part(weapon, blade, material(0xcdd4d0, 0.8), 0, 0, -0.006, 1, 1, 1)
    }
  }
}

function animal(parent: THREE.Object3D, ox: boolean, legs: THREE.Group[], armor: boolean) {
  const coat = material(ox ? 0x443c32 : 0x805638)
  const dark = material(0x292522)
  part(parent, sphere, coat, 0, 0.56, 0, ox ? 0.23 : 0.2, 0.24, 0.36)
  rod(parent, coat, [0, 0.64, -0.23], [0, 0.97, -0.35], 0.12)
  part(parent, sphere, coat, 0, 0.99, -0.4, 0.115, 0.14, 0.18)
  for (let i = 0; i < 9; i++) part(parent, sphere, dark, 0, 0.78 + i * 0.025, -0.22 - i * 0.013, 0.045, 0.06, 0.04)
  part(parent, sphere, dark, 0, 0.93, -0.55, 0.085, 0.075, 0.07)
  for (const sign of [-1, 1]) {
    part(parent, sphere, material(0x080a0a), sign * 0.1, 1.03, -0.43, 0.014, 0.018, 0.018)
    if (ox) {
      rod(parent, material(0xd5c6a1), [sign * 0.08, 1.1, -0.36], [sign * 0.23, 1.18, -0.34], 0.025)
      part(parent, cone, material(0xd5c6a1), sign * 0.235, 1.21, -0.34, 0.025, 0.12, 0.025)
    } else part(parent, cone, coat, sign * 0.075, 1.16, -0.35, 0.035, 0.16, 0.035)
    for (const z of [-0.23, 0.24]) {
      const leg = joint(parent, `animal-leg-${sign}-${z}`, sign * 0.14, 0.5, z)
      part(leg, cylinder, coat, 0, -0.1, 0, 0.045, 0.22, 0.045)
      const hock = joint(leg, 'knee', 0, -0.22, 0)
      part(hock, sphere, coat, 0, 0, 0, 0.05, 0.05, 0.05)
      part(hock, cylinder, coat, 0, -0.1, 0, 0.035, 0.2, 0.035)
      part(hock, box, dark, 0, -0.22, -0.018, 0.09, 0.08, 0.12).name = 'ground-contact-foot'
      legs.push(leg)
    }
  }
  rod(parent, dark, [0, 0.65, 0.3], [0, 0.3, 0.5], 0.035)
  part(parent, box, material(0x8c3c29), 0, 0.78, 0.04, 0.38, 0.07, 0.32)
  part(parent, box, material(0x32291f), 0, 0.85, -0.08, 0.38, 0.08, 0.07)
  for (const sign of [-1, 1]) rod(parent, material(0xc4ad7c), [sign * 0.1, 0.91, -0.47], [sign * 0.16, 0.75, -0.05], 0.012)
  if (armor) {
    part(parent, sphere, material(0xb38d43, 0.55), 0, 0.7, -0.26, 0.21, 0.2, 0.16)
    part(parent, box, material(0xb38d43, 0.55), 0, 1.09, -0.42, 0.18, 0.04, 0.21)
  }
}

function wheel(parent: THREE.Object3D, x: number, wheels: THREE.Group[], trim: THREE.Material) {
  const g = joint(parent, `wheel-${x}`, x, 0.27, 0.27)
  const rim = part(g, ring, material(0x423628), 0, 0, 0, 0.25, 0.25, 0.25)
  rim.rotation.y = Math.PI / 2
  rim.name = 'ground-contact-wheel'
  part(g, cylinder, trim, 0, 0, 0, 0.045, 0.1, 0.045).rotation.z = Math.PI / 2
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    rod(g, material(0x977343), [0, 0, 0], [0, Math.cos(a) * 0.23, Math.sin(a) * 0.23], 0.014)
  }
  wheels.push(g)
}

function compact(group: THREE.Group) {
  for (const child of [...group.children]) if (child instanceof THREE.Group) compact(child)
  const batches = new Map<THREE.Material, THREE.Mesh[]>()
  for (const child of group.children) {
    if (!(child instanceof THREE.Mesh) || Array.isArray(child.material) || child.name) continue
    const list = batches.get(child.material) ?? []
    list.push(child)
    batches.set(child.material, list)
  }
  for (const [m, meshes] of batches) {
    if (meshes.length < 2) continue
    const geometries = meshes.map((mesh) => {
      mesh.updateMatrix()
      return mesh.geometry.clone().applyMatrix4(mesh.matrix).toNonIndexed()
    })
    const merged = mergeGeometries(geometries)
    geometries.forEach((geometry) => geometry.dispose())
    if (!merged) continue
    const mesh = new THREE.Mesh(merged, m)
    mesh.castShadow = mesh.receiveShadow = true
    meshes.forEach((old) => group.remove(old))
    group.add(mesh)
  }
}

export function createFigure(id: FigureId, camp = 0): Figure {
  const key = `${id}/${camp}`
  const cached = templates.get(key)
  if (cached) {
    const data = cached.userData
    cached.userData = {} as Figure['userData']
    const model = cached.clone() as Figure
    cached.userData = data
    model.userData = { ...cached.userData, arms: [], legs: [], wheels: [], contacts: [], body: model.getObjectByName('body') as THREE.Group }
    model.traverse((object) => {
      if (object.name.startsWith('arm')) model.userData.arms.push(object as THREE.Group)
      if (object.name.startsWith('leg') || object.name.startsWith('animal-leg')) model.userData.legs.push(object as THREE.Group)
      if (object instanceof THREE.Group && object.name.startsWith('wheel')) model.userData.wheels.push(object)
      if (object instanceof THREE.Mesh && object.name.startsWith('ground-contact')) model.userData.contacts.push(object)
    })
    return model
  }
  const spec = FIGURES.find((entry) => entry.id === id)!
  const promoted = FIGURES.findIndex((entry) => entry.id === id) >= 8
  const root = new THREE.Group() as Figure
  root.name = id
  const body = joint(root, 'body', 0, 0, 0)
  const arms: THREE.Group[] = []
  const legs: THREE.Group[] = []
  const wheels: THREE.Group[] = []
  const trim = material(promoted ? 0xd9ad4d : 0xa88b58, 0.6)
  if (spec.body === 'horse') {
    const mount = joint(body, 'mount', 0, 0, 0)
    mount.scale.setScalar(1.3)
    animal(mount, false, legs, promoted)
    const rider = joint(body, 'rider', 0, 0.607, 0.052)
    human(rider, 'silver', camp, promoted, arms, legs, true)
  } else if (spec.body.endsWith('cart') || spec.body === 'chariot') {
    const light = spec.body === 'light-cart'
    const ox = spec.body === 'ox-cart'
    const wood = material(ox ? 0x4a3829 : 0x8a6238)
    const draft = joint(body, 'draft', 0, 0, -0.7)
    draft.scale.setScalar(1.15)
    animal(draft, ox, legs, false)
    part(body, box, wood, 0, 0.44, 0.28, light ? 0.42 : 0.57, 0.12, 0.46)
    for (let i = 0; i < 5; i++) part(body, box, material(0xa18353), (i - 2) * (light ? 0.075 : 0.1), 0.505, 0.28, 0.012, 0.012, 0.43)
    wheel(body, light ? -0.25 : -0.34, wheels, trim)
    wheel(body, light ? 0.25 : 0.34, wheels, trim)
    for (const sign of [-1, 1]) rod(body, wood, [sign * 0.18, 0.48, 0.32], [sign * 0.18, 0.65, -0.7], 0.022)
    if (spec.body === 'chariot') {
      part(body, box, wood, 0, 0.64, 0.07, 0.55, 0.26, 0.04)
      const rider = joint(body, 'driver', 0, 0.4625, 0.3)
      human(rider, 'driver', camp, promoted, arms, legs)
    } else {
      for (const x of [-0.22, 0.22]) for (const z of [0.08, 0.46]) rod(body, wood, [x, 0.46, z], [x, 1.45, z], 0.024)
      if (ox) {
        part(body, box, material(camp ? 0xd2c39b : 0x283f4e), 0, 0.95, 0.45, 0.46, 0.85, 0.04)
        for (const sign of [-1, 1]) part(body, box, wood, sign * 0.22, 0.95, 0.28, 0.04, 0.85, 0.36)
      }
      for (const sign of [-1, 1]) {
        const roof = part(body, box, material(0x333c3a), sign * 0.125, 1.475, 0.27, 0.32, 0.06, 0.59)
        roof.rotation.z = -sign * 0.18
      }
      part(body, box, trim, 0, 1.51, 0.27, 0.045, 0.045, 0.58)
      for (const sign of [-1, 1])
        for (let i = 0; i < 7; i++) {
          const slat = part(body, cylinder, material(0x4b5149), sign * 0.125, 1.513, 0.02 + i * 0.08, 0.012, 0.3, 0.012)
          slat.rotation.z = Math.PI / 2 - sign * 0.18
        }
    }
    if (promoted) {
      const crestY = spec.body === 'chariot' ? 0.86 : 1.58
      const crestZ = spec.body === 'chariot' ? 0.02 : 0.24
      part(body, box, trim, 0, crestY - 0.1, crestZ, 0.2, 0.06, 0.22)
      part(body, sphere, trim, 0, crestY, crestZ, 0.11, 0.09, 0.17)
      for (const sign of [-1, 1]) part(body, cone, trim, sign * 0.07, crestY + 0.12, crestZ + 0.06, 0.035, 0.2, 0.035)
      part(body, box, trim, 0, 0.5, 0.06, 0.54, 0.035, 0.04)
    }
    const chassis = joint(body, 'chassis', 0, 0, 0)
    for (const child of [...body.children]) {
      if (child === chassis) continue
      if (child.name === 'driver' || child.name.startsWith('wheel')) child.position.z *= 0.72
      else chassis.add(child)
    }
    chassis.scale.z = 0.72
  } else {
    human(body, spec.body, camp, promoted, arms, legs)
  }
  if (typeof document !== 'undefined') {
    const roof = spec.body === 'ox-cart' || spec.body === 'light-cart'
    const target = roof ? body : (body.getObjectByName('rider') ?? body.getObjectByName('driver') ?? body)
    if (roof) {
      const label = part(target, new THREE.PlaneGeometry(0.22, 0.23), inscription(spec), 0.13, 1.527, 0.1944, 1, 1, 1)
      label.castShadow = false
      label.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -0.18, 'ZYX'))
    } else {
      const royal = spec.body === 'king'
      const pawn = spec.body === 'pawn'
      const geometry = new THREE.PlaneGeometry(0.16, royal ? 0.1 : 0.16, 16, 16)
      const positions = geometry.getAttribute('position')
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const z = -positions.getY(i) + (royal ? -0.045 : pawn ? 0 : 0.015)
        const y = royal
          ? 1.315
          : pawn
            ? 1.35 - (Math.hypot(x, z) * 0.12) / 0.21
            : 1.25 + 0.11 * Math.sqrt(Math.max(0, 1 - (x / 0.15) ** 2 - ((z - 0.015) / 0.14) ** 2))
        positions.setXYZ(i, x, y + 0.001, z)
      }
      geometry.computeVertexNormals()
      part(target, geometry, inscription(spec), 0, 0, 0, 1, 1, 1).castShadow = false
    }
  }
  body.scale.setScalar(0.72)
  root.userData = { spec, camp, promoted, arms, legs, wheels, body, contacts: [] }
  compact(body)
  templates.set(key, root)
  return createFigure(id, camp)
}

const lastTravel = new WeakMap<Figure, number>()
const across = new THREE.Vector3(1, 0, 0)
const upright = new THREE.Vector3(0, 1, 0)
const reinStart = new THREE.Vector3()
const reinEnd = new THREE.Vector3()
const supportTarget = new THREE.Vector3()
const direction = new THREE.Vector3()
const bend = new THREE.Vector3()
const upper = new THREE.Vector3()
const lower = new THREE.Vector3()
const rotation = new THREE.Quaternion()
const gripRotation = new THREE.Quaternion()
const wristRotation = new THREE.Quaternion()
const gripMountInverse = new THREE.Quaternion().setFromAxisAngle(across, Math.PI / 2)
const wristOffset = new THREE.Vector3()
const hinge = new THREE.Vector3()
const boneY = new THREE.Vector3()
const boneZ = new THREE.Vector3()
const boneMatrix = new THREE.Matrix4()
const groundInverse = new THREE.Matrix4()
const groundMatrix = new THREE.Matrix4()
const groundPoint = new THREE.Vector3()
const groundAxis = new THREE.Vector3()
const gaitOffsets = [0, Math.PI, Math.PI, 0]
const swordKeys = [
  [0, 0.5, 1.15, -0.23],
  [0.12, 1.25, 1.05, -0.4],
  [0.22, 1.75, 0.9, -0.3],
  [0.48, 0.85, 0.8, -0.9],
  [0.65, 0.55, 0.65, -1.1],
  [0.85, 0.45, 0.95, -0.5],
  [1, 0.5, 1.15, -0.23],
]

function swordPose(phase: number, component: number) {
  if (phase < 0) return swordKeys[0][component]
  for (let i = 1; i < swordKeys.length; i++) {
    const from = swordKeys[i - 1]
    const to = swordKeys[i]
    if (phase > to[0]) continue
    const t = THREE.MathUtils.smoothstep(phase, from[0], to[0])
    return THREE.MathUtils.lerp(from[component], to[component], t)
  }
  return swordKeys[0][component]
}

function reachGrip(arm: THREE.Group, target: THREE.Vector3, grip: THREE.Quaternion) {
  const elbow = arm.getObjectByName('elbow')!
  const wrist = arm.getObjectByName('wrist')!
  wristRotation.copy(grip).multiply(gripMountInverse)
  wristOffset.set(0, -0.035, 0).applyQuaternion(wristRotation)
  direction.copy(target).sub(wristOffset).sub(arm.position)
  const distance = THREE.MathUtils.clamp(direction.length(), 0.02, 0.449)
  direction.normalize()
  bend.set(Math.sign(arm.position.x) * 0.75, -1, 0.2)
  bend.addScaledVector(direction, -bend.dot(direction)).normalize()
  const along = (0.22 ** 2 - 0.23 ** 2 + distance ** 2) / (2 * distance)
  upper
    .copy(direction)
    .multiplyScalar(along)
    .addScaledVector(bend, Math.sqrt(Math.max(0, 0.22 ** 2 - along ** 2)))
  lower.copy(direction).multiplyScalar(distance).sub(upper).normalize()
  hinge.crossVectors(direction, bend).normalize()
  boneY.copy(upper).normalize().negate()
  boneZ.crossVectors(hinge, boneY).normalize()
  boneMatrix.makeBasis(hinge, boneY, boneZ)
  arm.quaternion.setFromRotationMatrix(boneMatrix)
  boneY.copy(lower).negate()
  boneZ.crossVectors(hinge, boneY).normalize()
  boneMatrix.makeBasis(hinge, boneY, boneZ)
  rotation.setFromRotationMatrix(boneMatrix)
  elbow.quaternion.copy(arm.quaternion).invert().multiply(rotation)
  wrist.quaternion.copy(rotation).invert().multiply(wristRotation)
}

export function poseFigure(figure: Figure, time: number, travel = 0, attack = -1) {
  const { arms, legs, wheels, body, spec } = figure.userData
  const strike = attack >= 0 ? Math.sin(Math.PI * THREE.MathUtils.smoothstep(attack, 0.2, 0.75)) : 0
  const cart = spec.body.endsWith('cart') || spec.body === 'chariot'
  const mounted = spec.body === 'horse' || cart
  const readiness = figure.userData.readiness ?? 0
  const gait = figure.userData.gaitPhase ?? time * 15
  body.position.y = 0
  body.position.z = cart ? 0.21 : 0
  body.rotation.x = readiness * (cart ? 0 : mounted ? 0.035 : -0.1) + travel * (cart ? 0 : 0.025) + strike * (cart ? -0.025 : 0.05)
  body.rotation.y = spec.body === 'pawn' ? 0 : strike * 0.1
  arms.forEach((arm, index) => {
    const elbow = arm.getObjectByName('elbow')!
    const wrist = arm.getObjectByName('wrist')!
    const role = arm.userData.role as string
    const right = index % 2 === 1
    const walk = Math.sin(gait + index * Math.PI) * travel
    if (role === 'pawn') {
      arm.rotation.set(0.12 + strike * 0.6, 0, right ? -0.45 : 0.45)
      elbow.rotation.set(0.85 - strike * 0.7, 0, 0)
      wrist.rotation.set(-0.97 - strike * 1.47, 0, 0)
    } else {
      arm.rotation.set(
        right ? (attack >= 0 ? swordPose(attack, 1) : THREE.MathUtils.lerp(-0.05, 0.65, readiness)) : 0.15 + readiness * 0.3 - walk * 0.2,
        0,
        right ? 0.08 + (attack >= 0 ? Math.sin(Math.PI * THREE.MathUtils.smoothstep(attack, 0, 0.44)) * 0.22 : 0) : -0.22,
      )
      elbow.rotation.set(
        right ? (attack >= 0 ? swordPose(attack, 2) : THREE.MathUtils.lerp(0.18, 1.05, readiness)) : 0.4 + readiness * 0.45 + travel * 0.1,
        0,
        0,
      )
      wrist.rotation.set(right ? (attack >= 0 ? swordPose(attack, 3) : THREE.MathUtils.lerp(-1.45, -0.15, readiness)) : -0.65, 0, 0)
      if (role === 'king') {
        arm.rotation.x = 0.22 + readiness * 0.33 + strike * 0.2
        elbow.rotation.x = 0.7 + readiness * 0.3
        wrist.rotation.x = 0.65
      }
      if (mounted) {
        arm.rotation.x += travel * 0.025
        if (!cart) arm.parent!.rotation.y = -strike * 0.9
      }
    }
  })
  if (spec.body === 'pawn' && arms.length === 2) {
    gripRotation.setFromAxisAngle(across, -0.12 - readiness * 0.93 - strike * 0.35)
    supportTarget.set(0.04, 0.72 + readiness * 0.05 + strike * 0.03, -0.1 - readiness * 0.05 - strike * 0.01)
    reachGrip(arms[1], supportTarget, gripRotation)
    supportTarget.add(upper.set(0, 0.18, 0).applyQuaternion(gripRotation))
    reachGrip(arms[0], supportTarget, gripRotation)
  }
  if (spec.body === 'horse' && arms.length === 2) {
    const arm = arms[0]
    gripRotation.setFromAxisAngle(across, Math.PI / 2)
    supportTarget.set(-0.12, 0.8, -0.2)
    reachGrip(arm, supportTarget, gripRotation)
    const wrist = arm.getObjectByName('grip')!
    wrist.updateWorldMatrix(true, false)
    wrist.getWorldPosition(reinStart)
    arm.parent!.worldToLocal(reinStart)
    reinEnd.set(-0.104, 1.235, -0.559)
    arm.parent!.parent!.localToWorld(reinEnd)
    arm.parent!.worldToLocal(reinEnd)
    const rein = arm.parent!.getObjectByName('rider-rein')!
    rein.position.copy(reinStart).add(reinEnd).multiplyScalar(0.5)
    rein.scale.set(0.012, reinStart.distanceTo(reinEnd), 0.012)
    rein.quaternion.setFromUnitVectors(upright, reinEnd.sub(reinStart).normalize())
  }
  if (arms[0]?.userData.role === 'driver') {
    gripRotation.setFromAxisAngle(across, Math.PI / 2)
    for (const [index, sign] of [-1, 1].entries()) {
      const arm = arms[index]
      supportTarget.set(sign * 0.12, 0.8, -0.25)
      reachGrip(arm, supportTarget, gripRotation)
      const wrist = arm.getObjectByName('grip')!
      wrist.updateWorldMatrix(true, false)
      wrist.getWorldPosition(reinStart)
      arm.parent!.worldToLocal(reinStart)
      reinEnd.set(sign * 0.14, 0.676, -1.0512)
      const rein = arm.parent!.getObjectByName(`rein${index}`)!
      rein.position.copy(reinStart).add(reinEnd).multiplyScalar(0.5)
      rein.scale.set(0.012, reinStart.distanceTo(reinEnd), 0.012)
      rein.quaternion.setFromUnitVectors(upright, reinEnd.sub(reinStart).normalize())
    }
  }
  legs.forEach((leg, index) => {
    const rider = !!leg.userData.seated
    const fixed = !!leg.userData.onVehicle
    const quadruped = leg.name.startsWith('animal-leg')
    const offset = quadruped ? gaitOffsets[index % 4] : index * Math.PI
    const step = Math.sin(gait + offset)
    if (!quadruped && !rider && !fixed) leg.position.x = (leg.name === 'leg0' ? -1 : 1) * (0.105 + readiness * 0.055)
    leg.rotation.x = fixed ? 0 : rider ? 0.08 : step * travel * 0.48 + (quadruped ? 0 : readiness * (index % 2 ? 0.18 : -0.24))
    const knee = leg.getObjectByName('knee')
    if (knee)
      knee.rotation.x = fixed
        ? 0
        : rider
          ? -0.85
          : -(quadruped ? 0 : readiness * 0.28) - Math.max(0, Math.cos(gait + offset)) * travel * (quadruped ? 0.45 : 0.65)
  })
  figure.updateWorldMatrix(true, false)
  groundInverse.copy(figure.matrixWorld).invert()
  let lowest = Infinity
  for (const contact of figure.userData.contacts) {
    contact.updateWorldMatrix(true, false)
    groundMatrix.multiplyMatrices(groundInverse, contact.matrixWorld)
    if (contact.name === 'ground-contact-wheel') {
      groundPoint.setFromMatrixPosition(groundMatrix)
      const radius = groundAxis.setFromMatrixColumn(groundMatrix, 0).length() * 1.09
      groundAxis.setFromMatrixColumn(groundMatrix, 2).normalize()
      lowest = Math.min(lowest, groundPoint.y - radius * Math.sqrt(Math.max(0, 1 - groundAxis.y ** 2)))
    } else {
      if (!contact.geometry.boundingBox) contact.geometry.computeBoundingBox()
      const bounds = contact.geometry.boundingBox!
      for (let corner = 0; corner < 8; corner++) {
        groundPoint
          .set(corner & 1 ? bounds.max.x : bounds.min.x, corner & 2 ? bounds.max.y : bounds.min.y, corner & 4 ? bounds.max.z : bounds.min.z)
          .applyMatrix4(groundMatrix)
        lowest = Math.min(lowest, groundPoint.y)
      }
    }
  }
  if (Number.isFinite(lowest)) body.position.y = -lowest
  if (travel > 0) {
    const dt = Math.max(0, Math.min(0.05, time - (lastTravel.get(figure) ?? time)))
    wheels.forEach((wheel) => (wheel.rotation.x -= dt * travel * 9))
    lastTravel.set(figure, time)
  }
}

export function disposeFigures() {
  const geometries = new Set<THREE.BufferGeometry>([box, sphere, cylinder, cone, skirt, ring, arc, fingerCurl])
  templates.forEach((root) => root.traverse((object) => object instanceof THREE.Mesh && geometries.add(object.geometry)))
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((m) => m.dispose())
  materials.clear()
  inscriptions.forEach((material) => {
    material.map?.dispose()
    material.dispose()
  })
  inscriptions.clear()
  templates.clear()
}
