import { useSyncExternalStore } from 'react'
import i18n from './i18n'
import { readEvalFile } from './evalStore'
import { readBookFile } from './openingBook'
import { flipBookMove, flipBookPosition } from './bookPosition'
import { InitialPositionSFEN, Position, Color } from 'tsshogi'
import { getSettings, subscribeSettings, type EngineKind } from '@/appearance/settings'

interface UsiModule {
  addMessageListener: (listener: (line: string) => void) => void
  postMessage: (command: string) => void
  terminate: () => void
  FS?: { writeFile: (path: string, data: Uint8Array) => void }
}

// USI engine command channel (YaneuraOu/Fairy wasm module), not window/Worker postMessage, so there is no target origin.
function send(engine: UsiModule, command: string) {
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- UsiModule.postMessage takes a single USI command string, not a cross-window message
  engine.postMessage(command)
}

type EngineFactory = () => Promise<UsiModule>

declare global {
  var YaneuraOu_K_P: EngineFactory | undefined
  var YaneuraOu_HalfKP_noeval: EngineFactory | undefined
  var Stockfish: EngineFactory | undefined
}

export type Score = { cp: number } | { mate: number }

export interface Candidate {
  multipv: number
  move: string
  score: Score
  pv: string[]
  depth: number
}

export interface Analysis {
  bestmove: string
  candidates: Candidate[]
}

export interface EngineStatus {
  kind: EngineKind
  name: string
  error: string
  loading: boolean
  epoch: number
}

const ENGINES: Record<EngineKind, { script: string; factory: () => EngineFactory | undefined; options: () => string[] }> = {
  yaneuraou: {
    script: `${import.meta.env.BASE_URL}engine/yaneuraou.k-p.js`,
    factory: () => globalThis.YaneuraOu_K_P,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0'],
  },
  nnue: {
    script: `${import.meta.env.BASE_URL}engine/yaneuraou.halfkp.noeval.js`,
    factory: () => globalThis.YaneuraOu_HalfKP_noeval,
    options: () => ['USI_OwnBook value false', 'PvInterval value 0', 'EvalDir value .', 'EvalFile value nn.bin', `FV_SCALE value ${getSettings().fvScale}`],
  },
  fairy: { script: `${import.meta.env.BASE_URL}engine/fairy/stockfish.js`, factory: () => globalThis.Stockfish, options: () => ['USI_Variant value shogi'] },
}

let active: { key: string; engine: Promise<UsiModule> } | null = null
let current: UsiModule | null = null
let nativeBook: Promise<boolean> | null = null
let session = 0
let listener: ((line: string) => void) | null = null
let pending: (() => void) | null = null
let queue: Promise<unknown> = Promise.resolve()
let interruptible = false
let searching = false
let backgroundGeneration = 0
let status: EngineStatus = { kind: getSettings().engine, name: '', error: '', loading: false, epoch: 0 }
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
  )
}

function engineKey() {
  const { engine, fvScale } = getSettings()
  return engine === 'nnue' ? `${engine}:${fvScale}` : engine
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
    script.addEventListener('load', () => {
      clearTimeout(timer)
      resolve()
    })
    script.addEventListener('error', () => {
      clearTimeout(timer)
      script.remove()
      reject(new Error(`failed to load ${src}`))
    })
    document.head.append(script)
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
      send(engine, command)
    } catch (error) {
      clear()
      reject(error)
    }
  })
}

export function engineSupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined' && globalThis.crossOriginIsolated
}

async function boot(kind: EngineKind): Promise<UsiModule> {
  const id = session
  if (!engineSupported()) throw new Error('SharedArrayBuffer unavailable: page must be cross-origin isolated (COOP/COEP)')
  const spec = ENGINES[kind]
  const evalFile = kind === 'nnue' ? await readEvalFile() : null
  if (kind === 'nnue' && !evalFile) throw new Error(i18n.t('engine.noEvalFile'))
  await loadScript(spec.script, spec.factory)
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
  send(engine, 'setoption name USI_Hash value 128')
  send(engine, `setoption name Threads value ${Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1))}`)
  spec.options().forEach((option) => send(engine, `setoption name ${option}`))
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
  setStatus({ kind, name: evalFile ? `${name} (${evalFile.name})` : name, error: '', loading: false, epoch: status.epoch + 1 })
  return engine
}

