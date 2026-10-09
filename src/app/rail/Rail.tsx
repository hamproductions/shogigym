import './rail.css'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import type { View } from '@/app/hooks/useView'
import { Icon } from '@/app/icons'
import { flipTable, saveBoardImage } from '@/utils/events'
import { useSettings } from '@/appearance/settings'
import { MODES, type Mode } from '@/app/types'
import { RailSeal } from './RailSeal'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { useInstallApp } from './useInstallApp'
import { SoundButton } from './SoundButton'
import { useRailCapacity } from './useRailCapacity'
import { useRailTools, type RailTool } from './useRailTools'

type RailProps = {
  mode: Mode
  onMode: (mode: Mode) => void
  compact: boolean
  view: View
  settingsOpen: boolean
  onSettings: () => void
  onPalette: () => void
  onReport?: () => void
  onLessonBack?: () => void
  snapshotName: string
  tools?: RailTool[]
  navigation?: boolean
  onBack?: () => void
  backLabel?: string
}

export function ToolButton({ tool }: { tool: RailTool }) {
  return (
    <button
      className={`app-rail-btn${tool.on ? ' on' : ''}`}
      data-tool={tool.id}
      onClick={tool.run}
      disabled={tool.disabled}
      title={tool.title ?? tool.label}
      aria-pressed={tool.pressed}
    >
      <Icon name={tool.icon} size={20} />
      <span className={tool.labelClass}>{tool.label}</span>
    </button>
  )
}

function useMenuDismiss(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      close()
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', key, true)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', key, true)
    }
  }, [open, close])
}

function RailMenu({ anchor, phone, close, children }: { anchor: HTMLElement | null; phone: boolean; close: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const menu = ref.current
    if (!menu || !anchor) return
    const place = () => {
      const bounds = anchor.getBoundingClientRect()
      const left = phone ? bounds.left : bounds.right + 8
      const top = phone ? bounds.bottom + 8 : bounds.top
      menu.style.left = `${Math.max(8, Math.min(left, window.innerWidth - menu.offsetWidth - 8))}px`
      menu.style.top = `${Math.max(8, Math.min(top, window.innerHeight - menu.offsetHeight - 8))}px`
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(menu)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchor, phone])
  return (
    <div ref={ref} className="app-more-menu" onPointerDown={(e) => e.stopPropagation()} onClick={close}>
      {children}
    </div>
  )
}

