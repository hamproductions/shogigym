import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LABELS, classify, usiPosition, type Label, type MoveReview } from '@/utils/analysis'
import { analyze, engineSupported, scoreToCp } from '@/utils/engine'
import { loadMistakes, saveMistakes } from '@/utils/mistakes'
import { colorSide, moveText, positionOf } from '@/utils/shogi'
import { inBook, strip } from '@/utils/book'
import { isBad } from '@/utils/mistake'
import { toSente } from '@/utils/notation'
import { cachedReview, rememberReview } from '@/app/memory'
import type { Color } from 'tsshogi'
import { type DetectionPreset } from '@/utils/formationTags'
import { formationMoveTags, formationName } from '@/utils/formation'
import { detectTesuji } from '@/app/tesuji'
import { countMoves, isMainLine, nodeAt, type Tree } from '@/app/tree'
import { Button } from '@/app/ui/Button'
import { useSettings } from '@/appearance/settings'

interface MovesPaneProps {
  sfens: string[]
  moves: string[]
  cursor: number
  setCursor: (i: number) => void
  title: string
  canRate?: boolean
  onScore?: (key: string, cp: number) => void
  tree?: Tree | null
  onSwitch?: (path: string[]) => void
  onDelete?: (path: string[], size: number) => void
  autoRate?: boolean
  empty?: string
  detectionPreset?: DetectionPreset
  detectionResult?: DetectionPreset & { winner?: Color; checkmate?: boolean; impasse?: boolean }
}

const QUIET_LABELS: Label[] = ['good', 'excellent', 'best']

type Tesuji = NonNullable<ReturnType<typeof detectTesuji>>
type DetectedTag = ReturnType<typeof formationMoveTags>[number][number]

function useRating({ sfens, moves, autoRate, rated, onScore }: Pick<MovesPaneProps, 'sfens' | 'moves' | 'autoRate' | 'onScore'> & { rated: boolean }) {
  const [, setTick] = useState(0)
  const [progress, setProgress] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const rate = async () => {
    setSaved(null)
    const results = new Map<number, Awaited<ReturnType<typeof analyze>>>()
    const at = async (n: number) => {
      const hit = results.get(n)
      if (hit) return hit
      const result = await analyze(usiPosition(sfens[n]), { multipv: 2, movetime: 400 })
      results.set(n, result)
      const [top] = result.candidates
      if (top) onScore?.(strip(sfens[n]), scoreToCp(toSente(top.score, colorSide(positionOf(sfens[n]).color))))
      return result
    }
    let previousLoss = 0
    for (const [index, usi] of moves.entries()) {
      const i = index + 1
      const known = cachedReview(sfens[i - 1], usi)
      if (known) {
        previousLoss = known.loss
        continue
      }
      setProgress(i)
      const before = await at(i - 1)
      const after = await at(i)
      if (before.candidates.length) {
        const review = classify({ sfen: sfens[i - 1], usi, before, after, inBook: inBook(sfens[i - 1], usi), previousLoss })
        previousLoss = review.loss
        rememberReview(sfens[i - 1], usi, review)
      }
      setTick((count) => count + 1)
    }
    setProgress(null)
  }
  const autoStarted = useRef(false)
  useEffect(() => {
    if (!autoRate || autoStarted.current || rated || progress !== null || moves.length === 0 || !engineSupported()) return
    autoStarted.current = true
    void rate()
  })
  return { progress, saved, setSaved, rate }
}

function RatedSummary({ mistakes, saved, allSaved, onSave }: { mistakes: number; saved: number | null; allSaved: boolean; onSave: () => void }) {
  const { t } = useTranslation()
  return (
    <>
      <span className="app-muted">{mistakes ? t('moves.mistakesFound', { count: mistakes }) : t('moves.noMistakesFound')}</span>
      {mistakes > 0 && saved === null && !allSaved && (
        <Button size="sm" onClick={onSave}>
          {t('moves.saveThemAsReviewCards')}
        </Button>
      )}
      {mistakes > 0 && saved === null && allSaved && <span className="app-muted">{t('moves.alreadySavedToReview')}</span>}
      {saved !== null && <span className="app-muted">{t('moves.allSaved', { count: mistakes })}</span>}
    </>
  )
}

function RatingBar({
  canRate,
  progress,
  rated,
  partlyRated,
  mistakes,
  saved,
  allSaved,
  movesCount,
  onRate,
  onSave,
}: {
  canRate: boolean
  progress: number | null
  rated: boolean
  partlyRated: boolean
  mistakes: number
  saved: number | null
  allSaved: boolean
  movesCount: number
  onRate: () => void
  onSave: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="app-rate">
      {engineSupported() && canRate && progress === null && !rated && (
        <Button size="sm" onClick={onRate}>
          {partlyRated ? t('moves.rateTheRemainingMoves') : t('moves.rateEveryMove')}
        </Button>
      )}
      {progress !== null && <span className="app-muted">{t('moves.ratingMoveOf', { progress, movesCount })}</span>}
      {canRate && rated && progress === null && <RatedSummary mistakes={mistakes} saved={saved} allSaved={allSaved} onSave={onSave} />}
    </div>
  )
}

