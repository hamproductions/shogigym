import { styled } from 'styled-system/jsx'

export const GameOverPanel = styled('div', {
  base: {
    position: 'absolute',
    left: '50%',
    top: '40%',
    zIndex: 'banner',
    transform: 'translate(-50%, -50%)',
    width: 'max-content',
    maxWidth: 'calc(100% - 24px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2',
    py: '5',
    px: '8',
    borderRadius: 'xl',
    bg: 'overlay',
    boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.lg}',
    textAlign: 'center',
  },
})

export const GameOverHeadline = styled('strong', {
  base: {
    fontFamily: 'mincho',
    fontWeight: 'heavy',
    fontSize: '2xl',
    lineHeight: 'tight',
    letterSpacing: '0.2em',
    color: 'highlight',
    '&:lang(en)': { letterSpacing: 'normal' },
  },
})
