import './eval-graph.css'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { LABELS, type Label } from '@/utils/analysis'

const W = 360
const H = 88

export function EvalGraph({
  values,
  labels,
  cursor,
  onJump,
}: {
  values: (number | undefined)[]
  labels: (Label | undefined)[]
  cursor: number
  onJump: (i: number) => void
}) {
  const { t } = useTranslation()
  const id = useId()
  const n = Math.max(values.length - 1, 1)
  const x = (i: number) => (i / n) * W
  const y = (cp: number) => H / 2 - (Math.max(-2000, Math.min(2000, cp)) / 2000) * (H / 2 - 4)
  const known = values.map((v, i) => (v === undefined ? null : [x(i), y(v)])).filter((p): p is number[] => p !== null)
  const line = known.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
  const area = known.length ? `${line}L${known.at(-1)![0].toFixed(1)},${H / 2}L${known[0][0].toFixed(1)},${H / 2}Z` : ''
  const selected = labels[cursor]
  return (
    <div className="app-graph">
      <div className="app-graph-axis">
        <span title={t('graph.senteAhead')} aria-label={t('graph.senteAhead')}>
          ☗
        </span>
        <span title={t('graph.goteAhead')} aria-label={t('graph.goteAhead')}>
          ☖
        </span>
      </div>
      <button
        type="button"
        className="app-graph-hit"
        aria-label={t('graph.evaluationByMove')}
        onClick={(e) => {
          if (e.detail === 0) return
          const rect = e.currentTarget.getBoundingClientRect()
          onJump(Math.round(((e.clientX - rect.left) / rect.width) * n))
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <clipPath id={`${id}-sente`}>
              <rect width={W} height={H / 2} />
            </clipPath>
            <clipPath id={`${id}-gote`}>
              <rect y={H / 2} width={W} height={H / 2} />
            </clipPath>
          </defs>
          <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="app-graph-mid" />
          {area && <path d={area} className="app-graph-area sente" clipPath={`url(#${id}-sente)`} />}
          {area && <path d={area} className="app-graph-area gote" clipPath={`url(#${id}-gote)`} />}
          {line && <path d={line} className="app-graph-line" />}
          <line x1={x(cursor)} x2={x(cursor)} y1="0" y2={H} className="app-graph-cursor" />
          {labels.map((label, i) => {
            const value = values[i]
            if (!label || value === undefined) return null
            const meta = LABELS[label]
            return (
              <g key={i} className="app-graph-mark" style={{ ['--label' as string]: meta.color }}>
                <title>
                  {i}: {meta.symbol} {meta.text}
                </title>
                <circle cx={x(i)} cy={y(value)} r={i === cursor ? 3.5 : 2.5} />
                {(n <= 32 || i === cursor) && (
                  <text x={Math.max(8, Math.min(W - 8, x(i)))} y={Math.max(12, Math.min(H - 4, y(value) - 7))}>
                    {meta.symbol}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </button>
      {selected && (
        <div className="app-graph-review" style={{ ['--label' as string]: LABELS[selected].color }}>
          <span>{cursor}</span>
          <strong>
            {LABELS[selected].symbol} {LABELS[selected].text}
          </strong>
        </div>
      )}
    </div>
  )
}
