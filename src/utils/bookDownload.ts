import { binaryStore } from './binaryStore'
import { saveBookFile } from './openingBook'

export const clearCompactBook = async () => {
  for (let index = 0; index < 64; index++) await compactShard(index).clear()
  await binaryStore('shogigym:compact-book', 'complete').clear()
}
export async function clearBookDownloadCache() {
  await clearCompactBook()
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('shogigym:full-book-download')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Opening book download is still active'))
  })
}
export const compactShard = (index: number) => binaryStore('shogigym:compact-book', String(index))
export const compactUrl = (index: number) => `${import.meta.env.BASE_URL}books/peta233-v1/${index.toString(16).padStart(2, '0')}.json`
export type BookProgress = { done: number; total: number }

type FullManifest = { size: number; compressedSize: number; chunks: { file: string; size: number; compressedSize: number; sha256: string }[] }
export async function downloadFullBook(signal: AbortSignal, progress: (value: BookProgress) => void) {
  const base = `${import.meta.env.BASE_URL}books/peta233-full-v1/`
  const response = await fetch(`${base}manifest.json`, { signal })
  if (!response.ok) throw new Error(`Opening book: HTTP ${response.status}`)
  const manifest: FullManifest = await response.json()
  const blobs: Blob[] = []
  let done = 0
  for (const chunk of manifest.chunks) {
    signal.throwIfAborted()
    const store = binaryStore('shogigym:full-book-download', chunk.file)
    let cached = await store.read()
    if (!cached) {
      const response = await fetch(base + chunk.file, { signal })
      if (!response.ok) throw new Error(`Opening book: HTTP ${response.status}`)
      const bytes = new Uint8Array(await response.arrayBuffer())
      signal.throwIfAborted()
      await store.save(new File([bytes], chunk.file))
      cached = { name: chunk.file, size: bytes.length, bytes }
    }
    const digest = await crypto.subtle.digest('SHA-256', cached.bytes as BufferSource)
    const hash = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('')
    if (cached.size !== chunk.compressedSize || hash !== chunk.sha256) {
      await store.clear()
      throw new Error(`Opening book: invalid chunk ${chunk.file}`)
    }
    const blob = await new Response(new Blob([cached.bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'))).blob()
    if (blob.size !== chunk.size) throw new Error(`Opening book: invalid size ${chunk.file}`)
    blobs.push(blob)
    done += chunk.compressedSize
    progress({ done, total: manifest.compressedSize })
  }
  signal.throwIfAborted()
  const file = new File(blobs, 'user_book1.db')
  if (file.size !== manifest.size) throw new Error('Opening book: incomplete download')
  await saveBookFile(file)
  for (const chunk of manifest.chunks) await binaryStore('shogigym:full-book-download', chunk.file).clear()
}
