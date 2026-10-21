import { useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import type { Layout } from '@/app/hooks/useLayout'
import { useSettings } from '@/appearance/settings'
import { TABS, isGameMode, type Tab } from '@/app/types'
import { useSession } from '@/app/hooks/session'
import { Tabs } from '@/app/ui/Tabs'
import { Icon } from '@/app/icons'
import { NavFooter } from './NavFooter'
import { PanelBody, type PanelModel } from './PanelBody'
import { HeaderButton, PanelHeader, TabLabel, floatingTabs, panelTabs } from './panels.styles'

type SidePanelsProps = { layout: Layout; tab: Tab; setTab: (tab: Tab) => void; sheetOpen: boolean; model: PanelModel; canAutoplay: boolean; picking: boolean }

const PanelAside = styled('aside', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0',
    containerType: 'inline-size',
    background:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.42 0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\"), {colors.panel}",
    color: 'fg.default',
    borderLeft: '1px solid {colors.border}',
    '.app-shell[data-panel-hidden] > &': { display: 'none' },
    '.app-shell[data-zoned] > &': {
      position: 'fixed',
      zIndex: 'floatingPanel',
      border: '0',
      borderRadius: 'lg',
      overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.md}',
    },
    '.app-shell[data-fs] > &': { display: 'none' },
    _compact: {
      borderLeft: '0',
      borderTop: '1px solid {colors.border}',
      '.app-shell[data-drawer-open][data-panel-side]:not([data-fs]) > &': {
        gridColumn: '2',
        gridRow: '2',
        minWidth: '0',
        borderRadius: '{radii.lg} 0 0 {radii.lg}',
        borderLeft: '1px solid {colors.border}',
      },
      '.app-shell[data-drawer-open]:not([data-fs]) > &': {
        display: 'flex',
        minH: '0',
        borderRadius: '{radii.xl} {radii.xl} 0 0',
        overflow: 'hidden',
        boxShadow: 'sheet',
      },
    },
  },
})

export function FloatingPanel({ zone, header, children }: { zone: NonNullable<Layout['zones']>['under']; header: ReactNode; children: ReactNode }) {
  return (
    <PanelAside className="app-panel app-panel-left" style={{ ...zone }}>
      {header}
      {children}
    </PanelAside>
  )
}

function LeftPanel({
  zone,
  tab,
  setTab,
  model,
  labelClass,
}: {
  zone: NonNullable<Layout['zones']>['under']
  tab: Tab
  setTab: (tab: Tab) => void
  model: PanelModel
  labelClass: string
}) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Tab>('moves')
  const active = tab === 'moves' ? tab : selected
  return (
    <FloatingPanel
      zone={zone}
      header={
        <Tabs
          className={floatingTabs}
          items={(['moves'] as Tab[]).map((id) => ({ id, label: <TabLabel className={labelClass}>{t(`tabs.${id}`)}</TabLabel> }))}
          value={active}
          onChange={(id) => {
            setSelected(id)
            if (tab === 'moves') setTab('coach')
          }}
        />
      }
    >
      <PanelBody tab={active} model={model} overlays={false} />
    </FloatingPanel>
  )
}

export function SidePanels({ layout, tab, setTab, sheetOpen, model, canAutoplay, picking }: SidePanelsProps) {
  const { t } = useTranslation()
  const { mode, game } = useSession()
  const reportable = isGameMode(mode) && game.moves.length > 0
  const ja = useSettings().lang === 'ja'
  const { compact, zones, twoPanels, setPanel } = layout
  const rightTab = (twoPanels && tab === 'moves') || (tab === 'report' && !reportable) ? 'coach' : tab
  const labelClass = ja ? 'app-ja' : 'app-en'
  return (
    <>
      {twoPanels && zones && !picking && <LeftPanel zone={zones.under} tab={tab} setTab={setTab} model={model} labelClass={labelClass} />}
      <SidePanel
        layout={layout}
        sheetOpen={sheetOpen}
        header={
          <PanelHeader>
            <Tabs
              className={panelTabs}
              flex="1"
              minW="0"
              items={TABS.filter((id) => !(twoPanels && id === 'moves') && (id !== 'report' || reportable)).map((id) => ({
                id,
                label: <TabLabel className={labelClass}>{t(`tabs.${id}`)}</TabLabel>,
              }))}
              value={rightTab}
              onChange={setTab}
            />
            {!compact && (!layout.panelSide || layout.floatingAvailable) && (
              <HeaderButton
                variant="icon"
                className="app-panel-dock"
                onClick={layout.togglePanelSide}
                title={t(layout.panelSide ? 'app.floatPanel' : 'app.dockPanelSide')}
                aria-label={t(layout.panelSide ? 'app.floatPanel' : 'app.dockPanelSide')}
              >
                <Icon name={layout.panelSide ? 'floating' : 'panel'} />
              </HeaderButton>
            )}
            {!compact && (
              <HeaderButton
                variant="icon"
                alignSelf="center"
                onClick={() => setPanel({ hidden: true })}
                title={t('app.closeThePanelP')}
                aria-label={t('app.closeThePanel')}
              >
                <Icon name="close" />
              </HeaderButton>
            )}
          </PanelHeader>
        }
        footer={!picking && <NavFooter canAutoplay={canAutoplay} watch={model.watch} lesson={model.lesson} />}
      >
        <PanelBody tab={rightTab} model={model} />
      </SidePanel>
    </>
  )
}

