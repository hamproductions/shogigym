import { defineRecipe } from '@pandacss/dev'

export const input = defineRecipe({
  className: 'input',
  jsx: ['Input', 'Field.Input'],
  base: {
    appearance: 'none',
    bg: 'field',
    border: '1px solid {colors.border.strong}',
    borderRadius: 'l2',
    color: 'fg.default',
    fontFamily: 'sans',
    fontSize: 'sm',
    lineHeight: 'normal',
    outline: '0',
    px: '3',
    py: '2',
    width: '100%',
    focusVisibleRing: 'inside',
    _placeholder: { color: 'fg.muted' },
    _disabled: { layerStyle: 'disabled' },
    _invalid: { borderColor: 'error', focusRingColor: 'error' },
  },
})
