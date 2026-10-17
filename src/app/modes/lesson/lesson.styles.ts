import { css, cva } from 'styled-system/css'

export const picker = css({ '& > * + *:not([data-spaced])': { mt: '2' } })

export const pickerTitle = css({
  fontFamily: 'mincho',
  fontWeight: 'heavy',
  fontSize: 'xl',
  lineHeight: 'tight',
  '&:not(:first-child)': { mt: '2' },
  '& span': {
    display: 'block',
    mt: '0.5',
    fontFamily: 'sans',
    fontWeight: 'regular',
    fontSize: 'sm',
    lineHeight: 'normal',
    color: 'fg.muted',
  },
})

export const pickerIntro = cva({
  base: { m: '0', color: 'fg.muted', fontSize: 'sm', lineHeight: 'normal' },
  variants: {
    kind: {
      plain: {},
      overview: { whiteSpace: 'pre-line' },
      plan: { color: 'fg.default' },
    },
  },
  defaultVariants: { kind: 'plain' },
})

export const libJa = css({ fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'md' })

export const libEn = css({ color: 'fg.muted', fontSize: 'xs' })

export const setupButton = cva({
  base: {
    layerStyle: 'card',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    w: '100%',
    p: '{spacing.2.5} {spacing.3} {spacing.3} {spacing.4}',
    overflow: 'hidden',
    textAlign: 'left',
    transition: 'background {durations.fast}',
    _hover: { bg: 'card.hover' },
  },
  variants: {
    found: {
      false: {},
      true: { gap: '2px', h: 'auto', fontSize: 'sm' },
    },
  },
  defaultVariants: { found: false },
})

export const setupGo = css({ gridColumn: '2', gridRow: '1 / span 2', alignSelf: 'center', color: 'fg.muted', fontSize: '24px' })

export const progressLine = css({ position: 'absolute', left: '0', bottom: '0', h: '2px', bg: 'accent' })

export const feedback = cva({
  base: {
    h: 'calc(2em * {lineHeights.normal} + 2 * {spacing.3})',
    overflowY: 'auto',
    mt: '2',
    '& > p': { m: '0' },
  },
  variants: {
    floating: {
      false: {},
      true: {
        position: 'absolute',
        bottom: 'calc(100% + {spacing.2})',
        left: '0',
        right: '0',
        h: 'auto',
        maxH: 'calc(2em * {lineHeights.normal} + 2 * {spacing.3})',
        m: '0',
        mt: '0',
        bg: 'surface.1',
        borderRadius: 'md',
        zIndex: 'hud',
        '&:empty': { display: 'none' },
      },
    },
  },
  defaultVariants: { floating: false },
})

export const mainChip = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    p: '3',
    border: '1px solid {colors.border}',
    borderRadius: 'md',
    bg: 'card',
    color: 'fg.default',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    '& strong': { fontFamily: 'mincho' },
    '& span': { color: 'fg.muted', fontSize: 'xs' },
  },
  variants: {
    on: {
      false: {},
      true: { borderColor: 'accent', boxShadow: 'inset 0 0 0 1px {colors.accent}' },
    },
  },
  defaultVariants: { on: false },
})

export const guideStart = css({ w: '100%', m: '{spacing.2} 0' })

export const guideSource = css({ m: '{spacing.3} 0 0', color: 'fg.muted', fontSize: 'xs' })

export const gameOpen = cva({
  base: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0',
    minW: '0',
    p: '{spacing.1.5} {spacing.2.5}',
    borderRadius: 'md',
    bg: 'surface.2',
    textAlign: 'left',
    '& strong': { maxW: '100%', overflow: 'hidden', fontSize: 'sm', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    '& span': { color: 'fg.muted', fontSize: 'xs' },
  },
  variants: {
    on: {
      false: {},
      true: { boxShadow: 'inset 3px 0 0 {colors.accent}' },
    },
  },
  defaultVariants: { on: false },
})

