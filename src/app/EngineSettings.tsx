import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { restartEngine, useEngineStatus } from '@/utils/engine'
import { clearEvalFile, saveEvalFile, useEvalFile } from '@/utils/evalStore'
import { clearBookDownloadCache, downloadFullBook, type BookProgress } from '@/utils/bookDownload'
import { clearBookFile, saveBookFile, useBookFile } from '@/utils/openingBook'
import { getSettings, setSettings, useSettings, type EngineKind } from '@/appearance/settings'
import { Button } from '@/app/ui/Button'
import { SegmentedField, SettingRow } from '@/app/ui/Segmented'

function reload() {
  if (getSettings().engine === 'nnue') restartEngine()
}

function errorMessage(failure: unknown) {
  return failure instanceof Error ? failure.message : String(failure)
}

export function EngineSettings() {
  const { t } = useTranslation()
  const st = useSettings()
  const evalFile = useEvalFile()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <>
      <SegmentedField<EngineKind>
        label={t('settings.engine')}
        value={st.engine}
        options={[
          { v: 'yaneuraou', t: t('settings.yaneuraou') },
          { v: 'nnue', t: t('settings.yaneuraouNnue') },
          { v: 'fairy', t: t('settings.fairyStockfish') },
        ]}
        onChange={(v) => setSettings({ engine: v })}
      />
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
                    const picked = e.target.files?.[0]
                    e.target.value = ''
                    if (!picked) return
                    setBusy(true)
                    setError('')
                    try {
                      await saveEvalFile(picked)
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
                <Button onClick={() => clearEvalFile().then(reload, (failure: Error) => setError(failure.message))}>{t('settings.removeEvalFile')}</Button>
              )}
            </div>
          </SettingRow>
          {error && <p className="app-result wrong">{error}</p>}
          <SegmentedField
            label={t('settings.fvScale')}
            value={st.fvScale}
            options={[16, 20, 24].map((v) => ({ v, t: String(v) }))}
            onChange={(v) => setSettings({ fvScale: v })}
          />
          <p className="app-muted app-credit">{t('settings.fvScaleHint')}</p>
        </>
      )}
      <p className="app-muted app-credit">{t('settings.engineHint')}</p>
      {st.engine !== 'fairy' && <OpeningBookSettings />}
    </>
  )
}

function OpeningBookSettings() {
  const { t } = useTranslation()
  const file = useBookFile()
  const controller = useRef<AbortController | null>(null)
  const [progress, setProgress] = useState<BookProgress | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => () => controller.current?.abort(), [])
  const download = async () => {
    const abort = new AbortController()
    controller.current = abort
    setBusy(true)
    setError('')
    setProgress({ done: 0, total: 1 })
    try {
      await downloadFullBook(abort.signal, setProgress)
      restartEngine()
    } catch (failure) {
      if (!abort.signal.aborted) setError(errorMessage(failure))
    } finally {
      controller.current = null
      setProgress(null)
      setBusy(false)
    }
  }
  return (
    <>
      <SettingRow label={t('settings.openingBook')}>
        <div className="app-actions">
          <span className="app-muted">{file ? `${file.name} (${(file.size / 1048576).toFixed(1)} MB)` : t('settings.compactBook')}</span>
          <label className="app-btn app-file">
            {busy ? t('settings.loadingBook') : t('settings.importBook')}
            <input
              type="file"
              accept=".db"
              disabled={busy}
              onChange={async (event) => {
                const picked = event.target.files?.[0]
                event.target.value = ''
                if (!picked) return
                setBusy(true)
                setError('')
                try {
                  await saveBookFile(picked)
                  restartEngine()
                } catch (failure) {
                  setError(errorMessage(failure))
                } finally {
                  setBusy(false)
                }
              }}
            />
          </label>
          {file && (
            <Button
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError('')
                try {
                  await clearBookFile()
                  restartEngine()
                } catch (failure) {
                  setError(errorMessage(failure))
                } finally {
                  setBusy(false)
                }
              }}
            >
              {t('settings.removeBook')}
            </Button>
          )}
        </div>
      </SettingRow>
      <SettingRow label={t('settings.cacheBook')}>
        <div className="app-actions">
          <Button disabled={busy || !!file} onClick={download}>
            {t('settings.downloadFullBook')}
          </Button>
          <Button disabled={busy} onClick={() => clearBookDownloadCache().catch((failure: Error) => setError(failure.message))}>
            {t('settings.clearBookCache')}
          </Button>
          {progress && (
            <>
              <progress value={progress.done} max={progress.total} aria-label={t('settings.loadingBook')} />
              <span>{Math.round((progress.done / progress.total) * 100)}%</span>
              <Button onClick={() => controller.current?.abort()}>{t('app.cancel')}</Button>
            </>
          )}
        </div>
      </SettingRow>
      <p className="app-muted app-credit">{t('settings.bookHint')}</p>
      {error && (
        <p className="app-result wrong" role="alert">
          {error}
        </p>
      )}
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
      <p className="app-muted app-credit">
        {t('engine.activeEngine', {
          name: status.kind === st.engine && status.name ? status.name : `${label} ${status.error ? '' : t('engine.engineStarting')}`.trim(),
        })}
      </p>
      {status.kind === st.engine && status.error && (
        <div role="alert">
          <p className="app-result wrong">{status.error}</p>
          <Button size="sm" onClick={restartEngine}>
            {t('tsume.tryAgain')}
          </Button>
        </div>
      )}
    </>
  )
}
