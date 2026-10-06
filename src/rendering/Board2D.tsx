import './board.css'
import { Color, PieceType, Square, type ImmutablePosition } from 'tsshogi'
import { HAND_ORDER, PIECE_CHAR } from '@/utils/shogi'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { steppedMove } from '@/utils/stepped'
import { useLatest } from '@/app/hooks/useLatest'
import type { Board3DProps } from './Board3D'
import { PIECE_FONTS, loadPieceFont, playSound, useSettings, type BoardStyle } from '@/appearance/settings'
import { useSvgBoard } from '@/app/hooks/useSvgBoard'
import { useBakedPieces } from '@/app/hooks/useBakedPieces'
import { SPRITE_BOX, spriteKey, type Baked } from './sprites'
import { UnderMarks, OverMarks } from './flatMarks'
import { BOARD_TONE } from './koma'
import { SQ_D } from '@/rendering/board3d/dimensions'
import { useTranslation } from 'react-i18next'

const KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const COUNT = ['', '', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八']
const PROMOTED = new Set([PieceType.PROM_PAWN, PieceType.PROM_LANCE, PieceType.PROM_KNIGHT, PieceType.PROM_SILVER, PieceType.HORSE, PieceType.DRAGON])

export type FlatStyle = 'diagram' | 'broadcast'

const THEMES = {
  diagram: {
    cw: 100,
    ch: 100,
    pad: 70,
    side: 200,
    bg: '#ffffff',
    board: '#ffffff',
    line: '#333',
    frame: 4,
    coord: '#333',
    coordSize: 34,
    piece: '#111',
    promoted: '#111',
    koma: false,
  },
  broadcast: {
    cw: 100,
    ch: 110,
    pad: 80,
    side: 230,
    bg: '#efa83f',
    board: '#efa83f',
    line: '#66501e',
    frame: 1.8,
    coord: '#111',
    coordSize: 46,
    piece: '#111',
    promoted: '#b3261e',
    koma: true,
  },
} as const

const glyph = (type: PieceType, color: Color) => {
  if (type !== PieceType.KING) return PIECE_CHAR[type]
  return color === Color.BLACK ? '玉' : '王'
}

interface HandFrame {
  x0: number
  y0: number
  boardW: number
  boardH: number
  side: number
  koma: boolean
}

function handSlots(color: Color, flipped: boolean, frame: HandFrame, count: number) {
  const { x0, y0, boardW, boardH, side, koma } = frame
  const bottom = (color === Color.BLACK) !== flipped
  const hx = bottom ? x0 + boardW + 80 + (side - 80) / 2 : (side - 80) / 2 + 20
  const step = koma ? 102 : 64
  const edge = koma ? 0 : 20
  const rows = step * Math.max(1, count)
  const startY = bottom ? y0 + boardH - rows - edge : y0 + edge
  const slotY = (i: number) => (bottom ? startY + step * (i + 0.5) : startY + step * (count - i - 0.5) + (koma ? 0 : 50))
  let markY: number
  if (bottom) markY = koma ? y0 + boardH - rows - 60 : startY - 10
  else markY = koma ? y0 + rows + 60 : y0 + 20
  return { bottom, hx, step, slotY, markY }
}

function themeFor(style: FlatStyle, customTone: BoardStyle | null) {
  if (!customTone) return THEMES[style]
  const tone = BOARD_TONE[customTone]
  return { ...THEMES[style], bg: `rgb(${tone.board.join(',')})`, board: `rgb(${tone.board.join(',')})`, line: tone.line, coord: tone.line }
}

const col = (file: number, flipped: boolean) => (flipped ? file - 1 : 9 - file)
const row = (rank: number, flipped: boolean) => (flipped ? 9 - rank : rank - 1)

function squareAtClick(event: React.MouseEvent<SVGRectElement>, flipped: boolean) {
  const rect = event.currentTarget.getBoundingClientRect()
  const c = Math.floor(((event.clientX - rect.left) / rect.width) * 9)
  const r = Math.floor(((event.clientY - rect.top) / rect.height) * 9)
  const file = flipped ? c + 1 : 9 - c
  const rank = flipped ? 9 - r : r + 1
  if (file >= 1 && file <= 9 && rank >= 1 && rank <= 9) return new Square(file, rank)
  return null
}

interface HighlightLook {
  cw: number
  ch: number
}

function FlatHighlights({ props, style, t, x0, y0 }: { props: Board3DProps; style: FlatStyle; t: HighlightLook; x0: number; y0: number }) {
  const { lastMove, selected, checkSquare, heat, flipped } = props
  const lastTo = lastMove ? Square.newByUSI(lastMove.slice(2, 4)) : null
  const lastFrom = lastMove && lastMove[1] !== '*' ? Square.newByUSI(lastMove.slice(0, 2)) : null
  const cell = (sq: Square, fill: string, opacity: number, key: string) => (
    <rect
      key={key}
      x={x0 + col(sq.file, flipped) * t.cw}
      y={y0 + row(sq.rank, flipped) * t.ch}
      width={t.cw}
      height={t.ch}
      fill={fill}
      opacity={opacity}
      pointerEvents="none"
    />
  )
  const lastColor = style === 'diagram' ? '#9cc3ff' : '#fff2a8'
  return (
    <>
      {lastFrom && cell(lastFrom, lastColor, 0.35, 'lf')}
      {lastTo && cell(lastTo, lastColor, 0.6, 'lt')}
      {(heat ?? []).map((h, i) => cell(h.square, `#${h.color.toString(16).padStart(6, '0')}`, h.opacity, `h${i}`))}
      {checkSquare && cell(checkSquare, '#e0301e', 0.45, 'ck')}
      {selected instanceof Square && cell(selected, '#ffd76a', 0.7, 'sel')}
    </>
  )
}

const komaPath = (w: number, h: number) =>
  `M ${-w * 0.42} ${h * 0.46} L ${w * 0.42} ${h * 0.46} L ${w * 0.34} ${-h * 0.3} L 0 ${-h * 0.46} L ${-w * 0.34} ${-h * 0.3} Z`

const NINE = [0, 1, 2, 3, 4, 5, 6, 7, 8]

interface Look {
  cw: number
  ch: number
  pad: number
  coord: string
  coordSize: number
  koma: boolean
  piece: string
  promoted: string
}

const TEN = [...NINE, 9]

interface GridLook extends Look {
  line: string
  frame: number
}

function GridLines({ t, x0, y0, boardW, boardH }: { t: GridLook; x0: number; y0: number; boardW: number; boardH: number }) {
  const gridWidth = (i: number) => {
    if (i === 0 || i === 9) return t.frame
    return t.koma ? 1 : 1.6
  }
  return (
    <>
      {TEN.map((i) => (
        <g key={i} stroke={t.line} strokeWidth={gridWidth(i)}>
          <line x1={x0 + i * t.cw} y1={y0} x2={x0 + i * t.cw} y2={y0 + boardH} />
          <line x1={x0} y1={y0 + i * t.ch} x2={x0 + boardW} y2={y0 + i * t.ch} />
        </g>
      ))}
      {!t.koma && [3, 6].flatMap((a) => [3, 6].map((b) => <circle key={`${a}${b}`} cx={x0 + a * t.cw} cy={y0 + b * t.ch} r={5} fill={t.line} />))}
    </>
  )
}

function AxisLabels({ t, x0, y0, boardW, flipped }: { t: Look; x0: number; y0: number; boardW: number; flipped: boolean }) {
  return NINE.map((i) => (
    <g
      key={i}
      fill={t.coord}
      fontSize={t.coordSize}
      fontWeight={t.koma ? 800 : 400}
      fontFamily="'Shippori Mincho B1', serif"
      textAnchor="middle"
      dominantBaseline="central"
    >
      <text
        x={x0 + (i + 0.5) * t.cw}
        y={y0 - t.pad / 2}
        fontFamily={t.koma ? "'Zen Kaku Gothic New', sans-serif" : undefined}
        fontWeight={t.koma ? 700 : undefined}
      >
        {flipped ? i + 1 : 9 - i}
      </text>
      <text x={x0 + boardW + 40} y={y0 + (i + 0.5) * t.ch}>
        {KANJI_NUM[flipped ? 9 - i : i + 1]}
      </text>
    </g>
  ))
}

interface PieceLayerProps {
  position: ImmutablePosition
  flipped: boolean
  selected: Board3DProps['selected']
  baked: Baked | null
  koma: boolean
  komaFont: string
  look: Look
  cx: (sq: Square) => number
  cy: (sq: Square) => number
}

function PieceLayer({ position, flipped, selected, baked, koma, komaFont, look, cx, cy }: PieceLayerProps) {
  return position.board.listNonEmptySquares().map((sq) => {
    const piece = position.board.at(sq)!
    const up = (piece.color === Color.BLACK) !== flipped
    const text = glyph(piece.type, piece.color)
    return (
      <g key={sq.usi} transform={`translate(${cx(sq)} ${cy(sq)})${up ? '' : ' rotate(180)'}`} pointerEvents="none">
        <g data-sq={sq.usi}>
          <g className={`app-koma-lift${selected instanceof Square && selected.equals(sq) ? ' on' : ''}`}>
            {koma ? (
              baked && (
                <image
                  href={baked.pieces.get(spriteKey(piece.type, piece.color, true))}
                  x={-SPRITE_BOX * 50}
                  y={-SPRITE_BOX * 50}
                  width={SPRITE_BOX * 100}
                  height={SPRITE_BOX * 100}
                />
              )
            ) : (
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={text.length > 1 ? 40 : 62}
                fontFamily={komaFont}
                fontWeight={500}
                fill={PROMOTED.has(piece.type) ? look.promoted : look.piece}
              >
                {text}
              </text>
            )}
          </g>
        </g>
      </g>
    )
  })
}

interface HandColumnProps {
  color: Color
  position: ImmutablePosition
  flipped: boolean
  selected: Board3DProps['selected']
  selectedColor: Board3DProps['selectedColor']
  frame: HandFrame
  t: Look
  baked: Baked | null
  komaFont: string
  onHand: Board3DProps['onHand']
}

function HandColumn({ color, position, flipped, selected, selectedColor, frame, t, baked, komaFont, onHand }: HandColumnProps) {
  const counts = HAND_ORDER.filter((type) => position.hand(color).count(type) > 0)
  const { bottom, hx, step, slotY, markY } = handSlots(color, flipped, frame, counts.length)
  const mark = color === Color.BLACK ? '☗' : '☖'
  const size = t.koma ? 50 : 52
  const items = counts.map((type, i) => {
    const y = slotY(i)
    const n = position.hand(color).count(type)
    const on = selected === type && selectedColor === color
    return (
      <g key={type} transform={`translate(${hx} ${y})${bottom ? '' : ' rotate(180)'}`} onClick={() => onHand(color, type)} style={{ cursor: 'pointer' }}>
        <rect
          x={-frame.side / 2 + 6}
          y={-step / 2}
          width={frame.side - 12}
          height={step}
          fill={on && !t.koma ? '#ffd76a' : 'transparent'}
          opacity={on && !t.koma ? 0.8 : 1}
          rx={8}
        />
        {t.koma && baked && (
          <g className={`app-koma-lift${on ? ' on' : ''}`}>
            <image
              href={baked.pieces.get(spriteKey(type, color, true))}
              x={-SPRITE_BOX * 45}
              y={-SPRITE_BOX * 45}
              width={SPRITE_BOX * 90}
              height={SPRITE_BOX * 90}
            />
          </g>
        )}
        {!t.koma && (
          <text textAnchor="middle" dominantBaseline="central" fontSize={size} fontFamily={komaFont} fontWeight={800} fill={t.piece}>
            {PIECE_CHAR[type]}
          </text>
        )}
        {n > 1 && (
          <g transform={t.koma ? `translate(42 -32)${bottom ? '' : ' rotate(180)'}` : undefined}>
            {t.koma && <circle r={21} fill="#2a241e" />}
            <text
              textAnchor="middle"
              y={t.koma ? 0 : 44}
              dy="0.36em"
              fontSize={30}
              fontWeight={700}
              fontFamily="'Zen Kaku Gothic New', sans-serif"
              fill={t.koma ? '#fff' : t.piece}
            >
              {t.koma ? n : COUNT[n]}
            </text>
          </g>
        )}
      </g>
    )
  })
  return (
    <g key={color}>
      <g transform={`translate(${hx} ${markY})${bottom ? '' : ' rotate(180)'}`}>
        {t.koma ? (
          <path d={komaPath(70, 80)} fill={color === Color.BLACK ? '#222' : 'none'} stroke="#222" strokeWidth={3} />
        ) : (
          <text textAnchor="middle" dominantBaseline="central" fontSize={44} fill={t.piece}>
            {mark}
          </text>
        )}
      </g>
      {items}
    </g>
  )
}

interface StepGeo {
  cx: (sq: Square) => number
  cy: (sq: Square) => number
  ch: number
}

function useStepAnimation(svgRef: RefObject<SVGSVGElement | null>, position: ImmutablePosition, lastMove: string | undefined, stepGeo: StepGeo) {
  const geo = useLatest(stepGeo)
  const previous = useRef<ImmutablePosition | null>(null)
  useLayoutEffect(() => {
    const svg = svgRef.current
    svg?.getAnimations({ subtree: true }).forEach((animation) => animation.cancel())
    const prev = previous.current
    previous.current = position
    const stepped = prev && lastMove ? steppedMove(prev, position, lastMove) : null
    if (!stepped || !lastMove) return
    const to = Square.newByUSI(lastMove.slice(2, 4))
    const from = lastMove[1] === '*' ? null : Square.newByUSI(lastMove.slice(0, 2))
    if (!to) return
    const { cx: px, cy: py, ch } = geo.current
    const dx = from ? px(from) - px(to) : 0
    const dy = from ? py(from) - py(to) : -ch
    const animation = svg
      ?.querySelector(`[data-sq="${to.usi}"]`)
      ?.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: `translate(${dx / 2}px, ${dy / 2 - 12}px) scale(1.12)`, offset: 0.5 },
          { transform: 'none' },
        ],
        { duration: 220, easing: 'ease-out' },
      )
    if (!animation) return
    animation.onfinish = () => playSound(stepped.capture ? 'capture' : 'move')
    return () => animation.cancel()
  }, [position, lastMove, svgRef, geo, previous])
}

