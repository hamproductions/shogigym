import { useEffect, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'
import { Position, Square } from 'tsshogi'
import { SQ_D, squareX, squareZ } from '@/rendering/board3d/dimensions'
import { pieceMesh } from '@/rendering/board3d/piece'
import { createPower, moveEvent, type Power } from '@/rendering/board3d/power'

type Kind = 'move' | 'capture' | 'promote' | 'check' | 'mate' | 'captureMate'

const START = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL'

const SCENES: Record<Kind, { label: string; sfen: string; usi: string }> = {
  move: { label: 'Move', sfen: `${START} b - 1`, usi: '7g7f' },
  capture: { label: 'Capture', sfen: 'lnsgkgsnl/1r5b1/pppp1pppp/9/4p4/4P4/PPPP1PPPP/1B5R1/LNSGKGSNL b - 1', usi: '5f5e' },
  promote: { label: 'Promote', sfen: 'lnsgkgsnl/1r5b1/pppp1pppp/4P4/9/9/PPPP1PPPP/1B5R1/LNSGKGSNL b P 1', usi: '5d5c+' },
  check: { label: '王手', sfen: '3gkg3/9/ppp3ppp/9/9/9/PPP3PPP/9/3GKG3 b R 1', usi: 'R*5e' },
  mate: { label: '詰み', sfen: '3nkn3/9/4P4/9/9/9/PPP3PPP/9/4K4 b G 1', usi: 'G*5b' },
  captureMate: { label: 'Capture 詰み', sfen: '3nkn3/4s4/4P4/4L4/9/9/PPP3PPP/9/4K4 b - 1', usi: '5c5b+' },
}

const point = (sq: Square) => new THREE.Vector3(squareX(sq.file), 0, squareZ(sq.rank))

function boardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1100
  const g = canvas.getContext('2d')!
  g.fillStyle = '#e2b672'
  g.fillRect(0, 0, 1024, 1100)
  for (let i = 0; i < 160; i++) {
    g.strokeStyle = `rgba(150,96,40,${0.05 + Math.random() * 0.08})`
    g.lineWidth = 1 + Math.random() * 3
    g.beginPath()
    const x = Math.random() * 1024
    g.moveTo(x, 0)
    g.bezierCurveTo(x + 20, 300, x - 20, 700, x + 10, 1100)
    g.stroke()
  }
  g.strokeStyle = '#2a1a0c'
  g.lineWidth = 3
  const m = 0.5 / 10
  for (let i = 0; i <= 9; i++) {
    const x = (m + (i / 9) * (1 - 2 * m)) * 1024
    const y = (m + (i / 9) * (1 - 2 * m)) * 1100
    g.beginPath()
    g.moveTo(x, m * 1100)
    g.lineTo(x, (1 - m) * 1100)
    g.stroke()
    g.beginPath()
    g.moveTo(m * 1024, y)
    g.lineTo((1 - m) * 1024, y)
    g.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function buildStage() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio))
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.82
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 200)
  scene.add(new THREE.HemisphereLight(0xe8e0d0, 0x3a2a18, 0.9))
  const lamp = new THREE.SpotLight(0xffe8c4, 70, 80, Math.PI / 3, 1, 1.2)
  lamp.position.set(-1.5, 18, 2.5)
  lamp.castShadow = true
  scene.add(lamp, lamp.target)
  const backdrop = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.MeshBasicMaterial({ color: 0x8a9fb8, side: THREE.BackSide }))
  scene.add(backdrop)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb8a878, roughness: 0.9 }))
  floor.position.y = -6
  floor.receiveShadow = true
  scene.add(floor)
  const root = new THREE.Group()
  scene.add(root)
  const top = new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: 0.6 })
  const edge = new THREE.MeshStandardMaterial({ color: 0xc89552, roughness: 0.7 })
  const board = new THREE.Mesh(new THREE.BoxGeometry(10, 1.6, 9 * SQ_D * (10 / 9)), [edge, edge, top, edge, edge, edge])
  board.position.y = -0.8
  board.receiveShadow = true
  board.castShadow = true
  root.add(board)
  const pieces = new THREE.Group()
  root.add(pieces)
  return { renderer, scene, camera, root, pieces }
}

type Stage = ReturnType<typeof buildStage>

function placePieces(stage: Stage, position: Position) {
  stage.pieces.clear()
  const meshes = new Map<string, THREE.Object3D>()
  for (const sq of position.board.listNonEmptySquares()) {
    const piece = position.board.at(sq)!
    const mesh = pieceMesh(piece.type, piece.color)
    mesh.position.copy(point(sq))
    stage.pieces.add(mesh)
    meshes.set(sq.usi, mesh)
  }
  return meshes
}

