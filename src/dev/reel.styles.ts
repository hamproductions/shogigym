import { css, cva } from 'styled-system/css'

const brush = "'Yuji Boku', 'Shippori Mincho B1', serif"

const label = { fontWeight: '800', fontSize: '22px', letterSpacing: '0.4em', color: '#e8a33c' }

export const reel = css({ position: 'fixed', inset: '0', bg: '#0c0a08', fontFamily: 'sans' })

export const stage = css({ position: 'absolute', inset: '0', '& > .board3d': { position: 'absolute', inset: '0' } })

export const overlay = css({ position: 'absolute', inset: '0', pointerEvents: 'none', color: '#fff6e4' })

export const title = css({
  position: 'absolute',
  left: '7%',
  bottom: '14%',
  display: 'grid',
  transformOrigin: 'left bottom',
  '& span': label,
  '& strong': {
    fontFamily: brush,
    fontWeight: '400',
    fontSize: '170px',
    lineHeight: '1',
    textShadow: '0 0 40px rgba(232, 80, 40, 0.7), 0 6px 0 rgba(0, 0, 0, 0.5)',
  },
})

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

export const card = css({
  position: 'absolute',
  left: '50%',
  top: '44%',
  w: '62%',
  borderRadius: '14px',
  overflow: 'hidden',
  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 0 2px rgba(232, 163, 60, 0.6)',
  '& img': { display: 'block', w: '100%' },
})

export const kicker = css({
  ...label,
  position: 'absolute',
  right: '7%',
  top: '10%',
  fontSize: '40px',
  color: '#ff5a3c',
  textShadow: '0 0 24px rgba(255, 70, 40, 0.8)',
  transformOrigin: 'right top',
})

export const end = css({
  position: 'absolute',
  inset: '0',
  display: 'grid',
  placeContent: 'center',
  justifyItems: 'center',
  gap: '10px',
  background: 'radial-gradient(circle at 50% 50%, rgba(12, 10, 8, 0.55), rgba(12, 10, 8, 0.92))',
  '& strong': { fontFamily: brush, fontWeight: '400', fontSize: '150px', lineHeight: '1', textShadow: '0 0 40px rgba(232, 80, 40, 0.6)' },
  '& span': { fontWeight: '700', fontSize: '30px' },
  '& em': { minH: '1.3em', fontStyle: 'normal', fontFamily: 'ui-monospace, monospace', fontSize: '28px', color: '#e8a33c' },
})

export const flash = css({ position: 'absolute', inset: '0', bg: '#fff', mixBlendMode: 'screen' })
