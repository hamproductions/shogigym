import { css, cva } from 'styled-system/css'

export const board3d = css({
  position: 'relative',
  flex: '1',
  minW: '0',
  minH: '0',
  '& canvas': { display: 'block', touchAction: 'none' },
  '&[aria-busy=true] canvas': { visibility: 'hidden' },
})

export const flat = cva({
  base: {
    position: 'relative',
    inset: 'auto',
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minW: '0',
    minH: '0',
    m: '30px 18px',
    overflow: 'hidden',
    isolation: 'isolate',
    '& svg': { w: '100%', h: '100%', userSelect: 'none' },
    _narrow: { m: '0' },
  },
  variants: {
    wood: {
      false: {},
      true: { m: '34px {spacing.2} 40px', '& svg': { touchAction: 'none' } },
    },
  },
  defaultVariants: { wood: false },
})

export const komaLift = cva({
  base: {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.2s ease-out',
  },
  variants: {
    on: {
      false: {},
      true: { transform: 'translateY(-16px) scale(1.12)', filter: 'drop-shadow(0 8px 5px rgba(0, 0, 0, 0.3))' },
    },
  },
  defaultVariants: { on: false },
})

export const boardFrame = css({ stroke: 'none' })
