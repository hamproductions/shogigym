import { useEffect, useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { PieceType, Square } from 'tsshogi'
import { Icon } from '@/app/icons'
import { Button } from '@/app/ui/Button'
import { Select } from '@/app/ui/Select'
import { SvgPath } from '@/app/ui/Svg'
import { Marks } from '@/app/ui/SideMark'
import { moveText, PIECE_CHAR, type Side } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import type { Point } from './geometry'
import { useCamera, type CameraDebug, type CameraStatus } from './useCamera'
import { encode } from 'uqr'
import { deskId, PHONE_SOURCE, phoneUrl } from './phone'
import { announce, moveParts, moveReading, squareName, squareParts, squareReading } from './speech'
import { cellPolygon, gridLines } from './vision'

type CameraPanelProps = {
  live: string
  line: string[]
  moves: string[]
  userSide: Side
  canMove: boolean
  busy: boolean
  over: boolean
  commit: (usi: string) => void
  undo: () => void
  fresh: () => void
  promote: (from: Square, to: Square) => void
  onClose: () => void
  docked?: boolean
}

const Panel = styled('section', {
  base: {
    position: 'fixed',
    right: '4',
    top: 'calc(16px + env(safe-area-inset-top, 0px))',
    zIndex: 'sticky',
    width: 'min(360px, calc(100vw - 32px))',
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    p: '3',
    borderRadius: 'xl',
    bg: 'panel',
    boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.lg}',
    fontSize: 'sm',
    color: 'fg.default',
    '&[data-moved]': { right: 'auto' },
    '&[data-docked]': {
      position: 'static',
      width: 'auto',
      flexShrink: '0',
      borderRadius: '0',
      boxShadow: 'none',
      borderBottom: '1px solid {colors.border}',
    },
  },
})

const Header = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    cursor: 'grab',
    touchAction: 'none',
    userSelect: 'none',
    '&:active': { cursor: 'grabbing' },
    '&[data-docked]': { cursor: 'default' },
  },
})

