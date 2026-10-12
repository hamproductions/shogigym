import { useTranslation } from 'react-i18next'
import { ImportBox } from '@/app/modes/analyze/ImportBox'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'

export function ImportDialog({ onImport, onClose }: { onImport: (text: string) => string | null; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Dialog label={t('games.importAGame')} onBackdrop={onClose}>
      <DialogHeader title={t('games.importAGame')} closeLabel={t('settings.closeSettings')} onClose={onClose} />
      <ImportBox onImport={onImport} open />
    </Dialog>
  )
}
