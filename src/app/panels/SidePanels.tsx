import './panel-layout.css'
import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Layout } from '@/app/hooks/useLayout'
import { useSettings } from '@/appearance/settings'
import { TABS, type Tab } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Tabs } from '@/app/ui/Tabs'
import { Icon } from '@/app/icons'
import { NavFooter } from './NavFooter'
import { PanelBody, type PanelModel } from './PanelBody'

interface SidePanelsProps {
  layout: Layout
  tab: Tab
  setTab: (tab: Tab) => void
  sheetOpen: boolean
  model: PanelModel
  canAutoplay: boolean
  picking: boolean
}

const startHandleSwipe = (e: ReactPointerEvent) => {
  e.preventDefault()
  e.currentTarget.setPointerCapture(e.pointerId)
}

function floatingRect(layout: Layout) {
  const { panelWidth } = layout
  const floatingZone = layout.floatingZones?.over
  const width = floatingZone?.width ?? Math.min(panelWidth, layout.viewport.w - 120)
  const top = floatingZone?.top ?? 110
  return {
    left: floatingZone ? floatingZone.left + floatingZone.width - width : layout.viewport.w - width - 12,
    top,
    width,
    height: Math.min(floatingZone?.height ?? layout.viewport.h - top - 12, layout.viewport.h - top - 12),
  }
}

function panelStyle(layout: Layout, picking: boolean): CSSProperties | undefined {
  if (!layout.zoned) return undefined
  if (layout.panelPrefsHidden) return { display: 'none' }
  const rect = floatingRect(layout)
  return picking ? { ...rect, height: layout.viewport.h - rect.top - 12 } : rect
}

function ResizeHandle({ layout }: { layout: Layout }) {
  const { t } = useTranslation()
  const { compact, panelWidth, setPanel } = layout
  const resizeStart = useRef({ x: 0, width: panelWidth })
  const startResize = (e: ReactPointerEvent) => {
    e.preventDefault()
    resizeStart.current = { x: e.clientX, width: e.currentTarget.closest('aside')?.getBoundingClientRect().width ?? panelWidth }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const resize = (e: ReactPointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    const max = compact ? globalThis.innerWidth * 0.7 : 560
    const min = compact ? Math.min(180, max) : 320
    setPanel({ width: Math.min(max, Math.max(min, resizeStart.current.width + resizeStart.current.x - e.clientX)) })
  }
  return (
    <hr
      className="app-panel-resize"
      aria-label={t('app.dragToResizeThePanel')}
      aria-orientation="vertical"
      title={t('app.dragToResizeThePanel')}
      onPointerDown={startResize}
      onPointerMove={resize}
    />
  )
}

function SheetHandle({ layout, sheetOpen }: { layout: Layout; sheetOpen: boolean }) {
  const { t } = useTranslation()
  return (
    <button
      className="app-sheet-handle"
      onClick={() => layout.setSheetOpen(!sheetOpen)}
      onPointerDown={startHandleSwipe}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) layout.resizeSheet(e.clientY)
      }}
      onPointerUp={() => layout.persistSheet()}
      onPointerCancel={() => layout.persistSheet()}
      aria-label={sheetOpen ? t('app.collapsePanel') : t('app.expandPanel')}
    />
  )
}

function PanelHeader({ layout, tab, setTab }: { layout: Layout; tab: Tab; setTab: (tab: Tab) => void }) {
  const { t } = useTranslation()
  const labelClass = useSettings().lang === 'ja' ? 'app-ja' : 'app-en'
  const { compact, twoPanels, setPanel } = layout
  return (
    <div className="app-panel-header">
      <Tabs
        items={TABS.filter((id) => !(twoPanels && id === 'moves')).map((id) => ({ id, label: <span className={labelClass}>{t(`tabs.${id}`)}</span> }))}
        value={tab}
        onChange={setTab}
      />
      {!compact && (!layout.panelSide || layout.floatingAvailable) && (
        <Button
          variant="icon"
          className="app-panel-dock"
          onClick={layout.togglePanelSide}
          title={t(layout.panelSide ? 'app.floatPanel' : 'app.dockPanelSide')}
          aria-label={t(layout.panelSide ? 'app.floatPanel' : 'app.dockPanelSide')}
        >
          <Icon name={layout.panelSide ? 'floating' : 'panel'} />
        </Button>
      )}
      {!compact && (
        <Button
          variant="icon"
          className="app-panel-close"
          onClick={() => setPanel({ hidden: true })}
          title={t('app.closeThePanelP')}
          aria-label={t('app.closeThePanel')}
        >
          <Icon name="close" />
        </Button>
      )}
    </div>
  )
}

export function SidePanels({ layout, tab, setTab, sheetOpen, model, canAutoplay, picking }: SidePanelsProps) {
  const { t } = useTranslation()
  const labelClass = useSettings().lang === 'ja' ? 'app-ja' : 'app-en'
  const { zones, twoPanels } = layout
  return (
    <>
      {twoPanels && zones && !picking && (
        <aside className="app-panel app-panel-left" style={{ ...zones.under }}>
          <Tabs items={[{ id: 'moves', label: <span className={labelClass}>{t('tabs.moves')}</span> }]} value="moves" onChange={() => undefined} />
          <PanelBody tab="moves" model={model} overlays={false} />
        </aside>
      )}
      <aside className={`app-panel${sheetOpen ? ' open' : ''}`} style={panelStyle(layout, picking)}>
        {layout.panelSide && <ResizeHandle layout={layout} />}
        <SheetHandle layout={layout} sheetOpen={sheetOpen} />
        <PanelHeader layout={layout} tab={tab} setTab={setTab} />
        <PanelBody tab={tab} model={model} />
        {!picking && <NavFooter canAutoplay={canAutoplay} watch={model.watch} />}
      </aside>
    </>
  )
}
