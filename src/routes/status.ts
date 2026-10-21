import { useSyncExternalStore } from 'react'
import { styled } from 'styled-system/jsx'

const subscribe = () => () => {}

export const useDocumentEnglish = () =>
  useSyncExternalStore(
    subscribe,
    () => document.documentElement.lang.startsWith('en'),
    () => false,
  )

export const StatusText = styled('p', { base: { m: '0 0 {spacing.4}', color: 'fg.muted' } })

export const StatusDetails = styled('details', { base: { mt: '4', color: 'fg.muted', fontSize: 'sm' } })

export const StatusSummary = styled('summary', {
  base: { w: 'fit-content', cursor: 'pointer', _focusVisible: { outline: '2px solid {colors.focus}', outlineOffset: '3px' } },
})

export const statusAction = {
  display: 'inline-flex',
  alignItems: 'center',
  minH: '44px',
  p: '{spacing.2} {spacing.4}',
  border: '0',
  borderRadius: 'md',
  font: 'inherit',
  textDecoration: 'none',
  cursor: 'pointer',
  _focusVisible: { outline: '2px solid {colors.focus}', outlineOffset: '3px' },
} as const
