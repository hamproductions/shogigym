import { useTranslation } from 'react-i18next'
import { Wrap } from 'styled-system/jsx'
import { moveText, positionOf } from '@/utils/shogi'
import { sideMark, squareName } from '@/utils/notation'
import { Square } from 'tsshogi'
import type { TFunction } from 'i18next'
import { PIECE_INFO } from '@/app/pieces'
import { ORIGIN_KEY, returnToGame, stored } from '@/app/modes/lesson/reading'
import { useSettings } from '@/appearance/settings'
import { TESUJI_DRILLS, inTesujiFilter, tesujiStats } from '@/app/tesujiDrills'
import type { TesujiState, TesujiTrainer } from './useTesuji'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'
import { backLink, muted, note, practice, result, taskText } from '@/app/panels/panels.styles'

function pieceHint(sfen: string, usi: string, t: TFunction) {
  const move = positionOf(sfen).createMoveByUSI(usi)
  if (!move) return ''
  const piece = PIECE_INFO[move.pieceType].ja.slice(0, 1)
  return usi[1] === '*' ? t('review.hintDrop', { piece }) : t('review.hintPiece', { piece, square: squareName(Square.newByUSI(usi.slice(0, 2))!) })
}

export function TesujiPane({ trainer, drill, replaying, onBack }: { trainer: TesujiTrainer; drill: TesujiState; replaying: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const lang = useSettings().lang
  const stats = tesujiStats()
  const pool = TESUJI_DRILLS.filter((d) => inTesujiFilter(d, drill.filter))
  const { sfen } = drill.item
  const side = sideMark(positionOf(sfen).color)
  return (
    <div className={practice}>
      {stored(ORIGIN_KEY) && (
        <button className={backLink} onClick={returnToGame}>
          ‹ {t('review.backToGame')}
        </button>
      )}
      <p className={taskText}>
        {t('tesuji.toMoveFindThe', { side })}
        {drill.filter !== 'all' || drill.hint > 0 || drill.status !== 'asking' ? (
          <strong>{drill.filter === 'all' ? drill.item.tesuji : drill.filter}</strong>
        ) : (
          t('tesuji.tesuji')
        )}
        {t('tesuji.findTheEnd')}
      </p>
      {drill.status === 'asking' && drill.wrong && (
        <p className={result({ tone: 'wrong' })}>
          {drill.hint > 0
            ? t('tesuji.isNotItLookAgain', { move: moveText(sfen, drill.wrong) })
            : t('tesuji.isNotItLookAgain2', { move: moveText(sfen, drill.wrong) })}
        </p>
      )}
      {drill.status === 'asking' && drill.hint > 0 && (
        <div className={note()}>
          <p>
            {t('tesuji.hintIdea', { tesuji: drill.item.tesuji, explain: lang === 'ja' ? (drill.item.explainJa ?? drill.item.explain) : drill.item.explain })}
          </p>
          {drill.hint > 1 && <p>{pieceHint(sfen, drill.item.answer, t)}</p>}
        </div>
      )}
      {drill.status !== 'asking' && (
        <Card tone={drill.status === 'right' ? 'good' : null}>
          <strong>
            {drill.status === 'right' ? '✓ ' : ''}
            {moveText(sfen, drill.item.answer)}: {drill.item.tesuji} {lang !== 'ja' && <span className={muted}>({drill.item.en})</span>}
          </strong>
          <p>{lang === 'ja' ? (drill.item.explainJa ?? drill.item.explain) : drill.item.explain}</p>
          {drill.item.note && <p className={note()}>{drill.item.note}</p>}
          <p className={muted}>{t('tesuji.from', { from: drill.item.from })}</p>
        </Card>
      )}
      {replaying ? (
        <Wrap gap="2" align="center" _narrow={{ order: '-1' }}>
          <Button variant="primary" onClick={onBack}>
            {t('app.goBackAndTryAgain')}
          </Button>
        </Wrap>
      ) : (
        <Wrap gap="2" align="center" _narrow={{ order: '-1' }}>
          {drill.status === 'asking' && drill.hint < 2 && <Button onClick={trainer.hint}>{drill.hint === 0 ? t('tesuji.hint') : t('review.moreHint')}</Button>}
          {drill.status === 'asking' && <Button onClick={trainer.reveal}>{t('tesuji.showAnswer')}</Button>}
        </Wrap>
      )}
      <p className={muted}>{t('tesuji.solvedFirstTryOf', { value: pool.filter((d) => stats.solved.includes(d.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
