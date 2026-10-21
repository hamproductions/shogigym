import { useTranslation } from 'react-i18next'
import { Box, styled } from 'styled-system/jsx'
import type { GameNotes } from './useAnalyzeGames'
import { Muted, Note } from '@/app/panels/panels.styles'
import { Marks } from '@/app/ui/SideMark'

export function KifuNotes({ notes, moves, ply: cursor }: { notes: GameNotes; moves: string[]; ply: number }) {
  const { t } = useTranslation()
  const noted = notes.moves.split(' ')
  if (!moves.join(' ').startsWith(noted.slice(0, cursor).join(' ')) || cursor > noted.length) return null
  return (
    <Box my="2">
      {notes.title !== 'Imported game' && cursor === 0 && <Muted>{notes.title}</Muted>}
      {notes.comments[cursor] && (
        <Note>
          <styled.span mr="1" px="1.5" borderRadius="xs" bg="info.soft" color="info" fontFamily="sans" fontSize="2xs" fontWeight="bold">
            {t('app.comment')}
          </styled.span>{' '}
          <Marks>{notes.comments[cursor]}</Marks>
        </Note>
      )}
      {notes.ending && cursor === noted.length && (
        <Note>
          <Marks>{notes.ending}</Marks>
        </Note>
      )}
    </Box>
  )
}
