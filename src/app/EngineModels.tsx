import { useEffect, useId, useRef, useState, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, styled } from 'styled-system/jsx'
import { setSettings, useSettings, type EngineKind } from '@/appearance/settings'
import { cachedEngineModels, downloadEngineModel, engineLabel, modelFor } from '@/utils/engineModels'
import { Button } from '@/app/ui/Button'
import { Text } from '@/components/ui'
import { Result } from '@/app/panels/panels.styles'

const choices: EngineKind[] = ['tsuyoura-mini', 'tsuyoura-micro', 'suisho5', 'tanuki-hao', 'aobannue', 'tanuki-li', 'yaneuraou', 'fairy', 'nnue']

const ModelSelect = styled('select', {
  base: {
    width: '100%',
    minWidth: '0',
    minHeight: '44px',
    px: '2.5',
    border: '1px solid',
    borderColor: 'border',
    borderRadius: 'sm',
    bg: 'field',
    color: 'fg.default',
    fontSize: 'sm',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid', outlineColor: 'focus', outlineOffset: '2px' },
  },
})

export function EngineSelect(props: ComponentProps<typeof ModelSelect>) {
  return <ModelSelect {...props} />
}

function ModelField({ purpose, value, onChange }: { purpose: 'analysis' | 'playing'; value?: EngineKind; onChange?: (kind: EngineKind) => void }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const selected = value ?? (purpose === 'analysis' ? settings.engineAnalysis : settings.enginePlaying) ?? settings.engine
  const field = useId()
  const [cached, setCached] = useState<Set<EngineKind>>(new Set())
  const [progress, setProgress] = useState<{ id: EngineKind; done: number; total: number } | null>(null)
  const [error, setError] = useState<{ id: EngineKind; message: string } | null>(null)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => {
    let mounted = true
    cachedEngineModels().then(
      (ready) => {
        if (mounted) setCached(ready)
      },
      () => undefined,
    )
    return () => {
      mounted = false
      controller.current?.abort()
    }
  }, [])
  const choose = async (id: EngineKind) => {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setProgress(null)
    setError(null)
    try {
      const model = modelFor(id)
      if (model) {
        setProgress({ id, done: 0, total: model.size })
        await downloadEngineModel(model, abort.signal, (done, total) => {
          if (!abort.signal.aborted) setProgress({ id, done, total })
        })
        setCached((ready) => new Set([...ready, id]))
      }
      abort.signal.throwIfAborted()
      if (onChange) onChange(id)
      else setSettings(purpose === 'analysis' ? { engineAnalysis: id } : { enginePlaying: id })
    } catch (failure) {
      if (!abort.signal.aborted) setError({ id, message: failure instanceof Error ? failure.message : String(failure) })
    } finally {
      if (controller.current === abort) {
        controller.current = null
        setProgress(null)
      }
    }
  }
  const size = (id: EngineKind) => modelFor(id)?.size ?? (id === 'tsuyoura-mini' ? 8714476 : id === 'tsuyoura-micro' ? 4867714 : undefined)
  const shown = progress?.id ?? selected
  const hint =
    shown === 'tsuyoura-mini'
      ? 'settings.miniHint'
      : shown === 'tsuyoura-micro'
        ? 'settings.microHint'
        : shown === 'nnue'
          ? 'settings.customModelHint'
          : undefined
  return (
    <Box>
      <Box display="grid" gridTemplateColumns="auto minmax(0, 1fr)" alignItems="center" gap="2">
        <styled.label htmlFor={field} fontSize="sm" minW="3em">
          {t(`settings.${purpose}Ai`)}
        </styled.label>
        <EngineSelect id={field} aria-label={t(`settings.${purpose}Ai`)} value={shown} onChange={(event) => void choose(event.target.value as EngineKind)}>
          {choices.map((id) => (
            <option key={id} value={id}>
              {engineLabel(id)}
              {size(id) ? ` · ${(size(id)! / 1048576).toFixed(1)} MB` : ''}
            </option>
          ))}
        </EngineSelect>
      </Box>
      {hint && (
        <Text tone="muted" size="xs" m="0" mt="1">
          {t(hint)}
        </Text>
      )}
      {modelFor(selected) && cached.has(selected) && !progress && (
        <Text tone="muted" size="xs" m="0" mt="1">
          {t('settings.modelSaved')}
        </Text>
      )}
      {progress && (
        <Box mt="2" role="status" aria-live="polite">
          <Box display="flex" alignItems="center" justifyContent="space-between" gap="2">
            <Text size="xs" m="0">
              {t('settings.modelDownloadProgress', { name: engineLabel(progress.id), percent: Math.round((progress.done / progress.total) * 100) })}
            </Text>
            <Button size="sm" minH="44px" onClick={() => controller.current?.abort()}>
              {t('app.cancel')}
            </Button>
          </Box>
          <styled.progress w="100%" value={progress.done} max={progress.total} aria-label={t('settings.loadingModel')} />
        </Box>
      )}
      {error && (
        <Box mt="2">
          <Result tone="wrong" role="alert">
            {error.message}
          </Result>
          <Button size="sm" minH="44px" onClick={() => void choose(error.id)}>
            {t('tsume.tryAgain')}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export function EngineModels({
  purpose = 'analysis',
  value,
  onChange,
}: {
  purpose?: 'analysis' | 'playing'
  value?: EngineKind
  onChange?: (kind: EngineKind) => void
}) {
  return (
    <Box py="2">
      <ModelField purpose={purpose} value={value} onChange={onChange} />
    </Box>
  )
}
