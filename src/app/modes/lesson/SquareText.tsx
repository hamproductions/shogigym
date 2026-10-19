import { MENTION_COLORS, mentionedSquares, squareParts } from '@/app/modes/lesson/figureMarks'
import { useSession } from '@/app/hooks/session'
import { FlipMarks } from '@/app/ui/SideMark'
import { squareMark } from './lesson.styles'

const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

/**
 * Lesson text with each mentioned square tinted like its board tile. `context` is the full text the
 * board marks were built from, so colours stay in sync when the text is split across lines.
 */
export function SquareText({ text, context = text }: { text: string; context?: string }) {
  const { flipped } = useSession()
  const squares = mentionedSquares(`${context}\n${text}`)
  return (
    <>
      {squareParts(text).map((part, i) =>
        typeof part === 'string' ? (
          <FlipMarks key={i} flipped={flipped}>
            {part}
          </FlipMarks>
        ) : (
          <span key={i} className={squareMark} style={{ ['--sq' as string]: hex(MENTION_COLORS[squares.indexOf(part.square) % MENTION_COLORS.length]) }}>
            <FlipMarks flipped={flipped}>{part.text}</FlipMarks>
          </span>
        ),
      )}
    </>
  )
}
