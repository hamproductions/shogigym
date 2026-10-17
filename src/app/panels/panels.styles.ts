import { css, cva } from 'styled-system/css'

export const muted = css({ color: 'fg.muted', fontSize: 'sm' })

export const shell = css({
  _compact: {
    '&[data-drawer-open][data-panel-side]:not([data-fs])': {
      gridTemplateColumns: 'minmax(0, 1fr) clamp(160px, var(--panel-w), 70vw)',
      gridTemplateRows: 'auto minmax(0, 1fr)',
    },
    '&[data-panel-side] > .app-rail': { gridColumn: '1 / -1' },
    '&[data-drawer-open][data-panel-side]:not([data-fs]) > .app-stage': { gridColumn: '1', gridRow: '2' },
  },
})

export const panelHeader = css({
  display: 'flex',
  flex: 'none',
  alignItems: 'center',
  gap: '0.5',
  pr: '1',
  '& > .app-tabs': { flex: '1', minWidth: '0' },
  '& > .app-btn': { flex: 'none', w: '36px', h: '36px', p: '0', m: '0' },
})

export const panelClose = css({ flex: 'none', w: '36px', h: '36px', p: '0', ml: '0', alignSelf: 'center' })

export const panelBody = css({
  flex: '1',
  overflowY: 'auto',
  p: '4',
  _compact: {
    minHeight: '0',
    p: '{spacing.3} {spacing.4} {spacing.6}',
    WebkitOverflowScrolling: 'touch',
    '.app-shell[data-panel-side] &': { px: '3' },
  },
})

export const pinnedGraph = css({ flex: 'none', p: '{spacing.4} {spacing.4} 0', '& > div': { mb: '0' } })

export const moveCounts = css({
  mt: '4',
  pt: '3',
  borderTop: '1px solid {colors.border}',
  fontSize: 'sm',
  '& h3': { fontSize: 'inherit' },
  '& dl': { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '{spacing.1} {spacing.3}', m: '{spacing.2} 0 0' },
  '& dl > div': { display: 'flex', justifyContent: 'space-between', gap: '1' },
  '& dd': { m: '0', fontVariantNumeric: 'tabular-nums' },
})

export const moveButton = css({
  w: '100%',
  py: '1',
  px: '2',
  borderRadius: 'sm',
  fontFamily: 'mincho',
  textAlign: 'left',
  overflowWrap: 'anywhere',
  '&:hover': { bg: 'surface.2' },
  '&[aria-current]': { bg: 'surface.2', boxShadow: 'inset 2px 0 0 {colors.accent}' },
  '[data-in-var] > &': { '&:first-child': { boxShadow: 'inset 2px 0 0 {colors.info}' } },
  _narrow: { px: '1', fontSize: 'sm' },
})

export const plate = css({
  position: 'absolute',
  left: '2',
  zIndex: 'plate',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  p: '{spacing.0.5} {spacing.2.5} {spacing.0.5} {spacing.0.5}',
  borderRadius: 'md',
  bg: 'overlay',
  boxShadow: 'sm',
  fontSize: 'md',
  pointerEvents: 'none',
  '&.top': { top: '2' },
  '&.bottom': { bottom: '2' },
  '& .app-pill': { fontSize: 'sm' },
  '.app-board-wrap[data-eval] &': { left: 'calc(var(--eval-bar-width) + {spacing.2})' },
  _compact: {
    '.app-board-scene > &': { fontSize: 'sm', gap: '1' },
    '& .app-pill': { fontSize: 'xs' },
    '.app-shell[data-drawer-open] &': { display: 'none' },
    '.app-board-wrap[data-eval] &': { left: '2' },
  },
  _short: { fontSize: 'xs', py: '0', '& .app-pill': { display: 'none' } },
})

export const plateSide = css({ pl: '1.5', fontWeight: 'bold', _compact: { pl: '0' } })

export const clock = cva({
  base: {
    minWidth: '64px',
    p: '{spacing.0.5} {spacing.2}',
    borderRadius: 'sm',
    bg: 'surface.3',
    color: 'fg.default',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  variants: {
    state: {
      idle: {},
      on: { bg: 'fg.default', color: 'fg.inverse' },
      low: { bg: 'danger.fill', color: 'onFill' },
      out: { bg: 'danger.strong', color: 'onFill' },
    },
  },
  defaultVariants: { state: 'idle' },
})

export const backLink = css({ p: '{spacing.0.5} 0', color: 'fg.muted', fontSize: 'sm', transition: 'color {durations.fast}', _hover: { color: 'fg.default' } })

export const subHeading = css({ m: '{spacing.4} 0 {spacing.1.5}', color: 'fg.muted', fontSize: 'sm', fontWeight: 'medium' })

export const note = cva({
  base: { m: '0 0 {spacing.2}', p: '{spacing.2.5} {spacing.3}', borderRadius: 'md', bg: 'surface.2', fontFamily: 'mincho', lineHeight: 'mincho' },
  variants: {
    tone: {
      plain: {},
      warn: { boxShadow: 'inset 3px 0 0 {colors.accent}' },
      end: { bg: 'color-mix(in srgb, {colors.fg.default} 6%, transparent)' },
      hint: { display: 'flex', alignItems: 'center' },
      idle: {
        display: 'flex',
        alignItems: 'center',
        pl: '0',
        bg: 'transparent',
        color: 'fg.muted',
        fontFamily: 'sans',
        fontSize: 'sm',
        fontWeight: 'regular',
        lineHeight: 'normal',
      },
    },
  },
  defaultVariants: { tone: 'plain' },
})

export const result = cva({
  base: { m: '0', p: '{spacing.2.5} {spacing.3}', borderRadius: 'md', fontSize: 'sm' },
  variants: {
    tone: {
      none: {},
      right: { bg: 'success.soft', color: 'success' },
      wrong: { bg: 'danger.soft', color: 'danger' },
    },
  },
  defaultVariants: { tone: 'none' },
})

export const pv = css({ lineClamp: '2', m: '0', fontFamily: 'mincho', fontSize: 'sm' })

export const verdictHead = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2.5',
  mb: '2',
  fontSize: 'md',
  '& strong': { fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'lg' },
})

export const verdictLabel = css({ color: 'light-dark(color-mix(in srgb, var(--label) 55%, #000), var(--label))' })

export const badge = css({
  flex: 'none',
  bg: 'light-dark(color-mix(in srgb, var(--label) 56%, #000), var(--label))',
  display: 'grid',
  placeItems: 'center',
  w: '28px',
  h: '28px',
  borderRadius: '50%',
  color: 'onFill',
  fontWeight: 'bold',
  fontSize: 'sm',
})

export const practice = css({ '& > * + *': { mt: '3' }, _narrow: { display: 'flex', flexDirection: 'column' } })

export const taskText = css({
  mb: '0',
  fontFamily: 'mincho',
  fontWeight: 'heavy',
  fontSize: 'lg',
  lineHeight: 'normal',
  _narrow: { order: '-2', fontSize: 'md' },
})

export const narrowColumn = css({ _narrow: { display: 'flex', flexDirection: 'column' } })