interface MoveCellProps {
  index: number
  moves: string[]
  sfens: string[]
  cursor: number
  label: Label | null | undefined
  tree: Tree | null | undefined
  tesuji: Tesuji | null
  tags: DetectedTag[]
  showTesuji: boolean
  onSelect: (cursor: number) => void
  onSwitch?: (path: string[]) => void
  onDelete?: (path: string[], size: number) => void
}

function MoveCell({ index: i, moves, sfens, cursor, label, tree, tesuji, tags, showTesuji, onSelect, onSwitch, onDelete }: MoveCellProps) {
  const { t, i18n } = useTranslation()
  const usi = moves[i]
  const siblings = tree ? (nodeAt(tree, moves.slice(0, i))?.children ?? []).filter((c) => c.usi !== usi) : []
  const ja = i18n.language === 'ja'
  return (
    <div className={[siblings.length ? 'has-vars' : '', tree && !isMainLine(tree, moves.slice(0, i + 1)) ? 'in-var' : ''].join(' ')}>
      <button className={cursor === i + 1 ? 'on' : ''} onClick={() => onSelect(i + 1)}>
        <span className="app-move-notation">{moveText(sfens[i], usi, moves[i - 1])}</span>
        {tesuji && (
          <span className="app-move-tesuji" title={t('moves.tesuji', { value: ja ? tesuji.ja : `${tesuji.en} (${tesuji.ja})`, value2: tesuji.explain })}>
            {ja ? tesuji.ja : tesuji.en}
          </span>
        )}
        {tags
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

export function MovesPane({
  sfens,
  moves,
  cursor,
  setCursor,
  title,
  onScore,
  tree,
  onSwitch,
  onDelete,
  autoRate,
  canRate = true,
  empty,
  detectionResult,
  detectionPreset,
}: MovesPaneProps) {
  const { t } = useTranslation()
  const { showTesuji } = useSettings()
  const listRef = useRef<HTMLOListElement>(null)
  const tesujis = useMemo(() => moves.map((usi, i) => (sfens[i] ? detectTesuji(sfens[i], usi) : null)), [moves, sfens])
  const detectedTags = useMemo(() => formationMoveTags(sfens, moves, detectionPreset, detectionResult).flat(), [moves, sfens, detectionResult, detectionPreset])
  useEffect(() => {
    if (moves.length === 0) return
    const row = (cursor > 0 ? listRef.current?.querySelector('button.on') : null) ?? listRef.current?.lastElementChild
    row?.scrollIntoView({ block: 'nearest' })
  }, [cursor, moves.length])
  const reviews: (MoveReview | null)[] = moves.map((usi, i) => cachedReview(sfens[i], usi) ?? null)
  const rated = moves.length > 0 && reviews.every(Boolean)
  const labels = rated || reviews.some(Boolean) ? reviews.map((r) => r?.label ?? null) : null
  const { progress, saved, setSaved, rate } = useRating({ sfens, moves, autoRate, rated, onScore })
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
  const cell = (i: number) =>
    i < moves.length ? (
      <MoveCell
        key={mistakeId(i)}
        index={i}
        moves={moves}
        sfens={sfens}
        cursor={cursor}
        label={labels?.[i]}
        tree={tree}
        tesuji={showTesuji ? tesujis[i] : null}
        tags={detectedTags}
        showTesuji={showTesuji}
        onSelect={setCursor}
        onSwitch={onSwitch}
        onDelete={onDelete}
      />
    ) : (
      <span key={i} />
    )
  const mistakes = labels?.filter((l) => l !== null && isBad(l)).length ?? 0
  return (
    <div>
      <RatingBar
        canRate={canRate}
        progress={progress}
        rated={rated}
        partlyRated={!!labels}
        mistakes={mistakes}
        saved={saved}
        allSaved={allSaved}
        movesCount={moves.length}
        onRate={rate}
        onSave={saveMine}
      />
      <ol className="app-moves" ref={listRef} title={t('moves.bookMoveInaccuracyMistakeBlunder')}>
        {Array.from({ length: Math.ceil(moves.length / 2) }, (_, r) => (
          <li key={r} className="app-move-row">
            <span className="app-move-no">{r + 1}.</span>
            {[2 * r, 2 * r + 1].map(cell)}
          </li>
        ))}
      </ol>
    </div>
  )
}
