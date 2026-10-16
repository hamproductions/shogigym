import { defineRecipe } from '@pandacss/dev'

export const kbd = defineRecipe({
  className: 'kbd',
  base: {
    border: '1px solid color-mix(in srgb, currentColor 50%, transparent)',
    borderRadius: 'l1',
    fontFamily: 'inherit',
    fontSize: '2xs',
    ms: '1',
    px: '1',
    whiteSpace: 'nowrap',
  },
})
