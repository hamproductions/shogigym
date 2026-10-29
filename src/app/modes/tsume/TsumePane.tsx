import { useTranslation } from 'react-i18next'
import { Flex, styled, Wrap } from 'styled-system/jsx'
import { pvText } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { attackerOf } from '@/app/practice'
import { firstPieceHint } from './firstPiece'
import type { Tsume, TsumeState } from './useTsume'
import { TsumeClock } from './TsumeClock'
import { seconds } from './seconds'
import { Button } from '@/app/ui/Button'
import { Checkbox } from '@/components/ui'
import { Marks } from '@/app/ui/SideMark'

const Status = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: '3',
    mt: '2',
    p: '{spacing.3} {spacing.3.5}',
    borderRadius: 'md',
    bg: 'surface.2',
  },
  variants: {
    tone: {
      idle: {},
      right: { bg: 'success.soft', color: 'success' },
      wrong: { bg: 'danger.soft', color: 'danger' },
    },
  },
})

const Tile = styled('button', {
  base: {
    w: '7',
    h: '7',
    borderRadius: 'sm',
    fontSize: 'sm',
    fontWeight: 'bold',
    color: 'white',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid {colors.accent}', outlineOffset: '1px' },
  },
  variants: { result: { solved: { bg: 'success' }, failed: { bg: 'danger' }, shown: { bg: 'border.strong', color: 'fg.default' } } },
})

const MARK = { solved: '✓', failed: '✗', shown: '–' } as const

function StatusLine({ trainer, tsume }: { trainer: Tsume; tsume: TsumeState }) {
  const { t } = useTranslation()
  const clock = (
    <styled.span fontSize="2xl" fontWeight="bold" fontVariantNumeric="tabular-nums" aria-label={t('tsume.elapsed')}>
      <TsumeClock tsume={tsume} />
    </styled.span>
  )
  if (tsume.status === 'solved' || tsume.status === 'shown')
    return (
      <Status tone={tsume.status === 'solved' && !tsume.missed && !tsume.seen && tsume.hint < 2 ? 'right' : 'idle'} role="status">
        <styled.div minW="0">
          <styled.strong display="block" fontFamily="mincho" fontSize="lg">
            {tsume.status === 'shown' ? t('tsume.solution') : trainer.solvedText(tsume)}
          </styled.strong>
          <styled.span color="fg.muted" fontSize="sm">
            <Marks>{pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}</Marks>
          </styled.span>
        </styled.div>
        {clock}
      </Status>
    )
  const wrong = tsume.status === 'wrong' || (!!tsume.missed && !!tsume.reason)
  return (
    <Status tone={wrong ? 'wrong' : 'idle'} role="status">
      <styled.div minW="0">
        <styled.strong display="block" fontFamily="mincho" fontSize="lg">
          {wrong ? (
            <Marks>{`✗ ${tsume.reason}${tsume.reply ? `：${tsume.reply}` : ''}`}</Marks>
          ) : tsume.good > 0 ? (
            t('tsume.checkAndStillMateIn')
          ) : (
            <Marks>{t('tsume.toPlayAndMateIn', { side: sideMark(attackerOf(tsume.problem)), mate: tsume.problem.mate })}</Marks>
          )}
        </styled.strong>
        {trainer.paused && (
          <styled.span display="block" color="fg.muted" fontSize="sm">
            {t('tsume.pausedNote')}
          </styled.span>
        )}
        {tsume.status === 'checking' && (
          <styled.span color="fg.muted" fontSize="sm">
            {t('tsume.checkingYourMove')}
          </styled.span>
        )}
        {tsume.hint >= 1 && !wrong && (
          <styled.span color="fg.muted" fontSize="sm">
            {t('tsume.hintTheFirstMoveUses', { piece: firstPieceHint(tsume.problem) })}
          </styled.span>
        )}
      </styled.div>
      {clock}
    </Status>
  )
}

export function TsumePane({ trainer, tsume }: { trainer: Tsume; tsume: TsumeState; banner: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const recent = trainer.history.slice(0, 24).reverse()
  const label = { solved: t('tsume.resultSolved'), failed: t('tsume.resultFailed'), shown: t('tsume.resultShown') }
  const done = tsume.status === 'solved' || tsume.status === 'shown'
  return (
    <div>
      <StatusLine trainer={trainer} tsume={tsume} />
      <Wrap gap="2" align="center" mt="3">
        {tsume.status === 'wrong' && tsume.reply && (
          <Button variant="primary" onClick={trainer.tryAgain} title="R">
            {t('tsume.tryAgain')}
          </Button>
        )}
        {!done && (
          <>
            {tsume.hint < 2 && (
              <Button onClick={trainer.hint} title="I">
                {t('tsume.hint')}
              </Button>
            )}
            <Button onClick={trainer.reveal} title="S">
              {t('tsume.showSolution')}
            </Button>
          </>
        )}
        {tsume.status === 'shown' && (
          <Button onClick={trainer.retry} title="R">
            {t('tsume.tryAgain')}
          </Button>
        )}
      </Wrap>
      {recent.length > 0 && (
        <Flex gap="1" wrap="wrap" mt="4" aria-label={t('tsume.history')}>
          {recent.map((attempt) => (
            <Tile
              key={`${attempt.id}-${attempt.at}`}
              result={attempt.result}
              title={`${t('tsume.mateIn', { n: attempt.mate })} · ${label[attempt.result]} · ${seconds(attempt.ms)}`}
              aria-label={`${t('tsume.mateIn', { n: attempt.mate })} ${label[attempt.result]} ${seconds(attempt.ms)}`}
              onClick={() => trainer.open(attempt.id)}
            >
              {MARK[attempt.result]}
            </Tile>
          ))}
        </Flex>
      )}
      <Checkbox.Root
        size="sm"
        display="flex"
        alignItems="center"
        gap="2"
        mt="4"
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
    </div>
  )
}
