import { useTranslation } from 'react-i18next'
import { restartEngine, useEngineStatus } from '@/utils/engine'
import { useSettings, type EngineKind } from '@/appearance/settings'
import { engineLabel } from '@/utils/engineModels'
import { Button } from '@/app/ui/Button'
import { Text } from '@/components/ui'
import { Result } from '@/app/panels/panels.styles'

export function EngineName({ kind }: { kind?: EngineKind }) {
  const { t } = useTranslation()
  const status = useEngineStatus()
  const settings = useSettings()
  const selected = kind ?? settings.engineAnalysis ?? settings.engine
  const label = engineLabel(selected)
  const matching = selected === status.kind
  return (
    <>
      <Text tone="muted" size="2xs" mt="0" mb="2" title={matching ? status.name : undefined}>
        {t('engine.activeEngine', {
          name: `${label}${matching && status.loading ? ` · ${t('settings.loadingModel')}` : ''}`,
        })}
      </Text>
      {matching && status.error && (
        <div role="alert">
          <Result tone="wrong">{status.error}</Result>
          <Button size="sm" onClick={restartEngine}>
            {t('tsume.tryAgain')}
          </Button>
        </div>
      )}
    </>
  )
}
