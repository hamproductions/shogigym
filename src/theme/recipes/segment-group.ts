import { segmentGroupAnatomy } from '@ark-ui/react/anatomy'
import { defineSlotRecipe } from '@pandacss/dev'

export const segmentGroup = defineSlotRecipe({
  className: 'segment-group',
  slots: segmentGroupAnatomy.keys(),
  base: {
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1',
    },
    item: {
      alignItems: 'center',
      bg: 'gray.subtle.bg',
      borderRadius: 'l2',
      cursor: 'pointer',
      display: 'inline-flex',
      fontSize: 'sm',
      minH: '7',
      px: '2.5',
      transitionDuration: 'fast',
      transitionProperty: 'background-color, color',
      userSelect: 'none',
      _hover: {
        bg: 'gray.subtle.bg.hover',
      },
      _checked: {
        bg: 'gray.solid.bg',
        color: 'gray.solid.fg',
        _hover: { bg: 'gray.solid.bg' },
      },
      _disabled: {
        layerStyle: 'disabled',
      },
      '&:has(input:focus-visible)': {
        focusVisibleRing: 'outside',
      },
      '@media (pointer: coarse)': { minH: '10' },
      '& [data-part=item-text] span': {
        color: 'fg.muted',
        ms: '1',
      },
      '&[data-state=checked] [data-part=item-text] span': {
        color: 'inherit',
        opacity: '0.75',
      },
    },
    itemText: {},
    itemControl: {},
    indicator: {},
    label: {},
  },
  variants: {
    size: {
      sm: { item: { minH: '6', px: '2', fontSize: 'xs' } },
      md: {},
      lg: {
        root: { display: 'grid', gridTemplateColumns: '1fr 1fr' },
        item: {
          alignItems: 'flex-start',
          flexDirection: 'column',
          fontFamily: 'mincho',
          fontSize: 'md',
          fontWeight: 'heavy',
          px: '3',
          py: '2',
          textAlign: 'start',
          '& [data-part=item-text] span': {
            fontFamily: 'sans',
            fontSize: '2xs',
            fontWeight: 'regular',
            ms: '0',
          },
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
