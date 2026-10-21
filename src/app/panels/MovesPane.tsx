import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { styled, Wrap } from 'styled-system/jsx'
import { LABELS, type MoveReview } from '@/utils/analysis'
import type { RatingProgress } from '@/app/hooks/useAutoRate'
import { loadMistakes, saveMistakes } from '@/utils/mistakes'
import { moveText } from '@/utils/shogi'
import { FlipMarks } from '@/app/ui/SideMark'
import { isBad } from '@/utils/mistake'
import { cachedReview } from '@/app/memory'
import type { Color } from 'tsshogi'
import { type DetectionPreset } from '@/utils/formationTags'
import { formationMoveTags, formationName } from '@/utils/formation'
import { detectTesuji } from '@/app/tesuji'
import { countMoves, isMainLine, nodeAt, type Tree } from '@/app/tree'
import { Button } from '@/app/ui/Button'
import { useSettings } from '@/appearance/settings'
import { useFlipped } from '@/app/hooks/session'
import { MoveButton, MoveCell, Muted } from './panels.styles'

type MovesPaneProps = {
  sfens: string[]
  moves: string[]
  ply: number
  setCursor: (i: number) => void
  title: string
  canRate?: boolean
  tree?: Tree | null
  onSwitch?: (path: string[]) => void
  onDelete?: (path: string[], size: number) => void
  rating?: RatingProgress | null
  empty?: string
  detectionPreset?: DetectionPreset
  detectionResult?: DetectionPreset & { winner?: Color; checkmate?: boolean; impasse?: boolean }
}

const QUIET_LABELS = ['good', 'excellent', 'best']

const MoveTag = styled('span', {
  base: {
    ml: '1',
    px: '1',
    borderRadius: 'xs',
    bg: 'accent.soft',
    color: 'accent.text',
    fontSize: '2xs',
    fontWeight: 'bold',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    _narrow: { display: 'block', w: 'fit-content', maxW: '100%', m: '{spacing.0.5} 0 0' },
    '@container (max-width: 340px)': { display: 'block', m: '{spacing.0.5} 0 0' },
  },
})

