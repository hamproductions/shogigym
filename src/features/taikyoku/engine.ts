type Pending = { lines: string[]; onLine?: (line: string) => void; resolve: (lines: string[]) => void }

/** Promise wrapper over the Taikyoku WebAssembly worker. */
export class TaikyokuEngine {
  private worker = new Worker(`${import.meta.env.BASE_URL}taikyoku/worker.js`)
  private pending = new Map<number, Pending>()
  private seq = 0

  constructor() {
    this.worker.onmessage = ({ data }: MessageEvent<{ type: 'line' | 'done'; id: number; line?: string }>) => {
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
    return new Promise<string[]>((resolve) => {
      const id = ++this.seq
      this.pending.set(id, { lines: [], onLine, resolve })
      this.worker.postMessage({ id, cmd })
    })
  }

  terminate() {
    this.worker.terminate()
    this.pending.clear()
  }
}
