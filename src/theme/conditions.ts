export const conditions = {
  extend: {
    light: ':root &, .light &',
    invalid: '&:is(:user-invalid, [data-invalid], [aria-invalid=true])',
    hover: '&:not(:disabled):hover',
    active: '&:not(:disabled):active',
    checked: '&:is(:checked, [data-checked], [data-state=checked], [aria-checked=true], [data-state=indeterminate])',
    on: '&:is([data-state=on], [aria-pressed=true])',
    pinned: '&:is([data-pinned])',
    compact: '@media (max-width: 820px), (max-width: 1024px) and (orientation: portrait)',
    narrow: '@media (max-width: 820px)',
    tight: '@media (max-width: 820px), (max-height: 660px)',
    short: '@media (max-height: 520px) and (min-width: 821px)',
    phone: '@media (max-width: 560px)',
    coarse: '@media (pointer: coarse)',
  },
} as const
