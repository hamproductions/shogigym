import '@/app/modes/lesson/lesson.css'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SETUPS, courseTitle, type Course } from '@/utils/model'
import { scrollPanelTop } from '@/app/hooks/useLayout'
import { coursesOf } from '@/utils/book'
import { courseProgress } from '@/app/practice'
import { setSettings, useSettings } from '@/appearance/settings'
import { mainStrategies, strategyById } from '@/data/strategies'
import type { LessonMode, Level } from '@/app/types'
import { Button } from '@/app/ui/Button'

interface PickerProps {
  onOpen: (c: Course, sub: LessonMode) => void
  level: Level
  setupId: string | null
  setSetupId: (id: string | null) => void
}

const percent = ({ learned, total }: { learned: number; total: number }) => `${total ? (learned / total) * 100 : 0}%`

function LessonCard({ course, onOpen }: { course: Course; onOpen: PickerProps['onOpen'] }) {
  const { t, i18n } = useTranslation()
  const progress = courseProgress(course)
  return (
    <div className="app-lesson-card">
      <span className="app-lesson-title">{courseTitle(course, i18n.language)}</span>
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
      <span className="app-lesson-buttons">
        <Button variant="primary" onClick={() => onOpen(course, 'study')}>
          {t('picker.study')}
        </Button>
        <Button onClick={() => onOpen(course, 'quiz')}>{t('picker.quiz')}</Button>
      </span>
      <i className="app-progress" style={{ width: percent(progress) }} />
    </div>
  )
}

function Credits() {
  const { t } = useTranslation()
  return (
    <details className="app-source">
      <summary>{t('picker.shogilabCreditsAndLicences')}</summary>
      <p>{t('picker.engineYaneuraouWasmBuildBy')}</p>
      <p>{t('picker.charactersCredit')}</p>
    </details>
  )
}

interface Group {
  setup: (typeof SETUPS)[number]
  courses: Course[]
}
type Strategy = ReturnType<typeof mainStrategies>[number]

function ScrollTopOnMount() {
  useEffect(() => {
    scrollPanelTop()
  }, [])
  return null
}

function SetupView({ group, ja, onBack, onOpen }: { group: Group; ja: boolean; onBack: () => void; onOpen: PickerProps['onOpen'] }) {
  const { t } = useTranslation()
  return (
    <div className="app-picker">
      <button className="app-back" onClick={onBack}>
        {t('picker.back')}
      </button>
      <h2 className="app-picker-title">{ja ? group.setup.ja : group.setup.name}</h2>
      <p className="app-picker-intro">{ja ? group.setup.intro.ja : group.setup.intro.en}</p>
      {group.setup.plan && <p className="app-picker-intro plan">{ja ? group.setup.plan.ja : group.setup.plan.en}</p>}
      {group.courses.map((c) => (
        <LessonCard key={c.id} course={c} onOpen={onOpen} />
      ))}
    </div>
  )
}

