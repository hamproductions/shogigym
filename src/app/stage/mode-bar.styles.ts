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

export const evaluation = css({
  display: 'contents',
  _compact: { order: '9', flex: 'none', display: 'flex', m: '0 var(--stage-gutter) {spacing.1}' },
})

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
    '& .app-seg [data-part=item]': { w: '46px', minW: '46px', h: '38px', p: '0', fontSize: 'xs', justifyContent: 'center' },
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
