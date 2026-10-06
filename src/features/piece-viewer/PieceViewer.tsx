import './viewer.css'
import '@/app/ui/dialog.css'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Color, PieceType } from 'tsshogi'
import { preparePieceEnvironment } from '@/rendering/board3d/materials'
import { disposePiece, pieceMesh } from '@/rendering/board3d/piece'
import { disposeRenderer } from '@/rendering/board3d/scene'
import { PIECE_FINISHES, loadPieceFont, setSettings, useSettings, type PieceFinish } from '@/appearance/settings'
import { loadPieceSet } from '@/appearance/pieceSets'
import { useTranslation } from 'react-i18next'
import { DialogHeader } from '@/app/ui/Dialog'
import { Segmented, SettingRow } from '@/app/ui/Segmented'

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
  const { t } = useTranslation()
  const host = useRef<HTMLDivElement>(null)
  const [type, setType] = useState(PieceType.ROOK)
  const [light, setLight] = useState(0.35)
  const st = useSettings()
  const [ready, setReady] = useState('')
  useEffect(() => {
    let live = true
    Promise.all([loadPieceFont(st.pieceFont), loadPieceSet(st.pieceSet, st.pieceGuide)])
      .catch(() => undefined)
      .then(() => live && setReady(`${st.pieceFont}|${st.pieceSet}|${st.pieceGuide}`))
    return () => {
      live = false
    }
  }, [st.pieceFont, st.pieceSet, st.pieceGuide])
  const scene = useRef<{ setPiece: (next: PieceType) => void; setLight: (a: number) => void } | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, devicePixelRatio))
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    el.append(renderer.domElement)
    const environment = preparePieceEnvironment(renderer, false)
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
    const setPiece = (next: PieceType) => {
      if (piece) {
        world.remove(piece)
        disposePiece(piece)
      }
      piece = pieceMesh(next, Color.BLACK, undefined, 64, undefined, environment)
      piece.scale.setScalar(1.6)
      world.add(piece)
    }
    const placeLight = (a: number) => void lamp.position.set(Math.cos(a * Math.PI * 2) * 2, 2.2, Math.sin(a * Math.PI * 2) * 2)
    scene.current = { setPiece, setLight: placeLight }
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
    const loop = () => {
      controls.update()
      renderer.render(world, camera)
    }
    loop()
    renderer.setAnimationLoop(loop)
    return () => {
      renderer.setAnimationLoop(null)
      observer.disconnect()
      controls.dispose()
      if (piece) disposePiece(piece)
      floor.geometry.dispose()
      floor.material.dispose()
      lamp.shadow.dispose()
      disposeRenderer(renderer)
      scene.current = null
      renderer.domElement.remove()
    }
  }, [])

  useEffect(() => {
    if (ready === `${st.pieceFont}|${st.pieceSet}|${st.pieceGuide}`) scene.current?.setPiece(type)
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- pieceMesh reads the finish from the settings store, so the piece must be rebuilt when it changes
  }, [type, st.pieceFinish, st.pieceFont, st.pieceSet, st.pieceGuide, ready])
  useEffect(() => {
    scene.current?.setLight(light)
  }, [light])

  return (
    <div className={page ? 'app-viewer-page' : 'app-palette-back'} onPointerDown={page ? undefined : onClose}>
      <dialog open className={`app-dialog app-viewer${page ? ' page' : ''}`} aria-label={t('viewer.pieceViewer')} onPointerDown={(e) => e.stopPropagation()}>
        <DialogHeader title={t('viewer.pieceViewer')} closeLabel={t('viewer.close')} onClose={onClose} />
        <div className="app-viewer-stage" ref={host} />
        <p className="app-muted">{t('viewer.dragToRotateScrollOr')}</p>
        <Segmented size="small" value={type} options={TYPES.map((x) => ({ v: x.type, t: x.label }))} onChange={setType} />
        <Segmented<PieceFinish>
          size="small"
          value={st.pieceFinish}
          options={(Object.keys(PIECE_FINISHES) as PieceFinish[]).map((f) => ({ v: f, t: PIECE_FINISHES[f].label }))}
          onChange={(f) => setSettings({ pieceFinish: f })}
        />
        <p className="app-muted">{PIECE_FINISHES[st.pieceFinish].hint}</p>
        <SettingRow label={t('viewer.lightDirection')}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={light}
            aria-label={t('viewer.lightDirection')}
            onChange={(e) => setLight(Number(e.target.value))}
          />
        </SettingRow>
      </dialog>
    </div>
  )
}
