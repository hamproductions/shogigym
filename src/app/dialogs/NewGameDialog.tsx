import './new-game.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FAMILIES, STRATEGIES } from '../../data/strategies'
import { otherSide, type Side } from '../../shogi'
import { aiStrategyId, strategyCourses } from '../lib/book'
import { STRENGTH, TIME_CONTROLS, setSettings, useSettings, type AiStrength, type TimeControl } from '../../appearance/settings'
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
  const start = () => onStart(pick === 'random' ? side : pick, pick === 'random')
  return (
    <Dialog label={t('newGame.title')} className="app-newgame" onBackdrop={onClose}>
      <h2>{t('newGame.title')}</h2>
      <SegmentedField
        label={t('newGame.side')}
        value={pick}
        options={[
          { v: 'sente', t: t('app.playSente') },
          { v: 'gote', t: t('app.playGote') },
          { v: 'random', t: ja ? 'ランダム' : 'Random' },
        ]}
        onChange={(v) => setPick(v as PickSide)}
      />
      <SegmentedField<AiStrength> label={t('newGame.strength')} value={st.opponent} options={(Object.keys(STRENGTH) as AiStrength[]).map((k) => ({ v: k, t: STRENGTH[k].label }))} onChange={(k) => setSettings({ opponent: k })} />
      <SegmentedField<TimeControl> label={t('newGame.clock')} value={st.timeControl} options={CLOCK_ORDER.map((k) => ({ v: k, t: TIME_CONTROLS[k].label, title: TIME_CONTROLS[k].hint }))} onChange={(k) => setSettings({ timeControl: k })} />
      <SettingRow label={t('newGame.strategy')}>
        <select className="app-field" value={aiStrategyId(st.aiStrategy)} aria-label={t('newGame.strategy')} onChange={(e) => setSettings({ aiStrategy: e.target.value })}>
          <option value="">{t('app.anyStrategy')}</option>
          {Object.entries(FAMILIES).map(([family, label]) => {
            const options = STRATEGIES.filter((x) => x.family === family && (pick === 'random' ? strategyCourses(x.id, 'sente').length > 0 || strategyCourses(x.id, 'gote').length > 0 : strategyCourses(x.id, otherSide(pick)).length > 0))
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
      <div className="app-actions">
        <Button onClick={onClose}>{t('app.cancel')}</Button>
        <Button variant="primary" onClick={start}>
          {t('newGame.start')}
        </Button>
      </div>
    </Dialog>
  )
}
