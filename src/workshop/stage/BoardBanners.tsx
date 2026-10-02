import { useTranslation } from 'react-i18next'
import { LABELS } from '../../analysis'
import { moveText } from '../../shogi'
import { useSession } from '../hooks/session'
import { mistakeHeadline, mistakeIsBad, mistakeSeal, type ShownMistake } from '../lib/mistake'
import { mainLine, promote } from '../tree'
import { isGameMode, type Preview } from '../types'
import { Button } from '../ui/Button'

function MistakeBanner({ mistake, preview, onBack }: { mistake: ShownMistake; preview: Preview; onBack: () => void }) {
  const { t } = useTranslation()
  const { mode, sfens, playing, setPlaying, setPreview } = useSession()
  const replay = () => {
    if (playing) return setPlaying(false)
    if (preview.step >= preview.moves.length) setPreview({ ...preview, step: 1 })
    setPlaying(true)
  }
  return (
    <div className={`ws-preview mistake${mistakeIsBad(mistake) ? '' : ' ok'}`} role="status">
      <span className="ws-preview-seal">{mistakeSeal(mistake)}</span>
      {mode === 'drill' && (
        <span className="ws-short">
          {mistakeIsBad(mistake) ? t('workshop.better') : t('workshop.lesson')}: {moveText(sfens[mistake.base], mistake.expected)}
        </span>
      )}
      {mode === 'tsume' && <span className="ws-short">{t('workshop.notMate')}</span>}
      {mode === 'lesson' && <span className="ws-short">{mistake.verdict ? LABELS[mistake.verdict.label].text : t('workshop.mistake')}</span>}
      <span>
        {mistakeHeadline(moveText(sfens[mistake.base], mistake.usi), mistake)}
        {t('workshop.headlineEnd')}
        {playing ? t('workshop.watchWhatFollows') : preview.step < preview.moves.length ? t('workshop.paused') : t('workshop.thatIsHowItContinues')}
      </span>
      <Button size="sm" onClick={replay}>{playing ? t('workshop.pause') : t('workshop.replay')}</Button>
      {mode !== 'drill' && (
        <Button size="sm" variant="primary" onClick={onBack}>
          {t('workshop.goBackAndTryAgain')}
        </Button>
      )}
    </div>
  )
}

function PreviewBanner({ preview }: { preview: Preview }) {
  const { t } = useTranslation()
  const { playing, setPlaying, keepPreview, exitPreview } = useSession()
  return (
    <div className="ws-preview" role="status">
      <span className="ws-preview-seal">{t('workshop.preview')}</span>
      <span>
        {t('workshop.preview2')}: {preview.title}, <span className="ws-nowrap">{t('workshop.moveOf', { step: preview.step, movesCount: preview.moves.length })}</span>
      </span>
      <Button size="sm" onClick={() => setPlaying((v) => !v)}>{playing ? t('workshop.pause') : t('workshop.play')}</Button>
      <Button size="sm" onClick={keepPreview} disabled={preview.step === 0}>
        {t('workshop.keepTheseMoves')}
      </Button>
      <Button size="sm" onClick={exitPreview}>{t('workshop.exitPreview')}</Button>
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
    <div className="ws-preview branch" role="status">
      <span className="ws-preview-seal">{t('workshop.branch')}</span>
      <span>
        {atEnd ? (
          t('workshop.variation')
        ) : (
          <>
            {t('workshop.moveOf2', { cursor, movesCount: game.moves.length })} <strong className="ws-branch-tip">{t('workshop.playADifferentMoveTo')}</strong>
          </>
        )}
      </span>
      <Button size="sm" title={t('workshop.goBackToTheMain')} onClick={backToMain}>
        {t('workshop.mainLine')}
      </Button>
      <Button size="sm" onClick={() => setTree((tr) => promote(tr, game.moves))} title={t('workshop.makeThisVariationTheMain')}>
        {t('workshop.makeItMain')}
      </Button>
    </div>
  )
}

function ReviewBanner() {
  const { t } = useTranslation()
  const { mode, playing, setPlaying, cursor, game, setCursor } = useSession()
  return (
    <div className="ws-preview" role="status">
      <span className="ws-preview-seal">{playing ? t('workshop.play') : t('workshop.review2')}</span>
      <span>
        {playing ? (
          t('workshop.playingTheLine')
        ) : (
          <>
            {t('workshop.moveOf2', { cursor, movesCount: game.moves.length })} <strong className="ws-branch-tip">{isGameMode(mode) ? t('workshop.playADifferentMoveTo') : t('workshop.aMoveHereReplacesWhat')}</strong>
          </>
        )}
      </span>
      <Button size="sm" onClick={() => (playing ? setPlaying(false) : (setCursor(game.moves.length), setPlaying(false)))}>{playing ? t('workshop.pause') : t('workshop.goToTheLastMove')}</Button>
    </div>
  )
}

export function BoardBanners({ mistake, onBack }: { mistake: ShownMistake | null; onBack: () => void }) {
  const { preview, onVariation, playing, atEnd } = useSession()
  if (preview) return mistake ? <MistakeBanner mistake={mistake} preview={preview} onBack={onBack} /> : <PreviewBanner preview={preview} />
  if (onVariation) return <BranchBanner />
  if (playing || !atEnd) return <ReviewBanner />
  return null
}