function MainChooser({
  mains,
  main,
  ja,
  onBack,
  onPick,
}: {
  mains: Strategy[]
  main: Strategy
  ja: boolean
  onBack: () => void
  onPick: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="app-picker">
      <button className="app-back" onClick={onBack}>
        {t('picker.back')}
      </button>
      <h2 className="app-picker-title">{t('strategy.chooseMain')}</h2>
      {(['furibisha', 'ibisha'] as const).map((wing) => (
        <Fragment key={wing}>
          <h3 className="app-sub">{t(`strategy.${wing}`)}</h3>
          <div className="app-main-grid">
            {mains
              .filter((s) => s.side === wing)
              .map((s) => (
                <button key={s.id} className={`app-main-chip${s.id === main.id ? ' on' : ''}`} onClick={() => onPick(s.id)}>
                  <strong>{ja ? s.ja : s.en}</strong>
                  <span>{t(`strategy.level${s.level}`)}</span>
                </button>
              ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function SetupRow({ group, ja, heading, onOpen }: { group: Group; ja: boolean; heading: string | null; onOpen: () => void }) {
  const { t } = useTranslation()
  const { setup, courses } = group
  const p = courses.map(courseProgress).reduce((a, b) => ({ learned: a.learned + b.learned, total: a.total + b.total }), { learned: 0, total: 0 })
  return (
    <>
      {heading && <h3 className="app-sub">{heading}</h3>}
      <button className="app-setup" onClick={onOpen}>
        <span className="app-lib-ja">
          {ja ? setup.ja : setup.name}
          {setup.basics && p.learned === 0 && <em className="app-start">{t('picker.startHere')}</em>}
        </span>
        <span className="app-lib-en">{t('picker.lessonCount', { count: courses.length })}</span>
        <span className="app-setup-go" aria-hidden="true">
          ›
        </span>
        <i className="app-progress" style={{ width: percent(p) }} />
      </button>
    </>
  )
}

function PickerBody({ onOpen, level, setupId, setSetupId }: PickerProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const { lang, mainStrategy } = useSettings()
  const ja = lang === 'ja'
  const [choosing, setChoosing] = useState(false)
  const main = strategyById(mainStrategy) ?? mainStrategies()[0]
  const q = query.trim().toLowerCase()
  const all = SETUPS.map((setup) => ({ setup, courses: coursesOf(setup.courseIds) })).filter((g) => g.courses.length)
  const groups = all.filter((g) => g.setup.technique || g.setup.main === main.id)
  const card = (c: Course) => <LessonCard key={c.id} course={c} onOpen={onOpen} />
  const search = (
    <input
      className="app-search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={t('picker.searchAnagumaBGinSagimiya')}
      aria-label={t('picker.searchLessons')}
    />
  )
  const hits = q ? all.flatMap((g) => g.courses.filter((c) => `${c.title} ${c.titleEn ?? ''} ${g.setup.ja} ${g.setup.name}`.toLowerCase().includes(q))) : []
  const group = groups.find((g) => g.setup.id === setupId)
  if (group) return <SetupView group={group} ja={ja} onBack={() => setSetupId(null)} onOpen={onOpen} />
  if (choosing) {
    const pick = (id: string) => {
      setSettings({ mainStrategy: id })
      setSetupId(null)
      setChoosing(false)
    }
    return <MainChooser mains={mainStrategies()} main={main} ja={ja} onBack={() => setChoosing(false)} onPick={pick} />
  }
  const ordered = [
    ...groups.filter((g) => g.setup.basics),
    ...groups.filter((g) => !g.setup.technique && !g.setup.basics),
    ...groups.filter((g) => g.setup.technique),
  ]
  const headingFor = ({ setup }: Group, i: number) => {
    if (!setup.technique && !setup.basics && (i === 0 || ordered[i - 1]?.setup.basics)) return t('picker.openingsByWhatYourOpponent')
    if (setup.technique && !ordered[i - 1]?.setup.technique) return t('picker.techniques')
    return null
  }
  return (
    <div className="app-picker">
      <button className="app-main-current" onClick={() => setChoosing(true)}>
        <span>{t('strategy.yourMain')}</span>
        <strong>{ja ? main.ja : main.en}</strong>
        <em>{t('strategy.change')} ›</em>
      </button>
      {level === 'new' && <p className="app-picker-intro">{t('picker.clickAnyPieceOnThe')}</p>}
      {search}
      {q && (hits.length ? hits.map(card) : <p className="app-muted">{t('picker.noLessonMatches', { query })}</p>)}
      {!q && ordered.map((g, i) => <SetupRow key={g.setup.id} group={g} ja={ja} heading={headingFor(g, i)} onOpen={() => setSetupId(g.setup.id)} />)}
      <Credits />
    </div>
  )
}

export function OpeningPicker(props: PickerProps) {
  return (
    <>
      <ScrollTopOnMount key={props.setupId ?? ''} />
      <PickerBody {...props} />
    </>
  )
}
