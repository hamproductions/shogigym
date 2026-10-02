import { useTranslation } from 'react-i18next'
import type { GameNotes } from './useAnalyzeGames'

export function KifuNotes({ notes, moves, cursor }: { notes: GameNotes; moves: string[]; cursor: number }) {
  const { t } = useTranslation()
  const noted = notes.moves.split(' ')
  if (!moves.join(' ').startsWith(noted.slice(0, cursor).join(' ')) || cursor > noted.length) return null
  return (
    <div className="ws-kifu-notes">
      {notes.title !== 'Imported game' && cursor === 0 && <p className="ws-muted">{notes.title}</p>}
      {notes.comments[cursor] && (
        <p className="ws-note">
          <span className="ws-kifu-tag">{t('workshop.comment')}</span> {notes.comments[cursor]}
        </p>
      )}
      {notes.ending && cursor === noted.length && <p className="ws-note">{notes.ending}</p>}
    </div>
  )
}
