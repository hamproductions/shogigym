import { css } from 'styled-system/css'

export const dialogFlow = css({
  '& > h2:not([class])': { mb: '2!' },
  '& > p:not([class])': { mt: '0', mx: '0', mb: '4' },
  '& > .app-actions': { justifyContent: 'flex-end', mt: '4' },
})
