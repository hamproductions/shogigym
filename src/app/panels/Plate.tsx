import './plate.css'
import { useTranslation } from 'react-i18next'
import { Color, type ImmutablePosition } from 'tsshogi'
import { formationName, formationOf } from '../../formation'
import type { ClockFace } from '../modes/spar/useGameClock'
import { Pill } from '../ui/Pill'

export function Plate({ position, color, who, className, clock }: { position: ImmutablePosition; color: Color; who: string | null; className: string; clock?: ClockFace }) {
  const { t, i18n } = useTranslation()
  const { strategy, castle } = formationOf(position, color)
  return (
    <div className={`app-plate ${className}`}>
      {clock && <span className={`app-clock${clock.active ? ' on' : ''}${clock.low ? ' low' : ''}${clock.out ? ' out' : ''}`} role="timer">{clock.out ? t('plate.outOfTime') : clock.text}</span>}
      <span className="app-plate-side">{color === Color.BLACK ? t('plate.sente') : t('plate.gote')}</span>
      {who && <span className="app-muted">{who}</span>}
      {strategy && <Pill title={`${t('plate.strategyFromWhereTheRook')} (${strategy})`}>{formationName(strategy, i18n.language)}</Pill>}
      {castle && <Pill title={`${t('plate.castleFromWhereTheKing')} (${castle})`}>{formationName(castle, i18n.language)}</Pill>}
    </div>
  )
}
