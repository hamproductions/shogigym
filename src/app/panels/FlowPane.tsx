import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cva } from 'styled-system/css'
import { styled } from 'styled-system/jsx'
import { applyUsi, moveText } from '@/utils/shogi'
import type { Lane } from '@/utils/lanes'
import { lossClass } from '@/utils/score'
import { loadStats, loadStatsMeta, type PositionStats, type StatsMeta } from '@/utils/stats'
import { Muted } from './panels.styles'

const laneCard = cva({
  base: {
    layerStyle: 'card',
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    w: '100%',
    mb: '2',
    p: '{spacing.2.5} {spacing.3}',
    textAlign: 'left',
    transition: 'background {durations.fast}',
    _hover: { bg: 'card.hover' },
    _focusVisible: { bg: 'card.hover' },
  },
  variants: {
    tone: {
      book: { '--tone': '{colors.warning}' },
      ai: { '--tone': '{colors.info}' },
      mistake: { '--tone': '{colors.danger}' },
    },
  },
})

function laneSteps(sfen: string, moves: string[]) {
  const steps: string[] = []
  let at = sfen
  for (const usi of moves) {
    steps.push(moveText(at, usi))
    const next = applyUsi(at, usi)
    if (!next) break
    at = next
  }
  return steps
}

function useOpeningStats(sfen: string) {
  const [state, setState] = useState<{ sfen: string; stats: PositionStats | null } | null>(null)
  const [meta, setMeta] = useState<StatsMeta | null>(null)
  useEffect(() => {
    let live = true
    loadStats(sfen).then((stats) => live && setState({ sfen, stats }))
    return () => {
      live = false
    }
  }, [sfen])
  useEffect(() => {
    loadStatsMeta().then(setMeta)
  }, [])
  return { loading: state?.sfen !== sfen, stats: state?.sfen === sfen ? state.stats : null, meta }
}

const THIN_SAMPLE = 200

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0)

function sourceLabel(meta: StatsMeta | null) {
  if (!meta) return ''
  const years = meta.sources.filter((s) => s.id.startsWith('floodgate:')).map((s) => s.id.slice(10))
  const aoba = meta.sources.some((s) => s.id.startsWith('aobazero:'))
  return [years.length ? `Floodgate ${years.join(', ')}` : '', aoba ? 'AobaZero' : ''].filter(Boolean).join(' + ')
}

function OpeningStats({
  sfen,
  onPreview,
  onHover,
  lone = false,
}: {
  sfen: string
  onPreview: (moves: string[], title: string) => void
  onHover: (usi: string | null) => void
  lone?: boolean
}) {
  const { t } = useTranslation()
  const { loading, stats, meta } = useOpeningStats(sfen)
  if (loading) return null
  if (!stats)
    return (
      <styled.p
        m={lone ? '0 0 {spacing.3}' : '{spacing.3} 0 0'}
        color="fg.muted"
        fontFamily={lone ? 'mincho' : undefined}
        fontSize="xs"
        lineHeight={lone ? 'mincho' : undefined}
      >
        {t('flow.statsNone', { ply: meta?.maxPly ?? 30 })}
      </styled.p>
    )
  const gote = sfen.split(' ')[1] === 'w'
  const book = stats.book
  const bookText = book ? moveText(sfen, book.usi) : ''
  const bookEval = book ? t('flow.statsEval', { side: book.eval >= 0 !== gote ? '☗' : '☖', cp: Math.abs(book.eval) }) : ''
  return (
    <styled.section mt={lone ? '0' : '3'} pt="3" borderTop="1px solid {colors.border}" aria-label={t('flow.statsTitle')}>
      <styled.header display="flex" flexWrap="wrap" alignItems="baseline" justifyContent="space-between" gap="{spacing.1} {spacing.2}" mb="2">
        <styled.h3 m="0" fontSize="sm" fontWeight="bold">
          {t('flow.statsTitle')}
        </styled.h3>
        <styled.span color="fg.muted" fontSize="2xs">
          {t('flow.statsSource', { games: stats.games.toLocaleString(), source: sourceLabel(meta) })}
        </styled.span>
      </styled.header>
      <styled.div
        display="grid"
        gridTemplateColumns="minmax(64px, 0.9fr) 1.2fr 1.2fr"
        alignItems="center"
        gap="2"
        p="0 {spacing.2} {spacing.1}"
        color="fg.muted"
        fontSize="2xs"
        aria-hidden="true"
      >
        <span>{t('flow.statsMove')}</span>
        <span>{t('flow.statsPlayed')}</span>
        <span>{t('flow.statsResult')}</span>
      </styled.div>
      <styled.ul m="0" p="0" listStyle="none">
        {stats.moves.map((m) => {
          const text = moveText(sfen, m.usi)
          const s = pct(m.senteWins, m.games)
          const g = pct(m.goteWins, m.games)
          const isBook = book?.usi === m.usi
          return (
            <li key={m.usi}>
              <styled.button
                display="grid"
                gridTemplateColumns="minmax(64px, 0.9fr) 1.2fr 1.2fr"
                alignItems="center"
                gap="2"
                w="100%"
                p="{spacing.1.5} {spacing.2}"
                borderRadius="sm"
                textAlign="left"
                _hover={{ bg: 'card.hover' }}
                _focusVisible={{ bg: 'card.hover' }}
                onClick={() => onPreview([m.usi], text)}
                onMouseEnter={() => onHover(m.usi)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(m.usi)}
                onBlur={() => onHover(null)}
                title={t('flow.statsRowTitle', { move: text, games: m.games.toLocaleString(), sente: s, gote: g, draw: Math.max(0, 100 - s - g) })}
              >
                <styled.span
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  gap="0.5"
                  minW="0"
                  fontFamily="mincho"
                  fontSize="md"
                  fontWeight="heavy"
                  whiteSpace="nowrap"
                >
                  {text}
                  {isBook && (
                    <styled.em
                      px="1"
                      borderRadius="xs"
                      bg="info.soft"
                      color="info"
                      fontFamily="sans"
                      fontSize="2xs"
                      fontStyle="normal"
                      fontWeight="bold"
                      lineHeight="snug"
                    >
                      {t('flow.statsBookMark')}
                    </styled.em>
                  )}
                </styled.span>
                <styled.span display="flex" flexDirection="column" gap="0.5" minW="0">
                  <styled.span display="flex" h="6px" overflow="hidden" borderRadius="full" bg="meter.track">
                    <styled.i bg="warning" style={{ width: `${(m.games / stats.games) * 100}%` }} />
                  </styled.span>
                  <styled.span fontSize="xs" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
                    {pct(m.games, stats.games)}%{' '}
                    <styled.small color="fg.muted" fontSize="inherit">
                      {t('flow.statsGames', { count: m.games, n: m.games.toLocaleString() })}
                    </styled.small>
                  </styled.span>
                </styled.span>
                <styled.span
                  display="flex"
                  flexDirection="column"
                  gap="0.5"
                  minW="0"
                  css={{ '&[data-thin]': { opacity: '0.5' } }}
                  data-thin={m.games < THIN_SAMPLE || undefined}
                >
                  <styled.span display="flex" h="6px" overflow="hidden" borderRadius="full" bg="meter.track">
                    <styled.i bg="meter.fill" style={{ width: `${s}%` }} />
                    <styled.i ml="auto" bg="hai.400" style={{ width: `${g}%` }} />
                  </styled.span>
                  <styled.span fontSize="xs" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
                    <styled.b fontWeight="bold">☗{s}%</styled.b>{' '}
                    <styled.b fontWeight="bold" color="fg.muted">
                      ☖{g}%
                    </styled.b>
                  </styled.span>
                </styled.span>
              </styled.button>
            </li>
          )
        })}
      </styled.ul>
      <styled.p
        m={lone ? '0 0 {spacing.3}' : '{spacing.2} 0 0'}
        color="fg.muted"
        fontFamily={lone ? 'mincho' : undefined}
        fontSize="2xs"
        lineHeight={lone ? 'mincho' : 'snug'}
      >
        {t('flow.statsKey', { min: THIN_SAMPLE })}
      </styled.p>
      {book && (
        <styled.p
          m={lone ? '0 0 {spacing.3}' : '{spacing.2} 0 0'}
          fontFamily={lone ? 'mincho' : undefined}
          fontSize="xs"
          lineHeight={lone ? 'mincho' : undefined}
        >
          {t('flow.statsBook', { move: bookText, eval: bookEval })}
          {!stats.moves.some((m) => m.usi === book.usi) && <Muted as="span"> {t('flow.statsBookRare')}</Muted>}
        </styled.p>
      )}
    </styled.section>
  )
}

