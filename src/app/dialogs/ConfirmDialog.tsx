import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { styled, Wrap } from 'styled-system/jsx'
import type { Confirm } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'

const CLICK_THROUGH_MS = 250

export function ConfirmDialog({ confirm, onClose }: { confirm: Confirm; onClose: () => void }) {
  const { t } = useTranslation()
  const openedAt = useRef(0)
  useEffect(() => {
    openedAt.current = performance.now()
  }, [confirm])
  const settled = () => performance.now() - openedAt.current > CLICK_THROUGH_MS
  return (
    <Dialog label={t('app.confirm')} role="alertdialog" onBackdrop={() => settled() && onClose()}>
      <styled.p mt="0" mx="0" mb="4">
        {confirm.text}
      </styled.p>
      <Wrap gap="2" align="center" justify="flex-end" mt="4">
        <Button onClick={onClose} autoFocus>
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
      </Wrap>
    </Dialog>
  )
}
