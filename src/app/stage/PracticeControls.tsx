import { useTranslation } from 'react-i18next'
import type { Drill } from '@/app/modes/drill/useDrill'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import type { TesujiTrainer as Tesuji } from '@/app/modes/tesuji/useTesuji'
import type { Tsume, TsumeLength } from '@/app/modes/tsume/useTsume'
import { reviewCounts, type ReviewQueue } from '@/app/practice'
import { tesujiKinds } from '@/app/tesujiDrills'
import type { LessonMode } from '@/app/types'
import { Segmented } from '@/app/ui/Segmented'
import { Select } from '@/app/ui/Select'
import { BarButton, ControlIcon, ControlLabel, barIcon, barSegments, barSelect } from './mode-bar.styles'
import { Icon } from '@/app/icons'
import { TsumeClock } from '@/app/modes/tsume/TsumeClock'
import { styled } from 'styled-system/jsx'

const LENGTHS: TsumeLength[] = [1, 3, 5, 7, 'all']

export function TsumeControls({ trainer }: { trainer: Tsume }) {
  const { t } = useTranslation()
  const tsume = trainer.tsume
  if (!tsume) return null
  const done = tsume.status === 'solved' || tsume.status === 'shown'
  return (
    <>
      <Select
        className={barSelect}
        value={String(tsume.length)}
        label={t('tsume.problemLength')}
        options={LENGTHS.map((n) => ({ value: String(n), label: n === 'all' ? t('tsume.mixed') : t('tsume.mateIn', { n }) }))}
        onChange={(value) => trainer.start(value === 'all' ? 'all' : (Number(value) as TsumeLength))}
      />
      <BarButton
        size="sm"
        onClick={trainer.togglePause}
        title={t(trainer.paused ? 'tsume.resume' : 'tsume.pause')}
        aria-label={t(trainer.paused ? 'tsume.resume' : 'tsume.pause')}
        aria-pressed={trainer.paused}
      >
        <Icon name={trainer.paused ? 'play' : 'pause'} size={16} className={barIcon} />
        <ControlLabel>{t(trainer.paused ? 'tsume.resume' : 'tsume.pause')}</ControlLabel>
      </BarButton>
      <BarButton size="sm" variant={done ? 'primary' : 'secondary'} onClick={trainer.next} title={t('tsume.nextProblem')} aria-label={t('tsume.nextProblem')}>
        <ControlLabel>{t('tsume.nextProblem')}</ControlLabel>
        <ControlIcon>{t('tsume.next')}</ControlIcon>
      </BarButton>
      <styled.span
        display="none"
        flex="none"
        alignItems="center"
        gap="2"
        px="1"
        fontVariantNumeric="tabular-nums"
        fontWeight="bold"
        _compact={{ display: 'inline-flex' }}
      >
        <span aria-label={t('tsume.elapsed')}>
          <TsumeClock tsume={tsume} />
        </span>
        <styled.span display="inline-flex" gap="0.5" aria-label={t('tsume.history')}>
          {trainer.history
            .slice(0, 5)
            .reverse()
            .map((attempt) => (
              <styled.span
                key={attempt.at}
                w="1.5"
                h="3.5"
                bg={attempt.result === 'solved' ? 'success' : attempt.result === 'failed' ? 'danger' : 'border.strong'}
                aria-label={t(attempt.result === 'solved' ? 'tsume.resultSolved' : attempt.result === 'failed' ? 'tsume.resultFailed' : 'tsume.resultShown')}
              />
            ))}
        </styled.span>
      </styled.span>
    </>
  )
}

export function TesujiControls({ trainer }: { trainer: Tesuji }) {
  const { t } = useTranslation()
  const drill = trainer.drill
  if (!drill) return null
  return (
    <>
      <Select
        className={barSelect}
        value={drill.filter}
        label={t('tesuji.tesujiType')}
        options={['all', ...tesujiKinds()].map((k) => ({ value: k, label: k === 'all' ? t('tesuji.mixed') : k }))}
        onChange={(value) => trainer.start(value)}
      />
      <BarButton size="sm" variant={drill.status === 'asking' ? 'secondary' : 'primary'} onClick={trainer.next}>
        {t('tesuji.next')}
      </BarButton>
    </>
  )
}

export function LessonControls({ lesson }: { lesson: Lesson }) {
  const { t } = useTranslation()
  return (
    <>
      <Segmented<LessonMode>
        size="small"
        className={barSegments}
        label={t('lesson.lessonMode')}
        value={lesson.lessonMode}
        options={[
          { v: 'study', t: t('lesson.study') },
          { v: 'quiz', t: t('lesson.quiz') },
        ]}
        onChange={lesson.switchLessonMode}
      />
    </>
  )
}

export function ReviewControls({ drill }: { drill: Drill }) {
  const { t } = useTranslation()
  const counts = reviewCounts()
  const queues: { id: ReviewQueue; label: string; n: number }[] = [
    { id: 'due', label: t('review.due'), n: counts.due },
    { id: 'new', label: t('review.learnNew'), n: counts.new },
    { id: 'difficult', label: t('review.difficult'), n: counts.difficult },
    { id: 'mistakes', label: t('review.myGameMistakes'), n: counts.mistakes },
  ]
  return (
    <Select
      className={barSelect}
      value={drill.drill?.queue ?? ''}
      label={t('review.reviewQueue')}
      options={[
        ...(drill.drill ? [] : [{ value: '', label: t('review.reviewQueue') }]),
        ...queues.map((q) => ({ value: q.id, label: `${q.label} (${q.n > 99 ? '99+' : q.n})` })),
      ]}
      onChange={(value) => value && drill.start(value as ReviewQueue)}
    />
  )
}
