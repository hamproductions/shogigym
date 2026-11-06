import { useSyncExternalStore } from 'react'
import i18n from './i18n'
import { readEvalFile } from './evalStore'
import { engineLabel, modelFor, readEngineModel } from './engineModels'
import { readBookFile } from './openingBook'
import { flipBookMove, flipBookPosition } from './bookPosition'
import { InitialPositionSFEN, Position, Color } from 'tsshogi'
import { getSettings, subscribeSettings, type EngineKind } from '@/appearance/settings'

type UsiModule = {
  addMessageListener: (listener: (line: string) => void) => void
  postMessage: (command: string) => void
  terminate: () => void
  FS?: { writeFile: (path: string, data: Uint8Array, options?: { canOwn: boolean }) => void }
}

type EngineFactory = () => Promise<UsiModule>

declare global {
  interface Window {
    YaneuraOu_K_P?: EngineFactory
    YaneuraOu_HalfKP_noeval?: EngineFactory
    YaneuraOu_TsuyouraMini?: EngineFactory
    YaneuraOu_TsuyouraMicro?: EngineFactory
    YaneuraOu_HalfKP?: EngineFactory
    YaneuraOu_TanukiLi?: EngineFactory
    YaneuraOu_AobaNNUE?: EngineFactory
    Stockfish?: EngineFactory
  }
}

export type Score = { cp: number } | { mate: number }
export type EnginePurpose = 'analysis' | 'playing'

export function engineForPurpose(purpose: EnginePurpose = 'analysis'): EngineKind {
  const settings = getSettings()
  return (purpose === 'playing' ? settings.enginePlaying : settings.engineAnalysis) ?? settings.engine
}

export type Candidate = {
  multipv: number
  move: string
  score: Score
  pv: string[]
  depth: number
}

export type Analysis = {
  bestmove: string
  candidates: Candidate[]
}

export type EngineStatus = { kind: EngineKind; name: string; error: string; loading: boolean; epoch: number }

const ENGINES: Record<EngineKind, { script: string; factory: () => EngineFactory | undefined; options: () => string[]; files?: string[] }> = {
  yaneuraou: {
    script: `${import.meta.env.BASE_URL}engine/yaneuraou.k-p.js`,
    factory: () => window.YaneuraOu_K_P,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0'],
  },
  nnue: {
    script: `${import.meta.env.BASE_URL}engine/yaneuraou.halfkp.noeval.js`,
    factory: () => window.YaneuraOu_HalfKP_noeval,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value .', 'EvalFile value nn.bin', `FV_SCALE value ${getSettings().fvScale}`],
  },
  fairy: { script: `${import.meta.env.BASE_URL}engine/fairy/stockfish.js`, factory: () => window.Stockfish, options: () => ['USI_Variant value shogi'] },
  'tsuyoura-mini': {
    script: `${import.meta.env.BASE_URL}engines/tsuyoura-mini/yaneuraou.js`,
    factory: () => window.YaneuraOu_TsuyouraMini,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value /', 'EvalFile value nn.bin', 'FV_SCALE value 24'],
    files: ['nn.bin', 'progress.bin'],
  },
  'tsuyoura-micro': {
    script: `${import.meta.env.BASE_URL}engines/tsuyoura-micro/yaneuraou.js`,
    factory: () => window.YaneuraOu_TsuyouraMicro,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value /', 'EvalFile value nn.bin', 'FV_SCALE value 24'],
    files: ['nn.bin', 'progress.bin'],
  },
  suisho5: {
    script: `${import.meta.env.BASE_URL}engines/halfkp/yaneuraou.js`,
    factory: () => window.YaneuraOu_HalfKP,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value /', 'FV_SCALE value 24'],
  },
  'tanuki-hao': {
    script: `${import.meta.env.BASE_URL}engines/halfkp/yaneuraou.js`,
    factory: () => window.YaneuraOu_HalfKP,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value /', 'FV_SCALE value 20'],
  },
  'tanuki-li': {
    script: `${import.meta.env.BASE_URL}engines/tanuki-li/yaneuraou.js`,
    factory: () => window.YaneuraOu_TanukiLi,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value /', 'FV_SCALE value 20'],
  },
  aobannue: {
    script: `${import.meta.env.BASE_URL}engines/aobannue/yaneuraou.js`,
    factory: () => window.YaneuraOu_AobaNNUE,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value /', 'FV_SCALE value 40'],
  },
}

