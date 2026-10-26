import { styled } from 'styled-system/jsx'
import type { Side } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { useFlipped } from '@/app/hooks/session'

export function SideMark({ side, flipped }: { side: Side; flipped?: boolean }) {
  return (
    <styled.span display="inline-block" transform={(side === 'gote') !== !!flipped ? 'rotate(180deg)' : undefined} aria-hidden>
      {sideMark(side)}
    </styled.span>
  )
}

export function FlipMarks({ children, flipped, muted }: { children: string; flipped?: boolean; muted?: boolean }) {
  return (
    <>
      {children.split(/([☗☖▲△])/).map((part, i) =>
        part === '☗' || part === '☖' || part === '▲' || part === '△' ? (
          <styled.span
            key={i}
            display="inline-block"
            transform={(part === '☖' || part === '△') !== !!flipped ? 'rotate(180deg)' : undefined}
            fontFamily={muted ? 'mincho' : undefined}
            fontSize={muted ? 'sm' : undefined}
            color={muted ? 'fg.muted' : undefined}
          >
            {part}
          </styled.span>
        ) : (
          part
        ),
      )}
    </>
  )
}

/** FlipMarks that follows the board session's orientation. */
export function Marks({ children, muted }: { children: string; muted?: boolean }) {
  return (
    <FlipMarks flipped={useFlipped()} muted={muted}>
      {children}
    </FlipMarks>
  )
}
