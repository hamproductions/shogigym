import * as THREE from 'three'
import { BOARD_TONE } from '@/rendering/koma'
import { arrowBetween } from '@/rendering/board3d/marks'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { useSettings, getSettings, loadPieceFont, PIECE_FONTS, playSound } from '@/appearance/settings'
import { boardSurface } from '@/rendering/board3d/textures'
import { SQ_D } from '@/rendering/board3d/dimensions'
import { SPRITE_BOX } from '@/rendering/sprites'
import { taikyokuPiece } from './pieces'
import { bakeTaikyoku, bakedKey, taikyokuSprites } from './bake'
import { SIZE, fileLabel, type Cell, type EngineMove, type Pos, type Snapshot } from './notation'

export type TargetKind = 'step' | 'capture' | 'via'
export type TaikyokuArrow = { move: EngineMove; color: string; dashed?: boolean; label?: string }
export type ControlCell = { b: Pos[]; w: Pos[] }

export type BoardHandle = {
  fit: () => void
  focus: (pos: Pos, cellPx?: number) => void
}

type Props = {
  snap: Snapshot
  selected: Pos | null
  inspected: Pos | null
  targets: Map<string, TargetKind>
  last: EngineMove | null
  animate?: boolean
  peekTargets?: Pos[]
  arrows?: TaikyokuArrow[]
  control?: Map<string, ControlCell>
  showControl?: boolean
  lang: 'ja' | 'en'
  onCell: (pos: Pos) => void
  onProgress?: (done: number, total: number) => void
  onError?: (message: string) => void
}

type Camera = { x: number; y: number; s: number }

const MIN_FIT = 0.85
const MAX_CELL = 96
const TAP_SLOP = 6

