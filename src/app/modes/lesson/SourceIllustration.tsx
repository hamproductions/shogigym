import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import type { CropPanel, SourceDiagram } from '@/utils/curriculum'
import { rankKanji } from '@/utils/notation'

const CELL = 40
const GLYPH: Record<string, string> = {
  P: '歩',
  L: '香',
  N: '桂',
  S: '銀',
  G: '金',
  B: '角',
  R: '飛',
  K: '玉',
  '+P': 'と',
  '+L': '杏',
  '+N': '圭',
  '+S': '全',
  '+B': '馬',
  '+R': '龍',
}
const ARROW: Record<string, string> = { blue: 'var(--ai-600)', yellow: 'var(--kin-600)', pink: 'var(--shu-500)' }
const KOMA = 'M0,-17 L11,-12 L14,17 L-14,17 L-11,-12 Z'

function Koma({ code, x, y, ghost }: { code: string; x: number; y: number; ghost?: boolean }) {
  const gote = code.replace('+', '') !== code.replace('+', '').toUpperCase()
  const key = code.startsWith('+') ? `+${code[1].toUpperCase()}` : code.toUpperCase()
  return (
    <g transform={`translate(${x} ${y}) rotate(${gote ? 180 : 0})`} className={ghost ? 'ghost' : 'koma'}>
      <path d={KOMA} />
      {!ghost && (
        <text y="6" className={code.startsWith('+') ? 'promoted' : undefined}>
          {GLYPH[key] ?? ''}
        </text>
      )}
    </g>
  )
}

