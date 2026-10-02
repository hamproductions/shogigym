import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Color, PieceType } from 'tsshogi'
import { pieceMesh, preparePieceEnvironment } from './Board3D'
import { PIECE_FINISHES, loadPieceFont, setSettings, useSettings, type PieceFinish } from './settings'
import { loadPieceSet } from './pieceSets'

const TYPES: { type: PieceType; label: string }[] = [
  { type: PieceType.KING, label: '王' },
  { type: PieceType.ROOK, label: '飛' },
  { type: PieceType.BISHOP, label: '角' },
  { type: PieceType.GOLD, label: '金' },
  { type: PieceType.SILVER, label: '銀' },
  { type: PieceType.KNIGHT, label: '桂' },
  { type: PieceType.LANCE, label: '香' },
  { type: PieceType.PAWN, label: '歩' },
  { type: PieceType.DRAGON, label: '龍' },
  { type: PieceType.PROM_PAWN, label: 'と' },
]

export function PieceViewer({ onClose, page }: { onClose: () => void; page?: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const [type, setType] = useState(PieceType.ROOK)
  const [light, setLight] = useState(0.35)
  const st = useSettings()
  const [ready, setReady] = useState('')
  useEffect(() => {
    let live = true
    Promise.all([loadPieceFont(st.pieceFont), loadPieceSet(st.pieceSet)])
      .catch(() => undefined)
      .then(() => live && setReady(`${st.pieceFont}|${st.pieceSet}`))
    return () => {
      live = false
    }
  }, [st.pieceFont, st.pieceSet])
  const scene = useRef<{ setPiece: (t: PieceType) => void; setLight: (a: number) => void } | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, devicePixelRatio))
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    el.appendChild(renderer.domElement)
    preparePieceEnvironment(renderer)
    const world = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50)
    camera.position.set(0, 1.9, 2.1)
    world.add(new THREE.HemisphereLight(0xc9d6ff, 0x20160c, 0.5))
    const lamp = new THREE.DirectionalLight(0xffe2b0, 3)
    lamp.castShadow = true
    world.add(lamp)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: 0xc89a55, roughness: 0.7 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    world.add(floor)
    let piece: THREE.Object3D | null = null
    const setPiece = (t: PieceType) => {
      if (piece) world.remove(piece)
      piece = pieceMesh(t, Color.BLACK)
      piece.scale.setScalar(1.6)
      world.add(piece)
    }
    const placeLight = (a: number) => void lamp.position.set(Math.cos(a * Math.PI * 2) * 2, 2.2, Math.sin(a * Math.PI * 2) * 2)
    scene.current = { setPiece, setLight: placeLight }
    setPiece(PieceType.ROOK)
    placeLight(0.35)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.1, 0)
    controls.enableDamping = true
    controls.minDistance = 0.4
    controls.maxDistance = 5
    controls.maxPolarAngle = Math.PI * 0.47
    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight)
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    let frame = 0
    const loop = () => {
      controls.update()
      renderer.render(world, camera)
      frame = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    scene.current?.setPiece(type)
  }, [type, st.pieceFinish, ready])
  useEffect(() => {
    scene.current?.setLight(light)
  }, [light])

  return (
    <div className={page ? 'ws-viewer-page' : 'ws-palette-back'} onPointerDown={page ? undefined : onClose}>
      <div className={`ws-dialog ws-viewer${page ? ' page' : ''}`} role="dialog" aria-label="Piece viewer" onPointerDown={(e) => e.stopPropagation()}>
        <div className="ws-viewer-head">
          <h2>駒 Piece viewer</h2>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="ws-viewer-stage" ref={host} />
        <p className="ws-muted">Drag to rotate, scroll or pinch to zoom. Uses your current piece set and lettering.</p>
        <div className="ws-seg small">
          {TYPES.map((t) => (
            <button key={t.type} className={type === t.type ? 'on' : ''} onClick={() => setType(t.type)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ws-seg small">
          {(Object.keys(PIECE_FINISHES) as PieceFinish[]).map((f) => (
            <button key={f} className={st.pieceFinish === f ? 'on' : ''} onClick={() => setSettings({ pieceFinish: f })}>
              {PIECE_FINISHES[f].label}
            </button>
          ))}
        </div>
        <p className="ws-muted">{PIECE_FINISHES[st.pieceFinish].hint}</p>
        <label className="ws-setting">
          <span>Light direction</span>
          <input type="range" min={0} max={1} step={0.01} value={light} onChange={(e) => setLight(Number(e.target.value))} />
        </label>
      </div>
    </div>
  )
}
