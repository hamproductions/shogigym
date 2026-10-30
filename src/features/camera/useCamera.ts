import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PieceType, Square } from 'tsshogi'
import { useLatest } from '@/app/hooks/useLatest'
import { colorSide, legalTargets, PIECE_CHAR, positionOf, samePosition, type Side } from '@/utils/shogi'
import { orderCorners, type Point } from './geometry'
import { PHONE_SOURCE, receivePhone, type PhoneLink } from './phone'
import { classify, preloadClassifier } from './classifier'
import {
  buildSampler,
  cellDiffs,
  decide,
  edgeMidpoint,
  fitCalibration,
  frameBuffer,
  inferMove,
  cropCells,
  MOTION,
  occupancy,
  autoGrid,
  gridLocked,
  gridScore,
  snapRefine,
  occupancyChanges,
  occupancyOf,
  SETUP_TOLERANCE,
  PATCH,
  PieceBook,
  redBuffer,
  sample,
  type Calibration,
  type Decision,
  type Frame,
  type Rotation,
  type Sampler,
} from './vision'

const KEY = 'joseki-practice:camera:v1'
const WIDTH = 640
const STILL = 2
const CONFIRM = 2
const UNSURE = 10

const changedSquares = (a: string, b: string) => {
  const [p, q] = [positionOf(a), positionOf(b)]
  return Square.all.filter((s) => p.board.at(s)?.type !== q.board.at(s)?.type || p.board.at(s)?.color !== q.board.at(s)?.color).map((s) => s.index)
}
const snapshot = (patches: Float32Array, red: Float32Array): Frame => ({ patches: patches.slice(), red: red.slice() })
const GRID_WIDTH = 360
let gridCanvas: HTMLCanvasElement | null = null

function gridView(element: HTMLVideoElement) {
  const width = GRID_WIDTH
  const height = Math.round((element.videoHeight * width) / element.videoWidth)
  gridCanvas ??= document.createElement('canvas')
  if (gridCanvas.width !== width || gridCanvas.height !== height) {
    gridCanvas.width = width
    gridCanvas.height = height
  }
  const context = gridCanvas.getContext('2d', { willReadFrequently: true })!
  context.drawImage(element, 0, 0, width, height)
  return { data: context.getImageData(0, 0, width, height).data, width, height }
}

const median = (values: Float32Array) => [...values].sort((a, b) => a - b)[values.length >> 1]

export type CameraDebug = {
  fps: number
  motion: number
  threshold: number
  noise: number
  still: number
  lines: number
  locked: number
  rotation: number
  lift: number
  decision: string
  streak: number
  physicalPly: number
  livePly: number
  occupied: number[]
  baseline: number[] | null
  readings: { square: number; top: { type: string; p: number }[]; empty: number }[]
}

export type CameraStatus =
  | { kind: 'starting' }
  | { kind: 'phone'; link: PhoneLink }
  | { kind: 'ended' }
  | { kind: 'error'; reason: 'denied' | 'unavailable' }
  | { kind: 'calibrate' }
  | { kind: 'moving' }
  | { kind: 'watching'; ready: boolean; ply: number }
  | { kind: 'over' }
  | { kind: 'partial'; move: { sfen: string; usi: string }; missing: number[]; extra: number[] }
  | { kind: 'unstable'; cells: number[] }
  | { kind: 'mismatch'; cells: number[] }
  | { kind: 'expect'; cells: number[]; move?: { sfen: string; usi: string }; undo: boolean }
  | { kind: 'sent'; sfen: string; usi: string }
  | { kind: 'ahead'; cells: number[]; side: Side }
  | { kind: 'unknown'; cells: number[]; added: number[]; side: Side; covered: boolean }
  | { kind: 'shifted' }
  | { kind: 'searching' }
  | { kind: 'drop'; to: Square; types: PieceType[] }

type Stored = { deviceId?: string; calibrations: Record<string, Calibration> }

