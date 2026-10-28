import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteParams } from '@/app/hooks/useRouteParams'
import { SETUPS, type Course, type Setup } from '@/utils/model'
import { scrollPanelTop } from '@/app/hooks/useLayout'
import { coursesOf } from '@/utils/book'
import { courseProgress } from '@/app/practice'
import { useSettings } from '@/appearance/settings'
import {
  PATH_UNITS,
  STAGES,
  STRATEGY_PAGES,
  TUTORIALS,
  finishedChapters,
  nextUnitAfter,
  pageForMain,
  stageUnits,
  strategyPage,
  type Stage,
  type StrategyPage,
} from '@/data/curriculum'
import type { LessonMode, Level } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Marks } from '@/app/ui/SideMark'
import { Input } from '@/components/ui'
import { styled, Wrap } from 'styled-system/jsx'
import { BackLink, Muted, SubHeading } from '@/app/panels/panels.styles'
import { CrumbLink, LibEn, LibJa, PickerIntro, PickerTitle, ProgressLine, SetupButton, SetupGo } from './lesson.styles'
import { LessonCard } from './LessonCard'
import { LessonReferences } from './LessonReferences'
import { SquareText } from './SquareText'
import { describedPosition, useDescribedBoard } from './describedPosition'
import { ORIGIN_KEY, RANDOM_KEY, returnToGame, store, stored } from './reading'

const VIEW_KEY = 'joseki-practice:library-view:v2'
const PAGE_FROM_KEY = 'joseki-practice:library-page-from:v1'
const SETUP_FROM_KEY = 'joseki-practice:library-setup-from:v1'

type PickerProps = { onOpen: (c: Course, sub: LessonMode) => void; level: Level; setupId: string | null; setSetupId: (id: string | null) => void }
type Entry = { setup: Setup; courses: Course[] }

const lessonId = (unit: string) => `lesson-${unit}`
const unitOf = (setup: Setup) => (setup.id.startsWith('lesson-') ? setup.id.slice('lesson-'.length) : null)

const lower = (text: string) => text.toLowerCase()

const Tag = styled('em', {
  base: {
    display: 'inline-block',
    ml: '2',
    whiteSpace: 'nowrap',
    px: '2',
    borderRadius: 'full',
    bg: 'success.fill',
    color: 'gofun',
    fontFamily: 'sans',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '2xs',
    verticalAlign: '2px',
  },
})

const StageNumber = styled('span', {
  base: { color: 'accent', fontFamily: 'mincho', fontWeight: 'heavy', mr: '2' },
})

const NextCard = styled('button', {
  base: {
    layerStyle: 'card',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '1',
    w: '100%',
    mt: '3',
    p: '{spacing.3} {spacing.4}',
    border: '1px solid {colors.accent}',
    textAlign: 'left',
    _hover: { bg: 'card.hover' },
  },
})

/** Higher is a better match: exact name, name prefix, name contains, then chapter titles only. */
function matchScore({ setup, courses }: Entry, q: string) {
  const names = [lower(setup.ja), lower(setup.name)]
  if (names.some((n) => n === q)) return 100
  if (names.some((n) => n.startsWith(q))) return 80
  if (names.some((n) => n.includes(q))) return 60
  return courses.some((c) => lower(`${c.title} ${c.titleEn ?? ''}`).includes(q)) ? 30 : 0
}

function Credits() {
  const { t } = useTranslation()
  return (
    <styled.details data-spaced mt="4" color="fg.muted" fontSize="xs">
      <styled.summary cursor="pointer">{t('picker.shogilabCreditsAndLicences')}</styled.summary>
      <styled.p m="{spacing.1.5} 0 0">{t('picker.engineYaneuraouWasmBuildBy')}</styled.p>
      <styled.p m="{spacing.1.5} 0 0">{t('picker.charactersCredit')}</styled.p>
    </styled.details>
  )
}

