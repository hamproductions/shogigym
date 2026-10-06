import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Confirm } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'

const CLICK_THROUGH_MS = 250

export function ConfirmDialog({ confirm, onClose }: { confirm: Confirm; onClose: () => void }) {
  const { t } = useTranslation()
  const openedAt = useRef(0)
  const keepPlaying = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    openedAt.current = performance.now()
    keepPlaying.current?.focus()
  }, [])
  const settled = () => performance.now() - openedAt.current > CLICK_THROUGH_MS
  return (
    <Dialog label={t('app.confirm')} role="alertdialog" onBackdrop={() => settled() && onClose()}>
      <p>{confirm.text}</p>
      <div className="app-actions">
        <Button ref={keepPlaying} onClick={onClose}>
          {confirm.no ?? t('app.keepPlaying')}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (performance.now() - openedAt.current < CLICK_THROUGH_MS) return
            confirm.run()
            onClose()
          }}
        >
          {confirm.yes ?? t('app.yesStartNew')}
        </Button>
      </div>
    </Dialog>
  )
}
