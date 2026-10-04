import './loading.css'
import { useTranslation } from 'react-i18next'

export function BoardLoading({ error }: { error?: string }) {
  const { t } = useTranslation()
  return <div className="board-loading" role={error ? 'alert' : 'status'} aria-busy={!error}>{error ?? t('settings.loadingBoard')}</div>
}
