import { useTranslation } from 'react-i18next'
import { courseTitle, type Course } from '@/utils/model'
import { courseProgress } from '@/app/practice'
import type { LessonMode } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Flex, styled } from 'styled-system/jsx'
import { progressLine } from './lesson.styles'

const percent = ({ learned, total }: { learned: number; total: number }) => `${total ? (learned / total) * 100 : 0}%`

export function LessonCard({ course, onOpen, prefix }: { course: Course; onOpen: (c: Course, sub: LessonMode) => void; prefix?: string }) {
  const { t, i18n } = useTranslation()
  const progress = courseProgress(course)
  const title = courseTitle(course, i18n.language)
  return (
    <Flex layerStyle="card" position="relative" flexDirection="column" gap="1" p="{spacing.3} {spacing.4} {spacing.4}" overflow="hidden">
      <styled.span fontFamily="mincho" fontWeight="heavy" fontSize="md" lineHeight="snug">
        {prefix && title.startsWith(`${prefix}: `) ? title.slice(prefix.length + 2) : title}
      </styled.span>
      {progress.total > 0 && (
        <styled.span display="flex" justifyContent="space-between" gap="2" color="fg.muted" fontSize="xs">
          <styled.span color="success" css={{ '&[data-defending]': { color: 'info' } }} data-defending={course.notesFromOpponentView || undefined}>
            {t(course.notesFromOpponentView ? 'picker.theyAttackYouDefendAs' : 'picker.youPlay', {
              side: t(course.userSide === 'sente' ? 'common.sente' : 'common.gote'),
            })}
          </styled.span>
          <span>
            <span title={t('picker.yourMovesInThisLesson')}>{t('picker.rightInQuiz', { learned: progress.learned, total: progress.total })}</span>
          </span>
        </styled.span>
      )}
      <styled.span display="flex" gap="2" mt="1.5" css={{ '& .app-btn': { flex: '1' } }}>
        <Button variant="primary" onClick={() => onOpen(course, 'study')}>
          {t('picker.study')}
        </Button>
        {progress.total > 0 && <Button onClick={() => onOpen(course, 'quiz')}>{t('picker.quiz')}</Button>}
      </styled.span>
      <i className={progressLine} style={{ width: percent(progress) }} />
    </Flex>
  )
}
