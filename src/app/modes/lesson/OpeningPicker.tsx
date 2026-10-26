import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteParams } from '@/app/hooks/useRouteParams'
import { SETUPS, type Course, type Setup } from '@/utils/model'
import { scrollPanelTop } from '@/app/hooks/useLayout'
import { coursesOf } from '@/utils/book'
import { courseProgress } from '@/app/practice'
import { setSettings, useSettings } from '@/appearance/settings'
import { mainStrategies, strategyById } from '@/data/strategies'
import type { LessonMode, Level } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Marks } from '@/app/ui/SideMark'
import { Input } from '@/components/ui'
import { Grid, styled, Wrap } from 'styled-system/jsx'
import { BackLink, Muted, SubHeading } from '@/app/panels/panels.styles'
import { CrumbLink, LibEn, LibJa, PickerIntro, PickerTitle, ProgressLine, SetupButton, SetupGo } from './lesson.styles'
import { LessonCard } from './LessonCard'
import { LessonReferences } from './LessonReferences'
import { SquareText } from './SquareText'
import { describedPosition, useDescribedBoard } from './describedPosition'
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
      <SetupButton key={setup.id} onClick={() => setSetupId(setup.id)}>
        <LibJa>
          <Marks>{name(setup)}</Marks>
          {setup.basics && p.learned === 0 && <Tag>{t('picker.startHere')}</Tag>}
        </LibJa>
        <LibEn>{ja ? `${courses.length} 章` : `${courses.length} ${courses.length === 1 ? 'chapter' : 'chapters'}`}</LibEn>
        <SetupGo aria-hidden="true">›</SetupGo>
        <ProgressLine style={{ width: percent(p) }} />
      </SetupButton>
    )
  }
  const crumb = (setup: Setup) => {
    const category = CATEGORIES.find((c) => c.id === categoryOf(setup))!.name[ja ? 'ja' : 'en']
    const group = josekiGroupOf(setup) ?? groupOf(setup)
    return group ? `${category} › ${groupName(group)}` : category
  }
  const resultCard = (entry: Entry) => {
    const { setup, courses } = entry
    const byChapter = !lower(`${setup.ja} ${setup.name}`).includes(q) ? courses.find((c) => lower(`${c.title} ${c.titleEn ?? ''}`).includes(q)) : undefined
    const chapter = byChapter ? (ja ? byChapter.title : (byChapter.titleEn ?? byChapter.title)) : null
    const defending = courses.length > 0 && courses.every((c) => c.notesFromOpponentView)
    const p = progressOf(courses)
    return (
      <SetupButton key={setup.id} found onClick={() => setSetupId(setup.id)}>
        <LibJa>
          <Marks>{name(setup)}</Marks>
          {defending && <Tag>{ja ? '受ける側' : 'Defending side'}</Tag>}
        </LibJa>
        <LibEn>
          <Marks>{crumb(setup)}</Marks>
        </LibEn>
        {chapter && (
          <styled.span color="fg.muted" fontSize="xs" fontStyle="italic">
            <Marks>{chapter}</Marks>
          </styled.span>
        )}
        <LibEn>{ja ? `${courses.length} 章` : `${courses.length} ${courses.length === 1 ? 'chapter' : 'chapters'}`}</LibEn>
        <SetupGo aria-hidden="true">›</SetupGo>
        <ProgressLine style={{ width: percent(p) }} />
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
    return (
      <div>
        {backToGame}
        <CrumbLink onClick={() => (setSetupId(null), openCategory(categoryOf(open.setup)))}>
          ‹ {CATEGORIES.find((c) => c.id === categoryOf(open.setup))?.name[ja ? 'ja' : 'en']}
        </CrumbLink>
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
                {ja ? '始める' : 'Start'}
              </Button>
            )}
            {open.courses.length === 0 && open.setup.check && (
              <styled.details data-spaced m="{spacing.3} 0" p="{spacing.2} {spacing.3}" borderRadius="md" bg="card" boxShadow="inset 0 0 0 1px {colors.border}">
                <styled.summary cursor="pointer" fontWeight="bold">
                  <Marks>{ja ? open.setup.check.question.ja : open.setup.check.question.en}</Marks>
                </styled.summary>
                <p>
                  <Marks>{ja ? open.setup.check.answer.ja : open.setup.check.answer.en}</Marks>
                </p>
              </styled.details>
            )}
            {open.courses.length > 1 && (
              <styled.details mt="2">
                <styled.summary cursor="pointer" color="fg.muted" fontSize="sm">
                  {ja ? `目次（${open.courses.length}）` : `Contents (${open.courses.length})`}
                </styled.summary>
                <styled.ol m="{spacing.2} 0 0" pl="4">
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
                        </styled.button>
                      </li>
                    )
                  })}
                </styled.ol>
              </styled.details>
            )}
          </>
        ) : (
          <>
            {open.courses.length > 0 && (
              <Wrap gap="2" align="center" mt="2">
                <Button variant="primary" onClick={() => (store(RANDOM_KEY, null), onOpen(open.courses[0], 'study'))}>
                  {ja ? '最初から学ぶ' : 'Start from the beginning'}
                </Button>
                {quizzable.length > 1 && <Button onClick={random}>{t('lesson.randomQuiz')}</Button>}
              </Wrap>
            )}
            {open.courses.map((course) => (
              <LessonCard key={course.id} course={course} prefix={name(open.setup)} onOpen={(c, mode) => (store(RANDOM_KEY, null), onOpen(c, mode))} />
            ))}
          </>
        )}
        {(() => {
          const opponent = open.setup.vs ? strategyById(open.setup.vs) : undefined
          const base = opponent?.ja ?? open.setup.ja
          const baseName = opponent?.en ?? open.setup.name
          const mentions = (g: Entry) => g.setup.ja.includes(base) || g.courses.some((c) => c.title.includes(base))
          const related = base.length >= 2 ? all.filter((g) => g.setup.id !== open.setup.id && mentions(g)).slice(0, 8) : []
          const group = josekiGroupOf(open.setup) ?? groupOf(open.setup)
          const shown = new Set(related.map((g) => g.setup.id))
          const siblings = group
            ? all
                .filter((g) => g.setup.id !== open.setup.id && !shown.has(g.setup.id) && (josekiGroupOf(g.setup) ?? groupOf(g.setup)) === group && g.setup.path)
                .slice(0, 6)
            : []
          return (
            <>
              {related.length > 0 && (
                <SubHeading data-spaced>
                  <Marks>{ja ? `「${base}」に関する講座` : `More about ${baseName}`}</Marks>
                </SubHeading>
              )}
              {related.map(resultCard)}
              {siblings.length > 0 && (
                <SubHeading data-spaced>
                  <Marks>{ja ? `${groupName(group!)}の他の講座` : `More in ${groupName(group!)}`}</Marks>
                </SubHeading>
              )}
              {siblings.map(resultCard)}
            </>
          )
        })()}
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

  if (choosing)
    return (
      <div>
        <BackLink onClick={() => setChoosing(false)}>{t('picker.back')}</BackLink>
        <PickerTitle>{t('strategy.chooseMain')}</PickerTitle>
        {(['furibisha', 'ibisha'] as const).map((wing) => (
          <Fragment key={wing}>
            <SubHeading data-spaced>{t(`strategy.${wing}`)}</SubHeading>
            <Grid gridTemplateColumns="repeat(auto-fill, minmax(140px, 1fr))" gap="2" mt="2">
              {mainStrategies()
                .filter((s) => s.side === wing)
                .map((s) => (
                  <styled.button
                    key={s.id}
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    gap="2px"
                    p="3"
                    border="1px solid {colors.border}"
                    borderColor={s.id === main.id ? 'accent' : undefined}
                    borderRadius="md"
                    bg="card"
                    color="fg.default"
                    font="inherit"
                    textAlign="left"
                    cursor="pointer"
                    boxShadow={s.id === main.id ? 'inset 0 0 0 1px {colors.accent}' : undefined}
                    onClick={() => (setSettings({ mainStrategy: s.id }), setChoosing(false))}
                  >
                    <styled.strong fontFamily="mincho">
                      <Marks>{ja ? s.ja : s.en}</Marks>
                    </styled.strong>
                    <styled.span color="fg.muted" fontSize="xs">
                      {t(`strategy.level${s.level}`)}
                    </styled.span>
                  </styled.button>
                ))}
            </Grid>
          </Fragment>
        ))}
      </div>
    )

  const search = (
    <Input
      mt="2"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={ja ? 'ルール、手筋、戦法などを検索' : 'Search rules, tactics, openings…'}
      aria-label={t('picker.searchLessons')}
    />
  )
  const ranked = q
    ? all
        .map((entry) => ({ entry, score: matchScore(entry, q) + Math.min(entry.courses.length, 5) }))
        .filter(({ score }) => score >= 30)
        .sort((x, y) => y.score - x.score)
    : []
  const results = q && (
    <>
      <styled.p data-spaced m="{spacing.1} 0" color="fg.muted" fontSize="xs">
        {ja ? `${ranked.length}件` : `${ranked.length} ${ranked.length === 1 ? 'result' : 'results'}`}
      </styled.p>
      {ranked.slice(0, 30).map(({ entry }) => resultCard(entry))}
      {ranked.length === 0 && <Muted mt="2">{ja ? '見つかりませんでした。' : 'Nothing found.'}</Muted>}
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
      <div>
        {backToGame}
        <CrumbLink onClick={() => openCategory(null)}>{ja ? '‹ 将棋を学ぶ' : '‹ Learn shogi'}</CrumbLink>
        <PickerTitle>{ja ? '定跡' : 'Joseki'}</PickerTitle>
        <styled.button
          display="grid"
          gridTemplateColumns="auto 1fr auto"
          alignItems="baseline"
          gap="3"
          w="100%"
          m="{spacing.2} 0 {spacing.3}"
          p="{spacing.3} {spacing.4}"
          border="1px solid {colors.border.strong}"
          borderRadius="md"
          bg="card"
          color="fg.default"
          font="inherit"
          textAlign="left"
          cursor="pointer"
          onClick={() => setChoosing(true)}
        >
          <styled.span color="fg.muted" fontSize="xs">
            {t('strategy.yourMain')}
          </styled.span>
          <styled.strong fontFamily="mincho" fontSize="lg">
            <Marks>{ja ? main.ja : main.en}</Marks>
          </styled.strong>
          <styled.em color="accent" fontStyle="normal" fontSize="sm">
            {t('strategy.change')} ›
          </styled.em>
        </styled.button>
        {level === 'new' && <PickerIntro data-spaced>{t('picker.clickAnyPieceOnThe')}</PickerIntro>}
        {search}
        {results}
        {!q && (
          <>
            {mine.filter((g) => g.setup.basics).map(setupCard)}
            {lessons.length > 0 && (
              <SubHeading data-spaced>
                <Marks>{ja ? `${main.ja}の考え方と手筋` : `${main.en}: ideas and tactics`}</Marks>
              </SubHeading>
            )}
            {lessons.map(setupCard)}
            {mine.some((g) => !g.setup.basics) && <SubHeading data-spaced>{t('picker.openingsByWhatYourOpponent')}</SubHeading>}
            {mine.filter((g) => !g.setup.basics).map(setupCard)}
            {otherGroups.map((at) => (
              <Fragment key={at}>
                <SubHeading data-spaced>
                  <Marks>{groupName(at)}</Marks>
                </SubHeading>
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
      <div>
        {backToGame}
        <CrumbLink onClick={() => openCategory(null)}>{ja ? '‹ 将棋を学ぶ' : '‹ Learn shogi'}</CrumbLink>
        <PickerTitle>{ja ? info.name.ja : info.name.en}</PickerTitle>
        {search}
        {results}
        {!q &&
          GROUPS[category].map((group) => {
            const entries = inCategory.filter((g) => groupOf(g.setup) === group)
            return (
              entries.length > 0 && (
                <Fragment key={group}>
                  <SubHeading data-spaced>
                    <Marks>{groupName(group)}</Marks>
                  </SubHeading>
                  {entries.map(setupCard)}
                </Fragment>
              )
            )
          })}
      </div>
    )
  }

  return (
    <div>
      {backToGame}
      <PickerTitle>{ja ? '将棋を学ぶ' : 'Learn shogi'}</PickerTitle>
      {search}
      {results}
      {!q &&
        CATEGORIES.map((item) => {
          const p = progressOf(all.filter((g) => categoryOf(g.setup) === item.id).flatMap((g) => g.courses))
          return (
            <SetupButton key={item.id} onClick={() => openCategory(item.id)}>
              <LibJa>{ja ? item.name.ja : item.name.en}</LibJa>
              <LibEn>{ja ? item.about.ja : item.about.en}</LibEn>
              <SetupGo aria-hidden="true">›</SetupGo>
              <ProgressLine style={{ width: percent(p) }} />
            </SetupButton>
          )
        })}
      <Credits />
    </div>
  )
}