function Panel({ panel, lang }: { panel: CropPanel; lang: string }) {
  const rows = panel.rows.map((row) => row.split(' '))
  const pad = { top: panel.origin || panel.note ? 24 : 12, right: panel.origin ? 24 : 12, bottom: 12, left: 12 }
  const offTop = panel.arrows?.some((a) => a[3] < 0) ? CELL : 0
  const width = panel.w * CELL + pad.left + pad.right + (panel.hand || panel.drop ? CELL * 1.6 : 0)
  const height = panel.h * CELL + pad.top + pad.bottom + offTop
  const ox = pad.left
  const oy = pad.top + offTop
  const cx = (c: number) => ox + (c + 0.5) * CELL
  const cy = (r: number) => oy + (r + 0.5) * CELL
  const handX = ox + panel.w * CELL + CELL * 0.9
  const label = panel.label ? (lang === 'ja' ? panel.label.ja : panel.label.en) : ''
  const name = label || (lang === 'ja' ? '原図の部分図' : 'Source board detail')
  return (
    <figure className={`app-crop-panel${panel.verdict ? ` ${panel.verdict}` : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: width * (panel.w > 5 ? 1.15 : 1.7) }} role="img" aria-label={name}>
        {panel.zone !== undefined && <rect className="zone" x={ox} y={oy} width={panel.w * CELL} height={panel.zone * CELL} />}
        {rows.map((row, r) =>
          row.map((token, c) => {
            const marks = token.split(':')[1] ?? ''
            return (
              <Fragment key={`${r}-${c}`}>
                {marks.includes('h') && <rect className="hl" x={ox + c * CELL} y={oy + r * CELL} width={CELL} height={CELL} />}
                {marks.includes('Y') && <rect className="hl-y" x={ox + c * CELL} y={oy + r * CELL} width={CELL} height={CELL} />}
              </Fragment>
            )
          }),
        )}
        {Array.from({ length: panel.w + 1 }, (_, i) => (
          <line key={`v${i}`} className="grid" x1={ox + i * CELL} y1={oy} x2={ox + i * CELL} y2={oy + panel.h * CELL} />
        ))}
        {Array.from({ length: panel.h + 1 }, (_, i) => (
          <line key={`h${i}`} className="grid" x1={ox} y1={oy + i * CELL} x2={ox + panel.w * CELL} y2={oy + i * CELL} />
        ))}
        {panel.edges?.map((edge) => {
          const x2 = ox + panel.w * CELL
          const y2 = oy + panel.h * CELL
          const [a, b, c, d] = edge === 'top' ? [ox, oy, x2, oy] : edge === 'bottom' ? [ox, y2, x2, y2] : edge === 'left' ? [ox, oy, ox, y2] : [x2, oy, x2, y2]
          return <line key={edge} className="edge" x1={a} y1={b} x2={c} y2={d} />
        })}
        {panel.origin &&
          Array.from({ length: panel.w }, (_, c) => (
            <text key={`f${c}`} className="coord" x={cx(c)} y={oy - 7}>
              {panel.origin![0] - c}
            </text>
          ))}
        {panel.origin &&
          Array.from({ length: panel.h }, (_, r) => (
            <text key={`r${r}`} className="coord" x={ox + panel.w * CELL + 12} y={cy(r) + 4}>
              {rankKanji(panel.origin![1] + r)}
            </text>
          ))}
        {panel.regions?.map(([x, y, w, h, ja, en]) => (
          <text key={ja} className="region" x={ox + (x + w / 2) * CELL} y={oy + (y + h / 2) * CELL + 7}>
            {lang === 'ja' ? ja : en}
          </text>
        ))}
        {rows.map((row, r) =>
          row.map((token, c) => {
            const [code, marks = ''] = token.split(':')
            const number = marks.split('#')[1]
            return (
              <Fragment key={`p${r}-${c}`}>
                {marks.includes('b') && <circle className="dot" cx={cx(c)} cy={cy(r)} r={CELL * 0.26} />}
                {marks.includes('y') && <circle className="dot-y" cx={cx(c)} cy={cy(r)} r={CELL * 0.26} />}
                {marks.includes('g') && <Koma code="P" x={cx(c)} y={cy(r)} ghost />}
                {code !== '.' && <Koma code={code} x={cx(c)} y={cy(r)} />}
                {number && (
                  <g className="badge">
                    <circle cx={ox + c * CELL + 10} cy={oy + r * CELL + 10} r={9} />
                    <text x={ox + c * CELL + 10} y={oy + r * CELL + 14}>
                      {number}
                    </text>
                  </g>
                )}
              </Fragment>
            )
          }),
        )}
        {panel.free?.map(([x, y, code]) => (
          <Koma key={`${x}-${y}`} code={code} x={ox + x * CELL} y={oy + y * CELL} />
        ))}
        <defs>
          {Object.entries(ARROW).map(([name, color]) => (
            <marker key={name} id={`crop-head-${name}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={color} />
            </marker>
          ))}
        </defs>
        {panel.arrows?.map(([x1, y1, x2, y2, tone = 'blue'], i) => {
          const off = y2 < 0
          const ex = cx(x2)
          const ey = off ? oy - offTop * 0.55 : cy(y2)
          const sx = cx(x1)
          const sy = cy(y1)
          const len = Math.hypot(ex - sx, ey - sy) || 1
          const trim = off ? 0 : 13
          return (
            <g key={i}>
              <line
                className="arrow"
                style={{ stroke: ARROW[tone] }}
                x1={sx + ((ex - sx) / len) * 13}
                y1={sy + ((ey - sy) / len) * 13}
                x2={ex - ((ex - sx) / len) * trim}
                y2={ey - ((ey - sy) / len) * trim}
                markerEnd={`url(#crop-head-${tone})`}
              />
              {off && (
                <text className="no" x={ex} y={ey - 6}>
                  ✕
                </text>
              )}
            </g>
          )
        })}
        {(panel.hand || panel.drop) && (
          <g className="hand">
            <rect x={handX - CELL * 0.6} y={oy + panel.h * CELL - CELL * 1.5} width={CELL * 1.2} height={CELL * 1.5} rx={6} />
            <text className="hand-label" x={handX} y={oy + panel.h * CELL - CELL * 1.5 - 5}>
              {lang === 'ja' ? '持駒' : 'Hand'}
            </text>
            {panel.hand && <Koma code={panel.hand} x={handX} y={oy + panel.h * CELL - CELL * 0.75} />}
          </g>
        )}
        {panel.drop && (
          <line
            className="arrow dashed"
            style={{ stroke: ARROW[panel.verdict === 'ng' ? 'pink' : 'blue'] }}
            x1={handX - CELL * 0.5}
            y1={oy + panel.h * CELL - CELL * 0.75}
            x2={cx(panel.drop[0]) + 14}
            y2={cy(panel.drop[1])}
            markerEnd={`url(#crop-head-${panel.verdict === 'ng' ? 'pink' : 'blue'})`}
          />
        )}
        {panel.toHand && (
          <line
            className="arrow dashed"
            style={{ stroke: ARROW.blue }}
            x1={cx(panel.toHand[0]) + 14}
            y1={cy(panel.toHand[1])}
            x2={handX - CELL * 0.62}
            y2={oy + panel.h * CELL - CELL * 0.75}
            markerEnd="url(#crop-head-blue)"
          />
        )}
        {panel.note && (
          <text className="callout" x={ox} y={14}>
            {lang === 'ja' ? panel.note.ja : panel.note.en}
          </text>
        )}
      </svg>
      {panel.choice && (
        <p className="app-crop-choice">
          {panel.choice.map((code, i) => (
            <span key={code}>
              {GLYPH[code.startsWith('+') ? `+${code[1].toUpperCase()}` : code.toUpperCase()]}
              {i === 0 ? (lang === 'ja' ? ' 成る' : ' promote') : lang === 'ja' ? ' 不成' : ' decline'}
            </span>
          ))}
        </p>
      )}
      {label && (
        <figcaption>
          {panel.verdict && (
            <span className="verdict" aria-label={panel.verdict === 'ok' ? 'OK' : 'NG'}>
              {panel.verdict === 'ok' ? '○' : '✕'}
            </span>
          )}
          {label}
        </figcaption>
      )}
    </figure>
  )
}

export function SourceIllustration({ diagram }: { diagram: Pick<SourceDiagram, 'crop' | 'pieces'> }) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  if (diagram.pieces)
    return (
      <div className="app-crop app-crop-pieces">
        {diagram.pieces.items.map(([code, count, label], i) => (
          <figure key={i} className="app-crop-piece">
            <svg viewBox="-20 -22 40 44" role="img" aria-label={label || code || (lang === 'ja' ? '駒' : 'Piece')}>
              {code ? <Koma code={code} x={0} y={0} /> : <path className="blank" d={KOMA} />}
            </svg>
            {(label || count > 0) && (
              <figcaption>
                {label}
                {count > 0 && <span className="app-muted"> ×{count}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    )
  if (!diagram.crop) return null
  return (
    <div className={`app-crop${diagram.crop.cycle ? ' cycle' : ''}`}>
      {diagram.crop.panels.map((panel, i) => (
        <Panel key={i} panel={panel} lang={lang} />
      ))}
    </div>
  )
}
