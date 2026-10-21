import { styled } from 'styled-system/jsx'

export const Line = styled('div', {
  base: {
    position: 'absolute',
    left: '7%',
    top: '12%',
    display: 'grid',
    transformOrigin: 'left top',
    textShadow: '0 4px 24px rgba(0, 0, 0, 0.8)',
  },
  variants: {
    place: {
      left: {},
      right: { left: 'auto', right: '7%', textAlign: 'right', transformOrigin: 'right top' },
      bottom: { top: 'auto', bottom: '9%', left: '50%', translate: '-50% 0' },
    },
  },
  defaultVariants: { place: 'left' },
})

export const LineHeadline = styled('strong', { base: { fontWeight: '900', fontSize: '76px', lineHeight: '1', letterSpacing: '-0.01em' } })

export const LineAside = styled('em', { base: { fontStyle: 'normal', fontWeight: '700', fontSize: '48px', color: '#e8a33c' } })

export const Label = styled('span', { base: { fontWeight: '800', fontSize: '22px', letterSpacing: '0.4em', color: '#e8a33c' } })
