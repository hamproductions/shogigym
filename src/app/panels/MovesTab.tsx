import './moves.css'
import { useMemo } from 'react'
import { Color } from 'tsshogi'
import { hasLegalMove, otherSide, positionOf } from '@/utils/shogi'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/app/hooks/session'
import { GamesBox } from '@/app/modes/analyze/GamesBox'
import { mainContinuation, nodeAt, removeBranch } from '@/app/tree'
import { isGameMode } from '@/app/types'
import { MovesPane } from './MovesPane'
import type { PanelModel } from './PanelBody'

function useDetectionResult({ spar, watch }: Pick<PanelModel, 'spar' | 'watch'>) {
  const { mode, sfens, game, userSide } = useSession()
  const { winner: watchWinner } = watch
  const mate = useMemo(() => {
    const final = positionOf(sfens.at(-1)!)
    return final.checked && !hasLegalMove(final) ? { winner: final.color === Color.BLACK ? Color.WHITE : Color.BLACK, checkmate: true } : undefined
  }, [sfens])
  let winner: 'sente' | 'gote' | undefined
  if (mode === 'view') winner = watchWinner
  else if (mode === 'spar' && (spar.resigned || spar.flagged)) winner = otherSide(spar.flagged ?? userSide)
  return useMemo(
    () =>
      mate || winner || game.detectionResult
        ? { ...game.detectionPreset, ...game.detectionResult, ...mate, ...(winner ? { winner: winner === 'sente' ? Color.BLACK : Color.WHITE } : {}) }
        : undefined,
    [game.detectionPreset, game.detectionResult, mate, winner],
  )
}

function PreviewMoves({ title }: { title: string }) {
  const { t } = useTranslation()
  const { preview, previewSfens, sfens, game, setPreview } = useSession()
  if (!preview || !previewSfens) return null
  return (
    <>
      <p className="app-muted">{t('app.showingAPreviewTheseMoves')}</p>
      <MovesPane
        sfens={[...sfens.slice(0, preview.base), ...previewSfens]}
        moves={[...game.moves.slice(0, preview.base), ...preview.moves]}
        cursor={preview.base + preview.step}
        setCursor={(i) => i >= preview.base && setPreview({ ...preview, step: i - preview.base })}
        title={title}
        detectionPreset={game.detectionPreset}
      />
    </>
  )
}

export function MovesTab({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, preview, previewSfens, sfens, game, cursor, setCursor, setGame, tree, setTree, gameOver } = useSession()
  const { analyze, spar, watch, evaluation, setConfirm } = model
  const detectionResult = useDetectionResult({ spar, watch })
  const title = analyze.gameTitle || t('app.thisGame')
  if (preview && previewSfens) return <PreviewMoves title={title} />
  return (
    <>
      <MovesPane
        sfens={sfens}
        detectionResult={detectionResult}
        detectionPreset={game.detectionPreset}
        moves={game.moves}
        cursor={cursor}
        setCursor={setCursor}
        title={title}
        onScore={evaluation.recordEval}
        tree={isGameMode(mode) ? tree : null}
        autoRate={analyze.autoRating}
        canRate={mode !== 'view' && (mode === 'analyze' || gameOver || spar.resigned)}
        empty={isGameMode(mode) || mode === 'view' ? undefined : t('moves.noMovesYetSolve')}
        onSwitch={(path) => {
          setGame((g) => ({ ...g, detectionResult: undefined, moves: [...path, ...mainContinuation(nodeAt(tree, path))] }))
          setCursor(path.length)
        }}
        onDelete={(path, size) =>
          setConfirm({
            text: t('app.deleteVariation', { count: size }),
            run: () => setTree((tr) => removeBranch(tr, path)),
            yes: t('app.delete'),
            no: t('app.keepIt'),
          })
        }
      />
      {isGameMode(mode) && !preview && <GamesBox games={analyze} />}
    </>
  )
}
