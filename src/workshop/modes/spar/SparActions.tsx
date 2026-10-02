import { useTranslation } from 'react-i18next'
import type { Spar } from './useSpar'
import { Button } from '../../ui/Button'

export function SparActions({ spar }: { spar: Spar }) {
  const { t } = useTranslation()
  return (
    <div className="ws-actions ws-spar-actions">
      {!spar.resigned && (
        <>
          <Button onClick={spar.takeBack} disabled={spar.lastUserMove < 0} title={t('workshop.takeBackYourLastMove3')}>
            {t('workshop.takeBack')}
          </Button>
          <Button onClick={spar.confirmResign}>{t('workshop.resign')}</Button>
        </>
      )}
    </div>
  )
}
