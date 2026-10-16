import { defineTokens } from '@pandacss/dev'

const black = defineTokens.colors({
  DEFAULT: { value: '#000000' },
  a1: { value: 'rgba(0, 0, 0, 0.05)' },
  a2: { value: 'rgba(0, 0, 0, 0.1)' },
  a3: { value: 'rgba(0, 0, 0, 0.15)' },
  a4: { value: 'rgba(0, 0, 0, 0.2)' },
  a5: { value: 'rgba(0, 0, 0, 0.3)' },
  a6: { value: 'rgba(0, 0, 0, 0.4)' },
  a7: { value: 'rgba(0, 0, 0, 0.5)' },
  a8: { value: 'rgba(0, 0, 0, 0.6)' },
  a9: { value: 'rgba(0, 0, 0, 0.7)' },
  a10: { value: 'rgba(0, 0, 0, 0.8)' },
  a11: { value: 'rgba(0, 0, 0, 0.9)' },
  a12: { value: 'rgba(0, 0, 0, 0.95)' },
})

const white = defineTokens.colors({
  DEFAULT: { value: '#ffffff' },
  a1: { value: 'rgba(255, 255, 255, 0.05)' },
  a2: { value: 'rgba(255, 255, 255, 0.1)' },
  a3: { value: 'rgba(255, 255, 255, 0.15)' },
  a4: { value: 'rgba(255, 255, 255, 0.2)' },
  a5: { value: 'rgba(255, 255, 255, 0.3)' },
  a6: { value: 'rgba(255, 255, 255, 0.4)' },
  a7: { value: 'rgba(255, 255, 255, 0.5)' },
  a8: { value: 'rgba(255, 255, 255, 0.6)' },
  a9: { value: 'rgba(255, 255, 255, 0.7)' },
  a10: { value: 'rgba(255, 255, 255, 0.8)' },
  a11: { value: 'rgba(255, 255, 255, 0.9)' },
  a12: { value: 'rgba(255, 255, 255, 0.95)' },
})

const sumi = defineTokens.colors({
  950: { value: '#120f0c' },
  900: { value: '#14110e' },
  850: { value: '#1c1814' },
  800: { value: '#1e1a16' },
  750: { value: '#28221c' },
  700: { value: '#2a241e' },
  600: { value: '#3a322a' },
  500: { value: '#4d4339' },
})

const hai = defineTokens.colors({
  500: { value: '#62574a' },
  400: { value: '#857a6b' },
  300: { value: '#aa9e8c' },
})

const washi = defineTokens.colors({
  300: { value: '#d6cab3' },
  250: { value: '#e4dac7' },
  200: { value: '#ebe3d3' },
  150: { value: '#f4eee3' },
  100: { value: '#f6f0e5' },
  50: { value: '#fffaf1' },
})

export const colors = {
  black,
  white,
  sumi,
  hai,
  washi,
  kinari: { value: '#ece4d4' },
  gofun: { value: '#fff8f0' },
  ink: { value: '#241e18' },
}
