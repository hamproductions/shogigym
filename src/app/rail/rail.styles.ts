import { css } from 'styled-system/css'

const compactButton = { w: '38px', h: '38px', p: '0', justifyContent: 'center' }

const hiddenLabel = { display: 'none' }

export const rail = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1',
  minH: '0',
  p: '{spacing.3} 0',
  bg: 'surface.1',
  borderRight: '1px solid {colors.border}',
  overflowY: 'auto',
  scrollbarWidth: 'none',
  _compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2px',
    p: '{spacing.1} {spacing.1.5}',
    borderRight: '0',
    borderBottom: '1px solid {colors.border}',
    overflow: 'hidden',
    '& > .app-rail-btn': compactButton,
    '& > [data-rail-slot]:not([data-rail-slot=mode]) > .app-rail-btn': compactButton,
    '& > .app-rail-btn > span': hiddenLabel,
    '& > [data-rail-slot]:not([data-rail-slot=mode]) > .app-rail-btn > span': hiddenLabel,
    '& > .app-rail-btn[data-on]': { boxShadow: 'none' },
    '& > [data-rail-slot]:not([data-rail-slot=sound]) > .app-rail-btn[data-on]': { boxShadow: 'none' },
    '& > [data-tool=tilt]': { display: 'none' },
    '& > [data-rail-slot=mode] > .app-rail-btn': {
      flexDirection: 'row',
      gap: '1',
      w: 'auto',
      h: '38px',
      p: '0 {spacing.2}',
      justifyContent: 'center',
      bg: 'surface.2',
      _after: {
        content: '""',
        w: '7px',
        h: '7px',
        ml: '0.5',
        borderRight: '2px solid currentColor',
        borderBottom: '2px solid currentColor',
        transform: 'translateY(-2px) rotate(45deg)',
        opacity: '0.6',
      },
    },
    '& > [data-rail-slot=mode] > .app-rail-btn > span': { display: 'inline', whiteSpace: 'nowrap', fontSize: 'sm', fontWeight: 'bold' },
  },
  _short: { gap: '2px', pt: '1' },
})

export const seal = css({
  flex: 'none',
  w: '44px',
  h: '44px',
  mb: '3',
  '& svg': { w: '100%', h: '100%', filter: 'drop-shadow({shadows.sm})' },
  _compact: { w: '32px', h: '32px', mt: '0', mr: '2px', mb: '0', ml: '0' },
  _short: { transform: 'scale(0.75)' },
})

export const railGap = css({ flex: '1' })

export const railDivider = css({
  flex: 'none',
  w: '60%',
  h: '1px',
  m: '{spacing.1} auto',
  bg: 'border',
  _compact: { w: '1px', h: '60%', m: 'auto {spacing.1}' },
})

export const railButton = css({
  flex: 'none',
  w: '62px',
  p: '{spacing.2} 0 {spacing.1.5}',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5',
  borderRadius: 'md',
  color: 'fg.muted',
  transition: 'background {durations.fast}, color {durations.fast}',
  _hover: { bg: 'surface.2', color: 'fg.default' },
  '&[data-on]': { bg: 'surface.2', color: 'fg.default', boxShadow: 'inset 3px 0 0 {colors.accent}' },
  _disabled: { opacity: '0.35' },
  '& span': {
    maxW: '100%',
    fontSize: '2xs',
    lineHeight: 'tight',
    textAlign: 'center',
    textWrap: 'balance',
    fontFamily: 'sans',
    fontWeight: 'bold',
  },
  '& .app-ja': { letterSpacing: 'normal' },
  _short: { w: '42px', p: '{spacing.1.5} 0', '& > span': { display: 'none' } },
})

export const railSlot = css({ position: 'relative' })

export const railMenu = css({
  fontFamily: 'sans',
  fontSize: 'md',
  lineHeight: 'normal',
  position: 'fixed',
  zIndex: 'dropdown',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
  minW: '200px',
  maxH: 'calc(100dvh - 72px)',
  overflowY: 'auto',
  p: '1.5',
  borderRadius: 'lg',
  bg: 'surface.1',
  boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.md}',
  '& .app-rail-btn': {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '2.5',
    w: '100%',
    minH: '40px',
    p: '0 {spacing.3}',
    color: 'fg.default',
  },
  '& .app-rail-btn span': { fontSize: 'md' },
  '& .app-rail-btn[data-on]': { bg: 'accent.soft', boxShadow: 'none' },
  '& .app-rail-btn[data-on]:not(:disabled):hover': { bg: 'accent.soft' },
  _compact: { minW: '220px', '& .app-rail-btn': { minH: '44px' } },
})

export const soundPop = css({
  position: 'fixed',
  zIndex: 'modal',
  display: 'none',
  alignItems: 'center',
  p: '{spacing.2} {spacing.3}',
  borderRadius: 'md',
  bg: 'panel',
  boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.md}',
  transform: 'translateY(-50%)',
  _before: { content: '""', position: 'absolute', inset: '0 100% 0 -10px' },
  '&[data-open]': { display: 'flex' },
  '&[data-compact]': { transform: 'translateX(-50%)', _before: { inset: '-10px 0 100% 0' } },
  '& input': { w: '140px', accentColor: 'accent' },
})
