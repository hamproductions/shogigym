import { useTranslation } from 'react-i18next'
import type { Drill } from '@/app/modes/drill/useDrill'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import type { TesujiTrainer as Tesuji } from '@/app/modes/tesuji/useTesuji'
import type { Tsume, TsumeLength } from '@/app/modes/tsume/useTsume'
import { reviewCounts, type ReviewQueue } from '@/app/practice'
import { TESUJI_KINDS } from '@/app/tesujiDrills'
import type { LessonMode } from '@/app/types'
import { Segmented } from '@/app/ui/Segmented'
import { Button } from '@/app/ui/Button'

const LENGTHS: TsumeLength[] = [1, 3, 5, 7, 'all']

export function TsumeControls({ trainer }: { trainer: Tsume }) {
  const { t } = useTranslation()
  const tsume = trainer.tsume
  if (!tsume) return null
  const done = tsume.status === 'solved' || tsume.status === 'shown'
  return (
    <>
      <select
        className="app-field app-bar-select"
        value={String(tsume.length)}
        aria-label={t('tsume.problemLength')}
        onChange={(e) => trainer.start(e.target.value === 'all' ? 'all' : (Number(e.target.value) as TsumeLength))}
      >
        {LENGTHS.map((n) => (
          <option key={n} value={String(n)}>
            {n === 'all' ? t('tsume.mixed') : t('tsume.mateIn', { n })}
          </option>
        ))}
      </select>
      <Button size="sm" variant={done ? 'primary' : 'secondary'} onClick={trainer.next}>
        {t('tsume.nextProblem')}
      </Button>
    </>
  )
}

export function TesujiControls({ trainer }: { trainer: Tesuji }) {
  const { t } = useTranslation()
  const drill = trainer.drill
  if (!drill) return null
  return (
    <>
      <select className="app-field app-bar-select" value={drill.filter} aria-label={t('tesuji.tesujiType')} onChange={(e) => trainer.start(e.target.value)}>
        {['all', ...TESUJI_KINDS].map((k) => (
          <option key={k} value={k}>
            {k === 'all' ? t('tesuji.mixed') : k}
          </option>
        ))}
      </select>
      <Button size="sm" variant={drill.status === 'asking' ? 'secondary' : 'primary'} onClick={trainer.next}>
        {t('tesuji.next')}
      </Button>
    </>
  )
}

export function LessonControls({ lesson }: { lesson: Lesson }) {
  const { t } = useTranslation()
  return (
    <>
      <Button size="sm" variant="ghost" onClick={lesson.leave}>
        {t('lesson.lessons')}
      </Button>
      <Segmented<LessonMode>
        size="small"
        label={t('lesson.lessonMode')}
        value={lesson.lessonMode}
        options={[
          { v: 'study', t: t('lesson.study') },
          { v: 'quiz', t: t('lesson.quiz') },
        ]}
        onChange={lesson.switchLessonMode}
      />
      <Button size="sm" variant="ghost" onClick={() => lesson.setMapOpen(true)}>
        {t('lesson.lessonMap')}
      </Button>
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
    <select
      className="app-field app-bar-select"
      value={drill.drill?.queue ?? ''}
      aria-label={t('review.reviewQueue')}
      onChange={(e) => e.target.value && drill.start(e.target.value as ReviewQueue)}
    >
      {!drill.drill && <option value="">{t('review.reviewQueue')}</option>}
      {queues.map((q) => (
        <option key={q.id} value={q.id}>
          {q.label} ({q.n > 99 ? '99+' : q.n})
        </option>
      ))}
    </select>
  )
}
