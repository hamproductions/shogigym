import { styled } from 'styled-system/jsx'

const compactButton = { w: '38px', h: '38px', p: '0', justifyContent: 'center' }

const hiddenLabel = { display: 'none' }

export const RailNav = styled('nav', {
  base: {
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
  },
})

export const RailButton = styled('button', {
  base: {
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
  },
})

export const RailSlot = styled('div', { base: { position: 'relative' } })
