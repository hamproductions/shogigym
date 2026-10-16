import { css, cva } from 'styled-system/css'

export const head = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  mb: '2.5',
  '& strong': { fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'lg' },
  _narrow: { '& strong': { minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
})

export const scroll = css({ overflow: 'auto', p: '{spacing.1} {spacing.1} {spacing.3}', minHeight: '0', maxH: 'calc(100vh - 120px)' })

export const canvas = css({ position: 'relative', m: '0 auto' })

export const lines = css({ position: 'absolute', inset: '0', overflow: 'visible' })

export const edge = cva({
  base: { fill: 'none', strokeWidth: '2' },
  variants: {
    verdict: {
      start: {},
      good: { stroke: 'success' },
      book: { stroke: 'warning' },
      mistake: { stroke: 'danger', strokeDasharray: '5 4' },
      'opponent-mistake': { stroke: 'info', strokeDasharray: '5 4' },
    },
  },
})

export const arrowHead = cva({
  variants: {
    verdict: {
      good: { fill: 'success' },
      book: { fill: 'warning' },
      mistake: { fill: 'danger' },
      'opponent-mistake': { fill: 'info' },
    },
  },
})

export const stageBox = cva({
  base: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    p: '{spacing.2} {spacing.2.5} {spacing.2} {spacing.3}',
    overflow: 'hidden',
    borderRadius: 'lg',
    bg: 'card',
    textAlign: 'left',
    boxShadow: 'inset 3px 0 0 var(--fc-accent), inset 0 0 0 1px {colors.border}, {shadows.sm}',
    transition: 'background {durations.fast}',
    _hover: { bg: 'card.hover' },
  },
  variants: {
    verdict: {
      start: { '--fc-accent': '{colors.fg.muted}' },
      good: { '--fc-accent': '{colors.success}' },
      book: { '--fc-accent': '{colors.warning}' },
      mistake: { '--fc-accent': '{colors.danger}' },
      'opponent-mistake': { '--fc-accent': '{colors.info}' },
    },
    current: {
      false: {},
      true: { outline: '2px solid {colors.accent}', outlineOffset: '2px' },
    },
  },
  defaultVariants: { current: false },
})

export const tag = css({ color: 'var(--fc-accent)', fontSize: '2xs', fontWeight: 'bold' })

export const moves = css({ lineClamp: '2', fontFamily: 'mincho', fontSize: 'sm', lineHeight: 'tight' })

export const ply = css({ mr: '1.5', color: 'fg.muted', fontSize: '2xs' })

export const note = css({ lineClamp: '1', color: 'fg.muted', fontSize: '2xs', lineHeight: 'snug' })

export const progress = css({ position: 'absolute', left: '0', bottom: '0', h: '3px', bg: 'accent' })

export const overlay = css({
  position: 'fixed',
  inset: '0',
  zIndex: 'modal',
  display: 'grid',
  placeItems: 'center',
  p: '6',
  bg: 'scrim',
  backdropFilter: 'blur(3px)',
  _narrow: { p: '3' },
})

export const overlayBox = css({
  w: 'min(1400px, 100%)',
  maxH: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  p: '4',
  borderRadius: 'xl',
  bg: 'panel',
  color: 'fg.default',
  boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.lg}',
})

export const help = css({ m: '0 0 {spacing.2}', color: 'fg.muted', fontSize: 'xs' })
