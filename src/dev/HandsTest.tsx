import './hands.css'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Color, Position, Square } from 'tsshogi'
import { loadAvatars, type AvatarController, type AvatarInspect, type AvatarSlot } from '@/rendering/avatars'
import { HALF_D, HALF_W, LEG, THICK, setBoardDims, squareX, squareZ } from '@/rendering/board3d/dimensions'
import { rebuild } from '@/rendering/board3d/pieces'
import { buildScene, createRenderer, disposeRenderer } from '@/rendering/board3d/scene'
import type { Board3DProps, SceneState } from '@/rendering/board3d/types'
import { loadPieceFont, setSettings, useSettings, type Settings } from '@/appearance/settings'
import { loadPieceSet } from '@/appearance/pieceSets'
import { BoardLoading } from '@/rendering/BoardLoading'

type Room = 'traditional' | 'casual'
interface Pattern {
  id: string
  label: string
  sfen: string
  usi: string
}

const START = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL'
const FACED = 'lnsgkgsnl/1r5b1/pppp1pppp/9/4p4/4P4/PPPP1PPPP/1B5R1/LNSGKGSNL'

const PATTERNS: Pattern[] = [
  { id: 'slide-b', label: 'Slide · sente 7g7f', sfen: `${START} b - 1`, usi: '7g7f' },
  { id: 'slide-w', label: 'Slide · gote 3c3d', sfen: `${START} w - 2`, usi: '3c3d' },
  { id: 'carry-b', label: 'Carry · sente rook 2h5h', sfen: `${START} b - 1`, usi: '2h5h' },
  { id: 'carry-w', label: 'Carry · gote rook 8b5b', sfen: `${START} w - 2`, usi: '8b5b' },
  { id: 'drop-b', label: 'Drop · sente B*5e', sfen: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/7R1/LNSGKGSNL b B 1', usi: 'B*5e' },
  { id: 'drop-w', label: 'Drop · gote b*5e', sfen: 'lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w b 2', usi: 'b*5e' },
  { id: 'capture-b', label: 'Capture · sente 5f5e', sfen: `${FACED} b - 1`, usi: '5f5e' },
  { id: 'capture-w', label: 'Capture · gote 5e5f', sfen: `${FACED} w - 2`, usi: '5e5f' },
  { id: 'promote-b', label: 'Promote · sente 5d5c+', sfen: 'lnsgkgsnl/1r5b1/pppp1pppp/4P4/9/9/PPPP1PPPP/1B5R1/LNSGKGSNL b P 1', usi: '5d5c+' },
  { id: 'promote-w', label: 'Promote · gote 5f5g+', sfen: 'lnsgkgsnl/1r5b1/pppp1pppp/9/9/4p4/PPPP1PPPP/1B5R1/LNSGKGSNL w p 2', usi: '5f5g+' },
  { id: 'far-b', label: 'Far reach · sente 9i9a+', sfen: 'r3k4/9/9/9/9/9/9/9/R3K4 b - 1', usi: '9i9a+' },
  { id: 'far-w', label: 'Far reach · gote 1a1i+', sfen: '4k3r/9/9/9/9/9/9/9/4K3R w - 2', usi: '1a1i+' },
]

const DT = 1 / 60
const SPEEDS = [1, 0.5, 0.25, 0.1]
const FINGERS = ['Index', 'Middle', 'Ring', 'Little'].flatMap((f) => ['Proximal', 'Intermediate', 'Distal'].map((j) => `Right${f}${j}`))

const framesFor = (pattern: Pattern) =>
  Math.round(((Position.newBySFEN(pattern.sfen)!.board.at(Square.newByUSI(pattern.usi.slice(2, 4))!) ? 2 : 1) * 0.66 + 0.7) / DT)

const props = (position: Position, lastMove?: string): Board3DProps => ({
  position,
  flipped: false,
  tilted: true,
  lastMove,
  selected: null,
  targets: [],
  arrows: [],
  onSquare: () => undefined,
  onHand: () => undefined,
  onDrop: () => undefined,
})

function slotFor(controller: AvatarController): AvatarSlot {
  return {
    request: () => undefined,
    ready: () => true,
    walls: controller.walls,
    inspect: controller.inspect,
    swap: controller.swap,
    playMove: (move) => (controller.playMove({ ...move, sound: move.kind === 'capture' ? 'capture' : 'move' }), true),
    cue: controller.cue,
    update: controller.update,
    dispose: controller.dispose,
  }
}

interface Overlay {
  target: THREE.Mesh
  pinch: THREE.Mesh
  piece: THREE.Mesh
  pole: THREE.ArrowHelper
  axes: THREE.AxesHelper
}

const dot = (color: number) => new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color, depthTest: false }))

