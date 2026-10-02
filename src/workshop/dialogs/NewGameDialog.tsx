import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FAMILIES, STRATEGIES } from '../../data/strategies'
import { otherSide, type Side } from '../../shogi'
import { aiStrategyId, strategyCourses } from '../lib/book'
import { STRENGTH, TIME_CONTROLS, setSettings, useSettings, type AiStrength, type TimeControl } from '../settings'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { SegmentedField, SettingRow } from '../ui/Segmented'

export function NewGameDialog({ side, onClose, onStart }: { side: Side; onClose: () => void; onStart: (side: Side) => void }) {
  const { t } = useTranslation()
  const st = useSettings()
  const [pick, setPick] = useState<Side>(side)
  const ja = st.lang === 'ja'
  return (
    <Dialog label={t('newGame.title')} className="ws-newgame" onBackdrop={onClose}>
      <h2>{t('newGame.title')}</h2>
      <SegmentedField<Side> label={t('newGame.side')} value={pick} options={(['sente', 'gote'] as const).map((x) => ({ v: x, t: x === 'sente' ? t('workshop.playSente') : t('workshop.playGote') }))} onChange={setPick} />
      <SegmentedField<AiStrength> label={t('newGame.strength')} value={st.opponent} options={(Object.keys(STRENGTH) as AiStrength[]).map((k) => ({ v: k, t: STRENGTH[k].label }))} onChange={(k) => setSettings({ opponent: k })} />
      <SegmentedField<TimeControl> label={t('newGame.clock')} value={st.timeControl} options={(Object.keys(TIME_CONTROLS) as TimeControl[]).map((k) => ({ v: k, t: TIME_CONTROLS[k].label, title: TIME_CONTROLS[k].hint }))} onChange={(k) => setSettings({ timeControl: k })} />
      <SettingRow label={t('newGame.strategy')}>
        <select className="ws-field" value={aiStrategyId(st.aiStrategy)} aria-label={t('newGame.strategy')} onChange={(e) => setSettings({ aiStrategy: e.target.value })}>
          <option value="">{t('workshop.anyStrategy')}</option>
          {Object.entries(FAMILIES).map(([family, label]) => {
            const options = STRATEGIES.filter((x) => x.family === family && strategyCourses(x.id, otherSide(pick)).length > 0)
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
        <Button variant="primary" onClick={() => onStart(pick)}>
          {t('newGame.start')}
        </Button>
      </div>
    </Dialog>
  )
}
