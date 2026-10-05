import './import.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { decodeKifuFile } from '@/utils/kifu'
import { Button } from '@/app/ui/Button'

export function ImportBox({ onImport, open }: { onImport: (text: string) => string | null; open?: boolean }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
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
      <textarea className="app-field" value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={t('games.pasteAGameRecordHere')} />
      <div className="app-actions">
        <Button size="sm" variant="primary" onClick={() => setError(onImport(text))} disabled={!text.trim()}>
          {t('games.loadIt')}
        </Button>
        <label className="app-btn sm app-file">
          {t('games.openAFile')}
          <input
            type="file"
            accept=".kif,.kifu,.ki2,.csa,.txt,.usi,.sfen"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) setError(onImport(decodeKifuFile(await file.arrayBuffer())))
            }}
          />
        </label>
      </div>
      {error && <p className="app-result wrong">{error}</p>}
    </details>
  )
}
