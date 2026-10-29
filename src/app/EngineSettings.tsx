import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { restartEngine } from '@/utils/engine'
import { clearEvalFile, saveEvalFile, useEvalFile } from '@/utils/evalStore'
import { downloadEvalFile, evalManifest, type EvalManifest } from '@/utils/evalDownload'
import { clearBookDownloadCache, downloadFullBook, type BookProgress } from '@/utils/bookDownload'
import { clearBookFile, saveBookFile, useBookFile } from '@/utils/openingBook'
import { getSettings, setSettings, useSettings, type EngineKind } from '@/appearance/settings'
import { Button } from '@/app/ui/Button'
import { FilePicker } from '@/app/ui/FilePicker'
import { SegmentedField, SettingRow } from '@/app/ui/Segmented'
import { Text } from '@/components/ui'
import { Muted, Result } from '@/app/panels/panels.styles'

const SettingControl = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '2',
    justifySelf: 'end',
    _phone: { justifySelf: 'start' },
  },
})

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
      <EvalDownload />
      {st.engine === 'nnue' && (
        <>
          <SettingRow label={t('settings.evalFile')}>
            <SettingControl>
              <Muted as="span">{evalFile ? `${evalFile.name} (${(evalFile.size / 1048576).toFixed(1)} MB)` : t('settings.noEvalFile')}</Muted>
              <FilePicker
                accept=".bin"
                disabled={busy}
                onFile={async (file) => {
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
              >
                {busy ? t('settings.loadingEvalFile') : t('settings.loadEvalFile')}
              </FilePicker>
              {evalFile && (
                <Button onClick={() => clearEvalFile().then(reload, (failure: Error) => setError(failure.message))}>{t('settings.removeEvalFile')}</Button>
              )}
            </SettingControl>
          </SettingRow>
          {error && <Result tone="wrong">{error}</Result>}
          <SegmentedField
            label={t('settings.fvScale')}
            value={st.fvScale}
            options={[16, 20, 24].map((v) => ({ v, t: String(v) }))}
            onChange={(v) => setSettings({ fvScale: v })}
          />
          <Text tone="muted" size="2xs" mt="0" mb="2">
            {t('settings.fvScaleHint')}
          </Text>
        </>
      )}
      <Text tone="muted" size="2xs" mt="0" mb="2">
        {t('settings.engineHint')}
      </Text>
      {st.engine !== 'fairy' && <OpeningBookSettings />}
    </>
  )
}

function EvalDownload() {
  const { t } = useTranslation()
  const st = useSettings()
  const evalFile = useEvalFile()
  const controller = useRef<AbortController | null>(null)
  const [manifest, setManifest] = useState<EvalManifest | null>(null)
  const [progress, setProgress] = useState<BookProgress | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const abort = new AbortController()
    evalManifest(abort.signal).then(setManifest, () => undefined)
    return () => abort.abort()
  }, [])
  useEffect(() => () => controller.current?.abort(), [])
  if (!manifest || evalFile?.name === manifest.name) return null
  const download = async () => {
    const abort = new AbortController()
    controller.current = abort
    setError('')
    setProgress({ done: 0, total: manifest.size })
    try {
      await downloadEvalFile(manifest, abort.signal, setProgress)
      const fvScale = manifest.fvScale ?? 24
      const unchanged = st.engine === 'nnue' && st.fvScale === fvScale
      setSettings({ engine: 'nnue', fvScale })
      if (unchanged) restartEngine()
    } catch (failure) {
      if (!abort.signal.aborted) setError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      controller.current = null
      setProgress(null)
    }
  }
  return (
    <>
      <SettingRow label={t('settings.strongerAi')}>
        <SettingControl>
          <Button disabled={!!progress} onClick={download}>
            {t('settings.downloadEval', { name: manifest.name, size: (manifest.size / 1048576).toFixed(0) })}
          </Button>
          {progress && (
            <>
              <progress value={progress.done} max={progress.total} aria-label={t('settings.loadingEvalFile')} />
              <span>{Math.round((progress.done / progress.total) * 100)}%</span>
              <Button onClick={() => controller.current?.abort()}>{t('app.cancel')}</Button>
            </>
          )}
        </SettingControl>
      </SettingRow>
      <Text tone="muted" size="2xs" mt="0" mb="2">
        {t('settings.strongerAiHint')}
      </Text>
      {error && (
        <Result tone="wrong" role="alert">
          {error}
        </Result>
      )}
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
    } catch (error) {
      if (!abort.signal.aborted) setError(error instanceof Error ? error.message : String(error))
    } finally {
      controller.current = null
      setProgress(null)
      setBusy(false)
    }
  }
  return (
    <>
      <SettingRow label={t('settings.openingBook')}>
        <SettingControl>
          <Muted as="span">{file ? `${file.name} (${(file.size / 1048576).toFixed(1)} MB)` : t('settings.compactBook')}</Muted>
          <FilePicker
            accept=".db"
            disabled={busy}
            onFile={async (file) => {
              setBusy(true)
              setError('')
              try {
                await saveBookFile(file)
                restartEngine()
              } catch (error) {
                setError(error instanceof Error ? error.message : String(error))
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? t('settings.loadingBook') : t('settings.importBook')}
          </FilePicker>
          {file && (
            <Button
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError('')
                try {
                  await clearBookFile()
                  restartEngine()
                } catch (error) {
                  setError(error instanceof Error ? error.message : String(error))
                } finally {
                  setBusy(false)
                }
              }}
            >
              {t('settings.removeBook')}
            </Button>
          )}
        </SettingControl>
      </SettingRow>
      <SettingRow label={t('settings.cacheBook')}>
        <SettingControl>
          <Button disabled={busy || !!file} onClick={download}>
            {t('settings.downloadFullBook')}
          </Button>
          <Button disabled={busy} onClick={() => clearBookDownloadCache().catch((error: Error) => setError(error.message))}>
            {t('settings.clearBookCache')}
          </Button>
          {progress && (
            <>
              <progress value={progress.done} max={progress.total} aria-label={t('settings.loadingBook')} />
              <span>{Math.round((progress.done / progress.total) * 100)}%</span>
              <Button onClick={() => controller.current?.abort()}>{t('app.cancel')}</Button>
            </>
          )}
        </SettingControl>
      </SettingRow>
      <Text tone="muted" size="2xs" mt="0" mb="2">
        {t('settings.bookHint')}
      </Text>
      {error && (
        <Result tone="wrong" role="alert">
          {error}
        </Result>
      )}
    </>
  )
}
