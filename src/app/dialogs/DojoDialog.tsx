import './dojo.css'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { learningSnapshot } from '@/app/learning'
import { Button } from '@/app/ui/Button'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { loadActivity, recentDays } from '@/utils/activity'
import { LABELS } from '@/utils/analysis'
import { isWeak } from '@/utils/mistake'
import { moveText } from '@/utils/shogi'
import { journey, todaysPlan, WEAKNESS_ROUTE, WEAKNESSES, type Phase, type Profile, type Route, type Weakness } from '@/utils/learning'

type DojoProps = { onClose: () => void; onRoute: (route: Route) => void }

/** Above this a phase is not called a weakness. */
const SOLID = 75

const AXES = ['opening', 'middle', 'endgame', 'tactics', 'conversion', 'tenacity'] as const
type Axis = (typeof AXES)[number]

const drillLabel = (route: Route) =>
  route.kind === 'tsume' ? 'tsume' : route.kind === 'tesuji' ? 'tesuji' : route.kind === 'drill' && route.queue === 'new' ? 'opening' : 'mistakes'

function axisValue(profile: Profile, axis: Axis) {
  return axis === 'opening' || axis === 'middle' || axis === 'endgame' ? profile.phases[axis].score : profile.traits[axis]
}

function Radar({ profile, label }: { profile: Profile; label: (axis: Axis) => string }) {
  const size = 240
  const c = size / 2
  const r = 78
  const point = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v] as const
  }
  const ring = (v: number) => AXES.map((_, i) => point(i, v).join(',')).join(' ')
  const values = AXES.map((axis) => axisValue(profile, axis))
  const shape = values.map((v, i) => point(i, (v ?? 0) / 100).join(',')).join(' ')
  return (
    <svg className="app-radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={AXES.map((a, i) => `${label(a)} ${values[i] ?? '–'}`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <polygon key={v} points={ring(v)} className="ring" />
      ))}
      {AXES.map((_, i) => (
        <line key={i} x1={c} y1={c} x2={point(i, 1)[0]} y2={point(i, 1)[1]} className="spoke" />
      ))}
      <polygon points={shape} className="shape" />
      {values.map((v, i) => {
        const [x, y] = point(i, (v ?? 0) / 100)
        const [lx, ly] = point(i, 1.3)
        return (
          <g key={AXES[i]}>
            {v !== null && <circle cx={x} cy={y} r={3} className="dot" />}
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className={v === null ? 'axis none' : 'axis'}>
              {label(AXES[i])}
            </text>
            <text x={lx} y={ly + 12} textAnchor="middle" dominantBaseline="middle" className="axis-value">
              {v ?? '–'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function DojoDialog({ onClose, onRoute }: DojoProps) {
  const { t } = useTranslation()
  const { snapshot, profile, days } = useMemo(() => ({ ...learningSnapshot(), days: recentDays(loadActivity()) }), [])
  const plan = todaysPlan(snapshot, profile)
  const steps = journey(snapshot)
  const next = steps.find((s) => !s.done)
  const go = (route: Route) => {
    onClose()
    onRoute(route)
  }
  const peak = Math.max(1, ...days.map((d) => d.total))
  const solid = profile.movesRated - Object.entries(profile.labelCounts).reduce((n, [label, k]) => n + (isWeak(label as keyof typeof LABELS) ? (k ?? 0) : 0), 0)
  const rated = profile.movesRated >= 6
  const phaseName = (p: Phase) => t(`dojo.phase.${p}`)
  const weakRows = profile.weaknesses.filter((w) => WEAKNESSES.includes(w.tag))
  const planTitle = (id: string, count?: number, detail?: string, focus?: Weakness) =>
    t(`dojo.plan.${id}.title`, { count, detail, focus: focus ? t(`dojo.weak.${focus}.name`) : '' })

  return (
    <Dialog label={t('dojo.title')} className="app-dojo" onBackdrop={onClose}>
      <DialogHeader title={t('dojo.title')} closeLabel={t('viewer.close')} onClose={onClose} />
      <div className="app-dojo-streak" aria-label={t('dojo.streakLabel', { count: snapshot.streak })}>
        <strong>{t('dojo.streak', { count: snapshot.streak })}</strong>
        <span className="app-muted">
          {snapshot.practisedToday ? t('dojo.practisedToday') : snapshot.streak > 0 ? t('dojo.keepStreak') : t('dojo.startStreak')}
        </span>
        <div className="app-dojo-days" aria-hidden="true">
          {days.map((d) => (
            <i key={d.key} className={d.total ? 'on' : ''} style={{ height: `${d.total ? 6 + (d.total / peak) * 16 : 4}px` }} title={`${d.key}: ${d.total}`} />
          ))}
        </div>
      </div>

      {next && (
        <section className="app-dojo-next">
          <span className="app-dojo-kicker">{t('dojo.nextStep', { done: steps.filter((s) => s.done).length, total: steps.length })}</span>
          <strong>{t(`dojo.journey.${next.id}.title`)}</strong>
          <p>{t(`dojo.journey.${next.id}.why`)}</p>
          <Button variant="primary" onClick={() => go(next.route)}>
            {t('dojo.go')}
          </Button>
        </section>
      )}

      <section>
        <h3>{t('dojo.today')}</h3>
        <ol className="app-dojo-plan">
          {plan.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{planTitle(item.id, item.count, item.detail, item.focus)}</strong>
                <span className="app-muted">{t(`dojo.plan.${item.id}.why`, { count: item.count })}</span>
              </div>
              <span className="app-dojo-min">{t('dojo.minutes', { count: item.minutes })}</span>
              <Button size="sm" onClick={() => go(item.route)}>
                {t('dojo.start')}
              </Button>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>{t('dojo.skills')}</h3>
        {rated ? (
          <div className="app-dojo-skills">
            <Radar profile={profile} label={(axis) => t(`dojo.axis.${axis}`)} />
            <div className="app-dojo-read">
              <p>{t('dojo.summary', { games: profile.games, moves: profile.movesRated, solid, percent: Math.round((solid / profile.movesRated) * 100) })}</p>
              {profile.strongest && profile.weakest && profile.strongest !== profile.weakest && (
                <>
                  <p className="app-dojo-good">
                    {t('dojo.strongest', { phase: phaseName(profile.strongest), score: profile.phases[profile.strongest].score })}
                  </p>
                  <p className="app-dojo-focus">
                    {t(`dojo.${(profile.phases[profile.weakest].score ?? 0) >= SOLID ? 'solid' : 'advice'}.${profile.weakest}`, {
                      phase: phaseName(profile.weakest),
                      score: profile.phases[profile.weakest].score,
                    })}
                  </p>
                  <Button
                    size="sm"
                    onClick={() =>
                      go(
                        profile.weakest === 'endgame'
                          ? { kind: 'tsume', length: 3 }
                          : profile.weakest === 'opening'
                            ? { kind: 'drill', queue: 'new' }
                            : { kind: 'drill', queue: 'mistakes' },
                      )
                    }
                  >
                    {t('dojo.trainWeakest', { phase: phaseName(profile.weakest) })}
                  </Button>
                </>
              )}
              <p className="app-muted">{t('dojo.scaleNote')}</p>
            </div>
          </div>
        ) : (
          <div className="app-dojo-empty">
            <p>{t('dojo.noProfile', { count: Math.max(0, 6 - profile.movesRated) })}</p>
            <div className="app-actions">
              <Button size="sm" variant="primary" onClick={() => go({ kind: 'spar' })}>
                {t('dojo.playGame')}
              </Button>
              <Button size="sm" onClick={() => go({ kind: 'analyze' })}>
                {t('dojo.importGame')}
              </Button>
            </div>
          </div>
        )}
      </section>

      {weakRows.length > 0 && (
        <section>
          <h3>{t('dojo.slips')}</h3>
          <ul className="app-dojo-weak">
            {weakRows.map((w) => (
              <li key={w.tag}>
                <div>
                  <strong>{t(`dojo.weak.${w.tag}.name`)}</strong>
                  <span className="app-dojo-count">×{w.count}</span>
                  <p>{t(`dojo.weak.${w.tag}.fix`)}</p>
                  {w.example && (
                    <span className="app-muted">{t('dojo.example', { move: moveText(w.example.sfen, w.example.played), ply: w.example.ply })}</span>
                  )}
                </div>
                <Button size="sm" onClick={() => go(WEAKNESS_ROUTE[w.tag])}>
                  {t(`dojo.drill.${drillLabel(WEAKNESS_ROUTE[w.tag])}`)}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.highlights.length > 0 && (
        <section>
          <h3>{t('dojo.praise')}</h3>
          <p className="app-muted">{t('dojo.praiseIntro')}</p>
          <ul className="app-dojo-praise">
            {profile.highlights.map((h) => (
              <li key={`${h.gameId}|${h.ply}`}>
                <span className="app-badge" style={{ ['--label' as string]: LABELS[h.review.label].color }}>
                  {LABELS[h.review.label].symbol}
                </span>
                <strong>{moveText(h.sfen, h.usi)}</strong>
                <span className="app-muted">{t('dojo.praiseMove', { ply: h.ply, label: LABELS[h.review.label].text })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>{t('dojo.path')}</h3>
        <ol className="app-dojo-path">
          {steps.map((s) => (
            <li key={s.id} className={s.done ? 'done' : s === next ? 'now' : ''}>
              <span aria-hidden="true">{s.done ? '✓' : ''}</span>
              {t(`dojo.journey.${s.id}.title`)}
            </li>
          ))}
        </ol>
      </section>
      <p className="app-muted">{t('dojo.privacy')}</p>
    </Dialog>
  )
}
