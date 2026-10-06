import './rail.css'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
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

interface RailProps {
  mode: Mode
  onMode: (mode: Mode) => void
  compact: boolean
  view: View
  settingsOpen: boolean
  onSettings: () => void
  onPalette: () => void
  snapshotName: string
}

function ToolButton({ tool }: { tool: RailTool }) {
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

const COARSE_POINTER = '(pointer: coarse)'

function subscribeCoarsePointer(onChange: () => void) {
  const media = globalThis.matchMedia(COARSE_POINTER)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const coarsePointerSnapshot = () => globalThis.matchMedia(COARSE_POINTER).matches

function useCoarsePointer() {
  return useSyncExternalStore(subscribeCoarsePointer, coarsePointerSnapshot, () => false)
}

const subscribeNothing = () => () => undefined
const bodyElement = () => document.body
const noElementOnServer = () => null

/** The element menus and dialogs are portalled into; null while rendering on the server. */
function usePortalRoot() {
  return useSyncExternalStore(subscribeNothing, bodyElement, noElementOnServer)
}

function useMenuDismiss(open: boolean, close: () => void) {
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  }, [close])
  useEffect(() => {
    if (!open) return
    const dismiss = () => closeRef.current()
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      closeRef.current()
    }
    globalThis.addEventListener('pointerdown', dismiss)
    globalThis.addEventListener('keydown', key, true)
    return () => {
      globalThis.removeEventListener('pointerdown', dismiss)
      globalThis.removeEventListener('keydown', key, true)
    }
  }, [open])
}

export function Rail({ mode, onMode, compact: phone, view, settingsOpen, onSettings, onPalette, snapshotName }: RailProps) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  const installation = useInstallApp()
  const portalRoot = usePortalRoot()
  const [more, setMore] = useState(false)
  const [modeMenu, setModeMenu] = useState(false)
  const [moreAt, setMoreAt] = useState<DOMRect | null>(null)
  const [modeAt, setModeAt] = useState<DOMRect | null>(null)
  const tablet = useCoarsePointer()
  const compact = phone || tablet
  const menuPosition = (anchor: DOMRect | null) => {
    if (!anchor) return undefined
    if (phone) return { left: Math.max(8, Math.min(anchor.left, globalThis.innerWidth - 240)), top: anchor.bottom + 8 }
    return { left: anchor.right + 8, top: Math.max(8, Math.min(anchor.top, globalThis.innerHeight - 400)) }
  }
  const closeMenus = useCallback(() => {
    setMore(false)
    setModeMenu(false)
  }, [])
  useMenuDismiss(more || modeMenu, closeMenus)
  const { primary, secondary, top, bottom } = useRailTools({
    view,
    settingsOpen,
    onSettings,
    onPalette,
    snapshotName,
    onFlipTable: flipTable,
    onSaveImage: saveBoardImage,
    onInstall: installation.installed ? undefined : installation.install,
  })
  const { railRef, lastModeRef, capacity } = useRailCapacity()
  const all = [...primary, ...secondary, ...bottom]
  const available = Math.max(0, capacity - top.length)
  const inline = available >= all.length ? all : all.slice(0, Math.max(0, available - 1))
  const overflow = all.slice(inline.length)
  return (
    <nav className="app-rail" aria-label={t('app.mode')} ref={railRef}>
      <RailSeal />
      {compact && (
        <div className="app-menu-wrap app-mode-menu">
          <button
            ref={lastModeRef}
            className="app-rail-btn on"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => (e.stopPropagation(), setModeAt(e.currentTarget.getBoundingClientRect()), setMore(false), setModeMenu((v) => !v))}
            aria-expanded={modeMenu}
          >
            <Icon name="menu" size={20} />
            <span>{t(`modes.${mode}.name`)}</span>
          </button>
          {modeMenu &&
            portalRoot &&
            createPortal(
              <div
                className="app-more-menu"
                role="presentation"
                style={menuPosition(modeAt)}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setModeMenu(false)}
              >
                {MODES.map((m) => (
                  <button key={m.id} className={`app-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => onMode(m.id)}>
                    <Icon name={m.icon} size={20} />
                    <span>{t(`modes.${m.id}.name`)}</span>
                  </button>
                ))}
              </div>,
              portalRoot,
            )}
        </div>
      )}
      {!compact &&
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
            onClick={(e) => (e.stopPropagation(), setModeMenu(false), setMoreAt(e.currentTarget.getBoundingClientRect()), setMore((v) => !v))}
            aria-expanded={more}
            title={t('rail.more')}
          >
            <Icon name="more" size={20} />
            <span>{t('rail.more')}</span>
          </button>
          {more &&
            portalRoot &&
            createPortal(
              <div
                className="app-more-menu"
                role="presentation"
                style={menuPosition(moreAt)}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setMore(false)}
              >
                {overflow.map((tool) => (
                  <ToolButton key={tool.id} tool={tool} />
                ))}
              </div>,
              portalRoot,
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
        portalRoot &&
        createPortal(
          <Dialog label={t('rail.install')} onBackdrop={installation.closeHelp}>
            <DialogHeader title={t('rail.install')} closeLabel={t('settings.closeSettings')} onClose={installation.closeHelp} />
            <p>{t('rail.installHelp')}</p>
          </Dialog>,
          portalRoot,
        )}
    </nav>
  )
}
