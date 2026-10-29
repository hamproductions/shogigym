import { saveEvalFile } from './evalStore'
import type { BookProgress } from './bookDownload'

export type EvalManifest = { name: string; size: number; sha256: string; url?: string; fvScale?: number }

const base = `${import.meta.env.BASE_URL}eval/`

export async function evalManifest(signal?: AbortSignal): Promise<EvalManifest | null> {
  const response = await fetch(`${base}manifest.json`, { signal })
  if (response.status === 404 || !response.headers.get('content-type')?.includes('json')) return null
  if (!response.ok) throw new Error(`Evaluation file: HTTP ${response.status}`)
  return response.json()
}

export async function downloadEvalFile(manifest: EvalManifest, signal: AbortSignal, progress: (value: BookProgress) => void) {
  const response = await fetch(manifest.url ? new URL(manifest.url, location.href) : `${base}${manifest.name}`, { signal })
  if (!response.ok || !response.body) throw new Error(`Evaluation file: HTTP ${response.status}`)
  const bytes = new Uint8Array(manifest.size)
  const reader = response.body.getReader()
  let done = 0
  for (;;) {
    const chunk = await reader.read()
    if (chunk.done) break
    if (done + chunk.value.length > manifest.size) throw new Error('Evaluation file: unexpected size')
    bytes.set(chunk.value, done)
    done += chunk.value.length
    progress({ done, total: manifest.size })
  }
  if (done !== manifest.size) throw new Error('Evaluation file: incomplete download')
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hash = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('')
  if (hash !== manifest.sha256) throw new Error('Evaluation file: checksum mismatch')
  signal.throwIfAborted()
  await saveEvalFile(new File([bytes], manifest.name))
}
