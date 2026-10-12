import { squareParts } from '@/app/modes/lesson/figureMarks'

/** Lesson text with each mentioned square tinted like its highlighted board tile. */
export function SquareText({ text }: { text: string }) {
  return (
    <>
      {squareParts(text).map((part, i) =>
        typeof part === 'string' ? (
          part
        ) : (
          <span key={i} className="app-sq">
            {part.text}
          </span>
        ),
      )}
    </>
  )
}
