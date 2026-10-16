import { css } from 'styled-system/css'

export const page = css({
  minH: '100dvh',
  p: '4',
  bg: 'surface.0',
  color: 'fg.default',
  fontFamily: 'sans',
  overflow: 'auto',
})

export const komadaiHeadings = css({
  '& h1': { m: '0 0 {spacing.3}', fontSize: 'xl' },
  '& h2': { m: '{spacing.5} 0 {spacing.2}', fontSize: 'md' },
})

export const komadaiGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '3',
  '& figure': { m: '0' },
  '& figcaption': { color: 'fg.muted', fontSize: 'xs', wordBreak: 'break-all' },
})

export const typefacePage = css({ boxSizing: 'border-box', w: 'min(1760px, 100%)', mx: 'auto' })

export const typefaceHeader = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'end',
  gap: '{spacing.2} {spacing.4}',
  mb: '4',
  pb: '3',
  borderBottom: '1px solid {colors.border}',
  '& h1': { m: '0', fontSize: 'xl' },
  '& p': { m: '0', color: 'fg.muted', fontSize: 'sm', textAlign: 'right' },
  _phone: {
    alignItems: 'flex-start',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '1',
    '& p': { textAlign: 'left' },
  },
})

export const typefaceSet = css({
  mb: '4',
  p: 'clamp({spacing.3}, 1.5vw, {spacing.5})',
  border: '1px solid {colors.border}',
  borderRadius: 'lg',
  bg: 'panel',
  '& h2': { m: '0 0 {spacing.2}', fontSize: 'md' },
})

export const typefaceGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: 'clamp({spacing.2}, 1.25vw, {spacing.4})',
  '& figure': {
    display: 'grid',
    minW: '0',
    gap: '2',
    m: '0',
    p: '2',
    border: '1px solid {colors.border}',
    borderRadius: 'md',
    bg: 'card',
  },
  '& img': {
    display: 'block',
    w: '100%',
    aspectRatio: '1',
    borderRadius: 'sm',
    bg: '#f5e3bd',
    objectFit: 'contain',
  },
  '& figcaption': {
    color: 'fg.muted',
    fontSize: 'xs',
    lineHeight: 'tight',
    textAlign: 'center',
    minH: '1lh',
  },
})