function overlay(scene: THREE.Scene): Overlay {
  const o = {
    target: dot(0xff3b30),
    pinch: dot(0x34c759),
    piece: dot(0x0a84ff),
    pole: new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 3, 0xffcc00),
    axes: new THREE.AxesHelper(0.08),
  }
  for (const m of [o.target, o.pinch, o.piece]) m.renderOrder = 10
  scene.add(o.target, o.pinch, o.piece, o.pole)
  return o
}

const deg = (v?: number) => (v === undefined ? '–' : Math.round((v * 180) / Math.PI).toString())

interface RunStatus {
  key: string
  ready: boolean
  error: string | null
  progress: number
}

type PieceLook = Pick<Settings, 'pieceFont' | 'pieceSet' | 'pieceGuide' | 'pieceStyle' | 'pieceMaterial' | 'pieceColor' | 'pieceGrain' | 'pieceFinish'>

const runKeyOf = (room: Room, pattern: Pattern, settings: PieceLook) =>
  [
    room,
    pattern.id,
    settings.pieceFont,
    settings.pieceSet,
    settings.pieceGuide,
    settings.pieceStyle,
    settings.pieceMaterial,
    settings.pieceColor,
    settings.pieceGrain,
    settings.pieceFinish,
  ].join('|')

function nextFrame(frame: number, steps: number, last: number, loop: boolean) {
  if (frame + steps <= last) return frame + steps
  return loop ? 0 : frame
}

