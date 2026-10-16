import { css } from 'styled-system/css'

export const shell = css({
  '& .app-modebar-heading .app-lastmove': { w: 'max-content', maxW: '50%' },
  '& .app-lastmove strong': { overflow: 'visible', textOverflow: 'clip', whiteSpace: 'normal', textAlign: 'right', overflowWrap: 'anywhere' },
})

export const notation = css({ display: 'inline-block', whiteSpace: 'normal', overflowWrap: 'anywhere' })

export const scene = css({ bg: 'surface.0' })

const surface = {
  display: 'block',
  w: '100%',
  h: '100%',
  touchAction: 'none',
  cursor: 'grab',
  '&:active': { cursor: 'grabbing' },
}

export const canvas = css(surface)

export const canvas3d = css({ ...surface, overflow: 'hidden' })

export const loading = css({ position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', color: 'fg.muted' })

export const choice = css({
  position: 'absolute',
  left: '50%',
  bottom: '4',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  maxW: 'calc(100% - {spacing.6})',
  p: '{spacing.2} {spacing.3}',
  border: '1px solid {colors.border.strong}',
  borderRadius: 'lg',
  bg: 'overlay',
  boxShadow: '0 6px 24px rgb(0 0 0 / 0.25)',
  fontSize: 'sm',
})

export const pane = css({ display: 'flex', flexDirection: 'column', gap: '3' })

export const cameraHint = css({
  position: 'absolute',
  right: '2',
  bottom: '2',
  maxW: '50%',
  p: '{spacing.1} {spacing.2}',
  borderRadius: 'md',
  bg: 'overlay',
  fontSize: 'xs',
  pointerEvents: 'none',
  '.app-shell.fs &': { display: 'none' },
})

export const setup = css({
  position: 'absolute',
  left: '50%',
  top: '3',
  transform: 'translateX(-50%)',
  p: '{spacing.1} {spacing.3}',
  border: '1px solid {colors.border.strong}',
  borderRadius: 'full',
  bg: 'overlay',
  fontSize: 'xs',
  fontVariantNumeric: 'tabular-nums',
  pointerEvents: 'none',
})

export const victory = css({ display: 'grid', gap: '2' })

export const row = css({ display: 'flex', justifyContent: 'space-between', gap: '2' })

export const buttons = css({ display: 'flex', flexWrap: 'wrap', gap: '2' })

export const setting = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', fontSize: 'sm' })

export const ruleGuide = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '3',
  alignItems: 'center',
  '& svg': { w: '176px', maxW: '100%', flex: 'none' },
})

export const ruleBorder = css({ fill: 'none', stroke: '{colors.border.strong}', strokeWidth: '0.08' })

export const ruleGrid = css({ fill: 'none', stroke: '{colors.border.strong}', strokeWidth: '0.04' })

export const ruleStep = css({ color: '#e0301e', fill: '#e0301e', stroke: '#e0301e' })

export const ruleJump = css({ color: '#1f7ae0', fill: '#1f7ae0', stroke: '#1f7ae0' })

export const ruleSlide = css({ fill: 'none', stroke: '#e0301e', strokeWidth: '0.12' })

export const ruleTurn = css({ fill: 'none', stroke: '#1f7ae0', strokeWidth: '0.12' })

export const ruleLegend = css({
  flex: '1',
  minW: '140px',
  fontSize: 'sm',
  '& span': { display: 'block' },
  '& p': { m: '{spacing.2} 0 0' },
})