const panel: CSSProperties = {
  position: 'fixed',
  left: 12,
  top: 12,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  maxWidth: 'calc(100vw - 24px)',
  font: '13px system-ui',
  zIndex: 2,
}
const button: CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #0004', background: '#fffd', cursor: 'pointer' }

export default function PowerPreview() {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ run: (kind: Kind) => void } | null>(null)
  const [fps, setFps] = useState(0)
  const [tilt, setTilt] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const view = useRef({ tilt: true, flipped: false })
  useEffect(() => {
    view.current = { tilt, flipped }
  }, [tilt, flipped])

  useEffect(() => {
    const el = host.current!
    const stage = buildStage()
    const { renderer, scene, camera, root } = stage
    el.append(renderer.domElement)
    const power: Power = createPower({ scene, root, camera, renderer })
    let anim: { mesh: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null
    let paused = false
    let pending: { at: number; fn: () => void }[] = []
    let clock = 0

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight)
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()

    const setView = () => {
      const angle = view.current.tilt ? 0.8 : 0.02
      const distance = (view.current.tilt ? 6.6 : 6.4) / Math.tan((15 * Math.PI) / 180) / Math.max(0.55, Math.min(1, camera.aspect))
      camera.position.set(0, Math.cos(angle) * distance, Math.sin(angle) * distance)
      camera.lookAt(0, 0, view.current.tilt ? 0.4 : 0)
      root.rotation.y = view.current.flipped ? Math.PI : 0
    }

    const step = (dt: number) => {
      clock += dt
      for (const p of pending.filter((p) => p.at <= clock)) p.fn()
      pending = pending.filter((p) => p.at > clock)
      setView()
      power.update(dt)
      const sdt = dt * power.timeScale()
      if (anim) {
        anim.t = Math.min(1, anim.t + sdt / 0.22)
        const e = 1 - (1 - anim.t) ** 3
        anim.mesh.position.lerpVectors(anim.from, anim.to, e)
        anim.mesh.position.y = Math.sin(Math.PI * anim.t) * 0.5
        if (anim.t >= 1) anim = null
      }
    }
    const render = () => {
      const restore = power.applyCamera()
      renderer.render(scene, camera)
      restore()
    }

    const run = (kind: Kind) => {
      power.clear()
      const spec = SCENES[kind]
      const prev = Position.newBySFEN(spec.sfen)!
      const next = prev.clone()
      const move = next.createMoveByUSI(spec.usi)!
      next.doMove(move)
      placePieces(stage, prev)
      pending = [
        {
          at: clock + 0.35,
          fn: () => {
            const meshes = placePieces(stage, next)
            const mesh = meshes.get(spec.usi.slice(2, 4))
            if (mesh) {
              const from = move.from instanceof Square ? point(move.from) : new THREE.Vector3(6.5, 0, 4)
              anim = { mesh, from, to: mesh.position.clone(), t: 0 }
              mesh.position.copy(from)
            }
            const event = moveEvent(prev, next, spec.usi)
            if (event) power.onMove({ ...event, delay: 0.22 })
          },
        },
      ]
    }
    api.current = { run }

    let frame = 0
    let last = performance.now()
    let count = 0
    let window0 = last
    const loop = (time: number) => {
      const dt = Math.min(0.1, (time - last) / 1000)
      last = time
      count++
      if (time - window0 >= 1000) {
        setFps(Math.round((count * 1000) / (time - window0)))
        count = 0
        window0 = time
      }
      if (!paused) {
        step(dt)
        render()
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    placePieces(stage, Position.newBySFEN(SCENES.move.sfen)!)

    if (import.meta.env.DEV)
      (globalThis as unknown as { __power: unknown }).__power = {
        power,
        scene,
        run,
        shot: (kind: Kind, seconds: number) => {
          paused = true
          run(kind)
          const n = Math.round(seconds * 60)
          for (let i = 0; i < n; i++) step(1 / 60)
          render()
        },
        stepFrames: (n: number) => {
          paused = true
          for (let i = 0; i < n; i++) step(1 / 60)
          render()
        },
        resume: () => (paused = false),
        info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, programs: renderer.info.programs?.length }),
      }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      power.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
      api.current = null
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111' }}>
      <div ref={host} style={{ position: 'absolute', inset: 0 }} />
      <div style={panel}>
        {(Object.keys(SCENES) as Kind[]).map((kind) => (
          <button key={kind} type="button" style={button} onClick={() => api.current?.run(kind)}>
            {SCENES[kind].label}
          </button>
        ))}
        <button type="button" style={button} onClick={() => setTilt((v) => !v)}>
          {tilt ? 'Top view' : 'Tilted view'}
        </button>
        <button type="button" style={button} onClick={() => setFlipped((v) => !v)}>
          {flipped ? 'Sente view' : 'Gote view'}
        </button>
        <span style={{ ...button, cursor: 'default' }} data-fps={fps}>
          {fps} fps
        </span>
      </div>
    </div>
  )
}
