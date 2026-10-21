import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { restartEngine, useEngineStatus } from '@/utils/engine'
import { clearEvalFile, saveEvalFile, useEvalFile } from '@/utils/evalStore'
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
