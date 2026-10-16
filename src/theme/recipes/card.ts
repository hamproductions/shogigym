import { defineSlotRecipe } from '@pandacss/dev'

export const card = defineSlotRecipe({
  className: 'card',
  slots: ['root', 'title', 'body'],
  base: {
    root: {
      '--tone': 'transparent',
      bg: 'card',
      borderRadius: 'l3',
      boxShadow: 'inset 3px 0 0 var(--tone), inset 0 0 0 1px {colors.border}, {shadows.sm}',
      mt: '3',
      px: '4',
      py: '3',
      '& > strong': {
        display: 'block',
        fontFamily: 'mincho',
        fontSize: 'lg',
        fontWeight: 'heavy',
        lineHeight: 'snug',
      },
      '& > .app-btn, & > .app-actions': {
        mt: '2',
      },
      '& p': {
        fontSize: 'sm',
        lineHeight: 'normal',
        my: '1.5',
      },
    },
    title: {
      display: 'block',
      fontFamily: 'mincho',
      fontSize: 'lg',
      fontWeight: 'heavy',
      lineHeight: 'snug',
    },
    body: {},
  },
  variants: {
    tone: {
      neutral: {},
      good: { root: { '--tone': '{colors.success}' } },
      bad: { root: { '--tone': '{colors.danger}' } },
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})
