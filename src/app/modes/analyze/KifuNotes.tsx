import { useTranslation } from 'react-i18next'
import { Box, styled } from 'styled-system/jsx'
import type { GameNotes } from './useAnalyzeGames'

export function KifuNotes({ notes, moves, cursor }: { notes: GameNotes; moves: string[]; cursor: number }) {
  const { t } = useTranslation()
  const noted = notes.moves.split(' ')
  if (!moves.join(' ').startsWith(noted.slice(0, cursor).join(' ')) || cursor > noted.length) return null
  return (
    <Box my="2">
      {notes.title !== 'Imported game' && cursor === 0 && <p className="app-muted">{notes.title}</p>}
      {notes.comments[cursor] && (
        <p className="app-note">
          <styled.span mr="1" px="1.5" borderRadius="xs" bg="info.soft" color="info" fontFamily="sans" fontSize="2xs" fontWeight="bold">
            {t('app.comment')}
          </styled.span>{' '}
          {notes.comments[cursor]}
        </p>
      )}
      {notes.ending && cursor === noted.length && <p className="app-note">{notes.ending}</p>}
    </Box>
  )
}
