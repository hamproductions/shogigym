import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { restartEngine, useEngineStatus } from '../engine'
import { clearEvalFile, saveEvalFile, useEvalFile } from '../evalStore'
import { getSettings, setSettings, useSettings, type EngineKind } from './settings'

function Seg<T extends string | number>({ label, value, options, set }: { label: string; value: T; options: { v: T; t: string }[]; set: (v: T) => void }) {
  return (
    <div className="ws-setting">
      <span>{label}</span>
      <div className="ws-seg">
        {options.map((o) => (
          <button key={String(o.v)} className={value === o.v ? 'on' : ''} onClick={() => set(o.v)}>
            {o.t}
          </button>
        ))}
      </div>
    </div>
  )
}

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
      <Seg<EngineKind> label={t('settings.engine')} value={st.engine} options={[{ v: 'yaneuraou', t: t('settings.yaneuraou') }, { v: 'nnue', t: t('settings.yaneuraouNnue') }, { v: 'fairy', t: t('settings.fairyStockfish') }]} set={(v) => setSettings({ engine: v })} />
      {st.engine === 'nnue' && (
        <>
          <div className="ws-setting">
            <span>{t('settings.evalFile')}</span>
            <div className="ws-actions">
              <span className="ws-muted">{evalFile ? `${evalFile.name} (${(evalFile.size / 1048576).toFixed(1)} MB)` : t('settings.noEvalFile')}</span>
              <label className="ws-file">
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
                <button onClick={() => clearEvalFile().then(reload, (failure: Error) => setError(failure.message))}>
                  {t('settings.removeEvalFile')}
                </button>
              )}
            </div>
          </div>
          {error && <p className="ws-result wrong">{error}</p>}
          <Seg label={t('settings.fvScale')} value={st.fvScale} options={[16, 20, 24].map((v) => ({ v, t: String(v) }))} set={(v) => setSettings({ fvScale: v })} />
          <p className="ws-muted ws-credit">{t('settings.fvScaleHint')}</p>
        </>
      )}
      <p className="ws-muted ws-credit">{t('settings.engineHint')}</p>
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
      <p className="ws-muted ws-credit">{t('engine.activeEngine', { name: status.kind === st.engine && status.name ? status.name : `${label} ${status.error ? '' : t('engine.engineStarting')}`.trim() })}</p>
      {status.kind === st.engine && status.error && <p className="ws-result wrong">{status.error}</p>}
    </>
  )
}
