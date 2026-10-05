import { useEffect, type ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from 'react-router'
import '@/styles/tokens.css'
import '@/styles/base.css'

const base = import.meta.env.BASE_URL

const themeScript = `(() => {
  let theme = 'system'
  try {
    theme = JSON.parse(localStorage.getItem('joseki-practice:settings:v1') || '{}').theme || 'system'
  } catch {}
  if (theme !== 'light' && theme !== 'dark') theme = 'system'
  document.documentElement.dataset.theme = theme
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#1c1814' : '#f4eee3')
})()`

const isolationScript = `if (window.isSecureContext && 'serviceWorker' in navigator) {
  const reloadWhenControlled = () => {
    if (!window.crossOriginIsolated && navigator.serviceWorker.controller && !sessionStorage.getItem('coi-controlled-reload')) {
      sessionStorage.setItem('coi-controlled-reload', '1')
      location.reload()
    }
  }
  navigator.serviceWorker.addEventListener('controllerchange', reloadWhenControlled)
  navigator.serviceWorker.register('${base}coi-sw.js?mode=${import.meta.env.MODE}', { scope: '${base}' }).then(reloadWhenControlled)
}`

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#1c1814" suppressHydrationWarning />
        <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
        <link rel="manifest" href={`${base}manifest.webmanifest`} />
        <link rel="apple-touch-icon" href={`${base}icon-192.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: isolationScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  useEffect(() => {
    void import('@/utils/engine').then(({ engineSupported, getEngine }) => {
      if (engineSupported()) getEngine().catch((error) => console.warn('engine preload failed', error))
    })
  }, [])
  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : String(error)
  const reset = () => {
    try {
      localStorage.removeItem('joseki-practice:session:v2')
    } catch (problem) {
      console.warn('session not cleared', problem)
    }
    location.reload()
  }
  return (
    <div className="app-crash">
      <h1>Something went wrong / エラーが発生しました</h1>
      <p>{message}</p>
      <button onClick={reset}>Reset the open game and reload / 開いている対局をリセットして再読み込み</button>
    </div>
  )
}
