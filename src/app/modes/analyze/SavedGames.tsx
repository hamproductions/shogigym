import { useTranslation } from 'react-i18next'
import { gameChoice, loadGames } from '@/app/games'
import { savedAtLabel, sideMark } from '@/utils/notation'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'
import { styled } from 'styled-system/jsx'
import { Marks } from '@/app/ui/SideMark'

const GameRow = styled('li', { base: { display: 'flex', alignItems: 'stretch', gap: '1', mb: '1.5' } })

const GameOpen = styled('button', {
  base: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0',
    minW: '0',
    p: '{spacing.1.5} {spacing.2.5}',
    borderRadius: 'md',
    bg: 'surface.2',
    textAlign: 'left',
  },
  variants: {
    on: {
      false: {},
      true: { boxShadow: 'inset 3px 0 0 {colors.accent}' },
    },
  },
  defaultVariants: { on: false },
})

export function SavedGames({ games, onOpen }: { games: AnalyzeGames; onOpen?: () => void }) {
  const { t } = useTranslation()
  const stored = loadGames()
  return (
    <styled.ul m="{spacing.2.5} 0 0" p="0" listStyle="none">
      {stored.length === 0 && (
        <GameRow color="fg.muted" fontSize="sm">
          {t('games.noSavedGamesYetPress')}
        </GameRow>
      )}
      {stored.map((g) => {
        const names = g.players && (g.players.sente || g.players.gote) ? g.players : undefined
        return (
          <GameRow key={g.id}>
            <GameOpen
              on={g.id === games.slotId}
              onClick={() => {
                games.openSlot(g)
                onOpen?.()
              }}
            >
              <styled.strong maxW="100%" overflow="hidden" fontSize="sm" textOverflow="ellipsis" whiteSpace="nowrap">
                {names ? `${sideMark('sente')}${names.sente ?? '?'} vs ${sideMark('gote')}${names.gote ?? '?'}` : g.title}
              </styled.strong>
              <styled.span color="fg.muted" fontSize="xs">
                {names && `${savedAtLabel(new Date(g.savedAt))} · `}
                {t('games.moves', { count: g.moves.length })}
                {g.tree && g.tree.children.length > 1 ? t('games.withVariations') : ''}
                {' · '}
                <Marks>{t(`insights.role.${gameChoice(g)}`)}</Marks>
              </styled.span>
            </GameOpen>
            <Button variant="icon" onClick={() => games.deleteSlot(g)} aria-label={t('games.delete', { title: g.title })} title={t('games.delete2')}>
              ×
            </Button>
          </GameRow>
        )
      })}
    </styled.ul>
  )
}
