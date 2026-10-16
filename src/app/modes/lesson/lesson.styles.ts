import { css, cva } from 'styled-system/css'

export const picker = css({ '& > * + *': { mt: '2' } })

export const pickerTitle = css({
  fontFamily: 'mincho',
  fontWeight: 'heavy',
  fontSize: 'xl',
  lineHeight: 'tight',
  '&:not(:first-child)': { mt: '2!' },
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
  base: { m: '0!', color: 'fg.muted', fontSize: 'sm', lineHeight: 'normal' },
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

export const libMatch = css({ color: 'fg.muted', fontSize: 'xs', fontStyle: 'italic' })

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
    _hover: { bg: 'card.hover!' },
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

export const startTag = css({
  display: 'inline-block',
  ml: '2',
  whiteSpace: 'nowrap',
  px: '2',
  borderRadius: 'full',
  bg: 'success.fill',
  color: 'gofun',
  fontFamily: 'sans',
  fontStyle: 'normal',
  fontWeight: 'bold',
  fontSize: '2xs',
  verticalAlign: '2px',
})

export const progressLine = css({ position: 'absolute', left: '0', bottom: '0', h: '2px', bg: 'accent' })

export const lessonCard = css({
  layerStyle: 'card',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  p: '{spacing.3} {spacing.4} {spacing.4}',
  overflow: 'hidden',
})

export const lessonTitle = css({ fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'md', lineHeight: 'snug' })

export const lessonMeta = css({ display: 'flex', justifyContent: 'space-between', gap: '2', color: 'fg.muted', fontSize: 'xs' })

export const lessonButtons = css({ display: 'flex', gap: '2', mt: '1.5', '& .app-btn': { flex: '1' } })

export const sourceNote = css({ mt: '4!', color: 'fg.muted', fontSize: 'xs', '& summary': { cursor: 'pointer' }, '& p': { m: '{spacing.1.5} 0 0' } })

export const progressCount = css({ color: 'fg.muted', fontSize: 'xs', fontWeight: 'bold' })

export const lessonPane = css({ _narrow: { '& > .app-card': { order: '-1', m: '0 0 {spacing.2.5}' } } })

export const studyPane = css({ '& > .app-card': { position: 'relative' } })

export const series = css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2', mb: '2', fontSize: 'sm', fontWeight: 'bold' })

export const seriesBack = css({ flexBasis: '100%', textAlign: 'left' })

export const seriesCount = css({ minWidth: '7em', textAlign: 'center', fontVariantNumeric: 'tabular-nums' })

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

export const mainCurrent = css({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'baseline',
  gap: '3',
  w: '100%',
  m: '{spacing.2} 0 {spacing.3}',
  p: '{spacing.3} {spacing.4}',
  border: '1px solid {colors.border.strong}',
  borderRadius: 'md',
  bg: 'card',
  color: 'fg.default',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  '& span': { color: 'fg.muted', fontSize: 'xs' },
  '& strong': { fontFamily: 'mincho', fontSize: 'lg' },
  '& em': { color: 'accent', fontStyle: 'normal', fontSize: 'sm' },
})

export const mainGrid = css({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '2' })

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

export const resultCount = css({ m: '{spacing.1} 0!', color: 'fg.muted', fontSize: 'xs' })

export const guideStart = css({ w: '100%', m: '{spacing.2} 0' })

export const lessonCheck = css({
  m: '{spacing.3} 0!',
  p: '{spacing.2} {spacing.3}',
  borderRadius: 'md',
  bg: 'card',
  boxShadow: 'inset 0 0 0 1px {colors.border}',
  '& summary': { cursor: 'pointer', fontWeight: 'bold' },
})

export const lessonToc = css({
  '& summary': { cursor: 'pointer', color: 'fg.muted', fontSize: 'sm' },
  '& ol': { m: '{spacing.2} 0 0', pl: '4' },
  '& button': { p: '{spacing.1} 0', color: 'fg.default', fontSize: 'sm', textAlign: 'left' },
  '& button:hover': { color: 'accent' },
})

export const guide = css({ display: 'grid', gap: '2' })

export const guideFoot = css({ display: 'grid', gap: '1.5', pb: '2', borderBottom: '1px solid {colors.border}' })

export const guideHint = css({
  minHeight: '1.5em',
  m: '0',
  overflow: 'hidden',
  color: 'fg.muted',
  fontSize: 'xs',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})

export const guideTop = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })

export const guideCount = css({ color: 'fg.muted', fontSize: 'xs', fontVariantNumeric: 'tabular-nums' })

export const guideBar = css({
  h: '3px',
  borderRadius: '2px',
  bg: 'surface.2',
  overflow: 'hidden',
  '& i': { display: 'block', h: '100%', bg: 'accent' },
})

export const guideNav = css({ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2', mt: '2' })

export const guideBody = css({ minHeight: '14rem' })

export const guideTitle = css({ m: '{spacing.2} 0 0!', fontFamily: 'mincho', fontSize: 'lg', lineHeight: 'snug' })

export const guideText = css({ m: '0', fontSize: 'md', lineHeight: 'mincho' })

export const guideNote = css({ m: '0', color: 'fg.muted', fontSize: 'xs' })

export const guideSource = css({ m: '{spacing.3} 0 0', color: 'fg.muted', fontSize: 'xs' })

export const guideReview = css({
  display: 'grid',
  gap: '2',
  mt: '3',
  p: '3',
  borderRadius: 'md',
  bg: 'card',
  boxShadow: 'inset 0 0 0 1px {colors.border}',
})

export const guideCheck = css({ '& p': { m: '0 0 {spacing.2}' } })

export const squareMark = css({
  '--sq': '#e0b84a',
  p: '0 0.2em',
  borderRadius: '0.25em',
  bg: 'color-mix(in srgb, var(--sq) 38%, transparent)',
  boxShadow: 'inset 0 -2px 0 var(--sq)',
})

export const games = css({
  m: '{spacing.3} 0 {spacing.3}',
  p: '{spacing.2.5} 0 {spacing.3}',
  borderTop: '1px solid {colors.border}',
  borderBottom: '1px solid {colors.border}',
  '& > p': { m: '{spacing.2} 0 0' },
})

export const gameList = css({
  m: '{spacing.2.5} 0 0',
  p: '0',
  listStyle: 'none',
  '& li': { display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '1', mb: '1.5' },
  '& li > .app-role-toggle': { order: '3', flex: '1 0 100%', mb: '1' },
})

export const gameOpen = cva({
  base: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5',
    p: '{spacing.2} {spacing.2.5}',
    borderRadius: 'md',
    bg: 'surface.2',
    textAlign: 'left',
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

export const yourGames = css({ display: 'grid', gap: '1.5', mt: '3' })

export const yourGame = css({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
  alignItems: 'center',
  gap: '2',
  p: '2',
  borderRadius: 'md',
  bg: 'surface.2',
  fontSize: 'sm',
})

export const yourGameTitle = css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

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

export const cropChoice = css({ display: 'flex', justifyContent: 'center', gap: '3', m: '{spacing.1} 0 0', fontSize: 'sm' })

export const cropPiece = css({
  m: '0',
  textAlign: 'center',
  '& svg': { display: 'block', w: '52px', h: '56px', m: '0 auto' },
  '& figcaption': { mt: '1.5', fontSize: 'sm', fontWeight: 'bold', lineHeight: 'snug' },
  '& .koma path': { fill: 'koma.light', stroke: '#a07a3c', strokeWidth: '1' },
  '& .koma text': { fill: 'koma.ink', fontFamily: 'mincho', fontSize: '17px', fontWeight: '800', textAnchor: 'middle' },
  '& .koma text.promoted': { fill: 'koma.red' },
  '& .blank': { fill: 'koma.light', stroke: '#a07a3c', opacity: '0.6' },
})
