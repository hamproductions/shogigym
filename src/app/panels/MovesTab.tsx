import { useMemo } from 'react'
import { Color } from 'tsshogi'
import { hasLegalMove, positionOf } from '@/utils/shogi'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/app/hooks/session'
import { GamesBox } from '@/app/modes/analyze/GamesBox'
import { mainContinuation, nodeAt, removeBranch } from '@/app/tree'
import { isGameMode } from '@/app/types'
import { MovesPane } from './MovesPane'
import type { PanelModel } from './PanelBody'
import { Muted } from './panels.styles'

export function MovesTab({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, preview, previewSfens, sfens, game, cursor, setCursor, setPreview, setGame, setPlaying, tree, setTree, gameOver, userSide } = useSession()
  const { analyze, spar, watch, setConfirm } = model
  const mate = useMemo(() => {
    const final = positionOf(sfens.at(-1)!)
    return final.checked && !hasLegalMove(final) ? { winner: final.color === Color.BLACK ? Color.WHITE : Color.BLACK, checkmate: true } : undefined
  }, [sfens])
  const winner =
    mode === 'view'
      ? watch.winner
      : mode === 'spar' && spar.aiEnded
        ? spar.aiEnded === 'resign'
          ? userSide
          : userSide === 'sente'
            ? 'gote'
            : 'sente'
        : mode === 'spar' && (spar.resigned || spar.flagged)
          ? (spar.flagged ?? userSide) === 'sente'
            ? 'gote'
            : 'sente'
          : undefined
  const detectionResult = useMemo(
    () =>
      mate || winner || game.detectionResult
        ? { ...game.detectionPreset, ...game.detectionResult, ...mate, ...(winner ? { winner: winner === 'sente' ? Color.BLACK : Color.WHITE } : {}) }
        : undefined,
    [game.detectionPreset, game.detectionResult, mate, winner],
  )
  const title = analyze.gameTitle || t('app.thisGame')
  const ratings = mode !== 'spar' || spar.assist
  if (preview && previewSfens)
    return (
      <>
        <Muted>{t('app.showingAPreviewTheseMoves')}</Muted>
        <MovesPane
          sfens={[...sfens.slice(0, preview.base), ...previewSfens]}
          moves={[...game.moves.slice(0, preview.base), ...preview.moves]}
          ply={preview.base + preview.step}
          setCursor={(i) => i >= preview.base && setPreview({ ...preview, step: i - preview.base })}
          title={title}
          ratings={ratings}
          detectionPreset={game.detectionPreset}
        />
      </>
    )
  return (
    <>
      <MovesPane
        sfens={sfens}
        detectionResult={detectionResult}
        detectionPreset={game.detectionPreset}
        moves={game.moves}
        ply={cursor}
        setCursor={setCursor}
        title={title}
        tree={isGameMode(mode) || mode === 'view' ? tree : null}
        rating={model.rating}
        ratings={ratings}
        canRate={mode !== 'view' && (mode === 'analyze' || gameOver || spar.resigned || !!spar.aiEnded)}
        empty={mode === 'analyze' || mode === 'view' ? undefined : t('moves.noMovesYetSolve')}
        onSwitch={(path) => {
          if (mode === 'view') setPlaying(false)
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
      {isGameMode(mode) && !preview && (mode !== 'spar' || spar.over) && <GamesBox games={analyze} browse={mode !== 'analyze'} />}
    </>
  )
}