let active: { key: string; engine: Promise<UsiModule> } | null = null
let current: UsiModule | null = null
let nativeBook: Promise<boolean> | null = null
let session = 0
let listener: ((line: string) => void) | null = null
let pending: (() => void) | null = null
let interruptible = false
let searching = false
let backgroundGeneration = 0
let status: EngineStatus = { kind: engineForPurpose(), name: '', error: '', loading: false, epoch: 0 }
const statusListeners = new Set<() => void>()

function setStatus(patch: Partial<EngineStatus>) {
  status = { ...status, ...patch }
  statusListeners.forEach((l) => l())
}

export function useEngineStatus() {
  return useSyncExternalStore(
    (l) => {
      statusListeners.add(l)
      return () => {
        statusListeners.delete(l)
      }
    },
    () => status,
    () => status,
  )
}

function engineKey(kind = getSettings().engine) {
  return kind === 'nnue' ? `${kind}:${getSettings().fvScale}` : kind
}

function validatePosition(command: string) {
  const [start, moves = ''] = command.replace(/^position /, '').split(' moves ')
  const position = Position.newBySFEN(start === 'startpos' ? InitialPositionSFEN.STANDARD : start.replace(/^sfen /, ''))
  if (!position) throw new Error('Invalid engine position')
  for (const usi of moves.split(' ').filter(Boolean)) {
    const move = position.createMoveByUSI(usi)
    if (!move || !position.doMove(move)) throw new Error('Invalid engine move history')
  }
}

function loadScript(src: string, factory: () => EngineFactory | undefined): Promise<void> {
  if (factory()) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const timer = setTimeout(() => {
      script.remove()
      reject(new Error(`engine timed out loading ${src}`))
    }, 30000)
    script.src = src
    script.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    script.onerror = () => {
      clearTimeout(timer)
      script.remove()
      reject(new Error(`failed to load ${src}`))
    }
    document.head.appendChild(script)
  })
}

function waitFor(engine: UsiModule, command: string, terminator: string, onLine?: (line: string) => void, timeout = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const clear = () => {
      clearTimeout(timer)
      if (pending !== finish) return
      listener = null
      pending = null
    }
    const finish = () => {
      clear()
      resolve()
    }
    const timer = setTimeout(() => {
      clear()
      reject(new Error(`engine timed out waiting for ${terminator}`))
    }, timeout)
    pending = finish
    listener = (line) => {
      onLine?.(line)
      if (line.startsWith(terminator)) finish()
    }
    try {
      engine.postMessage(command)
    } catch (error) {
      clear()
      reject(error)
    }
  })
}

const noSubscribe = () => () => {}

export const useEngineSupported = () => useSyncExternalStore(noSubscribe, engineSupported, () => true)

export function engineSupported(): boolean {
  if (typeof window === 'undefined') return true
  return typeof SharedArrayBuffer !== 'undefined' && window.crossOriginIsolated
}

async function boot(kind: EngineKind): Promise<UsiModule> {
  const id = session
  if (!engineSupported()) throw new Error('SharedArrayBuffer unavailable: page must be cross-origin isolated (COOP/COEP)')
  const spec = ENGINES[kind]
  const evalFile = kind === 'nnue' ? await readEvalFile() : null
  if (kind === 'nnue' && !evalFile) throw new Error(i18n.t('engine.noEvalFile'))
  const model = modelFor(kind)
  const [, files, network] = await Promise.all([
    loadScript(spec.script, spec.factory),
    Promise.all(
      (spec.files ?? []).map(async (file) => {
        const response = await fetch(`${import.meta.env.BASE_URL}engines/${kind}/${file}`)
        if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
        return { name: file, bytes: new Uint8Array(await response.arrayBuffer()) }
      }),
    ),
    model ? readEngineModel(model) : null,
  ])
  if (id !== session) throw new Error('engine switched')
  const starting = spec.factory()!()
  void starting
    .then((engine) => {
      if (id !== session) engine.terminate()
    })
    .catch(() => undefined)
  let timer: ReturnType<typeof setTimeout> | undefined
  const engine = await Promise.race([
    starting,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('engine timed out starting')), 30000)
    }),
  ]).finally(() => clearTimeout(timer))
  if (id !== session) {
    engine.terminate()
    throw new Error('engine switched')
  }
  engine.addMessageListener((line) => {
    if (id === session) listener?.(line)
  })
  if (evalFile) engine.FS!.writeFile('/nn.bin', evalFile.bytes)
  for (const file of files) engine.FS!.writeFile(`/${file.name}`, file.bytes)
  if (network) engine.FS!.writeFile('/nn.bin', network, { canOwn: true })
  let name = ''
  await waitFor(engine, 'usi', 'usiok', (line) => {
    if (line.startsWith('id name ')) name = line.slice(8)
  }).catch((error) => {
    engine.terminate()
    throw error
  })
  if (id !== session) {
    engine.terminate()
    throw new Error('engine switched')
  }
  engine.postMessage('setoption name USI_Hash value 128')
  engine.postMessage(`setoption name Threads value ${Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1))}`)
  spec.options().forEach((option) => engine.postMessage(`setoption name ${option}`))
  let failure = ''
  await waitFor(engine, 'isready', 'readyok', (line) => {
    if (!line.startsWith('Error')) return
    failure = line
    pending?.()
  }).catch((error) => {
    engine.terminate()
    throw error
  })
  if (id !== session || failure) {
    engine.terminate()
    throw new Error(failure || 'engine switched')
  }
  current = engine
  const label = model || spec.files ? engineLabel(kind) : evalFile?.name
  setStatus({ kind, name: label ? `${name} (${label})` : name, error: '', loading: false })
  return engine
}

