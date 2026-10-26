import { useEffect, useMemo, useRef } from 'react'
import { sideToMove, verdictFor, type Course, type JosekiMove, type JosekiNode, type Verdict } from '@/utils/model'
import { moveText } from '@/utils/shogi'
import { spellMarks } from '@/utils/notation'
import { Marks } from '@/app/ui/SideMark'
import { useTranslation } from 'react-i18next'
import i18n from '@/utils/i18n'
import { Button } from '@/app/ui/Button'
import { styled } from 'styled-system/jsx'
import { StageBox, arrowHead, edge } from './flowchart.styles'

type Props = {
  course: Course
  currentNodeId: string | null
  onJump: (nodeId: string) => void
}

type Step = { move: JosekiMove; from: JosekiNode; ply: number }

type Stage = {
  key: string
  steps: Step[]
  end: JosekiNode
  verdict: Verdict | 'start'
  fork: 'yours' | 'theirs' | null
  children: Stage[]
  x: number
  depth: number
}

const Moves = styled('span', { base: { lineClamp: '2', fontFamily: 'mincho', fontSize: 'sm', lineHeight: 'tight' } })

const MAX_STEPS = 10
const MIN_STEPS_BEFORE_MILESTONE = 4
const BOX_W = 164
const BOX_H = 92
const GAP_X = 16
const GAP_Y = 46

const TAG: Record<Verdict | 'start', () => string> = {
  start: () => i18n.t('lessonMap.start'),
  good: () => i18n.t('lessonMap.yourMove'),
  book: () => i18n.t('lessonMap.theirReply'),
  mistake: () => i18n.t('lessonMap.yourMistake'),
  'opponent-mistake': () => i18n.t('lessonMap.theirMistakePunishIt'),
}

function buildStage(course: Course, parent: JosekiNode, first: JosekiMove, ply: number, fork: Stage['fork']): Stage {
  const steps: Step[] = [{ move: first, from: parent, ply }]
  let node = first.child
  let n = ply
  while (
    node &&
    node.branches.length === 1 &&
    node.branches[0].child &&
    steps.length < MAX_STEPS &&
    !(node.comment && steps.length >= MIN_STEPS_BEFORE_MILESTONE)
  ) {
    n++
    steps.push({ move: node.branches[0], from: node, ply: n })
    node = node.branches[0].child
  }
  const end = steps.at(-1)!.move.child ?? parent
  const stage: Stage = {
    key: `${parent.id}-${first.usi}`,
    steps,
    end,
    verdict: verdictFor(course, sideToMove(parent), first.kind),
    fork,
    children: [],
    x: 0,
    depth: 0,
  }
  if (first.child) stage.children = childrenOf(course, end, n + 1)
  return stage
}

function childrenOf(course: Course, node: JosekiNode, ply: number): Stage[] {
  const ordered = [...node.branches].sort((a, b) => ['main', 'alt', 'deviation'].indexOf(a.kind) - ['main', 'alt', 'deviation'].indexOf(b.kind))
  const fork = ordered.length > 1 ? (sideToMove(node) === course.userSide ? 'yours' : 'theirs') : null
  return ordered.map((b) => buildStage(course, node, b, ply, fork))
}

function layout(root: Stage) {
  let leaf = 0
  let maxDepth = 0
  const place = (stage: Stage, depth: number) => {
    stage.depth = depth
    maxDepth = Math.max(maxDepth, depth)
    if (stage.children.length === 0) stage.x = leaf++
    else {
      stage.children.forEach((c) => place(c, depth + 1))
      stage.x = (stage.children[0].x + stage.children.at(-1)!.x) / 2
    }
  }
  place(root, 0)
  return { columns: Math.max(1, leaf), rows: maxDepth + 1 }
}

function tagText(stage: Stage) {
  if (stage.fork === 'yours' && stage.verdict === 'good') return i18n.t('lessonMap.yourChoice')
  if (stage.fork === 'theirs' && stage.verdict === 'book') return i18n.t('lessonMap.ifTheyPlay')
  if (stage.fork === 'theirs' && stage.verdict === 'opponent-mistake') return i18n.t('lessonMap.ifTheySlipPunishIt')
  if (stage.verdict === 'good' || stage.verdict === 'book') return i18n.t('lessonMap.bookLine')
  return TAG[stage.verdict]()
}

const flatten = (stage: Stage): Stage[] => [stage, ...stage.children.flatMap(flatten)]

function summary(stage: Stage) {
  const texts = stage.steps.map((s) => moveText(s.from.sfen, s.move.usi))
  if (texts.length <= 3) return texts.join(' ')
  return `${texts[0]} ${texts[1]} … ${texts.at(-1)}`
}

function firstSentence(text?: string) {
  if (!text) return ''
  const cut = text.search(/[。．.!?]/)
  return cut > 0 && cut < 70 ? text.slice(0, cut + 1) : text.length > 70 ? `${text.slice(0, 68)}…` : text
}

