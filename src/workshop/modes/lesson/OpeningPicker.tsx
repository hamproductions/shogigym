import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SETUPS, type Course } from '../../../model'
import { scrollPanelTop } from '../../hooks/useLayout'
import { coursesOf } from '../../lib/book'
import { sideMark } from '../../lib/notation'
import { courseProgress } from '../../practice'
import { useSettings } from '../../settings'
import type { LessonMode, Level } from '../../types'

type PickerProps = { onOpen: (c: Course, sub: LessonMode) => void; level: Level; setupId: string | null; setSetupId: (id: string | null) => void }

const percent = ({ learned, total }: { learned: number; total: number }) => `${total ? (learned / total) * 100 : 0}%`

function LessonCard({ course, onOpen }: { course: Course; onOpen: PickerProps['onOpen'] }) {
  const { t } = useTranslation()
  const progress = courseProgress(course)
  const side = sideMark(course.userSide)
  return (
    <div className="ws-lesson-card">
      <span className="ws-lesson-title">{course.title}</span>
      <span className="ws-lesson-meta">
        <span className={`ws-role ${course.notesFromOpponentView ? 'defend' : 'attack'}`}>{course.notesFromOpponentView ? t('picker.theyAttackYouDefendAs', { side }) : t('picker.youPlay', { side: t(course.userSide === 'sente' ? 'common.sente' : 'common.gote') })}</span>
        <span>
          <span title={t('picker.yourMovesInThisLesson')}>{t('picker.rightInQuiz', { learned: progress.learned, total: progress.total })}</span>
        </span>
      </span>
      <span className="ws-lesson-buttons">
        <button className="primary" onClick={() => onOpen(course, 'study')}>
          {t('picker.study')}
        </button>
        <button onClick={() => onOpen(course, 'quiz')}>{t('picker.quiz')}</button>
      </span>
      <i className="ws-progress" style={{ width: percent(progress) }} />
    </div>
  )
}

function Credits() {
  const { t } = useTranslation()
  return (
    <details className="ws-source">
      <summary>{t('picker.shogilabCreditsAndLicences')}</summary>
      <p>{t('picker.engineYaneuraouWasmBuildBy')}</p>
    </details>
  )
}

export function OpeningPicker({ onOpen, level, setupId, setSetupId }: PickerProps) {
  const { t } = useTranslation()
  useEffect(() => {
    scrollPanelTop()
  }, [setupId])
  const [query, setQuery] = useState('')
  const ja = useSettings().lang === 'ja'
  const q = query.trim().toLowerCase()
  const groups = SETUPS.map((setup) => ({ setup, courses: coursesOf(setup.courseIds) })).filter((g) => g.courses.length)
  const card = (c: Course) => <LessonCard key={c.id} course={c} onOpen={onOpen} />
  const search = <input className="ws-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('picker.searchAnagumaBGinSagimiya')} aria-label={t('picker.searchLessons')} autoFocus={!!q} />
  if (q) {
    const hits = groups.flatMap((g) => g.courses.filter((c) => `${c.title} ${g.setup.ja} ${g.setup.name}`.toLowerCase().includes(q)))
    return (
      <div className="ws-picker">
        {search}
        {hits.length ? hits.map(card) : <p className="ws-muted">{t('picker.noLessonMatches', { query })}</p>}
      </div>
    )
  }
  const group = groups.find((g) => g.setup.id === setupId)
  if (group)
    return (
      <div className="ws-picker">
        <button className="ws-back" onClick={() => setSetupId(null)}>
          {t('picker.back')}
        </button>
        <h2 className="ws-picker-title">{ja ? group.setup.ja : group.setup.name}</h2>
        <p className="ws-picker-intro">{group.setup.intro}</p>
        {group.setup.shikenPlan && <p className="ws-picker-intro plan">{group.setup.shikenPlan}</p>}
        {group.courses.map(card)}
      </div>
    )
  const ordered = [...groups.filter((g) => g.setup.id === 'basics'), ...groups.filter((g) => !g.setup.technique && g.setup.id !== 'basics'), ...groups.filter((g) => g.setup.technique)]
  return (
    <div className="ws-picker">
      <h2 className="ws-picker-title">
        {t('picker.whatDoYouWantTo')}
        <span>{t('picker.youPlayTheFourthFile')}</span>
      </h2>
      {level === 'new' && <p className="ws-picker-intro">{t('picker.clickAnyPieceOnThe')}</p>}
      {search}
      {ordered.map(({ setup, courses }, i, all) => {
        const p = courses.map(courseProgress).reduce((a, b) => ({ learned: a.learned + b.learned, total: a.total + b.total }), { learned: 0, total: 0 })
        return (
          <Fragment key={setup.id}>
            {!setup.technique && all[i - 1]?.setup.id === 'basics' && <h3 className="ws-sub">{t('picker.openingsByWhatYourOpponent')}</h3>}
            {setup.technique && !all[i - 1]?.setup.technique && <h3 className="ws-sub">{t('picker.techniques')}</h3>}
            <button className="ws-setup" onClick={() => setSetupId(setup.id)}>
              <span className="ws-lib-ja">
                {ja ? setup.ja : setup.name}
                {setup.id === 'basics' && p.learned === 0 && <em className="ws-start">{t('picker.startHere')}</em>}
              </span>
              <span className="ws-lib-en">{t('picker.lessonCount', { count: courses.length })}</span>
              <span className="ws-setup-go" aria-hidden="true">
                ›
              </span>
              <i className="ws-progress" style={{ width: percent(p) }} />
            </button>
          </Fragment>
        )
      })}
      <Credits />
    </div>
  )
}
