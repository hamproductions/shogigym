import './flow.css'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applyUsi, moveText } from '../../shogi'
import type { Lane } from '../lib/lanes'
import { lossClass } from '../lib/score'
import { loadStats, loadStatsMeta, type PositionStats, type StatsMeta } from '../lib/stats'
import '../../styles/stats.css'

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

function OpeningStats({ sfen, onPreview, onHover }: { sfen: string; onPreview: (moves: string[], title: string) => void; onHover: (usi: string | null) => void }) {
  const { t } = useTranslation()
  const { loading, stats, meta } = useOpeningStats(sfen)
  if (loading) return null
  if (!stats) return <p className="app-stats-empty app-muted">{t('flow.statsNone', { ply: meta?.maxPly ?? 30 })}</p>
  const gote = sfen.split(' ')[1] === 'w'
  const book = stats.book
  const bookText = book ? moveText(sfen, book.usi) : ''
  const bookEval = book ? t('flow.statsEval', { side: (book.eval >= 0) !== gote ? '☗' : '☖', cp: Math.abs(book.eval) }) : ''
  return (
    <section className="app-stats" aria-label={t('flow.statsTitle')}>
      <header className="app-stats-head">
        <h3>{t('flow.statsTitle')}</h3>
        <span className="app-muted">{t('flow.statsSource', { games: stats.games.toLocaleString(), source: sourceLabel(meta) })}</span>
      </header>
      <div className="app-stats-cols app-muted" aria-hidden="true">
        <span>{t('flow.statsMove')}</span>
        <span>{t('flow.statsPlayed')}</span>
        <span>{t('flow.statsResult')}</span>
      </div>
      <ul className="app-stats-list">
        {stats.moves.map((m) => {
          const text = moveText(sfen, m.usi)
          const s = pct(m.senteWins, m.games)
          const g = pct(m.goteWins, m.games)
          const isBook = book?.usi === m.usi
          return (
            <li key={m.usi}>
              <button className="app-stats-row" onClick={() => onPreview([m.usi], text)} onMouseEnter={() => onHover(m.usi)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(m.usi)} onBlur={() => onHover(null)} title={t('flow.statsRowTitle', { move: text, games: m.games.toLocaleString(), sente: s, gote: g, draw: Math.max(0, 100 - s - g) })}>
                <span className="app-stats-move">
                  {text}
                  {isBook && <em className="app-stats-book">{t('flow.statsBookMark')}</em>}
                </span>
                <span className="app-stats-freq">
                  <span className="app-stats-bar">
                    <i style={{ width: `${(m.games / stats.games) * 100}%` }} />
                  </span>
                  <span className="app-stats-num">
                    {pct(m.games, stats.games)}% <small>{t('flow.statsGames', { count: m.games, n: m.games.toLocaleString() })}</small>
                  </span>
                </span>
                <span className={`app-stats-win${m.games < THIN_SAMPLE ? ' thin' : ''}`}>
                  <span className="app-stats-split">
                    <i className="b" style={{ width: `${s}%` }} />
                    <i className="w" style={{ width: `${g}%` }} />
                  </span>
                  <span className="app-stats-num">
                    <b className="b">☗{s}%</b> <b className="w">☖{g}%</b>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="app-stats-key app-muted">{t('flow.statsKey', { min: THIN_SAMPLE })}</p>
      {book && (
        <p className="app-stats-engine">
          {t('flow.statsBook', { move: bookText, eval: bookEval })}
          {!stats.moves.some((m) => m.usi === book.usi) && <span className="app-muted"> {t('flow.statsBookRare')}</span>}
        </p>
      )}
    </section>
  )
}

export function FlowPane({ lanes, sfen, onPreview, onHover }: { lanes: Lane[]; sfen: string; onPreview: (moves: string[], title: string) => void; onHover: (usi: string | null) => void }) {
  const { t } = useTranslation()
  const statsPane = <OpeningStats sfen={sfen} onPreview={onPreview} onHover={onHover} />
  if (!lanes.length)
    return (
      <div className="app-off">
        <p>{t('flow.noBookLineFromThis')}</p>
        {statsPane}
      </div>
    )
  return (
    <div className="app-flow">
      <p className="app-muted">{t('flow.whatCanHappenFromThe')}</p>
      {lanes.map((lane) => {
        const steps = laneSteps(sfen, lane.moves)
        return (
          <button key={lane.first} className={`app-lane ${lane.tag}`} onClick={() => onPreview(lane.moves, steps[0])} onMouseEnter={() => onHover(lane.first)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(lane.first)} onBlur={() => onHover(null)}>
            <span className="app-lane-head">
              <span className="app-lane-tag">{lane.tag === 'book' ? t('flow.book') : lane.tag === 'mistake' ? t('flow.knownMistake') : t('flow.aiLine')}</span>
              {lane.loss !== undefined && <span className={lossClass(lane.loss)}>{lane.best ? t('flow.best') : lane.loss === 0 ? t('flow.best2') : `−${lane.loss}%`}</span>}
            </span>
            <span className="app-lane-steps">
              {steps.map((step, i) => (
                <span key={i} className={i === 0 ? 'first' : ''}>
                  {i > 0 && <i aria-hidden="true">→</i>}
                  {step}
                </span>
              ))}
              {lane.forks && <span className="app-muted">{t('flow.thenChoices', { forks: lane.forks })}</span>}
            </span>
            {lane.note && <span className="app-lane-note">{lane.note}</span>}
          </button>
        )
      })}
      {statsPane}
    </div>
  )
}
