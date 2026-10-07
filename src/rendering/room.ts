import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { loadPieceFont } from '@/appearance/settings'
import { CASUAL_ROOM, ROOM_H, TABLE, TABLE_H, TATAMI_W, TRADITIONAL_ROOM, ZABUTON, mm } from '@/utils/roomMetrics'
import { grain, grainTexture, once, paint, rng, standard, tableTexture, tileUV, type Draw, type RoomDims } from './roomFloor'

export function zabutonTexture() {
  return paint('zabuton', 512, 512, (ctx, size) => {
    ctx.fillStyle = '#26407a'
    ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = 'rgba(120, 150, 210, 0.35)'
    ctx.lineWidth = 3
    for (let y = 0; y < size; y += 32)
      for (let x = (y / 32) % 2 ? 16 : 0; x < size; x += 32) {
        ctx.beginPath()
        ctx.moveTo(x, y + 16)
        ctx.lineTo(x + 16, y)
        ctx.lineTo(x + 32, y + 16)
        ctx.lineTo(x + 16, y + 32)
        ctx.closePath()
        ctx.stroke()
      }
  })
}

const glassSheen = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number) => {
  const r = rng(seed)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  const tint = ctx.createLinearGradient(x, y, x, y + h)
  tint.addColorStop(0, 'rgba(225,238,245,0.10)')
  tint.addColorStop(1, 'rgba(200,215,225,0.16)')
  ctx.fillStyle = tint
  ctx.fillRect(x, y, w, h)
  for (const [at, width, alpha] of [
    [0.18, 0.16, 0.22],
    [0.42, 0.05, 0.16],
    [0.7, 0.1, 0.12],
  ]) {
    const cx = x + w * at
    const g = ctx.createLinearGradient(cx - w * width, y, cx + w * width, y + h * 0.4)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.5, `rgba(255,255,255,${alpha})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(cx - w * width, y + h)
    ctx.lineTo(cx + w * width * 0.2, y)
    ctx.lineTo(cx + w * width * 1.4, y)
    ctx.lineTo(cx + w * width * 0.2, y + h)
    ctx.closePath()
    ctx.fill()
  }
  for (let i = 0; i < 40; i++) {
    const sx = x + r() * w
    const sy = y + r() * h
    const sr = 6 + r() * 26
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
    g.addColorStop(0, `rgba(255,255,255,${0.04 + r() * 0.06})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2)
  }
  ctx.fillStyle = 'rgba(70,60,45,0.08)'
  ctx.fillRect(x, y + h - 6, w, 6)
  ctx.restore()
}

const glassDraw: Draw = (ctx, w, h) => glassSheen(ctx, 0, 0, w, h, 17)

const shojiDraw =
  (glow: boolean): Draw =>
  (ctx, w, h) => {
    ctx.fillStyle = glow ? '#ffffff' : '#f5f0e2'
    ctx.fillRect(0, 0, w, h)
    if (!glow) {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(1, 'rgba(210,196,160,0.18)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
    const koshi = h * 0.15
    const f = 22
    const glass = h * 0.5
    if (glow) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(f, glass, w - 2 * f, h - koshi - glass)
    } else ctx.clearRect(f, glass, w - 2 * f, h - koshi - glass)
    ctx.fillStyle = glow ? '#000000' : '#d6bf94'
    ctx.fillRect(0, 0, f, h)
    ctx.fillRect(w - f, 0, f, h)
    ctx.fillRect(0, 0, w, f)
    ctx.fillRect(0, h - koshi, w, koshi)
    ctx.fillRect(0, glass - 8, w, 14)
    for (let i = 1; i < 4; i++) ctx.fillRect(f + ((w - 2 * f) * i) / 4 - 3, f, 6, glass - f)
    for (let j = 1; j < 5; j++) ctx.fillRect(f, f + ((glass - f) * j) / 5 - 3, w - 2 * f, 6)
    if (!glow) {
      ctx.fillStyle = '#c8ad80'
      ctx.fillRect(f + 10, h - koshi + 12, w - 2 * f - 20, koshi - 24 - f)
      ctx.fillStyle = 'rgba(80,50,20,0.25)'
      ctx.fillRect(f - 2, f, 2, h - koshi - f)
      ctx.fillRect(w - f, f, 2, h - koshi - f)
      ctx.fillRect(f, h - koshi, w - 2 * f, 2)
      glassSheen(ctx, f, glass + 6, w - 2 * f, h - koshi - glass - 6, 29)
    }
  }

const fusumaDraw: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#e6dcc2'
  ctx.fillRect(0, 0, w, h)
  const r = rng(3)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(196,160,80,0.38)')
  g.addColorStop(0.2, 'rgba(196,160,80,0.0)')
  g.addColorStop(0.75, 'rgba(196,160,80,0.0)')
  g.addColorStop(1, 'rgba(196,160,80,0.30)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(176,140,70,0.22)'
  ctx.lineWidth = 2
  for (let y = 0; y <= h + 64; y += 64)
    for (let x = 0; x <= w + 64; x += 64) {
      ctx.beginPath()
      ctx.arc(x, y, 32 * Math.SQRT2, 0, Math.PI * 2)
      ctx.stroke()
    }
  ctx.fillStyle = 'rgba(200,164,90,0.45)'
  for (let i = 0; i < 900; i++) {
    const y = r() < 0.5 ? r() * h * 0.2 : h - r() * h * 0.22
    ctx.fillRect(r() * w, y, 2 + r() * 3, 2 + r() * 3)
  }
  ctx.fillStyle = '#23170e'
  ctx.fillRect(0, 0, 16, h)
  ctx.fillRect(w - 16, 0, 16, h)
  ctx.fillRect(0, 0, w, 16)
  ctx.fillRect(0, h - 16, w, 16)
  const cx = w - 52
  const cy = h * 0.52
  for (const [rad, color] of [
    [17, '#2c1d10'],
    [13, '#8a6a32'],
    [8, '#1e140a'],
  ] as const) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cy, rad, 0, Math.PI * 2)
    ctx.fill()
  }
}

const plasterDraw =
  (base: string, seed: number): Draw =>
  (ctx, w, h) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    const r = rng(seed)
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = r() < 0.5 ? `rgba(80,60,30,${r() * 0.16})` : `rgba(255,248,230,${r() * 0.16})`
      ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2)
    }
  }

const ceilingDraw: Draw = (ctx, w, h) => {
  ctx.drawImage(grainTexture(w, h, [206, 172, 128], 110, 77), 0, 0)
  const r = rng(9)
  const boards = 4
  for (let i = 0; i < boards; i++) {
    ctx.fillStyle = r() < 0.5 ? `rgba(120,80,40,${r() * 0.12})` : `rgba(255,236,200,${r() * 0.12})`
    ctx.fillRect(0, (i * h) / boards, w, h / boards)
    ctx.fillStyle = 'rgba(70,44,20,0.5)'
    ctx.fillRect(0, (i * h) / boards, w, 2)
  }
}

const SCROLL_TEXT = '一歩千金'

const scrollDraw: Draw = (ctx, w, h) => {
  const u = w / 256
  ctx.fillStyle = '#2b2230'
  ctx.fillRect(0, 0, w, h)
  const r = rng(21)
  ctx.fillStyle = 'rgba(196,160,90,0.35)'
  for (let y = 10 * u; y < h; y += 22 * u)
    for (let x = ((y / (22 * u)) % 2 ? 11 : 0) * u + 6 * u; x < w; x += 22 * u) {
      ctx.beginPath()
      ctx.arc(x, y, 2.2 * u, 0, Math.PI * 2)
      ctx.fill()
    }
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(${r() < 0.5 ? '10,6,12' : '120,100,90'},${r() * 0.15})`
    ctx.fillRect(r() * w, r() * h, 2 * u, 2 * u)
  }
  const top = h * 0.17
  const bottom = h * 0.87
  const side = 22 * u
  ctx.fillStyle = '#b89650'
  ctx.fillRect(side - 6 * u, top - 14 * u, w - 2 * side + 12 * u, 10 * u)
  ctx.fillRect(side - 6 * u, bottom + 4 * u, w - 2 * side + 12 * u, 10 * u)
  ctx.fillStyle = '#f1e8d2'
  ctx.fillRect(side, top, w - 2 * side, bottom - top)
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(150,120,70,${r() * 0.09})`
    ctx.fillRect(side + r() * (w - 2 * side), top + r() * (bottom - top), 2 * u, 2 * u)
  }
  ctx.fillStyle = '#b89650'
  ctx.fillRect(w * 0.36 - 5 * u, 0, 10 * u, top - 14 * u)
  ctx.fillRect(w * 0.64 - 5 * u, 0, 10 * u, top - 14 * u)
  ctx.fillStyle = '#141010'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const size = Math.min(w - 2 * side - 20 * u, ((bottom - top) * 0.8) / SCROLL_TEXT.length)
  ctx.font = `${size}px "Yuji Syuku", "Shippori Mincho B1", serif`
  ;[...SCROLL_TEXT].forEach((ch, i) => ctx.fillText(ch, w / 2, top + (bottom - top) * 0.05 + size * (i + 0.5)))
  const seal = size * 0.24
  const sx = w / 2 + size * 0.2
  const sy = bottom - seal - (bottom - top) * 0.03
  ctx.fillStyle = '#b3302a'
  ctx.fillRect(sx, sy, seal, seal)
  ctx.fillStyle = '#f1e8d2'
  ctx.font = `${seal * 0.42}px "Shippori Mincho B1", serif`
  ctx.fillText('棋', sx + seal * 0.3, sy + seal * 0.3)
  ctx.fillText('道', sx + seal * 0.7, sy + seal * 0.3)
  ctx.fillText('人', sx + seal * 0.3, sy + seal * 0.72)
  ctx.fillText('印', sx + seal * 0.7, sy + seal * 0.72)
}

