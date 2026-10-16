import { cva } from 'styled-system/css'
import { styled } from 'styled-system/jsx'

export const WelcomeChoices = styled('div', {
  base: { display: 'grid', gap: '2.5', my: '3' },
})

export const WelcomeChoice = styled(
  'button',
  cva({
    base: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '1',
      py: '3',
      px: '4',
      borderRadius: 'lg',
      bg: 'card',
      boxShadow: 'inset 0 0 0 1px {colors.border.strong}',
      textAlign: 'left',
      transition: 'box-shadow {durations.fast}, background {durations.fast}',
      _hover: { boxShadow: 'inset 0 0 0 2px {colors.accent}' },
      '& span': { fontSize: 'xs', opacity: '0.85' },
    },
    variants: {
      primary: {
        true: {
          bg: 'accent',
          color: 'accent.contrast',
          boxShadow: 'none',
          _hover: { bg: 'accent.hover', boxShadow: 'none' },
          '& span': { opacity: '1' },
        },
      },
    },
  }),
)
