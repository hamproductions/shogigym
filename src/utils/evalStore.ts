import { useSyncExternalStore } from 'react'

export type EvalFile = { name: string; size: number; bytes: Uint8Array }

const DB = 'joseki-practice:eval'
const STORE = 'files'
const KEY = 'nnue'

let info: { name: string; size: number } | null = null
let loaded = false
const listeners = new Set<() => void>()

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

function publish(next: { name: string; size: number } | null) {
  info = next
  loaded = true
  listeners.forEach((l) => l())
}

export async function readEvalFile(): Promise<EvalFile | null> {
  return (await run<EvalFile | undefined>('readonly', (store) => store.get(KEY))) ?? null
}

async function readInfo() {
  publish((await run<{ name: string; size: number } | undefined>('readonly', (store) => store.get(`${KEY}:info`))) ?? null)
}

export async function saveEvalFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  await run('readwrite', (store) => store.put({ name: file.name, size: bytes.length, bytes }, KEY))
  await run('readwrite', (store) => store.put({ name: file.name, size: bytes.length }, `${KEY}:info`))
  publish({ name: file.name, size: bytes.length })
}

export async function clearEvalFile() {
  await run('readwrite', (store) => store.delete(KEY))
  await run('readwrite', (store) => store.delete(`${KEY}:info`))
  publish(null)
}

export function useEvalFile() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      if (!loaded) readInfo().catch(() => publish(null))
      return () => {
        listeners.delete(l)
      }
    },
    () => info,
  )
}
