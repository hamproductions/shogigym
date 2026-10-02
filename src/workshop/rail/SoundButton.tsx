import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icons'
import { playSound, setSettings, useSettings } from '../settings'

export function SoundButton({ compact }: { compact: boolean }) {
  const { t } = useTranslation()
  const { sound, volume } = useSettings()
  const [at, setAt] = useState<DOMRect | null>(null)
  const open = !!at
  const show = (el: HTMLElement) => setAt(el.getBoundingClientRect())
  const muted = !sound || volume === 0
  const icon = muted ? 'mute' : volume < 0.45 ? 'soundLow' : 'sound'
  const toggle = () => {
    if (muted) setSettings({ sound: true, volume: volume === 0 ? 0.6 : volume })
    else setSettings({ sound: false })
  }
  const nudge = (delta: number) => setSettings({ sound: true, volume: Math.round(Math.min(1, Math.max(0, volume + delta)) * 20) / 20 })
  return (
    <div className={`ws-sound${compact ? ' compact' : ''}${open ? ' open' : ''}`} onMouseEnter={(e) => show(e.currentTarget)} onMouseLeave={() => setAt(null)} onFocus={(e) => show(e.currentTarget)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setAt(null)}>
      <button className={`ws-rail-btn${muted ? '' : ' on'}`} data-tool="sound" onClick={toggle} onWheel={(e) => nudge(e.deltaY < 0 ? 0.05 : -0.05)} aria-pressed={!muted} title={`${muted ? t('rail.unmute') : t('rail.mute')} (M)`}>
        <Icon name={icon} size={20} />
        <span>{muted ? t('rail.muted') : `${Math.round(volume * 100)}%`}</span>
      </button>
      <div className="ws-sound-pop" role="group" aria-label={t('settings.volume')} style={at ? (compact ? { left: at.left + at.width / 2, top: at.bottom + 6 } : { left: at.right + 6, top: at.top + at.height / 2 }) : undefined}>
        <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} aria-label={t('settings.volume')} onChange={(e) => setSettings({ sound: Number(e.target.value) > 0, volume: Number(e.target.value) })} onPointerUp={() => playSound('move')} onKeyUp={() => playSound('move')} />
      </div>
    </div>
  )
}
