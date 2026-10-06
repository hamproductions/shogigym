import './loading.css'
import '@/utils/i18n'
import { useTranslation } from 'react-i18next'

export type BoardLoadingState = { phase: 'assets' | 'previews' | 'pieces' | 'shaders'; done: number; total: number }

const phases = {
  assets: 'settings.loadingArtwork',
  previews: 'settings.loadingPreviews',
  pieces: 'settings.loadingPieces',
  shaders: 'settings.loadingShaders',
}

export function BoardLoading({ error, progress, state }: { error?: string; progress?: number; state?: BoardLoadingState }) {
  const { t } = useTranslation()
  const value = state?.phase === 'shaders' ? undefined : state ? state.done / state.total : progress
  const label = state ? t(phases[state.phase], { done: state.done, total: state.total }) : t('settings.loadingBoard')
  return (
    <div className="board-loading" role={error ? 'alert' : 'status'} aria-busy={!error}>
      <div className="board-loading-content">
        {!error && <span className="board-loading-spinner" aria-hidden="true" />}
        <span>{error ?? label}</span>
        {!error && <progress className="board-loading-progress" max={1} value={value} aria-label={label} />}
        {!error && value !== undefined && <span className="board-loading-percent">{Math.round(value * 100)}%</span>}
      </div>
    </div>
  )
}
