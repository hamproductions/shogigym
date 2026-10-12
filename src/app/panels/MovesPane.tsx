import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { LABELS, type MoveReview } from '@/utils/analysis'
import type { RatingProgress } from '@/app/hooks/useAutoRate'
import { loadMistakes, saveMistakes } from '@/utils/mistakes'
import { moveText } from '@/utils/shogi'
import { isBad } from '@/utils/mistake'
import { cachedReview } from '@/app/memory'
import type { Color } from 'tsshogi'
import { type DetectionPreset } from '@/utils/formationTags'
import { formationMoveTags, formationName } from '@/utils/formation'
import { detectTesuji } from '@/app/tesuji'
import { countMoves, isMainLine, nodeAt, type Tree } from '@/app/tree'
import { Button } from '@/app/ui/Button'
import { useSettings } from '@/appearance/settings'

type MovesPaneProps = {
  sfens: string[]
  moves: string[]
  cursor: number
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

export function MoveRows({ count, cell, listRef, title }: { count: number; cell: (i: number) => ReactNode; listRef?: Ref<HTMLOListElement>; title?: string }) {
  return (
    <ol className="app-moves" ref={listRef} title={title}>
      {Array.from({ length: Math.ceil(count / 2) }, (_, r) => (
        <li key={r} className="app-move-row">
          <span className="app-move-no">{r + 1}.</span>
          {[2 * r, 2 * r + 1].map((i) => (i < count ? cell(i) : <span key={i} />))}
        </li>
      ))}
    </ol>
  )
}

export function MovesPane({
  sfens,
  moves,
  cursor,
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
  const listRef = useRef<HTMLOListElement>(null)
  const tesujis = useMemo(() => moves.map((usi, i) => (sfens[i] ? detectTesuji(sfens[i], usi) : null)), [moves, sfens])
  const detectedTags = useMemo(() => formationMoveTags(sfens, moves, detectionPreset, detectionResult).flat(), [moves, sfens, detectionResult, detectionPreset])
  useEffect(() => {
    const row = listRef.current?.querySelector('button.on') ?? listRef.current?.lastElementChild
    row?.scrollIntoView({ block: 'nearest' })
  }, [cursor, moves.length])
  const [saved, setSaved] = useState<number | null>(null)
  const reviews: (MoveReview | null)[] = moves.map((usi, i) => cachedReview(sfens[i], usi) ?? null)
  const rated = moves.length > 0 && reviews.every(Boolean)
  const labels = rated || reviews.some(Boolean) ? reviews.map((r) => r?.label ?? null) : null
  if (moves.length === 0) return <p className="app-muted">{empty ?? t('moves.noMovesYetPlayOn')}</p>

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
      <div key={i} className={[siblings.length ? 'has-vars' : '', tree && !isMainLine(tree, moves.slice(0, i + 1)) ? 'in-var' : ''].join(' ')}>
        <button className={cursor === i + 1 ? 'on' : ''} onClick={() => setCursor(i + 1)}>
          <span className="app-move-notation">{moveText(sfens[i], usi, moves[i - 1])}</span>
          {tesuji && (
            <span
              className="app-move-tesuji"
              title={t('moves.tesuji', { value: i18n.language === 'ja' ? tesuji.ja : `${tesuji.en} (${tesuji.ja})`, value2: tesuji.explain })}
            >
              {i18n.language === 'ja' ? tesuji.ja : tesuji.en}
            </span>
          )}
          {detectedTags
            .filter((tag) => tag.ply === i + 1 && tag.annotation !== false && tag.name !== tesuji?.ja && (showTesuji || tag.kind !== 'technique'))
            .map((tag) => (
              <span key={`${tag.kind}|${tag.name}`} className="app-move-tesuji" title={tag.name}>
                {formationName(tag.name, i18n.language)}
              </span>
            ))}
          {label && !QUIET_LABELS.includes(label) && (
            <span className="app-move-label" style={{ ['--label' as string]: LABELS[label].color }} title={LABELS[label].text}>
              {LABELS[label].symbol}
            </span>
          )}
        </button>
        {siblings.length > 0 && (
          <span className="app-vars">
            <span className="app-vars-tag">{t('moves.var')}</span>
            {siblings.map((c) => (
              <span key={c.usi} className="app-var">
                <button onClick={() => onSwitch?.([...moves.slice(0, i), c.usi])} title={t('moves.switchToThisLine')}>
                  {moveText(sfens[i], c.usi, moves[i - 1])}
                  {c.children.length > 0 && <small> +{countMoves(c)}</small>}
                </button>
                <button
                  className="app-var-x"
                  onClick={() => onDelete?.([...moves.slice(0, i), c.usi], countMoves(c) + 1)}
                  aria-label={t('moves.deleteThisVariation')}
                  title={t('moves.deleteThisVariation')}
                >
                  ×
                </button>
              </span>
            ))}
          </span>
        )}
      </div>
    )
  }
  const mistakes = labels?.filter((l) => l !== null && isBad(l)).length ?? 0
  return (
    <div>
      <div className="app-rate">
        {rating && <span className="app-muted">{t('moves.ratingMoveOf', { progress: rating.done + 1, movesCount: rating.total })}</span>}
        {canRate && rated && !rating && (
          <>
            <span className="app-muted">{mistakes ? t('moves.mistakesFound', { count: mistakes }) : t('moves.noMistakesFound')}</span>
            {mistakes > 0 && saved === null && !allSaved && (
              <Button size="sm" onClick={saveMine}>
                {t('moves.saveThemAsReviewCards')}
              </Button>
            )}
            {mistakes > 0 && saved === null && allSaved && <span className="app-muted">{t('moves.alreadySavedToReview')}</span>}
            {saved !== null && <span className="app-muted">{t('moves.allSaved', { count: mistakes })}</span>}
          </>
        )}
      </div>
      <MoveRows count={moves.length} cell={cell} listRef={listRef} title={t('moves.bookMoveInaccuracyMistakeBlunder')} />
    </div>
  )
}