export function SidePanel({
  layout,
  sheetOpen,
  header,
  children,
  footer,
}: {
  layout: Layout
  sheetOpen: boolean
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const { t } = useTranslation()
  const { compact, zoned, panelPrefsHidden, panelWidth, setPanel } = layout
  const resizeStart = useRef({ x: 0, width: panelWidth })
  const sheetGesture = useRef<{ pointerId: number; startY: number; moved: boolean } | null>(null)
  const suppressSheetClick = useRef(false)
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
    const max = compact ? window.innerWidth * 0.7 : 560
    const min = compact ? Math.min(180, max) : 320
    setPanel({ width: Math.min(max, Math.max(min, resizeStart.current.width + resizeStart.current.x - e.clientX)) })
  }
  const startHandleSwipe = (e: ReactPointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    sheetGesture.current = { pointerId: e.pointerId, startY: e.clientY, moved: false }
    suppressSheetClick.current = false
  }
  const moveHandleSwipe = (e: ReactPointerEvent) => {
    const gesture = sheetGesture.current
    if (!gesture || gesture.pointerId !== e.pointerId || !e.currentTarget.hasPointerCapture(e.pointerId)) return
    if (!gesture.moved && Math.abs(e.clientY - gesture.startY) < 6) return
    gesture.moved = true
    layout.resizeSheet(e.clientY)
  }
  const finishHandleSwipe = (e: ReactPointerEvent, cancelled = false) => {
    const gesture = sheetGesture.current
    if (!gesture || gesture.pointerId !== e.pointerId) return
    if (gesture.moved) layout.persistSheet()
    sheetGesture.current = null
    suppressSheetClick.current = !cancelled && gesture.moved
  }
  return (
    <PanelAside className="app-panel" hidden={(zoned && panelPrefsHidden) || undefined} style={zoned && !panelPrefsHidden ? floatingRect : undefined}>
      {layout.panelSide && (
        <styled.div
          className="app-panel-resize"
          position="absolute"
          top="0"
          bottom="0"
          left="-4px"
          zIndex="banner"
          w="8px"
          cursor="col-resize"
          transition="background {durations.fast}"
          touchAction="none"
          bgImage="linear-gradient({colors.border.strong}, {colors.border.strong})"
          bgPosition="center"
          bgSize="3px 40px"
          bgRepeat="no-repeat"
          _hover={{ background: 'accent.soft' }}
          _active={{ background: 'accent.soft' }}
          _compact={{ display: 'none', '.app-shell[data-panel-side] &': { display: 'block', left: '0', w: '12px' } }}
          css={{ '.app-shell[data-zoned] > .app-panel &': { left: '0', w: '12px' } }}
          role="separator"
          aria-label={t('app.dragToResizeThePanel')}
          aria-orientation="vertical"
          title={t('app.dragToResizeThePanel')}
          onPointerDown={startResize}
          onPointerMove={resize}
        />
      )}
      <styled.button
        display="none"
        _compact={{
          display: 'block',
          flex: 'none',
          h: '12px',
          p: '0',
          touchAction: 'none',
          cursor: 'row-resize',
          bgImage: 'linear-gradient({colors.border.strong}, {colors.border.strong})',
          bgPosition: 'center',
          bgSize: '40px 3px',
          bgRepeat: 'no-repeat',
        }}
        onClick={(e) => {
          if (suppressSheetClick.current && e.detail > 0) {
            suppressSheetClick.current = false
            return
          }
          layout.setSheetOpen(!sheetOpen)
        }}
        onPointerDown={startHandleSwipe}
        onPointerMove={moveHandleSwipe}
        onPointerUp={finishHandleSwipe}
        onPointerCancel={(e) => finishHandleSwipe(e, true)}
        onLostPointerCapture={(e) => finishHandleSwipe(e, true)}
        aria-label={sheetOpen ? t('app.collapsePanel') : t('app.expandPanel')}
      />
      {header}
      {children}
      {footer}
    </PanelAside>
  )
}
