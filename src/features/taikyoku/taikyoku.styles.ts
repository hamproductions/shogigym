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
