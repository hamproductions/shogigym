import { styled } from 'styled-system/jsx'

const railButton = {
  w: '62px',
  p: '{spacing.2} 0 {spacing.1.5}',
  flexDirection: 'column',
  gap: '0.5',
  color: 'fg.muted',
  '&[data-on]': { bg: 'surface.2', color: 'fg.default', boxShadow: 'inset 3px 0 0 {colors.accent}' },
  _short: { w: '42px', p: '{spacing.1.5} 0' },
} as const

const compactButton = { w: '38px', h: '38px', p: '0', justifyContent: 'center' } as const

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
    '.app-shell[data-fs] > &': { display: 'none' },
    _compact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: '2px',
      p: '{spacing.1} {spacing.1.5}',
      borderRight: '0',
      borderBottom: '1px solid {colors.border}',
      overflow: 'hidden',
      '.app-shell[data-panel-side] > &': { gridColumn: '1 / -1' },
    },
    _short: { gap: '2px', pt: '1' },
  },
})

export const RailButton = styled('button', {
  base: {
    flex: 'none',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'md',
    transition: 'background {durations.fast}, color {durations.fast}',
    _hover: { bg: 'surface.2', color: 'fg.default' },
    _disabled: { opacity: '0.35' },
  },
  variants: {
    kind: {
      bar: {
        ...railButton,
        _compact: { ...compactButton, '&[data-on]': { boxShadow: 'none' }, '&[data-tool=tilt]': { display: 'none' } },
      },
      sound: { ...railButton, _compact: compactButton },
      mode: {
        ...railButton,
        _compact: {
          flexDirection: 'row',
          gap: '1',
          w: 'auto',
          h: '38px',
          p: '0 {spacing.2}',
          justifyContent: 'center',
          bg: 'surface.2',
          '&[data-on]': { boxShadow: 'none' },
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
      },
      menu: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: '2.5',
        w: '100%',
        minH: '40px',
        p: '0 {spacing.3}',
        color: 'fg.default',
        '&[data-on]': { bg: 'accent.soft', boxShadow: 'none', _hover: { bg: 'accent.soft' } },
        _compact: { minH: '44px' },
      },
    },
  },
  defaultVariants: { kind: 'bar' },
})

export const RailLabel = styled('span', {
  base: {
    maxW: '100%',
    lineHeight: 'tight',
    textAlign: 'center',
    textWrap: 'balance',
    fontFamily: 'sans',
    fontWeight: 'bold',
    '&.app-ja': { letterSpacing: 'normal' },
    _short: { display: 'none' },
  },
  variants: {
    kind: {
      bar: { fontSize: '2xs', _compact: { display: 'none' } },
      sound: { fontSize: '2xs', _compact: { display: 'none' } },
      mode: { fontSize: '2xs', _compact: { display: 'inline', whiteSpace: 'nowrap', fontSize: 'sm' } },
      menu: { fontSize: 'md' },
    },
  },
  defaultVariants: { kind: 'bar' },
})

export const RailSlot = styled('div', { base: { position: 'relative' } })
