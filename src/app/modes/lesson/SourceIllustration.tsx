import { Fragment } from 'react'
import { token } from 'styled-system/tokens'
import { cva } from 'styled-system/css'
import { styled } from 'styled-system/jsx'
import { useTranslation } from 'react-i18next'
import type { CropPanel, SourceDiagram } from '@/utils/curriculum'
import { rankKanji } from '@/utils/notation'
import { cx as classes } from '@/app/ui/cx'
import { SvgCircle, SvgLine, SvgPath, SvgRect, SvgText } from '@/app/ui/Svg'
import { Muted } from '@/app/panels/panels.styles'
import { Caption, Crop } from './lesson.styles'

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
const ARROW: Record<string, string> = { blue: token.var('colors.ai.600'), yellow: token.var('colors.kin.600'), pink: '#c4442a' }
const KOMA = 'M0,-17 L11,-12 L14,17 L-14,17 L-11,-12 Z'

const komaGlyph = cva({
  base: { fill: 'koma.ink', fontFamily: 'mincho', fontSize: '17px', fontWeight: '800', textAnchor: 'middle' },
  variants: { promoted: { false: {}, true: { fill: 'koma.red' } } },
  defaultVariants: { promoted: false },
})
const GridLine = styled('line', { base: { stroke: '#3a322a', strokeWidth: '1' } })
const CoordText = styled('text', { base: { fill: '#62574a', fontSize: '11px', textAnchor: 'middle' } }, { forwardProps: ['x', 'y'] as string[] })
const DashedArrow = styled('line', { base: { strokeWidth: '2', strokeLinecap: 'round', strokeDasharray: '5 4' } }, { forwardProps: ['markerEnd'] as string[] })

