import '@/app/ui/dialog.css'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { cx } from './cx'

interface DialogProps {
  label: string
  className?: string
  role?: 'dialog' | 'alertdialog'
  onBackdrop?: () => void
  children: ReactNode
}

export function Dialog({ label, className, role = 'dialog', onBackdrop, children }: DialogProps) {
  return (
    <div className="app-palette-back" onPointerDown={onBackdrop}>
      <dialog open className={cx('app-dialog', className)} role={role} aria-modal="true" aria-label={label} onPointerDown={(e) => e.stopPropagation()}>
        {children}
      </dialog>
    </div>
  )
}

export function DialogHeader({ title, closeLabel, closeTitle, onClose }: { title: ReactNode; closeLabel: string; closeTitle?: string; onClose: () => void }) {
  return (
    <div className="app-dialog-head">
      <h2>{title}</h2>
      <Button variant="icon" size="lg" onClick={onClose} aria-label={closeLabel} title={closeTitle}>
        ×
      </Button>
    </div>
  )
}
