import { useTranslation } from 'react-i18next'
import { Color, type ImmutablePosition } from 'tsshogi'
import { formationName, formationOf } from '@/utils/formation'
import type { ClockFace } from '@/app/modes/spar/useGameClock'
import { Pill } from '@/app/ui/Pill'
import { useSession } from '@/app/hooks/session'
import { cx } from '@/app/ui/cx'
import { SideMark } from '@/app/ui/SideMark'
import { clock as clockStyle, muted, plate, plateSide } from './panels.styles'

export function Plate({
  board: position,
  side: color,
  who,
  className,
  clock,
}: {
  board: ImmutablePosition
  side: Color
  who: string | null
  className: string
  clock?: ClockFace
}) {
  const { t, i18n } = useTranslation()
  const { sfens, game, cursor, flipped } = useSession()
  const { strategy, castle } = formationOf(position, color, { sfens, moves: game.moves, cursor })
  return (
    <div className={cx('app-plate', className, plate)}>
      {clock && (
        <span className={clockStyle({ state: clock.out ? 'out' : clock.low ? 'low' : clock.active ? 'on' : 'idle' })} role="timer">
          {clock.out ? t('plate.outOfTime') : clock.text}
        </span>
      )}
      <span className={plateSide}>
        <SideMark side={color === Color.BLACK ? 'sente' : 'gote'} flipped={flipped} /> {color === Color.BLACK ? t('plate.sente') : t('plate.gote')}
      </span>
      {who && <span className={muted}>{who}</span>}
      {strategy && <Pill title={`${t('plate.strategyFromWhereTheRook')} (${strategy})`}>{formationName(strategy, i18n.language)}</Pill>}
      {castle && <Pill title={`${t('plate.castleFromWhereTheKing')} (${castle})`}>{formationName(castle, i18n.language)}</Pill>}
    </div>
  )
}
