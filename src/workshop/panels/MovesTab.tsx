import { useTranslation } from 'react-i18next'
import { useSession } from '../hooks/session'
import { GamesBox } from '../modes/analyze/GamesBox'
import { mainContinuation, nodeAt, removeBranch } from '../tree'
import { isGameMode } from '../types'
import { MovesPane } from './MovesPane'
import type { PanelModel } from './PanelBody'

export function MovesTab({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, preview, previewSfens, sfens, game, cursor, setCursor, setPreview, setGame, tree, setTree, gameOver } = useSession()
  const { analyze, spar, evaluation, setConfirm } = model
  const title = analyze.gameTitle || t('workshop.thisGame')
  if (preview && previewSfens)
    return (
      <>
        <p className="ws-muted">{t('workshop.showingAPreviewTheseMoves')}</p>
        <MovesPane sfens={[...sfens.slice(0, preview.base), ...previewSfens]} moves={[...game.moves.slice(0, preview.base), ...preview.moves]} cursor={preview.base + preview.step} setCursor={(i) => i >= preview.base && setPreview({ ...preview, step: i - preview.base })} title={title} />
      </>
    )
  return (
    <>
      <MovesPane
        sfens={sfens}
        moves={game.moves}
        cursor={cursor}
        setCursor={setCursor}
        title={title}
        onScore={evaluation.recordEval}
        tree={isGameMode(mode) ? tree : null}
        autoRate={analyze.autoRating}
        canRate={mode === 'analyze' || gameOver || spar.resigned}
        onSwitch={(path) => {
          setGame((g) => ({ ...g, moves: [...path, ...mainContinuation(nodeAt(tree, path))] }))
          setCursor(path.length)
        }}
        onDelete={(path, size) => setConfirm({ text: t('workshop.deleteVariation', { count: size }), run: () => setTree((tr) => removeBranch(tr, path)), yes: t('workshop.delete'), no: t('workshop.keepIt') })}
      />
      {isGameMode(mode) && !preview && <GamesBox games={analyze} />}
    </>
  )
}
