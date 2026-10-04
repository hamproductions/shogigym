import './eval-bar.css'
import { useTranslation } from 'react-i18next'
import { useGlide } from '../hooks/useGlide'

export function EvalBar({ rate, flipped }: { rate: number; flipped: boolean }) {
  const { t } = useTranslation()
  const sente = Math.round(rate * 100)
  const bottomShare = flipped ? 1 - rate : rate
  const fill = useGlide<HTMLDivElement>('height', bottomShare * 100)
  return (
    <div className="app-evalbar" title={t('app.winChance', { value: sente, value2: 100 - sente })} aria-label={t('app.winChanceShort')}>
      <div ref={fill} className="app-evalbar-fill" style={{ height: `${bottomShare * 100}%` }} />
      <span className={`app-evalbar-num ${bottomShare >= 0.5 ? 'bottom' : 'top'}`}>
        {rate >= 0.5 ? '☗' : '☖'}
        <br />
        {Math.round(Math.max(rate, 1 - rate) * 100)}
      </span>
    </div>
  )
}
