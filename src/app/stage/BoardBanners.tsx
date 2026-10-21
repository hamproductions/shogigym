import { useTranslation } from 'react-i18next'
import { LABELS } from '@/utils/analysis'
import { moveText } from '@/utils/shogi'
import { useSession } from '@/app/hooks/session'
import { FlipMarks } from '@/app/ui/SideMark'
import { mistakeHeadline, mistakeIsBad, mistakeSeal, type ShownMistake } from '@/utils/mistake'
import { mainLine, promote } from '@/app/tree'
import { isGameMode, type Preview } from '@/app/types'
import { styled } from 'styled-system/jsx'
import { BannerAction, banner, bannerSeal, bannerText } from './stage.styles'

const BranchTip = styled('strong', { base: { fontWeight: 'bold', color: 'highlight', _narrow: { display: 'none' } } })

function MistakeBanner({ mistake, preview, onBack }: { mistake: ShownMistake; preview: Preview; onBack: () => void }) {
  const { t } = useTranslation()
  const { mode, sfens, playing, setPlaying, setPreview, flipped } = useSession()
  const replay = () => {
    if (playing) return setPlaying(false)
    if (preview.step >= preview.moves.length) setPreview({ ...preview, step: 1 })
    setPlaying(true)
  }
  return (
    <div className={banner({ tone: mistakeIsBad(mistake) ? 'mistake' : 'ok' })} data-banner="" role="status">
      <span className={bannerSeal({ tone: 'mistake' })}>{mistakeSeal(mistake)}</span>
      {mode === 'drill' && (
        <span className={bannerText({ fit: 'short' })}>
          {mistakeIsBad(mistake) ? t('app.better') : t('app.lesson')}:{' '}
          <FlipMarks flipped={flipped}>{moveText(sfens[mistake.base], mistake.expected)}</FlipMarks>
        </span>
      )}
      {mode === 'tsume' && <span className={bannerText({ fit: 'short' })}>{t('app.notMate')}</span>}
      {mode === 'lesson' && <span className={bannerText({ fit: 'short' })}>{mistake.verdict ? LABELS[mistake.verdict.label].text : t('app.mistake')}</span>}
      <span className={bannerText({ fit: 'hide' })}>
        <FlipMarks flipped={flipped}>{mistakeHeadline(moveText(sfens[mistake.base], mistake.usi), mistake)}</FlipMarks>
        {t('app.headlineEnd')}
        {playing ? t('app.watchWhatFollows') : preview.step < preview.moves.length ? t('app.paused') : t('app.thatIsHowItContinues')}
      </span>
      <BannerAction size="sm" bg="onFill.soft" color="inherit" onClick={replay}>
        {playing ? t('app.pause') : t('app.replay')}
      </BannerAction>
      {mode !== 'drill' && (
        <BannerAction size="sm" variant="primary" bg="gofun" color="var(--banner)" fontWeight="bold" onClick={onBack}>
          {mode === 'tsume' ? t('tsume.tryAgain') : t('app.goBackAndTryAgain')}
        </BannerAction>
      )}
    </div>
  )
}

function PreviewBanner({ preview }: { preview: Preview }) {
  const { t } = useTranslation()
  const { playing, setPlaying, keepPreview, exitPreview } = useSession()
  return (
    <div className={banner()} data-banner="" role="status">
      <span className={bannerSeal()}>{t('app.preview')}</span>
      <span className={bannerText({ fit: 'hide' })}>
        {t('app.preview2')}: {preview.title},{' '}
        <styled.span whiteSpace="nowrap">{t('app.moveOf', { step: preview.step, movesCount: preview.moves.length })}</styled.span>
      </span>
      <BannerAction size="sm" onClick={() => setPlaying((v) => !v)}>
        {playing ? t('app.pause') : t('app.play')}
      </BannerAction>
      <BannerAction size="sm" onClick={keepPreview} disabled={preview.step === 0}>
        {t('app.keepTheseMoves')}
      </BannerAction>
      <BannerAction size="sm" onClick={exitPreview}>
        {t('app.exitPreview')}
      </BannerAction>
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
    <div className={banner({ tone: 'branch' })} data-banner="" role="status">
      <span className={bannerSeal({ tone: 'branch' })}>{t('app.branch')}</span>
      <span className={bannerText({ fit: atEnd ? 'wrap' : 'tip' })}>
        {atEnd ? (
          t('app.variation')
        ) : (
          <>
            {t('app.moveOf2', { cursor, movesCount: game.moves.length })} <BranchTip>{t('app.playADifferentMoveTo')}</BranchTip>
          </>
        )}
      </span>
      <BannerAction size="sm" title={t('app.goBackToTheMain')} onClick={backToMain}>
        {t('app.mainLine')}
      </BannerAction>
      <BannerAction size="sm" onClick={() => setTree((tr) => promote(tr, game.moves))} title={t('app.makeThisVariationTheMain')}>
        {t('app.makeItMain')}
      </BannerAction>
    </div>
  )
}

function ReviewBanner() {
  const { t } = useTranslation()
  const { mode, playing, setPlaying, cursor, game, setCursor } = useSession()
  return (
    <div className={banner()} data-banner="" role="status">
      <span className={bannerSeal()}>{playing ? t('app.play') : t('app.review2')}</span>
      <span className={bannerText({ fit: playing ? 'hide' : 'tip' })}>
        {playing ? (
          t('app.playingTheLine')
        ) : (
          <>
            {t('app.moveOf2', { cursor, movesCount: game.moves.length })}{' '}
            <BranchTip>{isGameMode(mode) || mode === 'view' ? t('app.playADifferentMoveTo') : t('app.aMoveHereReplacesWhat')}</BranchTip>
          </>
        )}
      </span>
      <BannerAction size="sm" onClick={() => (playing ? setPlaying(false) : (setCursor(game.moves.length), setPlaying(false)))}>
        {playing ? t('app.pause') : t('app.goToTheLastMove')}
      </BannerAction>
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
