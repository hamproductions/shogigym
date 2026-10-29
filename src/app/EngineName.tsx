import { useTranslation } from 'react-i18next'
import { restartEngine, useEngineStatus } from '@/utils/engine'
import { useSettings } from '@/appearance/settings'
import { Button } from '@/app/ui/Button'
import { Text } from '@/components/ui'
import { Result } from '@/app/panels/panels.styles'

export function EngineName() {
  const { t } = useTranslation()
  const status = useEngineStatus()
  const st = useSettings()
  const label = { yaneuraou: t('settings.yaneuraou'), nnue: t('settings.yaneuraouNnue'), fairy: t('settings.fairyStockfish') }[st.engine]
  return (
    <>
      <Text tone="muted" size="2xs" mt="0" mb="2">
        {t('engine.activeEngine', {
          name: status.kind === st.engine && status.name ? status.name : `${label} ${status.error ? '' : t('engine.engineStarting')}`.trim(),
        })}
      </Text>
      {status.kind === st.engine && status.error && (
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
