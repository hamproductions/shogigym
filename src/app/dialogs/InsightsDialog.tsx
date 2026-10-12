import './insights.css'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PieceType } from 'tsshogi'
import { gameRole, loadGames } from '@/app/games'
import { useBatchRate } from '@/app/hooks/useBatchRate'
import { cachedReview, useReviewVersion } from '@/app/memory'
import { PIECE_INFO } from '@/app/pieces'
import { Button } from '@/app/ui/Button'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { engineSupported } from '@/utils/engine'
import { buildInsights, type InsightGame, type Recurring, type Skill, type Suggestion } from '@/utils/insights'
import { SETUPS } from '@/utils/model'
import { PIECE_CHAR } from '@/utils/shogi'
import { MistakeDetail } from '@/app/ui/MistakeDetail'
import type { Mistake } from '@/utils/mistakes'
import { FIX_ROUTE, LESSONS, type FixRoute } from './ReportDialog'

const AXES: Skill['key'][] = ['opening', 'middle', 'endgame', 'convert', 'tenacity', 'punish', 'steady']

function Radar({ skills, label }: { skills: Skill[]; label: (key: Skill['key']) => string }) {
  const size = 260
  const c = size / 2
  const r = 88
  const point = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    return [c + Math.cos(a) * r * (v / 100), c + Math.sin(a) * r * (v / 100)]
  }
  const values = AXES.map((key) => skills.find((s) => s.key === key)?.value ?? 0)
  const shape = values.map((v, i) => point(i, v).join(',')).join(' ')
  return (
    <svg className="app-radar" viewBox={`-80 -4 ${size + 160} ${size + 8}`} role="img" aria-label={label('opening')}>
      {[25, 50, 75, 100].map((ring) => (
        <polygon key={ring} className="ring" points={AXES.map((_, i) => point(i, ring).join(',')).join(' ')} />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = point(i, 100)
        return <line key={i} className="spoke" x1={c} y1={c} x2={x} y2={y} />
      })}
      <polygon className="shape" points={shape} />
      {values.map((v, i) => {
        const [x, y] = point(i, v)
        const known = skills.find((s) => s.key === AXES[i])?.value !== null
        return <circle key={i} className={known ? 'dot' : 'dot unknown'} cx={x} cy={y} r={3.5} />
      })}
      {AXES.map((key, i) => {
        const [x, y] = point(i, 122)
        return (
          <text key={key} x={x} y={y} textAnchor={x < c - 4 ? 'end' : x > c + 4 ? 'start' : 'middle'} dominantBaseline="middle">
            {label(key)}
          </text>
        )
      })}
    </svg>
  )
}

function Trend({ points }: { points: (number | null)[] }) {
  const known = points.map((v, i) => (v === null ? null : { v, i })).filter((p): p is { v: number; i: number } => p !== null)
  if (known.length < 2) return null
  const w = 300
  const h = 56
  const x = (i: number) => (i / Math.max(points.length - 1, 1)) * (w - 8) + 4
  const lo = Math.max(0, Math.min(...known.map((p) => p.v)) - 5)
  const hi = Math.min(100, Math.max(...known.map((p) => p.v)) + 5)
  const y = (v: number) => h - 4 - ((v - lo) / Math.max(hi - lo, 1)) * (h - 8)
  return (
    <svg className="app-trend" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img">
      <polyline points={known.map((p) => `${x(p.i)},${y(p.v)}`).join(' ')} />
      {known.map((p) => (
        <circle key={p.i} cx={x(p.i)} cy={y(p.v)} r={2.8} />
      ))}
    </svg>
  )
}

type Props = {
  onClose: () => void
  onPractice: (items: Mistake[]) => void
  onRoute: (route: FixRoute) => void
  onLesson: (topicId: string) => void
}

