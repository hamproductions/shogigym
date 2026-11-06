import { Suspense, lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadGames } from '@/app/games'
import { ImportBox } from '@/app/modes/analyze/ImportBox'
import { SavedGames } from '@/app/modes/analyze/SavedGames'
import type { AnalyzeGames } from '@/app/modes/analyze/useAnalyzeGames'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { Segmented } from '@/app/ui/Segmented'
import { styled } from 'styled-system/jsx'

const PositionEditor = lazy(() => import('@/app/modes/analyze/PositionEditor').then((m) => ({ default: m.PositionEditor })))

export function OpenGameDialog({ games, onClose }: { games: AnalyzeGames; onClose: () => void }) {
  const { t } = useTranslation()
  const stored = loadGames()
  const [tab, setTab] = useState<'saved' | 'file' | 'edit'>(stored.length ? 'saved' : 'file')
  return (
    <Dialog label={t('rail.open')} onBackdrop={onClose}>
      <DialogHeader title={t('rail.open')} closeLabel={t('settings.closeSettings')} onClose={onClose} />
      <styled.div
        width="100%"
        css={{
          '& > .open-game-tabs': { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', width: '100%' },
          '& > .open-game-tabs > *': { minWidth: 0, minHeight: '44px', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal' },
        }}
      >
        <Segmented
          className="open-game-tabs"
          label={t('rail.open')}
          value={tab}
          onChange={setTab}
          options={[
            { v: 'saved', t: `${t('games.savedGames')} (${stored.length})` },
            { v: 'file', t: t('rail.importKif') },
            { v: 'edit', t: t('positionEditor.title') },
          ]}
        />
      </styled.div>
      {tab === 'saved' ? (
        <SavedGames games={games} onOpen={onClose} />
      ) : tab === 'edit' ? (
        <Suspense fallback={null}>
          <PositionEditor games={games} onClose={onClose} />
        </Suspense>
      ) : (
        <ImportBox
          bare
          onImport={(text) => {
            const error = games.importGame(text)
            if (!error) onClose()
            return error
          }}
        />
      )}
    </Dialog>
  )
}