const scrollTexture = () =>
  once('scroll', () => {
    const texture = paint('scroll-canvas', 512, 1744, scrollDraw)
    loadPieceFont('kaisho')
      .then(() => document.fonts.load('120px "Yuji Syuku"', SCROLL_TEXT))
      .then(() => {
        const canvas = texture.image as HTMLCanvasElement
        scrollDraw(canvas.getContext('2d')!, canvas.width, canvas.height)
        texture.needsUpdate = true
      })
      .catch(() => {})
    return texture
  })

const plasterTile = 22

type Parts = Map<THREE.Material, THREE.BufferGeometry[]>

function put(parts: Parts, material: THREE.Material, geometry: THREE.BufferGeometry) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry
  const list = parts.get(material)
  if (list) list.push(g)
  else parts.set(material, [g])
}

function bake(parts: Parts, group: THREE.Object3D, cast = false, receive = false) {
  for (const [material, list] of parts) {
    const mesh = new THREE.Mesh(mergeGeometries(list), material)
    mesh.castShadow = cast
    mesh.receiveShadow = receive
    group.add(mesh)
  }
  parts.clear()
}

function flipU(g: THREE.BufferGeometry) {
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
  return g
}

type Side = { ry: number; half: number }

function onWall(g: THREE.BufferGeometry, s: Side, u: number, y: number, d: number) {
  g.rotateY(s.ry)
  const c = Math.cos(s.ry)
  const n = Math.sin(s.ry)
  g.translate(c * u + n * (d - s.half), y, -n * u + c * (d - s.half))
  return g
}

const panel = (s: Side, u0: number, u1: number, y0: number, y1: number, d: number, tile = 0, flip = false) => {
  const g = new THREE.PlaneGeometry(u1 - u0, y1 - y0)
  if (tile) tileUV(g, (u1 - u0) / tile, (y1 - y0) / tile, u0 / tile, y0 / tile)
  if (flip) flipU(g)
  return onWall(g, s, (u0 + u1) / 2, (y0 + y1) / 2, d)
}

const beam = (s: Side, u0: number, u1: number, y0: number, y1: number, d0: number, d1: number) =>
  onWall(new THREE.BoxGeometry(u1 - u0, y1 - y0, d1 - d0), s, (u0 + u1) / 2, (y0 + y1) / 2, (d0 + d1) / 2)

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z)

const lathe = (points: [number, number][], segments = 24) =>
  new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  )

const place = (g: THREE.BufferGeometry, x: number, y: number, z: number, yaw = 0) => g.rotateY(yaw).translate(x, y, z)

type Cut = [THREE.Object3D, (p: THREE.Vector3) => boolean]

function cutaway(root: THREE.Group, cuts: Cut[], sky: THREE.Object3D) {
  const local = new THREE.Vector3()
  root.add(sky)
  const attach = () => {
    const scene = root.parent
    if (!scene) return
    const before = scene.onBeforeRender
    scene.onBeforeRender = (...args: Parameters<THREE.Object3D['onBeforeRender']>) => {
      before.apply(scene, args)
      root.worldToLocal(local.setFromMatrixPosition(args[2].matrixWorld))
      sky.position.copy(local)
      for (const [group, test] of cuts) group.visible = test(local)
    }
  }
  if (root.parent) attach()
  else root.addEventListener('added', attach)
}

function clearOfBoard(lamp: THREE.Vector3, radius: number) {
  return (p: THREE.Vector3) => {
    if (p.distanceTo(lamp) < radius + 2) return false
    if (p.y < lamp.y + radius * 0.5) return true
    const t = p.y / (p.y - lamp.y)
    return Math.hypot(p.x + (lamp.x - p.x) * t, p.z + (lamp.z - p.z) * t) > 12 + radius * t
  }
}

