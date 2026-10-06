import './panel-layout.css'
import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
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

export function SidePanels({ layout, tab, setTab, sheetOpen, model, canAutoplay, picking }: SidePanelsProps) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  const { compact, zoned, zones, twoPanels, panelPrefsHidden, panelWidth, setPanel } = layout
  const labelClass = ja ? 'app-ja' : 'app-en'
  const resizeStart = useRef({ x: 0, width: panelWidth })
  const floatingZone = layout.floatingZones?.over
  const floatingWidth = floatingZone?.width ?? Math.min(panelWidth, layout.viewport.w - 120)
  const floatingTop = floatingZone?.top ?? 110
  const floatingRect = {
    left: floatingZone ? floatingZone.left + floatingZone.width - floatingWidth : layout.viewport.w - floatingWidth - 12,
    top: floatingTop,
    width: floatingWidth,
    height: Math.min(floatingZone?.height ?? layout.viewport.h - floatingTop - 12, layout.viewport.h - floatingTop - 12),
  }
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
  const startHandleSwipe = (e: ReactPointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  return (
    <>
      {twoPanels && zones && !picking && (
        <aside className="app-panel app-panel-left" style={{ ...zones.under }}>
          <Tabs items={[{ id: 'moves', label: <span className={labelClass}>{t('tabs.moves')}</span> }]} value="moves" onChange={() => undefined} />
          <PanelBody tab="moves" model={model} overlays={false} />
        </aside>
      )}
      <aside
        className={`app-panel${sheetOpen ? ' open' : ''}`}
        style={
          zoned
            ? panelPrefsHidden
              ? { display: 'none' }
              : picking
                ? { ...floatingRect, height: layout.viewport.h - floatingTop - 12 }
                : floatingRect
            : undefined
        }
      >
        {layout.panelSide && (
          <div
            className="app-panel-resize"
            role="separator"
            aria-label={t('app.dragToResizeThePanel')}
            aria-orientation="vertical"
            title={t('app.dragToResizeThePanel')}
            onPointerDown={startResize}
            onPointerMove={resize}
          />
        )}
        <button
          className="app-sheet-handle"
          onClick={() => layout.setSheetOpen(!sheetOpen)}
          onPointerDown={startHandleSwipe}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) layout.resizeSheet(e.clientY)
          }}
          onPointerUp={() => layout.persistSheet()}
          aria-label={sheetOpen ? t('app.collapsePanel') : t('app.expandPanel')}
        />
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
        <PanelBody tab={tab} model={model} />
        {!picking && <NavFooter canAutoplay={canAutoplay} watch={model.watch} />}
      </aside>
    </>
  )
}
