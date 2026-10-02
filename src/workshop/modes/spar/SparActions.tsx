import { useTranslation } from 'react-i18next'
import type { Spar } from './useSpar'
import { Button } from '../../ui/Button'

export function SparActions({ spar, erred }: { spar: Spar; erred: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="ws-actions ws-spar-actions">
      {!spar.resigned && (
        <>
          <Button variant={erred ? 'primary' : 'secondary'} onClick={spar.takeBack} disabled={spar.lastUserMove < 0} title={t('workshop.takeBackYourLastMove3')}>
            {erred ? t('workshop.takeBackAndRetry') : t('workshop.takeBack')}
          </Button>
          <Button onClick={spar.confirmResign}>{t('workshop.resign')}</Button>
        </>
      )}
    </div>
  )
}
