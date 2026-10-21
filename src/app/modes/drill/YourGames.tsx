import { useTranslation } from 'react-i18next'
import { loadGames, type StoredGame } from '@/app/games'
import { savedAtLabel, sideMark } from '@/utils/notation'
import { Button } from '@/app/ui/Button'
import { Muted } from '@/app/panels/panels.styles'
import { Grid, styled } from 'styled-system/jsx'
import { Marks } from '@/app/ui/SideMark'

const ResultChip = styled('span', {
  base: { p: '2px {spacing.2}', borderRadius: 'full', bg: 'surface.3', fontWeight: 'bold', fontSize: 'xs' },
  variants: {
    outcome: {
      none: {},
      win: { bg: 'success.soft', color: 'success' },
      loss: { bg: 'color-mix(in srgb, {colors.danger} 18%, transparent)', color: 'danger' },
      resigned: { bg: 'color-mix(in srgb, {colors.danger} 18%, transparent)', color: 'danger' },
      time: { bg: 'color-mix(in srgb, {colors.danger} 18%, transparent)', color: 'danger' },
    },
  },
  defaultVariants: { outcome: 'none' },
})

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
          <ResultChip outcome={g.result ?? 'none'}>{t(`review.result.${g.result ?? 'none'}`)}</ResultChip>
          <styled.span overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            <Marks>{`${sideMark(g.userSide)} ${savedAtLabel(new Date(g.savedAt))}`}</Marks>
          </styled.span>
          <Muted as="span">{t('review.moveCount', { count: g.moves.length })}</Muted>
          <Button size="sm" onClick={() => onOpen(g)}>
            {t('review.reviewGame')}
          </Button>
        </Grid>
      ))}
    </Grid>
  )
}