export function Rail({
  mode,
  onMode,
  compact: phone,
  view,
  settingsOpen,
  onSettings,
  onPalette,
  onReport,
  onLessonBack,
  snapshotName,
  tools,
  navigation = true,
  onBack,
  backLabel,
}: RailProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const ja = useSettings().lang === 'ja'
  const installation = useInstallApp()
  const [more, setMore] = useState(false)
  const [modeMenu, setModeMenu] = useState(false)
  const [moreAt, setMoreAt] = useState<HTMLElement | null>(null)
  const [modeAt, setModeAt] = useState<HTMLElement | null>(null)
  const [tablet, setTablet] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)')
    const sync = () => setTablet(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  const compact = phone || tablet
  const closeMenus = useCallback(() => {
    setMore(false)
    setModeMenu(false)
  }, [])
  useMenuDismiss(more || modeMenu, closeMenus)
  const defaults = useRailTools({
    view,
    settingsOpen,
    onSettings,
    onPalette,
    snapshotName,
    onFlipTable: flipTable,
    onSaveImage: saveBoardImage,
    onInstall: installation.installed ? undefined : installation.install,
    onReport,
  })
  const { primary, secondary, top, bottom } = tools
    ? {
        primary: tools.filter((tool) => !['control', 'palette', 'settings', 'hide', 'fullscreen'].includes(tool.id)),
        secondary: [],
        top: defaults.top,
        bottom: tools.filter((tool) => ['settings', 'hide', 'fullscreen'].includes(tool.id)),
      }
    : defaults
  const { railRef, lastModeRef, capacity } = useRailCapacity(compact)
  const all = [...primary, ...secondary, ...bottom]
  const extras: RailTool[] = navigation ? [{ id: 'taikyoku', icon: 'spar', label: t('palette.taikyoku'), run: () => void navigate('/taikyoku') }] : []
  const available = Math.max(0, capacity - top.length)
  const inline = available >= all.length + (extras.length ? 1 : 0) ? all : all.slice(0, Math.max(0, available - 1))
  const overflow = [...all.slice(inline.length), ...extras]
  return (
    <nav className="app-rail" aria-label={t('app.mode')} ref={railRef}>
      <RailSeal />
      {onBack && (
        <button ref={lastModeRef} className="app-rail-btn" onClick={onBack} title={backLabel} aria-label={backLabel}>
          <Icon name="back" size={20} />
          <span>{backLabel}</span>
        </button>
      )}
      {onLessonBack && (
        <button className="app-rail-btn app-lesson-back" onClick={onLessonBack} title={t('lesson.lessons')} aria-label={t('lesson.lessons')}>
          <Icon name="back" size={20} />
        </button>
      )}
      {navigation && compact && (
        <div className="app-menu-wrap app-mode-menu">
          <button
            ref={lastModeRef}
            className="app-rail-btn on"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => (e.stopPropagation(), setModeAt(e.currentTarget), setMore(false), setModeMenu((v) => !v))}
            aria-expanded={modeMenu}
          >
            <Icon name="menu" size={20} />
            <span>{t(`modes.${mode}.name`)}</span>
          </button>
          {modeMenu &&
            createPortal(
              <RailMenu anchor={modeAt} phone={phone} close={() => setModeMenu(false)}>
                {MODES.map((m) => (
                  <button key={m.id} className={`app-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => onMode(m.id)}>
                    <Icon name={m.icon} size={20} />
                    <span>{t(`modes.${m.id}.name`)}</span>
                  </button>
                ))}
              </RailMenu>,
              document.body,
            )}
        </div>
      )}
      {navigation &&
        !compact &&
        MODES.map((m, i) => (
          <button
            key={m.id}
            ref={i === MODES.length - 1 ? lastModeRef : undefined}
            className={`app-rail-btn${mode === m.id ? ' on' : ''}`}
            onClick={() => onMode(m.id)}
            aria-pressed={mode === m.id}
            title={t('modes.title', { name: t(`modes.${m.id}.name`), hint: t(`modes.${m.id}.hint`) })}
          >
            <Icon name={m.icon} size={20} />
            <span className={ja ? 'app-ja' : 'app-en'}>{t(`modes.${m.id}.name`)}</span>
          </button>
        ))}
      <div className="app-rail-gap" />
      {top.map((tool) => (
        <ToolButton key={tool.id} tool={tool} />
      ))}
      {inline
        .filter((tool) => tool.id !== 'settings')
        .map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      {overflow.length > 0 && (
        <div className="app-menu-wrap">
          <button
            className={`app-rail-btn${more ? ' on' : ''}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => (e.stopPropagation(), setModeMenu(false), setMoreAt(e.currentTarget), setMore((v) => !v))}
            aria-expanded={more}
            title={t('rail.more')}
          >
            <Icon name="more" size={20} />
            <span>{t('rail.more')}</span>
          </button>
          {more &&
            createPortal(
              <RailMenu anchor={moreAt} phone={phone} close={() => setMore(false)}>
                {overflow.map((tool) => (
                  <ToolButton key={tool.id} tool={tool} />
                ))}
              </RailMenu>,
              document.body,
            )}
        </div>
      )}
      <SoundButton compact={compact} />
      {inline
        .filter((tool) => tool.id === 'settings')
        .map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      {installation.help &&
        createPortal(
          <Dialog label={t('rail.install')} onBackdrop={installation.closeHelp}>
            <DialogHeader title={t('rail.install')} closeLabel={t('settings.closeSettings')} onClose={installation.closeHelp} />
            <p>{t('rail.installHelp')}</p>
          </Dialog>,
          document.body,
        )}
    </nav>
  )
}
