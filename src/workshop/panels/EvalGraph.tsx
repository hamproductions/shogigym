import { useTranslation } from 'react-i18next'

const W = 360
const H = 88

export function EvalGraph({ values, cursor, onJump }: { values: (number | undefined)[]; cursor: number; onJump: (i: number) => void }) {
  const { t } = useTranslation()
  const n = Math.max(values.length - 1, 1)
  const x = (i: number) => (i / n) * W
  const y = (cp: number) => H / 2 - (Math.max(-2000, Math.min(2000, cp)) / 2000) * (H / 2 - 4)
  const known = values.map((v, i) => (v === undefined ? null : [x(i), y(v)])).filter((p): p is number[] => p !== null)
  const line = known.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
  const area = known.length ? `${line}L${known.at(-1)![0].toFixed(1)},${H / 2}L${known[0][0].toFixed(1)},${H / 2}Z` : ''
  return (
    <div className="ws-graph">
      <div className="ws-graph-axis">
        <span>{t('graph.senteAhead')}</span>
        <span>{t('graph.goteAhead')}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={t('graph.evaluationByMove')}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onJump(Math.round(((e.clientX - rect.left) / rect.width) * n))
        }}
      >
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="ws-graph-mid" />
        {area && <path d={area} className="ws-graph-area" />}
        {line && <path d={line} className="ws-graph-line" />}
        <line x1={x(cursor)} x2={x(cursor)} y1="0" y2={H} className="ws-graph-cursor" />
      </svg>
    </div>
  )
}
