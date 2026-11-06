import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gameChoice, loadGames } from '@/app/games'
import { sideMark } from '@/utils/notation'
import { formationName } from '@/utils/formation'
import { useGameSummaries } from './useGameSummaries'
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
  const { t, i18n } = useTranslation()
  const stored = loadGames()
  const summaryOf = useGameSummaries(stored)
  const [query, setQuery] = useState('')
  const [strategy, setStrategy] = useState('')
  const [limit, setLimit] = useState(20)
  const names = [...new Set(stored.flatMap((game) => summaryOf(game)?.names ?? []).filter((name) => name !== '居玉'))].sort((a, b) =>
    formationName(a, i18n.language).localeCompare(formationName(b, i18n.language), i18n.language),
  )
  const dates = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    return new Map(stored.map((game) => [game.savedAt, formatter.format(new Date(game.savedAt))]))
  }, [stored, i18n.language])
  const search = query.trim().toLocaleLowerCase()
  const filtered = stored.filter((game) => {
    const summary = summaryOf(game)
    if (strategy && !summary?.names.includes(strategy)) return false
    const text = [
      game.title,
      game.players?.sente,
      game.players?.gote,
      dates.get(game.savedAt),
      ...(summary?.names.flatMap((name) => [name, formationName(name, 'en')]) ?? []),
    ]
      .join(' ')
      .toLocaleLowerCase()
    return text.includes(search)
  })
  return (
    <>
      {stored.length > 0 && (
        <styled.div display="flex" flexWrap="wrap" gap="2" mt="2.5" mb="2">
          <styled.input
            type="search"
            value={query}
            placeholder={t('games.searchSaved')}
            aria-label={t('games.searchSaved')}
            onChange={(event) => {
              setQuery(event.target.value)
              setLimit(20)
            }}
            flex="1"
            minW="180px"
            minH="44px"
            px="2.5"
            bg="surface.2"
            border="1px solid {colors.border}"
            borderRadius="md"
          />
          <styled.select
            value={strategy}
            aria-label={t('games.filterFormation')}
            onChange={(event) => {
              setStrategy(event.target.value)
              setLimit(20)
            }}
            minH="44px"
            maxW="100%"
            px="2"
            bg="surface.2"
            border="1px solid {colors.border}"
            borderRadius="md"
          >
            <option value="">{t('games.allFormations')}</option>
            {names.map((name) => (
              <option key={name} value={name}>
                {formationName(name, i18n.language)}
              </option>
            ))}
          </styled.select>
          <styled.span width="100%" fontSize="xs" color="fg.muted" aria-live="polite">
            {t('games.showingSaved', { shown: Math.min(limit, filtered.length), total: filtered.length })}
          </styled.span>
        </styled.div>
      )}
      <styled.ul m="{spacing.2.5} 0 0" p="0" listStyle="none">
        {stored.length === 0 && (
          <GameRow color="fg.muted" fontSize="sm">
            {t('games.noSavedGamesYetPress')}
          </GameRow>
        )}
        {stored.length > 0 && filtered.length === 0 && (
          <GameRow color="fg.muted" fontSize="sm">
            {t('games.noMatches')}
          </GameRow>
        )}
        {filtered.slice(0, limit).map((g) => {
          const names = g.players && (g.players.sente || g.players.gote) ? g.players : undefined
          const summary = summaryOf(g)
          return (
            <GameRow key={g.id}>
              <GameOpen
                on={g.id === games.slotId}
                onClick={() => {
                  games.openSlot(g)
                  onOpen?.()
                }}
              >
                <styled.strong maxW="100%" fontSize="sm" overflowWrap="anywhere">
                  <Marks>{names ? `${sideMark('sente')}${names.sente ?? '?'} vs ${sideMark('gote')}${names.gote ?? '?'}` : g.title}</Marks>
                </styled.strong>
                {names && (
                  <styled.span fontSize="xs" overflowWrap="anywhere">
                    {g.title}
                  </styled.span>
                )}
                <styled.span display="flex" flexWrap="wrap" gap="1" my="1" fontSize="xs">
                  {summary ? (
                    summary.error ? (
                      <styled.span color="fg.muted">{t('games.formationUnavailable')}</styled.span>
                    ) : (
                      (['sente', 'gote'] as const).map((side) => {
                        const labels = [summary[side].strategy, summary[side].castle].filter((name): name is string => !!name && name !== '居玉')
                        return (
                          labels.length > 0 && (
                            <styled.span key={side} px="1.5" py="0.5" borderRadius="sm" bg="surface.3">
                              <Marks>{sideMark(side)}</Marks> {labels.map((name) => formationName(name, i18n.language)).join(' · ')}
                            </styled.span>
                          )
                        )
                      })
                    )
                  ) : (
                    <styled.span color="fg.muted">{t('games.identifyingFormations')}</styled.span>
                  )}
                </styled.span>
                <styled.span color="fg.muted" fontSize="xs">
                  {dates.get(g.savedAt)} · {t('games.moves', { count: g.moves.length })}
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
      {filtered.length > limit && <Button onClick={() => setLimit((value) => value + 20)}>{t('games.showMore')}</Button>}
    </>
  )
}