function shutdown() {
  const previous = active
  active = null
  current = null
  nativeBook = null
  session++
  backgroundGeneration++
  pending?.()
  searching = false
  interruptible = false
  cache.clear()
  previous?.engine.then((engine) => engine.terminate()).catch(() => undefined)
}

export function getEngine(): Promise<UsiModule> {
  const key = engineKey()
  if (active && active.key !== key) shutdown()
  if (!active) {
    const kind = getSettings().engine
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
  if (engineSupported()) getEngine().catch((error) => console.warn('engine preload failed', error))
}

let configuredKey = engineKey()
subscribeSettings(() => {
  const key = engineKey()
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

const cache = new Map<string, { multipv: number; movetime: number; result: Promise<Analysis> }>()

export function analyze(
  usiPosition: string,
  {
    multipv = 3,
    movetime = 1500,
    background = false,
    onUpdate,
    book = false,
  }: { multipv?: number; movetime?: number; background?: boolean; onUpdate?: (analysis: Analysis) => void; book?: boolean } = {},
): Promise<Analysis> {
  const key = `${usiPosition}|book:${book}`
  const cached = cache.get(key)
  if (cached && cached.multipv >= multipv && cached.movetime >= movetime) return cached.result
  const result = search(usiPosition, multipv, movetime, background, onUpdate, book)
  if (!background) {
    cache.set(key, { multipv, movetime, result })
    result.catch(() => {
      if (cache.get(key)?.result === result) cache.delete(key)
    })
    if (cache.size > 400) cache.delete(cache.keys().next().value!)
  }
  return result
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
    send(engine, `setoption name ${option}`)
  await waitFor(engine, 'isready', 'readyok')
  return true
}

function search(
  usiPosition: string,
  multipv: number,
  movetime: number,
  background: boolean,
  onUpdate?: (analysis: Analysis) => void,
  book = false,
): Promise<Analysis> {
  if (searching && interruptible && current) send(current, 'stop')
  const generation = background ? ++backgroundGeneration : backgroundGeneration
  const run = async () => {
    const engine = await getEngine()
    if (engine !== current || (background && generation !== backgroundGeneration)) return { bestmove: '', candidates: [] }
    let command = usiPosition
    let flipped = false
    if (getSettings().engine !== 'fairy') {
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
      send(engine, `setoption name USI_OwnBook value ${enabled}`)
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
        send(engine, `setoption name BookEvalBlackLimit value ${flipped ? -140 : 0}`)
        if (flipped) command = `position sfen ${flipBookPosition(sfen)}${moves ? ` moves ${moves.split(' ').map(flipBookMove).join(' ')}` : ''}`
      }
    }
    searching = true
    interruptible = background
    send(engine, `setoption name MultiPV value ${multipv}`)
    send(engine, command)
    const lines = new Map<number, Candidate>()
    let bestmove = ''
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
            if (info.multipv === 1) onUpdate?.({ bestmove: info.move, candidates: [...lines.values()].toSorted((a, b) => a.multipv - b.multipv) })
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
      searching = false
      interruptible = false
    }
    return { bestmove, candidates: [...lines.values()].toSorted((a, b) => a.multipv - b.multipv) }
  }
  const result = queue.then(run, run)
  queue = result.catch(() => undefined)
  return result
}

export function scoreToCp(score: Score): number {
  return 'cp' in score ? score.cp : Math.sign(score.mate || 1) * 30000
}

export function formatScore(score: Score): string {
  if ('mate' in score) return score.mate > 0 ? `Mate in ${score.mate}` : `Mated in ${-score.mate}`
  return `${score.cp > 0 ? '+' : ''}${score.cp}`
}
