type Pending = { lines: string[]; onLine?: (line: string) => void; resolve: (lines: string[]) => void; reject: (error: Error) => void }

/** Promise wrapper over the Taikyoku WebAssembly worker. */
export class TaikyokuEngine {
  private worker = new Worker(`${import.meta.env.BASE_URL}taikyoku/worker.js`)
  private pending = new Map<number, Pending>()
  private seq = 0
  private failure: Error | null = null

  constructor() {
    this.worker.onerror = () => this.fail(new Error('Taikyoku engine failed'))
    this.worker.onmessageerror = () => this.fail(new Error('Taikyoku engine message failed'))
    this.worker.onmessage = ({ data }: MessageEvent<{ type: 'line' | 'done' | 'error'; id: number; line?: string; error?: string }>) => {
      if (data.type === 'error') return this.fail(new Error(data.error ?? 'Taikyoku engine failed'))
      const job = this.pending.get(data.id)
      if (!job) return
      if (data.type === 'line' && data.line !== undefined) {
        job.lines.push(data.line)
        job.onLine?.(data.line)
      } else if (data.type === 'done') {
        this.pending.delete(data.id)
        job.resolve(job.lines)
      }
    }
  }

  /** Sends one UCI command; resolves with every line it printed. */
  run(cmd: string, onLine?: (line: string) => void) {
    return new Promise<string[]>((resolve, reject) => {
      if (this.failure) return reject(this.failure)
      const id = ++this.seq
      this.pending.set(id, { lines: [], onLine, resolve, reject })
      this.worker.postMessage({ id, cmd })
    })
  }

  private fail(error: Error) {
    this.failure = error
    for (const job of this.pending.values()) job.reject(error)
    this.pending.clear()
  }

  terminate() {
    this.worker.terminate()
    this.fail(new Error('Taikyoku engine terminated'))
  }
}