function Diagram({
  stages,
  size,
  currentKey,
  currentNodeId,
  onJump,
}: {
  stages: Stage[]
  size: { w: number; h: number }
  currentKey: string | null
  currentNodeId: string | null
  onJump: (id: string) => void
}) {
  const { t } = useTranslation()
  const scroller = useRef<HTMLDivElement>(null)
  const pos = (s: Stage) => ({ left: s.x * (BOX_W + GAP_X), top: s.depth * (BOX_H + GAP_Y) })

  useEffect(() => {
    const box = scroller.current
    const el = box?.querySelector<HTMLElement>('.fc-box[data-current]')
    if (!box || !el) return
    box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + BOX_W / 2, top: el.offsetTop - box.clientHeight / 3, behavior: 'smooth' })
  }, [currentKey])

  return (
    <styled.div overflow="auto" p="{spacing.1} {spacing.1} {spacing.3}" minHeight="0" maxH="calc(100vh - 120px)" ref={scroller}>
      <styled.div position="relative" m="0 auto" style={{ width: size.w, height: size.h }}>
        <styled.svg htmlWidth={size.w} htmlHeight={size.h} position="absolute" inset="0" overflow="visible" aria-hidden="true">
          <defs>
            {(['good', 'book', 'mistake', 'opponent-mistake'] as const).map((v) => (
              <marker key={v} id={`fc-arrow-${v}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={arrowHead({ verdict: v })} />
              </marker>
            ))}
          </defs>
          {stages.flatMap((parent) =>
            parent.children.map((child) => {
              const a = pos(parent)
              const b = pos(child)
              const x1 = a.left + BOX_W / 2
              const y1 = a.top + BOX_H
              const x2 = b.left + BOX_W / 2
              const y2 = b.top - 2
              const mid = (y1 + y2) / 2
              return (
                <path
                  key={child.key}
                  d={`M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`}
                  className={edge({ verdict: child.verdict })}
                  markerEnd={`url(#fc-arrow-${child.verdict})`}
                />
              )
            }),
          )}
        </styled.svg>
        {stages.map((s) => {
          const { left, top } = pos(s)
          const target = s.steps.length ? s.steps.at(-1)!.move.child?.id : s.end.id
          const insideAt = s.steps.findIndex((step) => step.move.child?.id === currentNodeId)
          return (
            <StageBox
              key={s.key}
              data-current={s.key === currentKey || undefined}
              className="fc-box"
              verdict={s.verdict}
              current={s.key === currentKey}
              style={{ left, top, width: BOX_W, height: BOX_H }}
              onClick={() => target && onJump(target)}
              title={spellMarks(
                [s.steps.map((st) => moveText(st.from.sfen, st.move.usi)).join(' '), s.end.comment].filter(Boolean).join('\n\n'),
                i18n.language,
              )}
            >
              <styled.span color="var(--fc-accent)" fontSize="2xs" fontWeight="bold">
                {tagText(s)}
              </styled.span>
              {s.steps.length ? (
                <Moves>
                  <styled.span mr="1.5" color="fg.muted" fontSize="2xs">
                    {s.steps[0].ply}
                    {s.steps.length > 1 ? `–${s.steps.at(-1)!.ply}` : ''}
                  </styled.span>
                  <Marks>{summary(s)}</Marks>
                </Moves>
              ) : (
                <Moves>{t('lessonMap.initialPosition')}</Moves>
              )}
              <styled.span lineClamp="1" color="fg.muted" fontSize="2xs" lineHeight="snug">
                <Marks>{firstSentence(s.end.comment ?? s.steps.at(-1)?.move.punishNote ?? s.steps.at(-1)?.move.note)}</Marks>
              </styled.span>
              {insideAt >= 0 && (
                <styled.span position="absolute" left="0" bottom="0" h="3px" bg="accent" style={{ width: `${((insideAt + 1) / s.steps.length) * 100}%` }} />
              )}
            </StageBox>
          )
        })}
      </styled.div>
    </styled.div>
  )
}

export function LessonMap({ course, currentNodeId, onJump, onClose }: Props & { onClose: () => void }) {
  const { t } = useTranslation()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const { stages, size } = useMemo(() => {
    const root: Stage = {
      key: 'start',
      steps: [],
      end: course.root,
      verdict: 'start',
      fork: null,
      children: childrenOf(course, course.root, 1),
      x: 0,
      depth: 0,
    }
    const { columns, rows } = layout(root)
    return { stages: flatten(root), size: { w: columns * (BOX_W + GAP_X) - GAP_X, h: rows * (BOX_H + GAP_Y) - GAP_Y } }
  }, [course])
  const currentKey = useMemo(() => {
    if (!currentNodeId || currentNodeId === course.root.id) return 'start'
    return stages.find((s) => s.steps.some((step) => step.move.child?.id === currentNodeId))?.key ?? null
  }, [stages, currentNodeId, course.root.id])
  return (
    <styled.div color="fg.default">
      <styled.div
        position="fixed"
        inset="0"
        zIndex="modal"
        display="grid"
        placeItems="center"
        p="6"
        bg="scrim"
        backdropFilter="blur(3px)"
        _narrow={{ p: '3' }}
        onMouseDown={onClose}
      >
        <styled.div
          w="min(1400px, 100%)"
          maxH="100%"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          p="4"
          borderRadius="xl"
          bg="panel"
          color="fg.default"
          boxShadow="inset 0 0 0 1px {colors.border}, {shadows.lg}"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <styled.div display="flex" alignItems="center" justifyContent="space-between" gap="3" mb="2.5">
            <styled.strong
              fontFamily="mincho"
              fontWeight="heavy"
              fontSize="lg"
              _narrow={{ minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <Marks>{t('lessonMap.lessonMap', { title: course.title })}</Marks>
            </styled.strong>
            <Button size="sm" variant="ghost" onClick={onClose}>
              {t('lessonMap.close')}
            </Button>
          </styled.div>
          <styled.p m="0 0 {spacing.2}" color="fg.muted" fontSize="xs">
            {t('lessonMap.everyPointInThisLesson')}
          </styled.p>
          <Diagram
            stages={stages}
            size={size}
            currentKey={currentKey}
            currentNodeId={currentNodeId}
            onJump={(id) => {
              onJump(id)
              onClose()
            }}
          />
        </styled.div>
      </styled.div>
    </styled.div>
  )
}
