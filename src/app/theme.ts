export type Theme = 'system' | 'light' | 'dark'

export const THEME_COLORS = { light: '#f4eee3', dark: '#1c1814' } as const

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
let chosen: Theme = 'system'

function syncThemeColor() {
  const resolved = chosen === 'system' ? (darkQuery.matches ? 'dark' : 'light') : chosen
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved])
}

darkQuery.addEventListener('change', syncThemeColor)

export function applyTheme(theme: Theme) {
  chosen = theme === 'light' || theme === 'dark' ? theme : 'system'
  document.documentElement.dataset.theme = chosen
  syncThemeColor()
}