function shutdown(preserveResults = false) {
  const previous = active
  active = null
  current = null
  nativeBook = null
  session++
  if (!preserveResults) backgroundGeneration++
  pending?.()
  searching = false
  interruptible = false
  if (!preserveResults) cache.clear()
  previous?.engine.then((engine) => engine.terminate()).catch(() => undefined)
}

export function getEngine(requested?: EngineKind): Promise<UsiModule> {
  const kind = requested ?? engineForPurpose()
  const key = engineKey(kind)
  if (active && active.key !== key) shutdown(true)
  if (!active) {
    const engine = boot(kind)
    active = { key, engine }
    setStatus({ kind, name: '', error: '', loading: true })
    engine.catch((error: Error) => {
      if (active?.engine !== engine) return
      shutdown()
      setStatus({ error: error.message, loading: false })
    })
  }
  return active.engine
}

export function restartEngine() {
  shutdown()
  setStatus({ name: '', error: '', loading: false, epoch: status.epoch + 1 })
}

const configurationKey = () => `${engineKey(engineForPurpose('analysis'))}|${engineKey(engineForPurpose('playing'))}`
let configuredKey = configurationKey()
subscribeSettings(() => {
  const key = configurationKey()
  if (key === configuredKey) return
  configuredKey = key
  restartEngine()
})

export function parseInfo(line: string): Candidate | null {
  const tokens = line.split(' ')
  if (tokens[0] !== 'info' || !tokens.includes('pv')) return null
  const at = (key: string) => tokens[tokens.indexOf(key) + 1]
  const kind = at('score')
  const value = Number(tokens[tokens.indexOf('score') + 2])
  const pv = tokens.slice(tokens.indexOf('pv') + 1)
  return {
    multipv: tokens.includes('multipv') ? Number(at('multipv')) : 1,
    move: pv[0],
    score: kind === 'mate' ? { mate: value } : { cp: value },
    pv,
    depth: Number(at('depth')),
  }
}

type Shared = {
  multipv: number
  movetime: number
  users: number
  listeners: Set<(analysis: Analysis) => void>
  controller: AbortController
  job: Job
  result: Promise<Analysis>
}

const cache = new Map<string, { multipv: number; movetime: number; analysis: Analysis }>()
const inflight = new Map<string, Shared>()

const enough = (entry: { multipv: number; movetime: number } | undefined, multipv: number, movetime: number) =>
  !!entry && entry.multipv >= multipv && entry.movetime >= movetime

function remember(key: string, multipv: number, movetime: number, analysis: Analysis) {
  if (!analysis.candidates.length || enough(cache.get(key), multipv, movetime)) return
  cache.delete(key)
  cache.set(key, { multipv, movetime, analysis })
  if (cache.size > 400) cache.delete(cache.keys().next().value!)
}

