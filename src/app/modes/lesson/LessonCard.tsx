import { useTranslation } from 'react-i18next'
import { courseTitle, type Course } from '@/utils/model'
import { courseProgress } from '@/app/practice'
import type { LessonMode } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { css } from 'styled-system/css'
import { lessonButtons, lessonCard, lessonMeta, lessonTitle, progressLine } from './lesson.styles'

const percent = ({ learned, total }: { learned: number; total: number }) => `${total ? (learned / total) * 100 : 0}%`

const sideNote = css({ color: 'success', '&[data-defending]': { color: 'info' } })

export function LessonCard({ course, onOpen, prefix }: { course: Course; onOpen: (c: Course, sub: LessonMode) => void; prefix?: string }) {
  const { t, i18n } = useTranslation()
  const progress = courseProgress(course)
  const title = courseTitle(course, i18n.language)
  return (
    <div className={lessonCard}>
      <span className={lessonTitle}>{prefix && title.startsWith(`${prefix}: `) ? title.slice(prefix.length + 2) : title}</span>
      {progress.total > 0 && (
        <span className={lessonMeta}>
          <span className={sideNote} data-defending={course.notesFromOpponentView || undefined}>
            {t(course.notesFromOpponentView ? 'picker.theyAttackYouDefendAs' : 'picker.youPlay', {
              side: t(course.userSide === 'sente' ? 'common.sente' : 'common.gote'),
            })}
          </span>
          <span>
            <span title={t('picker.yourMovesInThisLesson')}>{t('picker.rightInQuiz', { learned: progress.learned, total: progress.total })}</span>
          </span>
        </span>
      )}
      <span className={lessonButtons}>
        <Button variant="primary" onClick={() => onOpen(course, 'study')}>
          {t('picker.study')}
        </Button>
        {progress.total > 0 && <Button onClick={() => onOpen(course, 'quiz')}>{t('picker.quiz')}</Button>}
      </span>
      <i className={progressLine} style={{ width: percent(progress) }} />
    </div>
  )
}
