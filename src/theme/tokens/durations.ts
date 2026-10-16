import { defineTokens } from '@pandacss/dev'

export const durations = defineTokens.durations({
  fastest: { value: '50ms' },
  faster: { value: '100ms' },
  fast: { value: '120ms' },
  normal: { value: '200ms' },
  slow: { value: '250ms' },
  slower: { value: '300ms' },
  slowest: { value: '400ms' },
})
