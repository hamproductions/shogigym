import { useTranslation } from 'react-i18next'
import type { Drill } from '@/app/modes/drill/useDrill'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import type { TesujiTrainer as Tesuji } from '@/app/modes/tesuji/useTesuji'
import type { Tsume, TsumeLength } from '@/app/modes/tsume/useTsume'
import { reviewCounts, type ReviewQueue } from '@/app/practice'
import { TESUJI_KINDS } from '@/app/tesujiDrills'
import type { LessonMode } from '@/app/types'
import { Segmented } from '@/app/ui/Segmented'
import { Select } from '@/app/ui/Select'
import { BarButton, barSegments, barSelect } from './mode-bar.styles'

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
      <BarButton size="sm" variant={done ? 'primary' : 'secondary'} onClick={trainer.next}>
        {t('tsume.nextProblem')}
      </BarButton>
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
        options={['all', ...TESUJI_KINDS].map((k) => ({ value: k, label: k === 'all' ? t('tesuji.mixed') : k }))}
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