export function MoveRows({ count, cell, listRef, title }: { count: number; cell: (i: number) => ReactNode; listRef?: Ref<HTMLOListElement>; title?: string }) {
  return (
    <styled.ol m="0" p="0" listStyle="none" ref={listRef} title={title}>
      {Array.from({ length: Math.ceil(count / 2) }, (_, r) => (
        <styled.li
          key={r}
          display="grid"
          gridTemplateColumns="34px minmax(0, 1fr) minmax(0, 1fr)"
          alignItems="baseline"
          gap="1"
          py="0.5"
          borderRadius="sm"
          _narrow={{ gridTemplateColumns: '26px minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'start' }}
          css={{
            '&:nth-child(even)': { bg: 'color-mix(in srgb, {colors.fg.default} 4%, transparent)' },
            '@container (max-width: 340px)': { gridTemplateColumns: '26px minmax(0, 1fr)', alignItems: 'start' },
          }}
        >
          <styled.span pl="1.5" color="fg.muted" fontSize="xs">
            {r + 1}.
          </styled.span>
          {[2 * r, 2 * r + 1].map((i) => (i < count ? cell(i) : <styled.span key={i} css={{ '@container (max-width: 340px)': { gridColumn: '2' } }} />))}
        </styled.li>
      ))}
    </styled.ol>
  )
}

export function MovesPane({
  sfens,
  moves,
  ply: cursor,
  setCursor,
  title,
  tree,
  onSwitch,
  onDelete,
  rating,
  canRate = true,
  empty,
  detectionResult,
  detectionPreset,
}: MovesPaneProps) {
  const { t, i18n } = useTranslation()
  const { showTesuji } = useSettings()
  const flipped = useFlipped()
  const listRef = useRef<HTMLOListElement>(null)
  const tesujis = useMemo(() => moves.map((usi, i) => (sfens[i] ? detectTesuji(sfens[i], usi) : null)), [moves, sfens])
  const detectedTags = useMemo(() => formationMoveTags(sfens, moves, detectionPreset, detectionResult).flat(), [moves, sfens, detectionResult, detectionPreset])
  useEffect(() => {
    const row = listRef.current?.querySelector('button[aria-current]') ?? listRef.current?.lastElementChild
    row?.scrollIntoView({ block: 'nearest' })
  }, [cursor, moves.length])
  const [saved, setSaved] = useState<number | null>(null)
  const reviews: (MoveReview | null)[] = moves.map((usi, i) => cachedReview(sfens[i], usi) ?? null)
  const rated = moves.length > 0 && reviews.every(Boolean)
  const labels = rated || reviews.some(Boolean) ? reviews.map((r) => r?.label ?? null) : null
  if (moves.length === 0) return <Muted>{empty ?? t('moves.noMovesYetPlayOn')}</Muted>

  const mistakeId = (i: number) => `${sfens[i]}|${moves[i]}`
  const savedIds = new Set(loadMistakes().map((m) => m.id))
  const allSaved = reviews.every((r, i) => !r || !isBad(r.label) || savedIds.has(mistakeId(i)))
  const saveMine = () => {
    const items = reviews.flatMap((r, i) =>
      r && isBad(r.label)
        ? [
            {
              id: mistakeId(i),
              sfen: sfens[i],
              played: moves[i],
              best: r.best.move,
              bestPv: r.best.pv,
              label: r.label,
              reasons: r.reasons,
              game: title,
              ply: i + 1,
            },
          ]
        : [],
    )
    setSaved(saveMistakes(items))
  }
  const cell = (i: number) => {
    const usi = moves[i]
    const label = labels?.[i]
    const siblings = tree ? (nodeAt(tree, moves.slice(0, i))?.children ?? []).filter((c) => c.usi !== usi) : []
    const tesuji = showTesuji ? tesujis[i] : null
    return (
      <MoveCell key={i} data-in-var={tree && !isMainLine(tree, moves.slice(0, i + 1)) ? '' : undefined}>
        <MoveButton aria-current={cursor === i + 1 ? 'step' : undefined} onClick={() => setCursor(i + 1)}>
          <styled.span display="inline-block" whiteSpace="nowrap">
            <FlipMarks flipped={flipped}>{moveText(sfens[i], usi, moves[i - 1])}</FlipMarks>
          </styled.span>
          {tesuji && (
            <MoveTag title={t('moves.tesuji', { value: i18n.language === 'ja' ? tesuji.ja : `${tesuji.en} (${tesuji.ja})`, value2: tesuji.explain })}>
              {i18n.language === 'ja' ? tesuji.ja : tesuji.en}
            </MoveTag>
          )}
          {detectedTags
            .filter((tag) => tag.ply === i + 1 && tag.annotation !== false && tag.name !== tesuji?.ja && (showTesuji || tag.kind !== 'technique'))
            .map((tag) => (
              <MoveTag key={`${tag.kind}|${tag.name}`} title={tag.name}>
                {formationName(tag.name, i18n.language)}
              </MoveTag>
            ))}
          {label && !QUIET_LABELS.includes(label) && (
            <styled.span
              display="inline-block"
              whiteSpace="nowrap"
              ml="1.5"
              color="light-dark(color-mix(in srgb, var(--label) 55%, #000), var(--label))"
              fontFamily="sans"
              fontWeight="bold"
              fontSize="xs"
              style={{ ['--label' as string]: LABELS[label].color }}
              title={LABELS[label].text}
            >
              {LABELS[label].symbol}
            </styled.span>
          )}
        </MoveButton>
        {siblings.length > 0 && (
          <styled.span display="flex" flexWrap="wrap" alignItems="center" gap="1" m="{spacing.0.5} 0 {spacing.1}">
            <styled.span px="1.5" borderRadius="xs" bg="info.fill" color="gofun" fontFamily="mincho" fontWeight="heavy" fontSize="2xs">
              {t('moves.var')}
            </styled.span>
            {siblings.map((c) => (
              <styled.span key={c.usi} display="inline-flex" borderRadius="md" bg="surface.2" overflow="hidden">
                <styled.button
                  w="auto"
                  p="{spacing.0.5} {spacing.2}"
                  borderRadius="sm"
                  fontFamily="mincho"
                  fontSize="sm"
                  textAlign="left"
                  overflowWrap="anywhere"
                  css={{ '&:hover': { bg: 'surface.2' } }}
                  onClick={() => onSwitch?.([...moves.slice(0, i), c.usi])}
                  title={t('moves.switchToThisLine')}
                >
                  <FlipMarks flipped={flipped}>{moveText(sfens[i], c.usi, moves[i - 1])}</FlipMarks>
                  {c.children.length > 0 && (
                    <styled.small fontFamily="sans" color="fg.muted">
                      {' '}
                      +{countMoves(c)}
                    </styled.small>
                  )}
                </styled.button>
                <styled.button
                  w="auto"
                  p="{spacing.0.5} {spacing.1.5}"
                  borderRadius="sm"
                  color="fg.muted"
                  fontFamily="mincho"
                  fontSize="sm"
                  textAlign="left"
                  overflowWrap="anywhere"
                  _narrow={{ minW: '36px', minH: '32px', fontSize: '18px' }}
                  css={{ '&:hover': { bg: 'surface.2', color: 'danger' } }}
                  onClick={() => onDelete?.([...moves.slice(0, i), c.usi], countMoves(c) + 1)}
                  aria-label={t('moves.deleteThisVariation')}
                  title={t('moves.deleteThisVariation')}
                >
                  ×
                </styled.button>
              </styled.span>
            ))}
          </styled.span>
        )}
      </MoveCell>
    )
  }
  const mistakes = labels?.filter((l) => l !== null && isBad(l)).length ?? 0
  return (
    <div>
      <Wrap gap="2" align="center" mb="2.5">
        {rating && <Muted as="span">{t('moves.ratingMoveOf', { progress: rating.done + 1, movesCount: rating.total })}</Muted>}
        {canRate && rated && !rating && (
          <>
            <Muted as="span">{mistakes ? t('moves.mistakesFound', { count: mistakes }) : t('moves.noMistakesFound')}</Muted>
            {mistakes > 0 && saved === null && !allSaved && (
              <Button size="sm" onClick={saveMine}>
                {t('moves.saveThemAsReviewCards')}
              </Button>
            )}
            {mistakes > 0 && saved === null && allSaved && <Muted as="span">{t('moves.alreadySavedToReview')}</Muted>}
            {saved !== null && <Muted as="span">{t('moves.allSaved', { count: mistakes })}</Muted>}
          </>
        )}
      </Wrap>
      <MoveRows count={moves.length} cell={cell} listRef={listRef} title={t('moves.bookMoveInaccuracyMistakeBlunder')} />
    </div>
  )
}
