export type Theme = 'system' | 'light' | 'dark'

export const THEME_COLORS = { light: '#f4eee3', dark: '#1c1814' } as const

let darkQuery: MediaQueryList | null = null
let chosen: Theme = 'system'

function resolveTheme(): 'light' | 'dark' {
  if (chosen !== 'system') return chosen
  return darkQuery?.matches ? 'dark' : 'light'
}

function syncThemeColor() {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolveTheme()])
}

export function applyTheme(theme: Theme) {
  if (!darkQuery) {
    darkQuery = globalThis.matchMedia('(prefers-color-scheme: dark)')
    darkQuery.addEventListener('change', syncThemeColor)
  }
  chosen = theme === 'light' || theme === 'dark' ? theme : 'system'
  document.documentElement.dataset.theme = chosen
  syncThemeColor()
}
