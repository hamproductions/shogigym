import { css } from 'styled-system/css'
import { styled } from 'styled-system/jsx'

const surface = {
  display: 'block',
  w: '100%',
  h: '100%',
  touchAction: 'none',
  cursor: 'grab',
  '&:active': { cursor: 'grabbing' },
}

export const BoardCanvas = styled('canvas', { base: surface })

export const BoardHost = styled('div', { base: { ...surface, overflow: 'hidden' } })

export const ruleBorder = css({ fill: 'none', stroke: '{colors.border.strong}', strokeWidth: '0.08' })

export const ruleGrid = css({ fill: 'none', stroke: '{colors.border.strong}', strokeWidth: '0.04' })

export const ruleStep = css({ color: '#e0301e', fill: '#e0301e', stroke: '#e0301e' })

export const ruleJump = css({ color: '#1f7ae0', fill: '#1f7ae0', stroke: '#1f7ae0' })

export const ruleSlide = css({ fill: 'none', stroke: '#e0301e', strokeWidth: '0.12' })

export const ruleTurn = css({ fill: 'none', stroke: '#1f7ae0', strokeWidth: '0.12' })