export default function HandsTest() {
  const st = useSettings()
  const host = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState<Room>(st.environment === 'casual' ? 'casual' : 'traditional')
  const [pattern, setPattern] = useState(PATTERNS[0])
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0.25)
  const [loop, setLoop] = useState(true)
  const [show, setShow] = useState(true)
  const [cut, setCut] = useState(false)
  const [info, setInfo] = useState<AvatarInspect | null>(null)
  const [status, setStatus] = useState<RunStatus>({ key: '', ready: false, error: null, progress: 0 })
  const { pieceFont, pieceSet, pieceGuide, pieceStyle, pieceMaterial, pieceColor, pieceGrain, pieceFinish } = st
  const runKey = runKeyOf(room, pattern, { pieceFont, pieceSet, pieceGuide, pieceStyle, pieceMaterial, pieceColor, pieceGrain, pieceFinish })
  const current = status.key === runKey
  const ready = current && status.ready
  const error = current ? status.error : null
  const progress = current ? status.progress : 0
  const total = framesFor(pattern)
  const api = useRef<{ goto: (f: number) => AvatarInspect | null; camera: (preset: string) => void; total: number } | null>(null)
  const cameraPose = useRef<{ position: THREE.Vector3; target: THREE.Vector3; follow: boolean } | null>(null)
  const display = useRef({ show, cut })
  useEffect(() => {
    display.current = { show, cut }
  }, [show, cut])

  useEffect(() => {
    const key = runKeyOf(room, pattern, { pieceFont, pieceSet, pieceGuide, pieceStyle, pieceMaterial, pieceColor, pieceGrain, pieceFinish })
    setSettings({ environment: room })
    setBoardDims()
    const el = host.current!
    const renderer = createRenderer()
    el.append(renderer.domElement)
    const s: SceneState = buildScene(renderer)
    s.room.need()
    const controls = new OrbitControls(s.camera, renderer.domElement)
    s.camera.position.copy(cameraPose.current?.position ?? new THREE.Vector3(0, 26, 30))
    controls.target.copy(cameraPose.current?.target ?? new THREE.Vector3(0, 0, 0.4))
    controls.update()
    const marks = overlay(s.scene)
    let controller: AvatarController | null = null
    let seed = 1
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const prev = Position.newBySFEN(pattern.sfen)!
    const next = prev.clone()
    next.doMove(next.createMoveByUSI(pattern.usi)!)
    const mover = prev.color
    const lastFrame = framesFor(pattern)
    let simFrame = -1
    const inspect = () => controller?.inspect().find((a) => a.color === mover) ?? null
    const draw = (a: AvatarInspect | null) => {
      const { show: overlays } = display.current
      for (const m of [marks.target, marks.pinch, marks.piece, marks.pole]) m.visible = !!a && overlays
      if (!a) return
      marks.target.position.copy(a.target)
      marks.pinch.position.copy(a.pinch)
      marks.piece.visible = overlays && !!a.piece
      if (a.piece) marks.piece.position.copy(a.piece)
      marks.pole.position.copy(a.target)
      marks.pole.setDirection(a.pole.clone().normalize())
      if (marks.axes.parent !== a.hand) a.hand.add(marks.axes)
      marks.axes.visible = overlays
    }
    const goto = (f: number) => {
      if (!controller) return null
      if (f < simFrame || simFrame < 0) {
        seed = 1
        controller.reset()
        rebuild(s, props(prev), false)
        rebuild(s, props(next, pattern.usi), true, prev)
        simFrame = 0
      }
      for (; simFrame < f; simFrame++) controller.update(DT, 0, !display.current.cut)
      const a = inspect()
      draw(a)
      if (follow && a) {
        const t = s.root.worldToLocal(a.pinch.clone())
        const near = mover === Color.BLACK ? 1 : -1
        s.camera.position.set(t.x - near * 5, t.y + 2.5, t.z + near * 2)
        controls.target.copy(t)
      }
      return a
    }
    let follow = cameraPose.current?.follow ?? false
    const camera = (preset: string) => {
      follow = preset === 'hand'
      const a = inspect()
      const sq = Square.newByUSI(pattern.usi.slice(2, 4))!
      const at = new THREE.Vector3(squareX(sq.file), 0, squareZ(sq.rank))
      const near = mover === Color.BLACK ? 1 : -1
      const views: Record<string, [THREE.Vector3, THREE.Vector3]> = {
        top: [new THREE.Vector3(0, 40, 0.5), new THREE.Vector3()],
        tilted: [new THREE.Vector3(0.6, 26, near * 30), new THREE.Vector3(0, 0, near * 0.4)],
        hand: [new THREE.Vector3(at.x - near * 6, 2.5, at.z + near * 2), a ? s.root.worldToLocal(a.target.clone()) : at],
        gote: [new THREE.Vector3(0, 18, -32), new THREE.Vector3(0, 0, -2)],
        rest: (() => {
          let hips: THREE.Object3D | null = a?.hand ?? null
          while (hips?.parent && !/hips/i.test(hips.name)) hips = hips.parent
          let rest: THREE.Object3D | null = null
          hips?.traverse((o) => {
            if (!rest && o.name.endsWith('_L_Hand')) rest = o
          })
          const t = rest ? s.root.worldToLocal((rest as THREE.Object3D).getWorldPosition(new THREE.Vector3())) : at
          return [new THREE.Vector3(t.x + Math.sign(t.x || 1) * 7, t.y + 3, t.z + near * 2.5), t]
        })(),
      }
      s.camera.position.copy(views[preset][0])
      controls.target.copy(views[preset][1])
      controls.update()
    }
    api.current = { goto, camera, total: lastFrame }
    let live = true
    let completed = 0
    const loaded = () => {
      completed++
      if (live) setStatus({ key, ready: false, error: null, progress: completed / 3 })
    }
    Promise.all([loadPieceFont(pieceFont).then(loaded), loadPieceSet(pieceSet, pieceGuide).then(loaded)])
      .then(() =>
        live
          ? loadAvatars({
              root: s.root,
              camera: s.camera,
              environment: room,
              dims: { thick: THICK, leg: LEG, halfW: HALF_W, halfD: HALF_D },
              base: import.meta.env.BASE_URL,
              random,
            })
          : null,
      )
      .then((c) => {
        if (!c) return
        if (!live) return c.dispose()
        loaded()
        controller = c
        s.avatars = slotFor(c)
        s.settle = () => rebuild(s, props(next, pattern.usi), false)
        simFrame = -1
        setInfo(goto(0))
        setStatus({ key, ready: true, error: null, progress: completed / 3 })
      })
      .catch((failure: unknown) => {
        if (live) setStatus({ key, ready: false, error: failure instanceof Error ? failure.message : String(failure), progress: completed / 3 })
      })
    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight)
      s.camera.aspect = el.clientWidth / el.clientHeight
      s.camera.updateProjectionMatrix()
    }
    resize()
    globalThis.addEventListener('resize', resize)
    let raf = 0
    const render = () => {
      draw(inspect())
      controller?.update(0, 0, !display.current.cut)
      controls.update()
      renderer.render(s.scene, s.camera)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => {
      live = false
      cameraPose.current = { position: s.camera.position.clone(), target: controls.target.clone(), follow }
      cancelAnimationFrame(raf)
      globalThis.removeEventListener('resize', resize)
      controller?.dispose()
      controls.dispose()
      disposeRenderer(renderer)
      renderer.domElement.remove()
      api.current = null
    }
  }, [room, pattern, pieceFont, pieceSet, pieceGuide, pieceStyle, pieceMaterial, pieceColor, pieceGrain, pieceFinish])

  useEffect(() => {
    if (ready && api.current) setInfo(api.current.goto(frame))
  }, [frame, ready])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const tick = (now: number) => {
      acc += ((now - last) / 1000) * speed
      last = now
      const steps = Math.floor(acc / DT)
      acc -= steps * DT
      if (steps) setFrame((f) => nextFrame(f, steps, api.current?.total ?? 0, loop))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, loop])

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#111' }}>
      <div ref={host} style={{ position: 'absolute', inset: 0 }} />
      {!ready && <BoardLoading error={error ?? undefined} progress={progress} />}
      <div className="hands-panel">
        <b>Hand animation · dev</b>
        {!ready && <div role={error ? 'alert' : 'status'}>{error ?? 'Loading pieces and avatars…'}</div>}
        <div>
          <select value={room} onChange={(e) => setRoom(e.target.value as Room)} aria-label="Room">
            <option value="traditional">Traditional</option>
            <option value="casual">Casual</option>
          </select>
        </div>
        <div className="hands-pads" aria-label="Animations">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              aria-pressed={pattern.id === p.id}
              onClick={() => {
                if (pattern.id === p.id) setInfo(api.current?.goto(0) ?? null)
                setPattern(p)
                setFrame(0)
                setPlaying(true)
              }}
            >
              <strong>{p.label.split(' · ')[0]}</strong>
              <span>
                {p.id.endsWith('-b') ? 'Sente' : 'Gote'} · {p.usi}
              </span>
            </button>
          ))}
        </div>
        <div className="hands-row" aria-label="Camera">
          {['top', 'tilted', 'hand', 'gote', 'rest'].map((c) => (
            <button key={c} onClick={() => api.current?.camera(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="hands-row">
          <button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
          <button onClick={() => setFrame((f) => Math.max(0, f - 1))}>◀ frame</button>
          <button onClick={() => setFrame((f) => Math.min(total, f + 1))}>frame ▶</button>
          <button onClick={() => setFrame(0)}>Restart</button>
          <label>
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> loop
          </label>
          <label>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> overlays
          </label>
          <label>
            <input type="checkbox" checked={cut} onChange={(e) => setCut(e.target.checked)} /> game cut-away
          </label>
        </div>
        <div className="hands-row">
          {SPEEDS.map((v) => (
            <button key={v} onClick={() => setSpeed(v)} aria-pressed={speed === v}>
              {v}×
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={total}
          value={frame}
          onChange={(e) => setFrame(Number(e.target.value))}
          style={{ width: '100%' }}
          aria-label="Timeline"
        />
        <div data-testid="hands-status">
          t {(frame * DT).toFixed(3)} s · frame {frame}/{total} · phase <b>{info?.phase ?? '–'}</b> · {info?.kind ?? '–'} · sample{' '}
          {info && info.sample >= 0 ? info.sample.toFixed(1) : '–'}
        </div>
        <div>
          <span style={{ color: '#ff3b30' }}>● IK target</span> <span style={{ color: '#34c759' }}>● grip point</span>{' '}
          <span style={{ color: '#0a84ff' }}>● piece</span> <span style={{ color: '#ffcc00' }}>→ pole</span>
        </div>
        <details>
          <summary>Bone measurements</summary>
          <table style={{ width: '100%', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr>
                <th align="left">bone</th>
                <th>sample x/y/z°</th>
                <th>applied x/y/z°</th>
              </tr>
            </thead>
            <tbody>
              {[...FINGERS, 'RightThumbProximal', 'RightThumbIntermediate', 'RightThumbDistal'].map((key) => (
                <tr key={key}>
                  <td>{key.replace('Right', '')}</td>
                  <td align="center">{info?.pose?.[key]?.map(deg).join(' / ') ?? '–'}</td>
                  <td align="center">{info?.applied[key]?.map(deg).join(' / ') ?? '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </main>
  )
}
