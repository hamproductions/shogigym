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

/** Turns every ☗/☖ inside running text, for strings that embed the marks (move notation, "☗ to move"). */
export function FlipMarks({ children, flipped }: { children: string; flipped?: boolean }) {
  if (!flipped) return <>{children}</>
  return (
    <>
      {children.split(/([☗☖])/).map((part, i) =>
        part === '☗' || part === '☖' ? (
          <styled.span key={i} display="inline-block" transform="rotate(180deg)">
            {part}
          </styled.span>
        ) : (
          part
        ),
      )}
    </>
  )
}
