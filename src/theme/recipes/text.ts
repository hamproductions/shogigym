import { defineRecipe } from '@pandacss/dev'

export const text = defineRecipe({
  className: 'text',
  jsx: ['Text'],
  base: {
    margin: '0',
  },
  variants: {
    tone: {
      default: { color: 'fg.default' },
      muted: { color: 'fg.muted' },
      subtle: { color: 'fg.subtle' },
      accent: { color: 'accent.text' },
      success: { color: 'success' },
      warning: { color: 'warning' },
      danger: { color: 'danger' },
      inherit: {},
    },
    size: {
      '2xs': { fontSize: '2xs' },
      xs: { fontSize: 'xs' },
      sm: { fontSize: 'sm' },
      md: { fontSize: 'md' },
      lg: { fontSize: 'lg' },
      xl: { fontSize: 'xl' },
      '2xl': { fontSize: '2xl' },
      inherit: {},
    },
    font: {
      sans: { fontFamily: 'sans' },
      mincho: { fontFamily: 'mincho', fontWeight: 'heavy' },
      inherit: {},
    },
  },
  defaultVariants: {
    tone: 'inherit',
    size: 'inherit',
    font: 'inherit',
  },
})
