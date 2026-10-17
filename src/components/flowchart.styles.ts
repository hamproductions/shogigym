import { css, cva } from 'styled-system/css'

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