function join(shared: Shared, onUpdate?: (analysis: Analysis) => void, signal?: AbortSignal): Promise<Analysis> {
  shared.users++
  if (onUpdate) shared.listeners.add(onUpdate)
  let left = false
  const leave = () => {
    if (left) return
    left = true
    shared.users--
    if (onUpdate) shared.listeners.delete(onUpdate)
    if (!shared.users) shared.controller.abort()
  }
  return new Promise<Analysis>((resolve, reject) => {
    const abort = () => {
      leave()
      reject(signal!.reason)
    }
    signal?.addEventListener('abort', abort, { once: true })
    shared.result.then(
      (analysis) => {
        signal?.removeEventListener('abort', abort)
        left = true
        resolve(analysis)
      },
      (error) => {
        signal?.removeEventListener('abort', abort)
        left = true
        reject(error)
      },
    )
  })
}

export function analyze(
  usiPosition: string,
  {
    multipv = 3,
    movetime = 1500,
    background = false,
    idle = false,
    onUpdate,
    book = false,
    purpose = 'analysis',
    signal,
  }: {
    multipv?: number
    movetime?: number
    background?: boolean
    idle?: boolean
    onUpdate?: (analysis: Analysis) => void
    book?: boolean
    purpose?: EnginePurpose
    signal?: AbortSignal
  } = {},
): Promise<Analysis> {
  signal?.throwIfAborted()
  validatePosition(usiPosition)
  const kind = engineForPurpose(purpose)
  const key = `${engineKey(kind)}|${usiPosition}|book:${book}`
  const known = cache.get(key)
  if (known && enough(known, multipv, movetime)) return Promise.resolve(known.analysis)
  if (background) {
    const { job, result } = search(kind, usiPosition, multipv, movetime, PRIORITY.background, onUpdate, book, signal)
    return result.then((analysis) => {
      if (!signal?.aborted && !job.stopped) remember(key, multipv, movetime, analysis)
      return analysis
    })
  }
  const priority = idle ? PRIORITY.idle : PRIORITY.foreground
  const existing = inflight.get(key)
  if (existing && !existing.controller.signal.aborted && enough(existing, multipv, movetime)) {
    existing.job.priority = Math.max(existing.job.priority, priority)
    return join(existing, onUpdate, signal)
  }
  const controller = new AbortController()
  const listeners = new Set<(analysis: Analysis) => void>()
  const { job, result } = search(kind, usiPosition, multipv, movetime, priority, (analysis) => listeners.forEach((l) => l(analysis)), book, controller.signal)
  const shared: Shared = { multipv, movetime, users: 0, listeners, controller, job, result }
  inflight.set(key, shared)
  result.then(
    (analysis) => remember(key, multipv, movetime, analysis),
    () => undefined,
  )
  void result
    .catch(() => undefined)
    .finally(() => {
      if (inflight.get(key) === shared) inflight.delete(key)
    })
  return join(shared, onUpdate, signal)
}

async function prepareBook(engine: UsiModule) {
  const file = await readBookFile()
  if (!file) return false
  if (engine !== current) return false
  if (!engine.FS) throw new Error('This engine cannot load opening books')
  engine.FS.writeFile('/user_book1.db', file.bytes)
  for (const option of [
    'BookDir value /',
    'BookFile value user_book1.db',
    'IgnoreBookPly value true',
    'BookOnTheFly value true',
    'BookMoves value 999',
    'BookEvalDiff value 0',
    'BookDepthLimit value 0',
  ])
    engine.postMessage(`setoption name ${option}`)
  await waitFor(engine, 'isready', 'readyok')
  return true
}

const PRIORITY = { idle: 0, background: 1, foreground: 2 } as const

type Job = { priority: number; order: number; stopped: boolean; start: () => void }

const jobs: Job[] = []
let running: Job | null = null
let jobOrder = 0

function pump() {
  if (running || !jobs.length) return
  const next = jobs.reduce((best, job) => (job.priority > best.priority || (job.priority === best.priority && job.order < best.order) ? job : best))
  jobs.splice(jobs.indexOf(next), 1)
  running = next
  next.start()
}

