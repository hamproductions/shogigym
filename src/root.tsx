import { useEffect, useState, type ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useLocation, useRouteError } from 'react-router'
import '@/styles/tokens.css'
import '@/styles/base.css'

const base = import.meta.env.BASE_URL

const themeScript = `(() => {
  let theme = 'system'
  try {
    const settings = JSON.parse(localStorage.getItem('joseki-practice:settings:v1') || '{}')
    theme = settings.theme || 'system'
    document.documentElement.lang = settings.lang === 'en' ? 'en' : 'ja'
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
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    void import('@/utils/i18n').then(({ default: i18n }) => {
      if (cancelled) return
      const update = (language: string) => {
        document.documentElement.lang = language
      }
      update(i18n.language)
      i18n.on('languageChanged', update)
      unsubscribe = () => {
        i18n.off('languageChanged', update)
      }
    })
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])
  // the Taikyoku page brings its own engine; skip the shogi engine preload there
  const taikyoku = /\/taikyoku\/?$/.test(useLocation().pathname)
  useEffect(() => {
    if (taikyoku) return
    void import('@/utils/engine').then(({ engineSupported, getEngine }) => {
      if (engineSupported()) getEngine().catch((error) => console.warn('engine preload failed', error))
    })
  }, [taikyoku])
  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : String(error)
  const [en, setEn] = useState(false)
  useEffect(() => setEn(document.documentElement.lang.startsWith('en')), [])
  const reset = () => {
    try {
      localStorage.removeItem('joseki-practice:session:v2')
    } catch (problem) {
      console.warn('session not cleared', problem)
    }
    location.reload()
  }
  return (
    <main className="app-crash-screen">
      <section className="app-crash">
        <img src={`${base}favicon.svg`} width="56" height="56" alt="" />
        <h1>{en ? 'The game was interrupted' : '対局が中断されました'}</h1>
        <p>{en ? 'Reload to return to your saved game.' : '再読み込みして、保存された対局に戻れます。'}</p>
        <button onClick={() => location.reload()}>{en ? 'Reload' : '再読み込み'}</button>
        <details>
          <summary>{en ? 'Recovery options' : '復旧オプション'}</summary>
          <p>
            {en
              ? 'If reloading does not help, reset the open game. Your settings and saved records remain.'
              : '再読み込みで復旧しない場合は、開いている対局をリセットできます。設定と保存済みの棋譜は残ります。'}
          </p>
          <button className="app-crash-reset" onClick={reset}>
            {en ? 'Reset the open game' : '開いている対局をリセット'}
          </button>
        </details>
        <details>
          <summary>{en ? 'Error details' : 'エラーの詳細'}</summary>
          <pre>{message}</pre>
        </details>
      </section>
    </main>
  )
}
