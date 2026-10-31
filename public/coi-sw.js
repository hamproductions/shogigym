const CACHE = 'shogigym-v1'
const local = new URL(self.location.href).searchParams.get('mode') === 'development'

const isolate = (response) => {
  if (response.status === 0) return response
  const headers = new Headers(response.headers)
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

// precache.json is written by scripts/flatten-build.mjs: `shell` is what a page needs to start, `rest` is everything else the app can ask for.
const manifest = () => fetch('precache.json', { cache: 'no-cache' }).then((response) => (response.ok ? response.json() : null)).catch(() => null)

self.addEventListener('install', (event) => {
  self.skipWaiting()
  if (local) return
  event.waitUntil(
    Promise.all([caches.open(CACHE), manifest()]).then(([cache, list]) =>
      cache.addAll(list?.shell ?? ['./', 'manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'icon-512.png']),
    ),
  )
})

// The page asks for the remaining files once it is idle, so the first visit is never slowed down; each file is skipped if already cached.
let precaching
const precacheRest = async () => {
  const [cache, list] = await Promise.all([caches.open(CACHE), manifest()])
  const queue = (list?.rest ?? []).slice()
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        if (await cache.match(url, { ignoreVary: true })) continue
        const response = await fetch(url)
        if (response.ok) await cache.put(url, response)
      } catch {}
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
}
self.addEventListener('message', (event) => {
  if (local || event.data !== 'precache') return
  precaching ??= precacheRest().finally(() => (precaching = undefined))
  event.waitUntil(precaching)
})

self.addEventListener('activate', (event) => event.waitUntil(Promise.all([self.clients.claim(), caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('shogigym-') && k !== CACHE).map((k) => caches.delete(k))))])))

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return
  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin
  const fullBook = url.pathname.includes('/books/peta233-full-v1/')
  const evalFile = url.pathname.includes('/eval/')
  if (fullBook || evalFile || local || request.method !== 'GET' || !sameOrigin) {
    event.respondWith(fetch(request).then(isolate))
    return
  }
  const navigate = request.mode === 'navigate'
  // A cached page opens at once and refreshes behind it, so launching offline (or on a slow link) never waits on the network.
  let refreshed
  if (navigate) event.waitUntil(new Promise((resolve) => (refreshed = resolve)))
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: navigate, ignoreVary: true })
      const network = () =>
        fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => cached ?? (navigate ? cache.match('./') : undefined))
      let response = cached
      if (cached && navigate) network().then(refreshed, refreshed)
      else {
        refreshed?.()
        response ??= await network()
      }
      return response ? isolate(response) : Response.error()
    }),
  )
})
