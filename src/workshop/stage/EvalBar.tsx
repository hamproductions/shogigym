import { useTranslation } from 'react-i18next'
import type { ZoneRect } from '../board3d/types'

export function EvalBar({ rate, board, flipped }: { rate: number; board: ZoneRect; flipped: boolean }) {
  const { t } = useTranslation()
  const sente = Math.round(rate * 100)
  const inset = Math.max(18, board.width * 0.035)
  const bottomShare = flipped ? 1 - rate : rate
  const leader = rate >= 0.5 ? '☗' : '☖'
  return (
    <div className="ws-evalbar" style={{ left: flipped ? board.left + board.width - 10 - inset : board.left + 10, top: board.top + inset * 1.6, height: board.height - inset * 2.2 }} title={t('workshop.winChance', { value: sente, value2: 100 - sente })} aria-label={t('workshop.winChanceShort')}>
      <div className="ws-evalbar-fill" style={{ height: `${bottomShare * 100}%` }} />
      <span className={`ws-evalbar-num ${bottomShare >= 0.5 ? 'bottom' : 'top'}`}>
        {leader}
        <br />
        {Math.round(Math.max(rate, 1 - rate) * 100)}
      </span>
    </div>
  )
}
