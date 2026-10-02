import { useEffect, useRef } from 'react'
import type { ZoneRect } from './Board3D'
import { useTranslation } from 'react-i18next'
import { Icon } from './icons'

export type ZoneAction = { label: string; title?: string; onClick: () => void; disabled?: boolean; primary?: boolean }

export function StandZones({ zone, moves, cursor, onJump, actions }: { zone: ZoneRect; moves: string[]; cursor: number; onJump: (ply: number) => void; actions: ZoneAction[] }) {
  const { t } = useTranslation()
  const list = useRef<HTMLOListElement>(null)
  useEffect(() => {
    list.current?.querySelector('.on')?.scrollIntoView({ block: 'nearest' })
  }, [cursor, moves.length])
  if (zone.width < 160 || zone.height < 120) return null
  return (
    <div className="ws-zone ws-zone-moves" style={zone}>
      {actions.length > 0 && (
        <div className="ws-zone-actions">
          {actions.map((a) => (
            <button key={a.label} className={a.primary ? 'primary' : ''} onClick={a.onClick} disabled={a.disabled} title={a.title}>
              {a.label}
            </button>
          ))}
        </div>
      )}
      {moves.length > 0 && (
        <ol ref={list}>
          {moves.map((m, i) => (
            <li key={i} className={i + 1 === cursor ? 'on' : ''}>
              <button onClick={() => onJump(i + 1)}>
                <span>{i + 1}</span>
                {m}
              </button>
            </li>
          ))}
        </ol>
      )}
      {moves.length > 0 && (
        <div className="ws-zone-nav">
          <button onClick={() => onJump(0)} disabled={cursor === 0} aria-label={t('zones.first')}>
            <Icon name="first" size={14} />
          </button>
          <button onClick={() => onJump(Math.max(0, cursor - 1))} disabled={cursor === 0} aria-label={t('zones.back')}>
            <Icon name="prev" size={14} />
          </button>
          <button onClick={() => onJump(Math.min(moves.length, cursor + 1))} disabled={cursor >= moves.length} aria-label={t('zones.forward')}>
            <Icon name="next" size={14} />
          </button>
          <button onClick={() => onJump(moves.length)} disabled={cursor >= moves.length} aria-label={t('zones.last')}>
            <Icon name="last" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
