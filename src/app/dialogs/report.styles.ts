import { styled } from 'styled-system/jsx'
import { Button } from '@/app/ui/Button'

export const ReportSection = styled('section', { base: { display: 'grid', gap: '2' } })

export const ReportHeading = styled('h3', {
  base: { fontSize: 'xs', fontWeight: 'bold', letterSpacing: 'seal', textTransform: 'uppercase', color: 'fg.muted' },
})

export const ReportPhases = styled('div', { base: { display: 'grid', gap: '1.5' } })

export const ReportPhase = styled('div', {
  base: { display: 'grid', gridTemplateColumns: '96px 1fr minmax(72px, auto)', alignItems: 'center', gap: '2', fontSize: 'sm' },
})

export const ReportPhaseDetail = styled('small', { base: { display: 'block', fontSize: '2xs', whiteSpace: 'nowrap' } })

export const ReportBar = styled('i', { base: { display: 'block', h: '8px', borderRadius: 'full', bg: 'border', overflow: 'hidden' } })

export const ReportBarFill = styled('b', { base: { display: 'block', h: '100%', w: 'var(--score)', bg: 'accent' } })

export const ReportPattern = styled('div', {
  base: {
    justifyItems: 'start',
    py: '3',
    px: '4',
    borderRadius: 'lg',
    bg: 'color-mix(in srgb, {colors.accent} 10%, {colors.card})',
    boxShadow: 'inset 0 0 0 1px color-mix(in srgb, {colors.accent} 40%, transparent)',
  },
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

export const ReportShow = styled(Button, { base: { '@container (max-width: 420px)': { ml: '40px' } } })

export const ReportPraiseItem = styled('li', { base: { display: 'flex', alignItems: 'center', gap: '2' } })
