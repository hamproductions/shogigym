import { tabsAnatomy } from '@ark-ui/react/anatomy'
import { defineSlotRecipe } from '@pandacss/dev'

export const tabs = defineSlotRecipe({
  slots: tabsAnatomy.keys(),
  className: 'tabs',
  base: {
    root: {
      alignItems: 'stretch',
      borderBottom: '1px solid {colors.border}',
      display: 'flex',
      gap: '1',
      minW: '0',
      overflowX: 'auto',
      px: '3',
      scrollbarWidth: 'none',
    },
    list: {
      alignItems: 'stretch',
      display: 'flex',
      flex: 'none',
      gap: '1',
    },
    trigger: {
      borderBottom: '2px solid transparent',
      color: 'fg.muted',
      cursor: 'pointer',
      flex: 'none',
      fontSize: 'sm',
      fontWeight: 'bold',
      outline: '0',
      pb: '2',
      pt: '2.5',
      px: '2',
      transitionDuration: 'fast',
      transitionProperty: 'color',
      _hover: {
        color: 'fg.default',
      },
      _selected: {
        borderBottomColor: 'shu.solid.bg',
        color: 'shu.plain.fg',
      },
      _focusVisible: {
        focusVisibleRing: 'inside',
      },
      _disabled: {
        layerStyle: 'disabled',
      },
    },
    content: {
      focusVisibleRing: 'inside',
    },
    indicator: {},
  },
})