const Title = styled('h2', { base: { flex: '1', m: '0', fontSize: 'md', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2' } })

const Viewport = styled('div', {
  base: {
    position: 'relative',
    borderRadius: 'md',
    overflow: 'hidden',
    bg: 'black',
    touchAction: 'none',
    userSelect: 'none',
    aspectRatio: 'var(--camera-aspect, 16 / 9)',
    width: 'min(100%, calc(45dvh * var(--camera-ratio, 1.78)))',
    '&[data-docked]': { width: 'min(100%, calc(30dvh * var(--camera-ratio, 1.78)))' },
    mx: 'auto',
    '&[data-collapsed]': { display: 'none' },
  },
})

const Video = styled('video', { base: { display: 'block', width: '100%', height: '100%', objectFit: 'fill' } })

const SideChip = styled('span', {
  base: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    px: '1.5',
    py: '0.5',
    borderRadius: 'sm',
    bg: 'overlay',
    color: 'fg.default',
    fontSize: '2xs',
    fontWeight: 'bold',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
})

const Choices = styled('div', {
  base: { position: 'absolute', insetInline: '2', bottom: '2', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2' },
})

const Overlay = styled('svg', { base: { position: 'absolute', inset: '0', width: '100%', height: '100%', cursor: 'crosshair' } })

const Row = styled('div', { base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2', minH: '9' } })

const Status = styled('p', {
  base: {
    flex: '1',
    m: '0',
    h: '72px',
    overflow: 'hidden',
    lineHeight: 'snug',
    color: 'fg.default',
    display: 'flex',
    alignItems: 'center',
    '&[data-tone=warn]': { color: 'danger' },
    '&[data-collapsed]': { h: 'auto' },
  },
})

const PLACE_KEY = 'joseki-practice:camera-panel:v1'

type Place = { x?: number; y?: number; collapsed?: boolean; mute?: boolean; debug?: boolean }

function readPlace(): Place {
  try {
    return JSON.parse(localStorage.getItem(PLACE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writePlace(place: Place) {
  try {
    localStorage.setItem(PLACE_KEY, JSON.stringify(place))
  } catch {
    return
  }
}

const clamp = (value: number, max: number) => Math.min(Math.max(0, max), Math.max(0, value))

const Rectified = styled('canvas', {
  base: {
    width: '72px',
    height: '72px',
    flexShrink: '0',
    borderRadius: 'sm',
    imageRendering: 'pixelated',
    boxShadow: 'inset 0 0 0 1px {colors.border}',
    '&[data-idle]': { visibility: 'hidden' },
    '&[data-collapsed]': { display: 'none' },
  },
})

const Handle = styled('ellipse', {}, { forwardProps: ['cx', 'cy', 'rx', 'ry'] as string[] })

const Dot = styled(
  'ellipse',
  {
    base: {
      fill: 'white',
      stroke: 'black',
      strokeWidth: '1',
      '&[data-state=added]': { fill: 'success' },
      '&[data-state=removed]': { fill: 'none', stroke: 'danger', strokeWidth: '2' },
    },
  },
  { forwardProps: ['cx', 'cy', 'rx', 'ry'] as string[] },
)

const DebugText = styled('pre', {
  base: { m: '0', p: '2', borderRadius: 'sm', bg: 'black', color: 'white', fontSize: '2xs', lineHeight: '1.4', whiteSpace: 'pre-wrap', fontFamily: 'mono' },
})

const debugText = (d: CameraDebug) =>
  [
    `fps ${d.fps.toFixed(1)} · motion ${d.motion.toFixed(2)}/${d.threshold.toFixed(2)} · noise ${d.noise.toFixed(3)} · still ${d.still}`,
    `grid ${d.locked.toFixed(1)} (settled ${d.lines.toFixed(1)}) · rot ${d.rotation} · lift ${d.lift.toFixed(2)}`,
    `board ply ${d.physicalPly} / app ply ${d.livePly} · pieces seen ${d.occupied.filter(Boolean).length}`,
    `decision ${d.decision || '-'} ×${d.streak}`,
    ...d.readings.map(
      (r) =>
        `${squareName(r.square)}: ${r.empty > 0.5 ? `empty ${(r.empty * 100).toFixed(0)}%` : r.top.map((x) => `${x.type}${(x.p * 100).toFixed(0)}%`).join(' ')}`,
    ),
  ].join('\n')

const QrBox = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    p: '3',
    bg: 'panel',
  },
})

const QrUrl = styled('code', { base: { fontSize: '2xs', color: 'fg.muted', wordBreak: 'break-all', textAlign: 'center', userSelect: 'all' } })

function PhoneCode() {
  const [url] = useState(() => phoneUrl(deskId()))
  const { data } = encode(url, { border: 1 })
  const d = data.flatMap((row, y) => row.flatMap((on, x) => (on ? [`M${x} ${y}h1v1h-1z`] : []))).join('')
  return (
    <QrBox>
      <styled.svg viewBox={`0 0 ${data.length} ${data.length}`} width="min(180px, 60%)" height="auto" bg="white" shapeRendering="crispEdges" aria-label={url}>
        <SvgPath d={d} fill="black" />
      </styled.svg>
      <QrUrl>{url}</QrUrl>
    </QrBox>
  )
}

const Cell = styled(SvgPath, { base: { fill: 'accent', opacity: '0.45', '&[data-tone=warn]': { fill: 'danger' } } })

const path = (points: Point[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('') + 'Z'

function spokenParts(status: CameraStatus): string[] {
  const sideKey = (side: Side) => (side === 'sente' ? '先手' : '後手')
  switch (status.kind) {
    case 'sent':
      return moveParts(moveText(status.sfen, status.usi))
    case 'expect':
      return status.move ? [...moveParts(moveText(status.move.sfen, status.move.usi)), 'cam:をさしてください'] : []
    case 'unknown':
      return status.covered ? ['cam:手が盤にかかっています'] : [...status.cells.slice(0, 2).flatMap(squareParts), 'cam:を確認してください']
    case 'watching':
      return status.ready ? ['cam:あなたの番です'] : []
    case 'ahead':
      return [`cam:いまは${sideKey(status.side)}の番です`]
    case 'shifted':
      return ['cam:盤が動きました']
    case 'drop':
      return ['cam:どの駒を打ちましたか']
    default:
      return []
  }
}

function spokenText(status: CameraStatus) {
  switch (status.kind) {
    case 'sent':
      return moveReading(moveText(status.sfen, status.usi))
    case 'expect':
      return status.move ? `${moveReading(moveText(status.move.sfen, status.move.usi))}、をさしてください` : ''
    case 'unknown':
      return `${status.cells.map((c) => `${squareReading(c)}${status.added.includes(c) ? 'に こまが ふえました' : 'の こまが きえました'}`).join('、')}。${status.side === 'sente' ? 'せんて' : 'ごて'}の さしてに なりません`
    case 'ahead':
      return `いまは ${status.side === 'sente' ? 'せんて' : 'ごて'}の ばんです`
    case 'shifted':
      return 'ばんが うごきました。あわせなおします'
    case 'drop':
      return 'どの こまを うちましたか'
    default:
      return ''
  }
}

function statusText(status: CameraStatus, t: (key: string, options?: Record<string, unknown>) => string, corners: number) {
  switch (status.kind) {
    case 'starting':
      return t('camera.starting')
    case 'phone':
      return t(status.link === 'error' ? 'camera.phoneLinkError' : 'camera.phoneWaiting')
    case 'ended':
      return t('camera.ended')
    case 'error':
      return t(status.reason === 'denied' ? 'camera.denied' : 'camera.unavailable')
    case 'calibrate':
      return t('camera.calibrate', { count: corners })
    case 'moving':
      return t('camera.moving')
    case 'watching':
      return t(status.ready ? 'camera.ready' : 'camera.waiting')
    case 'over':
      return t('camera.over')
    case 'partial':
      return t('camera.partial', {
        move: moveText(status.move.sfen, status.move.usi),
        missing: status.missing.map(squareName).join('・') || '—',
        extra: status.extra.length ? t('camera.partialExtra', { squares: status.extra.map(squareName).join('・') }) : '',
      })
    case 'unstable':
      return t('camera.unstable', { squares: status.cells.slice(0, 3).map(squareName).join('・') })
    case 'mismatch':
      return t('camera.mismatch', { count: status.cells.length })
    case 'expect':
      return status.move
        ? t('camera.expect', { move: moveText(status.move.sfen, status.move.usi) })
        : status.cells.length <= 6
          ? t('camera.setupSquares', { squares: status.cells.map(squareName).join('・') })
          : t('camera.setup', { count: status.cells.length })
    case 'sent':
      return t('camera.sent', { move: moveText(status.sfen, status.usi) })
    case 'ahead':
      return t('camera.ahead', { side: sideMark(status.side), squares: status.cells.map(squareName).join('・') })
    case 'unknown':
      return status.covered
        ? t('camera.covered')
        : status.cells
            .slice(0, 2)
            .map((c) => t(status.added.includes(c) ? 'camera.seenPiece' : 'camera.missingPiece', { square: squareName(c) }))
            .join(t('camera.and')) + (status.cells.length > 2 ? t('camera.more', { count: status.cells.length - 2 }) : '')
    case 'shifted':
      return t('camera.shifted')
    case 'searching':
      return t('camera.searching')
    case 'drop':
      return t('camera.drop')
    default:
      return ''
  }
}

export function CameraPanel({ onClose, docked = false, ...deps }: CameraPanelProps) {
  const { t } = useTranslation()
  const [place, setPlace] = useState(readPlace)
  const camera = useCamera({ open: true, ...deps, debug: !!place.debug })
  const { status, calibration, video, preview, debug } = camera
  const [draft, setDraft] = useState<Point[] | null>(null)
  const [drag, setDrag] = useState<number | null>(null)
  const [grab, setGrab] = useState<{ dx: number; dy: number } | null>(null)
  const collapsed = !!place.collapsed
  const [spoken, setSpoken] = useState({ key: '', at: 0 })
  useEffect(() => {
    if (place.mute) return
    const parts = spokenParts(status)
    if (!parts.length) return
    const key = status.kind === 'watching' ? `ready:${status.ply}` : parts.join('|')
    const now = Date.now()
    if (key === spoken.key && (status.kind === 'watching' || now - spoken.at < 10000)) return
    const say = () => {
      announce(parts, spokenText(status))
      setSpoken({ key, at: Date.now() })
    }
    if (status.kind !== 'unknown') return say()
    const timer = setTimeout(say, 1500)
    return () => clearTimeout(timer)
  }, [status, place.mute, spoken])
  const savePlace = (next: Place) => {
    setPlace(next)
    writePlace(next)
  }
  const onHeaderDown = (event: PointerEvent<HTMLElement>) => {
    if (docked || (event.target as HTMLElement).closest('button')) return
    const box = event.currentTarget.parentElement!.getBoundingClientRect()
    event.currentTarget.setPointerCapture(event.pointerId)
    setGrab({ dx: event.clientX - box.left, dy: event.clientY - box.top })
  }
  const onHeaderMove = (event: PointerEvent<HTMLElement>) => {
    if (!grab) return
    const box = event.currentTarget.parentElement!.getBoundingClientRect()
    setPlace((p) => ({ ...p, x: clamp(event.clientX - grab.dx, window.innerWidth - box.width), y: clamp(event.clientY - grab.dy, window.innerHeight - 48) }))
  }
  const onHeaderUp = () => {
    if (!grab) return
    setGrab(null)
    writePlace(place)
  }
  const corners = draft ?? calibration?.corners ?? []
  const complete = corners.length === 4
  const aspect = camera.size ? camera.size.height / camera.size.width : 9 / 16

  const pointAt = (event: PointerEvent<SVGSVGElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(1.15, Math.max(-0.15, (event.clientX - box.left) / box.width)),
      y: Math.min(1.15, Math.max(-0.15, (event.clientY - box.top) / box.height)),
    }
  }
  const onDown = (event: PointerEvent<SVGSVGElement>) => {
    const p = pointAt(event)
    if (!complete) return camera.setCorners([...corners, p])
    const nearest = corners.reduce(
      (best, c, i) => (Math.hypot(c.x - p.x, (c.y - p.y) * aspect) < Math.hypot(corners[best].x - p.x, (corners[best].y - p.y) * aspect) ? i : best),
      0,
    )
    if (Math.hypot(corners[nearest].x - p.x, (corners[nearest].y - p.y) * aspect) > 0.08) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag(nearest)
    setDraft(corners)
  }
  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    if (drag === null || !draft) return
    const p = pointAt(event)
    setDraft(draft.map((c, i) => (i === drag ? p : c)))
  }
  const onUp = () => {
    if (drag === null || !draft) return
    camera.setCorners(draft)
    setDrag(null)
    setDraft(null)
  }

  const sources = [
    ...camera.devices.map((d, i) => ({ value: d.deviceId, label: d.label || t('camera.deviceN', { n: i + 1 }) })),
    { value: PHONE_SOURCE, label: t('camera.phone') },
  ]
  const highlighted = 'cells' in status ? status.cells : status.kind === 'drop' ? [status.to.index] : []
  const warn = status.kind === 'error' || status.kind === 'unknown' || status.kind === 'ahead'
  const live = calibration && complete && !draft ? calibration : null

  const grid = complete
    ? gridLines(corners)
        .map(([a, b]) => `M${a.x} ${a.y}L${b.x} ${b.y}`)
        .join('')
    : ''
  const cells = live ? highlighted.map((cell) => ({ cell, d: path(cellPolygon(live, cell)) })) : []
  const tone = warn ? 'warn' : undefined
  const dots =
    place.debug && debug && live
      ? debug.occupied.flatMap((on, cell) => {
          const was = debug.baseline?.[cell]
          if (!on && !was) return []
          const poly = cellPolygon(live, cell)
          const x = poly.reduce((sum, p) => sum + p.x / 4, 0)
          const y = poly.reduce((sum, p) => sum + p.y / 4, 0)
          return [{ cell, x, y, state: on && was !== 0 ? 'same' : on ? 'added' : 'removed' }]
        })
      : []
  const sides = live
    ? (['sente', 'gote'] as const).map((side) => {
        const [a, b] = side === 'sente' ? [cellPolygon(live, 72)[3], cellPolygon(live, 80)[2]] : [cellPolygon(live, 0)[0], cellPolygon(live, 8)[1]]
        return { side, x: Math.min(0.92, Math.max(0.08, (a.x + b.x) / 2)), y: Math.min(0.92, Math.max(0.08, (a.y + b.y) / 2)) }
      })
    : []

  return (
    <Panel
      aria-label={t('camera.title')}
      data-docked={docked || undefined}
      data-moved={(!docked && place.x !== undefined) || undefined}
      style={!docked && place.x !== undefined ? { left: place.x, top: place.y } : undefined}
    >
      <Header data-docked={docked || undefined} onPointerDown={onHeaderDown} onPointerMove={onHeaderMove} onPointerUp={onHeaderUp} onPointerCancel={onHeaderUp}>
        <Title>
          <Icon name="camera" size={18} />
          {t('camera.title')}
        </Title>
        <Button
          variant="icon"
          size="sm"
          onClick={() => savePlace({ ...place, collapsed: !collapsed })}
          aria-label={t(collapsed ? 'camera.expand' : 'camera.collapse')}
          aria-expanded={!collapsed}
        >
          <Icon name="chevronDown" size={18} />
        </Button>
        <Button variant="icon" size="sm" onClick={onClose} aria-label={t('camera.close')}>
          <Icon name="close" size={18} />
        </Button>
      </Header>
      <Viewport
        data-docked={docked || undefined}
        data-collapsed={collapsed || undefined}
        style={{
          ['--camera-aspect' as string]: `${camera.size?.width ?? 16} / ${camera.size?.height ?? 9}`,
          ['--camera-ratio' as string]: camera.size ? camera.size.width / camera.size.height : 16 / 9,
        }}
      >
        <Video ref={video} playsInline muted />
        <Overlay viewBox="0 0 1 1" preserveAspectRatio="none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          {grid && <SvgPath d={grid} stroke="accent" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" opacity="0.8" />}
          {cells.map(({ cell, d }) => (
            <Cell key={cell} d={d} data-tone={tone} />
          ))}
          {dots.map(({ cell, x, y, state }) => (
            <Dot key={cell} cx={x} cy={y} rx={0.007 * aspect} ry={0.007} data-state={state} vectorEffect="non-scaling-stroke" />
          ))}
          {corners.map((c, i) => (
            <Handle key={i} cx={c.x} cy={c.y} rx={0.018 * aspect} ry={0.018} fill="accent" stroke="onFill" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          ))}
        </Overlay>
        {sides.map(({ side, x, y }) => (
          <SideChip key={side} style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
            <Marks>{t(side === 'sente' ? 'camera.senteSide' : 'camera.goteSide')}</Marks>
          </SideChip>
        ))}
        {status.kind === 'phone' && <PhoneCode />}
        {status.kind === 'drop' && (
          <Choices>
            {status.types.map((type: PieceType) => (
              <Button key={type} size="sm" variant="primary" onClick={() => camera.chooseDrop(type)}>
                {PIECE_CHAR[type]}
              </Button>
            ))}
          </Choices>
        )}
      </Viewport>
      <Row>
        <Rectified
          ref={preview}
          data-collapsed={collapsed || undefined}
          data-idle={!calibration || calibration.corners.length < 4 || undefined}
          aria-hidden="true"
        />
        <Status role="status" data-tone={tone} data-collapsed={collapsed || undefined}>
          <Marks>{statusText(status, t, corners.length)}</Marks>
        </Status>
      </Row>
      {place.debug && debug && <DebugText>{debugText(debug)}</DebugText>}
      {!collapsed && (
        <Row>
          {sources.length > 0 && <Select label={t('camera.device')} value={camera.deviceId} onChange={camera.selectDevice} options={sources} />}
          <Button size="sm" on={!!place.debug} onClick={() => savePlace({ ...place, debug: !place.debug })}>
            {t('camera.debug')}
          </Button>
          <Button size="sm" on={!place.mute} onClick={() => savePlace({ ...place, mute: !place.mute })}>
            {t('camera.speak')}
          </Button>
          <Button size="sm" onClick={camera.rotate} disabled={!complete}>
            {t('camera.rotate')}
          </Button>
          <Button size="sm" onClick={() => camera.setCorners([])}>
            {t('camera.corners')}
          </Button>
          {status.kind === 'expect' && status.undo && (
            <Button size="sm" variant="primary" onClick={deps.undo}>
              {t('camera.undo')}
            </Button>
          )}
          <Button
            size="sm"
            variant={status.kind === 'mismatch' ? 'primary' : 'secondary'}
            onClick={camera.resync}
            disabled={!complete}
            title={t('camera.syncTitle')}
          >
            {t('camera.sync')}
          </Button>
        </Row>
      )}
    </Panel>
  )
}
