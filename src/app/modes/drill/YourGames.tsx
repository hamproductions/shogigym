import { useTranslation } from 'react-i18next'
import { loadGames, type StoredGame } from '@/app/games'
import { savedAtLabel, sideMark } from '@/utils/notation'
import { Button } from '@/app/ui/Button'
import { muted } from '@/app/panels/panels.styles'
import { resultChip } from '@/app/modes/lesson/lesson.styles'
import { Grid, styled } from 'styled-system/jsx'

export function YourGames({ onOpen }: { onOpen: (g: StoredGame) => void }) {
  const { t } = useTranslation()
  const games = loadGames()
    .filter((g) => g.vsAi)
    .slice(0, 6)
  if (!games.length) return null
  return (
    <Grid gap="1.5" mt="3">
      <strong>{t('review.yourGames')}</strong>
      {games.map((g) => (
        <Grid key={g.id} gridTemplateColumns="auto minmax(0, 1fr) auto auto" alignItems="center" gap="2" p="2" borderRadius="md" bg="surface.2" fontSize="sm">
          <span className={resultChip({ outcome: g.result ?? 'none' })}>{t(`review.result.${g.result ?? 'none'}`)}</span>
          <styled.span overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {sideMark(g.userSide)} {savedAtLabel(new Date(g.savedAt))}
          </styled.span>
          <span className={muted}>{t('review.moveCount', { count: g.moves.length })}</span>
          <Button size="sm" onClick={() => onOpen(g)}>
            {t('review.reviewGame')}
          </Button>
        </Grid>
      ))}
    </Grid>
  )
}
