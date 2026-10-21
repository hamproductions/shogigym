import { styled } from 'styled-system/jsx'

const guideBackground = { bg: '#f5e3bd' }

const previewFill = { w: '100%', h: '100%', objectFit: 'contain' }

export const OptionGrid = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2', mb: '3' },
  variants: {
    kind: {
      plain: {},
      typeface: { gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))' },
      type: { display: 'flex', flexWrap: 'wrap' },
      finish: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', '@media (max-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } },
    },
  },
  defaultVariants: { kind: 'plain' },
})

export const OptionButton = styled('button', {
  base: {
    display: 'grid',
    gap: '1',
    p: '2',
    borderRadius: 'md',
    bg: 'card',
    boxShadow: 'inset 0 0 0 1px {colors.border}',
    fontSize: 'sm',
    '&[aria-pressed=true]': { boxShadow: 'inset 0 0 0 2px {colors.accent}' },
  },
  variants: {
    kind: {
      plain: {},
      typeface: { p: '6px', gap: '4px', fontSize: '12px' },
      type: { flex: '0 1 160px', minW: '120px' },
      finish: {},
    },
  },
  defaultVariants: { kind: 'plain' },
})

export const OptionPreview = styled('span', {
  base: {
    display: 'grid',
    placeItems: 'center',
    h: '90px',
    overflow: 'hidden',
    borderRadius: 'sm',
    '&:has([data-glyph-sample])': guideBackground,
    '&:has([data-guide-sample])': guideBackground,
    '&:has(img[data-prepared])': guideBackground,
  },
  variants: {
    kind: {
      plain: {},
      typeface: { h: '64px', '--prepared-size': '64px', '--prepared-max': '100%', '--glyph-size': '44px' },
      type: { h: '82px' },
      finish: { display: 'flex', flexDirection: 'column', h: '210px' },
    },
  },
  defaultVariants: { kind: 'plain' },
})

export const PreviewCanvas = styled('canvas', { base: previewFill })

export const PreviewImage = styled('img', { base: previewFill })

export const GlyphFace = styled('span', {
  base: { display: 'block', fontSize: 'var(--glyph-size, 52px)', lineHeight: '1', writingMode: 'vertical-rl', color: '#0e0804' },
  variants: {
    marks: {
      true: { position: 'relative', h: '100%' },
    },
  },
})

export const GuideMarks = styled('img', { base: { position: 'absolute', inset: '0', w: '100%', h: '100%', objectFit: 'contain' } })
