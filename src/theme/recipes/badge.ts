import { defineRecipe } from '@pandacss/dev'

export const badge = defineRecipe({
  className: 'badge',
  base: {
    bg: 'gray.subtle.bg',
    borderRadius: 'full',
    color: 'fg.default',
    display: 'inline-block',
    fontSize: 'xs',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 'snug',
    px: '2',
    whiteSpace: 'nowrap',
  },
})
