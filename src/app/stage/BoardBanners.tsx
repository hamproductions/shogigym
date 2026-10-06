import './banners.css'
import { useTranslation } from 'react-i18next'
import { LABELS } from '@/utils/analysis'
import { moveText } from '@/utils/shogi'
import { useSession } from '@/app/hooks/session'
import { mistakeHeadline, mistakeIsBad, mistakeSeal, type ShownMistake } from '@/utils/mistake'
import { mainLine, promote } from '@/app/tree'
import { isGameMode, type Preview } from '@/app/types'
import { Button } from '@/app/ui/Button'

function MistakeBanner({ mistake, preview, onBack }: { mistake: ShownMistake; preview: Preview; onBack: () => void }) {
  const { t } = useTranslation()
  const { mode, sfens, playing, setPlaying, setPreview } = useSession()
  const replay = () => {
    if (playing) return setPlaying(false)
    if (preview.step >= preview.moves.length) setPreview({ ...preview, step: 1 })
    setPlaying(true)
  }
  return (
    <div className={`app-preview mistake${mistakeIsBad(mistake) ? '' : ' ok'}`} role="status">
      <span className="app-preview-seal">{mistakeSeal(mistake)}</span>
      {mode === 'drill' && (
        <span className="app-short">
          {mistakeIsBad(mistake) ? t('app.better') : t('app.lesson')}: {moveText(sfens[mistake.base], mistake.expected)}
        </span>
      )}
      {mode === 'tsume' && <span className="app-short">{t('app.notMate')}</span>}
      {mode === 'lesson' && <span className="app-short">{mistake.verdict ? LABELS[mistake.verdict.label].text : t('app.mistake')}</span>}
      <span>
        {mistakeHeadline(moveText(sfens[mistake.base], mistake.usi), mistake)}
        {t('app.headlineEnd')}
        {playing ? t('app.watchWhatFollows') : preview.step < preview.moves.length ? t('app.paused') : t('app.thatIsHowItContinues')}
      </span>
      <Button size="sm" onClick={replay}>
        {playing ? t('app.pause') : t('app.replay')}
      </Button>
      {mode !== 'drill' && (
        <Button size="sm" variant="primary" onClick={onBack}>
          {mode === 'tsume' ? t('tsume.tryAgain') : t('app.goBackAndTryAgain')}
        </Button>
      )}
    </div>
  )
}

function PreviewBanner({ preview }: { preview: Preview }) {
  const { t } = useTranslation()
  const { playing, setPlaying, keepPreview, exitPreview } = useSession()
  return (
    <div className="app-preview" role="status">
      <span className="app-preview-seal">{t('app.preview')}</span>
      <span>
        {t('app.preview2')}: {preview.title}, <span className="app-nowrap">{t('app.moveOf', { step: preview.step, movesCount: preview.moves.length })}</span>
      </span>
      <Button size="sm" onClick={() => setPlaying((v) => !v)}>
        {playing ? t('app.pause') : t('app.play')}
      </Button>
      <Button size="sm" onClick={keepPreview} disabled={preview.step === 0}>
        {t('app.keepTheseMoves')}
      </Button>
      <Button size="sm" onClick={exitPreview}>
        {t('app.exitPreview')}
      </Button>
    </div>
  )
}

function BranchBanner() {
  const { t } = useTranslation()
  const { atEnd, cursor, game, tree, setGame, setCursor, setTree } = useSession()
  const backToMain = () => {
    let i = 0
    const main = mainLine(tree)
    while (i < game.moves.length && main[i] === game.moves[i]) i++
    setGame((g) => ({ ...g, moves: main }))
    setCursor(i)
  }
  return (
    <div className="app-preview branch" role="status">
      <span className="app-preview-seal">{t('app.branch')}</span>
      <span>
        {atEnd ? (
          t('app.variation')
        ) : (
          <>
            {t('app.moveOf2', { cursor, movesCount: game.moves.length })} <strong className="app-branch-tip">{t('app.playADifferentMoveTo')}</strong>
          </>
        )}
      </span>
      <Button size="sm" title={t('app.goBackToTheMain')} onClick={backToMain}>
        {t('app.mainLine')}
      </Button>
      <Button size="sm" onClick={() => setTree((tr) => promote(tr, game.moves))} title={t('app.makeThisVariationTheMain')}>
        {t('app.makeItMain')}
      </Button>
    </div>
  )
}

function ReviewBanner() {
  const { t } = useTranslation()
  const { mode, playing, setPlaying, cursor, game, setCursor } = useSession()
  return (
    <div className="app-preview" role="status">
      <span className="app-preview-seal">{playing ? t('app.play') : t('app.review2')}</span>
      <span>
        {playing ? (
          t('app.playingTheLine')
        ) : (
          <>
            {t('app.moveOf2', { cursor, movesCount: game.moves.length })}{' '}
            <strong className="app-branch-tip">{isGameMode(mode) ? t('app.playADifferentMoveTo') : t('app.aMoveHereReplacesWhat')}</strong>
          </>
        )}
      </span>
      <Button size="sm" onClick={() => (playing ? setPlaying(false) : (setCursor(game.moves.length), setPlaying(false)))}>
        {playing ? t('app.pause') : t('app.goToTheLastMove')}
      </Button>
    </div>
  )
}

export function BoardBanners({ mistake, onBack }: { mistake: ShownMistake | null; onBack: () => void }) {
  const { mode, preview, onVariation, playing, atEnd } = useSession()
  if (preview) return mistake ? <MistakeBanner mistake={mistake} preview={preview} onBack={onBack} /> : <PreviewBanner preview={preview} />
  if (onVariation) return <BranchBanner />
  if (!atEnd || (playing && mode !== 'view' && mode !== 'spar')) return <ReviewBanner />
  return null
}
