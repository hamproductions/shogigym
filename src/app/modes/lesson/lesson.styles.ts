import { cva } from 'styled-system/css'
import { styled } from 'styled-system/jsx'
import { BackLink } from '@/app/panels/panels.styles'

export const PickerTitle = styled('h2', {
  base: { fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'xl', lineHeight: 'tight', '&:not(:first-child)': { mt: '2' } },
})

export const PickerIntro = styled('p', {
  base: { m: '0', color: 'fg.muted', fontSize: 'sm', lineHeight: 'normal' },
  variants: {
    kind: {
      plain: {},
      overview: { whiteSpace: 'pre-line' },
      plan: { color: 'fg.default' },
    },
  },
  defaultVariants: { kind: 'plain' },
})

export const CrumbLink = styled(BackLink, { base: { '&:not(:first-child)': { mt: '2' } } })

export const LibJa = styled('span', { base: { fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'md' } })

export const LibEn = styled('span', { base: { color: 'fg.muted', fontSize: 'xs' } })

export const SetupButton = styled('button', {
  base: {
    layerStyle: 'card',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    w: '100%',
    mt: '2',
    p: '{spacing.2.5} {spacing.3} {spacing.3} {spacing.4}',
    overflow: 'hidden',
    textAlign: 'left',
    transition: 'background {durations.fast}',
    _hover: { bg: 'card.hover' },
  },
  variants: {
    found: {
      false: {},
      true: { gap: '2px', h: 'auto', fontSize: 'sm' },
    },
  },
  defaultVariants: { found: false },
})

export const SetupGo = styled('span', {
  base: { gridColumn: '2', gridRow: '1 / span 2', alignSelf: 'center', color: 'fg.muted', fontSize: '24px' },
})

export const ProgressLine = styled('i', { base: { position: 'absolute', left: '0', bottom: '0', h: '2px', bg: 'accent' } })

export const paneCard = cva({
  base: { _narrow: { '&.app-card': { order: '-1', m: '0 0 {spacing.2.5}' } } },
  variants: {
    study: {
      false: {},
      true: { position: 'relative' },
    },
  },
  defaultVariants: { study: false },
})

export const feedback = cva({
  base: {
    h: 'calc(2em * {lineHeights.normal} + 2 * {spacing.3})',
    overflowY: 'auto',
    mt: '2',
  },
  variants: {
    floating: {
      false: {},
      true: {
        position: 'absolute',
        bottom: 'calc(100% + {spacing.2})',
        left: '0',
        right: '0',
        h: 'auto',
        maxH: 'calc(2em * {lineHeights.normal} + 2 * {spacing.3})',
        m: '0',
        mt: '0',
        bg: 'surface.1',
        borderRadius: 'md',
        zIndex: 'hud',
        '&:empty': { display: 'none' },
      },
    },
  },
  defaultVariants: { floating: false },
})

export const Crop = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '4',
    '@media (max-width: 640px)': { flexWrap: 'nowrap', gap: '2' },
  },
  variants: {
    layout: {
      panels: {},
      cycle: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
      pieces: { gap: '3' },
    },
  },
  defaultVariants: { layout: 'panels' },
})

export const Caption = styled('figcaption', { base: { mt: '1.5', fontSize: 'sm', fontWeight: 'bold', lineHeight: 'snug' } })
