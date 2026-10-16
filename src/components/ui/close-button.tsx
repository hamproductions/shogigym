import { Icon } from '@/app/icons'
import { forwardRef } from 'react'
import { IconButton, type IconButtonProps } from './icon-button'

export type CloseButtonProps = IconButtonProps

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(function CloseButton(props, ref) {
  return (
    <IconButton variant="plain" ref={ref} {...props}>
      {props.children ?? <Icon name="close" />}
    </IconButton>
  )
})