export function OpeningPicker({ onOpen, level, setupId, setSetupId }: PickerProps) {
  const { t } = useTranslation()
  const { main: routeMain } = useRouteParams()
  const { lang } = useSettings()
  const ja = lang === 'ja'
  const [query, setQuery] = useState('')
  const [view, setView] = useState<string | null>(() => {
    const page = routeMain && pageForMain(routeMain)
    return page ? `strategy:${page.id}` : stored(VIEW_KEY)
  })
  useEffect(() => {
    scrollPanelTop()
  }, [setupId, view])
  const openView = (next: string | null) => (setView(next), store(VIEW_KEY, next), setQuery(''))
  const openPage = (id: string) => (store(PAGE_FROM_KEY, view), openView(`strategy:${id}`))
  const openSetup = (id: string) => (store(SETUP_FROM_KEY, view), setSetupId(id))
  const viewLabel = (at: string | null) => {
    const stage = at?.startsWith('stage:') ? STAGES.find((s) => s.id === at.slice('stage:'.length)) : undefined
    const page = at?.startsWith('strategy:') ? strategyPage(at.slice('strategy:'.length)) : undefined
    return stage ? text(stage.name) : page ? text(page.name) : ja ? '将棋を学ぶ' : 'Learn shogi'
  }
  const q = query.trim().toLowerCase()
  const all: Entry[] = SETUPS.map((setup) => ({ setup, courses: coursesOf(setup.courseIds) })).filter((g) => g.courses.length || g.setup.path)
  const byId = new Map(all.map((entry) => [entry.setup.id, entry]))
  const unitEntry = (unit: string) => byId.get(lessonId(unit))
  const text = (value: { ja: string; en: string }) => (ja ? value.ja : value.en)
  const name = (setup: Setup) => (ja ? setup.ja : setup.name)
  const fromGame = !!stored(ORIGIN_KEY)
  const finished = finishedChapters()
  const progressOf = (courses: Course[]) => {
    const quiz = courses.map(courseProgress).reduce((a, b) => ({ learned: a.learned + b.learned, total: a.total + b.total }), { learned: 0, total: 0 })
    const read = courses.filter((c) => finished.has(c.id)).length
    return courses.length ? Math.max(read / courses.length, quiz.total ? quiz.learned / quiz.total : 0) : 0
  }
  const percent = (value: number) => `${value * 100}%`
  const chapters = (n: number) => (ja ? `${n} 章` : `${n} ${n === 1 ? 'chapter' : 'chapters'}`)
  const pageOfSetup = (setup: Setup) => {
    const unit = unitOf(setup)
    return unit ? STRATEGY_PAGES.find((page) => page.units.includes(unit)) : setup.main ? pageForMain(setup.main) : undefined
  }
  const stageOfSetup = (setup: Setup) => {
    const unit = unitOf(setup)
    return unit ? STAGES.find((stage) => stage.units.includes(unit)) : setup.technique ? STAGES.find((stage) => stage.id === 'tesuji') : undefined
  }
  const homeOf = (setup: Setup) => {
    const stage = stageOfSetup(setup)
    if (stage) return { view: `stage:${stage.id}`, label: text(stage.name) }
    const page = pageOfSetup(setup)
    return page ? { view: `strategy:${page.id}`, label: text(page.name) } : { view: null, label: ja ? '将棋を学ぶ' : 'Learn shogi' }
  }

  const setupCard = ({ setup, courses }: Entry, index?: number) => {
    const p = progressOf(courses)
    const defending = courses.length > 0 && courses.every((c) => c.notesFromOpponentView)
    return (
      <SetupButton key={setup.id} onClick={() => openSetup(setup.id)}>
        <LibJa>
          {index !== undefined && <StageNumber>{index + 1}</StageNumber>}
          <Marks>{name(setup)}</Marks>
          {defending && <Tag>{ja ? '受ける側' : 'Defending side'}</Tag>}
        </LibJa>
        <LibEn>{chapters(courses.length)}</LibEn>
        <SetupGo aria-hidden="true">›</SetupGo>
        <ProgressLine style={{ width: percent(p) }} />
      </SetupButton>
    )
  }
  const resultCard = (entry: Entry) => {
    const { setup, courses } = entry
    const byChapter = !lower(`${setup.ja} ${setup.name}`).includes(q) ? courses.find((c) => lower(`${c.title} ${c.titleEn ?? ''}`).includes(q)) : undefined
    const chapter = byChapter ? (ja ? byChapter.title : (byChapter.titleEn ?? byChapter.title)) : null
    return (
      <SetupButton key={setup.id} found onClick={() => openSetup(setup.id)}>
        <LibJa>
          <Marks>{name(setup)}</Marks>
        </LibJa>
        <LibEn>
          <Marks>{homeOf(setup).label}</Marks>
        </LibEn>
        {chapter && (
          <styled.span color="fg.muted" fontSize="xs" fontStyle="italic">
            <Marks>{chapter}</Marks>
          </styled.span>
        )}
        <LibEn>{chapters(courses.length)}</LibEn>
        <SetupGo aria-hidden="true">›</SetupGo>
        <ProgressLine style={{ width: percent(progressOf(courses)) }} />
      </SetupButton>
    )
  }
  const tutorialCard = (label: { ja: string; en: string }, { setup, courses }: Entry) => (
    <SetupButton key={`${setup.id}-${label.ja}`} onClick={() => openSetup(setup.id)}>
      <LibJa>
        <Marks>{text(label)}</Marks>
        <Tag>{ja ? '入門' : 'Tutorial'}</Tag>
      </LibJa>
      <LibEn>
        <Marks>{name(setup)}</Marks> · {chapters(courses.length)}
      </LibEn>
      <SetupGo aria-hidden="true">›</SetupGo>
      <ProgressLine style={{ width: percent(progressOf(courses)) }} />
    </SetupButton>
  )
  const pageCard = (page: StrategyPage) => {
    const entries = page.units.flatMap((unit) => unitEntry(unit) ?? [])
    return (
      <SetupButton key={page.id} onClick={() => openPage(page.id)}>
        <LibJa>{text(page.name)}</LibJa>
        <LibEn>{text(page.about)}</LibEn>
        <SetupGo aria-hidden="true">›</SetupGo>
        <ProgressLine style={{ width: percent(progressOf(entries.flatMap((e) => e.courses))) }} />
      </SetupButton>
    )
  }
  const backToGame = fromGame && <BackLink onClick={returnToGame}>‹ {t('review.backToGame')}</BackLink>

  const open = all.find((g) => g.setup.id === setupId)
  const intro = open ? (ja ? open.setup.intro.ja : open.setup.intro.en) : ''
  const plan = open?.setup.plan ? (ja ? open.setup.plan.ja : open.setup.plan.en) : ''
  const described = `${intro}\n${plan}`
  const describedSfen = useMemo(
    () => (open ? describedPosition(open.courses, `${open.setup.intro.ja}\n${open.setup.plan?.ja ?? ''}`) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open?.setup.id],
  )
  useDescribedBoard(describedSfen, described)
  if (open) {
    const quizzable = open.courses.filter((c) => courseProgress(c).total > 0)
    const random = () => {
      store(RANDOM_KEY, open.setup.id)
      onOpen(quizzable[Math.floor(Math.random() * quizzable.length)], 'quiz')
    }
    const home = homeOf(open.setup)
    const cameFrom = stored(SETUP_FROM_KEY) ?? home.view
    const unit = unitOf(open.setup)
    const nextUnit = unit ? nextUnitAfter(unit) : undefined
    const next = nextUnit ? unitEntry(nextUnit) : undefined
    return (
      <div>
        {backToGame}
        <CrumbLink onClick={() => (setSetupId(null), openView(cameFrom))}>‹ {viewLabel(cameFrom)}</CrumbLink>
        <PickerTitle>
          <Marks>{name(open.setup)}</Marks>
        </PickerTitle>
        <PickerIntro data-spaced kind="overview">
          {describedSfen ? <SquareText text={intro} context={described} /> : <Marks>{intro}</Marks>}
        </PickerIntro>
        {plan && (
          <PickerIntro data-spaced kind="plan">
            {describedSfen ? <SquareText text={plan} context={described} /> : <Marks>{plan}</Marks>}
          </PickerIntro>
        )}
        {open.setup.path ? (
          <>
            {open.courses.length > 0 && (
              <Button variant="primary" w="100%" m="{spacing.2} 0" onClick={() => (store(RANDOM_KEY, null), onOpen(open.courses[0], 'study'))}>
                {ja ? '第1章から学ぶ' : 'Study from chapter 1'}
              </Button>
            )}
            {open.courses.length > 1 && (
              <styled.ol m="{spacing.2} 0 0" pl="5">
                {open.courses.map((course) => {
                  const title = ja ? course.title : (course.titleEn ?? course.title)
                  const prefix = `${name(open.setup)}: `
                  return (
                    <li key={course.id}>
                      <styled.button
                        p="{spacing.1} 0"
                        color="fg.default"
                        fontSize="sm"
                        textAlign="left"
                        _hover={{ color: 'accent' }}
                        onClick={() => (store(RANDOM_KEY, null), onOpen(course, 'study'))}
                      >
                        <Marks>{title.startsWith(prefix) ? title.slice(prefix.length) : title}</Marks>
                        {finished.has(course.id) && <Tag>{ja ? '済' : 'Done'}</Tag>}
                      </styled.button>
                    </li>
                  )
                })}
              </styled.ol>
            )}
            {open.setup.check && (
              <styled.details data-spaced m="{spacing.3} 0" p="{spacing.2} {spacing.3}" borderRadius="md" bg="card" boxShadow="inset 0 0 0 1px {colors.border}">
                <styled.summary cursor="pointer" fontWeight="bold">
                  <Marks>{ja ? open.setup.check.question.ja : open.setup.check.question.en}</Marks>
                </styled.summary>
                <p>
                  <Marks>{ja ? open.setup.check.answer.ja : open.setup.check.answer.en}</Marks>
                </p>
              </styled.details>
            )}
          </>
        ) : (
          <>
            {open.courses.length > 0 && (
              <Wrap gap="2" align="center" mt="2">
                <Button variant="primary" onClick={() => (store(RANDOM_KEY, null), onOpen(open.courses[0], 'study'))}>
                  {ja ? '最初の手順から学ぶ' : 'Study the first line'}
                </Button>
                {quizzable.length > 1 && <Button onClick={random}>{t('lesson.randomQuiz')}</Button>}
              </Wrap>
            )}
            {open.courses.map((course) => (
              <LessonCard key={course.id} course={course} prefix={name(open.setup)} onOpen={(c, mode) => (store(RANDOM_KEY, null), onOpen(c, mode))} />
            ))}
          </>
        )}
        {next && (
          <>
            <SubHeading data-spaced>{ja ? '次の講座' : 'Next lesson'}</SubHeading>
            {setupCard(next)}
          </>
        )}
        {open.setup.references ? (
          <LessonReferences references={open.setup.references} ja={ja} color="fg.muted" fontSize="sm" mt="2" />
        ) : (
          open.setup.sources.length > 0 && (
            <Muted mt="2">
              {ja ? '出典：' : 'Source: '}
              {open.setup.sources.map((url, index) => (
                <Fragment key={url}>
                  {index > 0 && ' · '}
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </Fragment>
              ))}
            </Muted>
          )
        )}
      </div>
    )
  }

  const search = (
    <Input
      mt="2"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={ja ? '戦法、手筋、囲い、ルールを検索' : 'Search strategies, tactics, castles, rules…'}
      aria-label={t('picker.searchLessons')}
    />
  )
  const ranked = q
    ? all
        .map((entry) => ({ entry, score: matchScore(entry, q) + Math.min(entry.courses.length, 5) }))
        .filter(({ score }) => score >= 30)
        .sort((x, y) => y.score - x.score)
    : []
  const pageHits = q ? STRATEGY_PAGES.filter((page) => [page.name.ja, page.name.en].some((n) => lower(n).includes(q))) : []
  const tutorialHits = q ? TUTORIALS.filter((tut) => [tut.name.ja, tut.name.en].some((n) => lower(n).includes(q))) : []
  const results = q && (
    <>
      {pageHits.map(pageCard)}
      {tutorialHits.flatMap((tut) => {
        const entry = unitEntry(tut.unit)
        return entry ? [tutorialCard(tut.name, entry)] : []
      })}
      <styled.p data-spaced m="{spacing.1} 0" color="fg.muted" fontSize="xs">
        {ja ? `${ranked.length}件の講座` : `${ranked.length} ${ranked.length === 1 ? 'lesson' : 'lessons'}`}
      </styled.p>
      {ranked.slice(0, 30).map(({ entry }) => resultCard(entry))}
      {ranked.length === 0 && pageHits.length === 0 && tutorialHits.length === 0 && <Muted mt="2">{ja ? '見つかりませんでした。' : 'Nothing found.'}</Muted>}
    </>
  )

  const page = view?.startsWith('strategy:') ? strategyPage(view.slice('strategy:'.length)) : undefined
  if (page) {
    const tutorials = TUTORIALS.filter((tut) => tut.page === page.id).flatMap((tut) => {
      const entry = unitEntry(tut.unit)
      return entry ? [{ tut, entry }] : []
    })
    const taught = new Set(tutorials.map(({ tut }) => tut.unit))
    const lessons = page.units.filter((unit) => !taught.has(unit)).flatMap((unit) => unitEntry(unit) ?? [])
    const drills = all.filter((g) => !g.setup.path && !g.setup.technique && g.setup.main && page.mains.includes(g.setup.main))
    const against = all.filter((g) => !g.setup.path && !g.setup.technique && g.setup.vs && page.mains.includes(g.setup.vs) && !drills.includes(g))
    const fallback = STAGES.find((stage) => stage.strategies?.includes(page.id))
    const from = stored(PAGE_FROM_KEY)
    const back = from && !from.startsWith('strategy:') ? from : fallback ? `stage:${fallback.id}` : null
    return (
      <div>
        {backToGame}
        <CrumbLink onClick={() => openView(back)}>‹ {viewLabel(back)}</CrumbLink>
        <PickerTitle>{text(page.name)}</PickerTitle>
        <PickerIntro data-spaced>{text(page.about)}</PickerIntro>
        {tutorials.length > 0 && (
          <>
            <SubHeading data-spaced>{ja ? '戦法ごとの入門' : 'Tutorial for each strategy'}</SubHeading>
            {tutorials.map(({ tut, entry }) => tutorialCard(tut.name, entry))}
          </>
        )}
        {lessons.length > 0 && (
          <>
            <SubHeading data-spaced>{ja ? 'さらに深く' : 'Going further'}</SubHeading>
            {lessons.map((entry, index) => setupCard(entry, index))}
          </>
        )}
        {drills.length > 0 && (
          <>
            <SubHeading data-spaced>{ja ? '定跡を手で覚える（相手の戦法別）' : 'Drill the lines, by opponent'}</SubHeading>
            {drills.map((entry) => setupCard(entry))}
          </>
        )}
        {against.length > 0 && (
          <>
            <SubHeading data-spaced>{ja ? `${page.name.ja}と戦う側の定跡` : `Lines for the side facing ${page.name.en}`}</SubHeading>
            {against.map((entry) => setupCard(entry))}
          </>
        )}
      </div>
    )
  }

  const stage = view?.startsWith('stage:') ? STAGES.find((s) => s.id === view.slice('stage:'.length)) : undefined
  if (stage) {
    const index = STAGES.indexOf(stage)
    const lessons = stage.units.flatMap((unit) => unitEntry(unit) ?? [])
    const techniques = stage.id === 'tesuji' ? all.filter((g) => g.setup.technique) : []
    const following = STAGES[index + 1]
    return (
      <div>
        {backToGame}
        <CrumbLink onClick={() => openView(null)}>‹ {ja ? '将棋を学ぶ' : 'Learn shogi'}</CrumbLink>
        <PickerTitle>
          <StageNumber>{index + 1}</StageNumber>
          {text(stage.name)}
        </PickerTitle>
        <PickerIntro data-spaced>{text(stage.goal)}</PickerIntro>
        {search}
        {results}
        {!q && (
          <>
            {lessons.map((entry, i) => setupCard(entry, i))}
            {(stage.strategies?.length ?? 0) > 0 && (
              <SubHeading data-spaced>{stage.units.length ? (ja ? '戦法のページ' : 'Strategy pages') : ja ? '戦法を選ぶ' : 'Choose a strategy'}</SubHeading>
            )}
            {stage.strategies?.flatMap((id) => strategyPage(id) ?? []).map(pageCard)}
            {techniques.length > 0 && <SubHeading data-spaced>{ja ? '盤上で練習する' : 'Practise on the board'}</SubHeading>}
            {techniques.map((entry) => setupCard(entry))}
            {following && (
              <Button w="100%" mt="4" onClick={() => openView(`stage:${following.id}`)}>
                {ja ? `次の段階：${following.name.ja}` : `Next stage: ${following.name.en}`}
              </Button>
            )}
          </>
        )}
      </div>
    )
  }

  const stageProgress = (s: Stage) => {
    if (s.id !== 'first-strategy') return progressOf(stageUnits(s).flatMap((unit) => unitEntry(unit)?.courses ?? []))
    const foundation = progressOf(s.units.flatMap((unit) => unitEntry(unit)?.courses ?? []))
    const choices = ['bougin-basics', 'kishu-migishiken-hidarimino', 'shiken-basics', 'gokigen-basics']
    return (foundation + Math.max(...choices.map((unit) => progressOf(unitEntry(unit)?.courses ?? [])))) / 2
  }
  const nextUp = PATH_UNITS.map(unitEntry).find((entry) => entry && progressOf(entry.courses) < 1)
  const firstStrategy = STAGES.find((s) => s.id === 'first-strategy')
  const nextIndex = nextUp ? PATH_UNITS.indexOf(unitOf(nextUp.setup) ?? '') : -1
  const chooseStrategy = firstStrategy && (!nextUp || nextIndex >= PATH_UNITS.indexOf('tesuji-pawn')) && stageProgress(firstStrategy) < 1
  const wings: { id: StrategyPage['wing']; name: string }[] = [
    { id: 'ibisha', name: ja ? '居飛車' : 'Static Rook' },
    { id: 'furibisha', name: ja ? '振り飛車' : 'Ranging Rook' },
    { id: 'both', name: ja ? '奇襲・駒落ち' : 'Surprise openings and handicaps' },
  ]
  return (
    <div>
      {backToGame}
      <PickerTitle>{ja ? '将棋を学ぶ' : 'Learn shogi'}</PickerTitle>
      {level === 'new' && <PickerIntro data-spaced>{t('picker.clickAnyPieceOnThe')}</PickerIntro>}
      {search}
      {results}
      {!q && (
        <>
          {chooseStrategy ? (
            <NextCard onClick={() => openView('stage:first-strategy')}>
              <LibEn>{ja ? '次に学ぶ' : 'Up next'}</LibEn>
              <LibJa>{ja ? '最初の戦法を選ぶ' : 'Choose your first strategy'}</LibJa>
              <SetupGo aria-hidden="true">›</SetupGo>
            </NextCard>
          ) : nextUp && (
            <NextCard onClick={() => openSetup(nextUp.setup.id)}>
              <LibEn>
                {ja ? '次に学ぶ' : 'Up next'} · {homeOf(nextUp.setup).label}
              </LibEn>
              <LibJa>
                <Marks>{name(nextUp.setup)}</Marks>
              </LibJa>
              <SetupGo aria-hidden="true">›</SetupGo>
            </NextCard>
          )}
          <SubHeading data-spaced>{ja ? '入門からプロまでの順番' : 'From beginner to professional'}</SubHeading>
          {STAGES.map((s, index) => (
            <SetupButton key={s.id} onClick={() => openView(`stage:${s.id}`)}>
              <LibJa>
                <StageNumber>{index + 1}</StageNumber>
                {text(s.name)}
              </LibJa>
              <LibEn>{text(s.goal)}</LibEn>
              <SetupGo aria-hidden="true">›</SetupGo>
              <ProgressLine style={{ width: percent(stageProgress(s)) }} />
            </SetupButton>
          ))}
          <SubHeading data-spaced>{ja ? '戦法から探す' : 'Browse by strategy'}</SubHeading>
          {wings.map((wing) => (
            <Fragment key={wing.id}>
              <Muted mt="3">{wing.name}</Muted>
              {STRATEGY_PAGES.filter((p) => p.wing === wing.id).map(pageCard)}
            </Fragment>
          ))}
        </>
      )}
      <Credits />
    </div>
  )
}
