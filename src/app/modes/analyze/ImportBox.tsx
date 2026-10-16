import './import.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { decodeKifuFile } from '@/utils/kifu'
import { Button } from '@/app/ui/Button'
import { FilePicker } from '@/app/ui/FilePicker'

export function ImportBox({ onImport, open, bare }: { onImport: (text: string) => string | null; open?: boolean; bare?: boolean }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const content = (
    <>
      <p className="app-muted">{t('games.dropHint')}</p>
      <textarea className="app-field" value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={t('games.pasteAGameRecordHere')} />
      <div className="app-actions">
        <Button size="sm" variant="primary" onClick={() => setError(onImport(text))} disabled={!text.trim()}>
          {t('games.loadIt')}
        </Button>
        {typeof navigator !== 'undefined' && !!navigator.clipboard?.readText && (
          <Button
            size="sm"
            onClick={async () => {
              try {
                const pasted = await navigator.clipboard.readText()
                setText(pasted)
                setError(pasted.trim() ? onImport(pasted) : t('games.clipboardEmpty'))
              } catch {
                setError(t('games.clipboardBlocked'))
              }
            }}
          >
            {t('games.pasteFromClipboard')}
          </Button>
        )}
        <FilePicker
          accept=".kif,.kifu,.ki2,.csa,.txt,.usi,.sfen"
          size="sm"
          onFile={async (file) => {
            setError(onImport(decodeKifuFile(await file.arrayBuffer())))
          }}
        >
          {t('games.openAFile')}
        </FilePicker>
      </div>
      {error && <p className="app-result wrong">{error}</p>}
    </>
  )
  if (bare) return <div className="app-import bare">{content}</div>
  return (
    <details
      className="app-import"
      open={open}
      onToggle={(e) => {
        const box = e.currentTarget
        if (box.open) setTimeout(() => box.querySelector('.app-actions')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
      }}
    >
      <summary>
        <span className="app-lib-ja">{t('games.importAGame')}</span>
        <span className="app-lib-en">{t('games.kifKi2CsaUsiOr')}</span>
      </summary>
      {content}
    </details>
  )
}
