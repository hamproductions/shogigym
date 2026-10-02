import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Confirm } from '../types'

const CLICK_THROUGH_MS = 250

export function ConfirmDialog({ confirm, onClose }: { confirm: Confirm; onClose: () => void }) {
  const { t } = useTranslation()
  const openedAt = useRef(0)
  useEffect(() => {
    openedAt.current = performance.now()
  }, [confirm])
  const settled = () => performance.now() - openedAt.current > CLICK_THROUGH_MS
  return (
    <div className="ws-palette-back" onPointerDown={() => settled() && onClose()}>
      <div className="ws-dialog" role="alertdialog" aria-label={t('workshop.confirm')} onPointerDown={(e) => e.stopPropagation()}>
        <p>{confirm.text}</p>
        <div className="ws-actions">
          <button onClick={onClose} autoFocus>
            {confirm.no ?? t('workshop.keepPlaying')}
          </button>
          <button
            className="primary"
            onClick={() => {
              if (performance.now() - openedAt.current < CLICK_THROUGH_MS) return
              confirm.run()
              onClose()
            }}
          >
            {confirm.yes ?? t('workshop.yesStartNew')}
          </button>
        </div>
      </div>
    </div>
  )
}
