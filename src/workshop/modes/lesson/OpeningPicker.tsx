import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SETUPS, courseTitle, type Course } from '../../../model'
import { scrollPanelTop } from '../../hooks/useLayout'
import { coursesOf } from '../../lib/book'
import { courseProgress } from '../../practice'
import { setSettings, useSettings } from '../../settings'
import { mainStrategies, strategyById } from '../../../data/strategies'
import type { LessonMode, Level } from '../../types'
import { Button } from '../../ui/Button'

type PickerProps = { onOpen: (c: Course, sub: LessonMode) => void; level: Level; setupId: string | null; setSetupId: (id: string | null) => void }

const percent = ({ learned, total }: { learned: number; total: number }) => `${total ? (learned / total) * 100 : 0}%`

function LessonCard({ course, onOpen }: { course: Course; onOpen: PickerProps['onOpen'] }) {
  const { t, i18n } = useTranslation()
  const progress = courseProgress(course)
  return (
    <div className="ws-lesson-card">
      <span className="ws-lesson-title">{courseTitle(course, i18n.language)}</span>
      <span className="ws-lesson-meta">
        <span className={`ws-role ${course.notesFromOpponentView ? 'defend' : 'attack'}`}>{t(course.notesFromOpponentView ? 'picker.theyAttackYouDefendAs' : 'picker.youPlay', { side: t(course.userSide === 'sente' ? 'common.sente' : 'common.gote') })}</span>
        <span>
          <span title={t('picker.yourMovesInThisLesson')}>{t('picker.rightInQuiz', { learned: progress.learned, total: progress.total })}</span>
        </span>
      </span>
      <span className="ws-lesson-buttons">
        <Button variant="primary" onClick={() => onOpen(course, 'study')}>
          {t('picker.study')}
        </Button>
        <Button onClick={() => onOpen(course, 'quiz')}>{t('picker.quiz')}</Button>
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
      <p>{t('picker.charactersCredit')}</p>
    </details>
  )
}

export function OpeningPicker({ onOpen, level, setupId, setSetupId }: PickerProps) {
  const { t } = useTranslation()
  useEffect(() => {
    scrollPanelTop()
  }, [setupId])
  const [query, setQuery] = useState('')
  const { lang, mainStrategy } = useSettings()
  const ja = lang === 'ja'
  const [choosing, setChoosing] = useState(false)
  const main = strategyById(mainStrategy) ?? mainStrategies()[0]
  const q = query.trim().toLowerCase()
  const all = SETUPS.map((setup) => ({ setup, courses: coursesOf(setup.courseIds) })).filter((g) => g.courses.length)
  const groups = all.filter((g) => g.setup.technique || g.setup.main === main.id)
  const card = (c: Course) => <LessonCard key={c.id} course={c} onOpen={onOpen} />
  const search = <input className="ws-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('picker.searchAnagumaBGinSagimiya')} aria-label={t('picker.searchLessons')} autoFocus={!!q} />
  if (q) {
    const hits = all.flatMap((g) => g.courses.filter((c) => `${c.title} ${c.titleEn ?? ''} ${g.setup.ja} ${g.setup.name}`.toLowerCase().includes(q)))
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
        <p className="ws-picker-intro">{ja ? group.setup.intro.ja : group.setup.intro.en}</p>
        {group.setup.plan && <p className="ws-picker-intro plan">{ja ? group.setup.plan.ja : group.setup.plan.en}</p>}
        {group.courses.map(card)}
      </div>
    )
  const mains = mainStrategies()
  if (choosing)
    return (
      <div className="ws-picker">
        <button className="ws-back" onClick={() => setChoosing(false)}>
          {t('picker.back')}
        </button>
        <h2 className="ws-picker-title">{t('strategy.chooseMain')}</h2>
        {(['furibisha', 'ibisha'] as const).map((wing) => (
          <Fragment key={wing}>
            <h3 className="ws-sub">{t(`strategy.${wing}`)}</h3>
            <div className="ws-main-grid">
              {mains
                .filter((s) => s.side === wing)
                .map((s) => (
                  <button key={s.id} className={`ws-main-chip${s.id === main.id ? ' on' : ''}`} onClick={() => (setSettings({ mainStrategy: s.id }), setSetupId(null), setChoosing(false))}>
                    <strong>{ja ? s.ja : s.en}</strong>
                    <span>{t(`strategy.level${s.level}`)}</span>
                  </button>
                ))}
            </div>
          </Fragment>
        ))}
      </div>
    )
  const ordered = [...groups.filter((g) => g.setup.basics), ...groups.filter((g) => !g.setup.technique && !g.setup.basics), ...groups.filter((g) => g.setup.technique)]
  return (
    <div className="ws-picker">
      <h2 className="ws-picker-title">{t('picker.whatDoYouWantTo')}</h2>
      <button className="ws-main-current" onClick={() => setChoosing(true)}>
        <span>{t('strategy.yourMain')}</span>
        <strong>{ja ? main.ja : main.en}</strong>
        <em>{t('strategy.change')} ›</em>
      </button>
      {level === 'new' && <p className="ws-picker-intro">{t('picker.clickAnyPieceOnThe')}</p>}
      {search}
      {ordered.map(({ setup, courses }, i, all) => {
        const p = courses.map(courseProgress).reduce((a, b) => ({ learned: a.learned + b.learned, total: a.total + b.total }), { learned: 0, total: 0 })
        return (
          <Fragment key={setup.id}>
            {!setup.technique && !setup.basics && (i === 0 || all[i - 1]?.setup.basics) && <h3 className="ws-sub">{t('picker.openingsByWhatYourOpponent')}</h3>}
            {setup.technique && !all[i - 1]?.setup.technique && <h3 className="ws-sub">{t('picker.techniques')}</h3>}
            <button className="ws-setup" onClick={() => setSetupId(setup.id)}>
              <span className="ws-lib-ja">
                {ja ? setup.ja : setup.name}
                {setup.basics && p.learned === 0 && <em className="ws-start">{t('picker.startHere')}</em>}
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
