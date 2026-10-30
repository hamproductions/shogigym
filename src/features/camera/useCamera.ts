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
  edgeMidpoint,
  fitCalibration,
  frameBuffer,
  inferMove,
  cropCells,
  MOTION,
  moveShape,
  legalUsis,
  occupancy,
  autoGrid,
  gridLocked,
  gridScore,
  occupancyChanges,
  occupancyOf,
  SHIFTED,
  PATCH,
  PieceBook,
  redBuffer,
  sample,
  type Calibration,
  type Frame,
  type Rotation,
  type Sampler,
} from './vision'

const KEY = 'joseki-practice:camera:v1'
const WIDTH = 640
const STILL = 2
const CONFIRM = 2
const UNSURE = 10
const TAKEBACK = 4
const LONG = 45
const SETUP_TOLERANCE = 4

const changedSquares = (a: string, b: string) => {
  const [p, q] = [positionOf(a), positionOf(b)]
  return Square.all.filter((s) => p.board.at(s)?.type !== q.board.at(s)?.type || p.board.at(s)?.color !== q.board.at(s)?.color).map((s) => s.index)
}
const recentReplies = (line: string[], n: number, userSide: Side) => {
  const out: { ply: number; cells: number[] }[] = []
  for (let k = n - 1; k >= 0 && k >= n - 4 && out.length < 2; k--)
    if (colorSide(positionOf(line[k]).color) !== userSide) out.unshift({ ply: k, cells: changedSquares(line[k], line[k + 1]) })
  return out
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
  | { kind: 'expect'; cells: number[]; move?: { sfen: string; usi: string; last?: string }; undo: boolean }
  | { kind: 'sent'; sfen: string; usi: string; last?: string }
  | { kind: 'takeback'; ply: number }
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
  opponent: boolean
  reply?: string
  land: () => void
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

  const [phone, setPhone] = useState<{ stream: MediaStream | null; link: PhoneLink }>({ stream: null, link: 'waiting' })
  useEffect(() => {
    if (!open || file) return
    return receivePhone(
      (media) => {
        setPhone((p) => ({ ...p, stream: media }))
        if (media) update((s) => (s.deviceId === PHONE_SOURCE ? s : { ...s, deviceId: PHONE_SOURCE }))
      },
      (link) => setPhone((p) => ({ ...p, link })),
    )
  }, [open, file, update])

  useEffect(() => {
    if (!open || file || stored.deviceId !== PHONE_SOURCE) return
    setStream(phone.stream)
    if (!phone.stream) setStatus({ kind: 'phone', link: phone.link })
  }, [open, file, stored.deviceId, phone, setStatus])

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
      listDevices()
      return () => {
        cancelled = true
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
    frame: null as { data: Uint8ClampedArray; width: number; height: number } | null,
    moving: 0,
    gridAt: 0,
    regrid: true,
    lines: 0,
    noise: 0,
    streak: { key: '', count: 0 },
    anchorFor: null as string | null,
    shiftedFor: 0,
    matched: -1,
    booked: null as string | null,
    book: new PieceBook(),
    issued: null as string | null,
    orient: false,
  })

  const anchor = useCallback((sfen: string) => {
    const e = engine.current
    if (e.anchorFor === sfen) return
    e.anchorFor = sfen
    e.reference = snapshot(e.current, e.red)
    if (e.booked !== sfen) {
      e.book.update(positionOf(sfen), e.current)
      e.booked = sfen
    }
  }, [])

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

  const resolve = useCallback(
    (off: number[]) => {
      const e = engine.current
      const { live, line, moves, userSide, opponent, reply, land, canMove, busy, commit, promote, undo } = latest.current
      const here = positionOf(live)
      const n = line.findIndex((s) => samePosition(s, live))
      const observed = e.occupied
      const matches = (sfen: string) => !occupancyChanges(occupancyOf(positionOf(sfen)), observed).length
      const verdict = (key: string, need: number) => {
        e.decisionKey = key
        e.streak = e.streak.key === key ? { key, count: e.streak.count + 1 } : { key, count: 1 }
        return e.streak.count >= need
      }
      if (reply) {
        const next = positionOf(live)
        next.doMove(next.createMoveByUSI(reply)!)
        const target = occupancyOf(next)
        const replyCells = occupancyChanges(occupancyOf(here), target)
        const left = occupancyChanges(target, observed)
        const loosely = legalUsis(next).some((usi) => {
          const after = positionOf(next.sfen)
          after.doMove(after.createMoveByUSI(usi)!)
          const cells = occupancyChanges(target, occupancyOf(after))
          return cells.some((c) => !replyCells.includes(c)) && occupancyChanges(occupancyOf(after), observed).every((c) => replyCells.includes(c))
        })
        if (!left.length || moveShape(next, left) || loosely) {
          if (!verdict(`land:${reply}`, CONFIRM)) return
          const id = `${live}:land:${reply}`
          if (e.issued === id) return
          e.issued = id
          land()
          return setStatus({ kind: 'sent', sfen: live, usi: reply, last: moves[n - 1] })
        }
        if (off.every((c) => replyCells.includes(c))) {
          verdict(`reply:${reply}`, 1)
          if (!off.length) anchor(live)
          return setStatus({ kind: 'expect', cells: replyCells, move: { sfen: live, usi: reply, last: moves[n - 1] }, undo: false })
        }
      }
      if (!off.length) {
        verdict('sync', 1)
        anchor(live)
        e.issued = null
        e.matched = n
        return setStatus({ kind: 'watching', ready: canMove && !busy, ply: moves.length })
      }
      let at = -1
      for (let k = n - 1; k >= 0 && k >= n - 12; k--)
        if (matches(line[k])) {
          at = k
          break
        }
      e.matched = at
      if (at >= 0) {
        const toMove = colorSide(positionOf(line[at]).color)
        if (opponent && toMove !== userSide) {
          verdict(`behind:${at}`, 1)
          return setStatus({
            kind: 'expect',
            cells: changedSquares(line[at], live),
            move: { sfen: line[at], usi: moves[at], last: moves[at - 1] },
            undo: false,
          })
        }
        if (!verdict(`takeback:${at}`, TAKEBACK)) return
        const id = `undo:${n}`
        if (e.issued === id) return
        e.issued = id
        undo()
        return setStatus({ kind: 'takeback', ply: at })
      }
      const replies = opponent ? recentReplies(line, n, userSide) : []
      const loose = new Set(replies.flatMap((r) => r.cells))
      if (replies.length && off.every((c) => loose.has(c))) {
        const reply = replies.find((r) => r.cells.some((c) => off.includes(c)))!
        verdict(`behind:${reply.ply}`, 1)
        return setStatus({
          kind: 'expect',
          cells: reply.cells,
          move: { sfen: line[reply.ply], usi: moves[reply.ply], last: moves[reply.ply - 1] },
          undo: false,
        })
      }
      const added = off.filter((c) => observed[c] === 1)
      const play = (off: number[]) => {
        if (!verdict(`move:${off.join(',')}`, CONFIRM)) return
        if (!canMove || busy) return setStatus({ kind: 'ahead', cells: off, side: colorSide(here.color) })
        if (e.classifying) return
        const frame = e.frame
        const calibration = calibrationRef.current
        const after = snapshot(e.current, e.red)
        const before = e.reference ?? after
        const cells = [...off]
        for (const c of off) {
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
            if (!samePosition(latest.current.live, live)) return
            const resolution = inferMove(here, off, before, after, e.book, readings)
            if (!resolution) return setStatus({ kind: 'unknown', cells: off, added, side: colorSide(here.color), covered: false })
            if ('drop' in resolution) return setStatus({ kind: 'drop', ...resolution.drop })
            const id = 'usi' in resolution ? `${live}:${resolution.usi}` : `${live}:promote:${off.join(',')}`
            if (e.issued === id) return
            e.issued = id
            if ('usi' in resolution) {
              commit(resolution.usi)
              if (calibrationRef.current && !calibrationRef.current.oriented) setCalibration({ ...calibrationRef.current, oriented: true })
              return setStatus({ kind: 'sent', sfen: live, usi: resolution.usi, last: moves[n - 1] })
            }
            promote(resolution.promote.from, resolution.promote.to)
          })
      }
      if (moveShape(here, off)) return play(off)
      if (loose.size && canMove && !busy) {
        const expected = occupancyOf(here)
        const found = new Map<string, number[]>()
        for (const usi of legalUsis(here)) {
          const next = positionOf(live)
          next.doMove(next.createMoveByUSI(usi)!)
          const after = occupancyOf(next)
          const cells = occupancyChanges(expected, after)
          if (cells.some((c) => !loose.has(c)) && occupancyChanges(after, observed).every((c) => loose.has(c))) found.set(cells.join(','), cells)
        }
        if (found.size === 1) return play([...found.values()][0])
      }
      const covered = off.length > SETUP_TOLERANCE && added.length * 3 >= off.length * 2
      if (!verdict(`off:${off.join(',')}`, covered ? LONG : UNSURE)) return
      if (covered) return setStatus({ kind: 'unknown', cells: off, added, side: colorSide(here.color), covered: true })
      if (off.length > SETUP_TOLERANCE) return setStatus({ kind: 'mismatch', cells: off })
      setStatus({ kind: 'unknown', cells: off, added, side: colorSide(here.color), covered: false })
    },
    [latest, setStatus, calibrationRef, setCalibration, anchor],
  )

  const fitsGame = useCallback(
    (small: { data: Uint8ClampedArray; width: number; height: number }, corners: Point[]) => {
      const { live, line } = latest.current
      const frame = frameBuffer()
      const red = redBuffer()
      const targets = [live, ...line].map((sfen) => occupancyOf(positionOf(sfen)))
      return ([0, 2] as const).some((rotation) => {
        const sampler = buildSampler({ corners, rotation }, small.width, small.height)
        if (!sampler) return false
        sample(sampler, small.data, frame, red)
        const seen = occupancy(frame, undefined, null, red)
        return targets.some((target) => occupancyChanges(target, seen).length <= 2)
      })
    },
    [latest],
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
      if (found && (gridLocked(small.data, small.width, small.height, found.corners) || fitsGame(small, found.corners)))
        return setCornersRef.current(found.corners)
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
      const kept = fitsGame(small, calibration.corners)
      const found = autoGrid(small.data, small.width, small.height, calibration.corners, kept)
      const moved = found && Math.max(...found.corners.map((c, i) => Math.hypot(c.x - calibration.corners[i].x, c.y - calibration.corners[i].y))) > 0.006
      const better = found && (kept ? found.score > before + 3 : true)
      if (found && moved && better && (gridLocked(small.data, small.width, small.height, found.corners) || fitsGame(small, found.corners))) {
        e.reference = null
        e.anchorFor = null
        e.previous = null
        e.settled = null
        return setCalibration({ ...calibration, corners: found.corners })
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
    occupancy(e.current, e.occupied, e.occupied, e.red)
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
        physicalPly: e.matched,
        livePly: gameLine.findIndex((x) => samePosition(x, current)),
        occupied: [...e.occupied],
        baseline: [...occupancyOf(positionOf(current))],
        readings: e.readings,
      })
    }
    if (motion > Math.max(MOTION, e.noise * 4)) {
      e.settled = e.occupied.slice()
      e.still = 0
      e.calm = 0
      if (++e.moving >= LONG) setStatus({ kind: 'moving' })
      return
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
    const { live, line } = latest.current
    const off = occupancyChanges(occupancyOf(positionOf(live)), e.occupied)
    if (!calibration.oriented && off.length) {
      const reversed = e.occupied.slice().reverse()
      const best = (o: Uint8Array) => Math.min(...[live, ...line].map((sfen) => occupancyChanges(occupancyOf(positionOf(sfen)), o).length))
      if (best(reversed) < best(e.occupied)) {
        e.previous = null
        e.settled = null
        e.reference = null
        e.anchorFor = null
        e.samplerFor = ''
        return setCalibration({ ...calibration, rotation: ((calibration.rotation + 2) % 4) as Rotation })
      }
    }
    if (off.length >= SHIFTED && e.lines > 0 && gridAt(calibration.corners).score < e.lines * 0.6) {
      if (++e.shiftedFor < LONG) return
      e.shiftedFor = 0
      e.regrid = true
      return setStatus({ kind: 'shifted' })
    }
    e.shiftedFor = 0
    if (!off.length) e.lines = Math.max(e.lines * 0.9, gridAt(calibration.corners).score)
    resolve(off)
  }, [calibrationRef, resolve, latest, autoFit, fitsGame, setCalibration, setStatus])

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
      e.anchorFor = null
      e.previous = null
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
      e.anchorFor = null
      e.previous = null
      e.settled = null
      if (next) latest.current.fresh()
      setFile(next)
    },
    calibration,
    setCorners,
    rotate: () => {
      if (!calibration) return
      const e = engine.current
      e.reference = null
      e.anchorFor = null
      e.previous = null
      setCalibration({ ...calibration, rotation: ((calibration.rotation + 1) % 4) as Rotation, oriented: true })
    },
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
