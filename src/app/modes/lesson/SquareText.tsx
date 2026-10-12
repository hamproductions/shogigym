import { MENTION_COLORS, mentionedSquares, squareParts } from '@/app/modes/lesson/figureMarks'

const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

/**
 * Lesson text with each mentioned square tinted like its board tile. `context` is the full text the
 * board marks were built from, so colours stay in sync when the text is split across lines.
 */
export function SquareText({ text, context = text }: { text: string; context?: string }) {
  const squares = mentionedSquares(context)
  return (
    <>
      {squareParts(text).map((part, i) =>
        typeof part === 'string' ? (
          part
        ) : (
          <span key={i} className="app-sq" style={{ ['--sq' as string]: hex(MENTION_COLORS[squares.indexOf(part.square) % MENTION_COLORS.length]) }}>
            {part.text}
          </span>
        ),
      )}
    </>
  )
}
