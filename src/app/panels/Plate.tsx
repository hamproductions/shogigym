import { useTranslation } from 'react-i18next'
import { Color, type ImmutablePosition } from 'tsshogi'
import { formationName, formationOf } from '@/utils/formation'
import type { ClockFace } from '@/app/modes/spar/useGameClock'
import { Pill } from '@/app/ui/Pill'
import { useSession } from '@/app/hooks/session'
import { cx } from '@/app/ui/cx'
import { SideMark } from '@/app/ui/SideMark'
import { styled } from 'styled-system/jsx'
import { Clock, Muted, PlateBox, PlateSide } from './panels.styles'

const PlatePill = styled(Pill, { base: { fontSize: 'sm', _compact: { fontSize: 'xs' }, _short: { display: 'none' } } })

export function Plate({
  board: position,
  side: color,
  who,
  className,
  placement,
  clock,
}: {
  board: ImmutablePosition
  side: Color
  who: string | null
  className: string
  placement: 'scene' | 'caption'
  clock?: ClockFace
}) {
  const { t, i18n } = useTranslation()
  const { sfens, game, cursor, flipped } = useSession()
  const { strategy, castle } = formationOf(position, color, { sfens, moves: game.moves, cursor })
  return (
    <PlateBox className={cx('app-plate', className)} placement={placement}>
      {clock && (
        <Clock state={clock.out ? 'out' : clock.low ? 'low' : clock.active ? 'on' : 'idle'} role="timer">
          {clock.out ? t('plate.outOfTime') : clock.text}
        </Clock>
      )}
      <PlateSide>
        <SideMark side={color === Color.BLACK ? 'sente' : 'gote'} flipped={flipped} /> {color === Color.BLACK ? t('plate.sente') : t('plate.gote')}
      </PlateSide>
      {who && <Muted as="span">{who}</Muted>}
      {strategy && <PlatePill title={`${t('plate.strategyFromWhereTheRook')} (${strategy})`}>{formationName(strategy, i18n.language)}</PlatePill>}
      {castle && <PlatePill title={`${t('plate.castleFromWhereTheKing')} (${castle})`}>{formationName(castle, i18n.language)}</PlatePill>}
    </PlateBox>
  )
}
