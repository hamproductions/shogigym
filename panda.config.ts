import { defineConfig } from '@pandacss/dev'
import { gray } from './src/theme/colors/gray'
import { shu } from './src/theme/colors/shu'
import { semanticColors, semanticShadows } from './src/theme/semantic-tokens'
import { animationStyles } from './src/theme/animation-styles'
import { conditions } from './src/theme/conditions'
import { globalCss } from './src/theme/global-css'
import { keyframes } from './src/theme/keyframes'
import { layerStyles } from './src/theme/layer-styles'
import { recipes, slotRecipes } from './src/theme/recipes'
import { textStyles } from './src/theme/text-styles'
import { colors } from './src/theme/tokens/colors'
import { durations } from './src/theme/tokens/durations'
import { shadows } from './src/theme/tokens/shadows'
import { zIndex } from './src/theme/tokens/z-index'

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: false,
  minify: process.env.NODE_ENV === 'production',
  hash: process.env.NODE_ENV === 'production',
  optimize: {
    removeUnusedTokens: true,
    removeUnusedKeyframes: true,
    smartCompoundVariants: true,
  },
  jsxFramework: 'react',
  jsxStyleProps: 'all',
  include: ['./src/**/*.{ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  importMap: 'styled-system',
  staticCss: {
    recipes: {
      badge: ['*'],
      button: ['*'],
      card: ['*'],
      dialog: ['*'],
      segmentGroup: ['*'],
      tabs: ['*'],
      text: ['*'],
      select: ['*'],
      checkbox: ['*'],
      switchRecipe: ['*'],
      slider: ['*'],
    },
  },
  globalCss,
  conditions,
  theme: {
    extend: {
      animationStyles,
      recipes,
      slotRecipes,
      keyframes,
      layerStyles,
      textStyles,
      tokens: {
        colors,
        durations,
        zIndex,
        fonts: {
          sans: { value: "'Zen Kaku Gothic New', system-ui, sans-serif" },
          mincho: { value: "'Shippori Mincho B1', serif" },
        },
        fontSizes: {
          '2xs': { value: '11px' },
          xs: { value: '12px' },
          sm: { value: '13px' },
          md: { value: '15px' },
          lg: { value: '17px' },
          xl: { value: '20px' },
          '2xl': { value: '28px' },
        },
        fontWeights: {
          regular: { value: '400' },
          heavy: { value: '800' },
        },
        lineHeights: {
          tight: { value: '1.25' },
          snug: { value: '1.45' },
          normal: { value: '1.6' },
          mincho: { value: '1.8' },
        },
        letterSpacings: {
          seal: { value: '0.08em' },
        },
        radii: {
          xs: { value: '4px' },
          sm: { value: '6px' },
          md: { value: '8px' },
          lg: { value: '12px' },
          xl: { value: '16px' },
        },
        sizes: {
          control: {
            sm: { value: '28px' },
            md: { value: '32px' },
            lg: { value: '44px' },
          },
          rail: { value: '76px' },
        },
        easings: {
          out: { value: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
        },
      },
      semanticTokens: {
        colors: { gray, shu, ...semanticColors },
        radii: {
          l1: { value: '{radii.xs}' },
          l2: { value: '{radii.md}' },
          l3: { value: '{radii.lg}' },
          l4: { value: '{radii.xl}' },
        },
        shadows: { ...shadows, ...semanticShadows },
      },
    },
  },
})
