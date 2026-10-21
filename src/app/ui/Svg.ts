import { styled } from 'styled-system/jsx'

export const SvgRect = styled('rect', {}, { forwardProps: ['x', 'y', 'width', 'height', 'rx'] as string[] })

export const SvgCircle = styled('circle', {}, { forwardProps: ['cx', 'cy', 'r'] as string[] })

export const SvgPath = styled('path', {}, { forwardProps: ['d', 'clipPath'] as string[] })

export const SvgText = styled('text', {}, { forwardProps: ['x', 'y'] as string[] })

export const SvgLine = styled('line', {}, { forwardProps: ['markerEnd'] as string[] })
