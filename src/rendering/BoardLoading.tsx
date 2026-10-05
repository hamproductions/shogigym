import './loading.css'
import '@/utils/i18n'
import { useTranslation } from 'react-i18next'

export function BoardLoading({ error, progress }: { error?: string; progress?: number }) {
  const { t } = useTranslation()
  return (
    <div className="board-loading" role={error ? 'alert' : 'status'} aria-busy={!error}>
      <div className="board-loading-content">
        {!error && <span className="board-loading-spinner" aria-hidden="true" />}
        <span>{error ?? t('settings.loadingBoard')}</span>
        {!error && <progress className="board-loading-progress" max={1} value={progress} aria-label={t('settings.loadingBoard')} />}
        {!error && progress !== undefined && <span className="board-loading-percent">{Math.round(progress * 100)}%</span>}
      </div>
    </div>
  )
}
