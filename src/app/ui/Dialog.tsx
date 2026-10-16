import '@/app/ui/dialog.css'
import type { ReactNode } from 'react'
import { dialog } from 'styled-system/recipes'
import { CloseButton, Dialog as ParkDialog } from '@/components/ui'
import { cx } from './cx'

type DialogProps = { label: string; className?: string; role?: 'dialog' | 'alertdialog'; onBackdrop?: () => void; children: ReactNode }

export function Dialog({ label, className, role = 'dialog', onBackdrop, children }: DialogProps) {
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
      <ParkDialog.Positioner>
        <ParkDialog.Content className={cx('app-dialog', className)} aria-label={label}>
          {children}
        </ParkDialog.Content>
      </ParkDialog.Positioner>
    </ParkDialog.Root>
  )
}

export function DialogHeader({ title, closeLabel, closeTitle, onClose }: { title: ReactNode; closeLabel: string; closeTitle?: string; onClose: () => void }) {
  return (
    <div className={cx(dialog().header, 'app-dialog-head')}>
      <h2 className={dialog().title}>{title}</h2>
      <CloseButton size="lg" onClick={onClose} aria-label={closeLabel} title={closeTitle} />
    </div>
  )
}
