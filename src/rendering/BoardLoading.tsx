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

const LINES = Array.from({ length: 8 }, (_, i) => `${6 + ((i + 1) * 88) / 9}%`)

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
      pointerEvents="none"
      role={error ? 'alert' : 'status'}
      aria-busy={!error}
      aria-label={error ?? label}
    >
      {error ? (
        <styled.span color="fg.muted" font="14px/1.4 {fonts.sans}" textAlign="center" pointerEvents="auto">
          {error}
        </styled.span>
      ) : (
        <styled.div
          position="relative"
          h="min(82%, 600px)"
          maxW="90%"
          aspectRatio="11 / 12"
          borderRadius="md"
          bg="surface.2"
          overflow="hidden"
          animation="skeleton-pulse 1.4s ease-in-out infinite"
        >
          {LINES.map((at) => (
            <styled.span key={`v${at}`} position="absolute" top="6%" bottom="6%" w="1px" bg="border" style={{ left: at }} />
          ))}
          {LINES.map((at) => (
            <styled.span key={`h${at}`} position="absolute" left="6%" right="6%" h="1px" bg="border" style={{ top: at }} />
          ))}
          {value !== undefined && <styled.span position="absolute" left="0" bottom="0" h="2px" bg="accent" style={{ width: `${value * 100}%` }} />}
        </styled.div>
      )}
    </styled.div>
  )
}
