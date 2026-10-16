import { defineLayerStyles } from '@pandacss/dev'

export const layerStyles = defineLayerStyles({
  card: {
    value: {
      '--tone': 'transparent',
      borderRadius: 'lg',
      background: 'card',
      boxShadow: 'inset 3px 0 0 var(--tone), inset 0 0 0 1px {colors.border}, {shadows.sm}',
    },
  },
  disabled: {
    value: {
      cursor: 'not-allowed',
      opacity: '0.67',
      filter: 'grayscale(100%)',
    },
  },
})
