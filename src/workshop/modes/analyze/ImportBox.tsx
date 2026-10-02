import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { decodeKifuFile } from '../../../kifu'

export function ImportBox({ onImport, open }: { onImport: (text: string) => string | null; open?: boolean }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <details
      className="ws-import"
      open={open}
      onToggle={(e) => {
        const box = e.currentTarget
        if (box.open) setTimeout(() => box.querySelector('.ws-actions')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
      }}
    >
      <summary>
        <span className="ws-lib-ja">{t('games.importAGame')}</span>
        <span className="ws-lib-en">{t('games.kifKi2CsaUsiOr')}</span>
      </summary>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={t('games.pasteAGameRecordHere')} />
      <div className="ws-actions">
        <button className="primary" onClick={() => setError(onImport(text))} disabled={!text.trim()}>
          {t('games.loadIt')}
        </button>
        <label className="ws-file">
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
      {error && <p className="ws-result wrong">{error}</p>}
    </details>
  )
}
