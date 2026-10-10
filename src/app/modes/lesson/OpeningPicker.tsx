import '@/app/modes/lesson/lesson.css'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { SETUPS, type Course, type Setup } from '@/utils/model'
import { scrollPanelTop } from '@/app/hooks/useLayout'
import { coursesOf } from '@/utils/book'
import { courseProgress } from '@/app/practice'
import { setSettings, useSettings } from '@/appearance/settings'
import { mainStrategies, strategyById } from '@/data/strategies'
import type { LessonMode, Level } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { LessonCard } from './LessonCard'
import { CATEGORIES, STRATEGY_GROUP, categoryOf, groupOf, isOpeningBasics, josekiGroupOf, type Category } from './library'
import { ORIGIN_KEY, RANDOM_KEY, returnToGame, store, stored } from './reading'

const CATEGORY_KEY = 'joseki-practice:library-category:v1'
const GROUPS: Record<'basics' | 'skills', string[]> = {
  basics: ['将棋のルール', '初心者向け入門講座'],
  skills: ['手筋', '囲い崩し', '詰将棋、必至、寄せ', '囲い、駒組み', '将棋の格言', '勉強法', '棋書'],
}
const GROUP_EN: Record<string, string> = {
  将棋のルール: 'Rules',
  初心者向け入門講座: 'Beginner course',
  手筋: 'Tactics',
  囲い崩し: 'Breaking castles',
  '詰将棋、必至、寄せ': 'Mate, brinkmate and finishing',
  '囲い、駒組み': 'Castles and development',
  将棋の格言: 'Proverbs',
  勉強法: 'How to study',
  棋書: 'Books',
  相振り飛車: 'Double Ranging Rook',
  駒落ち定跡: 'Handicap joseki',
  奇襲戦法: 'Surprise openings',
  '戦法、定跡': 'Opening basics',
}

type PickerProps = { onOpen: (c: Course, sub: LessonMode) => void; level: Level; setupId: string | null; setSetupId: (id: string | null) => void }
type Entry = { setup: Setup; courses: Course[] }

const percent = ({ learned, total }: { learned: number; total: number }) => `${total ? (learned / total) * 100 : 0}%`
const progressOf = (courses: Course[]) =>
  courses.map(courseProgress).reduce((a, b) => ({ learned: a.learned + b.learned, total: a.total + b.total }), { learned: 0, total: 0 })

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

