import { css, cva } from 'styled-system/css'

export const modeBar = cva({
  base: {
    position: 'relative',
    zIndex: 'hud',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '3',
    m: '{spacing.3} var(--stage-gutter) 0',
    p: '{spacing.2} {spacing.3} {spacing.2} {spacing.2}',
    borderRadius: 'lg',
    bg: 'overlay',
    boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.sm}',
    _compact: { display: 'contents' },
    _short: {
      gap: '2',
      m: '{spacing.1} var(--stage-gutter) 0',
      p: '{spacing.1} {spacing.2} {spacing.1} {spacing.1}',
      '& .app-btn': { whiteSpace: 'nowrap', py: '1' },
    },
  },
  variants: {
    mode: {
      spar: { '--mode': 'colors.mode.spar' },
      analyze: { '--mode': 'colors.mode.analyze' },
      study: { '--mode': 'colors.mode.study' },
      quiz: { '--mode': 'colors.mode.quiz' },
      drill: { '--mode': 'colors.mode.drill' },
      tsume: { '--mode': 'colors.mode.tsume' },
      tesuji: { '--mode': 'colors.mode.tesuji' },
      view: { '--mode': 'colors.mode.analyze' },
    },
  },
})

export const heading = css({
  display: 'contents',
  _compact: {
    order: '-1',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    m: 'var(--stage-gutter) var(--stage-gutter) 0',
    p: '1.5',
    borderRadius: 'lg',
    bg: 'overlay',
    boxShadow: 'inset 0 0 0 1px {colors.border}',
    '[data-sheet-up] &': { display: 'none' },
  },
})

export const seal = css({
  flex: 'none',
  display: 'grid',
  placeItems: 'center',
  minW: '48px',
  h: '48px',
  p: '0 {spacing.2}',
  borderRadius: 'md',
  bg: 'var(--mode, {colors.accent})',
  color: 'mode.ink',
  fontFamily: 'mincho',
  fontWeight: 'heavy',
  fontSize: 'lg',
  letterSpacing: 'seal',
  _compact: { minW: '32px', h: '32px', fontSize: 'sm' },
  _short: { minW: '30px', h: '30px', fontSize: 'sm' },
})

export const headingText = css({ flex: '1', minW: '0', display: 'flex', flexDirection: 'column', _compact: { flex: '1 1 0' } })

export const title = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'mincho',
  fontWeight: 'heavy',
  fontSize: 'lg',
  lineHeight: 'snug',
  _compact: { display: 'block', fontSize: 'sm' },
  _short: { fontSize: 'md' },
})

export const instruction = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: 'fg.muted',
  fontSize: 'sm',
  _compact: { display: 'none' },
  _short: { display: 'none' },
})

export const lastMove = css({
  flex: 'none',
  w: '9em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  lineHeight: 'tight',
  _compact: { gap: '0', w: '8em', ml: 'auto' },
})

export const lastMoveText = css({
  maxW: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'mincho',
  fontWeight: 'heavy',
  fontSize: 'xl',
  color: 'highlight',
  _compact: { fontSize: 'md' },
  _short: { fontSize: 'md' },
})

export const ply = css({ color: 'fg.muted', fontSize: '2xs', _compact: { display: 'block' }, _short: { display: 'none' } })

export const turn = css({ color: 'fg.muted', fontSize: 'xs', _compact: { display: 'block' }, _short: { display: 'none' } })

export const evaluation = css({
  display: 'contents',
  _compact: { order: '9', flex: 'none', display: 'flex', m: '0 var(--stage-gutter) {spacing.1}' },
})

export const evalChip = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  p: '{spacing.1} {spacing.2.5}',
  borderRadius: 'md',
  bg: 'surface.2',
  fontSize: 'sm',
  whiteSpace: 'nowrap',
  '&[data-bar]': { display: 'none' },
  _compact: { order: '3', flex: '1', h: '28px', p: '{spacing.1} {spacing.2}', '&[data-bar]': { display: 'inline-flex' } },
})

export const evalLabel = css({ color: 'fg.muted', fontSize: 'xs', _compact: { display: 'inline' } })

export const evalTrack = css({
  position: 'relative',
  w: '160px',
  h: '14px',
  borderRadius: 'full',
  bg: 'meter.track',
  overflow: 'hidden',
  '& > span': { position: 'absolute', inset: '0 auto 0 0', bg: 'meter.fill' },
  _compact: { flex: '1', w: 'auto', h: '12px' },
})

export const evalValue = css({ minW: '56px', fontSize: 'md', fontVariantNumeric: 'tabular-nums', _compact: { minW: '0' } })

export const controls = css({
  display: 'contents',
  '& .app-btn': { flex: 'none', whiteSpace: 'nowrap' },
  _compact: {
    order: '10',
    flex: 'none',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '1',
    maxW: '100%',
    m: '0 var(--stage-gutter) var(--stage-gutter)',
    p: '{spacing.1.5} {spacing.1.5} max({spacing.1.5}, env(safe-area-inset-bottom))',
    borderRadius: 'lg',
    bg: 'overlay',
    boxShadow: 'inset 0 0 0 1px {colors.border}',
    '& .app-btn': { w: '38px', minW: '38px', h: '38px', minH: '38px', p: '0', justifyContent: 'center', fontSize: 'xs' },
    '& .app-btn svg': { w: '18px', h: '18px' },
    '& .app-seg': { gap: '1' },
    '& .app-seg [data-part=item]': { w: '46px', minW: '46px', h: '38px', p: '0', fontSize: 'xs' },
    '@media (max-width: 360px)': { m: '0 {spacing.0.5} var(--stage-gutter)' },
  },
})

export const tools = css({
  display: 'contents',
  _compact: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    minW: '0',
    h: '38px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '& > *': { flexShrink: '0' },
  },
})

export const controlIcon = css({ display: 'none', _compact: { display: 'inline-flex' } })

export const controlLabel = css({ _compact: { display: 'none' } })

export const helpToggle = css({ _on: { bg: 'success.soft', color: 'success', boxShadow: 'none' }, _compact: { order: '5', ml: 'auto' } })

export const boardFlip = css({ _compact: { order: '1' } })

export const takeBack = css({ _compact: { order: '2' } })

export const resign = css({ _compact: { order: '3' } })

export const gameSetup = css({ _compact: { order: '4' } })

export const miniNav = css({ flex: 'none', display: 'flex', gap: '1', '& .app-btn': { minW: '34px' }, _compact: { order: '6', gap: '0.5', ml: '0' } })

export const miniStep = css({
  _compact: { display: 'inline-flex' },
  '[data-panel-open] > &': { display: 'none', _compact: { display: 'inline-flex' } },
})

export const miniWideLabel = css({ '@media (max-width: 1300px)': { display: 'none' } })

export const barSelect = css({ w: 'auto', flex: 'none', '& [data-part=trigger]': { maxW: '11em', fontSize: 'sm' } })

export const botSettings = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  color: 'fg.muted',
  fontSize: 'xs',
  '& + &': { mt: '3' },
  '& [data-scope=select][data-part=root]': { w: 'auto' },
  '& [data-scope=select][data-part=trigger]': { maxW: '200px', fontSize: 'xs' },
})
