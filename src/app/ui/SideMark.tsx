import { styled } from 'styled-system/jsx'
import type { Side } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'

/** ☗/☖ point the way that side's pieces face on screen, so they turn upside down with a flipped board. */
export function SideMark({ side, flipped }: { side: Side; flipped?: boolean }) {
  return (
    <styled.span display="inline-block" transform={flipped ? 'rotate(180deg)' : undefined} aria-hidden>
      {sideMark(side)}
    </styled.span>
  )
}
