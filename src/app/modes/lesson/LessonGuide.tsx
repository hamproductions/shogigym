import { SquareText } from '@/app/modes/lesson/SquareText'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { coursesOf, setupOf } from '@/utils/book'
import { courseById, findPath, sideToMove, type Course, type JosekiMove, type JosekiNode } from '@/utils/model'
import { moveText } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { lessonLeadIn } from '@/utils/lessonLeadIn'
import { scrollPanelTop } from '@/app/hooks/useLayout'
import { useSession } from '@/app/hooks/session'
import { FlipMarks } from '@/app/ui/SideMark'
import { Button } from '@/app/ui/Button'
import { Box, Flex, Grid, styled, Wrap } from 'styled-system/jsx'
import { BackLink } from '@/app/panels/panels.styles'
import type { Lesson } from './useLesson'
import { LessonReferences } from './LessonReferences'

type Series = {
  shuffle: (() => void) | null
  back: () => void
  nextTopic: (() => void) | undefined
}
type Entry = { course: string; path: string[]; variation: boolean; pause: boolean; anchor?: 'branch' | 'main' }

const PLAY_MS = 650
const positions = new Map<string, number>()

const order = (node: JosekiNode | undefined) =>
  node?.figures?.length ? Math.min(...node.figures.map((figure) => Number(figure.id.split('-').at(-1)) || 0)) : Infinity
const firstFigure = (node: JosekiNode | null | undefined): JosekiNode | undefined => {
  while (node) {
    if (node.figures?.length) return node
    node = node.branches.find((b) => b.kind === 'main')?.child ?? node.branches[0]?.child
  }
  return undefined
}
const same = (a: string[], b: string[]) => a.length === b.length && a.every((usi, i) => usi === b[i])

function scriptOf(courses: Course[]) {
  const out: Entry[] = []
  for (const course of courses) {
    const used = new Set<JosekiMove>()
    const detour = (branch: JosekiMove, base: string[], back: string[]) => {
      used.add(branch)
      if (out.at(-1)?.course !== course.id || !same(out.at(-1)!.path, base))
        out.push({ course: course.id, path: base, variation: true, pause: true, anchor: 'branch' })
      const hasFigure = (at: JosekiNode | null): boolean => !!at?.figures?.length || !!at?.branches.some((next) => hasFigure(next.child))
      const visit = (at: JosekiNode | null, path: string[]) => {
        out.push({ course: course.id, path, variation: true, pause: !!at?.figures?.length })
        if (!at) return
        for (const [i, next] of at.branches.entries()) {
          if (i > 0) {
            if (!hasFigure(next.child)) continue
            out.push({ course: course.id, path, variation: true, pause: true, anchor: 'branch' })
          }
          visit(next.child, [...path, next.usi])
        }
      }
      visit(branch.child, [...base, branch.usi])
      out.push({ course: course.id, path: back, variation: false, pause: true, anchor: 'main' })
    }
    const sides = (node: JosekiNode) => {
      const main = node.branches.find((b) => b.kind === 'main')
      return node.branches.filter((b) => b !== main && !used.has(b) && firstFigure(b.child))
    }
    let node = course.root
    let parent: JosekiNode | undefined
    let path: string[] = []
    out.push({ course: course.id, path, variation: false, pause: !!node.figures?.length })
    for (;;) {
      const main = node.branches.find((b) => b.kind === 'main')
      if (node.figures?.length) {
        const limit = main ? order(firstFigure(main.child)) : Infinity
        const due = [
          ...sides(node).map((branch) => ({ branch, base: path })),
          ...(parent ? sides(parent).map((branch) => ({ branch, base: path.slice(0, -1) })) : []),
        ]
          .filter(({ branch }) => order(firstFigure(branch.child)) < limit)
          .sort((a, b) => order(firstFigure(a.branch.child)) - order(firstFigure(b.branch.child)))
        for (const { branch, base } of due) detour(branch, base, path)
      }
      if (!main?.child) break
      parent = node
      node = main.child
      path = [...path, main.usi]
      out.push({ course: course.id, path, variation: false, pause: !!node.figures?.length })
    }
    const end = path
    const rest = (at: JosekiNode, base: string[]) => {
      const main = at.branches.find((branch) => branch.kind === 'main')
      for (const branch of at.branches) {
        if (branch !== main && !used.has(branch) && firstFigure(branch.child)) detour(branch, base, end)
        if (branch === main && branch.child) rest(branch.child, [...base, branch.usi])
      }
    }
    rest(course.root, [])
  }
  return out
}

