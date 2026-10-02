import { useTranslation } from 'react-i18next'
import type { Spar } from './useSpar'

export function SparActions({ spar }: { spar: Spar }) {
  const { t } = useTranslation()
  return (
    <div className="ws-actions ws-spar-actions">
      {!spar.resigned && (
        <>
          <button onClick={spar.takeBack} disabled={spar.lastUserMove < 0} title={t('workshop.takeBackYourLastMove3')}>
            {t('workshop.takeBack')}
          </button>
          <button onClick={spar.confirmResign}>{t('workshop.resign')}</button>
        </>
      )}
    </div>
  )
}
