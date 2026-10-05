import './rail.css'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { View } from '@/app/hooks/useView'
import { Icon } from '@/app/icons'
import { flipTable, saveBoardImage } from '@/utils/events'
import { useSettings } from '@/appearance/settings'
import { MODES, type Mode } from '@/app/types'
import { RailSeal } from './RailSeal'
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

export function Rail({ mode, onMode, compact, view, settingsOpen, onSettings, onPalette, snapshotName }: RailProps) {
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
  const { primary, secondary, top, bottom } = useRailTools({
    view,
    settingsOpen,
    onSettings,
    onPalette,
    snapshotName,
    onFlipTable: flipTable,
    onSaveImage: saveBoardImage,
  })
  const { railRef, lastModeRef, capacity } = useRailCapacity()
  const all = [...primary, ...secondary]
  const available = capacity - bottom.length - top.length
  const inline = compact ? [] : available >= all.length ? all : all.slice(0, Math.max(primary.length, available - 1))
  const overflow = compact ? [...all, ...bottom.filter((tool) => tool.id !== 'settings')] : all.slice(inline.length)
  return (
    <nav className="app-rail" aria-label={t('app.mode')} ref={railRef}>
      <RailSeal />
      {compact && (
        <div className="app-menu-wrap app-mode-menu">
          <button className="app-rail-btn on" onClick={(e) => (e.stopPropagation(), setMore(false), setModeMenu((v) => !v))} aria-expanded={modeMenu}>
            <Icon name="menu" size={20} />
            <span>{t(`modes.${mode}.name`)}</span>
          </button>
          {modeMenu && (
            <div className="app-more-menu left" onPointerDown={(e) => e.stopPropagation()} onClick={() => setModeMenu(false)}>
              {MODES.map((m) => (
                <button key={m.id} className={`app-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => onMode(m.id)}>
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
      {inline.map((tool) => (
        <ToolButton key={tool.id} tool={tool} />
      ))}
      {overflow.length > 0 && (
        <div className="app-menu-wrap">
          <button
            className={`app-rail-btn${more ? ' on' : ''}`}
            onClick={(e) => (e.stopPropagation(), setModeMenu(false), setMoreAt(e.currentTarget.getBoundingClientRect()), setMore((v) => !v))}
            aria-expanded={more}
            title={t('rail.more')}
          >
            <Icon name="more" size={20} />
            <span>{t('rail.more')}</span>
          </button>
          {more && (
            <div
              className="app-more-menu"
              style={moreAt && !compact ? { left: moreAt.right + 8, bottom: window.innerHeight - moreAt.bottom } : undefined}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setMore(false)}
            >
              {overflow.map((tool) => (
                <ToolButton key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      )}
      {bottom
        .filter((tool) => !compact && tool.id !== 'settings')
        .map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      <SoundButton compact={compact} />
      {bottom
        .filter((tool) => tool.id === 'settings')
        .map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
    </nav>
  )
}
