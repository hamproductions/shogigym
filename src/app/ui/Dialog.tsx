import type { ReactNode } from 'react'
import { styled } from 'styled-system/jsx'
import { dialog } from 'styled-system/recipes'
import type { JsxStyleProps } from 'styled-system/types'
import { CloseButton, Dialog as ParkDialog } from '@/components/ui'
import { cx } from './cx'
import { Marks } from './SideMark'

type DialogProps = JsxStyleProps & {
  label: string
  className?: string
  positionerClassName?: string
  role?: 'dialog' | 'alertdialog'
  onBackdrop?: () => void
  children: ReactNode
}

export function Dialog({ label, className, positionerClassName, role = 'dialog', onBackdrop, children, ...styles }: DialogProps) {
  return (
    <ParkDialog.Root open role={role} lazyMount={false} unmountOnExit={false} closeOnEscape={false} closeOnInteractOutside={false}>
      <ParkDialog.Backdrop />
      <ParkDialog.Positioner
        className={positionerClassName}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onBackdrop?.()
        }}
      >
        <ParkDialog.Content className={cx('app-dialog', className)} aria-label={label} {...styles}>
          {children}
        </ParkDialog.Content>
      </ParkDialog.Positioner>
    </ParkDialog.Root>
  )
}

export function DialogHeader({
  title,
  closeLabel,
  closeTitle,
  className,
  onClose,
  ...styles
}: JsxStyleProps & {
  title: ReactNode
  closeLabel: string
  closeTitle?: string
  className?: string
  onClose: () => void
}) {
  return (
    <styled.div className={cx(dialog().header, className)} {...styles}>
      <h2 className={dialog().title}>{typeof title === 'string' ? <Marks>{title}</Marks> : title}</h2>
      <CloseButton size="lg" onClick={onClose} aria-label={closeLabel} title={closeTitle} />
    </styled.div>
  )
}
