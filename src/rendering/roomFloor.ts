import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { CASUAL_ROOM, TABLE, TABLE_H, TATAMI_L, TATAMI_W, TRADITIONAL_ROOM, mm } from '@/utils/roomMetrics'

export type RoomDims = { thick: number; leg: number; halfW: number; halfD: number; floor: THREE.Mesh }

const cache = new Map<string, unknown>()

export function once<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make())
  return cache.get(key) as T
}

export function rng(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

export function paint(key: string, w: number, h: number, draw: Draw, repeat = false) {
  return once(`tex:${key}`, () => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    draw(canvas.getContext('2d')!, w, h)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    return texture
  })
}

export function grainTexture(width: number, height: number, base: [number, number, number], lines: number, seed: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgb(${base.join(',')})`
  ctx.fillRect(0, 0, width, height)
  let s = seed
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < lines; i++) {
    const y = rand() * height
    const amp = 2 + rand() * 9
    const freq = 0.002 + rand() * 0.006
    const phase = rand() * 10
    const dark = rand() < 0.55
    ctx.strokeStyle = dark ? `rgba(110,62,22,${0.05 + rand() * 0.12})` : `rgba(255,226,170,${0.04 + rand() * 0.08})`
    ctx.lineWidth = 0.6 + rand() * 2.4
    ctx.beginPath()
    for (let x = 0; x <= width; x += 8) ctx.lineTo(x, y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1) * amp * 0.3)
    ctx.stroke()
  }
  return canvas
}

export const grain = (key: string, w: number, h: number, base: [number, number, number], lines: number, seed: number) =>
  paint(key, w, h, (ctx) => ctx.drawImage(grainTexture(w, h, base, lines, seed), 0, 0), true)

export function tableTexture() {
  return once('table', () => {
    const texture = new THREE.CanvasTexture(grainTexture(1024, 1024, [122, 82, 50], 180, 31))
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
    texture.anisotropy = 8
    return texture
  })
}

export const tatamiMat = () =>
  paint('tatami-mat', 512, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#cbc394'
    ctx.fillRect(0, 0, w, h)
    const r = rng(11)
    for (let y = 0; y < h; y += 4) {
      const k = 0.84 + r() * 0.22
      ctx.fillStyle = `rgba(${Math.round(150 * k)},${Math.round(146 * k)},${Math.round(92 * k)},0.42)`
      ctx.fillRect(0, y, w, 2)
    }
    ctx.fillStyle = 'rgba(255,250,215,0.10)'
    for (let y = 2; y < h; y += 4) ctx.fillRect(0, y, w, 1)
    ctx.fillStyle = 'rgba(96,86,44,0.16)'
    for (let x = 30; x < w - 20; x += 36) ctx.fillRect(x, 0, 2, h)
    const heri = 18
    ctx.fillStyle = '#1f2132'
    ctx.fillRect(0, 0, heri, h)
    ctx.fillRect(w - heri, 0, heri, h)
    ctx.fillStyle = 'rgba(170,160,130,0.28)'
    for (const x of [4, 13, w - 14, w - 5]) ctx.fillRect(x, 0, 1.5, h)
    ctx.fillStyle = 'rgba(30,24,10,0.6)'
    ctx.fillRect(0, 0, w, 3)
    ctx.fillRect(0, h - 3, w, 3)
  })

export const planks = () =>
  once('planks', () => {
    const texture = paint('planks-canvas', 1024, 1024, (ctx, w, h) => {
      const r = rng(5)
      const cols = 8
      const cw = w / cols
      for (let c = 0; c < cols; c++) {
        let y = -r() * h
        while (y < h) {
          const len = h * (0.45 + r() * 0.5)
          const k = 0.86 + r() * 0.24
          const img = grainTexture(Math.ceil(cw), 256, [Math.round(178 * k), Math.round(132 * k), Math.round(86 * k)], 30, Math.floor(r() * 1e6) + 1)
          ctx.save()
          ctx.translate(c * cw + cw, y)
          ctx.rotate(Math.PI / 2)
          ctx.drawImage(img, 0, 0, len, cw)
          ctx.restore()
          ctx.fillStyle = 'rgba(50,30,14,0.55)'
          ctx.fillRect(c * cw, y, cw, 2)
          y += len
        }
        ctx.fillStyle = 'rgba(50,30,14,0.5)'
        ctx.fillRect(c * cw, 0, 2, h)
      }
    })
    texture.repeat.set(1, 1)
    return texture
  })

const WARM = new THREE.Color(1, 0.86, 0.68)

export const standard = (key: string, params: THREE.MeshStandardMaterialParameters, glow = 0) =>
  once(`mat:${key}`, () => {
    const material = new THREE.MeshStandardMaterial(params)
    material.name = key
    if (glow) {
      material.emissive.copy(material.color).multiplyScalar(glow).multiply(WARM)
      material.emissiveMap = material.map
    }
    return material
  })

export function tileUV(g: THREE.BufferGeometry, su: number, sv: number, ou = 0, ov = 0) {
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su + ou, uv.getY(i) * sv + ov)
  return g
}

export function warmLight(root: THREE.Group, x: number, y: number, z: number, floorY: number, intensity: number, angle: number) {
  const light = new THREE.SpotLight(0xffc48a, intensity, 0, angle, 1, 1.5)
  light.position.set(x, y, z)
  light.target.position.set(x, floorY, z)
  root.add(light, light.target)
}

function tatamiGeometry(A: number, B: number) {
  const layout = [
    [0, 0, 2, 1],
    [2, 0, 2, 1],
    [0, 1, 1, 2],
    [1, 1, 2, 1],
    [3, 1, 1, 2],
    [1, 2, 1, 2],
    [2, 2, 1, 2],
    [0, 3, 1, 2],
    [3, 3, 1, 2],
    [1, 4, 2, 1],
    [0, 5, 2, 1],
    [2, 5, 2, 1],
  ]
  return mergeGeometries(
    layout.map(([x, y, w, h]) => {
      const g = new THREE.PlaneGeometry(TATAMI_W, TATAMI_L).rotateX(-Math.PI / 2)
      if (w === 2) g.rotateY(Math.PI / 2)
      return g.translate(-A + (x + w / 2) * TATAMI_W, 0, -B + (y + h / 2) * TATAMI_W)
    }),
  )
}

export function furnishFloor(root: THREE.Group, dims: RoomDims, casual: boolean) {
  const floor = dims.floor
  root.add(floor)
  floor.rotation.set(0, 0, 0)
  if (casual) {
    const top = -dims.thick
    const floorY = top - TABLE_H
    const { halfX: A, halfZ: B } = CASUAL_ROOM
    floor.position.set(0, floorY, 0)
    floor.geometry = tileUV(new THREE.PlaneGeometry(2 * A, 2 * B).rotateX(-Math.PI / 2), (2 * A) / 34, (2 * B) / 34)
    floor.material = standard('planks', { map: planks(), roughness: 0.55 }, 0.24)
    const tableT = mm(30)
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2 * TABLE.halfW, tableT, 2 * TABLE.halfD).translate(0, top - tableT / 2, 0),
      standard('table-wood', { map: tableTexture(), roughness: 0.6 }, 0.2),
    )
    table.castShadow = table.receiveShadow = true
    root.add(table)
    const glow = new THREE.PointLight(0xffb978, 220, 90, 2)
    glow.position.set(-A + 7, floorY + mm(1450), -mm(1800) / 2 - 7)
    root.add(glow)
    warmLight(root, 0, top + mm(560) + 2, 0, floorY, 70, 1.15)
    return
  }
  const floorY = -dims.thick - dims.leg
  const { halfX: A, halfZ: B } = TRADITIONAL_ROOM
  floor.position.set(0, floorY, 0)
  floor.geometry = tatamiGeometry(A, B)
  floor.material = standard('tatami', { map: tatamiMat(), roughness: 0.9 }, 0.16)
  warmLight(root, 0, floorY + mm(1480) - 1, 0, floorY, 150, 1.25)
  for (const [x, z] of [
    [A - 10, -B + 10],
    [-A + 10, B - 10],
  ]) {
    const light = new THREE.PointLight(0xffb36a, 260, 90, 2)
    light.position.set(x, floorY + mm(760) * 0.55, z)
    root.add(light)
  }
}
