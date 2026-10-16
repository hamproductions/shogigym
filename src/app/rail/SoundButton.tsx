import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/app/icons'
import { playSound, setSettings, useSettings } from '@/appearance/settings'
import { cx } from '@/app/ui/cx'
import { Slider } from '@/components/ui'
import { railButton, railSlot, soundPop } from './rail.styles'

export function SoundButton({ compact }: { compact: boolean }) {
  const { t } = useTranslation()
  const { sound, volume } = useSettings()
  const anchor = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState<DOMRect | null>(null)
  const open = !!at
  const show = (el: HTMLElement) => setAt(el.getBoundingClientRect())
  useEffect(() => {
    if (!open) return
    const update = () => anchor.current && show(anchor.current)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [open])
  const muted = !sound || volume === 0
  const icon = muted ? 'mute' : volume < 0.45 ? 'soundLow' : 'sound'
  const toggle = () => {
    if (muted) setSettings({ sound: true, volume: volume === 0 ? 0.6 : volume })
    else setSettings({ sound: false })
  }
  const nudge = (delta: number) => setSettings({ sound: true, volume: Math.round(Math.min(1, Math.max(0, volume + delta)) * 20) / 20 })
  return (
    <div
      ref={anchor}
      className={railSlot}
      data-rail-slot="sound"
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={() => setAt(null)}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setAt(null)}
    >
      <button
        className={cx('app-rail-btn', railButton)}
        data-tool="sound"
        data-on={!muted || undefined}
        onClick={toggle}
        onWheel={(e) => nudge(e.deltaY < 0 ? 0.05 : -0.05)}
        aria-pressed={!muted}
        title={`${muted ? t('rail.unmute') : t('rail.mute')} (M)`}
      >
        <Icon name={icon} size={20} />
        <span>{muted ? t('rail.muted') : `${Math.round(volume * 100)}%`}</span>
      </button>
      <div
        className={soundPop}
        data-open={open || undefined}
        data-compact={compact || undefined}
        role="group"
        aria-label={t('settings.volume')}
        style={
          at
            ? compact
              ? { left: Math.max(94, Math.min(window.innerWidth - 94, at.left + at.width / 2)), top: at.bottom + 6 }
              : { left: at.right + 6, top: Math.max(28, Math.min(window.innerHeight - 28, at.top + at.height / 2)) }
            : undefined
        }
      >
        <Slider.Root
          w="140px"
          min={0}
          max={1}
          step={0.05}
          value={[muted ? 0 : volume]}
          aria-label={[t('settings.volume')]}
          onValueChange={({ value }) => setSettings({ sound: value[0] > 0, volume: value[0] })}
          onValueChangeEnd={() => playSound('move')}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </div>
    </div>
  )
}
