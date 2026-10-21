import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Color, PieceType } from 'tsshogi'
import { preparePieceEnvironment } from '@/rendering/board3d/materials'
import { disposePiece, pieceMesh } from '@/rendering/board3d/piece'
import { createRenderer, disposeRenderer } from '@/rendering/board3d/scene'
import { PIECE_FINISHES, loadPieceFont, setSettings, useSettings, type PieceFinish } from '@/appearance/settings'
import { loadPieceSet } from '@/appearance/pieceSets'
import { useTranslation } from 'react-i18next'
import { css } from 'styled-system/css'
import { Box, styled } from 'styled-system/jsx'
import { dialog } from 'styled-system/recipes'
import { Slider, Text } from '@/components/ui'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
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

const segmentGap = css({ mt: '1.5' })

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
  const scene = useRef<{ setPiece: (t: PieceType) => void; setLight: (a: number) => void } | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = createRenderer(false)
    const parent = renderer.domElement.parentElement
    const size = renderer.getSize(new THREE.Vector2())
    const ratio = renderer.getPixelRatio()
    const exposure = renderer.toneMappingExposure
    renderer.setPixelRatio(devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    el.appendChild(renderer.domElement)
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
    const setPiece = (t: PieceType) => {
      if (piece) {
        world.remove(piece)
        disposePiece(piece)
      }
      piece = pieceMesh(t, Color.BLACK, undefined, 64, undefined, environment)
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
      if (piece) disposePiece(piece)
      floor.geometry.dispose()
      floor.material.dispose()
      lamp.shadow.dispose()
      disposeRenderer(renderer)
      scene.current = null
      el.removeChild(renderer.domElement)
      renderer.setPixelRatio(ratio)
      renderer.setSize(size.x, size.y)
      renderer.toneMappingExposure = exposure
      if (parent?.isConnected) parent.appendChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (ready === `${st.pieceFont}|${st.pieceSet}|${st.pieceGuide}`) scene.current?.setPiece(type)
  }, [type, st.pieceFinish, st.pieceFont, st.pieceSet, st.pieceGuide, ready])
  useEffect(() => {
    scene.current?.setLight(light)
  }, [light])

  const body = (
    <>
      <DialogHeader title={t('viewer.pieceViewer')} closeLabel={t('viewer.close')} onClose={onClose} />
      <Box
        ref={host}
        h={page ? 'min(70vh, 640px)' : 'min(52vh, 420px)'}
        my="2"
        borderRadius="lg"
        bg="radial-gradient(ellipse at 50% 40%, {colors.sumi.600}, {colors.sumi.900})"
        touchAction="none"
        cursor="grab"
      />
      <Text tone="muted" size="sm" mb="4">
        {t('viewer.dragToRotateScrollOr')}
      </Text>
      <Segmented size="small" className={segmentGap} value={type} options={TYPES.map((x) => ({ v: x.type, t: x.label }))} onChange={setType} />
      <Segmented<PieceFinish>
        size="small"
        className={segmentGap}
        value={st.pieceFinish}
        options={(Object.keys(PIECE_FINISHES) as PieceFinish[]).map((f) => ({ v: f, t: PIECE_FINISHES[f].label }))}
        onChange={(f) => setSettings({ pieceFinish: f })}
      />
      <Text tone="muted" size="sm" mb="4">
        {PIECE_FINISHES[st.pieceFinish].hint}
      </Text>
      <SettingRow label={t('viewer.lightDirection')}>
        <Slider.Root
          w="min(220px, 100%)"
          min={0}
          max={1}
          step={0.01}
          value={[light]}
          aria-label={[t('viewer.lightDirection')]}
          onValueChange={({ value }) => setLight(value[0])}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </SettingRow>
    </>
  )

  if (page)
    return (
      <Box gridColumn="1 / -1" display="grid" placeItems="center" minH="100%" p="4" overflow="auto">
        <styled.div className={dialog().content} w="min(900px, 100%)" role="dialog" aria-label={t('viewer.pieceViewer')}>
          {body}
        </styled.div>
      </Box>
    )

  return (
    <Dialog label={t('viewer.pieceViewer')} w="min(560px, 100%)" positionerClassName={css({ p: '4', _tight: { p: '3' } })} onBackdrop={onClose}>
      {body}
    </Dialog>
  )
}
