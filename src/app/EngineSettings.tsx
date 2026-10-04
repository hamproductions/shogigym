import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { restartEngine, useEngineStatus } from '../engine'
import { clearEvalFile, saveEvalFile, useEvalFile } from '../evalStore'
import { getSettings, setSettings, useSettings, type EngineKind } from '../appearance/settings'
import { Button } from './ui/Button'
import { SegmentedField, SettingRow } from './ui/Segmented'

export function EngineSettings() {
  const { t } = useTranslation()
  const st = useSettings()
  const evalFile = useEvalFile()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const reload = () => {
    if (getSettings().engine === 'nnue') restartEngine()
  }
  return (
    <>
      <SegmentedField<EngineKind> label={t('settings.engine')} value={st.engine} options={[{ v: 'yaneuraou', t: t('settings.yaneuraou') }, { v: 'nnue', t: t('settings.yaneuraouNnue') }, { v: 'fairy', t: t('settings.fairyStockfish') }]} onChange={(v) => setSettings({ engine: v })} />
      {st.engine === 'nnue' && (
        <>
          <SettingRow label={t('settings.evalFile')}>
            <div className="app-actions">
              <span className="app-muted">{evalFile ? `${evalFile.name} (${(evalFile.size / 1048576).toFixed(1)} MB)` : t('settings.noEvalFile')}</span>
              <label className="app-btn app-file">
                {busy ? t('settings.loadingEvalFile') : t('settings.loadEvalFile')}
                <input
                  type="file"
                  accept=".bin"
                  disabled={busy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    setBusy(true)
                    setError('')
                    try {
                      await saveEvalFile(file)
                      reload()
                    } catch (failure) {
                      setError((failure as Error).message)
                    } finally {
                      setBusy(false)
                    }
                  }}
                />
              </label>
              {evalFile && (
                <Button onClick={() => clearEvalFile().then(reload, (failure: Error) => setError(failure.message))}>
                  {t('settings.removeEvalFile')}
                </Button>
              )}
            </div>
          </SettingRow>
          {error && <p className="app-result wrong">{error}</p>}
          <SegmentedField label={t('settings.fvScale')} value={st.fvScale} options={[16, 20, 24].map((v) => ({ v, t: String(v) }))} onChange={(v) => setSettings({ fvScale: v })} />
          <p className="app-muted app-credit">{t('settings.fvScaleHint')}</p>
        </>
      )}
      <p className="app-muted app-credit">{t('settings.engineHint')}</p>
    </>
  )
}

export function EngineName() {
  const { t } = useTranslation()
  const status = useEngineStatus()
  const st = useSettings()
  const label = { yaneuraou: t('settings.yaneuraou'), nnue: t('settings.yaneuraouNnue'), fairy: t('settings.fairyStockfish') }[st.engine]
  return (
    <>
      <p className="app-muted app-credit">{t('engine.activeEngine', { name: status.kind === st.engine && status.name ? status.name : `${label} ${status.error ? '' : t('engine.engineStarting')}`.trim() })}</p>
      {status.kind === st.engine && status.error && <p className="app-result wrong">{status.error}</p>}
    </>
  )
}
