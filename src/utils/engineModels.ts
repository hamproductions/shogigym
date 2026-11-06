import manifest from './engineModels.json'
import i18n from './i18n'
import type { EngineKind } from '@/appearance/settings'

export type DownloadableEngine = 'suisho5' | 'tanuki-hao' | 'tanuki-li' | 'aobannue'
export type EngineModel = Omit<(typeof manifest)[number], 'id'> & { id: DownloadableEngine }
export const ENGINE_MODELS = manifest as EngineModel[]
const CACHE = 'joseki-practice:engine-models:v1'
const names: Record<EngineKind, string> = {
  'tsuyoura-mini': 'settings.tsuyouraMini',
  'tsuyoura-micro': 'settings.tsuyouraMicro',
  suisho5: 'settings.suisho5',
  'tanuki-hao': 'settings.tanukiHao',
  'tanuki-li': 'settings.tanukiLi',
  aobannue: 'settings.aobaNnue',
  yaneuraou: 'settings.yaneuraou',
  nnue: 'settings.yaneuraouNnue',
  fairy: 'settings.fairyStockfish',
}

export const engineLabel = (kind: EngineKind) => i18n.t(names[kind])
export const modelFor = (kind: EngineKind) => ENGINE_MODELS.find((model) => model.id === kind)
const partUrl = (model: EngineModel, part: EngineModel['parts'][number]) =>
  `${import.meta.env.BASE_URL}engines/models/${model.id}/${part.name}?sha256=${part.sha256}`

export async function cachedEngineModels(): Promise<Set<EngineKind>> {
  if (typeof caches === 'undefined') return new Set()
  const cache = await caches.open(CACHE)
  const ready = await Promise.all(
    ENGINE_MODELS.map(async (model) => {
      for (const part of model.parts) if (!(await cache.match(partUrl(model, part)))) return null
      return model.id
    }),
  )
  return new Set(ready.filter((id): id is DownloadableEngine => id !== null))
}

export async function downloadEngineModel(model: EngineModel, signal: AbortSignal, progress?: (done: number, total: number) => void) {
  if (typeof caches === 'undefined') throw new Error(i18n.t('engine.modelStorageUnavailable'))
  const cache = await caches.open(CACHE)
  let done = 0
  for (const part of model.parts) {
    signal.throwIfAborted()
    const url = partUrl(model, part)
    if (!(await cache.match(url))) {
      const response = await fetch(url, { signal }).catch((failure) => {
        if (signal.aborted) throw failure
        throw new Error(i18n.t('engine.modelDownloadFailed'))
      })
      if (!response.ok || !response.body) throw new Error(i18n.t('engine.modelDownloadFailed'))
      const reader = response.body.getReader()
      const bytes = new Uint8Array(part.size)
      let offset = 0
      try {
        for (;;) {
          const chunk = await reader.read()
          if (chunk.done) break
          if (offset + chunk.value.length > part.size) throw new Error(i18n.t('engine.modelChecksumFailed'))
          bytes.set(chunk.value, offset)
          offset += chunk.value.length
          progress?.(done + offset, model.size)
        }
      } finally {
        await reader.cancel().catch(() => undefined)
      }
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      const hash = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('')
      if (offset !== part.size || hash !== part.sha256) throw new Error(i18n.t('engine.modelChecksumFailed'))
      signal.throwIfAborted()
      await cache.put(url, new Response(bytes)).catch(() => {
        throw new Error(i18n.t('engine.modelStorageFull'))
      })
    }
    done += part.size
    progress?.(done, model.size)
  }
}

export async function readEngineModel(model: EngineModel): Promise<Uint8Array> {
  await downloadEngineModel(model, new AbortController().signal)
  const cache = await caches.open(CACHE)
  const bytes = new Uint8Array(model.size)
  let offset = 0
  for (const part of model.parts) {
    const response = await cache.match(partUrl(model, part))
    if (!response) throw new Error(i18n.t('engine.modelDownloadFailed'))
    bytes.set(new Uint8Array(await response.arrayBuffer()), offset)
    offset += part.size
  }
  return bytes
}
