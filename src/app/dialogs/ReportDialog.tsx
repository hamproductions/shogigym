import './report.css'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cachedReview, rememberReview, useReviewVersion } from '@/app/memory'
import { Button } from '@/app/ui/Button'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { LABELS, reviewMove } from '@/utils/analysis'
import { inBook } from '@/utils/book'
import { engineSupported } from '@/utils/engine'
import { buildReport, PHASES, playerMoves, type GameLike, type Weakness } from '@/utils/learning'
import { moveText, type Side } from '@/utils/shogi'

export type FixRoute = 'tsume' | 'tesuji' | 'lesson'
const FIX_ROUTE: Partial<Record<Weakness, FixRoute>> = { missedMate: 'tsume', allowedTactic: 'tesuji', openingSlip: 'lesson' }
const MIN_MOVES = 4

type ReportProps = { game: GameLike; userSide: Side; onShow: (ply: number) => void; onRoute: (route: FixRoute) => void; onClose: () => void }

/** Rate this player's unrated moves, newest data first; stops when the dialog closes. */
function useRatings(game: GameLike, side: Side) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const moves = game.moves.join(' ')
  useEffect(() => {
    const todo = playerMoves({ start: game.start, moves: moves ? moves.split(' ') : [] }, side).filter((m) => !cachedReview(m.sfen, m.usi))
    if (!todo.length || !engineSupported()) return
    let cancelled = false
    void (async () => {
      for (let i = 0; i < todo.length && !cancelled; i++) {
        setProgress({ done: i, total: todo.length })
        try {
          rememberReview(todo[i].sfen, todo[i].usi, await reviewMove(todo[i].sfen, todo[i].usi, { movetime: 400, inBook: inBook(todo[i].sfen, todo[i].usi) }))
        } catch {
          break
        }
      }
      if (!cancelled) setProgress(null)
    })()
    return () => {
      cancelled = true
    }
  }, [game.start, moves, side])
  return progress
}

export function ReportDialog({ game, userSide, onShow, onRoute, onClose }: ReportProps) {
  const { t } = useTranslation()
  const [side, setSide] = useState<Side>(userSide)
  const version = useReviewVersion()
  const progress = useRatings(game, side)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildReport(game, side, cachedReview), [game, side, version])
  const top = report.patterns.find((p) => p.tag !== 'other') ?? report.patterns[0]
  const route = top && FIX_ROUTE[top.tag]
  const go = (fn: () => void) => () => {
    onClose()
    fn()
  }
  const enough = report.total >= MIN_MOVES

  return (
    <Dialog label={t('report.title')} className="app-report" onBackdrop={onClose}>
      <DialogHeader title={t('report.title')} closeLabel={t('viewer.close')} onClose={onClose} />
      <div className="app-report-side">
        <span className="app-muted">{t('report.sideLabel')}</span>
        {(['sente', 'gote'] as const).map((s) => (
          <Button key={s} size="sm" on={side === s} onClick={() => setSide(s)}>
            {t(`report.${s}`)}
          </Button>
        ))}
      </div>

      {!enough ? (
        <p>{t('report.tooShort')}</p>
      ) : (
        <>
          {progress && (
            <p className="app-muted" role="status">
              {t('report.rating', progress)}
            </p>
          )}
          {!engineSupported() && report.rated < report.total && <p className="app-muted">{t('report.noEngine')}</p>}
          {report.rated === 0 ? (
            !progress && <p>{t('report.noRated')}</p>
          ) : (
            <>
              <section>
                <p>
                  <strong>{t('report.summary', { total: report.rated, good: report.good, percent: Math.round((report.good / report.rated) * 100) })}</strong>{' '}
                  {report.accuracy !== null && <span className="app-muted">{t('report.accuracy', { score: report.accuracy })}</span>}
                </p>
                <div className="app-report-phases" aria-label={t('report.phases')}>
                  {PHASES.map((p) => (
                    <div key={p}>
                      <span>{t(`report.phase.${p}`)}</span>
                      <i>
                        <b style={{ width: `${report.phases[p].score ?? 0}%` }} />
                      </i>
                      <span className="app-muted">{report.phases[p].score ?? t('report.few')}</span>
                    </div>
                  ))}
                </div>
              </section>

              {top && (
                <section className="app-report-pattern">
                  <h3>{t('report.pattern')}</h3>
                  <strong>{t('report.patternCount', { name: t(`report.weak.${top.tag}.name`), count: top.count })}</strong>
                  <p>{t(`report.weak.${top.tag}.fix`)}</p>
                  {route && (
                    <Button size="sm" variant="primary" onClick={go(() => onRoute(route))}>
                      {t(`report.fixWith.${route}`)}
                    </Button>
                  )}
                </section>
              )}

              <section>
                <h3>{t('report.problems')}</h3>
                {report.problems.length === 0 ? (
                  !progress && <p>{t('report.clean')}</p>
                ) : (
                  <ul className="app-report-list">
                    {report.problems.slice(0, 6).map((p) => (
                      <li key={p.ply}>
                        <span className="app-badge" style={{ ['--label' as string]: LABELS[p.review.label].color }}>
                          {LABELS[p.review.label].symbol}
                        </span>
                        <div>
                          <strong>{t('report.played', { ply: p.ply, played: moveText(p.sfen, p.usi), loss: Math.round(p.review.loss * 100) })}</strong>
                          {p.review.best.move !== p.usi && <span>{t('report.better', { move: moveText(p.sfen, p.review.best.move) })}</span>}
                          {p.review.reasons[0] && <span className="app-muted">{p.review.reasons[0]}</span>}
                          <em>{t(`report.weak.${p.tag}.name`)}</em>
                        </div>
                        <Button size="sm" onClick={go(() => onShow(p.ply))}>
                          {t('report.show')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {report.praise.length > 0 && (
                <section>
                  <h3>{t('report.praise')}</h3>
                  <ul className="app-report-praise">
                    {report.praise.map((m) => (
                      <li key={m.ply}>
                        <span className="app-badge" style={{ ['--label' as string]: LABELS[m.review.label].color }}>
                          {LABELS[m.review.label].symbol}
                        </span>
                        <strong>{moveText(m.sfen, m.usi)}</strong>
                        <span className="app-muted">{t('report.praiseMove', { ply: m.ply, label: LABELS[m.review.label].text })}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </>
      )}
      <p className="app-muted">{t('report.privacy')}</p>
    </Dialog>
  )
}