type Props = { course: Course; lesson: Lesson; series: Series | null }

export function LessonGuide({ course, lesson, series }: Props) {
  const { i18n } = useTranslation()
  const ja = i18n.language === 'ja'
  const { game, cursor, setGame, setCursor, setSelection, setPromotion, play, liveSfen, flipped } = useSession()
  const setup = setupOf(course)
  const key = setup?.id ?? course.id
  const chapters = setup ? coursesOf(setup.courseIds) : [course]
  const leadIn = lessonLeadIn(course.root)
  const [script] = useState(() => scriptOf(chapters))
  const [revealed, setRevealed] = useState(false)
  const [hold, setHold] = useState(false)
  const [pending, setPending] = useState(false)
  const [index, setIndexState] = useState(() => positions.get(key) ?? 0)
  const setIndex = (value: number) => {
    positions.set(key, value)
    setIndexState(value)
  }
  const played = game.moves.slice(0, cursor)
  const here = script[index]
  const readingIndex = here?.anchor ? 0 : lesson.readingIndex
  const readingComplete = !!here?.anchor || lesson.readingComplete
  const synced = !!here && here.course === course.id && same(here.path, played)
  const nextIndex = script.findIndex((entry, i) => i > index && entry.pause)
  const previousIndex = script.findLastIndex((entry, i) => i < index && entry.pause)
  const next = script[nextIndex]
  const advanceCount = next?.course === course.id && same(next.path.slice(0, played.length), played) ? next.path.length - played.length : 0

  useEffect(() => scrollPanelTop(), [course.id, liveSfen, lesson.readingIndex])

  useEffect(() => {
    if (synced || pending) return
    const near = script.findIndex((entry, i) => i >= index - 1 && entry.course === course.id && same(entry.path, played))
    const found = near >= 0 ? near : script.findIndex((entry) => entry.course === course.id && same(entry.path, played))
    if (found >= 0) {
      positions.set(key, found)
      setIndexState(found)
    }
  })

  const go = (target: number) => {
    const entry = script[target]
    if (!entry) return
    setIndex(target)
    if (entry.course !== course.id) {
      const next = courseById(entry.course)
      if (!next) return
      setPending(true)
      void lesson.open(next, 'study', entry.path).finally(() => setPending(false))
      return
    }
    setSelection(null)
    setPromotion(null)
    if (entry.path.length === played.length + 1 && same(entry.path.slice(0, -1), played)) return play(entry.path.at(-1)!)
    if (game.start !== course.root.sfen || !same(game.moves.slice(0, entry.path.length), entry.path)) setGame({ start: course.root.sfen, moves: entry.path })
    setCursor(entry.path.length)
  }
  function finish() {
    if (series?.nextTopic) series.nextTopic()
    else (series?.back ?? lesson.leave)()
  }
  const forward = () => {
    if (!readingComplete) return lesson.setReadingIndex(readingIndex + 1)
    setHold(false)
    if (nextIndex < 0) return finish()
    go(nextIndex)
  }
  const back = () => {
    if (readingIndex > 0) return lesson.setReadingIndex(readingIndex - 1)
    setHold(true)
    go(previousIndex < 0 ? 0 : previousIndex)
  }

  const path: JosekiMove[] = lesson.node ? (findPath(course.root, lesson.node.id) ?? []) : []
  const nodes = [course.root, ...path.flatMap((b) => (b.child ? [b.child] : []))]
  const node = nodes.at(-1)!
  const immediate = script[index + 1]
  const stepMove =
    immediate && immediate.course === course.id && immediate.path.length === played.length + 1 && same(immediate.path.slice(0, -1), played)
      ? immediate.path.at(-1)
      : undefined
  const theirTurn = !!stepMove && sideToMove(node) !== course.userSide

  useEffect(() => {
    if (here?.anchor || hold || pending || cursor < game.moves.length || !synced || !theirTurn || node.figures?.length) return
    const id = setTimeout(() => go(index + 1), PLAY_MS)
    return () => clearTimeout(id)
  })

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (event.key === 'ArrowRight') forward()
      else back()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const upcoming = node.figures?.length ? undefined : firstFigure(node)
  const figure = node.comment || node.commentEn ? node : undefined
  const lastNote = path.at(-1) && (ja ? path.at(-1)!.note : (path.at(-1)!.noteEn ?? path.at(-1)!.note))
  const chapterName = (ja ? course.title : (course.titleEn ?? course.title)).replace(`${ja ? setup?.ja : setup?.name}: `, '')
  const text = here?.anchor
    ? here.anchor === 'branch'
      ? ja
        ? `${cursor}手目の分岐点に戻りました。ここから別の応手を比べます。`
        : `Back at the branch point after move ${cursor}. Compare another reply from here.`
      : ja
        ? cursor === 0
          ? 'この章の比較の起点に戻りました。初手から指し直す必要はありません。'
          : `本線の${cursor}手目に戻りました。ここから続きを見ます。`
        : cursor === 0
          ? 'Back at this chapter’s comparison position. You do not need to replay the opening.'
          : `Back on the main line after move ${cursor}. Continue from this position.`
    : figure
      ? ja
        ? figure.comment
        : (figure.commentEn ?? figure.comment)
      : (lastNote ?? (ja ? '次の解説図まで、一手ずつ進めて駒の動きを確かめましょう。' : 'Follow each move on the board until the next explanation.'))
  const body = (text ?? '').split('\n').filter(Boolean)
  const chapter = chapters.findIndex((c) => c.id === course.id)
  const end = nextIndex < 0 && readingComplete
  const entering = !!next?.variation && !here?.variation
  const nextLabel = !readingComplete
    ? ja
      ? '続きを読む ›'
      : 'Read on ›'
    : !next
      ? series?.nextTopic
        ? ja
          ? '次のレッスン ›'
          : 'Next lesson ›'
        : ja
          ? '目次に戻る ›'
          : 'Back to the contents ›'
      : next.course !== course.id
        ? ja
          ? '次の章 ›'
          : 'Next chapter ›'
        : next.anchor
          ? ja
            ? next.path.length === 0
              ? '比較の起点に戻る ›'
              : `${next.path.length}手目の${next.anchor === 'branch' ? '分岐点' : '本線'}に戻る ›`
            : next.path.length === 0
              ? 'Back to the comparison position ›'
              : `Back to ${next.anchor === 'branch' ? 'the branch point' : 'the main line'} at move ${next.path.length} ›`
          : entering
            ? ja
              ? `別の手順を見る${advanceCount > 1 ? `（${advanceCount}手）` : ''} ›`
              : `See another line${advanceCount > 1 ? ` (${advanceCount} moves)` : ''} ›`
            : advanceCount > 1
              ? ja
                ? `次の解説図へ（${advanceCount}手） ›`
                : `Next diagram (${advanceCount} moves) ›`
              : advanceCount === 1 && stepMove
                ? `${ja ? '次の手' : 'Next'} ${moveText(liveSfen, stepMove)} ›`
                : next.variation
                  ? ja
                    ? '分岐点に戻る ›'
                    : 'Back to the branch point ›'
                  : ja
                    ? '本線に戻る ›'
                    : 'Back to the main line ›'
  const yours = !!stepMove && !next?.variation && lesson.asking && lesson.good.some((b) => b.usi === stepMove)
  const hint = here?.variation
    ? ja
      ? '変化を見ています'
      : 'Viewing a variation'
    : yours
      ? ja
        ? `${sideMark(course.userSide)}の番：矢印の手を指すか、解説を進めます`
        : `${sideMark(course.userSide)} to move: play the arrowed move or press Next`
      : upcoming
        ? ja
          ? '手順を進めて、駒の動きを確かめましょう。'
          : 'Step through the moves and follow the pieces.'
        : ''
  const seen = new Set<string>()
  const checkpoints = script.flatMap((entry, at) => {
    const key = `${entry.course}:${entry.path.join(' ')}`
    if (!entry.pause || entry.anchor || seen.has(key)) return []
    seen.add(key)
    return [{ ...entry, at }]
  })

  return (
    <Grid gap="2">
      <Grid gap="2">
        <Flex alignItems="center" justifyContent="space-between">
          <BackLink minH="11" onClick={series?.back ?? lesson.leave}>
            ‹ {ja ? '目次' : 'Contents'}
          </BackLink>
          <styled.select
            aria-label={ja ? '解説の局面を選んで移動' : 'Jump to an explained position'}
            title={ja ? '初手から指し直さず、見たい局面へ移動します' : 'Choose a position without replaying the opening'}
            value={index}
            maxW="70%"
            minH="11"
            px="2"
            border="1px solid {colors.border}"
            borderRadius="md"
            bg="panel"
            color="fg.default"
            fontSize="xs"
            fontVariantNumeric="tabular-nums"
            onChange={(event) => {
              setHold(true)
              lesson.setReadingIndex(0)
              go(Number(event.target.value))
            }}
          >
            <option value={index}>
              {ja ? `第${chapter + 1}章 / ${chapters.length}・${cursor}手目` : `Chapter ${chapter + 1} of ${chapters.length} · move ${cursor}`}
            </option>
            {chapters.map((entry, c) => (
              <optgroup key={entry.id} label={ja ? entry.title : (entry.titleEn ?? entry.title)}>
                {checkpoints
                  .filter((point) => point.course === entry.id)
                  .map((point, i) =>
                    point.at === index ? null : (
                      <option key={point.at} value={point.at}>
                        {ja
                          ? `第${c + 1}章・解説${i + 1}・${point.path.length}手目${point.variation ? '（別の手順）' : ''}`
                          : `Chapter ${c + 1} · position ${i + 1} · move ${point.path.length}${point.variation ? ' (variation)' : ''}`}
                      </option>
                    ),
                  )}
              </optgroup>
            ))}
          </styled.select>
        </Flex>
        <Box h="3px" borderRadius="2px" bg="surface.2" overflow="hidden" aria-hidden="true">
          <styled.i display="block" h="100%" bg="accent" style={{ width: `${script.length > 1 ? (index / (script.length - 1)) * 100 : 100}%` }} />
        </Box>
      </Grid>
      <Box minHeight="0">
        <styled.h3 m="0 0 {spacing.3}" fontFamily="mincho" fontSize="lg" lineHeight="snug">
          {chapterName}
        </styled.h3>
        {leadIn.length > 0 && cursor === leadIn.length && same(played, leadIn) && (
          <Button variant="ghost" minH="11" mb="2" onClick={() => go(script.findIndex((entry) => entry.course === course.id && entry.path.length === 0))}>
            {ja ? 'この形までの駒組みを初手から見る' : 'Follow the setup from move one'}
          </Button>
        )}
        {body.length > 1 && (
          <styled.p m="0 0 {spacing.2}" fontSize="xs" color="fg.muted">
            {ja ? `この局面の説明 ${readingIndex + 1} / ${body.length}` : `This position: ${readingIndex + 1} of ${body.length}`}
          </styled.p>
        )}
        <Grid gap="3">
          {body.slice(readingIndex, readingIndex + 1).map((line, i) => (
            <styled.p key={i} m="0" fontSize="md" lineHeight="1.8">
              <SquareText text={line} context={lesson.annotationText} />
            </styled.p>
          ))}
        </Grid>

        {readingComplete && (!next || next.course !== course.id) && lesson.progress && lesson.progress.total > 0 && (
          <Grid gap="2" mt="3" p="3" borderRadius="md" bg="card" boxShadow="inset 0 0 0 1px {colors.border}">
            <strong>{ja ? '今の手順を覚えていますか？' : 'Can you play that line yourself?'}</strong>
            <styled.p m="0" fontSize="sm">
              {ja
                ? 'クイズでは矢印を隠します。最初の局面から、自分で手を選んでみましょう。'
                : 'The quiz hides the arrows. Start from the first position and choose the moves yourself.'}
            </styled.p>
            <Button onClick={() => lesson.open(course, 'quiz')}>{ja ? 'この章をクイズで練習' : 'Practise this chapter'}</Button>
          </Grid>
        )}
        {end && (
          <Grid gap="2" mt="3" p="3" borderRadius="md" bg="card" boxShadow="inset 0 0 0 1px {colors.border}">
            <strong>{ja ? 'おさらい' : 'Review'}</strong>
            {setup?.check && (
              <Box>
                <styled.p m="0 0 {spacing.2}">
                  <FlipMarks flipped={flipped}>{ja ? setup.check.question.ja : setup.check.question.en}</FlipMarks>
                </styled.p>
                {revealed ? (
                  <styled.p m="0 0 {spacing.2}" fontWeight="bold">
                    <FlipMarks flipped={flipped}>{ja ? setup.check.answer.ja : setup.check.answer.en}</FlipMarks>
                  </styled.p>
                ) : (
                  <Button size="sm" onClick={() => setRevealed(true)}>
                    {ja ? '答えを見る' : 'Show the answer'}
                  </Button>
                )}
              </Box>
            )}
            <Wrap gap="2" align="center">
              {series?.shuffle && (
                <Button variant="primary" onClick={series.shuffle}>
                  {ja ? 'クイズで確認する' : 'Test yourself'}
                </Button>
              )}
            </Wrap>
          </Grid>
        )}
        {setup?.references && (
          <styled.details mt="3" color="fg.muted" fontSize="xs">
            <styled.summary cursor="pointer">{ja ? '参考資料' : 'References'}</styled.summary>
            <LessonReferences references={setup.references} ja={ja} mt="2" />
          </styled.details>
        )}
      </Box>
      <Grid position="sticky" bottom="0" zIndex="hud" gap="1.5" py="2" bg="panel" borderTop="1px solid {colors.border}">
        {hint && (
          <styled.p minHeight="1.5em" m="0" overflow="hidden" color="fg.muted" fontSize="xs" role="status">
            <FlipMarks flipped={flipped}>{hint}</FlipMarks>
          </styled.p>
        )}
        <styled.nav display="grid" gridTemplateColumns="1fr 2fr" gap="2" mt="2" aria-label={ja ? '手順の移動' : 'Moves'}>
          <Button minH="11" disabled={index === 0 && lesson.readingIndex === 0} onClick={back} aria-keyshortcuts="ArrowLeft">
            ‹ {ja ? '戻る' : 'Back'}
          </Button>
          {entering && readingComplete ? (
            <BackLink minH="11" onClick={forward} aria-keyshortcuts="ArrowRight">
              {ja ? '別の手順を見る ›' : 'See another line ›'}
            </BackLink>
          ) : (
            <Button minH="11" variant="primary" onClick={end ? finish : forward} aria-keyshortcuts="ArrowRight">
              <FlipMarks flipped={flipped}>{nextLabel}</FlipMarks>
            </Button>
          )}
          {advanceCount > 1 && readingComplete && (
            <Button
              variant="ghost"
              minH="11"
              gridColumn="1 / -1"
              onClick={() => {
                setHold(true)
                go(index + 1)
              }}
            >
              {ja ? '一手だけ進めて見る' : 'Show just one move'}
            </Button>
          )}
        </styled.nav>
      </Grid>
    </Grid>
  )
}
