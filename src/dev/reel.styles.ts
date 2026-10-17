import { cva } from 'styled-system/css'

export const line = cva({
  base: {
    position: 'absolute',
    left: '7%',
    top: '12%',
    display: 'grid',
    transformOrigin: 'left top',
    textShadow: '0 4px 24px rgba(0, 0, 0, 0.8)',
    '& strong': { fontWeight: '900', fontSize: '76px', lineHeight: '1', letterSpacing: '-0.01em' },
    '& em': { fontStyle: 'normal', fontWeight: '700', fontSize: '48px', color: '#e8a33c' },
  },
  variants: {
    place: {
      left: {},
      right: { left: 'auto', right: '7%', textAlign: 'right', transformOrigin: 'right top' },
      bottom: { top: 'auto', bottom: '9%', left: '50%', translate: '-50% 0', '& strong': { fontSize: '54px' } },
    },
  },
  defaultVariants: { place: 'left' },
})
