import './import.css'
import { useTranslation } from 'react-i18next'
import type { GameNotes } from './useAnalyzeGames'

export function KifuNotes({ notes, moves, cursor }: { notes: GameNotes; moves: string[]; cursor: number }) {
  const { t } = useTranslation()
  const noted = notes.moves.split(' ')
  if (!moves.join(' ').startsWith(noted.slice(0, cursor).join(' ')) || cursor > noted.length) return null
  return (
    <div className="app-kifu-notes">
      {notes.title !== 'Imported game' && cursor === 0 && <p className="app-muted">{notes.title}</p>}
      {notes.comments[cursor] && (
        <p className="app-note">
          <span className="app-kifu-tag">{t('app.comment')}</span> {notes.comments[cursor]}
        </p>
      )}
      {notes.ending && cursor === noted.length && <p className="app-note">{notes.ending}</p>}
    </div>
  )
}
