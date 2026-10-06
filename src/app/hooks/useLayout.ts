import { useEffect, useState } from 'react'
import type { StandZones } from '@/rendering/board3d/types'
import type { Mode } from '@/app/types'
import { useLatest } from './useLatest'

type PanelPrefs = { width: number; hidden: boolean; side?: boolean }

const PANEL_KEY = 'joseki-practice:panel:v1'
const SHEET_KEY = 'joseki-practice:sheet:v1'
const PHONE_QUERY = '(max-width: 820px), (max-width: 1024px) and (orientation: portrait)'

function loadPanelPrefs(): PanelPrefs {
  try {
    return { width: 380, hidden: false, ...JSON.parse(localStorage.getItem(PANEL_KEY) ?? '{}') }
  } catch {
    return { width: 380, hidden: false }
  }
}

function loadSheetHeight() {
  try {
    return Number(localStorage.getItem(SHEET_KEY)) || null
  } catch {
    return null
  }
}

export function scrollPanelTop(smooth = false) {
  const body = document.querySelector('.app-panel:not(.app-panel-left) .app-panel-body')
  if (smooth) body?.scrollTo({ top: 0, behavior: 'smooth' })
  else body?.scrollTo(0, 0)
}

export function useLayout({ mode, needsPicking, welcome }: { mode: Mode; needsPicking: boolean; welcome: boolean }) {
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const [compact, setCompact] = useState(() => window.matchMedia(PHONE_QUERY).matches)
  const [panelPrefs, setPanelPrefs] = useState(loadPanelPrefs)
  const [drawer, setDrawer] = useState(false)
  const [sheetH, setSheetH] = useState(loadSheetHeight)
  const [sheetOpen, setSheetOpen] = useState<boolean | null>(null)
  const [zones, setZones] = useState<StandZones | null>(null)

  useEffect(() => {
    const on = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY)
    const on = () => setCompact(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const pickKey = `${compact}|${needsPicking}|${mode}|${welcome}`
  const [openedFor, setOpenedFor] = useState('')
  if (openedFor !== pickKey) {
    setOpenedFor(pickKey)
    if (compact && needsPicking && !welcome) setDrawer(true)
  }
  useEffect(() => {
    if (drawer) scrollPanelTop()
  }, [drawer])

  const panelHidden = compact ? !drawer : panelPrefs.hidden
  const floatingAvailable =
    !compact &&
    !!zones &&
    (zones.floatingAvailable ?? (zones.over.width >= 280 && zones.over.height >= 240 && zones.under.width >= 280 && zones.under.height >= 240))
  const panelSide = !compact && (!!panelPrefs.side || !floatingAvailable)
  const zoned = !compact && !panelSide
  const twoPanels = zoned && !panelPrefs.hidden && !!zones

  const compactRef = useLatest(compact)
  const panelHiddenRef = useLatest(panelHidden)

  const setPanel = (patch: Partial<PanelPrefs>) => {
    if (compactRef.current && patch.hidden !== undefined) return setDrawer(!patch.hidden)
    setPanelPrefs((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(PANEL_KEY, JSON.stringify(next))
      } catch (error) {
        console.warn('panel prefs not persisted', error)
      }
      return next
    })
  }
  const togglePanel = () => setPanel({ hidden: !panelHiddenRef.current })

  const resizeSheet = (clientY: number) => {
    const bounds = document.querySelector('.app-shell')?.getBoundingClientRect()
    const height = bounds?.height ?? window.innerHeight
    const top = bounds?.top ?? 0
    setSheetH(Math.round(Math.min(78, Math.max(22, 100 - ((clientY - top) / height) * 100))))
  }
  const persistSheet = () =>
    setSheetH((h) => {
      try {
        if (h) localStorage.setItem(SHEET_KEY, String(h))
      } catch (error) {
        console.warn('sheet size not persisted', error)
      }
      return h
    })

  return {
    compact,
    drawer,
    setDrawer,
    panelWidth: panelPrefs.width,
    panelSide,
    floatingAvailable,
    floatingZones: floatingAvailable ? zones : null,
    viewport,
    togglePanelSide: () => setPanel({ side: !panelSide }),
    panelPrefsHidden: panelPrefs.hidden,
    panelHidden,
    setPanel,
    togglePanel,
    zoned,
    twoPanels,
    zones,
    setZones,
    sheetH,
    resizeSheet,
    persistSheet,
    sheetOpen,
    setSheetOpen,
  }
}

export type Layout = ReturnType<typeof useLayout>
