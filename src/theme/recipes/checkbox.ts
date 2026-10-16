import { checkboxAnatomy } from '@ark-ui/react/anatomy'
import { defineSlotRecipe } from '@pandacss/dev'

export const checkbox = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  className: 'checkbox',
  base: {
    root: {
      display: 'inline-flex',
      gap: '2',
      alignItems: 'center',
      verticalAlign: 'top',
      position: 'relative',
      _disabled: {
        layerStyle: 'disabled',
      },
    },
    control: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderRadius: 'l1',
      cursor: 'pointer',
      focusVisibleRing: 'outside',

      _icon: {
        boxSize: 'full',
      },
    },
    label: {
      fontWeight: 'medium',
      userSelect: 'none',
    },
  },

  variants: {
    size: {
      sm: {
        root: { gap: '2' },
        label: { textStyle: 'sm' },
        control: { boxSize: '4.5', _icon: { boxSize: '3' } },
      },
      md: {
        root: { gap: '3' },
        label: { textStyle: 'md' },
        control: { boxSize: '5', _icon: { boxSize: '3.5' } },
      },
      lg: {
        root: { gap: '3' },
        label: { textStyle: 'lg' },
        control: { boxSize: '5.5', _icon: { boxSize: '4' } },
      },
    },

    variant: {
      solid: {
        control: {
          borderColor: 'fg.subtle',
          bg: 'field',
          _checked: {
            bg: 'accent',
            borderColor: 'accent',
            color: 'accent.contrast',
          },
          _invalid: {
            background: 'error',
          },
        },
      },
      surface: {
        control: {
          bg: 'colorPalette.surface.bg',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'colorPalette.surface.border',
          color: 'colorPalette.surface.fg',
        },
      },
      subtle: {
        control: {
          bg: 'colorPalette.subtle.bg',
          color: 'colorPalette.subtle.fg',
        },
      },
      outline: {
        control: {
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'colorPalette.outline.border',
          color: 'colorPalette.outline.fg',
          _checked: {
            borderColor: 'colorPalette.solid.bg',
          },
        },
      },
      plain: {
        control: {
          color: 'colorPalette.plain.fg',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
})
