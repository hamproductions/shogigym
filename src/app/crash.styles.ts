import { css } from 'styled-system/css'
import { seigaiha } from '@/app/layout.styles'

export const crashScreen = css({
  position: 'relative',
  isolation: 'isolate',
  minH: '100dvh',
  display: 'grid',
  placeItems: 'center',
  p: '6',
  bg: 'surface.0',
  _before: { ...seigaiha },
})

export const crashCard = css({
  w: 'min(100%, 520px)',
  p: 'clamp(24px, 6vw, 48px)',
  border: '1px solid {colors.border}',
  borderRadius: 'lg',
  bg: 'panel',
  color: 'fg.default',
  fontFamily: 'sans',
  lineHeight: 'normal',
  boxShadow: 'md',
  '& img': { mb: '4' },
  '& h1': { m: '0 0 {spacing.3}', fontFamily: 'mincho', fontSize: 'xl' },
  '& p': { color: 'fg.muted', m: '0 0 {spacing.4}' },
  '& button': {
    p: '{spacing.2} {spacing.4}',
    border: '0',
    borderRadius: 'md',
    bg: 'accent',
    color: 'accent.contrast',
    font: 'inherit',
    cursor: 'pointer',
  },
  '& details': { mt: '4', fontSize: 'sm', color: 'fg.muted' },
  '& summary': { cursor: 'pointer', w: 'fit-content' },
  '& details p, & pre': { mt: '3' },
  '& pre': { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 'xs' },
  '& :focus-visible': { outline: '2px solid {colors.focus}', outlineOffset: '3px' },
})

export const crashReset = css({ bg: 'surface.2', color: 'fg.muted' })