function Koma({ code, x, y, ghost }: { code: string; x: number; y: number; ghost?: boolean }) {
  const gote = code.replace('+', '') !== code.replace('+', '').toUpperCase()
  const key = code.startsWith('+') ? `+${code[1].toUpperCase()}` : code.toUpperCase()
  return (
    <g transform={`translate(${x} ${y}) rotate(${gote ? 180 : 0})`} className={ghost ? 'ghost' : 'koma'}>
      <SvgPath
        d={KOMA}
        fill={ghost ? 'none' : 'koma.light'}
        stroke={ghost ? 'ai.600' : '#a07a3c'}
        strokeWidth={ghost ? '1.5' : '1'}
        strokeDasharray={ghost ? '3 3' : undefined}
      />
      {!ghost && (
        <text y="6" className={classes(code.startsWith('+') && 'promoted', komaGlyph({ promoted: code.startsWith('+') }))}>
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
    <styled.figure m="0" textAlign="center" css={{ '@media (max-width: 640px)': { flex: '1 1 0', minW: '0' } }}>
      <styled.svg
        display="block"
        maxW="100%"
        h="auto"
        maxH="52vh"
        m="0 auto"
        css={{ '@media (max-width: 640px)': { maxH: '34vh' } }}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: width * (panel.w > 5 ? 1.15 : 1.7) }}
        role="img"
        aria-label={name}
      >
        {panel.zone !== undefined && <SvgRect className="zone" fill="#e4dfd6" x={ox} y={oy} width={panel.w * CELL} height={panel.zone * CELL} />}
        {rows.map((row, r) =>
          row.map((token, c) => {
            const marks = token.split(':')[1] ?? ''
            return (
              <Fragment key={`${r}-${c}`}>
                {marks.includes('h') && <SvgRect className="hl" fill="#c9c9f5" x={ox + c * CELL} y={oy + r * CELL} width={CELL} height={CELL} />}
                {marks.includes('Y') && <SvgRect className="hl-y" fill="#ece28a" x={ox + c * CELL} y={oy + r * CELL} width={CELL} height={CELL} />}
              </Fragment>
            )
          }),
        )}
        {Array.from({ length: panel.w + 1 }, (_, i) => (
          <GridLine key={`v${i}`} className="grid" x1={ox + i * CELL} y1={oy} x2={ox + i * CELL} y2={oy + panel.h * CELL} />
        ))}
        {Array.from({ length: panel.h + 1 }, (_, i) => (
          <GridLine key={`h${i}`} className="grid" x1={ox} y1={oy + i * CELL} x2={ox + panel.w * CELL} y2={oy + i * CELL} />
        ))}
        {panel.edges?.map((edge) => {
          const x2 = ox + panel.w * CELL
          const y2 = oy + panel.h * CELL
          const [a, b, c, d] = edge === 'top' ? [ox, oy, x2, oy] : edge === 'bottom' ? [ox, y2, x2, y2] : edge === 'left' ? [ox, oy, ox, y2] : [x2, oy, x2, y2]
          return <styled.line key={edge} className="edge" stroke="#1d140c" strokeWidth="3" x1={a} y1={b} x2={c} y2={d} />
        })}
        {panel.origin &&
          Array.from({ length: panel.w }, (_, c) => (
            <CoordText key={`f${c}`} className="coord" x={cx(c)} y={oy - 7}>
              {panel.origin![0] - c}
            </CoordText>
          ))}
        {panel.origin &&
          Array.from({ length: panel.h }, (_, r) => (
            <CoordText key={`r${r}`} className="coord" x={ox + panel.w * CELL + 12} y={cy(r) + 4}>
              {rankKanji(panel.origin![1] + r)}
            </CoordText>
          ))}
        {panel.regions?.map(([x, y, w, h, ja, en]) => (
          <SvgText
            key={ja}
            className="region"
            fill="rgb(98 87 74 / 55%)"
            fontSize="20px"
            fontWeight="800"
            textAnchor="middle"
            x={ox + (x + w / 2) * CELL}
            y={oy + (y + h / 2) * CELL + 7}
          >
            {lang === 'ja' ? ja : en}
          </SvgText>
        ))}
        {rows.map((row, r) =>
          row.map((token, c) => {
            const [code, marks = ''] = token.split(':')
            const number = marks.split('#')[1]
            return (
              <Fragment key={`p${r}-${c}`}>
                {marks.includes('b') && <SvgCircle className="dot" fill="#7b7bf0" cx={cx(c)} cy={cy(r)} r={CELL * 0.26} />}
                {marks.includes('y') && <SvgCircle className="dot-y" fill="#c9bf12" cx={cx(c)} cy={cy(r)} r={CELL * 0.26} />}
                {marks.includes('g') && <Koma code="P" x={cx(c)} y={cy(r)} ghost />}
                {code !== '.' && <Koma code={code} x={cx(c)} y={cy(r)} />}
                {number && (
                  <g className="badge">
                    <SvgCircle fill="rgb(110 110 230 / 85%)" cx={ox + c * CELL + 10} cy={oy + r * CELL + 10} r={9} />
                    <SvgText fill="#fff" fontSize="11px" fontWeight="700" textAnchor="middle" x={ox + c * CELL + 10} y={oy + r * CELL + 14}>
                      {number}
                    </SvgText>
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
              <SvgLine
                className="arrow"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ stroke: ARROW[tone] }}
                x1={sx + ((ex - sx) / len) * 13}
                y1={sy + ((ey - sy) / len) * 13}
                x2={ex - ((ex - sx) / len) * trim}
                y2={ey - ((ey - sy) / len) * trim}
                markerEnd={`url(#crop-head-${tone})`}
              />
              {off && (
                <SvgText className="no" fill="#c4442a" fontSize="18px" fontWeight="800" textAnchor="middle" x={ex} y={ey - 6}>
                  ✕
                </SvgText>
              )}
            </g>
          )
        })}
        {(panel.hand || panel.drop) && (
          <g className="hand">
            <SvgRect fill="#fff" stroke="#857a6b" x={handX - CELL * 0.6} y={oy + panel.h * CELL - CELL * 1.5} width={CELL * 1.2} height={CELL * 1.5} rx={6} />
            <SvgText
              className="hand-label"
              fill="#62574a"
              fontSize="11px"
              fontWeight="700"
              textAnchor="middle"
              x={handX}
              y={oy + panel.h * CELL - CELL * 1.5 - 5}
            >
              {lang === 'ja' ? '持駒' : 'Hand'}
            </SvgText>
            {panel.hand && <Koma code={panel.hand} x={handX} y={oy + panel.h * CELL - CELL * 0.75} />}
          </g>
        )}
        {panel.drop && (
          <DashedArrow
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
          <DashedArrow
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
          <SvgText className="callout" fill="#c4442a" fontSize="13px" fontWeight="800" x={ox} y={14}>
            {lang === 'ja' ? panel.note.ja : panel.note.en}
          </SvgText>
        )}
      </styled.svg>
      {panel.choice && (
        <styled.p display="flex" justifyContent="center" gap="3" m="{spacing.1} 0 0" fontSize="sm">
          {panel.choice.map((code, i) => (
            <span key={code}>
              {GLYPH[code.startsWith('+') ? `+${code[1].toUpperCase()}` : code.toUpperCase()]}
              {i === 0 ? (lang === 'ja' ? ' 成る' : ' promote') : lang === 'ja' ? ' 不成' : ' decline'}
            </span>
          ))}
        </styled.p>
      )}
      {label && (
        <Caption css={{ '@media (max-width: 640px)': { fontSize: 'xs' } }}>
          {panel.verdict && (
            <styled.span
              className="verdict"
              mr="1"
              fontSize="md"
              color={panel.verdict === 'ok' ? 'ai.600' : '#c4442a'}
              aria-label={panel.verdict === 'ok' ? 'OK' : 'NG'}
            >
              {panel.verdict === 'ok' ? '○' : '✕'}
            </styled.span>
          )}
          {label}
        </Caption>
      )}
    </styled.figure>
  )
}

export function SourceIllustration({ diagram }: { diagram: Pick<SourceDiagram, 'crop' | 'pieces'> }) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  if (diagram.pieces)
    return (
      <Crop layout="pieces">
        {diagram.pieces.items.map(([code, count, label], i) => (
          <styled.figure key={i} m="0" textAlign="center">
            <styled.svg
              display="block"
              w="52px"
              h="56px"
              m="0 auto"
              viewBox="-20 -22 40 44"
              role="img"
              aria-label={label || code || (lang === 'ja' ? '駒' : 'Piece')}
            >
              {code ? <Koma code={code} x={0} y={0} /> : <SvgPath className="blank" fill="koma.light" stroke="#a07a3c" opacity="0.6" d={KOMA} />}
            </styled.svg>
            {(label || count > 0) && (
              <Caption>
                {label}
                {count > 0 && <Muted as="span"> ×{count}</Muted>}
              </Caption>
            )}
          </styled.figure>
        ))}
      </Crop>
    )
  if (!diagram.crop) return null
  return (
    <Crop layout={diagram.crop.cycle ? 'cycle' : 'panels'}>
      {diagram.crop.panels.map((panel, i) => (
        <Panel key={i} panel={panel} lang={lang} />
      ))}
    </Crop>
  )
}
