import '@/utils/i18n'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'

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
    <styled.div
      position="absolute"
      inset="0"
      zIndex="1"
      display="grid"
      placeItems="center"
      bg="surface.0"
      color="fg.muted"
      role={error ? 'alert' : 'status'}
      aria-busy={!error}
    >
      <styled.div display="grid" justifyItems="center" gap="16px" w="min(280px, 80%)" font="14px/1.4 {fonts.sans}" textAlign="center">
        <span>{error ?? label}</span>
        {!error && (
          <styled.progress
            w="100%"
            h="6px"
            border="0"
            borderRadius="3px"
            overflow="hidden"
            accentColor="accent"
            css={{
              '&::-webkit-progress-bar': { bg: 'border' },
              '&::-webkit-progress-value': { bg: 'accent' },
              '&::-moz-progress-bar': { bg: 'accent' },
            }}
            max={1}
            value={value}
            aria-label={label}
          />
        )}
        {!error && value !== undefined && <styled.span fontVariantNumeric="tabular-nums">{Math.round(value * 100)}%</styled.span>}
      </styled.div>
    </styled.div>
  )
}
