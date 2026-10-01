type YaneuraOuModule = {
  addMessageListener: (listener: (line: string) => void) => void
  postMessage: (command: string) => void
  terminate: () => void
}

declare global {
  interface Window {
    YaneuraOu_K_P?: () => Promise<YaneuraOuModule>
  }
}

export type Score = { cp: number } | { mate: number }

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

const SCRIPT_URL = '/engine/yaneuraou.k-p.js'

let enginePromise: Promise<YaneuraOuModule> | null = null
let listener: ((line: string) => void) | null = null
let queue: Promise<unknown> = Promise.resolve()
let interruptible = false
let searching = false
let backgroundGeneration = 0

function loadScript(): Promise<void> {
  if (window.YaneuraOu_K_P) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`failed to load ${SCRIPT_URL}`))
    document.head.appendChild(script)
  })
}

function waitFor(engine: YaneuraOuModule, command: string, terminator: string, onLine?: (line: string) => void): Promise<void> {
  return new Promise((resolve) => {
    listener = (line) => {
      onLine?.(line)
      if (line.startsWith(terminator)) {
        listener = null
        resolve()
      }
    }
    engine.postMessage(command)
  })
}

export function engineSupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined' && window.crossOriginIsolated
}

export function getEngine(): Promise<YaneuraOuModule> {
  enginePromise ??= (async () => {
    if (!engineSupported()) throw new Error('SharedArrayBuffer unavailable: page must be cross-origin isolated (COOP/COEP)')
    await loadScript()
    const engine = await window.YaneuraOu_K_P!()
    engine.addMessageListener((line) => listener?.(line))
    await waitFor(engine, 'usi', 'usiok')
    engine.postMessage('setoption name USI_Hash value 128')
    engine.postMessage(`setoption name Threads value ${Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1))}`)
    engine.postMessage('setoption name USI_OwnBook value false')
    engine.postMessage('setoption name PvInterval value 0')
    await waitFor(engine, 'isready', 'readyok')
    return engine
  })()
  return enginePromise
}

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

export function analyze(usiPosition: string, { multipv = 3, movetime = 1500, background = false } = {}): Promise<Analysis> {
  const cached = cache.get(usiPosition)
  if (cached && cached.multipv >= multipv && cached.movetime >= movetime) return cached.result
  const result = search(usiPosition, multipv, movetime, background)
  if (!background) {
    cache.set(usiPosition, { multipv, movetime, result })
    result.catch(() => cache.delete(usiPosition))
    if (cache.size > 400) cache.delete(cache.keys().next().value!)
  }
  return result
}

function search(usiPosition: string, multipv: number, movetime: number, background: boolean): Promise<Analysis> {
  if (searching && interruptible) enginePromise?.then((engine) => engine.postMessage('stop'))
  const generation = background ? ++backgroundGeneration : backgroundGeneration
  const run = async () => {
    const engine = await getEngine()
    if (background && generation !== backgroundGeneration) return { bestmove: '', candidates: [] }
    searching = true
    interruptible = background
    engine.postMessage(`setoption name MultiPV value ${multipv}`)
    engine.postMessage(usiPosition)
    const lines = new Map<number, Candidate>()
    let bestmove = ''
    await waitFor(engine, `go movetime ${movetime}`, 'bestmove', (line) => {
      const info = parseInfo(line)
      if (info) lines.set(info.multipv, info)
      if (line.startsWith('bestmove')) bestmove = line.split(' ')[1]
    })
    searching = false
    return { bestmove, candidates: [...lines.values()].sort((a, b) => a.multipv - b.multipv) }
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
