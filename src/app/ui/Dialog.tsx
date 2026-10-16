import type { ReactNode } from 'react'
import { dialog } from 'styled-system/recipes'
import { CloseButton, Dialog as ParkDialog } from '@/components/ui'
import { cx } from './cx'
import { dialogFlow } from './dialog.styles'

type DialogProps = {
  label: string
  className?: string
  positionerClassName?: string
  role?: 'dialog' | 'alertdialog'
  onBackdrop?: () => void
  children: ReactNode
}

export function Dialog({ label, className, positionerClassName, role = 'dialog', onBackdrop, children }: DialogProps) {
  return (
    <ParkDialog.Root
      open
      role={role}
      lazyMount={false}
      unmountOnExit={false}
      closeOnEscape={false}
      closeOnInteractOutside={!!onBackdrop}
      onOpenChange={({ open }) => {
        if (!open) onBackdrop?.()
      }}
    >
      <ParkDialog.Backdrop />
      <ParkDialog.Positioner className={positionerClassName}>
        <ParkDialog.Content className={cx('app-dialog', dialogFlow, className)} aria-label={label}>
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
}: {
  title: ReactNode
  closeLabel: string
  closeTitle?: string
  className?: string
  onClose: () => void
}) {
  return (
    <div className={cx(dialog().header, className)}>
      <h2 className={dialog().title}>{title}</h2>
      <CloseButton size="lg" onClick={onClose} aria-label={closeLabel} title={closeTitle} />
    </div>
  )
}
