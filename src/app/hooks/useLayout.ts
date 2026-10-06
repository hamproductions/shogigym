import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { StandZones } from '@/rendering/board3d/types'
import type { Mode } from '@/app/types'
import { useLatest } from './useLatest'

interface PanelPrefs {
  width: number
  hidden: boolean
  side?: boolean
}

const PANEL_KEY = 'joseki-practice:panel:v1'
const SHEET_KEY = 'joseki-practice:sheet:v1'
const PHONE_QUERY = '(max-width: 820px)'

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

const subscribeCompact = (onChange: () => void) => {
  const mq = globalThis.matchMedia(PHONE_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
const isCompact = () => globalThis.matchMedia(PHONE_QUERY).matches
const serverCompact = () => false

function usePanelPrefs() {
  const [panelPrefs, setPanelPrefs] = useState(loadPanelPrefs)
  const latest = useRef(panelPrefs)
  const updatePrefs = (patch: Partial<PanelPrefs>) => {
    const next = { ...latest.current, ...patch }
    latest.current = next
    setPanelPrefs(next)
    try {
      localStorage.setItem(PANEL_KEY, JSON.stringify(next))
    } catch (error) {
      console.warn('panel prefs not persisted', error)
    }
  }
  return [panelPrefs, updatePrefs] as const
}

function useSheetHeight() {
  const [sheetH, setSheetH] = useState(loadSheetHeight)
  const latest = useRef(sheetH)
  const resizeSheet = (clientY: number) => {
    const bounds = document.querySelector('.app-shell')?.getBoundingClientRect()
    const height = bounds?.height ?? globalThis.innerHeight
    const top = bounds?.top ?? 0
    const next = Math.round(Math.min(78, Math.max(22, 100 - ((clientY - top) / height) * 100)))
    latest.current = next
    setSheetH(next)
  }
  const persistSheet = () => {
    try {
      if (latest.current) localStorage.setItem(SHEET_KEY, String(latest.current))
    } catch (error) {
      console.warn('sheet size not persisted', error)
    }
  }
  return { sheetH, resizeSheet, persistSheet }
}

function useDrawer(compact: boolean, needsPicking: boolean, mode: Mode, welcome: boolean) {
  const [drawer, setDrawer] = useState(false)
  const pickKey = `${compact}|${needsPicking}|${mode}|${welcome}`
  const [openedFor, setOpenedFor] = useState('')
  if (openedFor !== pickKey) {
    setOpenedFor(pickKey)
    if (compact && needsPicking && !welcome) setDrawer(true)
  }
  useEffect(() => {
    if (drawer) scrollPanelTop()
  }, [drawer])
  return [drawer, setDrawer] as const
}

function panelGeometry(compact: boolean, orbit: boolean, zones: StandZones | null, panelPrefs: PanelPrefs) {
  const floatingAvailable = compact || (!orbit && !!zones && zones.over.width >= 280 && zones.over.height >= 240)
  const panelSide = !compact && (!!panelPrefs.side || !floatingAvailable)
  const zoned = !compact && !panelSide
  const twoPanels = zoned && floatingAvailable && !panelPrefs.hidden && !!zones && zones.under.width >= 240 && zones.under.height >= 200
  return { floatingAvailable, panelSide, zoned, twoPanels }
}

export function useLayout({ mode, needsPicking, welcome, orbit = false }: { mode: Mode; needsPicking: boolean; welcome: boolean; orbit?: boolean }) {
  const [viewport, setViewport] = useState(() => ({ w: globalThis.innerWidth, h: globalThis.innerHeight }))
  const compact = useSyncExternalStore(subscribeCompact, isCompact, serverCompact)
  const [panelPrefs, updatePrefs] = usePanelPrefs()
  const [drawer, setDrawer] = useDrawer(compact, needsPicking, mode, welcome)
  const { sheetH, resizeSheet, persistSheet } = useSheetHeight()
  const [sheetOpen, setSheetOpen] = useState<boolean | null>(null)
  const [zones, setZones] = useState<StandZones | null>(null)

  useEffect(() => {
    const on = () => setViewport({ w: globalThis.innerWidth, h: globalThis.innerHeight })
    globalThis.addEventListener('resize', on)
    return () => globalThis.removeEventListener('resize', on)
  }, [])
  const panelHidden = compact ? !drawer : panelPrefs.hidden
  const { floatingAvailable, panelSide, zoned, twoPanels } = panelGeometry(compact, orbit, zones, panelPrefs)

  const compactRef = useLatest(compact)
  const panelHiddenRef = useLatest(panelHidden)

  const setPanel = (patch: Partial<PanelPrefs>) => {
    if (compactRef.current && patch.hidden !== undefined) return setDrawer(!patch.hidden)
    updatePrefs(patch)
  }
  const togglePanel = () => setPanel({ hidden: !panelHiddenRef.current })

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