function skyDome(file: string) {
  const sky = new THREE.Mesh(
    once('sky-geometry', () => new THREE.SphereGeometry(100, 32, 16)),
    once(`sky:${file}`, () => {
      const map = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}sky/${file}`)
      map.colorSpace = THREE.SRGBColorSpace
      map.wrapS = THREE.RepeatWrapping
      map.repeat.x = -1
      map.anisotropy = 8
      return new THREE.MeshBasicMaterial({ map, side: THREE.BackSide, depthTest: false, depthWrite: false })
    }),
  )
  sky.renderOrder = -1001
  sky.frustumCulled = false
  return sky
}

export function buildRoom(root: THREE.Group, dims: RoomDims) {
  const floorY = -dims.thick - dims.leg
  const A = TRADITIONAL_ROOM.halfX
  const B = TRADITIONAL_ROOM.halfZ
  const ceil = floorY + ROOM_H
  const lintel = floorY + mm(1760)
  const post = mm(120)
  const D = mm(760)

  const hinoki = standard('hinoki', { map: grain('hinoki', 256, 512, [214, 182, 138], 60, 13), roughness: 0.55 }, 0.35)
  const darkWood = standard('dark-wood', { map: grain('dark-wood', 256, 256, [118, 80, 48], 50, 19), roughness: 0.45 }, 0.3)
  const lacquer = standard('lacquer', { color: 0x1b120c, roughness: 0.22 }, 0.3)
  const plaster = standard('plaster', { map: paint('plaster', 256, 256, plasterDraw('#cdbb96', 4), true), roughness: 0.95 }, 0.42)
  const alcove = standard('alcove', { map: paint('plaster', 256, 256, plasterDraw('#cdbb96', 4), true), color: 0xd8ccb8, roughness: 0.95 }, 0.34)
  const shoji = standard('shoji', {
    map: paint('shoji', 512, 1024, shojiDraw(false)),
    emissive: 0xfff4dc,
    emissiveMap: paint('shoji-glow', 512, 1024, shojiDraw(true)),
    emissiveIntensity: 0.55,
    roughness: 0.9,
    alphaTest: 0.5,
  })
  const fusuma = standard('fusuma', { map: paint('fusuma', 512, 1024, fusumaDraw), roughness: 0.8 }, 0.4)
  const ceilingMat = standard('ceiling', { map: paint('ceiling', 512, 512, ceilingDraw, true), roughness: 0.75 }, 0.42)
  const toko = standard('toko', { map: grain('toko', 512, 256, [96, 58, 32], 80, 29), roughness: 0.3 }, 0.3)
  const log = standard('log', { map: grain('log', 256, 512, [168, 122, 74], 70, 37), roughness: 0.4 }, 0.3)

  const parts: Parts = new Map()
  const groups = { px: new THREE.Group(), nx: new THREE.Group(), pz: new THREE.Group(), nz: new THREE.Group(), up: new THREE.Group(), items: new THREE.Group() }
  root.add(...Object.values(groups))
  const sides = { px: { ry: -Math.PI / 2, half: A }, nx: { ry: Math.PI / 2, half: A }, pz: { ry: Math.PI, half: B }, nz: { ry: 0, half: B } }

  const frame = (s: Side, len: number, posts: number[], skipNageshi: [number, number][] = []) => {
    for (const u of posts) put(parts, hinoki, beam(s, u - post / 2, u + post / 2, floorY, ceil, -post / 2, post / 2))
    const runs: [number, number][] = []
    let start = -len
    for (const [a, b] of [...skipNageshi].sort((p, q) => p[0] - q[0])) {
      if (a > start) runs.push([start, a])
      start = b
    }
    if (start < len) runs.push([start, len])
    for (const [a, b] of runs) {
      put(parts, hinoki, beam(s, a, b, lintel + mm(45), lintel + mm(140), post / 2, post / 2 + mm(30)))
      put(parts, hinoki, beam(s, a, b, lintel, lintel + mm(45), 0, post / 2 - 0.2))
    }
    put(parts, hinoki, beam(s, -len, len, ceil - mm(50), ceil, 0, mm(50)))
  }

  const sliding = (s: Side, u0: number, u1: number, material: THREE.Material, pair: boolean) => {
    const m = (u0 + u1) / 2
    put(parts, material, panel(s, u0 + post / 2, m + 0.4, floorY + 0.3, lintel, 0.9))
    put(parts, material, panel(s, m - 0.4, u1 - post / 2, floorY + 0.3, lintel, 1.5, 0, pair))
    put(parts, hinoki, beam(s, u0 + post / 2, u1 - post / 2, floorY, floorY + 0.3, -0.4, 2.2))
  }

  const upper = (s: Side, len: number, from = -len, to = len) => put(parts, plaster, panel(s, from, to, lintel + mm(45), ceil, 0, plasterTile))

  const posts6 = [-B, -B + 2 * TATAMI_W, B - 2 * TATAMI_W, B]
  for (const key of ['px', 'nx'] as const) {
    const s = sides[key]
    frame(s, B, posts6)
    upper(s, B)
    for (let i = 0; i < 3; i++) sliding(s, posts6[i], posts6[i + 1], key === 'px' ? shoji : fusuma, key === 'nx')
    bake(parts, groups[key])
  }

  {
    const s = sides.pz
    frame(s, A, [0])
    upper(s, A)
    sliding(s, -A, 0, fusuma, true)
    put(parts, plaster, panel(s, 0, A, floorY, lintel, 0, plasterTile))
    put(parts, hinoki, beam(s, 0, A, floorY, floorY + 0.3, -0.4, 1.2))
    bake(parts, groups.pz)
  }

  {
    const s = sides.nz
    const otoshi = floorY + mm(1950)
    const tokoTop = floorY + mm(120)
    frame(s, A, [], [[-A, 0]])
    put(parts, plaster, panel(s, -A, 0, otoshi + mm(60), ceil, 0, plasterTile))
    upper(s, A, 0, A)
    put(parts, darkWood, beam(s, -A + post / 2, -0.6, otoshi, otoshi + mm(60), -0.6, 1.4))
    put(parts, lacquer, beam(s, -A + post / 2, -0.8, floorY, tokoTop, -0.6, 1.6))
    put(parts, toko, beam(s, -A, 0, floorY, tokoTop - 0.05, -D, -0.6))
    put(parts, alcove, panel(s, -A, A, floorY, ceil, -D, plasterTile))
    put(
      parts,
      alcove,
      onWall(
        tileUV(new THREE.PlaneGeometry(D, ceil - floorY).rotateY(Math.PI / 2), D / plasterTile, (ceil - floorY) / plasterTile),
        s,
        -A,
        (floorY + ceil) / 2,
        -D / 2,
      ),
    )
    put(
      parts,
      alcove,
      onWall(
        tileUV(new THREE.PlaneGeometry(D, ceil - floorY).rotateY(-Math.PI / 2), D / plasterTile, (ceil - floorY) / plasterTile),
        s,
        A,
        (floorY + ceil) / 2,
        -D / 2,
      ),
    )
    put(
      parts,
      alcove,
      onWall(
        tileUV(new THREE.PlaneGeometry(D, ceil - floorY).rotateY(-Math.PI / 2), D / plasterTile, (ceil - floorY) / plasterTile),
        s,
        -0.7,
        (floorY + ceil) / 2,
        -D / 2,
      ),
    )
    put(
      parts,
      alcove,
      onWall(
        tileUV(new THREE.PlaneGeometry(D, ceil - floorY).rotateY(Math.PI / 2), D / plasterTile, (ceil - floorY) / plasterTile),
        s,
        0.7,
        (floorY + ceil) / 2,
        -D / 2,
      ),
    )
    put(parts, log, onWall(new THREE.CylinderGeometry(mm(62), mm(70), ceil - floorY, 20), s, 0, (floorY + ceil) / 2, 0))
    put(parts, toko, beam(s, 0.7, A, floorY, floorY + mm(40), -D, 0.6))
    const shelfA = floorY + mm(1050)
    const shelfB = floorY + mm(820)
    const shelfD = mm(330)
    put(parts, toko, beam(s, 0.7, A * 0.58, shelfA, shelfA + mm(30), -D, -D + shelfD))
    put(parts, toko, beam(s, A * 0.42, A, shelfB, shelfB + mm(30), -D, -D + shelfD))
    put(parts, toko, beam(s, A * 0.5 - 0.4, A * 0.5 + 0.4, shelfB + mm(30), shelfA, -D + shelfD * 0.5 - 0.4, -D + shelfD * 0.5 + 0.4))
    put(parts, toko, beam(s, 0.7, 2.2, shelfA + mm(30), shelfA + mm(80), -D, -D + shelfD))
    put(parts, toko, beam(s, A - 1.5, A, shelfB + mm(30), shelfB + mm(80), -D, -D + shelfD))
    const tenbukuro = floorY + mm(1560)
    put(parts, toko, beam(s, 0.7, A, tenbukuro, tenbukuro + mm(30), -D, -0.6))
    put(parts, fusuma, panel(s, 0.7, A / 2, tenbukuro + mm(30), lintel, -1.2))
    put(parts, fusuma, panel(s, A / 2, A, tenbukuro + mm(30), lintel, -1.2, 0, true))
    put(parts, toko, beam(s, 0.7, A, lintel - 0.2, lintel + mm(45), -D, -1.0))
    const sx = -A / 2
    const scrollW = mm(470)
    const scrollTop = floorY + mm(2150)
    const scrollH = mm(1600)
    put(
      parts,
      standard('scroll', { map: scrollTexture(), roughness: 0.85 }, 0.4),
      onWall(new THREE.PlaneGeometry(scrollW, scrollH), s, sx, scrollTop - scrollH / 2, -D + 0.25),
    )
    put(parts, darkWood, onWall(new THREE.CylinderGeometry(0.42, 0.42, scrollW + 0.2, 14).rotateZ(Math.PI / 2), s, sx, scrollTop - scrollH - 0.2, -D + 0.6))
    for (const e of [-1, 1])
      put(
        parts,
        lacquer,
        onWall(new THREE.CylinderGeometry(0.55, 0.5, 1.1, 14).rotateZ(Math.PI / 2), s, sx + e * (scrollW / 2 + 0.6), scrollTop - scrollH - 0.2, -D + 0.6),
      )
    put(parts, darkWood, onWall(new THREE.BoxGeometry(scrollW + 0.2, 0.5, 0.35), s, sx, scrollTop - 0.1, -D + 0.45))
    put(parts, darkWood, onWall(new THREE.CylinderGeometry(0.05, 0.05, mm(260), 4), s, sx, scrollTop + mm(130), -D + 0.3))
    bake(parts, groups.nz)

    const vx = -A * 0.25
    const vz = -B - D * 0.45
    const vy = tokoTop
    put(parts, lacquer, place(box(mm(300), mm(25), mm(300), 0, mm(12.5), 0), vx, vy, vz))
    const celadon = standard('celadon', { color: 0x8fb09c, roughness: 0.22 }, 0.25)
    put(
      parts,
      celadon,
      place(
        lathe(
          [
            [0, 0],
            [1.6, 0],
            [2.4, 1.2],
            [2.8, 3.2],
            [2.5, 5.2],
            [1.3, 6.6],
            [1.0, 7.4],
            [1.35, 7.9],
            [1.15, 7.9],
            [0.85, 7.2],
          ],
          28,
        ),
        vx,
        vy + mm(25),
        vz,
      ),
    )
    const stem = standard('stem', { color: 0x4a3a22, roughness: 0.8 }, 0.25)
    const leaf = standard('leaf', { color: 0x2f4a26, roughness: 0.6 }, 0.25)
    const bloom = standard('bloom', { color: 0xb3242c, roughness: 0.55 }, 0.25)
    const base = new THREE.Vector3(vx, vy + mm(25) + 7.6, vz)
    const r = rng(8)
    for (const [len, tilt, yaw] of [
      [18, 0.5, 0.4],
      [12, 0.25, -2.2],
      [8, 0.7, 2.4],
    ]) {
      const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(yaw), Math.cos(tilt), Math.sin(tilt) * Math.sin(yaw))
      const g = new THREE.CylinderGeometry(0.12, 0.2, len, 5).translate(0, len / 2, 0)
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)).translate(base.x, base.y, base.z)
      put(parts, stem, g)
      for (let k = 0; k < 4; k++) {
        const p = base.clone().addScaledVector(dir, len * (0.45 + k * 0.17))
        const lg = new THREE.SphereGeometry(1, 8, 6)
          .scale(1.5, 0.12, 0.75)
          .rotateX((r() - 0.5) * 1.2)
          .rotateY(r() * Math.PI * 2)
          .rotateZ((r() - 0.5) * 0.8)
        put(parts, leaf, lg.translate(p.x + (r() - 0.5) * 1.2, p.y, p.z + (r() - 0.5) * 1.2))
      }
      const tip = base.clone().addScaledVector(dir, len + 0.3)
      put(parts, bloom, new THREE.SphereGeometry(0.95, 12, 8).scale(1, 0.7, 1).translate(tip.x, tip.y, tip.z))
    }
    bake(parts, groups.nz)
  }

  {
    const board = new THREE.PlaneGeometry(2 * A, 2 * B).rotateX(Math.PI / 2)
    tileUV(board, (2 * A) / 34, (2 * B) / 34)
    const uv = board.getAttribute('uv') as THREE.BufferAttribute
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), uv.getX(i))
    put(parts, ceilingMat, board.translate(0, ceil, 0))
    put(parts, ceilingMat, new THREE.PlaneGeometry(2 * A, D).rotateX(Math.PI / 2).translate(0, ceil, -B - D / 2))
    for (let k = 1; k < 12; k++) put(parts, darkWood, box(2 * A, mm(40), mm(36), 0, ceil - mm(20), -B + k * mm(455)))
    put(parts, darkWood, new THREE.CylinderGeometry(1.4, 1.4, 0.6, 20).translate(0, ceil - 0.3, 0))
    bake(parts, groups.up)
  }

  const fabric = standard('kyosoku', { color: 0x5a2f48, roughness: 0.75 })
  const kyoWood = standard('kyosoku-wood', { map: grain('kyosoku-wood', 256, 256, [92, 56, 32], 50, 91), roughness: 0.35 })
  const clay = standard('clay', { color: 0x8a3c22, roughness: 0.45 })
  const cupMat = standard('cup', { color: 0xdcc8ae, roughness: 0.35 })
  const tea = standard('tea', { color: 0x8f9a3c, roughness: 0.08 })
  const bamboo = standard('bamboo', { color: 0xcaa66a, roughness: 0.6 })
  const zabuton = standard('zabuton-mat', { map: zabutonTexture(), roughness: 0.95 })
  for (const sgn of [1, -1]) {
    const yaw = sgn === 1 ? 0 : Math.PI
    const cz = sgn * (dims.halfD + ZABUTON.gap)
    const cushion = new THREE.Mesh(new RoundedBoxGeometry(ZABUTON.w, ZABUTON.h, ZABUTON.d, 2, 0.7), zabuton)
    cushion.position.set(0, floorY + ZABUTON.h / 2, cz)
    cushion.castShadow = cushion.receiveShadow = true
    groups.items.add(cushion)
    const kx = -sgn * 13.5
    put(parts, fabric, place(new RoundedBoxGeometry(3.4, 1.6, mm(450), 2, 0.7), kx, floorY + mm(300) - 0.8, cz + sgn * 1, yaw))
    put(parts, kyoWood, place(box(0.7, mm(300) - 2.2, 1.6, 0, 0, mm(150)), kx, floorY + (mm(300) - 2.2) / 2 + 0.6, cz + sgn * 1, yaw))
    put(parts, kyoWood, place(box(0.7, mm(300) - 2.2, 1.6, 0, 0, -mm(150)), kx, floorY + (mm(300) - 2.2) / 2 + 0.6, cz + sgn * 1, yaw))
    put(parts, kyoWood, place(new RoundedBoxGeometry(3.0, 0.6, mm(400), 2, 0.25), kx, floorY + 0.3, cz + sgn * 1, yaw))
    const tx = sgn * 15.5
    const tz = sgn * (dims.halfD + 10)
    const local = (g: THREE.BufferGeometry, x: number, y: number, z: number) => g.translate(x, y, z).rotateY(yaw).translate(tx, floorY, tz)
    put(
      parts,
      lacquer,
      local(
        lathe(
          [
            [0, 0],
            [4.2, 0],
            [4.4, 0.7],
            [4.55, 0.75],
            [4.4, 0.3],
            [0, 0.3],
          ],
          32,
        ),
        0,
        0,
        0,
      ),
    )
    put(
      parts,
      clay,
      local(
        lathe(
          [
            [0, 0],
            [1.3, 0],
            [1.9, 0.4],
            [2.2, 1.3],
            [2.0, 2.3],
            [1.3, 2.7],
            [1.25, 2.8],
          ],
          20,
        ),
        -1.6,
        0.3,
        -1.2,
      ),
    )
    put(
      parts,
      clay,
      local(
        lathe(
          [
            [0, 0],
            [1.3, 0],
            [1.2, 0.2],
            [0.55, 0.38],
            [0.3, 0.5],
            [0.32, 0.75],
            [0, 0.8],
          ],
          16,
        ),
        -1.6,
        3.05,
        -1.2,
      ),
    )
    put(parts, clay, local(new THREE.CylinderGeometry(0.18, 0.36, 2.2, 8).rotateZ(-Math.PI / 4), 0.85, 2.3, -1.2))
    put(parts, clay, local(new THREE.CylinderGeometry(0.3, 0.34, 3.2, 8).rotateX(Math.PI / 2 - 0.15), -1.6, 2.0, -4.6))
    put(
      parts,
      darkWood,
      local(
        lathe(
          [
            [0, 0],
            [1.7, 0],
            [1.75, 0.25],
            [1.2, 0.3],
            [0, 0.3],
          ],
          20,
        ),
        1.8,
        0.3,
        1.6,
      ),
    )
    put(
      parts,
      cupMat,
      local(
        lathe(
          [
            [0, 0],
            [0.9, 0],
            [0.95, 0.2],
            [1.12, 2.5],
            [1.02, 2.5],
            [0.86, 0.45],
            [0, 0.45],
          ],
          20,
        ),
        1.8,
        0.6,
        1.6,
      ),
    )
    put(parts, tea, local(new THREE.CircleGeometry(1.0, 20).rotateX(-Math.PI / 2), 1.8, 2.6, 1.6))
    put(parts, bamboo, local(new RoundedBoxGeometry(0.75, 0.5, mm(215), 2, 0.2), 5.6, 0.25, -4.5))
    bake(parts, groups.items, true, true)
  }

  const lamp = new THREE.Group()
  root.add(lamp)
  const lampH = mm(330)
  const lampY = floorY + mm(1480)
  const lampR = mm(190)
  const washi = standard('lantern', {
    color: 0xfff3dc,
    emissive: 0xffcf96,
    emissiveIntensity: 1.25,
    emissiveMap: paint('lantern', 256, 256, lanternDraw, true),
    roughness: 1,
  })
  put(
    parts,
    washi,
    lathe(
      [
        [0, -lampH / 2],
        [lampR * 0.72, -lampH / 2],
        [lampR * 0.94, -lampH * 0.28],
        [lampR, 0],
        [lampR * 0.94, lampH * 0.28],
        [lampR * 0.72, lampH / 2],
        [0, lampH / 2],
      ],
      32,
    ).translate(0, lampY, 0),
  )
  for (const sgn of [1, -1])
    put(parts, darkWood, new THREE.TorusGeometry(lampR * 0.72, 0.18, 6, 32).rotateX(Math.PI / 2).translate(0, lampY + (sgn * lampH) / 2, 0))
  put(parts, darkWood, new THREE.CylinderGeometry(0.07, 0.07, ceil - lampY - lampH / 2, 4).translate(0, (ceil + lampY + lampH / 2) / 2, 0))
  bake(parts, lamp)
  const paper = standard('andon', {
    color: 0xfff2da,
    emissive: 0xffc27e,
    emissiveIntensity: 1.1,
    emissiveMap: paint('andon', 128, 256, andonDraw),
    roughness: 1,
    side: THREE.DoubleSide,
  })
  const aw = mm(300)
  const ah = mm(760)
  for (const [x, z] of [
    [A - 10, -B + 10],
    [-A + 10, B - 10],
  ]) {
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      put(parts, kyoWood, box(0.55, ah, 0.55, x + (sx * aw) / 2, floorY + ah / 2, z + (sz * aw) / 2))
    for (const y of [mm(40), mm(150), ah - 0.25]) {
      put(parts, kyoWood, box(aw, 0.45, 0.45, x, floorY + y, z - aw / 2))
      put(parts, kyoWood, box(aw, 0.45, 0.45, x, floorY + y, z + aw / 2))
      put(parts, kyoWood, box(0.45, 0.45, aw, x - aw / 2, floorY + y, z))
      put(parts, kyoWood, box(0.45, 0.45, aw, x + aw / 2, floorY + y, z))
    }
    put(parts, kyoWood, box(aw - 0.4, 0.3, aw - 0.4, x, floorY + mm(150), z))
    for (let k = 0; k < 4; k++)
      put(
        parts,
        paper,
        new THREE.PlaneGeometry(aw - 0.5, ah - mm(150) - 1.2)
          .translate(0, 0, aw / 2 - 0.05)
          .rotateY((k * Math.PI) / 2)
          .translate(x, floorY + mm(150) + (ah - mm(150)) / 2, z),
      )
  }
  bake(parts, groups.items)

  cutaway(
    root,
    [
      [groups.px, (p) => p.x < A - 2],
      [groups.nx, (p) => p.x > -A + 2],
      [groups.pz, (p) => p.z < B - 2],
      [groups.nz, (p) => p.z > -B + 2],
      [groups.up, (p) => p.y < ceil - 1],
      [lamp, clearOfBoard(new THREE.Vector3(0, lampY, 0), lampR + 0.5)],
    ],
    skyDome('ninomaru_teien.jpg'),
  )
}

const andonDraw: Draw = (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#d8d0c0')
  g.addColorStop(0.55, '#ffffff')
  g.addColorStop(1, '#efe6d6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(120,80,40,0.35)'
  ctx.fillRect(w / 2 - 1.5, 0, 3, h)
  ctx.fillRect(0, h / 2 - 1.5, w, 3)
}

const lanternDraw: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  const r = rng(14)
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(200,170,120,${r() * 0.12})`
    ctx.fillRect(r() * w, r() * h, 1 + r() * 4, 1)
  }
  ctx.fillStyle = 'rgba(150,110,60,0.45)'
  for (let y = 0; y < h; y += 32) ctx.fillRect(0, y, w, 3)
}

const wallpaperDraw: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#ece5d6'
  ctx.fillRect(0, 0, w, h)
  const r = rng(17)
  for (let i = 0; i < 7000; i++) {
    ctx.fillStyle = r() < 0.5 ? `rgba(120,100,70,${r() * 0.08})` : `rgba(255,255,255,${r() * 0.2})`
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2)
  }
}

