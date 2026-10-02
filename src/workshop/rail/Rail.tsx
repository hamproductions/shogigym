import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { View } from '../hooks/useView'
import { Icon } from '../icons'
import { flipTable, saveBoardImage } from '../lib/events'
import { useSettings } from '../settings'
import { MODES, type Mode } from '../types'
import { RailSeal } from './RailSeal'
import { useRailCapacity } from './useRailCapacity'
import { useRailTools, type RailTool } from './useRailTools'

type RailProps = {
  mode: Mode
  onMode: (mode: Mode) => void
  compact: boolean
  view: View
  onFlip: () => void
  settingsOpen: boolean
  onSettings: () => void
  onPalette: () => void
  snapshotName: string
}

function ToolButton({ tool }: { tool: RailTool }) {
  return (
    <button className={`ws-rail-btn${tool.on ? ' on' : ''}`} onClick={tool.run} disabled={tool.disabled} title={tool.title} aria-pressed={tool.pressed}>
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

export function Rail({ mode, onMode, compact, view, onFlip, settingsOpen, onSettings, onPalette, snapshotName }: RailProps) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  const [more, setMore] = useState(false)
  const [modeMenu, setModeMenu] = useState(false)
  const [moreAt, setMoreAt] = useState<DOMRect | null>(null)
  const closeMenus = useCallback(() => {
    setMore(false)
    setModeMenu(false)
  }, [])
  useMenuDismiss(more || modeMenu, closeMenus)
  const { primary, secondary } = useRailTools({ view, onFlip, settingsOpen, onSettings, onPalette, snapshotName, onFlipTable: flipTable, onSaveImage: saveBoardImage })
  const { railRef, lastModeRef, capacity } = useRailCapacity()
  const all = [...primary, ...secondary]
  const inline = compact ? primary : capacity >= all.length ? all : all.slice(0, Math.max(primary.length, capacity - 1))
  const overflow = compact ? secondary : all.slice(inline.length)
  return (
    <nav className="ws-rail" aria-label={t('workshop.mode')} ref={railRef}>
      <RailSeal />
      {compact && (
        <div className="ws-menu-wrap ws-mode-menu">
          <button className="ws-rail-btn on" onClick={(e) => (e.stopPropagation(), setMore(false), setModeMenu((v) => !v))} aria-expanded={modeMenu}>
            <Icon name="menu" size={20} />
            <span>{t(`modes.${mode}.name`)}</span>
          </button>
          {modeMenu && (
            <div className="ws-more-menu left" onPointerDown={(e) => e.stopPropagation()} onClick={() => setModeMenu(false)}>
              {MODES.map((m) => (
                <button key={m.id} className={`ws-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => onMode(m.id)}>
                  <Icon name={m.icon} size={20} />
                  <span>{t(`modes.${m.id}.name`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!compact &&
        MODES.map((m, i) => (
          <button key={m.id} ref={i === MODES.length - 1 ? lastModeRef : undefined} className={`ws-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => onMode(m.id)} aria-pressed={mode === m.id} title={t('modes.title', { name: t(`modes.${m.id}.name`), hint: t(`modes.${m.id}.hint`) })}>
            <Icon name={m.icon} size={20} />
            <span className={ja ? 'ws-ja' : 'ws-en'}>{t(`modes.${m.id}.name`)}</span>
          </button>
        ))}
      <div className="ws-rail-gap" />
      {inline.map((tool) => (
        <ToolButton key={tool.id} tool={tool} />
      ))}
      {overflow.length > 0 && (
        <div className="ws-menu-wrap">
          <button className={`ws-rail-btn${more ? ' on' : ''}`} onClick={(e) => (e.stopPropagation(), setModeMenu(false), setMoreAt(e.currentTarget.getBoundingClientRect()), setMore((v) => !v))} aria-expanded={more} title={t('rail.more')}>
            <Icon name="more" size={20} />
            <span>{t('rail.more')}</span>
          </button>
          {more && (
            <div className="ws-more-menu" style={moreAt && !compact ? { left: moreAt.right + 8, bottom: window.innerHeight - moreAt.bottom } : undefined} onPointerDown={(e) => e.stopPropagation()} onClick={() => setMore(false)}>
              {overflow.map((tool) => (
                <ToolButton key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
