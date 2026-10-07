import './plate.css'
import { useTranslation } from 'react-i18next'
import { Color, type ImmutablePosition } from 'tsshogi'
import { formationName, formationOf } from '@/utils/formation'
import type { ClockFace } from '@/app/modes/spar/useGameClock'
import { useSession } from '@/app/hooks/session'

export function Plate({
  position,
  color,
  who,
  className,
  clock,
}: {
  position: ImmutablePosition
  color: Color
  who: string | null
  className: string
  clock?: ClockFace
}) {
  const { t, i18n } = useTranslation()
  const { sfens, game, cursor } = useSession()
  const { strategy, castle } = formationOf(position, color, { sfens, moves: game.moves, cursor })
  return (
    <div className={`app-plate ${className}`}>
      {clock && (
        <span className={`app-clock${clock.active ? ' on' : ''}${clock.low ? ' low' : ''}${clock.out ? ' out' : ''}`} role="timer">
          {clock.out ? t('plate.outOfTime') : clock.text}
        </span>
      )}
      <span className="app-plate-side">{color === Color.BLACK ? t('plate.sente') : t('plate.gote')}</span>
      {who && <span className="app-muted">{who}</span>}
      {strategy && (
        <span className="app-plate-formation strategy" title={`${t('plate.strategyFromWhereTheRook')} (${strategy})`}>
          <small>{t('app.strategy')}</small>
          <strong>{formationName(strategy, i18n.language)}</strong>
        </span>
      )}
      {castle && (
        <span className="app-plate-formation castle" title={`${t('plate.castleFromWhereTheKing')} (${castle})`}>
          <small>{t('app.castle')}</small>
          <strong>{formationName(castle, i18n.language)}</strong>
        </span>
      )}
    </div>
  )
}
