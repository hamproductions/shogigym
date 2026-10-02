import { useTranslation } from 'react-i18next'
import { applyUsi, moveText } from '../../shogi'
import type { Lane } from '../lib/lanes'
import { lossClass } from '../lib/score'

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

export function FlowPane({ lanes, sfen, onPreview, onHover }: { lanes: Lane[]; sfen: string; onPreview: (moves: string[], title: string) => void; onHover: (usi: string | null) => void }) {
  const { t } = useTranslation()
  if (!lanes.length)
    return (
      <div className="ws-off">
        <p>{t('flow.noBookLineFromThis')}</p>
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
    </div>
  )
}
