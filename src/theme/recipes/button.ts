import { defineRecipe } from '@pandacss/dev'

export const button = defineRecipe({
  className: 'button',
  jsx: ['Button', 'IconButton', 'CloseButton', 'ButtonGroup'],
  base: {
    alignItems: 'center',
    appearance: 'none',
    borderRadius: 'l2',
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: '0',
    fontFamily: 'sans',
    fontWeight: 'medium',
    gap: '2',
    isolation: 'isolate',
    justifyContent: 'center',
    lineHeight: 'tight',
    outline: '0',
    position: 'relative',
    textAlign: 'center',
    transitionDuration: 'fast',
    transitionProperty: 'background-color, border-color, color, box-shadow',
    userSelect: 'none',
    verticalAlign: 'middle',
    _icon: {
      flexShrink: '0',
    },
    _disabled: {
      cursor: 'default',
      opacity: '0.4',
    },
    _on: {
      boxShadow: 'inset 0 0 0 2px {colors.fg.default}',
    },
    focusVisibleRing: 'outside',
    '@media (pointer: coarse)': { minH: '10' },
  },
  defaultVariants: {
    variant: 'subtle',
    size: 'md',
  },
  variants: {
    variant: {
      solid: {
        colorPalette: 'shu',
        bg: 'colorPalette.solid.bg',
        color: 'colorPalette.solid.fg',
        _hover: {
          bg: 'colorPalette.solid.bg.hover',
        },
      },
      subtle: {
        bg: 'colorPalette.subtle.bg',
        color: 'colorPalette.subtle.fg',
        _hover: {
          bg: 'colorPalette.subtle.bg.hover',
        },
        _active: {
          bg: 'colorPalette.subtle.bg.active',
        },
      },
      outline: {
        boxShadow: 'inset 0 0 0 1px {colors.colorPalette.outline.border}',
        color: 'colorPalette.outline.fg',
        _hover: {
          bg: 'colorPalette.outline.bg.hover',
          color: 'fg.default',
        },
        _active: {
          bg: 'colorPalette.outline.bg.active',
        },
      },
      plain: {
        color: 'colorPalette.plain.fg',
        fontWeight: 'regular',
        lineHeight: '1',
        _hover: {
          bg: 'colorPalette.plain.bg.hover',
          color: 'fg.default',
        },
        _active: {
          bg: 'colorPalette.plain.bg.active',
        },
      },
    },
    size: {
      sm: { minH: '7', px: '2', fontSize: 'xs' },
      md: { minH: '8', px: '3', fontSize: 'sm' },
      lg: { minH: '10', px: '4', fontSize: 'md', fontWeight: 'bold' },
    },
    iconOnly: {
      true: { px: '0', fontSize: '24px', '@media (pointer: coarse)': { w: '11', minH: '11' } },
    },
  },
  compoundVariants: [
    { iconOnly: true, size: 'sm', css: { w: '7' } },
    { iconOnly: true, size: 'md', css: { w: '8' } },
    { iconOnly: true, size: 'lg', css: { w: '11', minH: '11', fontWeight: 'regular' } },
  ],
})