export function InsightsDialog({ onClose, onPractice, onRoute, onLesson }: Props) {
  const { t, i18n } = useTranslation()
  const ja = i18n.language === 'ja'
  const [stored] = useState(() => loadGames())
  const version = useReviewVersion()
  const included: InsightGame[] = useMemo(
    () =>
      stored
        .filter((g) => gameRole(g) === 'mine' && g.moves.length >= 4)
        .map((g) => ({ id: g.id, title: g.title, start: g.start, moves: g.moves, side: g.userSide, savedAt: g.savedAt, result: g.result })),
    [stored],
  )
  const progress = useBatchRate(included, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const insights = useMemo(() => buildInsights(included, cachedReview), [included, version])
  const go = (fn: () => void) => () => {
    onClose()
    fn()
  }
  const pieceName = (type: string) => (ja ? PIECE_CHAR[type as PieceType] : PIECE_INFO[type as PieceType].en)
  const practiceItems = (): Mistake[] =>
    insights.recurring.map((r) => ({
      id: `trend-${r.sfen.split(' ')[0]}-${r.best}`,
      sfen: r.sfen,
      played: r.example.usi,
      best: r.best,
      bestPv: r.example.review.best.pv,
      label: r.example.review.label,
      reasons: r.example.review.reasons,
      game: '',
      ply: r.ply,
    }))
  const actions = (s: Suggestion) => {
    const buttons: { key: string; label: string; run: () => void }[] = []
    const lesson = (id: string) => {
      const topic = SETUPS.find((item) => item.id === `lesson-${id}`)
      if (topic) buttons.push({ key: id, label: t('report.lesson', { title: ja ? topic.ja : topic.name }), run: go(() => onLesson(id)) })
    }
    const route = (r: FixRoute) => buttons.push({ key: r, label: t(`report.fixWith.${r}`), run: go(() => onRoute(r)) })
    if (s.kind === 'recurring')
      buttons.push({ key: 'practice', label: t('insights.practice', { count: insights.recurring.length }), run: go(() => onPractice(practiceItems())) })
    if (s.kind === 'phase') s.phase === 'opening' ? lesson('basics-opening') : s.phase === 'middle' ? route('tesuji') : route('tsume')
    if (s.kind === 'weakness' && s.tag) {
      LESSONS[s.tag].forEach(lesson)
      const r = FIX_ROUTE[s.tag]
      if (r) route(r)
    }
    if (s.kind === 'convert') lesson('endgame-yose')
    if (s.kind === 'tenacity') lesson('basics-attack-defense')
    if (s.kind === 'punish') route('tesuji')
    if (s.kind === 'steady') lesson('basics-opening')
    return buttons
  }
  const suggestionText = (s: Suggestion) => {
    const params: Record<string, string | number> = { ...s.params }
    if (s.phase) params.phase = t(`insights.phaseName.${s.phase}`)
    if (s.tag) params.name = t(`report.weak.${s.tag}.name`)
    if (s.kind === 'piece') params.piece = pieceName(String(s.params.piece))
    return t(`insights.suggest.${s.kind}`, params)
  }
  const recurringText = (r: Recurring) => t('insights.recurringItem', { count: r.count, games: r.games })
  return (
    <Dialog label={t('insights.title')} className="app-insights" onBackdrop={onClose}>
      <DialogHeader title={t('insights.title')} closeLabel={t('viewer.close')} onClose={onClose} />
      <p className="app-muted">
        {t('insights.includedOf', { count: included.length, total: stored.length })} · {t('insights.scopeHint')}
      </p>

      {progress && (
        <p className="app-muted" role="status">
          {t('insights.rating', progress)}
        </p>
      )}
      {!engineSupported() && <p className="app-muted">{t('insights.noEngine')}</p>}

      {included.length === 0 ? (
        stored.length > 0 && <p>{t('insights.none')}</p>
      ) : (
        <>
          <section>
            <h3>
              {t('insights.skills')} <span className="app-muted">{t('insights.coverage', insights.coverage)}</span>
            </h3>
            <div className="app-insight-skills">
              <Radar skills={insights.skills} label={(key) => t(`insights.skill.${key}`)} />
              <ul>
                {insights.skills.map((s) => (
                  <li key={s.key} title={s.key in { convert: 1, tenacity: 1, punish: 1, steady: 1 } ? t(`insights.skillHint.${s.key}`) : undefined}>
                    <span className="app-skill-name">{t(`insights.skill.${s.key}`)}</span>
                    <b className="app-skill-value">{s.value ?? '–'}</b>
                    <i className="app-skill-bar">
                      <u style={{ width: `${s.value ?? 0}%` }} />
                    </i>
                    <small className="app-skill-detail">
                      {s.value === null
                        ? t('insights.few')
                        : s.avgLoss !== undefined
                          ? t('report.phaseDetail', { loss: s.avgLoss, percent: s.mistakeRate })
                          : t('insights.nOfN', { hits: s.hits, total: s.total })}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
            <h4>{t('insights.trend')}</h4>
            <Trend points={insights.games.map((g) => g.accuracy)} />
            <p className="app-muted">{t('insights.trendHint')}</p>
          </section>

          <section>
            <h3>{t('insights.recurring')}</h3>
            {insights.recurring.length === 0 ? (
              <p className="app-muted">{t('insights.recurringEmpty')}</p>
            ) : (
              <>
                <ul className="app-report-list">
                  {insights.recurring.map((r) => (
                    <li key={r.sfen}>
                      <span className="app-badge" style={{ ['--label' as string]: 'var(--accent)' }}>
                        {r.count}×
                      </span>
                      <div>
                        <strong>{recurringText(r)}</strong>
                        <MistakeDetail
                          showPlayed
                          sfen={r.sfen}
                          played={r.example.usi}
                          best={r.best}
                          tag={r.tag}
                          loss={r.example.review.loss}
                          reason={r.example.review.reasons[0]}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="primary" onClick={go(() => onPractice(practiceItems()))}>
                  {t('insights.practice', { count: insights.recurring.length })}
                </Button>
              </>
            )}
            {insights.pieces.length > 0 && (
              <>
                <h4>{t('insights.pieces')}</h4>
                <ul className="app-insight-pieces">
                  {insights.pieces.slice(0, 3).map((p) => (
                    <li key={p.piece}>{t('insights.pieceItem', { piece: pieceName(p.piece), mistakes: p.mistakes, moves: p.moves, percent: p.rate })}</li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section>
            <h3>{t('insights.fix')}</h3>
            {insights.suggestions.length === 0 ? (
              <p className="app-muted">{t('insights.fixEmpty')}</p>
            ) : (
              <ol className="app-insight-fix">
                {insights.suggestions.slice(0, 6).map((s) => (
                  <li key={s.kind}>
                    <p>{suggestionText(s)}</p>
                    <div className="app-actions">
                      {actions(s).map((a) => (
                        <Button key={a.key} size="sm" onClick={a.run}>
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </Dialog>
  )
}
