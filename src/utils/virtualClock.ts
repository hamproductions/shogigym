interface Timer {
  due: number
  run: () => void
  every: number
}

const real = {
  raf: globalThis.requestAnimationFrame.bind(window),
  caf: globalThis.cancelAnimationFrame.bind(window),
  now: performance.now.bind(performance),
  date: Date.now.bind(Date),
  setTimeout: globalThis.setTimeout.bind(window),
  clearTimeout: globalThis.clearTimeout.bind(window),
  setInterval: globalThis.setInterval.bind(window),
  clearInterval: globalThis.clearInterval.bind(window),
}

let on = false
let clock = 0
let offset = 0
let next = 1_000_000
const frames = new Map<number, FrameRequestCallback>()
const timers = new Map<number, Timer>()

export function installVirtualClock() {
  performance.now = () => (on ? clock : real.now())
  Date.now = () => (on ? offset + clock : real.date())
  globalThis.requestAnimationFrame = (cb) => {
    if (!on) return real.raf(cb)
    frames.set(++next, cb)
    return next
  }
  globalThis.cancelAnimationFrame = (id) => {
    if (!frames.delete(id)) real.caf(id)
  }
  const schedule = (every: boolean) =>
    ((cb: TimerHandler, ms = 0, ...args: unknown[]) => {
      const run = () => (typeof cb === 'function' ? cb(...args) : undefined)
      if (!on) return every ? real.setInterval(run, ms) : real.setTimeout(run, ms)
      timers.set(++next, { due: clock + Math.max(0, ms), run, every: every ? Math.max(1, ms) : 0 })
      return next
    }) as typeof globalThis.setTimeout
  globalThis.setTimeout = schedule(false)
  globalThis.setInterval = schedule(true) as typeof globalThis.setInterval
  globalThis.clearTimeout = ((id?: number) => {
    if (id !== undefined && !timers.delete(id)) real.clearTimeout(id)
  }) as typeof globalThis.clearTimeout
  globalThis.clearInterval = globalThis.clearTimeout as typeof globalThis.clearInterval
}

export function startVirtual() {
  clock = real.now()
  offset = real.date() - clock
  on = true
  return clock
}

export function stepVirtual(ms: number) {
  const until = clock + ms
  for (;;) {
    let first: [number, Timer] | null = null
    for (const entry of timers) if (entry[1].due <= until && (!first || entry[1].due < first[1].due)) first = entry
    if (!first) break
    const [id, timer] = first
    clock = Math.max(clock, timer.due)
    if (timer.every) timer.due += timer.every
    else timers.delete(id)
    timer.run()
  }
  clock = until
  const due = [...frames.entries()]
  frames.clear()
  for (const [, cb] of due) cb(clock)
  return new Promise<void>((resolve) => real.raf(() => real.raf(() => resolve())))
}
