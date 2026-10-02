import { useTranslation } from 'react-i18next'
import { pvText } from '../../../shogi'
import { sideMark } from '../../lib/notation'
import { PROBLEMS, attackerOf, loadTsumeStats } from '../../practice'
import { firstPieceHint } from './firstPiece'
import type { Tsume, TsumeLength, TsumeState } from './useTsume'

const LENGTHS: TsumeLength[] = [1, 3, 5, 7, 'all']

function TsumeStatus({ tsume }: { tsume: TsumeState }) {
  const { t } = useTranslation()
  if (tsume.status === 'checking') return <p className="ws-muted">{t('tsume.checkingYourMove')}</p>
  if (tsume.status === 'solved') return <p className="ws-result right">{tsume.seen ? t('tsume.mateSolvedAfterSeeingThe') : tsume.hint >= 2 ? t('tsume.mateSolvedAfterTheFirst') : tsume.missed ? t('tsume.mateSolvedOnASecond') : t('tsume.mateSolved')}</p>
  if (tsume.status === 'wrong')
    return (
      <p className="ws-result wrong">
        {t('tsume.notMate')} {tsume.reason}
      </p>
    )
  if (tsume.status === 'shown')
    return (
      <p className="ws-pv">
        {t('tsume.solution')}
        {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
      </p>
    )
  if (tsume.good > 0) return <p className="ws-result right">{t('tsume.checkAndStillMateIn')}</p>
  return <p className={tsume.hint >= 1 ? 'ws-note ws-hint-line' : 'ws-note ws-hint-line idle'}>{tsume.hint >= 1 ? t('tsume.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) }) + (tsume.hint >= 2 ? t('tsume.theYellowArrowShowsIt') : '') : t('tsume.stuckHintTellsYouWhich')}</p>
}

export function TsumePane({ trainer, tsume }: { trainer: Tsume; tsume: TsumeState }) {
  const { t } = useTranslation()
  const stats = loadTsumeStats()
  const pool = PROBLEMS.filter((p) => tsume.length === 'all' || p.mate === tsume.length)
  return (
    <div className="ws-practice">
      <div className="ws-seg small" role="group" aria-label={t('tsume.problemLength')}>
        {LENGTHS.map((n) => (
          <button key={n} className={tsume.length === n ? 'on' : ''} onClick={() => trainer.start(n)}>
            {n === 'all' ? t('tsume.mixed') : t('tsume.mateIn', { n })}
          </button>
        ))}
      </div>
      <p className="ws-task">
        {t('tsume.toPlayAndMateIn', { side: sideMark(attackerOf(tsume.problem)), mate: tsume.problem.mate })}
        <span className="ws-wide">{t('tsume.everyAttackingMoveMustGive')}</span>
      </p>
      <div className="ws-tsume-status">
        <TsumeStatus tsume={tsume} />
      </div>
      <div className="ws-actions">
        <button className="primary" onClick={trainer.next}>
          {t('tsume.nextProblem')}
        </button>
        {(tsume.status === 'playing' || tsume.status === 'wrong') && <button onClick={trainer.reveal}>{t('tsume.showSolution')}</button>}
        {(tsume.status === 'wrong' || tsume.status === 'shown') && <button onClick={trainer.retry}>{t('tsume.tryAgain')}</button>}
        {tsume.status === 'playing' && (
          <button onClick={trainer.hint} disabled={tsume.hint >= 2}>
            {tsume.hint === 0 ? t('tsume.hint') : t('tsume.showMove')}
          </button>
        )}
      </div>
      <label className="ws-check-row">
        <input type="checkbox" checked={trainer.showEscape} onChange={trainer.toggleEscape} />
        <span>{t('tsume.escapeSquaresShowWhereThe')}</span>
      </label>
      {tsume.status === 'solved' && (
        <p className="ws-pv">
          {t('tsume.solution')}
          {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
        </p>
      )}
      <p className="ws-muted">{t('tsume.solvedOfInThisSet', { value: pool.filter((p) => stats.solved.includes(p.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
