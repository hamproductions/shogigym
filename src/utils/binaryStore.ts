import { useSyncExternalStore } from 'react'

type Info = { name: string; size: number }
export type BinaryFile = Info & { bytes: Uint8Array }

export function binaryStore(namespace: string, key: string) {
  let info: Info | null = null
  let loaded = false
  let reading: Promise<void> | null = null
  const listeners = new Set<() => void>()
  const publish = (next: Info | null) => {
    info = next
    loaded = true
    listeners.forEach((listener) => listener())
  }
  const run = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(namespace, 1)
      request.onupgradeneeded = () => request.result.createObjectStore('files')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      return await new Promise<T>((resolve, reject) => {
        const transaction = db.transaction('files', mode)
        const request = action(transaction.objectStore('files'))
        transaction.oncomplete = () => resolve(request.result)
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error ?? new Error('File storage aborted'))
      })
    } finally {
      db.close()
    }
  }
  return {
    read: async (): Promise<BinaryFile | null> => {
      const file = await run<BinaryFile | (Info & { blob: Blob }) | undefined>('readonly', (store) => store.get(key))
      return file ? ('bytes' in file ? file : { name: file.name, size: file.size, bytes: new Uint8Array(await file.blob.arrayBuffer()) }) : null
    },
    save: async (file: File) => {
      await run('readwrite', (store) => {
        store.put({ name: file.name, size: file.size, blob: file }, key)
        return store.put({ name: file.name, size: file.size }, `${key}:info`)
      })
      publish({ name: file.name, size: file.size })
    },
    clear: async () => {
      await run('readwrite', (store) => {
        store.delete(key)
        return store.delete(`${key}:info`)
      })
      publish(null)
    },
    useInfo: () =>
      useSyncExternalStore(
        (listener) => {
          listeners.add(listener)
          if (!loaded && !reading)
            reading = run<Info | undefined>('readonly', (store) => store.get(`${key}:info`))
              .then((next) => publish(next ?? null))
              .catch((error) => console.warn('file storage unavailable', error))
              .finally(() => {
                reading = null
              })
          return () => {
            listeners.delete(listener)
          }
        },
        () => info,
      ),
  }
}
