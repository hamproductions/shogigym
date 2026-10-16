import { defineTokens } from '@pandacss/dev'

export const zIndex = defineTokens.zIndex({
  hide: { value: -1 },
  base: { value: 0 },
  docked: { value: 10 },
  sticky: { value: 20 },
  banner: { value: 30 },
  overlay: { value: 40 },
  modal: { value: 40 },
  dropdown: { value: 60 },
  popover: { value: 60 },
  skipLink: { value: 70 },
  toast: { value: 70 },
  tooltip: { value: 80 },
})
