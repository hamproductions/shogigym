import { defineSemanticTokens } from '@pandacss/dev'

export const shadows = defineSemanticTokens.shadows({
  xs: { value: { _light: '0 1px 2px rgb(60 40 20 / 0.14)', _dark: '0 1px 2px rgb(0 0 0 / 0.45)' } },
  sm: { value: { _light: '0 1px 2px rgb(60 40 20 / 0.14)', _dark: '0 1px 2px rgb(0 0 0 / 0.45)' } },
  md: { value: { _light: '0 8px 24px rgb(60 40 20 / 0.16)', _dark: '0 8px 24px rgb(0 0 0 / 0.5)' } },
  lg: { value: { _light: '0 24px 64px rgb(40 26 12 / 0.24)', _dark: '0 24px 64px rgb(0 0 0 / 0.6)' } },
  xl: { value: { _light: '0 24px 64px rgb(40 26 12 / 0.24)', _dark: '0 24px 64px rgb(0 0 0 / 0.6)' } },
  '2xl': { value: { _light: '0 24px 64px rgb(40 26 12 / 0.24)', _dark: '0 24px 64px rgb(0 0 0 / 0.6)' } },
  inset: { value: { _light: 'inset 8px 0 12px -8px {colors.gray.a4}', _dark: 'inset 8px 0 12px -8px {colors.black.a6}' } },
})