export function Board2D({ style, ...props }: Board3DProps & { style: FlatStyle }) {
  const svgRef = useSvgBoard()
  const { baked, loading, error } = useBakedPieces(style === 'broadcast')
  const [, setFontReady] = useState(false)
  useEffect(() => {
    void loadPieceFont('kaisho').then(() => setFontReady(true))
  }, [])
  const komaFont = style === 'broadcast' ? `'${PIECE_FONTS.kaisho.family}', 'Shippori Mincho B1', serif` : "'Shippori Mincho B1', serif"
  const { i18n } = useTranslation()
  const settings = useSettings()
  const customBoard = style === 'broadcast' && settings.boardStyle.startsWith('sunfish-')
  const t = themeFor(style, customBoard ? settings.boardStyle : null)
  const { position, flipped, selected, selectedColor, targets, lastMove } = props
  const boardW = t.cw * 9
  const boardH = t.ch * 9
  const x0 = t.side
  const y0 = t.pad
  const width = boardW + t.side * 2
  const height = boardH + t.pad * 2
  const handFrame: HandFrame = { x0, y0, boardW, boardH, side: t.side, koma: t.koma }
  const cx = (sq: Square) => x0 + (col(sq.file, flipped) + 0.5) * t.cw
  const cy = (sq: Square) => y0 + (row(sq.rank, flipped) + 0.5) * t.ch
  const onBoard = (event: React.MouseEvent<SVGRectElement>) => {
    const sq = squareAtClick(event, flipped)
    if (sq) props.onSquare(sq)
  }
  useStepAnimation(svgRef, position, lastMove, { cx, cy, ch: t.ch })
  const sign = flipped ? -1 : 1
  const project = (x: number, z: number): [number, number] => [x0 + (4.5 + sign * x) * t.cw, y0 + (4.5 + (sign * z) / SQ_D) * t.ch]
  const handPoint = (color: Color, type: PieceType) => {
    const counts = HAND_ORDER.filter((handType) => position.hand(color).count(handType) > 0)
    const index = counts.indexOf(type)
    if (index === -1) return null
    const { hx, slotY } = handSlots(color, flipped, handFrame, counts.length)
    return { x: ((hx - x0) / t.cw - 4.5) * sign, z: ((slotY(index) - y0) / t.ch - 4.5) * SQ_D * sign }
  }
  return (
    <div className={`app-flat app-flat-${style}`} aria-busy={loading}>
      {(loading || error) && <output className="app-board-loading">{error ?? i18n.t('settings.loadingEvalFile')}</output>}
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- inline interactive SVG cannot be an <img>; role="img" is the standard way to expose it as one image
        role="img"
        aria-label={i18n.t('board.shogiBoard')}
      >
        <rect width={width} height={height} fill={t.bg} />
        {customBoard && baked && <image href={baked.surface} width={width} height={height} preserveAspectRatio="none" />}
        <rect x={x0} y={y0} width={boardW} height={boardH} fill={customBoard ? 'transparent' : t.board} />
        {t.koma ? <UnderMarks props={props} p={project} u={t.cw} /> : <FlatHighlights props={props} style={style} t={t} x0={x0} y0={y0} />}
        <GridLines t={t} x0={x0} y0={y0} boardW={boardW} boardH={boardH} />
        <AxisLabels t={t} x0={x0} y0={y0} boardW={boardW} flipped={flipped} />
        <PieceLayer position={position} flipped={flipped} selected={selected} baked={baked} koma={t.koma} komaFont={komaFont} look={t} cx={cx} cy={cy} />
        {!t.koma && targets.map((sq) => <circle key={`t${sq.usi}`} cx={cx(sq)} cy={cy(sq)} r={12} fill="#2a8f4a" opacity={0.75} pointerEvents="none" />)}
        <rect x={x0} y={y0} width={boardW} height={boardH} fill="transparent" onClick={onBoard} style={{ cursor: 'pointer' }} />
        <HandColumn
          color={Color.BLACK}
          position={position}
          flipped={flipped}
          selected={selected}
          selectedColor={selectedColor}
          frame={handFrame}
          t={t}
          baked={baked}
          komaFont={komaFont}
          onHand={props.onHand}
        />
        <HandColumn
          color={Color.WHITE}
          position={position}
          flipped={flipped}
          selected={selected}
          selectedColor={selectedColor}
          frame={handFrame}
          t={t}
          baked={baked}
          komaFont={komaFont}
          onHand={props.onHand}
        />
        <OverMarks props={props} p={project} u={t.cw} flip={sign} coordFill={t.coord} handPoint={handPoint} />
      </svg>
    </div>
  )
}
