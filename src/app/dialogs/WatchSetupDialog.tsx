import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { useWatch } from '@/app/modes/view/useWatch'
import { WatchOptions } from '@/app/stage/ModeBar'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'
import { SegmentedField } from '@/app/ui/Segmented'
import type { WatchOrder } from '@/app/useFurigoma'

interface WatchSetupProps {
  watch: ReturnType<typeof useWatch>
  order: WatchOrder
  onOrder: (order: WatchOrder) => void
  onCancel: () => void
  onStart: () => void
}

export function WatchSetupDialog({ watch, order, onOrder, onCancel, onStart }: WatchSetupProps) {
  const { t } = useTranslation()
  const startButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    startButton.current?.focus()
  }, [])
  return (
    <Dialog label={t('watch.title')} onBackdrop={onCancel}>
      <h2>{t('watch.title')}</h2>
      <WatchOptions watch={watch} />
      <SegmentedField<WatchOrder>
        label={t('watch.order')}
        value={order}
        options={[
          { v: 'random', t: t('watch.furigoma') },
          { v: 'sente', t: `${t('watch.kamite')} · ${t('common.sente')}` },
          { v: 'gote', t: `${t('watch.shimote')} · ${t('common.sente')}` },
        ]}
        onChange={onOrder}
      />
      <div className="app-actions">
        <Button onClick={onCancel}>{t('app.cancel')}</Button>
        <Button ref={startButton} variant="primary" onClick={onStart}>
          {t('newGame.start')}
        </Button>
      </div>
    </Dialog>
  )
}
