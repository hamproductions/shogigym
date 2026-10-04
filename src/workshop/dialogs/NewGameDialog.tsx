import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FAMILIES, STRATEGIES } from '../../data/strategies'
import { otherSide, type Side } from '../../shogi'
import { aiStrategyId, strategyCourses } from '../lib/book'
import { STRENGTH, TIME_CONTROLS, setSettings, useSettings, type AiStrength, type TimeControl } from '../settings'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { SegmentedField, SettingRow } from '../ui/Segmented'

const CLOCK_ORDER: TimeControl[] = ['none', '10s', '3m', '5m5s', '10m', '10m30s', '30m60s']

export type PickSide = Side | 'random'

export function NewGameDialog({ side, onClose, onStart }: { side: Side; onClose: () => void; onStart: (side: Side, isRandom?: boolean) => void }) {
  const { t } = useTranslation()
  const st = useSettings()
  const [pick, setPick] = useState<PickSide>(side)
  const ja = st.lang === 'ja'
  const start = () => {
    let chosen: Side
    let isRandom = false
    if (pick === 'random') {
      chosen = Math.random() < 0.5 ? 'sente' : 'gote'
      isRandom = true
    } else {
      chosen = pick
    }
    onStart(chosen, isRandom)
  }
  const effectiveSide: Side = pick === 'random' ? 'sente' : pick
  return (
    <Dialog label={t('newGame.title')} className="ws-newgame" onBackdrop={onClose}>
      <h2>{t('newGame.title')}</h2>
      <SegmentedField
        label={t('newGame.side')}
        value={pick}
        options={[
          { v: 'sente', t: t('workshop.playSente') },
          { v: 'gote', t: t('workshop.playGote') },
          { v: 'random', t: ja ? 'ランダム' : 'Random' },
        ]}
        onChange={(v) => setPick(v as PickSide)}
      />
      <SegmentedField<AiStrength> label={t('newGame.strength')} value={st.opponent} options={(Object.keys(STRENGTH) as AiStrength[]).map((k) => ({ v: k, t: STRENGTH[k].label }))} onChange={(k) => setSettings({ opponent: k })} />
      <SegmentedField<TimeControl> label={t('newGame.clock')} value={st.timeControl} options={CLOCK_ORDER.map((k) => ({ v: k, t: TIME_CONTROLS[k].label, title: TIME_CONTROLS[k].hint }))} onChange={(k) => setSettings({ timeControl: k })} />
      <SettingRow label={t('newGame.strategy')}>
        <select className="ws-field" value={aiStrategyId(st.aiStrategy)} aria-label={t('newGame.strategy')} onChange={(e) => setSettings({ aiStrategy: e.target.value })}>
          <option value="">{t('workshop.anyStrategy')}</option>
          {Object.entries(FAMILIES).map(([family, label]) => {
            const options = STRATEGIES.filter((x) => x.family === family && strategyCourses(x.id, otherSide(effectiveSide)).length > 0)
            return options.length ? (
              <optgroup key={family} label={`${t(options[0].side === 'ibisha' ? 'strategy.ibisha' : 'strategy.furibisha')} · ${ja ? label.ja : label.en}`}>
                {options.map((x) => (
                  <option key={x.id} value={x.id}>
                    {ja ? x.ja : `${x.en} ${x.ja}`}
                  </option>
                ))}
              </optgroup>
            ) : null
          })}
        </select>
      </SettingRow>
      <div className="ws-actions">
        <Button onClick={onClose}>{t('workshop.cancel')}</Button>
        <Button variant="primary" onClick={start}>
          {t('newGame.start')}
        </Button>
      </div>
    </Dialog>
  )
}
