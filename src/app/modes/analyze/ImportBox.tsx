import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { css } from 'styled-system/css'
import { Box, styled, Wrap } from 'styled-system/jsx'
import { input } from 'styled-system/recipes'
import { decodeKifuFile } from '@/utils/kifu'
import { Button } from '@/app/ui/Button'
import { FilePicker } from '@/app/ui/FilePicker'
import { cx } from '@/app/ui/cx'
import { Text } from '@/components/ui'

export function ImportBox({ onImport, open, bare }: { onImport: (text: string) => string | null; open?: boolean; bare?: boolean }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const actions = useRef<HTMLDivElement>(null)
  const content = (
    <>
      <Text tone="muted" size="sm" my="1em">
        {t('games.dropHint')}
      </Text>
      <textarea
        className={cx(input(), css({ mt: '1', mb: '2', resize: 'vertical' }))}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={t('games.pasteAGameRecordHere')}
      />
      <Wrap ref={actions} gap="2" align="center" mb="3">
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
      </Wrap>
      {error && <p className={cx('app-result wrong', css({ mb: '3!' }))}>{error}</p>}
    </>
  )
  if (bare) return <Box mt="3">{content}</Box>
  return (
    <styled.details
      mb="2"
      borderBottom="1px solid {colors.border}"
      open={open}
      onToggle={(e) => {
        if (e.currentTarget.open) setTimeout(() => actions.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
      }}
    >
      <styled.summary display="flex" flexDirection="column" pt="1.5" pb="2.5" cursor="pointer">
        <span className="app-lib-ja">{t('games.importAGame')}</span>
        <span className="app-lib-en">{t('games.kifKi2CsaUsiOr')}</span>
      </styled.summary>
      {content}
    </styled.details>
  )
}
