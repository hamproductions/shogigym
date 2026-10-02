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
  if (!stats) return <p className="ws-stats-empty ws-muted">{t('flow.statsNone', { ply: meta?.maxPly ?? 30 })}</p>
  const gote = sfen.split(' ')[1] === 'w'
  const book = stats.book
  const bookText = book ? moveText(sfen, book.usi) : ''
  const bookEval = book ? t('flow.statsEval', { side: (book.eval >= 0) !== gote ? '☗' : '☖', cp: Math.abs(book.eval) }) : ''
  const top = stats.moves[0]?.games ?? 1
  return (
    <section className="ws-stats" aria-label={t('flow.statsTitle')}>
      <header className="ws-stats-head">
        <h3>{t('flow.statsTitle')}</h3>
        <span className="ws-muted">{t('flow.statsSource', { games: stats.games.toLocaleString(), source: sourceLabel(meta) })}</span>
      </header>
      <div className="ws-stats-cols ws-muted" aria-hidden="true">
        <span>{t('flow.statsMove')}</span>
        <span>{t('flow.statsPlayed')}</span>
        <span>{t('flow.statsResult')}</span>
      </div>
      <ul className="ws-stats-list">
        {stats.moves.map((m) => {
          const text = moveText(sfen, m.usi)
          const s = pct(m.senteWins, m.games)
          const g = pct(m.goteWins, m.games)
          const isBook = book?.usi === m.usi
          return (
            <li key={m.usi}>
              <button className="ws-stats-row" onClick={() => onPreview([m.usi], text)} onMouseEnter={() => onHover(m.usi)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(m.usi)} onBlur={() => onHover(null)} title={t('flow.statsRowTitle', { move: text, games: m.games, sente: s, gote: g, draw: Math.max(0, 100 - s - g) })}>
                <span className="ws-stats-move">
                  {text}
                  {isBook && <em className="ws-stats-book">{t('flow.statsBookMark')}</em>}
                </span>
                <span className="ws-stats-freq">
                  <span className="ws-stats-bar">
                    <i style={{ width: `${(m.games / top) * 100}%` }} />
                  </span>
                  <span className="ws-stats-num">
                    {pct(m.games, stats.games)}% <small>{t('flow.statsGames', { count: m.games })}</small>
                  </span>
                </span>
                <span className="ws-stats-win">
                  <span className="ws-stats-split">
                    <i className="b" style={{ width: `${s}%` }} />
                    <i className="w" style={{ width: `${g}%` }} />
                  </span>
                  <span className="ws-stats-num">
                    ☗{s}% ☖{g}%
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {book && (
        <p className="ws-stats-engine">
          {t('flow.statsBook', { move: bookText, eval: bookEval })}
          {!stats.moves.some((m) => m.usi === book.usi) && <span className="ws-muted"> {t('flow.statsBookRare')}</span>}
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
      <div className="ws-off">
        <p>{t('flow.noBookLineFromThis')}</p>
        {statsPane}
      </div>
    )
  return (
    <div className="ws-flow">
      <p className="ws-muted">{t('flow.whatCanHappenFromThe')}</p>
      {lanes.map((lane) => {
        const steps = laneSteps(sfen, lane.moves)
        return (
          <button key={lane.first} className={`ws-lane ${lane.tag}`} onClick={() => onPreview(lane.moves, steps[0])} onMouseEnter={() => onHover(lane.first)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(lane.first)} onBlur={() => onHover(null)}>
            <span className="ws-lane-head">
              <span className="ws-lane-tag">{lane.tag === 'book' ? t('flow.book') : lane.tag === 'mistake' ? t('flow.knownMistake') : t('flow.aiLine')}</span>
              {lane.loss !== undefined && <span className={lossClass(lane.loss)}>{lane.best ? t('flow.best') : lane.loss === 0 ? t('flow.best2') : `−${lane.loss}%`}</span>}
            </span>
            <span className="ws-lane-steps">
              {steps.map((step, i) => (
                <span key={i} className={i === 0 ? 'first' : ''}>
                  {i > 0 && <i aria-hidden="true">→</i>}
                  {step}
                </span>
              ))}
              {lane.forks && <span className="ws-muted">{t('flow.thenChoices', { forks: lane.forks })}</span>}
            </span>
            {lane.note && <span className="ws-lane-note">{lane.note}</span>}
          </button>
        )
      })}
      {statsPane}
    </div>
  )
}
