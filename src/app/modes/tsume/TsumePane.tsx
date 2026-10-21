import { useTranslation } from 'react-i18next'
import { styled, Wrap } from 'styled-system/jsx'
import { pvText } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { PROBLEMS, attackerOf, loadTsumeStats } from '@/app/practice'
import { firstPieceHint } from './firstPiece'
import type { Tsume, TsumeState } from './useTsume'
import { Button } from '@/app/ui/Button'
import { Checkbox } from '@/components/ui'
import { Muted, NarrowColumn, Note, PvLine, Result, TaskText } from '@/app/panels/panels.styles'
import { Marks } from '@/app/ui/SideMark'

function TsumeStatus({ tsume }: { tsume: TsumeState }) {
  const { t } = useTranslation()
  if (tsume.status === 'checking') return <Muted mt="3">{t('tsume.checkingYourMove')}</Muted>
  if (tsume.status === 'solved')
    return (
      <Result tone="right" mt="3">
        {tsume.seen
          ? t('tsume.mateSolvedAfterSeeingThe')
          : tsume.hint >= 2
            ? t('tsume.mateSolvedAfterTheFirst')
            : tsume.missed
              ? t('tsume.mateSolvedOnASecond')
              : t('tsume.mateSolved')}
      </Result>
    )
  if (tsume.status === 'wrong')
    return (
      <Result tone="wrong" mt="3">
        {tsume.reason ? t('tsume.notMateBecause', { reason: tsume.reason }) : t('tsume.notMate')}
      </Result>
    )
  if (tsume.status === 'shown')
    return (
      <PvLine mt="3">
        {t('tsume.solution')}
        {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
      </PvLine>
    )
  if (tsume.good > 0)
    return (
      <Result tone="right" mt="3">
        {t('tsume.checkAndStillMateIn')}
      </Result>
    )
  return (
    <Note tone={tsume.hint >= 1 ? 'hint' : 'idle'} mt="3">
      {tsume.hint >= 1
        ? t('tsume.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) }) + (tsume.hint >= 2 ? t('tsume.theYellowArrowShowsIt') : '')
        : t('tsume.stuckHintTellsYouWhich')}
    </Note>
  )
}

export function TsumePane({ trainer, tsume, banner, onBack }: { trainer: Tsume; tsume: TsumeState; banner: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const stats = loadTsumeStats()
  const pool = PROBLEMS.filter((p) => tsume.length === 'all' || p.mate === tsume.length)
  return (
    <NarrowColumn>
      <TaskText display="none" _compact={{ display: 'block' }}>
        <Marks>{t('tsume.toPlayAndMateIn', { side: sideMark(attackerOf(tsume.problem)), mate: tsume.problem.mate })}</Marks>
        <styled.span _compact={{ display: 'none' }}>{t('tsume.everyAttackingMoveMustGive')}</styled.span>
      </TaskText>
      <TsumeStatus tsume={tsume} />
      <Wrap gap="2" align="center" mt="3" _narrow={{ order: '-1' }}>
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
        display="flex"
        alignItems="center"
        gap="2"
        mt="3"
        mb="1.5"
        color="fg.muted"
        fontSize="sm"
        cursor="pointer"
        checked={trainer.showEscape}
        onCheckedChange={trainer.toggleEscape}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label fontWeight="regular" fontSize="sm" lineHeight="inherit">
          {t('tsume.escapeSquaresShowWhereThe')}
        </Checkbox.Label>
      </Checkbox.Root>
      {tsume.status === 'solved' && (
        <PvLine mt="3">
          {t('tsume.solution')}
          {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}
        </PvLine>
      )}
      <Muted mt="3">{t('tsume.solvedOfInThisSet', { value: pool.filter((p) => stats.solved.includes(p.id)).length, poolCount: pool.length })}</Muted>
    </NarrowColumn>
  )
}
