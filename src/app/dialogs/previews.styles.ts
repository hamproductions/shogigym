import { css, cva } from 'styled-system/css'

const guideBackground = { bg: '#f5e3bd' }

export const piecePreview = css({
  position: 'sticky',
  top: 'calc(-1 * {spacing.2})',
  zIndex: '2',
  display: 'grid',
  gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
  gridTemplateRows: 'auto',
  alignItems: 'center',
  gap: '1',
  p: '2',
  bg: 'panel',
  borderBottom: '1px solid {colors.border}',
  '&:has(> span:only-child)': { minH: '110px', placeItems: 'center' },
})

export const previewStatus = css({ gridColumn: '1 / -1', fontSize: 'xs', color: 'fg.muted', '&:only-child': { p: '3' } })

export const sampleTile = css({
  flex: '1 0 76px',
  w: '100%',
  maxW: '110px',
  h: 'auto',
  minW: '0',
  aspectRatio: '0.85',
  border: '0',
  p: '0',
  bg: 'transparent',
  perspective: '500px',
  cursor: 'pointer',
  _disabled: { opacity: '1', cursor: 'default' },
})

export const sampleFlip = css({
  position: 'relative',
  display: 'block',
  w: '100%',
  h: '100%',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.35s ease',
  '&[data-on]': { transform: 'rotateX(180deg)' },
  '& img': {
    position: 'absolute',
    inset: '-18%',
    w: '136%',
    h: '136%',
    maxW: 'none',
    objectFit: 'contain',
    backfaceVisibility: 'hidden',
  },
  '& img[data-back]': { transform: 'rotateX(180deg)' },
})

export const optionGroup = css({ '& > p': { m: '{spacing.3} 0 {spacing.2}' } })

export const optionGrid = cva({
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

export const optionButton = cva({
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

export const optionPreview = cva({
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

export const previewFill = css({ w: '100%', h: '100%', objectFit: 'contain' })

export const colorSwatch = css({ w: '100%', h: '100%', borderRadius: 'sm' })

export const preparedGlyph = css({
  w: 'var(--prepared-size, 82px)',
  h: 'var(--prepared-size, 82px)',
  maxW: 'var(--prepared-max, none)',
  aspectRatio: '1',
  objectFit: 'contain',
})

export const glyphSample = cva({
  base: { display: 'block', fontSize: 'var(--glyph-size, 52px)', lineHeight: '1', writingMode: 'vertical-rl', color: '#0e0804' },
  variants: {
    guide: {
      none: {},
      marks: {
        position: 'relative',
        h: '100%',
        '& > :first-child': { position: 'relative', zIndex: '1' },
        '& > img:first-child': { w: '82px', h: '82px', aspectRatio: '1', objectFit: 'contain' },
        '& > img:last-child': { position: 'absolute', inset: '0', w: '100%', h: '100%', objectFit: 'contain' },
      },
      strip: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8%',
        w: '82px',
        h: '100%',
        writingMode: 'horizontal-tb',
        fontSize: 'var(--glyph-size, 32px)',
        '& > *': { position: 'static', flex: '1', minH: '0', w: '100%', h: '46%', objectFit: 'contain', textAlign: 'center' },
      },
    },
  },
  defaultVariants: { guide: 'none' },
})

export const finishRender = css({
  display: 'grid',
  placeItems: 'center',
  w: '100%',
  h: '140px',
  overflow: 'hidden',
  '& img': { w: '100%', h: '140px', objectFit: 'cover' },
})

export const finishSection = css({ flex: 'none', w: '100%', h: '50px' })

export const finishCoating = css({ fontSize: 'xs', color: 'fg.muted' })
