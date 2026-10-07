import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { SIZE, catalog, fileLabel, type EngineMove, type Pos, type Snapshot } from './notation'

export type TargetKind = 'step' | 'capture' | 'via'

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
  lang: 'ja' | 'en'
  onCell: (pos: Pos) => void
}

type Camera = { x: number; y: number; s: number }

const MIN_FIT = 0.85
const MAX_CELL = 96
const TAP_SLOP = 6
const GLYPH_FONT = '"Shippori Mincho B1", "Yu Mincho", "Hiragino Mincho ProN", serif'

export const keyOf = ({ file, rank }: Pos) => `${file},${rank}`

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// Unit pentagon (pointing up) for a shogi tile, in cell units around the cell centre.
const TILE: [number, number][] = [
  [0, -0.47],
  [0.31, -0.3],
  [0.4, 0.45],
  [-0.4, 0.45],
  [-0.31, -0.3],
]

export const TaikyokuBoard = forwardRef<BoardHandle, Props>(function TaikyokuBoard(props, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const cam = useRef<Camera>({ x: SIZE / 2, y: SIZE / 2, s: 12 })
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
    return Math.min(w, h) / (SIZE + 2)
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
    const { snap, selected, inspected, targets, last, lang } = latest.current
    const { x, y, s } = cam.current
    const css = getComputedStyle(c)
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
    const toX = (file: number) => w / 2 + (file - 1 - x) * s // left edge of a cell
    const toY = (rank: number) => h / 2 + (SIZE - rank - y) * s // top edge of a cell
    const f0 = clamp(Math.floor(x - w / 2 / s) + 1, 1, SIZE)
    const f1 = clamp(Math.ceil(x + w / 2 / s) + 1, 1, SIZE)
    const r0 = clamp(SIZE - Math.ceil(y + h / 2 / s) + 1, 1, SIZE)
    const r1 = clamp(SIZE - Math.floor(y - h / 2 / s), 1, SIZE)

    // board
    ctx.fillStyle = token('--kaya-light', '#e2b56c')
    ctx.fillRect(toX(1), toY(SIZE), SIZE * s, SIZE * s)
    ctx.strokeStyle = 'rgb(60 40 15 / 0.45)'
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
    ctx.strokeRect(toX(1), toY(SIZE), SIZE * s, SIZE * s)

    // the two armies' camps fade in when zoomed out
    if (s < 9) {
      ctx.fillStyle = 'rgb(255 255 255 / 0.1)'
      ctx.fillRect(toX(1), toY(12), SIZE * s, 12 * s)
      ctx.fillStyle = 'rgb(60 20 10 / 0.07)'
      ctx.fillRect(toX(1), toY(SIZE), SIZE * s, 12 * s)
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
        ctx.fillText(String(r), toX(1) - s * 0.5, toY(r) + s / 2)
        ctx.fillText(String(r), toX(SIZE) + s * 1.5, toY(r) + s / 2)
      }
    }

    const tint = (pos: Pos, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(toX(pos.file), toY(pos.rank), s, s)
    }
    if (last) {
      tint(last.from, 'rgb(70 120 200 / 0.28)')
      tint(last.to, 'rgb(70 120 200 / 0.42)')
      if (last.mid) tint(last.mid, 'rgb(70 120 200 / 0.18)')
    }
    if (inspected) tint(inspected, 'rgb(120 80 200 / 0.3)')
    if (selected) tint(selected, 'rgb(240 190 60 / 0.6)')

    // pieces
    const detail = s >= 11
    for (let r = r0; r <= r1; r++) {
      for (let f = f0; f <= f1; f++) {
        const cell = snap.grid[r - 1][f - 1]
        if (!cell) continue
        const cx = toX(f) + s / 2
        const cy = toY(r) + s / 2
        const black = cell.side === 'b'
        const info = catalog[cell.key]
        if (s < 5) {
          ctx.fillStyle = black ? '#2a1d12' : '#c4442a'
          ctx.fillRect(toX(f) + s * 0.12, toY(r) + s * 0.12, s * 0.76, s * 0.76)
          continue
        }
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(s, s)
        if (!black) ctx.rotate(Math.PI)
        ctx.beginPath()
        TILE.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
        ctx.closePath()
        ctx.fillStyle = black ? token('--koma-light', '#f6e3b4') : '#e8c58c'
        ctx.fill()
        ctx.lineWidth = Math.max(0.025, 0.9 / s)
        ctx.strokeStyle = black ? '#3b2a18' : '#8a2a18'
        ctx.stroke()
        if (detail) {
          const glyph = (!black && info?.k2) || info?.k || ''
          const promoted = cell.key.startsWith('+')
          ctx.fillStyle = promoted ? token('--koma-red', '#b3261e') : token('--koma-ink', '#1d140c')
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const chars = [...(glyph || cell.key.replace('+', ''))]
          if (!glyph) {
            ctx.font = `700 0.3px ${GLYPH_FONT}`
            ctx.fillText(chars.join(''), 0, 0.12)
          } else {
            const size = chars.length === 1 ? 0.52 : chars.length === 2 ? 0.34 : 0.25
            ctx.font = `600 ${size}px ${GLYPH_FONT}`
            const gap = size * 1.02
            const top = 0.14 - ((chars.length - 1) * gap) / 2
            chars.forEach((ch, i) => ctx.fillText(ch, 0, top + i * gap))
          }
        }
        ctx.restore()
      }
    }

    // move hints
    targets.forEach((kind, key) => {
      const [file, rank] = key.split(',').map(Number)
      if (file < f0 - 1 || file > f1 + 1 || rank < r0 - 1 || rank > r1 + 1) return
      const cx = toX(file) + s / 2
      const cy = toY(rank) + s / 2
      ctx.beginPath()
      if (kind === 'via') {
        ctx.setLineDash([s * 0.12, s * 0.08])
        ctx.strokeStyle = '#d99a1c'
        ctx.lineWidth = Math.max(1.5, s / 10)
        ctx.strokeRect(toX(file) + s * 0.1, toY(rank) + s * 0.1, s * 0.8, s * 0.8)
        ctx.setLineDash([])
      } else if (kind === 'capture') {
        ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2)
        ctx.strokeStyle = '#d23b25'
        ctx.lineWidth = Math.max(1.5, s / 9)
        ctx.stroke()
      } else {
        ctx.arc(cx, cy, Math.max(2.5, s * 0.17), 0, Math.PI * 2)
        ctx.fillStyle = 'rgb(47 97 24 / 0.85)'
        ctx.fill()
      }
    })
    if (last && s >= 4) {
      const a = { x: toX(last.from.file) + s / 2, y: toY(last.from.rank) + s / 2 }
      const b = { x: toX(last.to.file) + s / 2, y: toY(last.to.rank) + s / 2 }
      ctx.strokeStyle = 'rgb(70 120 200 / 0.7)'
      ctx.lineWidth = Math.max(1, s / 12)
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
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
    const my = Math.max(0, SIZE / 2 + 1 - h / 2 / c.s)
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
      const wy = c.y + (py - h / 2) / c.s
      c.s = clamp(c.s * factor, fitScale() * MIN_FIT, MAX_CELL)
      c.x = wx - (px - w / 2) / c.s
      c.y = wy - (py - h / 2) / c.s
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
        cam.current.y -= (now.y - prev.y) / cam.current.s
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
      const rank = SIZE - Math.floor(c.y + (p.y - h / 2) / c.s)
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
      cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [constrain, schedule])

  useEffect(() => {
    schedule()
  }, [props.snap, props.selected, props.inspected, props.targets, props.last, props.lang, schedule])

  // fonts load late: repaint once they are ready
  useEffect(() => {
    void document.fonts?.load(`600 20px ${GLYPH_FONT}`, '歩兵王将').then(schedule)
  }, [schedule])

  return <canvas ref={canvas} className="tk-canvas" role="img" aria-label="Taikyoku shogi board" />
})
