import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { getSettings, setSettings } from '@/appearance/settings'
import type { Mode } from '@/app/types'

export const MODE_SLUG: Record<Mode, string> = {
  spar: 'play',
  view: 'view',
  analyze: 'analyze',
  lesson: 'openings',
  drill: 'review',
  tsume: 'tsume',
  tesuji: 'tesuji',
}

const SLUG_MODE = Object.fromEntries(Object.entries(MODE_SLUG).map(([m, s]) => [s, m as Mode])) as Record<string, Mode>

function targetModeOf(routeMain: string | undefined, routeMode: string | undefined): Mode | null {
  if (routeMain) return 'lesson'
  return routeMode ? (SLUG_MODE[routeMode] ?? null) : null
}

export function useRouteMode(mode: Mode, enterMode: (m: Mode) => void, routeMode: string | undefined, routeMain: string | undefined, ready: boolean) {
  const navigate = useNavigate()
  const target = useRef<Mode | null>(null)
  const pending = useRef<string | null>(null)

  useEffect(() => {
    if (routeMain && getSettings().mainStrategy !== routeMain) setSettings({ mainStrategy: routeMain })
    target.current = targetModeOf(routeMain, routeMode)
  }, [routeMain, routeMode])

  useEffect(() => {
    if (!ready) return
    const want = target.current
    if (want && want !== mode) return enterMode(want)
    target.current = null
    if (routeMain && mode === 'lesson') return
    const slug = MODE_SLUG[mode]
    if (routeMode === slug) pending.current = null
    else if (pending.current !== slug) {
      pending.current = slug
      navigate(`/${slug}`, { replace: !routeMode && !routeMain })
    }
  })
}