function readStored(): Stored {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { deviceId: value.deviceId, calibrations: value.calibrations ?? {} }
  } catch {
    return { calibrations: {} }
  }
}

function writeStored(value: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    return
  }
}

const statusKey = (s: CameraStatus) => JSON.stringify(s, (_, v) => (v instanceof Square ? v.usi : v))

type CameraDeps = {
  open: boolean
  live: string
  line: string[]
  moves: string[]
  userSide: Side
  canMove: boolean
  busy: boolean
  over: boolean
  debug?: boolean
  commit: (usi: string) => void
  undo: () => void
  fresh: () => void
  promote: (from: Square, to: Square) => void
}

export function useCamera(deps: CameraDeps) {
  const { open } = deps
  const latest = useLatest(deps)
  const [stored, setStored] = useState(readStored)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatusState] = useState<CameraStatus>({ kind: 'starting' })
  const [debug, setDebug] = useState<CameraDebug | null>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  const video = useRef<HTMLVideoElement | null>(null)
  const preview = useRef<HTMLCanvasElement | null>(null)
  const statusRef = useRef(statusKey(status))
  const trackId = file
    ? `file:${file.name}`
    : stored.deviceId === PHONE_SOURCE
      ? PHONE_SOURCE
      : stream?.getVideoTracks()[0]?.getSettings().deviceId || stored.deviceId || 'default'
  const calibration = stored.calibrations[trackId] ?? null
  const calibrationRef = useLatest(calibration)

  const setStatus = useCallback((next: CameraStatus) => {
    const key = statusKey(next)
    if (key === statusRef.current) return
    statusRef.current = key
    setStatusState(next)
  }, [])

  const update = useCallback((change: (s: Stored) => Stored) => {
    setStored((s) => {
      const next = change(s)
      writeStored(next)
      return next
    })
  }, [])

  const setCalibration = useCallback(
    (next: Calibration | null) =>
      update((s) => {
        const calibrations = { ...s.calibrations }
        if (next) calibrations[trackId] = next
        else delete calibrations[trackId]
        return { ...s, calibrations }
      }),
    [trackId, update],
  )

  useEffect(() => {
    if (open) preloadClassifier()
  }, [open])

  useEffect(() => {
    if (!open || file) return
    let cancelled = false
    let started: MediaStream | null = null
    const listDevices = () =>
      navigator.mediaDevices
        ?.enumerateDevices()
        .then((all) => !cancelled && setDevices(all.filter((d) => d.kind === 'videoinput')))
        .catch(() => undefined)
    if (stored.deviceId === PHONE_SOURCE) {
      setStatus({ kind: 'phone', link: 'waiting' })
      const stop = receivePhone(
        (media) => {
          if (cancelled) return
          setStream(media)
          if (!media) setStatus({ kind: 'phone', link: 'waiting' })
        },
        (link) => !cancelled && link !== 'connected' && setStatus({ kind: 'phone', link }),
      )
      listDevices()
      return () => {
        cancelled = true
        stop()
        setStream(null)
      }
    }
    const constraints: MediaTrackConstraints = stored.deviceId
      ? { deviceId: { exact: stored.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
      : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus({ kind: 'error', reason: 'unavailable' })
      return
    }
    setStatus({ kind: 'starting' })
    navigator.mediaDevices
      .getUserMedia({ video: constraints, audio: false })
      .then(async (media) => {
        if (cancelled) return media.getTracks().forEach((t) => t.stop())
        started = media
        setStream(media)
        await listDevices()
      })
      .catch((error: DOMException) => {
        if (cancelled) return
        if (stored.deviceId && error.name === 'OverconstrainedError') return update((s) => ({ ...s, deviceId: undefined }))
        setStatus({ kind: 'error', reason: error.name === 'NotAllowedError' ? 'denied' : 'unavailable' })
      })
    return () => {
      cancelled = true
      started?.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
  }, [open, file, stored.deviceId, setStatus, update])

  const setCornersRef = useRef<(corners: Point[]) => void>(() => undefined)
  const engine = useRef({
    canvas: null as HTMLCanvasElement | null,
    sampler: null as Sampler | null,
    samplerFor: '',
    current: frameBuffer(),
    red: redBuffer(),
    previous: null as Float32Array | null,
    occupied: new Uint8Array(81),
    settled: null as Uint8Array | null,
    baseline: null as Uint8Array | null,
    reference: null as Frame | null,
    diffs: new Float32Array(81),
    still: 0,
    frames: 0,
    framesAt: 0,
    fps: 0,
    debugAt: 0,
    decisionKey: '',
    readings: [] as CameraDebug['readings'],
    classifying: false,
    calm: 0,
    flicker: new Float32Array(81),
    frame: null as { data: Uint8ClampedArray; width: number; height: number } | null,
    moving: 0,
    gridAt: 0,
    regrid: true,
    lines: 0,
    linesNow: 0,
    noise: 0,
    streak: { key: '', count: 0 },
    physical: null as string | null,
    booked: null as string | null,
    book: new PieceBook(),
    issued: null as string | null,
    orient: false,
  })

  const settle = useCallback((sfen: string) => {
    const e = engine.current
    e.physical = sfen
    e.reference = snapshot(e.current, e.red)
    e.baseline = e.occupied.slice()
    if (e.booked !== sfen) {
      e.book.update(positionOf(sfen), e.current)
      e.booked = sfen
    }
  }, [])

  const resync = useCallback(() => {
    const e = engine.current
    e.booked = latest.current.live
    settle(latest.current.live)
    e.issued = null
    e.streak = { key: '', count: 0 }
  }, [latest, settle])

  const autoFit = useCallback(
    (data: Uint8ClampedArray, width: number, height: number, start: Calibration): Calibration => {
      const { live, userSide } = latest.current
      if (start.oriented) return { ...fitCalibration(data, width, height, start, positionOf(live), [start.rotation]).calibration, oriented: true }
      const { calibration, score, twin } = fitCalibration(data, width, height, start, positionOf(live), [0, 1, 2, 3])
      if (score - twin > 0.25) return calibration
      const flipped = { ...calibration, rotation: ((calibration.rotation + 2) % 4) as Rotation }
      const nearer = (c: Calibration) => edgeMidpoint(c.corners, c.rotation, userSide).y
      return nearer(calibration) >= nearer(flipped) ? calibration : flipped
    },
    [latest],
  )

  const handle = useCallback(
    (decision: Decision) => {
      const e = engine.current
      const { live, line, moves, canMove, busy, commit, promote } = latest.current
      const watching = (): CameraStatus => ({ kind: 'watching', ready: canMove && !busy, ply: moves.length })
      const physical = e.physical!
      const key = decision.kind === 'move' ? `move:${decision.changes.join(',')}` : decision.kind === 'sync' ? `sync:${decision.sfen}` : decision.kind
      e.decisionKey =
        decision.kind === 'unknown'
          ? `unknown:${decision.cells.join(',')}`
          : decision.kind === 'sync'
            ? `sync:${line.findIndex((x) => samePosition(x, decision.sfen))}`
            : key
      e.streak = e.streak.key === key ? { key, count: e.streak.count + 1 } : { key, count: 1 }
      const confirmed = e.streak.count >= CONFIRM
      const behind = (): CameraStatus => {
        const at = line.findIndex((s) => samePosition(s, physical))
        const next = at >= 0 && line[at + 1] && moves[at] && samePosition(line[at + 1], live)
        return { kind: 'expect', cells: changedSquares(physical, live), move: next ? { sfen: line[at], usi: moves[at] } : undefined, undo: e.issued !== null }
      }
      switch (decision.kind) {
        case 'idle':
          settle(physical)
          if (samePosition(physical, live)) e.issued = null
          return setStatus(samePosition(physical, live) ? watching() : behind())
        case 'sync':
          if (!confirmed) return
          settle(decision.sfen)
          e.issued = null
          return setStatus(samePosition(decision.sfen, live) ? watching() : behind())
        case 'flip': {
          if (!confirmed) return
          const calibration = calibrationRef.current
          if (!calibration || calibration.oriented) return
          e.reference = null
          e.previous = null
          e.settled = null
          e.baseline = null
          e.booked = null
          e.book = new PieceBook()
          e.samplerFor = ''
          e.streak = { key: '', count: 0 }
          return setCalibration({ ...calibration, rotation: ((calibration.rotation + 2) % 4) as Rotation })
        }
        case 'unknown':
          if (decision.shifted && e.lines > 0 && e.linesNow < e.lines * 0.6) {
            if (!confirmed) return
            e.regrid = true
            return setStatus({ kind: 'shifted' })
          }
          if (decision.shifted && decision.added.length * 3 < decision.cells.length * 2) {
            if (!confirmed) return
            return setStatus({ kind: 'mismatch', cells: decision.cells })
          }
          if (decision.shifted)
            return setStatus({ kind: 'unknown', cells: decision.cells, added: decision.added, side: colorSide(positionOf(physical).color), covered: true })
          if (e.streak.count >= UNSURE && !samePosition(physical, live)) {
            const waiting = behind()
            if (waiting.kind === 'expect' && waiting.move) {
              const target = new Set(waiting.cells)
              return setStatus({
                kind: 'partial',
                move: waiting.move,
                missing: waiting.cells.filter((c) => !decision.cells.includes(c)),
                extra: decision.cells.filter((c) => !target.has(c)),
              })
            }
          }
          if (e.streak.count >= UNSURE)
            setStatus({
              kind: 'unknown',
              cells: decision.cells,
              added: decision.added,
              side: colorSide(positionOf(physical).color),
              covered: decision.added.length >= 3 && decision.added.length === decision.cells.length,
            })
          return
        case 'move': {
          if (!confirmed) return
          if (!samePosition(physical, live) || !canMove || busy)
            return setStatus({ kind: 'ahead', cells: decision.changes, side: colorSide(positionOf(live).color) })
          if (e.classifying) return
          const frame = e.frame
          const calibration = calibrationRef.current
          const before = e.reference!
          const after = snapshot(e.current, e.red)
          const here = positionOf(physical)
          const cells = [...decision.changes]
          for (const c of decision.changes) {
            const from = Square.newByIndex(c)
            if (here.board.at(from)?.color === here.color) for (const to of legalTargets(here, from)) if (here.board.at(to)) cells.push(to.index)
          }
          e.classifying = true
          void (frame && calibration ? classify(cropCells(calibration, frame.width, frame.height, frame.data), [...new Set(cells)]) : Promise.resolve(null))
            .catch(() => null)
            .then((readings) => {
              e.classifying = false
              if (readings)
                e.readings = [...readings].map(([square, r]) => ({
                  square,
                  empty: r.empty,
                  top: [...r.type]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([type, p]) => ({ type: PIECE_CHAR[type], p })),
                }))
              if (e.physical !== physical || !samePosition(latest.current.live, live)) return
              const resolution = inferMove(here, decision.changes, before, after, e.book, readings)
              if (!resolution)
                return setStatus({
                  kind: 'unknown',
                  cells: decision.changes,
                  added: decision.changes.filter((c) => !here.board.at(Square.newByIndex(c))),
                  side: colorSide(here.color),
                  covered: false,
                })
              if ('drop' in resolution) return setStatus({ kind: 'drop', ...resolution.drop })
              const id = 'usi' in resolution ? resolution.usi : `promote:${decision.changes.join(',')}`
              if (e.issued === id) return
              e.issued = id
              if ('usi' in resolution) {
                commit(resolution.usi)
                if (calibrationRef.current && !calibrationRef.current.oriented) setCalibration({ ...calibrationRef.current, oriented: true })
                return setStatus({ kind: 'sent', sfen: physical, usi: resolution.usi })
              }
              promote(resolution.promote.from, resolution.promote.to)
            })
          return
        }
      }
    },
    [latest, setStatus, calibrationRef, setCalibration, settle],
  )

  const process = useCallback(() => {
    const element = video.current
    const calibration = calibrationRef.current
    if (!element || element.readyState < 2 || !element.videoWidth) return
    if (latest.current.over) return setStatus({ kind: 'over' })
    const e = engine.current
    const width = Math.min(WIDTH, element.videoWidth)
    const height = Math.round((element.videoHeight * width) / element.videoWidth)
    const canvas = (e.canvas ??= document.createElement('canvas'))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      setSize({ width: element.videoWidth, height: element.videoHeight })
    }
    const context = canvas.getContext('2d', { willReadFrequently: true })!
    const now = performance.now()
    const manual = !!calibration && calibration.corners.length > 0 && calibration.corners.length < 4
    if (!calibration || calibration.corners.length !== 4) {
      if (manual || now - e.gridAt < 800) return setStatus(manual ? { kind: 'calibrate' } : { kind: 'searching' })
      e.gridAt = now
      const small = gridView(element)
      const found = autoGrid(small.data, small.width, small.height)
      if (found && gridLocked(small.data, small.width, small.height, found.corners)) return setCornersRef.current(found.corners)
      return setStatus({ kind: 'searching' })
    }
    context.drawImage(element, 0, 0, width, height)
    const { data } = context.getImageData(0, 0, width, height)
    e.frame = { data, width, height }
    const gridAt = (corners: Point[]) => {
      const small = gridView(element)
      return { small, score: gridScore(small.data, small.width, small.height, corners) }
    }
    if (e.regrid) {
      e.regrid = false
      e.gridAt = now
      const { small, score: before } = gridAt(calibration.corners)
      const found = autoGrid(small.data, small.width, small.height, calibration.corners, true)
      const moved = found && Math.max(...found.corners.map((c, i) => Math.hypot(c.x - calibration.corners[i].x, c.y - calibration.corners[i].y))) > 0.006
      if (found && moved && found.score > before + 3 && gridLocked(small.data, small.width, small.height, found.corners)) {
        e.reference = null
        e.previous = null
        e.settled = null
        e.baseline = null
        return setCalibration({ ...calibration, corners: found.corners })
      }
    } else if (now - e.gridAt > 3000 && e.still >= STILL && e.physical && samePosition(e.physical, latest.current.live)) {
      e.gridAt = now
      const { small, score: before } = gridAt(calibration.corners)
      const snapped = snapRefine(small.data, small.width, small.height, calibration.corners)
      const moved = Math.max(...snapped.corners.map((c, i) => Math.hypot(c.x - calibration.corners[i].x, c.y - calibration.corners[i].y))) > 0.004
      if (moved && snapped.score > before * 1.05 && gridLocked(small.data, small.width, small.height, snapped.corners)) {
        e.reference = null
        e.previous = null
        e.settled = null
        e.baseline = null
        return setCalibration({ ...calibration, corners: snapped.corners })
      }
    }
    if (e.orient || calibration.lift === undefined) {
      e.orient = false
      return setCalibration(autoFit(data, width, height, calibration))
    }
    const signature = `${width}x${height}:${JSON.stringify(calibration)}`
    if (e.samplerFor !== signature) {
      e.sampler = buildSampler(calibration, width, height)
      e.samplerFor = signature
    }
    if (!e.sampler) return setStatus({ kind: 'calibrate' })
    sample(e.sampler, data, e.current, e.red)
    drawPreview(preview.current, e.current)
    if (!e.previous) {
      e.previous = e.current.slice()
      return
    }
    cellDiffs(e.current, e.previous, e.diffs)
    const motion = Math.max(...e.diffs)
    e.noise = e.noise * 0.95 + median(e.diffs) * 0.05
    e.previous.set(e.current)
    occupancy(e.current, e.occupied, e.baseline, e.red)
    e.frames++
    if (now - e.framesAt >= 1000) {
      e.fps = (e.frames * 1000) / (now - e.framesAt)
      e.frames = 0
      e.framesAt = now
    }
    if (latest.current.debug && now - e.debugAt > 250) {
      e.debugAt = now
      const { line: gameLine, live: current } = latest.current
      setDebug({
        fps: e.fps,
        motion: Math.max(...e.diffs),
        threshold: Math.max(MOTION, e.noise * 4),
        noise: e.noise,
        still: e.still,
        lines: e.lines,
        locked: gridAt(calibration.corners).score,
        rotation: calibration.rotation,
        lift: calibration.lift ?? 0,
        decision: e.decisionKey,
        streak: e.streak.count,
        physicalPly: e.physical ? gameLine.findIndex((x) => samePosition(x, e.physical!)) : -1,
        livePly: gameLine.findIndex((x) => samePosition(x, current)),
        occupied: [...e.occupied],
        baseline: e.baseline ? [...e.baseline] : null,
        readings: e.readings,
      })
    }
    if (motion > Math.max(MOTION, e.noise * 4)) {
      e.settled = e.occupied.slice()
      e.flicker.fill(0)
      e.still = 0
      e.calm = 0
      if (++e.moving >= 8) setStatus({ kind: 'moving' })
      return
    }
    if (e.settled)
      for (let cell = 0; cell < 81; cell++) {
        e.flicker[cell] *= 0.9
        if (e.settled[cell] !== e.occupied[cell]) e.flicker[cell] += 1
        if (e.flicker[cell] > 2.5 && e.baseline) e.occupied[cell] = e.baseline[cell]
      }
    const unsteady = e.settled ? [...e.occupied.keys()].filter((c) => e.settled![c] !== e.occupied[c]) : []
    e.settled = e.occupied.slice()
    e.moving = 0
    e.calm++
    e.still = unsteady.length === 0 ? e.still + 1 : 0
    if (e.still < STILL) {
      if (e.calm >= 20 && unsteady.length) setStatus({ kind: 'unstable', cells: unsteady })
      return
    }
    const { live, line, canMove, busy } = latest.current
    if (!e.reference || !e.physical || !e.baseline) {
      const candidates = [e.physical ?? live, live, ...line].filter((s, i, all) => all.findIndex((x) => samePosition(x, s)) === i)
      const reversed = e.occupied.slice().reverse()
      const ranked = candidates
        .flatMap((sfen) => {
          const expected = occupancyOf(positionOf(sfen))
          return [
            { sfen, flip: false, off: occupancyChanges(expected, e.occupied) },
            { sfen, flip: true, off: occupancyChanges(expected, reversed) },
          ]
        })
        .sort((a, b) => a.off.length - b.off.length || Number(a.flip) - Number(b.flip))
      const best = ranked[0]
      if (best.off.length > SETUP_TOLERANCE) {
        const off = occupancyChanges(occupancyOf(positionOf(live)), e.occupied)
        return setStatus({ kind: 'mismatch', cells: off })
      }
      if (best.flip) {
        e.previous = null
        e.settled = null
        e.samplerFor = ''
        return setCalibration({ ...calibration, rotation: ((calibration.rotation + 2) % 4) as Rotation })
      }
      e.lines = gridAt(calibration.corners).score
      settle(best.sfen)
      return
    }
    const physical = e.physical
    const targets = [live, ...line].filter((s, i, all) => !samePosition(s, physical) && all.findIndex((x) => samePosition(x, s)) === i)
    const decision = decide(e.occupied, e.baseline, physical, live, targets, canMove && !busy)
    if (decision.kind === 'unknown' && decision.shifted) e.linesNow = gridAt(calibration.corners).score
    if (decision.kind === 'idle') e.lines = Math.max(e.lines * 0.9, gridAt(calibration.corners).score)
    handle(decision)
  }, [calibrationRef, handle, latest, autoFit, setCalibration, setStatus, settle])

  const processRef = useLatest(process)
  const ready = !!calibration && calibration.corners.length === 4
  useEffect(() => {
    const element = video.current
    if ((!stream && !file) || !element) return
    const url = file ? URL.createObjectURL(file) : null
    if (url) element.src = url
    else element.srcObject = stream
    if (!url) element.play().catch(() => undefined)
    const ended = () => setStatus({ kind: 'ended' })
    const loaded = () => processRef.current()
    element.addEventListener('ended', ended)
    element.addEventListener('loadeddata', loaded)
    let handleId = 0
    let stopped = false
    const frameCallback = 'requestVideoFrameCallback' in element
    const tick = () => {
      if (stopped) return
      processRef.current()
      handleId = frameCallback ? element.requestVideoFrameCallback(tick) : requestAnimationFrame(tick)
    }
    tick()
    return () => {
      stopped = true
      if (frameCallback) element.cancelVideoFrameCallback(handleId)
      else cancelAnimationFrame(handleId)
      element.removeEventListener('ended', ended)
      element.removeEventListener('loadeddata', loaded)
      element.srcObject = null
      element.removeAttribute('src')
      if (url) URL.revokeObjectURL(url)
    }
  }, [stream, file, processRef, setStatus])

  useEffect(() => {
    const element = video.current
    if (!file || !element) return
    if (ready) element.play().catch(() => undefined)
    else element.pause()
  }, [file, ready])

  const setCorners = useCallback(
    (corners: Point[]) => {
      const e = engine.current
      const complete = corners.length === 4
      e.reference = null
      e.previous = null
      e.physical = null
      e.orient = complete
      setCalibration({ corners: complete ? orderCorners(corners) : corners, rotation: calibration?.rotation ?? 0, oriented: calibration?.oriented })
    },
    [calibration, setCalibration],
  )
  useLayoutEffect(() => {
    setCornersRef.current = setCorners
  })

  return {
    debug,
    video,
    preview,
    status,
    size,
    devices,
    deviceId: trackId,
    selectDevice: (deviceId: string) => {
      setFile(null)
      update((s) => ({ ...s, deviceId }))
    },
    file,
    openFile: (next: File | null) => {
      const e = engine.current
      e.reference = null
      e.previous = null
      e.settled = null
      e.physical = null
      if (next) latest.current.fresh()
      setFile(next)
    },
    calibration,
    setCorners,
    rotate: () => {
      if (!calibration) return
      const e = engine.current
      e.reference = null
      e.previous = null
      setCalibration({ ...calibration, rotation: ((calibration.rotation + 1) % 4) as Rotation, oriented: true })
    },
    resync,
    chooseDrop: (type: PieceType) => {
      if (status.kind !== 'drop') return
      const position = positionOf(latest.current.live)
      const move = position.createMove(type, status.to)
      if (move && position.isValidMove(move)) latest.current.commit(move.usi)
    },
    elevation: useMemo(() => (calibration && size ? buildSampler(calibration, size.width, size.height)?.elevation : undefined), [calibration, size]),
  }
}

function drawPreview(canvas: HTMLCanvasElement | null, frame: Float32Array) {
  if (!canvas) return
  const side = 9 * PATCH
  if (canvas.width !== side) canvas.width = canvas.height = side
  const context = canvas.getContext('2d')!
  const image = context.createImageData(side, side)
  for (let cell = 0; cell < 81; cell++)
    for (let j = 0; j < PATCH; j++)
      for (let i = 0; i < PATCH; i++) {
        const v = Math.max(0, Math.min(255, 128 + 48 * frame[cell * PATCH * PATCH + j * PATCH + i]))
        const p = (((Math.floor(cell / 9) * PATCH + j) * side + (cell % 9) * PATCH + i) * 4) | 0
        image.data[p] = image.data[p + 1] = image.data[p + 2] = v
        image.data[p + 3] = 255
      }
  context.putImageData(image, 0, 0)
}