function search(
  kind: EngineKind,
  usiPosition: string,
  multipv: number,
  movetime: number,
  priority: number,
  onUpdate?: (analysis: Analysis) => void,
  book = false,
  signal?: AbortSignal,
): { job: Job; result: Promise<Analysis> } {
  const background = priority === PRIORITY.background
  if (searching && interruptible && running && (priority > running.priority || priority === PRIORITY.background)) {
    running.stopped = true
    current?.postMessage('stop')
  }
  const generation = background ? ++backgroundGeneration : backgroundGeneration
  const run = async () => {
    signal?.throwIfAborted()
    const engine = await getEngine(kind)
    signal?.throwIfAborted()
    if (engine !== current || (background && generation !== backgroundGeneration)) return { bestmove: '', candidates: [] }
    let command = usiPosition
    let flipped = false
    if (kind !== 'fairy') {
      let enabled = false
      if (book) {
        nativeBook ??= prepareBook(engine)
        try {
          enabled = await nativeBook
        } catch (error) {
          if (engine !== current) return { bestmove: '', candidates: [] }
          nativeBook = Promise.resolve(false)
          setStatus({ error: error instanceof Error ? error.message : String(error) })
        }
      }
      if (engine !== current || (background && generation !== backgroundGeneration)) return { bestmove: '', candidates: [] }
      engine.postMessage(`setoption name USI_OwnBook value ${enabled}`)
      if (enabled) {
        const [start, moves = ''] = usiPosition.replace(/^position /, '').split(' moves ')
        const sfen = start === 'startpos' ? InitialPositionSFEN.STANDARD : start.replace(/^sfen /, '')
        const position = Position.newBySFEN(sfen)
        if (!position) throw new Error('Invalid opening book position')
        for (const usi of moves.split(' ').filter(Boolean)) {
          const move = position.createMoveByUSI(usi)
          if (!move || !position.doMove(move)) throw new Error('Invalid opening book move history')
        }
        flipped = position.color === Color.WHITE
        engine.postMessage(`setoption name BookEvalBlackLimit value ${flipped ? -140 : 0}`)
        if (flipped) command = `position sfen ${flipBookPosition(sfen)}${moves ? ` moves ${moves.split(' ').map(flipBookMove).join(' ')}` : ''}`
      }
    }
    signal?.throwIfAborted()
    searching = true
    interruptible = job.priority !== PRIORITY.foreground
    engine.postMessage(`setoption name MultiPV value ${multipv}`)
    engine.postMessage(command)
    const lines = new Map<number, Candidate>()
    let bestmove = ''
    let frame = 0
    const report = () => {
      frame = 0
      onUpdate?.({ bestmove: lines.get(1)?.move ?? '', candidates: [...lines.values()].sort((a, b) => a.multipv - b.multipv) })
    }
    const stop = () => engine.postMessage('stop')
    signal?.addEventListener('abort', stop, { once: true })
    try {
      await waitFor(
        engine,
        `go movetime ${movetime}`,
        'bestmove',
        (line) => {
          const info = parseInfo(line)
          if (info) {
            if (flipped) {
              info.move = flipBookMove(info.move)
              info.pv = info.pv.map(flipBookMove)
            }
            lines.set(info.multipv, info)
            if (onUpdate && !frame) frame = requestAnimationFrame(report)
          }
          if (line.startsWith('bestmove')) bestmove = flipped ? flipBookMove(line.split(' ')[1]) : line.split(' ')[1]
        },
        movetime + 10000,
      )
    } catch (error) {
      if (engine === current) {
        shutdown()
        setStatus({ error: error instanceof Error ? error.message : String(error) })
      }
      throw error
    } finally {
      signal?.removeEventListener('abort', stop)
      cancelAnimationFrame(frame)
      searching = false
      interruptible = false
    }
    signal?.throwIfAborted()
    return { bestmove, candidates: [...lines.values()].sort((a, b) => a.multipv - b.multipv) }
  }
  const job: Job = { priority, order: jobOrder++, stopped: false, start: () => undefined }
  const attempt = (): Promise<Analysis> =>
    new Promise<void>((resolve) => {
      job.start = resolve
      jobs.push(job)
      pump()
    })
      .then(run)
      .finally(() => {
        running = null
        pump()
      })
      .then((analysis) => {
        if (!job.stopped || job.priority !== PRIORITY.idle || signal?.aborted) return analysis
        job.stopped = false
        return attempt()
      })
  return { job, result: attempt() }
}

export function scoreToCp(score: Score): number {
  return 'cp' in score ? score.cp : score.mate > 0 ? 30000 : -30000
}

export function formatScore(score: Score): string {
  if ('mate' in score) return score.mate > 0 ? `Mate in ${score.mate}` : `Mated in ${-score.mate}`
  return `${score.cp > 0 ? '+' : ''}${score.cp}`
}
