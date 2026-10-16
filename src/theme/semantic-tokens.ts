import { defineSemanticTokens } from '@pandacss/dev'

const mode = (light: string, dark: string) => ({ value: { _light: light, _dark: dark } })

export const semanticColors = defineSemanticTokens.colors({
  canvas: mode('{colors.washi.200}', '{colors.sumi.900}'),
  surface: {
    '0': mode('{colors.washi.200}', '{colors.sumi.900}'),
    '1': mode('{colors.washi.150}', '{colors.sumi.850}'),
    '2': mode('{colors.washi.250}', '#322a23'),
    '3': mode('{colors.washi.300}', '#43392f'),
  },
  panel: mode('{colors.washi.100}', '{colors.sumi.800}'),
  card: {
    DEFAULT: mode('{colors.washi.50}', '{colors.sumi.750}'),
    hover: mode('#ffffff', '#2f2821'),
  },
  field: mode('#fffcf6', '{colors.sumi.950}'),
  overlay: mode('rgb(251 247 239 / 0.94)', 'rgb(23 20 16 / 0.92)'),
  fg: {
    default: mode('{colors.gray.12}', '{colors.gray.12}'),
    muted: mode('{colors.gray.11}', '{colors.gray.11}'),
    subtle: mode('{colors.gray.10}', '{colors.gray.10}'),
    inverse: mode('{colors.kinari}', '{colors.ink}'),
  },
  border: {
    DEFAULT: mode('rgb(36 30 24 / 0.14)', 'rgb(236 228 212 / 0.12)'),
    strong: mode('rgb(36 30 24 / 0.3)', 'rgb(236 228 212 / 0.26)'),
  },
  accent: {
    DEFAULT: mode('#b3361c', '#c4442a'),
    hover: mode('#a3301a', '#b3361c'),
    text: mode('#a3301a', '#f08a6c'),
    contrast: mode('{colors.gofun}', '{colors.gofun}'),
    soft: mode('rgb(179 54 28 / 0.12)', 'rgb(240 138 108 / 0.16)'),
  },
  success: {
    DEFAULT: mode('{colors.rokusho.700}', '{colors.rokusho.300}'),
    soft: mode('rgb(47 97 24 / 0.12)', 'rgb(147 198 110 / 0.14)'),
    fill: mode('{colors.rokusho.600}', '{colors.rokusho.600}'),
    strong: mode('#2e5418', '#2e5418'),
  },
  warning: {
    DEFAULT: mode('{colors.kin.600}', '{colors.kin.200}'),
    soft: mode('rgb(128 86 10 / 0.12)', 'rgb(230 181 92 / 0.14)'),
  },
  danger: {
    DEFAULT: mode('#a3301a', '#f2907b'),
    soft: mode('rgb(163 48 26 / 0.1)', 'rgb(242 144 123 / 0.14)'),
    fill: mode('#d23b25', '#d23b25'),
    strong: mode('#7c2416', '#7c2416'),
  },
  error: mode('#a3301a', '#f2907b'),
  info: {
    DEFAULT: mode('{colors.ai.700}', '{colors.ai.300}'),
    soft: mode('rgb(43 87 145 / 0.1)', 'rgb(147 180 230 / 0.14)'),
    fill: mode('{colors.ai.600}', '{colors.ai.600}'),
  },
  highlight: mode('{colors.kin.700}', '{colors.kin.300}'),
  focus: mode('#b3361c', '#f08a6c'),
  scrim: mode('rgb(40 30 20 / 0.38)', 'rgb(6 5 4 / 0.62)'),
  pattern: { ink: mode('rgb(36 30 24 / 0.06)', 'rgb(236 228 212 / 0.045)') },
  stage: { glow: mode('rgb(255 252 245 / 0.7)', 'rgb(150 110 70 / 0.14)') },
  meter: {
    fill: mode('{colors.gray.12}', '{colors.gray.12}'),
    track: mode('{colors.washi.300}', '#43392f'),
  },
  mode: {
    spar: mode('{colors.ai.600}', '{colors.ai.600}'),
    analyze: mode('{colors.sumi.500}', '{colors.sumi.500}'),
    study: mode('{colors.rokusho.600}', '{colors.rokusho.600}'),
    quiz: mode('#b3361c', '#b3361c'),
    drill: mode('{colors.bengara.600}', '{colors.bengara.600}'),
    tsume: mode('{colors.murasaki.600}', '{colors.murasaki.600}'),
    tesuji: mode('#b3361c', '#b3361c'),
    ink: mode('{colors.gofun}', '{colors.gofun}'),
  },
  onFill: {
    DEFAULT: mode('#ffffff', '#ffffff'),
    soft: mode('rgb(255 255 255 / 0.16)', 'rgb(255 255 255 / 0.16)'),
  },
  koma: {
    light: mode('#f6e3b4', '#f6e3b4'),
    dark: mode('#dcb978', '#dcb978'),
    ink: mode('#1d140c', '#1d140c'),
    red: mode('#b3261e', '#b3261e'),
  },
  kaya: {
    light: mode('#e2b56c', '#e2b56c'),
    dark: mode('#cf9f55', '#cf9f55'),
  },
})

export const semanticShadows = defineSemanticTokens.shadows({
  sheet: { value: '0 -8px 24px rgb(0 0 0 / 0.18)' },
  koma: { value: '0 3px 2px rgb(60 30 0 / 0.45)' },
  wood: { value: 'inset 0 1px 0 rgb(255 255 255 / 0.35), inset 0 -2px 0 rgb(0 0 0 / 0.12)' },
})
