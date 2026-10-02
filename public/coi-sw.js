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

self.addEventListener('install', (event) => {
  self.skipWaiting()
  if (!local) event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['./', 'manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'icon-512.png'])))
})

self.addEventListener('activate', (event) => event.waitUntil(Promise.all([self.clients.claim(), caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('shogigym-') && k !== CACHE).map((k) => caches.delete(k))))])))

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return
  const sameOrigin = new URL(request.url).origin === self.location.origin
  if (local || request.method !== 'GET' || !sameOrigin) {
    event.respondWith(fetch(request).then(isolate))
    return
  }
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' })
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => cached ?? (request.mode === 'navigate' ? cache.match('./') : undefined))
      const response = request.mode === 'navigate' ? await network : (cached ?? (await network))
      return response ? isolate(response) : Response.error()
    }),
  )
})
