import { defineSemanticTokens } from '@pandacss/dev'

export const gray = defineSemanticTokens.colors({
  '1': { value: { _light: '{colors.washi.50}', _dark: '{colors.sumi.900}' } },
  '2': { value: { _light: '{colors.washi.150}', _dark: '{colors.sumi.850}' } },
  '3': { value: { _light: '{colors.washi.200}', _dark: '{colors.sumi.750}' } },
  '4': { value: { _light: '{colors.washi.250}', _dark: '#322a23' } },
  '5': { value: { _light: '{colors.washi.300}', _dark: '{colors.sumi.600}' } },
  '6': { value: { _light: '#cbbfa8', _dark: '#43392f' } },
  '7': { value: { _light: '#bcb09b', _dark: '{colors.sumi.500}' } },
  '8': { value: { _light: '{colors.hai.300}', _dark: '{colors.hai.500}' } },
  '9': { value: { _light: '{colors.hai.400}', _dark: '{colors.hai.400}' } },
  '10': { value: { _light: '#685d50', _dark: '#a09482' } },
  '11': { value: { _light: '{colors.hai.500}', _dark: '{colors.hai.300}' } },
  '12': { value: { _light: '{colors.ink}', _dark: '{colors.kinari}' } },
  a1: { value: { _light: 'rgba(36, 30, 24, 0)', _dark: 'rgba(236, 228, 212, 0)' } },
  a2: { value: { _light: 'rgba(36, 30, 24, 0.056)', _dark: 'rgba(236, 228, 212, 0.034)' } },
  a3: { value: { _light: 'rgba(36, 30, 24, 0.111)', _dark: 'rgba(236, 228, 212, 0.081)' } },
  a4: { value: { _light: 'rgba(36, 30, 24, 0.154)', _dark: 'rgba(236, 228, 212, 0.121)' } },
  a5: { value: { _light: 'rgba(36, 30, 24, 0.23)', _dark: 'rgba(236, 228, 212, 0.158)' } },
  a6: { value: { _light: 'rgba(36, 30, 24, 0.281)', _dark: 'rgba(236, 228, 212, 0.191)' } },
  a7: { value: { _light: 'rgba(36, 30, 24, 0.346)', _dark: 'rgba(236, 228, 212, 0.239)' } },
  a8: { value: { _light: 'rgba(36, 30, 24, 0.424)', _dark: 'rgba(236, 228, 212, 0.332)' } },
  a9: { value: { _light: 'rgba(36, 30, 24, 0.585)', _dark: 'rgba(236, 228, 212, 0.497)' } },
  a10: { value: { _light: 'rgba(36, 30, 24, 0.715)', _dark: 'rgba(236, 228, 212, 0.601)' } },
  a11: { value: { _light: 'rgba(36, 30, 24, 0.742)', _dark: 'rgba(236, 228, 212, 0.666)' } },
  a12: { value: { _light: 'rgba(36, 30, 24, 0.95)', _dark: 'rgba(236, 228, 212, 0.95)' } },
  solid: {
    bg: {
      DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } },
      hover: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.kinari}', _dark: '{colors.ink}' } } },
  },
  subtle: {
    bg: {
      DEFAULT: { value: { _light: '{colors.gray.4}', _dark: '{colors.gray.4}' } },
      hover: { value: { _light: '{colors.gray.5}', _dark: '{colors.gray.6}' } },
      active: { value: { _light: '{colors.gray.6}', _dark: '{colors.gray.7}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } } },
  },
  surface: {
    bg: {
      DEFAULT: { value: { _light: '{colors.washi.100}', _dark: '{colors.sumi.800}' } },
      hover: { value: { _light: '{colors.gray.2}', _dark: '{colors.gray.3}' } },
      active: { value: { _light: '{colors.gray.3}', _dark: '{colors.gray.4}' } },
    },
    border: {
      DEFAULT: { value: { _light: '{colors.gray.a5}', _dark: '{colors.gray.a5}' } },
      hover: { value: { _light: '{colors.gray.a7}', _dark: '{colors.gray.a7}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } } },
  },
  outline: {
    bg: {
      hover: { value: { _light: '{colors.gray.4}', _dark: '{colors.gray.4}' } },
      active: { value: { _light: '{colors.gray.5}', _dark: '{colors.gray.6}' } },
    },
    border: { DEFAULT: { value: { _light: '{colors.gray.a8}', _dark: '{colors.gray.a7}' } } },
    fg: { DEFAULT: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } } },
  },
  plain: {
    bg: {
      hover: { value: { _light: '{colors.gray.4}', _dark: '{colors.gray.4}' } },
      active: { value: { _light: '{colors.gray.5}', _dark: '{colors.gray.6}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } } },
  },
})