const rugDraw: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#b0563a'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#e9dcc0'
  ctx.fillRect(18, 18, w - 36, h - 36)
  ctx.fillStyle = '#c86e48'
  ctx.fillRect(34, 34, w - 68, h - 68)
  ctx.strokeStyle = '#e9dcc0'
  ctx.lineWidth = 6
  for (let y = 70; y < h - 60; y += 70)
    for (let x = 70; x < w - 60; x += 70) {
      ctx.beginPath()
      ctx.moveTo(x, y - 22)
      ctx.lineTo(x + 22, y)
      ctx.lineTo(x, y + 22)
      ctx.lineTo(x - 22, y)
      ctx.closePath()
      ctx.stroke()
    }
  const r = rng(31)
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(${r() < 0.5 ? '60,20,10' : '255,240,210'},${r() * 0.12})`
    ctx.fillRect(r() * w, r() * h, 2, 2)
  }
}

const artDraw: Draw = (ctx, w, h) => {
  ctx.fillStyle = '#f1ebdc'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#d9b48a'
  ctx.beginPath()
  ctx.arc(w * 0.68, h * 0.34, h * 0.16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5f7f8c'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.85)
  ctx.lineTo(w * 0.42, h * 0.28)
  ctx.lineTo(w * 0.62, h * 0.55)
  ctx.lineTo(w * 0.75, h * 0.45)
  ctx.lineTo(w, h * 0.8)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.fill()
  ctx.fillStyle = '#f7f4ec'
  ctx.beginPath()
  ctx.moveTo(w * 0.33, h * 0.4)
  ctx.lineTo(w * 0.42, h * 0.28)
  ctx.lineTo(w * 0.5, h * 0.39)
  ctx.lineTo(w * 0.45, h * 0.36)
  ctx.lineTo(w * 0.4, h * 0.41)
  ctx.fill()
  ctx.fillStyle = '#3f5a50'
  ctx.fillRect(0, h * 0.86, w, h * 0.14)
}

const clockDraw: Draw = (ctx, w) => {
  const c = w / 2
  ctx.fillStyle = '#faf7f0'
  ctx.fillRect(0, 0, w, w)
  ctx.fillStyle = '#2b2b2b'
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const big = i % 3 === 0
    ctx.save()
    ctx.translate(c, c)
    ctx.rotate(a)
    ctx.fillRect(-(big ? 4 : 2), -c * 0.9, big ? 8 : 4, big ? 22 : 12)
    ctx.restore()
  }
  const hand = (a: number, len: number, width: number) => {
    ctx.save()
    ctx.translate(c, c)
    ctx.rotate(a)
    ctx.fillRect(-width / 2, -len, width, len + 10)
    ctx.restore()
  }
  hand((10 / 12) * Math.PI * 2 + (8 / 60) * (Math.PI / 6), c * 0.5, 9)
  hand((8 / 60) * Math.PI * 2, c * 0.75, 6)
  ctx.fillStyle = '#b3402a'
  hand((40 / 60) * Math.PI * 2, c * 0.8, 2)
}

const doorDraw: Draw = (ctx, w, h) => {
  ctx.drawImage(grainTexture(w, h, [196, 160, 116], 60, 51), 0, 0)
  ctx.fillStyle = 'rgba(70,44,20,0.35)'
  for (const f of [0.25, 0.5, 0.75]) ctx.fillRect(0, h * f, w, 3)
}

const sunDraw: Draw = (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h)
  ctx.filter = 'blur(10px)'
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(255,236,190,0.9)')
  g.addColorStop(1, 'rgba(255,236,190,0.15)')
  ctx.fillStyle = g
  ctx.fillRect(16, 16, w / 2 - 22, h - 32)
  ctx.fillRect(w / 2 + 6, 16, w / 2 - 22, h - 32)
}

export function buildCasual(root: THREE.Group, dims: RoomDims) {
  const top = -dims.thick
  const floorY = top - TABLE_H
  const A = CASUAL_ROOM.halfX
  const B = CASUAL_ROOM.halfZ
  const ceil = floorY + ROOM_H
  const tableW = 2 * TABLE.halfW
  const tableD = 2 * TABLE.halfD
  const tableT = mm(30)

  const parts: Parts = new Map()
  const groups = {
    px: new THREE.Group(),
    nx: new THREE.Group(),
    pz: new THREE.Group(),
    nz: new THREE.Group(),
    up: new THREE.Group(),
    items: new THREE.Group(),
    table: new THREE.Group(),
  }
  root.add(...Object.values(groups))
  const sides = { px: { ry: -Math.PI / 2, half: A }, nx: { ry: Math.PI / 2, half: A }, pz: { ry: Math.PI, half: B }, nz: { ry: 0, half: B } }

  const paper = standard('wallpaper', { map: paint('wallpaper', 256, 256, wallpaperDraw, true), roughness: 0.95 }, 0.5)
  const trim = standard('trim', { color: 0xf3efe6, roughness: 0.6 }, 0.35)
  const oak = standard('oak', { map: grain('oak', 256, 256, [184, 140, 96], 60, 61), roughness: 0.5 }, 0.3)
  const walnut = standard('walnut', { map: grain('walnut', 256, 256, [110, 72, 44], 60, 67), roughness: 0.45 }, 0.3)
  const sash = standard('sash', { color: 0xcfcfca, roughness: 0.35, metalness: 0.4 }, 0.3)
  const tile = 24

  const wallRun = (s: Side, len: number, holes: [number, number, number, number][] = []) => {
    const h0 = floorY
    if (!holes.length) put(parts, paper, panel(s, -len, len, h0, ceil, 0, tile))
    for (const [u0, u1, y0, y1] of holes) {
      put(parts, paper, panel(s, -len, u0, h0, ceil, 0, tile))
      put(parts, paper, panel(s, u1, len, h0, ceil, 0, tile))
      put(parts, paper, panel(s, u0, u1, h0, y0, 0, tile))
      put(parts, paper, panel(s, u0, u1, y1, ceil, 0, tile))
    }
    put(parts, walnut, beam(s, -len, len, floorY, floorY + mm(60), 0, 0.4))
    put(parts, trim, beam(s, -len, len, ceil - mm(30), ceil, 0, mm(25)))
  }

  for (const key of ['px', 'nx', 'pz'] as const) {
    wallRun(sides[key], key === 'pz' ? A : B)
    bake(parts, groups[key])
  }

  {
    const s = sides.pz
    const d0 = -mm(1200) - mm(390)
    put(parts, standard('door', { map: paint('door', 256, 512, doorDraw), roughness: 0.55 }, 0.32), panel(s, d0, d0 + mm(780), floorY, floorY + mm(2000), 0.15))
    put(parts, trim, beam(s, d0 - 1.2, d0, floorY, floorY + mm(2000) + 1.2, 0, 0.6))
    put(parts, trim, beam(s, d0 + mm(780), d0 + mm(780) + 1.2, floorY, floorY + mm(2000) + 1.2, 0, 0.6))
    put(parts, trim, beam(s, d0, d0 + mm(780), floorY + mm(2000), floorY + mm(2000) + 1.2, 0, 0.6))
    put(parts, sash, beam(s, d0 + mm(700), d0 + mm(740), floorY + mm(1000), floorY + mm(1030), 0.2, 1.6))
    put(parts, sash, beam(s, d0 + mm(640), d0 + mm(740), floorY + mm(1000), floorY + mm(1030), 1.4, 1.7))
    const cx = mm(900)
    put(parts, oak, beam(s, cx - mm(800), cx + mm(800), floorY + mm(60), floorY + mm(820), 0.2, mm(420)))
    put(parts, oak, beam(s, cx - mm(820), cx + mm(820), floorY + mm(820), floorY + mm(850), 0.2, mm(440)))
    for (const k of [-1, 0, 1])
      put(parts, walnut, beam(s, cx + k * mm(530) - 0.1, cx + k * mm(530) + 0.1, floorY + mm(90), floorY + mm(800), mm(420), mm(420) + 0.1))
    put(parts, walnut, beam(s, cx - mm(800), cx + mm(800), floorY + mm(440), floorY + mm(450), mm(420), mm(420) + 0.1))
    put(
      parts,
      standard('clock', { map: paint('clock', 256, 256, clockDraw), roughness: 0.4 }, 0.35),
      onWall(new THREE.CircleGeometry(mm(140), 32), s, cx, floorY + mm(1900), 1.15),
    )
    put(parts, walnut, onWall(new THREE.CylinderGeometry(mm(160), mm(160), 1.1, 32, 1, true).rotateX(Math.PI / 2), s, cx, floorY + mm(1900), 0.6))
    put(parts, walnut, onWall(new THREE.RingGeometry(mm(140), mm(160), 32), s, cx, floorY + mm(1900), 1.15))
    put(
      parts,
      standard('art', { map: paint('art', 384, 256, artDraw), roughness: 0.7 }, 0.35),
      onWall(new THREE.PlaneGeometry(mm(450), mm(300)), s, cx - mm(500), floorY + mm(1320), 0.5),
    )
    put(parts, walnut, beam(s, cx - mm(500) - mm(245), cx - mm(500) + mm(245), floorY + mm(1320) - mm(170), floorY + mm(1320) + mm(170), 0, 0.45))
    bake(parts, groups.pz)
    const kettle = standard('kettle', { color: 0xe8e4dc, roughness: 0.3 }, 0.25)
    const sb = (x: number, z: number) => [-x, floorY + mm(850), B - z] as const
    const [kx, ky, kz] = sb(cx + mm(450), mm(200))
    put(
      parts,
      kettle,
      lathe(
        [
          [0, 0],
          [2.6, 0],
          [2.8, 1],
          [2.6, 5.4],
          [2.0, 6.2],
          [0, 6.4],
        ],
        20,
      ).translate(kx, ky, kz),
    )
    put(parts, sash, new THREE.TorusGeometry(1.6, 0.3, 6, 12, Math.PI).translate(kx, ky + 6.2, kz))
    put(parts, sash, new THREE.CylinderGeometry(0.25, 0.5, 2.2, 8).rotateZ(Math.PI / 3).translate(kx + 2.8, ky + 4.4, kz))
    const [bx, by, bz] = sb(cx - mm(300), mm(210))
    put(
      parts,
      standard('basket', { color: 0xb48c5a, roughness: 0.9 }, 0.25),
      lathe(
        [
          [0, 0],
          [4.2, 0],
          [5.4, 3.2],
          [5.0, 3.2],
          [3.8, 0.4],
          [0, 0.4],
        ],
        18,
      ).translate(bx, by, bz),
    )
    const fruit = standard('apple', { color: 0xb8322a, roughness: 0.45 }, 0.25)
    for (const [ox, oz] of [
      [-1.5, 0],
      [1.4, 0.8],
      [0.2, -1.6],
    ])
      put(parts, fruit, new THREE.SphereGeometry(1.4, 12, 10).translate(bx + ox, by + 1.9, bz + oz))
    bake(parts, groups.pz)
  }

  {
    const s = sides.nz
    const w0 = -mm(950)
    const w1 = mm(950)
    const y0 = floorY + mm(700)
    const y1 = floorY + mm(2050)
    wallRun(s, A, [[w0, w1, y0, y1]])
    put(
      parts,
      standard('glass', { map: paint('glass', 512, 512, glassDraw), roughness: 0.05, metalness: 0.2, transparent: true, depthWrite: false }),
      panel(s, w0, w1, y0, y1, -1.0),
    )
    put(parts, sash, beam(s, w0, w0 + 1.2, y0, y1, -1.6, 0.6))
    put(parts, sash, beam(s, w1 - 1.2, w1, y0, y1, -1.6, 0.6))
    put(parts, sash, beam(s, w0, w1, y1 - 1.2, y1, -1.6, 0.6))
    put(parts, sash, beam(s, w0, w1, y0, y0 + 1.0, -1.6, 0.6))
    put(parts, sash, beam(s, -0.6, 0.6, y0, y1, -1.4, -0.4))
    put(parts, oak, beam(s, w0 - 1.2, w1 + 1.2, y0 - 0.7, y0, -1.6, 2.4))
    const rodY = y1 + 3.5
    put(parts, sash, onWall(new THREE.CylinderGeometry(0.35, 0.35, w1 - w0 + 26, 10).rotateZ(Math.PI / 2), s, 0, rodY, 3.4))
    for (const u of [w0 - 13, w1 + 13]) put(parts, sash, onWall(new THREE.SphereGeometry(0.7, 10, 8), s, u, rodY, 3.4))
    const curtain = standard('curtain', { color: 0xa9b59a, roughness: 1, side: THREE.DoubleSide }, 0.35)
    for (const [u0, u1] of [
      [w0 - 12, w0 + 5],
      [w1 - 5, w1 + 12],
    ]) {
      const width = u1 - u0
      const height = rodY - floorY - 2
      const g = new THREE.PlaneGeometry(width, height, 36, 1)
      const pos = g.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) / width) * Math.PI * 9) * 0.9)
      g.computeVertexNormals()
      put(parts, curtain, onWall(g, s, (u0 + u1) / 2, floorY + 2 + height / 2, 2.8))
    }
    const sheer = standard('sheer', {
      color: 0xffffff,
      roughness: 1,
      transparent: true,
      opacity: 0.32,
      emissive: 0xffffff,
      emissiveIntensity: 0.25,
      depthWrite: false,
    })
    const g = new THREE.PlaneGeometry(w1 - w0 - 8, y1 - y0 + 4, 60, 1)
    const pos = g.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 1.3) * 0.35)
    g.computeVertexNormals()
    put(parts, sheer, onWall(g, s, 0, (y0 + y1) / 2 + 1, 2.0))
    bake(parts, groups.nz)
    const sun = new THREE.Mesh(
      new THREE.PlaneGeometry(w1 - w0, 30).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: paint('sun', 256, 128, sunDraw),
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    sun.position.set(6, floorY + 0.06, -B + 19)
    sun.geometry.applyMatrix4(new THREE.Matrix4().makeShear(0, 0, 0, 0, 0.3, 0))
    groups.items.add(sun)
  }

  {
    const s = sides.nx
    put(
      parts,
      standard('art2', { map: paint('art', 384, 256, artDraw), roughness: 0.7 }, 0.35),
      panel(s, -mm(380), mm(380), floorY + mm(1250), floorY + mm(1250) + mm(500), 0.5),
    )
    put(parts, oak, beam(s, -mm(400), mm(400), floorY + mm(1230), floorY + mm(1770), 0, 0.45))
    bake(parts, groups.nx)
    const sofa = standard('sofa', { color: 0x6f7f8e, roughness: 0.95 }, 0.3)
    const pillow = standard('pillow', { color: 0xd8a24a, roughness: 0.95 }, 0.22)
    const pillow2 = standard('pillow2', { color: 0xe8dfcc, roughness: 0.95 }, 0.22)
    const x0 = -A
    const len = mm(1800)
    const depth = mm(850)
    const rb = (w: number, h: number, d: number, r: number, x: number, y: number, z: number) => new RoundedBoxGeometry(w, h, d, 2, r).translate(x, y, z)
    put(parts, sofa, rb(depth - 1, 6, len - 4, 0.8, x0 + depth / 2, floorY + 2.4 + 3, 0))
    put(parts, sofa, rb(4.5, mm(800) - 2.4, len - 2, 1.2, x0 + 2.6, floorY + 2.4 + (mm(800) - 2.4) / 2, 0))
    for (const z of [-1, 1]) put(parts, sofa, rb(depth, mm(600) - 2.4, 4.5, 1.4, x0 + depth / 2, floorY + 2.4 + (mm(600) - 2.4) / 2, z * (len / 2 - 2.25)))
    for (const z of [-1, 1]) {
      put(parts, sofa, rb(depth - 6.5, 4.2, len / 2 - 4.6, 1.4, x0 + 5 + (depth - 6.5) / 2, floorY + 8.4 + 2.1, (z * (len / 2 - 4.5)) / 2))
      put(parts, sofa, rb(5, 13, len / 2 - 4.8, 1.8, x0 + 6.4, floorY + 12.6 + 6.3, (z * (len / 2 - 4.5)) / 2))
    }
    put(parts, pillow, rb(3.4, 10, 10, 1.6, x0 + 10.5, floorY + 12.6 + 5.2, -15))
    put(parts, pillow2, rb(3.4, 9, 9, 1.6, x0 + 10.6, floorY + 12.6 + 4.6, 14.5))
    for (const [x, z] of [
      [x0 + 2, -len / 2 + 2],
      [x0 + depth - 2, -len / 2 + 2],
      [x0 + 2, len / 2 - 2],
      [x0 + depth - 2, len / 2 - 2],
    ])
      put(parts, walnut, new THREE.CylinderGeometry(0.5, 0.35, 2.4, 8).translate(x, floorY + 1.2, z))
    const rugX0 = x0 + depth - 6
    const rugX1 = -18
    const rug = new THREE.BoxGeometry(rugX1 - rugX0, 0.3, mm(1600))
    bake(parts, groups.nx, true, true)
    const rugMesh = new THREE.Mesh(
      rug.translate((rugX0 + rugX1) / 2, floorY + 0.15, 0),
      standard('rug', { map: paint('rug', 512, 768, rugDraw), roughness: 1 }, 0.18),
    )
    rugMesh.receiveShadow = true
    groups.items.add(rugMesh)
    const lx = x0 + 7
    const lz = -len / 2 - 7
    put(parts, walnut, new THREE.CylinderGeometry(3.4, 3.8, 0.7, 24).translate(lx, floorY + 0.35, lz))
    put(parts, sash, new THREE.CylinderGeometry(0.3, 0.3, mm(1450), 8).translate(lx, floorY + mm(725), lz))
    const shade = standard('shade', { color: 0xf6ead2, emissive: 0xffd9a0, emissiveIntensity: 0.9, roughness: 1, side: THREE.DoubleSide })
    put(parts, shade, new THREE.CylinderGeometry(4.6, 6.2, 7.5, 28, 1, true).translate(lx, floorY + mm(1450) + 1.5, lz))
    bake(parts, groups.nx)
  }

  {
    const shelfX1 = A - 0.2
    const shelfX0 = A - mm(320)
    const w = mm(1250)
    const h = mm(1800)
    const z0 = -w / 2
    const levels = 5
    const t = 0.7
    put(parts, oak, box(shelfX1 - shelfX0, h, t, (shelfX0 + shelfX1) / 2, floorY + h / 2, z0 + t / 2))
    put(parts, oak, box(shelfX1 - shelfX0, h, t, (shelfX0 + shelfX1) / 2, floorY + h / 2, -z0 - t / 2))
    for (let i = 0; i <= levels; i++)
      put(parts, oak, box(shelfX1 - shelfX0, t, w, (shelfX0 + shelfX1) / 2, floorY + 1.2 + (i * (h - 1.2 - t)) / levels + t / 2, 0))
    put(parts, oak, box(shelfX1 - shelfX0, 1.2, w, (shelfX0 + shelfX1) / 2, floorY + 0.6, 0))
    put(parts, walnut, box(0.2, h, w, shelfX1 - 0.1, floorY + h / 2, 0))
    bake(parts, groups.px, true, false)
    const r = rng(42)
    const palette = ['#a04a3a', '#3f5f88', '#e2d9c2', '#6f8248', '#d49a48', '#6a5a4a', '#b8663a', '#efe9da', '#5a6c90', '#8f3a4a', '#3e7a72', '#c9b38a']
    const mats: THREE.Matrix4[] = []
    const colors: THREE.Color[] = []
    const gap = (h - 1.2 - t) / levels
    for (let i = 0; i < levels; i++) {
      const y = floorY + 1.2 + t + i * gap
      let z = z0 + t + 0.3
      const end = -z0 - t - 0.3
      const skip = i === 1 ? [0.55, 0.85] : i === 3 ? [0.05, 0.3] : null
      while (z < end - 0.8) {
        const f = (z - z0) / w
        if (skip && f > skip[0] && f < skip[1]) {
          z += 1
          continue
        }
        const bw = 0.6 + r() * 0.9
        const bh = Math.min(gap - t - 0.4, 6 + r() * 3)
        const bd = 4.2 + r() * 2.4
        const lean = r() < 0.06 ? 0.22 : 0
        const m = new THREE.Matrix4().compose(
          new THREE.Vector3(shelfX1 - 0.3 - bd / 2, y + bh / 2 + (lean ? 0.2 : 0), z + bw / 2),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(lean, 0, 0)),
          new THREE.Vector3(bd, bh, bw),
        )
        mats.push(m)
        colors.push(new THREE.Color(palette[Math.floor(r() * palette.length)]))
        z += bw + (lean ? 1.6 : 0.05)
      }
    }
    const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), standard('book', { roughness: 0.75, emissive: 0x2a2018 }), mats.length)
    mats.forEach((m, i) => {
      books.setMatrixAt(i, m)
      books.setColorAt(i, colors[i])
    })
    groups.px.add(books)
    const potMat = standard('pot-white', { color: 0xf0ece4, roughness: 0.4 }, 0.25)
    const succ = standard('succ', { color: 0x6e9a5c, roughness: 0.7 }, 0.25)
    const y1 = floorY + 1.2 + t + gap
    put(
      parts,
      potMat,
      lathe(
        [
          [0, 0],
          [1.6, 0],
          [1.9, 2.6],
          [1.7, 2.6],
          [0, 2.4],
        ],
        16,
      ).translate(shelfX1 - 4, y1, z0 + w * 0.7),
    )
    for (let k = 0; k < 7; k++)
      put(
        parts,
        succ,
        new THREE.SphereGeometry(0.8, 8, 6)
          .scale(0.6, 1.3, 0.6)
          .rotateZ((k - 3) * 0.3)
          .translate(shelfX1 - 4 + ((k % 3) - 1) * 0.5, y1 + 3.2, z0 + w * 0.7 + (k - 3) * 0.3),
      )
    const y3 = floorY + 1.2 + t + 3 * gap
    put(
      parts,
      standard('photo', { map: paint('art', 384, 256, artDraw), roughness: 0.5 }, 0.3),
      new THREE.PlaneGeometry(mm(180), mm(130))
        .rotateY(-Math.PI / 2)
        .rotateZ(0)
        .translate(shelfX1 - 3.2, y3 + 2.3, z0 + w * 0.17),
    )
    put(parts, walnut, box(0.3, mm(150), mm(200), shelfX1 - 3, y3 + 2.3, z0 + w * 0.17))
    bake(parts, groups.px)

    const px = A - 11
    const pz = -B + 11
    const terracotta = standard('terracotta', { color: 0xb5643c, roughness: 0.85 }, 0.22)
    put(
      parts,
      terracotta,
      lathe(
        [
          [0, 0],
          [3.6, 0],
          [4.8, 10],
          [5.2, 10.4],
          [5.2, 11],
          [4.6, 11],
          [4.3, 10.2],
          [0, 9.8],
        ],
        24,
      ).translate(px, floorY, pz),
    )
    put(
      parts,
      standard('soil', { color: 0x3a2a1c, roughness: 1 }, 0.2),
      new THREE.CircleGeometry(4.5, 20).rotateX(-Math.PI / 2).translate(px, floorY + 10.2, pz),
    )
    bake(parts, groups.items, true, false)
    const leaves: THREE.Matrix4[] = []
    const stems: THREE.BufferGeometry[] = []
    for (let i = 0; i < 16; i++) {
      const yaw = (i / 16) * Math.PI * 2 + r() * 0.4
      const tilt = 0.25 + r() * 0.6
      const len = 14 + r() * 20
      const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(yaw), Math.cos(tilt), Math.sin(tilt) * Math.sin(yaw))
      const base = new THREE.Vector3(px, floorY + 10, pz)
      const tip = base.clone().addScaledVector(dir, len)
      const g = new THREE.CylinderGeometry(0.15, 0.25, len, 5).translate(0, len / 2, 0)
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)).translate(base.x, base.y, base.z)
      stems.push(g)
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5 - r() * 0.6, -yaw + Math.PI / 2, 0, 'YXZ'))
      leaves.push(
        new THREE.Matrix4().compose(
          tip.add(new THREE.Vector3(Math.cos(yaw), -0.6, Math.sin(yaw)).multiplyScalar(2.2)),
          q,
          new THREE.Vector3(3.2 + r() * 1.6, 0.2, 5 + r() * 2.5),
        ),
      )
    }
    for (const g of stems) put(parts, standard('plant-stem', { color: 0x4e6e36, roughness: 0.7 }, 0.22), g)
    bake(parts, groups.items)
    const leafMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), standard('monstera', { roughness: 0.55, emissive: 0x0e1c0c }), leaves.length)
    leaves.forEach((m, i) => {
      leafMesh.setMatrixAt(i, m)
      leafMesh.setColorAt(i, new THREE.Color(0x2f6a34).offsetHSL(0, 0, (r() - 0.5) * 0.08))
    })
    leafMesh.castShadow = true
    groups.items.add(leafMesh)
  }

  {
    const panelW = mm(600)
    put(
      parts,
      standard('ceiling-white', { color: 0xf4f1ea, roughness: 0.95 }, 0.42),
      new THREE.PlaneGeometry(2 * A, 2 * B).rotateX(Math.PI / 2).translate(0, ceil, 0),
    )
    put(
      parts,
      standard('ceiling-light', { color: 0xffffff, emissive: 0xfff3e0, emissiveIntensity: 0.3, roughness: 0.6 }),
      lathe(
        [
          [0, -mm(110)],
          [panelW / 2 - 2, -mm(100)],
          [panelW / 2, -mm(60)],
          [panelW / 2, 0],
        ],
        48,
      ).translate(0, ceil, 0),
    )
    bake(parts, groups.up)
  }

  {
    const wood = standard('table-wood', { map: tableTexture(), roughness: 0.6 }, 0.2)
    const legH = TABLE_H - tableT
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      put(parts, wood, box(1.6, legH, 1.6, sx * (tableW / 2 - 2.4), top - tableT - legH / 2, sz * (tableD / 2 - 2.4)))
    for (const sz of [-1, 1]) put(parts, wood, box(tableW - 5, 2.4, 0.6, 0, top - tableT - 1.2, sz * (tableD / 2 - 2.4)))
    for (const sx of [-1, 1]) put(parts, wood, box(0.6, 2.4, tableD - 5, sx * (tableW / 2 - 2.4), top - tableT - 1.2, 0))
    const chairWood = standard('chair-wood', { map: grain('chair', 256, 256, [132, 90, 56], 50, 71), roughness: 0.55 }, 0.25)
    const cushion = standard('chair-cushion', { color: 0xc9a46a, roughness: 0.95 }, 0.2)
    const seatH = mm(440)
    const seat = mm(440)
    for (const side of [1, -1]) {
      const cz = side * (tableD / 2 + seat / 2 - 2)
      put(parts, chairWood, new RoundedBoxGeometry(seat, 1, seat, 2, 0.3).translate(0, floorY + seatH - 0.5, cz))
      put(parts, cushion, new RoundedBoxGeometry(seat - 1.4, 0.8, seat - 1.6, 2, 0.35).translate(0, floorY + seatH + 0.35, cz - side * 0.3))
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const back = sz === side
        const h = back ? seatH + mm(420) : seatH - 1
        put(parts, chairWood, new THREE.CylinderGeometry(0.45, 0.38, h, 8).translate(sx * (seat / 2 - 0.7), floorY + h / 2, cz + sz * (seat / 2 - 0.7)))
      }
      const backTop = floorY + seatH + mm(420)
      put(parts, chairWood, new RoundedBoxGeometry(seat, 2.6, 0.8, 2, 0.3).translate(0, backTop - 1.3, cz + side * (seat / 2 - 0.7)))
      for (const sx of [-1, 0, 1])
        put(parts, chairWood, box(0.8, mm(420) - 3.6, 0.45, sx * 2.6, floorY + seatH + (mm(420) - 3.6) / 2, cz + side * (seat / 2 - 0.7)))
    }
    bake(parts, groups.table, true, true)

    const mugA = standard('mug-a', { color: 0xf2eee6, roughness: 0.3 })
    const mugB = standard('mug-b', { color: 0xc8793a, roughness: 0.35 })
    const coffee = standard('coffee', { color: 0x3a2214, roughness: 0.1 })
    const cork = standard('cork', { color: 0xb8925e, roughness: 0.95 })
    const plate = standard('plate', { color: 0xf6f3ec, roughness: 0.3 })
    const senbei = standard('senbei', { color: 0xa8692e, roughness: 0.8 })
    const bowl = standard('bowl', { map: grain('bowl', 256, 256, [150, 100, 60], 40, 83), roughness: 0.4 })
    const mikan = standard('mikan', { color: 0xf08a1c, roughness: 0.6 })
    for (const [x, z, mat, yaw] of [
      [12.2, 8.6, mugA, 0.6],
      [-12.2, -8.6, mugB, 3.6],
    ] as const) {
      put(parts, cork, new THREE.CylinderGeometry(1.8, 1.8, 0.15, 24).translate(x, top + 0.075, z))
      put(
        parts,
        mat,
        lathe(
          [
            [0, 0],
            [1.05, 0],
            [1.15, 0.15],
            [1.2, 2.7],
            [1.08, 2.7],
            [1.02, 0.35],
            [0, 0.35],
          ],
          24,
        ).translate(x, top + 0.15, z),
      )
      put(
        parts,
        mat,
        new THREE.TorusGeometry(0.7, 0.17, 8, 14, Math.PI)
          .rotateZ(-Math.PI / 2)
          .translate(1.15, 1.45, 0)
          .rotateY(yaw)
          .translate(x, top + 0.15, z),
      )
      put(parts, coffee, new THREE.CircleGeometry(1.06, 20).rotateX(-Math.PI / 2).translate(x, top + 2.3, z))
    }
    const [sx, sz] = [12.4, -7.6]
    put(
      parts,
      plate,
      lathe(
        [
          [0, 0],
          [2.4, 0],
          [3.5, 0.45],
          [3.6, 0.5],
          [3.4, 0.5],
          [2.3, 0.15],
          [0, 0.15],
        ],
        28,
      ).translate(sx, top, sz),
    )
    for (const [ox, oz, oy, tilt] of [
      [-0.9, -0.6, 0.2, 0],
      [1.0, -0.4, 0.2, 0.06],
      [0.1, 1.0, 0.2, -0.05],
      [0.2, -0.1, 0.5, 0.12],
    ])
      put(parts, senbei, new THREE.CylinderGeometry(1.3, 1.3, 0.25, 18).rotateZ(tilt).translate(sx + ox, top + oy + 0.15, sz + oz))
    const [bx, bz] = [-12.4, 7.6]
    put(
      parts,
      bowl,
      lathe(
        [
          [0, 0],
          [1.8, 0],
          [3.6, 1.6],
          [3.9, 2.4],
          [3.7, 2.4],
          [3.3, 1.6],
          [1.6, 0.3],
          [0, 0.3],
        ],
        28,
      ).translate(bx, top, bz),
    )
    for (const [ox, oz, oy] of [
      [-1.1, -0.5, 1.1],
      [1.1, -0.6, 1.1],
      [0, 1.1, 1.1],
      [0.1, -0.1, 2.3],
    ])
      put(parts, mikan, new THREE.SphereGeometry(1.15, 10, 8).scale(1, 0.82, 1).translate(bx + ox, top + oy, bz + oz))
    bake(parts, groups.table, true, false)
  }

  const lamp = new THREE.Group()
  root.add(lamp)
  const lampY = top + mm(560)
  const shadeR = mm(200)
  const shadeMat = standard('pendant', { color: 0xc58f48, roughness: 0.6, side: THREE.DoubleSide }, 0.45)
  put(
    parts,
    shadeMat,
    lathe(
      [
        [shadeR, 0],
        [shadeR * 0.95, 1.2],
        [shadeR * 0.75, 3.6],
        [shadeR * 0.45, 5.4],
        [0.9, 6.3],
        [0.4, 6.6],
      ],
      36,
    ).translate(0, lampY, 0),
  )
  put(
    parts,
    standard('pendant-glow', { color: 0xfff1d8, emissive: 0xffc98e, emissiveIntensity: 1.4, roughness: 1, side: THREE.BackSide }),
    lathe(
      [
        [shadeR - 0.12, 0.05],
        [shadeR * 0.95 - 0.12, 1.2],
        [shadeR * 0.75 - 0.12, 3.6],
        [shadeR * 0.45 - 0.12, 5.3],
        [0, 6.2],
      ],
      36,
    ).translate(0, lampY, 0),
  )
  put(
    parts,
    standard('bulb', { color: 0xffffff, emissive: 0xffe2b0, emissiveIntensity: 2.2 }),
    new THREE.SphereGeometry(1.3, 16, 12).translate(0, lampY + 2.2, 0),
  )
  put(parts, sash, new THREE.CylinderGeometry(0.07, 0.07, ceil - lampY - 6.6, 4).translate(0, (ceil + lampY + 6.6) / 2, 0))
  put(parts, sash, new THREE.CylinderGeometry(1.6, 1.6, 0.5, 20).translate(0, ceil - 0.25, 0))
  bake(parts, lamp)

  cutaway(
    root,
    [
      [groups.px, (p) => p.x < A - mm(320) - 2],
      [groups.nx, (p) => p.x > -A + mm(850) + 2],
      [groups.pz, (p) => p.z < B - mm(440) - 2],
      [groups.nz, (p) => p.z > -B + 4],
      [groups.up, (p) => p.y < ceil - 1],
      [lamp, clearOfBoard(new THREE.Vector3(0, lampY + 3, 0), shadeR + 1)],
    ],
    skyDome('residential_garden.jpg'),
  )
}