export const resultChip = cva({
  base: { p: '2px {spacing.2}', borderRadius: 'full', bg: 'surface.3', fontWeight: 'bold', fontSize: 'xs' },
  variants: {
    outcome: {
      none: {},
      win: { bg: 'success.soft', color: 'success' },
      loss: { bg: 'color-mix(in srgb, {colors.danger} 18%, transparent)', color: 'danger' },
      resigned: { bg: 'color-mix(in srgb, {colors.danger} 18%, transparent)', color: 'danger' },
      time: { bg: 'color-mix(in srgb, {colors.danger} 18%, transparent)', color: 'danger' },
    },
  },
  defaultVariants: { outcome: 'none' },
})

export const illustration = css({
  position: 'absolute',
  inset: '0',
  zIndex: '20',
  display: 'grid',
  placeItems: 'center',
  p: '4',
  pointerEvents: 'none',
  '& > div': {
    maxW: 'min(100%, 760px)',
    maxH: '100%',
    overflow: 'auto',
    p: '4',
    borderRadius: 'lg',
    bg: 'color-mix(in srgb, {colors.gofun} 96%, transparent)',
    color: 'koma.ink',
    boxShadow: 'lg',
    pointerEvents: 'auto',
  },
  '@media (max-width: 640px)': { p: '2', '& > div': { p: '3' } },
})

export const crop = cva({
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '4',
    '& svg .grid': { stroke: '#3a322a', strokeWidth: '1' },
    '& svg .edge': { stroke: '#1d140c', strokeWidth: '3' },
    '& svg .zone': { fill: '#e4dfd6' },
    '& svg .hl': { fill: '#c9c9f5' },
    '& svg .hl-y': { fill: '#ece28a' },
    '& svg .coord': { fill: '#62574a', fontSize: '11px', textAnchor: 'middle' },
    '& svg .region': { fill: 'rgb(98 87 74 / 55%)', fontSize: '20px', fontWeight: '800', textAnchor: 'middle' },
    '& svg .koma path': { fill: 'koma.light', stroke: '#a07a3c', strokeWidth: '1' },
    '& svg .koma text': { fill: 'koma.ink', fontFamily: 'mincho', fontSize: '17px', fontWeight: '800', textAnchor: 'middle' },
    '& svg .koma text.promoted': { fill: 'koma.red' },
    '& svg .ghost path': { fill: 'none', stroke: 'ai.600', strokeWidth: '1.5', strokeDasharray: '3 3' },
    '& svg .dot': { fill: '#7b7bf0' },
    '& svg .dot-y': { fill: '#c9bf12' },
    '& svg .badge circle': { fill: 'rgb(110 110 230 / 85%)' },
    '& svg .badge text': { fill: '#fff', fontSize: '11px', fontWeight: '700', textAnchor: 'middle' },
    '& svg .arrow': { strokeWidth: '3', strokeLinecap: 'round' },
    '& svg .arrow.dashed': { strokeWidth: '2', strokeDasharray: '5 4' },
    '& svg .no': { fill: '#c4442a', fontSize: '18px', fontWeight: '800', textAnchor: 'middle' },
    '& svg .hand rect': { fill: '#fff', stroke: '#857a6b' },
    '& svg .hand-label': { fill: '#62574a', fontSize: '11px', fontWeight: '700', textAnchor: 'middle' },
    '& svg .callout': { fill: '#c4442a', fontSize: '13px', fontWeight: '800' },
    '@media (max-width: 640px)': { flexWrap: 'nowrap', gap: '2' },
  },
  variants: {
    layout: {
      panels: {},
      cycle: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      pieces: { gap: '3' },
    },
  },
  defaultVariants: { layout: 'panels' },
})

export const cropPanel = cva({
  base: {
    m: '0',
    textAlign: 'center',
    '& svg': { display: 'block', maxW: '100%', h: 'auto', maxH: '52vh', m: '0 auto' },
    '& figcaption': { mt: '1.5', fontSize: 'sm', fontWeight: 'bold', lineHeight: 'snug' },
    '& .verdict': { mr: '1', fontSize: 'md' },
    '@media (max-width: 640px)': { flex: '1 1 0', minW: '0', '& figcaption': { fontSize: 'xs' }, '& svg': { maxH: '34vh' } },
  },
  variants: {
    verdict: {
      none: {},
      ok: { '& .verdict': { color: 'ai.600' } },
      ng: { '& .verdict': { color: '#c4442a' } },
    },
  },
  defaultVariants: { verdict: 'none' },
})
