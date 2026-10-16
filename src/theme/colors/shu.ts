import { defineSemanticTokens } from '@pandacss/dev'

export const shu = defineSemanticTokens.colors({
  '1': { value: { _light: '#fff8f5', _dark: '#1d120e' } },
  '2': { value: { _light: '#fdeee8', _dark: '#24150f' } },
  '3': { value: { _light: '#fadcd2', _dark: '#3a1a10' } },
  '4': { value: { _light: '#f6c9bb', _dark: '#4c1d10' } },
  '5': { value: { _light: '#f0b4a2', _dark: '#5c2414' } },
  '6': { value: { _light: '#e89c86', _dark: '#6e2e1b' } },
  '7': { value: { _light: '#dc7f64', _dark: '#893c24' } },
  '8': { value: { _light: '#cf6345', _dark: '#b04a2c' } },
  '9': { value: { _light: '#b3361c', _dark: '#c4442a' } },
  '10': { value: { _light: '#a3301a', _dark: '#b3361c' } },
  '11': { value: { _light: '#a3301a', _dark: '#f08a6c' } },
  '12': { value: { _light: '#4a1a0f', _dark: '#fbd3c6' } },
  a1: { value: { _light: 'rgba(179, 54, 28, 0.03)', _dark: 'rgba(240, 138, 108, 0.03)' } },
  a2: { value: { _light: 'rgba(179, 54, 28, 0.06)', _dark: 'rgba(240, 138, 108, 0.06)' } },
  a3: { value: { _light: 'rgba(179, 54, 28, 0.12)', _dark: 'rgba(240, 138, 108, 0.16)' } },
  a4: { value: { _light: 'rgba(179, 54, 28, 0.18)', _dark: 'rgba(240, 138, 108, 0.22)' } },
  a5: { value: { _light: 'rgba(179, 54, 28, 0.26)', _dark: 'rgba(240, 138, 108, 0.3)' } },
  a6: { value: { _light: 'rgba(179, 54, 28, 0.36)', _dark: 'rgba(240, 138, 108, 0.38)' } },
  a7: { value: { _light: 'rgba(179, 54, 28, 0.5)', _dark: 'rgba(240, 138, 108, 0.5)' } },
  a8: { value: { _light: 'rgba(179, 54, 28, 0.66)', _dark: 'rgba(240, 138, 108, 0.66)' } },
  a9: { value: { _light: 'rgba(179, 54, 28, 0.9)', _dark: 'rgba(240, 138, 108, 0.8)' } },
  a10: { value: { _light: 'rgba(163, 48, 26, 0.92)', _dark: 'rgba(240, 138, 108, 0.86)' } },
  a11: { value: { _light: 'rgba(163, 48, 26, 0.96)', _dark: 'rgba(240, 138, 108, 0.94)' } },
  a12: { value: { _light: 'rgba(74, 26, 15, 0.96)', _dark: 'rgba(251, 211, 198, 0.96)' } },
  solid: {
    bg: {
      DEFAULT: { value: { _light: '{colors.shu.9}', _dark: '{colors.shu.9}' } },
      hover: { value: { _light: '{colors.shu.10}', _dark: '{colors.shu.10}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.gofun}', _dark: '{colors.gofun}' } } },
  },
  subtle: {
    bg: {
      DEFAULT: { value: { _light: '{colors.shu.a3}', _dark: '{colors.shu.a3}' } },
      hover: { value: { _light: '{colors.shu.a4}', _dark: '{colors.shu.a4}' } },
      active: { value: { _light: '{colors.shu.a5}', _dark: '{colors.shu.a5}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.shu.11}', _dark: '{colors.shu.11}' } } },
  },
  surface: {
    bg: {
      DEFAULT: { value: { _light: '{colors.shu.2}', _dark: '{colors.shu.2}' } },
      hover: { value: { _light: '{colors.shu.3}', _dark: '{colors.shu.3}' } },
      active: { value: { _light: '{colors.shu.4}', _dark: '{colors.shu.4}' } },
    },
    border: {
      DEFAULT: { value: { _light: '{colors.shu.6}', _dark: '{colors.shu.6}' } },
      hover: { value: { _light: '{colors.shu.7}', _dark: '{colors.shu.7}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.shu.11}', _dark: '{colors.shu.11}' } } },
  },
  outline: {
    bg: {
      hover: { value: { _light: '{colors.shu.a2}', _dark: '{colors.shu.a2}' } },
      active: { value: { _light: '{colors.shu.a3}', _dark: '{colors.shu.a3}' } },
    },
    border: { DEFAULT: { value: { _light: '{colors.shu.a7}', _dark: '{colors.shu.a7}' } } },
    fg: { DEFAULT: { value: { _light: '{colors.shu.11}', _dark: '{colors.shu.11}' } } },
  },
  plain: {
    bg: {
      hover: { value: { _light: '{colors.shu.a3}', _dark: '{colors.shu.a3}' } },
      active: { value: { _light: '{colors.shu.a4}', _dark: '{colors.shu.a4}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.shu.11}', _dark: '{colors.shu.11}' } } },
  },
})
