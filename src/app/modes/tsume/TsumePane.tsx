import { useTranslation } from 'react-i18next'
import { pvText } from '../../../shogi'
import { sideMark } from '../../lib/notation'
import { PROBLEMS, attackerOf, loadTsumeStats } from '../../practice'
import { firstPieceHint } from './firstPiece'
import type { Tsume, TsumeState } from './useTsume'
import { Button } from '../../ui/Button'

function TsumeStatus({ tsume }: { tsume: TsumeState }) {
  const { t } = useTranslation()
  if (tsume.status === 'checking') return <p className="app-muted">{t('tsume.checkingYourMove')}</p>
  if (tsume.status === 'solved') return <p className="app-result right">{tsume.seen ? t('tsume.mateSolvedAfterSeeingThe') : tsume.hint >= 2 ? t('tsume.mateSolvedAfterTheFirst') : tsume.missed ? t('tsume.mateSolvedOnASecond') : t('tsume.mateSolved')}</p>
  if (tsume.status === 'wrong')
    return (
      <p className="app-result wrong">
        {tsume.reason ? t('tsume.notMateBecause', { reason: tsume.reason }) : t('tsume.notMate')}
      </p>
    )
  if (tsume.status === 'shown')
    return (
      <p className="app-pv">
        {t('tsume.solution')}
        {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
      </p>
    )
  if (tsume.good > 0) return <p className="app-result right">{t('tsume.checkAndStillMateIn')}</p>
  return <p className={tsume.hint >= 1 ? 'app-note app-hint-line' : 'app-note app-hint-line idle'}>{tsume.hint >= 1 ? t('tsume.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) }) + (tsume.hint >= 2 ? t('tsume.theYellowArrowShowsIt') : '') : t('tsume.stuckHintTellsYouWhich')}</p>
}

export function TsumePane({ trainer, tsume, banner, onBack }: { trainer: Tsume; tsume: TsumeState; banner: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const stats = loadTsumeStats()
  const pool = PROBLEMS.filter((p) => tsume.length === 'all' || p.mate === tsume.length)
  return (
    <div className="app-practice">
      <p className="app-task app-phone-only">
        {t('tsume.toPlayAndMateIn', { side: sideMark(attackerOf(tsume.problem)), mate: tsume.problem.mate })}
        <span className="app-wide">{t('tsume.everyAttackingMoveMustGive')}</span>
      </p>
      <TsumeStatus tsume={tsume} />
      <div className="app-actions">
        {tsume.status === 'wrong' && !banner && <Button variant="primary" onClick={onBack}>{t('tsume.tryAgain')}</Button>}
        {tsume.status === 'shown' && <Button onClick={trainer.retry}>{t('tsume.tryAgain')}</Button>}
        {tsume.status === 'playing' && tsume.hint === 0 && <Button onClick={trainer.hint}>{t('tsume.hint')}</Button>}
        {(tsume.status === 'playing' || tsume.status === 'wrong') && <Button onClick={trainer.reveal}>{t('tsume.showSolution')}</Button>}
      </div>
      <label className="app-check-row">
        <input type="checkbox" checked={trainer.showEscape} onChange={trainer.toggleEscape} />
        <span>{t('tsume.escapeSquaresShowWhereThe')}</span>
      </label>
      {tsume.status === 'solved' && (
        <p className="app-pv">
          {t('tsume.solution')}
          {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
        </p>
      )}
      <p className="app-muted">{t('tsume.solvedOfInThisSet', { value: pool.filter((p) => stats.solved.includes(p.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
