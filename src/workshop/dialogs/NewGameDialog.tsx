import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SETUPS } from '../../model'
import type { Side } from '../../shogi'
import { strategyCourses } from '../lib/book'
import { STRENGTH, TIME_CONTROLS, setSettings, useSettings, type AiStrength, type TimeControl } from '../settings'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ws-setting">
      <span>{label}</span>
      <div className="ws-seg">{children}</div>
    </div>
  )
}

export function NewGameDialog({ side, onClose, onStart }: { side: Side; onClose: () => void; onStart: (side: Side) => void }) {
  const { t } = useTranslation()
  const st = useSettings()
  const [pick, setPick] = useState<Side>(side)
  return (
    <div className="ws-palette-back" onPointerDown={onClose}>
      <div className="ws-dialog ws-newgame" role="dialog" aria-label={t('newGame.title')} onPointerDown={(e) => e.stopPropagation()}>
        <h2>{t('newGame.title')}</h2>
        <Row label={t('newGame.side')}>
          {(['sente', 'gote'] as const).map((x) => (
            <button key={x} className={pick === x ? 'on' : ''} onClick={() => setPick(x)}>
              {x === 'sente' ? t('workshop.playSente') : t('workshop.playGote')}
            </button>
          ))}
        </Row>
        <Row label={t('newGame.strength')}>
          {(Object.keys(STRENGTH) as AiStrength[]).map((k) => (
            <button key={k} className={st.opponent === k ? 'on' : ''} onClick={() => setSettings({ opponent: k })}>
              {STRENGTH[k].label}
            </button>
          ))}
        </Row>
        <Row label={t('newGame.clock')}>
          {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((k) => (
            <button key={k} className={st.timeControl === k ? 'on' : ''} onClick={() => setSettings({ timeControl: k })} title={TIME_CONTROLS[k].hint}>
              {TIME_CONTROLS[k].label}
            </button>
          ))}
        </Row>
        <label className="ws-setting">
          <span>{t('newGame.strategy')}</span>
          <select value={st.aiStrategy} onChange={(e) => setSettings({ aiStrategy: e.target.value })}>
            <option value="">{t('workshop.anyStrategy')}</option>
            {SETUPS.filter((x) => !x.technique && strategyCourses(x.id, pick).length > 0).map((x) => (
              <option key={x.id} value={x.id}>
                {x.ja}
              </option>
            ))}
          </select>
        </label>
        <div className="ws-actions">
          <button onClick={onClose}>{t('workshop.cancel')}</button>
          <button className="primary" onClick={() => onStart(pick)}>
            {t('newGame.start')}
          </button>
        </div>
      </div>
    </div>
  )
}
