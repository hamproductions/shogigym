import { useTranslation } from 'react-i18next'
import { Color, type ImmutablePosition } from 'tsshogi'
import { formationOf } from '../../formation'
import type { ClockFace } from '../modes/spar/useGameClock'

export function Plate({ position, color, who, className, clock }: { position: ImmutablePosition; color: Color; who: string | null; className: string; clock?: ClockFace }) {
  const { t } = useTranslation()
  const { strategy, castle } = formationOf(position, color)
  return (
    <div className={`ws-plate ${className}`}>
      {clock && <span className={`ws-clock${clock.active ? ' on' : ''}${clock.low ? ' low' : ''}${clock.out ? ' out' : ''}`} role="timer">{clock.out ? t('plate.outOfTime') : clock.text}</span>}
      <span className="ws-plate-side">{color === Color.BLACK ? t('plate.sente') : t('plate.gote')}</span>
      {who && <span className="ws-muted">{who}</span>}
      {strategy && <span className="ws-pill" title={t('plate.strategyFromWhereTheRook')}>{strategy}</span>}
      {castle && <span className="ws-pill" title={t('plate.castleFromWhereTheKing')}>{castle}</span>}
    </div>
  )
}