export function FlowPane({
  lanes,
  sfen,
  onPreview,
  onHover,
}: {
  lanes: Lane[]
  sfen: string
  onPreview: (moves: string[], title: string) => void
  onHover: (usi: string | null) => void
}) {
  const { t } = useTranslation()
  if (!lanes.length)
    return (
      <styled.div py="2">
        <styled.p m="0 0 {spacing.3}" fontFamily="mincho" lineHeight="mincho">
          {t('flow.noBookLineFromThis')}
        </styled.p>
        <OpeningStats sfen={sfen} onPreview={onPreview} onHover={onHover} lone />
      </styled.div>
    )
  return (
    <div>
      <styled.p m="0 0 {spacing.3}" color="fg.muted" fontSize="sm">
        {t('flow.whatCanHappenFromThe')}
      </styled.p>
      {lanes.map((lane) => {
        const steps = laneSteps(sfen, lane.moves)
        return (
          <button
            key={lane.first}
            className={laneCard({ tone: lane.tag })}
            onClick={() => onPreview(lane.moves, steps[0])}
            onMouseEnter={() => onHover(lane.first)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(lane.first)}
            onBlur={() => onHover(null)}
          >
            <styled.span display="flex" justifyContent="space-between" color="var(--tone)" fontSize="2xs" fontWeight="bold">
              <span>{lane.tag === 'book' ? t('flow.book') : lane.tag === 'mistake' ? t('flow.knownMistake') : t('flow.aiLine')}</span>
              {lane.loss !== undefined && (
                <span className={lossClass(lane.loss)}>{lane.best ? t('flow.best') : lane.loss === 0 ? t('flow.best2') : `−${lane.loss}%`}</span>
              )}
            </styled.span>
            <styled.span display="flex" flexWrap="wrap" gap="{spacing.0.5} {spacing.1.5}" fontFamily="mincho" fontSize="sm" lineHeight="snug">
              {steps.map((step, i) => (
                <styled.span key={i} fontWeight={i === 0 ? 'heavy' : undefined} fontSize={i === 0 ? 'lg' : undefined}>
                  {i > 0 && (
                    <styled.i mr="1.5" fontStyle="normal" color="fg.muted" aria-hidden="true">
                      →
                    </styled.i>
                  )}
                  {step}
                </styled.span>
              ))}
              {lane.forks && <Muted as="span">{t('flow.thenChoices', { forks: lane.forks })}</Muted>}
            </styled.span>
            {lane.note && (
              <styled.span fontFamily="mincho" fontSize="xs" color="fg.muted">
                {lane.note}
              </styled.span>
            )}
          </button>
        )
      })}
      <OpeningStats sfen={sfen} onPreview={onPreview} onHover={onHover} />
    </div>
  )
}
