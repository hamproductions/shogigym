import { useTranslation } from 'react-i18next'

export function EvalBar({ rate, flipped }: { rate: number; flipped: boolean }) {
  const { t } = useTranslation()
  const sente = Math.round(rate * 100)
  const bottomShare = flipped ? 1 - rate : rate
  return (
    <div className="ws-evalbar" title={t('workshop.winChance', { value: sente, value2: 100 - sente })} aria-label={t('workshop.winChanceShort')}>
      <div className="ws-evalbar-fill" style={{ height: `${bottomShare * 100}%` }} />
      <span className={`ws-evalbar-num ${bottomShare >= 0.5 ? 'bottom' : 'top'}`}>
        {rate >= 0.5 ? '☗' : '☖'}
        <br />
        {Math.round(Math.max(rate, 1 - rate) * 100)}
      </span>
    </div>
  )
}
