import { css } from 'styled-system/css'
import { styled } from 'styled-system/jsx'
import { Button } from '@/app/ui/Button'

export const ModeBarHeader = styled('header', {
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
    '.app-shell[data-fs] &': { display: 'none' },
    _compact: { display: 'contents' },
    _short: {
      gap: '2',
      m: '{spacing.1} var(--stage-gutter) 0',
      p: '{spacing.1} {spacing.2} {spacing.1} {spacing.1}',
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

export const Evaluation = styled('div', {
  base: {
    display: 'contents',
    _compact: { order: '9', flex: 'none', display: 'flex', m: '0 var(--stage-gutter) {spacing.1}' },
  },
})

export const Controls = styled('div', {
  base: {
    display: 'contents',
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
      '@media (max-width: 360px)': { m: '0 {spacing.0.5} var(--stage-gutter)' },
    },
  },
})

export const BarButton = styled(Button, {
  base: {
    flex: 'none',
    whiteSpace: 'nowrap',
    _compact: { w: '38px', minW: '38px', h: '38px', minH: '38px', p: '0', justifyContent: 'center', fontSize: 'xs' },
    _short: { py: '1' },
  },
})

export const barIcon = css({ _compact: { w: '18px', h: '18px' } })

export const barSegments = css({
  _compact: { flexShrink: '0', gap: '1', '& [data-part=item]': { w: '46px', minW: '46px', h: '38px', p: '0', fontSize: 'xs', justifyContent: 'center' } },
})

export const Tools = styled('div', {
  base: {
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
    },
  },
})

export const ControlIcon = styled('span', { base: { display: 'none', _compact: { display: 'inline-flex' } } })

export const ControlLabel = styled('span', { base: { _compact: { display: 'none' } } })

export const HelpToggle = styled(BarButton, {
  base: { _on: { bg: 'success.soft', color: 'success', boxShadow: 'none' }, _compact: { order: '5', ml: 'auto' } },
})

export const TakeBack = styled(BarButton, { base: { _compact: { order: '2' } } })

export const MiniNav = styled('div', { base: { flex: 'none', display: 'flex', gap: '1', _compact: { order: '6', gap: '0.5', ml: '0' } } })

export const MiniNavButton = styled(BarButton, { base: { minW: '34px' } })

export const MiniStep = styled(MiniNavButton, {
  base: {
    _compact: { display: 'inline-flex' },
    '[data-panel-open] > &': { display: 'none', _compact: { display: 'inline-flex' } },
  },
})

export const MiniWideLabel = styled('span', { base: { '@media (max-width: 1300px)': { display: 'none' } } })

export const barSelect = css({ w: 'auto', flex: 'none', '& [data-part=trigger]': { maxW: '11em', fontSize: 'sm' } })

export const watchSelect = css({ w: 'auto', '& [data-scope=select][data-part=trigger]': { maxW: '200px', fontSize: 'xs' } })
