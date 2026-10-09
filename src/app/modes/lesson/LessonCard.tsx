import { useTranslation } from 'react-i18next'
import { courseTitle, type Course } from '@/utils/model'
import { courseProgress } from '@/app/practice'
import type { LessonMode } from '@/app/types'
import { Button } from '@/app/ui/Button'

const percent = ({ learned, total }: { learned: number; total: number }) => `${total ? (learned / total) * 100 : 0}%`

export function LessonCard({ course, onOpen, prefix }: { course: Course; onOpen: (c: Course, sub: LessonMode) => void; prefix?: string }) {
  const { t, i18n } = useTranslation()
  const progress = courseProgress(course)
  const title = courseTitle(course, i18n.language)
  return (
    <div className="app-lesson-card">
      <span className="app-lesson-title">{prefix && title.startsWith(`${prefix}: `) ? title.slice(prefix.length + 2) : title}</span>
      {progress.total > 0 && (
        <span className="app-lesson-meta">
          <span className={`app-role ${course.notesFromOpponentView ? 'defend' : 'attack'}`}>
            {t(course.notesFromOpponentView ? 'picker.theyAttackYouDefendAs' : 'picker.youPlay', {
              side: t(course.userSide === 'sente' ? 'common.sente' : 'common.gote'),
            })}
          </span>
          <span>
            <span title={t('picker.yourMovesInThisLesson')}>{t('picker.rightInQuiz', { learned: progress.learned, total: progress.total })}</span>
          </span>
        </span>
      )}
      <span className="app-lesson-buttons">
        <Button variant="primary" onClick={() => onOpen(course, 'study')}>
          {t('picker.study')}
        </Button>
        {progress.total > 0 && <Button onClick={() => onOpen(course, 'quiz')}>{t('picker.quiz')}</Button>}
      </span>
      <i className="app-progress" style={{ width: percent(progress) }} />
    </div>
  )
}
