import { useTranslation } from 'react-i18next'
import { gameChoice, loadGames } from '@/app/games'
import { savedAtLabel, sideMark } from '@/utils/notation'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'
import { muted } from '@/app/panels/panels.styles'
import { gameOpen } from '@/app/modes/lesson/lesson.styles'
import { styled } from 'styled-system/jsx'

export function SavedGames({ games, onOpen }: { games: AnalyzeGames; onOpen?: () => void }) {
  const { t } = useTranslation()
  const stored = loadGames()
  return (
    <styled.ul m="{spacing.2.5} 0 0" p="0" listStyle="none" css={{ '& li': { display: 'flex', alignItems: 'stretch', gap: '1', mb: '1.5' } }}>
      {stored.length === 0 && <li className={muted}>{t('games.noSavedGamesYetPress')}</li>}
      {stored.map((g) => {
        const names = g.players && (g.players.sente || g.players.gote) ? g.players : undefined
        return (
          <li key={g.id}>
            <button
              className={gameOpen({ on: g.id === games.slotId })}
              onClick={() => {
                games.openSlot(g)
                onOpen?.()
              }}
            >
              <strong>{names ? `${sideMark('sente')}${names.sente ?? '?'} vs ${sideMark('gote')}${names.gote ?? '?'}` : g.title}</strong>
              <span>
                {names && `${savedAtLabel(new Date(g.savedAt))} · `}
                {t('games.moves', { count: g.moves.length })}
                {g.tree && g.tree.children.length > 1 ? t('games.withVariations') : ''}
                {' · '}
                {t(`insights.role.${gameChoice(g)}`)}
              </span>
            </button>
            <Button variant="icon" onClick={() => games.deleteSlot(g)} aria-label={t('games.delete', { title: g.title })} title={t('games.delete2')}>
              ×
            </Button>
          </li>
        )
      })}
    </styled.ul>
  )
}