export function OpeningPicker({ onOpen, level, setupId, setSetupId }: PickerProps) {
  const { t } = useTranslation()
  const { main: routeMain } = useParams()
  const { lang, mainStrategy } = useSettings()
  const ja = lang === 'ja'
  const [query, setQuery] = useState('')
  const [choosing, setChoosing] = useState(false)
  const [category, setCategory] = useState<Category | null>(() => (routeMain ? 'joseki' : (stored(CATEGORY_KEY) as Category | null)))
  useEffect(() => {
    scrollPanelTop()
  }, [setupId, category, choosing])
  const openCategory = (id: Category | null) => (setCategory(id), store(CATEGORY_KEY, id))
  const main = strategyById(mainStrategy) ?? mainStrategies()[0]
  const q = query.trim().toLowerCase()
  const all: Entry[] = SETUPS.map((setup) => ({ setup, courses: coursesOf(setup.courseIds) })).filter((g) => g.courses.length || g.setup.path)
  const name = (setup: Setup) => (ja ? setup.ja : setup.name)
  const groupName = (group: string) => (ja ? group : (GROUP_EN[group] ?? group))
  const fromGame = !!stored(ORIGIN_KEY)

  const setupCard = ({ setup, courses }: Entry) => {
    const p = progressOf(courses)
    return (
      <button key={setup.id} className="app-setup" onClick={() => setSetupId(setup.id)}>
        <span className="app-lib-ja">
          {name(setup)}
          {setup.basics && p.learned === 0 && <em className="app-start">{t('picker.startHere')}</em>}
        </span>
        <span className="app-lib-en">{ja ? `${courses.length} 章` : `${courses.length} ${courses.length === 1 ? 'chapter' : 'chapters'}`}</span>
        <span className="app-setup-go" aria-hidden="true">
          ›
        </span>
        <i className="app-progress" style={{ width: percent(p) }} />
      </button>
    )
  }
  const backToGame = fromGame && (
    <button className="app-back" onClick={returnToGame}>
      ‹ {t('review.backToGame')}
    </button>
  )

  const open = all.find((g) => g.setup.id === setupId)
  if (open) {
    const quizzable = open.courses.filter((c) => courseProgress(c).total > 0)
    const random = () => {
      store(RANDOM_KEY, open.setup.id)
      onOpen(quizzable[Math.floor(Math.random() * quizzable.length)], 'quiz')
    }
    return (
      <div className="app-picker">
        {backToGame}
        <button className="app-back" onClick={() => (setSetupId(null), openCategory(categoryOf(open.setup)))}>
          ‹ {CATEGORIES.find((c) => c.id === categoryOf(open.setup))?.name[ja ? 'ja' : 'en']}
        </button>
        <h2 className="app-picker-title">{name(open.setup)}</h2>
        <p className="app-picker-intro app-lesson-overview">{ja ? open.setup.intro.ja : open.setup.intro.en}</p>
        {open.setup.plan && <p className="app-picker-intro plan">{ja ? open.setup.plan.ja : open.setup.plan.en}</p>}
        {open.setup.path ? (
          <>
            {open.courses.length > 0 && (
              <Button variant="primary" className="app-guide-start" onClick={() => (store(RANDOM_KEY, null), onOpen(open.courses[0], 'study'))}>
                {ja ? '始める' : 'Start'}
              </Button>
            )}
            {open.courses.length === 0 && open.setup.check && (
              <details className="app-lesson-check">
                <summary>{ja ? open.setup.check.question.ja : open.setup.check.question.en}</summary>
                <p>{ja ? open.setup.check.answer.ja : open.setup.check.answer.en}</p>
              </details>
            )}
            {open.courses.length > 1 && (
              <details className="app-lesson-toc">
                <summary>{ja ? `目次（${open.courses.length}）` : `Contents (${open.courses.length})`}</summary>
                <ol>
                  {open.courses.map((course) => {
                    const title = ja ? course.title : (course.titleEn ?? course.title)
                    const prefix = `${name(open.setup)}: `
                    return (
                      <li key={course.id}>
                        <button onClick={() => (store(RANDOM_KEY, null), onOpen(course, 'study'))}>
                          {title.startsWith(prefix) ? title.slice(prefix.length) : title}
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </details>
            )}
          </>
        ) : (
          <>
            {open.courses.length > 0 && (
              <div className="app-actions">
                <Button variant="primary" onClick={() => (store(RANDOM_KEY, null), onOpen(open.courses[0], 'study'))}>
                  {ja ? '最初から学ぶ' : 'Start from the beginning'}
                </Button>
                {quizzable.length > 1 && <Button onClick={random}>{t('lesson.randomQuiz')}</Button>}
              </div>
            )}
            {open.courses.map((course) => (
              <LessonCard key={course.id} course={course} prefix={name(open.setup)} onOpen={(c, mode) => (store(RANDOM_KEY, null), onOpen(c, mode))} />
            ))}
          </>
        )}
        {open.setup.sources.length > 0 && (
          <p className="app-muted">
            {ja ? '出典：' : 'Source: '}
            {open.setup.sources.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            ))}
          </p>
        )}
      </div>
    )
  }

  if (choosing)
    return (
      <div className="app-picker">
        <button className="app-back" onClick={() => setChoosing(false)}>
          {t('picker.back')}
        </button>
        <h2 className="app-picker-title">{t('strategy.chooseMain')}</h2>
        {(['furibisha', 'ibisha'] as const).map((wing) => (
          <Fragment key={wing}>
            <h3 className="app-sub">{t(`strategy.${wing}`)}</h3>
            <div className="app-main-grid">
              {mainStrategies()
                .filter((s) => s.side === wing)
                .map((s) => (
                  <button
                    key={s.id}
                    className={`app-main-chip${s.id === main.id ? ' on' : ''}`}
                    onClick={() => (setSettings({ mainStrategy: s.id }), setChoosing(false))}
                  >
                    <strong>{ja ? s.ja : s.en}</strong>
                    <span>{t(`strategy.level${s.level}`)}</span>
                  </button>
                ))}
            </div>
          </Fragment>
        ))}
      </div>
    )

  const search = (
    <input
      className="app-search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={ja ? 'ルール、手筋、戦法などを検索' : 'Search rules, tactics, openings…'}
      aria-label={t('picker.searchLessons')}
    />
  )
  const results = q && (
    <>
      {all
        .filter(({ setup, courses }) => `${setup.ja} ${setup.name} ${courses.map((c) => `${c.title} ${c.titleEn ?? ''}`).join(' ')}`.toLowerCase().includes(q))
        .slice(0, 30)
        .map(setupCard)}
    </>
  )

  if (category === 'joseki') {
    const group = STRATEGY_GROUP[main.id]
    const mapped = new Set(mainStrategies().map((s) => STRATEGY_GROUP[s.id]))
    const lessons = all.filter((g) => josekiGroupOf(g.setup) === group)
    const mine = all.filter((g) => !g.setup.technique && !g.setup.path && g.setup.main === main.id)
    const others = all.filter((g) => {
      const at = josekiGroupOf(g.setup)
      return at && !mapped.has(at)
    })
    const otherGroups = [...new Set(others.map((g) => josekiGroupOf(g.setup)!))].sort((a, b) => Number(isOpeningBasics(b)) - Number(isOpeningBasics(a)))
    return (
      <div className="app-picker">
        {backToGame}
        <button className="app-back" onClick={() => openCategory(null)}>
          {ja ? '‹ 将棋を学ぶ' : '‹ Learn shogi'}
        </button>
        <h2 className="app-picker-title">{ja ? '定跡' : 'Joseki'}</h2>
        <button className="app-main-current" onClick={() => setChoosing(true)}>
          <span>{t('strategy.yourMain')}</span>
          <strong>{ja ? main.ja : main.en}</strong>
          <em>{t('strategy.change')} ›</em>
        </button>
        {level === 'new' && <p className="app-picker-intro">{t('picker.clickAnyPieceOnThe')}</p>}
        {search}
        {results}
        {!q && (
          <>
            {mine.filter((g) => g.setup.basics).map(setupCard)}
            {lessons.length > 0 && <h3 className="app-sub">{ja ? `${main.ja}の考え方と手筋` : `${main.en}: ideas and tactics`}</h3>}
            {lessons.map(setupCard)}
            {mine.some((g) => !g.setup.basics) && <h3 className="app-sub">{t('picker.openingsByWhatYourOpponent')}</h3>}
            {mine.filter((g) => !g.setup.basics).map(setupCard)}
            {otherGroups.map((at) => (
              <Fragment key={at}>
                <h3 className="app-sub">{groupName(at)}</h3>
                {others.filter((g) => josekiGroupOf(g.setup) === at).map(setupCard)}
              </Fragment>
            ))}
          </>
        )}
        <Credits />
      </div>
    )
  }

  if (category) {
    const info = CATEGORIES.find((c) => c.id === category)!
    const inCategory = all.filter((g) => categoryOf(g.setup) === category)
    return (
      <div className="app-picker">
        {backToGame}
        <button className="app-back" onClick={() => openCategory(null)}>
          {ja ? '‹ 将棋を学ぶ' : '‹ Learn shogi'}
        </button>
        <h2 className="app-picker-title">{ja ? info.name.ja : info.name.en}</h2>
        {search}
        {results}
        {!q &&
          GROUPS[category].map((group) => {
            const entries = inCategory.filter((g) => groupOf(g.setup) === group)
            return (
              entries.length > 0 && (
                <Fragment key={group}>
                  <h3 className="app-sub">{groupName(group)}</h3>
                  {entries.map(setupCard)}
                </Fragment>
              )
            )
          })}
      </div>
    )
  }

  return (
    <div className="app-picker">
      {backToGame}
      <h2 className="app-picker-title">{ja ? '将棋を学ぶ' : 'Learn shogi'}</h2>
      {search}
      {results}
      {!q &&
        CATEGORIES.map((item) => {
          const p = progressOf(all.filter((g) => categoryOf(g.setup) === item.id).flatMap((g) => g.courses))
          return (
            <button key={item.id} className="app-setup" onClick={() => openCategory(item.id)}>
              <span className="app-lib-ja">{ja ? item.name.ja : item.name.en}</span>
              <span className="app-lib-en">{ja ? item.about.ja : item.about.en}</span>
              <span className="app-setup-go" aria-hidden="true">
                ›
              </span>
              <i className="app-progress" style={{ width: percent(p) }} />
            </button>
          )
        })}
      <Credits />
    </div>
  )
}
