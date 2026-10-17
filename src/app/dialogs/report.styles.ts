import { css } from 'styled-system/css'
import { styled } from 'styled-system/jsx'

export const reportText = css({ '& p': { m: '0', lineHeight: 'snug' } })

export const ReportSection = styled('section', { base: { display: 'grid', gap: '2' } })

export const ReportHeading = styled('h3', {
  base: { fontSize: 'xs', fontWeight: 'bold', letterSpacing: 'seal', textTransform: 'uppercase', color: 'fg.muted' },
})

export const ReportPhases = styled('div', {
  base: {
    display: 'grid',
    gap: '1.5',
    '& > div': { display: 'grid', gridTemplateColumns: '96px 1fr minmax(72px, auto)', alignItems: 'center', gap: '2', fontSize: 'sm' },
    '& small': { display: 'block', fontSize: '2xs', whiteSpace: 'nowrap' },
    '& i': { display: 'block', h: '8px', borderRadius: 'full', bg: 'border', overflow: 'hidden' },
    '& b': { display: 'block', h: '100%', w: 'var(--score)', bg: 'accent' },
  },
})

export const reportPattern = css({
  justifyItems: 'start',
  py: '3',
  px: '4',
  borderRadius: 'lg',
  bg: 'color-mix(in srgb, {colors.accent} 10%, {colors.card})',
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, {colors.accent} 40%, transparent)',
})

export const ReportList = styled('ul', { base: { display: 'grid', gap: '2', m: '0', p: '0', listStyle: 'none' } })

export const ReportListItem = styled('li', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    py: '2.5',
    px: '3',
    borderRadius: 'md',
    bg: 'card',
    boxShadow: 'inset 0 0 0 1px {colors.border}',
    '@container (max-width: 420px)': { flexWrap: 'wrap' },
  },
})

export const ReportListBody = styled('div', {
  base: {
    display: 'grid',
    flex: '1',
    minW: '0',
    gap: '0.5',
    fontSize: 'sm',
    '@container (max-width: 420px)': { flexBasis: 'calc(100% - 40px)' },
  },
})

export const reportListShow = css({ '@container (max-width: 420px)': { ml: '40px' } })

export const ReportPraiseItem = styled('li', { base: { display: 'flex', alignItems: 'center', gap: '2' } })
