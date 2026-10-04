import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LABELS, classify, usiPosition, type MoveReview } from '../../analysis'
import { analyze, engineSupported, scoreToCp } from '../../engine'
import { loadMistakes, saveMistakes } from '../../mistakes'
import { colorSide, moveText, positionOf } from '../../shogi'
import { inBook, strip } from '../lib/book'
import { isBad } from '../lib/mistake'
import { toSente } from '../lib/notation'
import { cachedReview, rememberReview } from '../memory'
import { detectTesuji } from '../tesuji'
import { countMoves, isMainLine, nodeAt, type Tree } from '../tree'
import { Button } from '../ui/Button'

type MovesPaneProps = {
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
}

const QUIET_LABELS = ['good', 'excellent', 'best']

export function MovesPane({ sfens, moves, cursor, setCursor, title, onScore, tree, onSwitch, onDelete, autoRate, canRate = true, empty }: MovesPaneProps) {
  const { t, i18n } = useTranslation()
  const [, setTick] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const tesujis = useMemo(() => moves.map((usi, i) => (sfens[i] ? detectTesuji(sfens[i], usi) : null)), [moves, sfens])
  useEffect(() => {
    const row = listRef.current?.querySelector('button.on') ?? listRef.current?.lastElementChild
    row?.scrollIntoView({ block: 'nearest' })
  }, [cursor, moves.length])
  const [progress, setProgress] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const reviews: (MoveReview | null)[] = moves.map((usi, i) => cachedReview(sfens[i], usi) ?? null)
  const rated = moves.length > 0 && reviews.every(Boolean)
  const labels = rated || reviews.some(Boolean) ? reviews.map((r) => r?.label ?? null) : null
  const rateRef = useRef<() => Promise<void>>(async () => undefined)
  const autoStarted = useRef(false)
  useEffect(() => {
    if (!autoRate || autoStarted.current || rated || progress !== null || moves.length === 0 || !engineSupported()) return
    autoStarted.current = true
    void rateRef.current()
  })
  if (moves.length === 0) return <p className="app-muted">{empty ?? t('moves.noMovesYetPlayOn')}</p>
  const rate = async () => {
    setSaved(null)
    const results = new Map<number, Awaited<ReturnType<typeof analyze>>>()
    const at = async (n: number) => {
      const hit = results.get(n)
      if (hit) return hit
      const result = await analyze(usiPosition(sfens[n]), { multipv: 2, movetime: 400 })
      results.set(n, result)
      const top = result.candidates[0]
      if (top) onScore?.(strip(sfens[n]), scoreToCp(toSente(top.score, colorSide(positionOf(sfens[n]).color))))
      return result
    }
    let previousLoss = 0
    for (let i = 1; i <= moves.length; i++) {
      const usi = moves[i - 1]
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
      setTick((t) => t + 1)
    }
    setProgress(null)
  }
  rateRef.current = rate

  const mistakeId = (i: number) => `${sfens[i]}|${moves[i]}`
  const savedIds = new Set(loadMistakes().map((m) => m.id))
  const allSaved = reviews.every((r, i) => !r || !isBad(r.label) || savedIds.has(mistakeId(i)))
  const saveMine = () => {
    const items = reviews.flatMap((r, i) => (r && isBad(r.label) ? [{ id: mistakeId(i), sfen: sfens[i], played: moves[i], best: r.best.move, bestPv: r.best.pv, label: r.label, reasons: r.reasons, game: title, ply: i + 1 }] : []))
    setSaved(saveMistakes(items))
  }
  const cell = (i: number) => {
    const usi = moves[i]
    const label = labels?.[i]
    const siblings = tree ? (nodeAt(tree, moves.slice(0, i))?.children ?? []).filter((c) => c.usi !== usi) : []
    const tesuji = tesujis[i]
    return (
      <div key={i} className={[siblings.length ? 'has-vars' : '', tree && !isMainLine(tree, moves.slice(0, i + 1)) ? 'in-var' : ''].join(' ')}>
        <button className={cursor === i + 1 ? 'on' : ''} onClick={() => setCursor(i + 1)}>
          {moveText(sfens[i], usi, moves[i - 1])}
          {tesuji && (
            <span className="app-move-tesuji" title={t('moves.tesuji', { value: i18n.language === 'ja' ? tesuji.ja : `${tesuji.en} (${tesuji.ja})`, value2: tesuji.explain })}>
              {i18n.language === 'ja' ? tesuji.ja : tesuji.en}
            </span>
          )}
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
                <button className="app-var-x" onClick={() => onDelete?.([...moves.slice(0, i), c.usi], countMoves(c) + 1)} aria-label={t('moves.deleteThisVariation')} title={t('moves.deleteThisVariation')}>
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
        {engineSupported() && canRate && progress === null && !rated && (
          <Button size="sm" onClick={rate}>
            {labels ? t('moves.rateTheRemainingMoves') : t('moves.rateEveryMove')}
          </Button>
        )}
        {progress !== null && <span className="app-muted">{t('moves.ratingMoveOf', { progress, movesCount: moves.length })}</span>}
        {canRate && rated && progress === null && (
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
      <ol className="app-moves" ref={listRef} title={t('moves.bookMoveInaccuracyMistakeBlunder')}>
        {Array.from({ length: Math.ceil(moves.length / 2) }, (_, r) => (
          <li key={r} className="app-move-row">
            <span className="app-move-no">{r + 1}.</span>
            {[2 * r, 2 * r + 1].map((i) => (i < moves.length ? cell(i) : <span key={i} />))}
          </li>
        ))}
      </ol>
    </div>
  )
}
