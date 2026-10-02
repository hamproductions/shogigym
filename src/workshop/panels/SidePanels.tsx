import type { PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Layout } from '../hooks/useLayout'
import { useSettings } from '../settings'
import { TABS, type Tab } from '../types'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { NavFooter } from './NavFooter'
import { PanelBody, type PanelModel } from './PanelBody'

type SidePanelsProps = { layout: Layout; tab: Tab; setTab: (tab: Tab) => void; sheetOpen: boolean; model: PanelModel; canAutoplay: boolean; onStartOver: () => void; picking: boolean }

function trackPointer(move: (ev: PointerEvent) => void, done?: (ev: PointerEvent) => void) {
  const up = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    done?.(ev)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

export function SidePanels({ layout, tab, setTab, sheetOpen, model, canAutoplay, onStartOver, picking }: SidePanelsProps) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  const { compact, zoned, zones, twoPanels, panelPrefsHidden, panelWidth, setPanel } = layout
  const labelClass = ja ? 'ws-ja' : 'ws-en'
  const startSheetDrag = (e: ReactPointerEvent) => {
    e.preventDefault()
    trackPointer((ev) => layout.resizeSheet(ev.clientY), layout.persistSheet)
  }
  const startResize = (e: ReactPointerEvent) => {
    e.preventDefault()
    const startX = e.clientX
    trackPointer((ev) => setPanel({ width: Math.min(560, Math.max(320, panelWidth + startX - ev.clientX)) }))
  }
  const startHandleSwipe = (e: ReactPointerEvent) => {
    const startY = e.clientY
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointerup', up)
      const dy = ev.clientY - startY
      if (dy < -30) layout.setSheetOpen(true)
      else if (dy > 30) layout.setSheetOpen(false)
    }
    window.addEventListener('pointerup', up)
  }
  return (
    <>
      {twoPanels && zones && !picking && (
        <aside className="ws-panel ws-panel-left" style={{ ...zones.under }}>
          <Tabs items={[{ id: 'moves', label: <span className={labelClass}>{t('tabs.moves')}</span> }]} value="moves" onChange={() => undefined} />
          <PanelBody tab="moves" model={model} overlays={false} />
        </aside>
      )}
      <aside className={`ws-panel${sheetOpen ? ' open' : ''}`} style={zoned ? (zones && !panelPrefsHidden ? (picking ? { ...zones.over, height: Math.max(zones.over.height, zones.under.top + zones.under.height - zones.over.top) } : { ...zones.over }) : { display: 'none' }) : undefined}>
        {compact && <div className="ws-sheet-grip" role="separator" aria-orientation="horizontal" onPointerDown={startSheetDrag} />}
        <div className="ws-panel-resize" title={t('workshop.dragToResizeThePanel')} onPointerDown={startResize} />
        <button className="ws-sheet-handle" onClick={() => layout.setSheetOpen(!sheetOpen)} onPointerDown={startHandleSwipe} aria-label={sheetOpen ? t('workshop.collapsePanel') : t('workshop.expandPanel')} />
        <Tabs items={TABS.filter((id) => !(twoPanels && id === 'moves')).map((id) => ({ id, label: <span className={labelClass}>{t(`tabs.${id}`)}</span> }))} value={tab} onChange={setTab}>
          <Button variant="icon" size="lg" className="ws-panel-close" onClick={() => setPanel({ hidden: true })} title={t('workshop.closeThePanelP')} aria-label={t('workshop.closeThePanel')}>
            ×
          </Button>
        </Tabs>
        <PanelBody tab={tab} model={model} />
        {!picking && <NavFooter canAutoplay={canAutoplay} onStartOver={onStartOver} />}
      </aside>
    </>
  )
}