export const keyOf = ({ file, rank }: Pos) => `${file},${rank}`

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const TaikyokuBoard = forwardRef<BoardHandle, Props>(function TaikyokuBoard(props, ref) {
  const settings = useSettings()
  const appearanceKey = JSON.stringify([
    settings.pieceFont,
    settings.pieceStyle,
    settings.pieceSet,
    settings.pieceMaterial,
    settings.pieceFinish,
    settings.pieceColor,
    settings.pieceGrain,
  ])
  const sprites = useRef(taikyokuSprites(settings))
  const surface = useRef<HTMLCanvasElement | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const cam = useRef<Camera>({ x: SIZE / 2, y: SIZE / 2, s: 12 })
  const previous = useRef<{ snap: Snapshot; last: EngineMove | null } | null>(null)
  const movement = useRef<{ from: Snapshot; move: EngineMove; piece: Cell; start: number; timing: Animation; capture: boolean; land: () => void } | null>(null)
  const arrowPaths = useRef<{ path: Path2D; arrow: TaikyokuArrow; stack: number }[]>([])
  const fitted = useRef(true)
  const frame = useRef(0)
  const tween = useRef<{ from: Camera; to: Camera; start: number } | null>(null)
  const latest = useRef(props)
  latest.current = props

  const viewport = () => {
    const c = canvas.current
    return { w: c?.clientWidth ?? 1, h: c?.clientHeight ?? 1 }
  }
  const fitScale = () => {
    const { w, h } = viewport()
    return Math.min(w / (SIZE + 2), h / ((SIZE + 2) * SQ_D))
  }

  const draw = useCallback(() => {
    frame.current = 0
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const { w, h } = viewport()
    const dpr = window.devicePixelRatio || 1
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const { snap, selected, inspected, targets, last, lang, control, showControl, peekTargets } = latest.current
    const active = movement.current
    const duration = active?.move.mid ? 440 : 220
    const progress = active ? clamp((performance.now() - active.start) / duration, 0, 1) : 1
    if (active && progress === 1) {
      active.land()
      active.timing.cancel()
      movement.current = null
    }
    const { x, y, s } = cam.current
    const css = getComputedStyle(c)
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
    const toX = (file: number) => w / 2 + (file - 1 - x) * s // left edge of a cell
    const toY = (rank: number) => h / 2 + (SIZE - rank - y) * s * SQ_D // top edge of a cell
    const f0 = clamp(Math.floor(x - w / 2 / s) + 1, 1, SIZE)
    const f1 = clamp(Math.ceil(x + w / 2 / s) + 1, 1, SIZE)
    const r0 = clamp(SIZE - Math.ceil(y + h / 2 / s / SQ_D) + 1, 1, SIZE)
    const r1 = clamp(SIZE - Math.floor(y - h / 2 / s / SQ_D), 1, SIZE)

    // board
    ctx.fillStyle = token('--kaya-light', '#e2b56c')
    ctx.fillRect(toX(1), toY(SIZE), SIZE * s, SIZE * s * SQ_D)
    if (surface.current) ctx.drawImage(surface.current, toX(1), toY(SIZE), SIZE * s, SIZE * s * SQ_D)
    ctx.strokeStyle = BOARD_TONE[getSettings().boardStyle].line
    ctx.lineWidth = Math.max(0.5, s / 40)
    ctx.beginPath()
    for (let f = f0; f <= f1 + 1; f++) {
      ctx.moveTo(toX(f), toY(r1))
      ctx.lineTo(toX(f), toY(r0 - 1))
    }
    for (let r = r0 - 1; r <= r1; r++) {
      ctx.moveTo(toX(f0), toY(r))
      ctx.lineTo(toX(f1 + 1), toY(r))
    }
    ctx.stroke()
    ctx.lineWidth = Math.max(1, s / 14)
    ctx.strokeRect(toX(1), toY(SIZE), SIZE * s, SIZE * s * SQ_D)

    // the two armies' camps fade in when zoomed out
    if (s < 9) {
      ctx.fillStyle = 'rgb(255 255 255 / 0.1)'
      ctx.fillRect(toX(1), toY(12), SIZE * s, 12 * s * SQ_D)
      ctx.fillStyle = 'rgb(60 20 10 / 0.07)'
      ctx.fillRect(toX(1), toY(SIZE), SIZE * s, 12 * s * SQ_D)
    }

    // coordinates in the margin
    if (s >= 7) {
      ctx.fillStyle = token('--text-muted', '#857a6b')
      ctx.font = `${clamp(s * 0.42, 8, 14)}px ${token('--font-sans', 'sans-serif')}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const step = s >= 15 ? 1 : s >= 10 ? 2 : 3
      for (let f = f0; f <= f1; f++) {
        if (f % step) continue
        ctx.fillText(fileLabel(f), toX(f) + s / 2, toY(SIZE) - s * 0.5)
        ctx.fillText(fileLabel(f), toX(f) + s / 2, toY(1) + s * 1.5)
      }
      for (let r = r0; r <= r1; r++) {
        if (r % step) continue
        ctx.fillText(String(r), toX(1) - s * 0.5, toY(r) + (s * SQ_D) / 2)
        ctx.fillText(String(r), toX(SIZE) + s * 1.5, toY(r) + (s * SQ_D) / 2)
      }
    }

    const tint = (pos: Pos, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(toX(pos.file) + s * 0.01, toY(pos.rank) + s * SQ_D * 0.01, s * 0.98, s * SQ_D * 0.98)
    }
    if (showControl && control) {
      for (let rank = r0; rank <= r1; rank++) {
        for (let file = f0; file <= f1; file++) {
          const cell = control.get(keyOf({ file, rank }))
          if (!cell || (!cell.b.length && !cell.w.length)) continue
          const difference = cell.b.length - cell.w.length
          const color = difference > 0 ? '31 122 224' : difference < 0 ? '210 64 42' : '154 90 208'
          tint({ file, rank }, `rgb(${color} / ${Math.min(0.42, 0.14 + 0.1 * Math.abs(difference || 1))})`)
        }
      }
    }
    if (last) {
      tint(last.from, 'rgb(232 166 58 / 0.38)')
      tint(last.to, 'rgb(232 166 58 / 0.55)')
      if (last.mid) tint(last.mid, 'rgb(232 166 58 / 0.38)')
    }
    if (inspected) tint(inspected, 'rgb(200 68 47 / 0.22)')
    const squareFrame = (pos: Pos, inner: number, color: string) => {
      const outer = 0.69 * Math.SQRT1_2
      const inset = inner * Math.SQRT1_2
      ctx.fillStyle = color
      ctx.beginPath()
      const cx = toX(pos.file) + s / 2
      const cy = toY(pos.rank) + (s * SQ_D) / 2
      ctx.rect(cx - outer * s, cy - outer * s * SQ_D, outer * s * 2, outer * s * SQ_D * 2)
      ctx.rect(cx - inset * s, cy - inset * s * SQ_D, inset * s * 2, inset * s * SQ_D * 2)
      ctx.fill('evenodd')
    }
    if (selected) {
      tint(selected, 'rgb(255 241 201 / 0.45)')
      squareFrame(selected, 0.66, '#c8442f')
    }
    for (const pos of peekTargets ?? []) {
      if (pos.file < f0 || pos.file > f1 || pos.rank < r0 || pos.rank > r1) continue
      tint(pos, 'rgb(200 68 47 / 0.26)')
      squareFrame(pos, 0.62, 'rgb(179 58 38 / 0.7)')
    }
    targets.forEach((kind, key) => {
      const [file, rank] = key.split(',').map(Number)
      if (file < f0 || file > f1 || rank < r0 || rank > r1) return
      ctx.beginPath()
      if (kind === 'via') squareFrame({ file, rank }, 0.56, '#d99a1c')
      else {
        ctx.arc(toX(file) + s / 2, toY(rank) + (s * SQ_D) / 2, s * 0.12, 0, Math.PI * 2)
        ctx.fillStyle = 'rgb(90 58 28 / 0.5)'
        ctx.fill()
      }
    })
    ctx.save()
    ctx.translate(w / 2 + (SIZE / 2 - x) * s, h / 2 + (SIZE / 2 - y) * s * SQ_D)
    ctx.scale(s, s)
    for (const { path, arrow } of arrowPaths.current) {
      ctx.fillStyle = arrow.color
      ctx.globalAlpha = arrow.dashed ? 0.7 : 0.82
      ctx.fill(path)
    }
    ctx.restore()

    const drawPiece = (cell: Cell, cx: number, cy: number, lift = 0, scale = 1) => {
      const image = sprites.current.get(bakedKey(cell))
      if (!image) return
      const width = s * SPRITE_BOX * scale
      ctx.save()
      ctx.translate(cx, cy - lift)
      if (cell.side === 'w') ctx.rotate(Math.PI)
      ctx.drawImage(image, -width / 2, -width / 2, width, width)
      ctx.restore()
    }
    for (let rank = r0; rank <= r1; rank++) {
      for (let file = f0; file <= f1; file++) {
        const destination = active && progress < 1 && active.move.to.file === file && active.move.to.rank === rank
        const cell = snap.grid[rank - 1][file - 1]
        if (cell && !destination) {
          const lifted = selected?.file === file && selected.rank === rank
          if (lifted) {
            ctx.shadowColor = 'rgba(0,0,0,0.3)'
            ctx.shadowBlur = s * 0.05
            ctx.shadowOffsetY = s * 0.08
          }
          drawPiece(cell, toX(file) + s / 2, toY(rank) + (s * SQ_D) / 2, lifted ? s * 0.16 : 0, lifted ? 1.12 : 1)
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = ctx.shadowOffsetY = 0
        }
        if (!active || progress === 1) continue
        const captured = active.from.grid[rank - 1][file - 1]
        const via = active.move.mid?.file === file && active.move.mid.rank === rank
        if (captured && !(active.move.from.file === file && active.move.from.rank === rank) && (!cell || destination) && progress < (via ? 0.5 : 1)) {
          drawPiece(captured, toX(file) + s / 2, toY(rank) + (s * SQ_D) / 2)
        }
      }
    }
    if (active && progress < 1) {
      const halfway = active.move.mid
      const firstLeg = !halfway || progress < 0.5
      const from = firstLeg ? active.move.from : halfway!
      const to = firstLeg && halfway ? halfway : active.move.to
      const t = halfway ? (firstLeg ? progress * 2 : progress * 2 - 1) : progress
      active.timing.currentTime = t * 220
      const ease = active.timing.effect?.getComputedTiming().progress ?? t
      const lift = 1 - Math.abs(2 * ease - 1)
      drawPiece(
        active.piece,
        toX(from.file) + (to.file - from.file) * s * ease + s / 2,
        toY(from.rank) - (to.rank - from.rank) * s * SQ_D * ease + (s * SQ_D) / 2,
        lift * s * 0.1,
        1 + lift * 0.16,
      )
      frame.current = requestAnimationFrame(draw)
    }
    if (showControl && control) {
      ctx.font = `800 ${(s * 0.34 * 40) / 64}px "Shippori Mincho B1", serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = getSettings().boardStyle.endsWith('dark') ? 'rgba(250,232,196,0.92)' : 'rgba(40,22,8,0.85)'
      for (let rank = r0; rank <= r1; rank++) {
        for (let file = f0; file <= f1; file++) {
          const cell = control.get(keyOf({ file, rank }))
          if (!cell || (!cell.b.length && !cell.w.length)) continue
          const difference = cell.b.length - cell.w.length
          ctx.fillText(String(difference === 0 ? cell.b.length : Math.abs(difference)), toX(file) + s * 0.82, toY(rank) + s * (SQ_D / 2 + 0.3))
        }
      }
    }

    for (const { arrow, stack } of arrowPaths.current) {
      if (!arrow.label) continue
      const to = arrow.move.to
      const k = (s * 0.56) / 160
      const labelWidth = Math.min(152, [...arrow.label].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 255 ? 46 : 26), 0) + 28)
      ctx.save()
      ctx.translate(toX(to.file) + s / 2, toY(to.rank) + s * SQ_D * (0.99 - stack * 0.25))
      ctx.scale(k, k)
      ctx.fillStyle = arrow.color
      ctx.beginPath()
      ctx.roundRect(-labelWidth / 2, -30, labelWidth, 60, 14)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '700 46px "Zen Kaku Gothic New", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(arrow.label, 0, 2)
      ctx.restore()
    }
    void lang
  }, [])

  const schedule = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(draw)
  }, [draw])

  const constrain = useCallback(() => {
    const c = cam.current
    const { w, h } = viewport()
    c.s = clamp(c.s, fitScale() * MIN_FIT, MAX_CELL)
    const mx = Math.max(0, SIZE / 2 + 1 - w / 2 / c.s)
    const my = Math.max(0, SIZE / 2 + 1 - h / 2 / c.s / SQ_D)
    c.x = clamp(c.x, SIZE / 2 - mx, SIZE / 2 + mx)
    c.y = clamp(c.y, SIZE / 2 - my, SIZE / 2 + my)
  }, [])

  const animateTo = useCallback(
    (to: Camera) => {
      tween.current = { from: { ...cam.current }, to, start: performance.now() }
      const step = (now: number) => {
        const t = tween.current
        if (!t) return
        const k = Math.min(1, (now - t.start) / 360)
        const e = 1 - Math.pow(1 - k, 3)
        cam.current = { x: t.from.x + (t.to.x - t.from.x) * e, y: t.from.y + (t.to.y - t.from.y) * e, s: t.from.s * Math.pow(t.to.s / t.from.s, e) }
        constrain()
        draw()
        if (k < 1) requestAnimationFrame(step)
        else tween.current = null
      }
      requestAnimationFrame(step)
    },
    [constrain, draw],
  )

  useImperativeHandle(
    ref,
    () => ({
      fit: () => {
        fitted.current = true
        animateTo({ x: SIZE / 2, y: SIZE / 2, s: fitScale() })
      },
      focus: ({ file, rank }, cellPx = 40) => {
        fitted.current = false
        animateTo({ x: file - 0.5, y: SIZE - rank + 0.5, s: cellPx })
      },
    }),
    [animateTo],
  )

  // size + pointer handling
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (fitted.current) cam.current = { x: SIZE / 2, y: SIZE / 2, s: fitScale() }
      constrain()
      schedule()
    })
    observer.observe(el)

    const pointers = new Map<number, { x: number; y: number }>()
    let travelled = 0
    let pinch = 0
    const local = (e: PointerEvent | WheelEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const zoomAt = (px: number, py: number, factor: number) => {
      const c = cam.current
      const { w, h } = viewport()
      const wx = c.x + (px - w / 2) / c.s
      const wy = c.y + (py - h / 2) / c.s / SQ_D
      c.s = clamp(c.s * factor, fitScale() * MIN_FIT, MAX_CELL)
      c.x = wx - (px - w / 2) / c.s
      c.y = wy - (py - h / 2) / c.s / SQ_D
      fitted.current = false
      constrain()
      schedule()
    }
    const down = (e: PointerEvent) => {
      tween.current = null
      el.setPointerCapture(e.pointerId)
      pointers.set(e.pointerId, local(e))
      travelled = 0
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const now = local(e)
      pointers.set(e.pointerId, now)
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinch) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, dist / pinch)
        pinch = dist
        travelled = TAP_SLOP + 1
        return
      }
      travelled += Math.hypot(now.x - prev.x, now.y - prev.y)
      if (travelled > TAP_SLOP) {
        cam.current.x -= (now.x - prev.x) / cam.current.s
        cam.current.y -= (now.y - prev.y) / cam.current.s / SQ_D
        fitted.current = false
        constrain()
        schedule()
      }
    }
    const up = (e: PointerEvent) => {
      const known = pointers.delete(e.pointerId)
      pinch = 0
      if (!known || e.type === 'pointercancel' || travelled > TAP_SLOP) return
      const p = local(e)
      const { w, h } = viewport()
      const c = cam.current
      const file = Math.floor(c.x + (p.x - w / 2) / c.s) + 1
      const rank = SIZE - Math.floor(c.y + (p.y - h / 2) / c.s / SQ_D)
      if (file >= 1 && file <= SIZE && rank >= 1 && rank <= SIZE) latest.current.onCell({ file, rank })
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const p = local(e)
      zoomAt(p.x, p.y, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016)))
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      observer.disconnect()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      if (movement.current?.capture) movement.current.land()
      movement.current?.timing.cancel()
      movement.current = null
      tween.current = null
      cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [constrain, schedule])

  useLayoutEffect(() => {
    const before = previous.current
    previous.current = { snap: props.snap, last: props.last }
    if (movement.current?.capture) movement.current.land()
    movement.current?.timing.cancel()
    movement.current = null
    const move = props.last
    if (!props.animate || !before || !move || before.snap === props.snap) return
    const piece = before.snap.grid[move.from.rank - 1]?.[move.from.file - 1]
    const arrived = props.snap.grid[move.to.rank - 1]?.[move.to.file - 1]
    if (!piece || !arrived || piece.side !== arrived.side || arrived.key !== (move.promote ? `+${piece.key}` : piece.key)) return
    const capture = before.snap.counts.b + before.snap.counts.w > props.snap.counts.b + props.snap.counts.w
    const timing = new Animation(new KeyframeEffect(null, [], { duration: 220, fill: 'both', easing: 'cubic-bezier(0.45, 0, 0.25, 1)' }), document.timeline)
    timing.pause()
    let sounded = false
    const land = () => {
      if (sounded) return
      sounded = true
      playSound(capture ? 'capture' : 'move')
    }
    movement.current = { from: before.snap, move, piece, start: performance.now(), timing, capture, land }
    schedule()
  }, [props.snap, props.last, props.animate, schedule])

  useEffect(() => {
    schedule()
  }, [
    props.snap,
    props.selected,
    props.inspected,
    props.targets,
    props.last,
    props.lang,
    props.control,
    props.showControl,
    props.peekTargets,
    props.arrows,
    schedule,
  ])

  useEffect(() => {
    const position = ({ file, rank }: Pos) => new THREE.Vector3(file - 0.5 - SIZE / 2, 0, (SIZE / 2 + 0.5 - rank) * SQ_D)
    const stacked = new Map<string, number>()
    arrowPaths.current = (props.arrows ?? []).map((arrow) => {
      const path = new Path2D()
      const points = [arrow.move.from, ...(arrow.move.mid ? [arrow.move.mid] : []), arrow.move.to]
      for (let leg = 1; leg < points.length; leg++) {
        const group = arrowBetween({ color: arrow.color, dashed: arrow.dashed }, position(points[leg - 1]), position(points[leg]))
        group.updateMatrixWorld(true)
        group.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return
          const geometry = object.geometry
          const vertices = geometry.attributes.position
          const indices = geometry.index
          const point = new THREE.Vector3()
          for (let triangle = 0; triangle < (indices?.count ?? vertices.count); triangle += 3) {
            for (let corner = 0; corner < 3; corner++) {
              point.fromBufferAttribute(vertices, indices ? indices.getX(triangle + corner) : triangle + corner).applyMatrix4(object.matrixWorld)
              if (corner) path.lineTo(point.x, point.z)
              else path.moveTo(point.x, point.z)
            }
            path.closePath()
          }
          geometry.dispose()
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose()
        })
      }
      const key = keyOf(arrow.move.to)
      const stack = stacked.get(key) ?? 0
      if (arrow.label) stacked.set(key, stack + 1)
      return { path, arrow, stack }
    })
    schedule()
  }, [props.arrows, schedule])

  useEffect(() => {
    surface.current = boardSurface(settings.boardStyle, 1024, Math.round(1024 * SQ_D))
    schedule()
  }, [settings.boardStyle, schedule])

  useEffect(() => {
    const appearance = getSettings()
    sprites.current = taikyokuSprites(appearance)
    const controller = new AbortController()
    const cells = [
      ...new Map(
        props.snap.grid.flatMap((row) => row.flatMap((cell) => (cell && !sprites.current.has(bakedKey(cell)) ? [[bakedKey(cell), cell] as const] : []))),
      ).values(),
    ]
    if (!cells.length) {
      latest.current.onProgress?.(1, 1)
      schedule()
      return
    }
    latest.current.onProgress?.(0, cells.length)
    let done = 0
    const prepare = async () => {
      await loadPieceFont(appearance.pieceFont)
      const font = PIECE_FONTS[appearance.pieceFont]
      const glyphs = cells.map(({ key, side }) => taikyokuPiece(key, side).face.text).join('')
      await document.fonts.load(`${font.weight} 100px "${font.family}"`, glyphs)
      controller.signal.throwIfAborted()
      await bakeTaikyoku(
        cells,
        controller.signal,
        (key, image) => {
          sprites.current.set(key, image)
          latest.current.onProgress?.(++done, cells.length)
          schedule()
        },
        appearance,
      )
    }
    void prepare().catch((error: unknown) => {
      if (!controller.signal.aborted) latest.current.onError?.(error instanceof Error ? error.message : String(error))
    })
    return () => controller.abort()
  }, [props.snap, appearanceKey, schedule])

  return <canvas ref={canvas} className="tk-canvas" role="img" aria-label="Taikyoku shogi board" />
})
