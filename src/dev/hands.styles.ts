import { css } from 'styled-system/css'

export const panel = css({
  position: 'absolute',
  top: '12px',
  left: '12px',
  w: 'min(360px, calc(100% - 24px))',
  maxH: 'calc(100% - 24px)',
  overflow: 'auto',
  p: '14px',
  borderRadius: '10px',
  bg: 'rgba(20, 18, 16, 0.94)',
  color: '#f3eee6',
  font: '13px/1.4 system-ui',
  display: 'grid',
  gap: '12px',
  '& summary': { cursor: 'pointer' },
})

export const control = css({
  p: '8px 10px',
  border: '1px solid #665a49',
  borderRadius: '6px',
  bg: '#302a22',
  color: 'inherit',
  cursor: 'pointer',
  '&:hover, &[aria-pressed=true]': { bg: '#675137', borderColor: '#c3a06e' },
  '&:focus-visible': { outline: '2px solid #c3a06e', outlineOffset: '2px' },
})

export const pads = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '8px',
  '& button': { minH: '58px', display: 'grid', textAlign: 'left', gap: '4px' },
  '& span': { fontSize: '11px', color: '#d2c5b4' },
})

export const row = css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' })
