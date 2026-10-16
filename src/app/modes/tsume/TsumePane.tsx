import { useTranslation } from 'react-i18next'
import { css, cx } from 'styled-system/css'
import { styled, Wrap } from 'styled-system/jsx'
import { pvText } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { PROBLEMS, attackerOf, loadTsumeStats } from '@/app/practice'
import { firstPieceHint } from './firstPiece'
import type { Tsume, TsumeState } from './useTsume'
import { Button } from '@/app/ui/Button'
import { Checkbox } from '@/components/ui'
import { muted, note, practice, pv, result, taskText } from '@/app/panels/panels.styles'

function TsumeStatus({ tsume }: { tsume: TsumeState }) {
  const { t } = useTranslation()
  if (tsume.status === 'checking') return <p className={muted}>{t('tsume.checkingYourMove')}</p>
  if (tsume.status === 'solved')
    return (
      <p className={result({ tone: 'right' })}>
        {tsume.seen
          ? t('tsume.mateSolvedAfterSeeingThe')
          : tsume.hint >= 2
            ? t('tsume.mateSolvedAfterTheFirst')
            : tsume.missed
              ? t('tsume.mateSolvedOnASecond')
              : t('tsume.mateSolved')}
      </p>
    )
  if (tsume.status === 'wrong')
    return <p className={result({ tone: 'wrong' })}>{tsume.reason ? t('tsume.notMateBecause', { reason: tsume.reason }) : t('tsume.notMate')}</p>
  if (tsume.status === 'shown')
    return (
      <p className={pv}>
        {t('tsume.solution')}
        {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
      </p>
    )
  if (tsume.good > 0) return <p className={result({ tone: 'right' })}>{t('tsume.checkAndStillMateIn')}</p>
  return (
    <p className={note({ tone: tsume.hint >= 1 ? 'hint' : 'idle' })}>
      {tsume.hint >= 1
        ? t('tsume.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) }) + (tsume.hint >= 2 ? t('tsume.theYellowArrowShowsIt') : '')
        : t('tsume.stuckHintTellsYouWhich')}
    </p>
  )
}

export function TsumePane({ trainer, tsume, banner, onBack }: { trainer: Tsume; tsume: TsumeState; banner: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const stats = loadTsumeStats()
  const pool = PROBLEMS.filter((p) => tsume.length === 'all' || p.mate === tsume.length)
  return (
    <div className={practice}>
      <p className={cx(taskText, css({ display: 'none', _compact: { display: 'block' } }))}>
        {t('tsume.toPlayAndMateIn', { side: sideMark(attackerOf(tsume.problem)), mate: tsume.problem.mate })}
        <styled.span _compact={{ display: 'none' }}>{t('tsume.everyAttackingMoveMustGive')}</styled.span>
      </p>
      <TsumeStatus tsume={tsume} />
      <Wrap gap="2" align="center" _narrow={{ order: '-1' }}>
        {tsume.status === 'wrong' && !banner && (
          <Button variant="primary" onClick={onBack}>
            {t('tsume.tryAgain')}
          </Button>
        )}
        {tsume.status === 'shown' && <Button onClick={trainer.retry}>{t('tsume.tryAgain')}</Button>}
        {tsume.status === 'playing' && tsume.hint === 0 && <Button onClick={trainer.hint}>{t('tsume.hint')}</Button>}
        {(tsume.status === 'playing' || tsume.status === 'wrong') && <Button onClick={trainer.reveal}>{t('tsume.showSolution')}</Button>}
      </Wrap>
      <Checkbox.Root
        size="sm"
        className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '1.5', color: 'fg.muted', fontSize: 'sm', cursor: 'pointer' })}
        checked={trainer.showEscape}
        onCheckedChange={trainer.toggleEscape}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label className={css({ fontWeight: 'regular', fontSize: 'sm', lineHeight: 'inherit' })}>
          {t('tsume.escapeSquaresShowWhereThe')}
        </Checkbox.Label>
      </Checkbox.Root>
      {tsume.status === 'solved' && (
        <p className={pv}>
          {t('tsume.solution')}
          {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
        </p>
      )}
      <p className={muted}>{t('tsume.solvedOfInThisSet', { value: pool.filter((p) => stats.solved.includes(p.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
