import { useGameChoice } from '@/app/modes/analyze/useGameChoice'
import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { LABELS, type Label } from '@/utils/analysis'
import { colorSide, positionOf } from '@/utils/shogi'
import { cachedReview, useReviewVersion } from '@/app/memory'
import { useSession } from '@/app/hooks/session'
import type { Evaluation } from '@/app/hooks/useEvaluation'
import type { RatingProgress } from '@/app/hooks/useAutoRate'
import type { Mistakes } from '@/app/hooks/useMistake'
import type { CoachReview } from '@/app/hooks/useMoveReview'
import type { Reply } from '@/app/hooks/useOpponent'
import { bookAtPly, strip, type BookHit, type BookMove } from '@/utils/book'
import type { Lane } from '@/utils/lanes'
import { mistakeIsBad } from '@/utils/mistake'
import type { AnalyzeGames } from '@/app/modes/analyze/useAnalyzeGames'
import type { Drill } from '@/app/modes/drill/useDrill'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import type { Spar } from '@/app/modes/spar/useSpar'
import type { Watch } from '@/app/modes/view/useWatch'
import type { TesujiTrainer } from '@/app/modes/tesuji/useTesuji'
import type { Tsume } from '@/app/modes/tsume/useTsume'
import { PieceGuide } from '@/app/pieces'
import { isGameMode, type Confirm, type Level, type Mode, type Tab } from '@/app/types'
import { Button } from '@/app/ui/Button'
import type { FixRoute } from '@/app/dialogs/ReportDialog'
import type { Mistake } from '@/utils/mistakes'
import { styled } from 'styled-system/jsx'
import { CountsHeading, CountsSection, Muted, Note, PanelContent, PinnedGraph } from './panels.styles'

const LessonMap = lazy(() => import('@/components/Flowchart').then((m) => ({ default: m.LessonMap })))
const KifuNotes = lazy(() => import('@/app/modes/analyze/KifuNotes').then((m) => ({ default: m.KifuNotes })))
const ReviewPane = lazy(() => import('@/app/modes/drill/ReviewPane').then((m) => ({ default: m.ReviewPane })))
const LessonPane = lazy(() => import('@/app/modes/lesson/LessonPane').then((m) => ({ default: m.LessonPane })))
const TesujiPane = lazy(() => import('@/app/modes/tesuji/TesujiPane').then((m) => ({ default: m.TesujiPane })))
const TsumePane = lazy(() => import('@/app/modes/tsume/TsumePane').then((m) => ({ default: m.TsumePane })))
const GameReport = lazy(() => import('@/app/dialogs/ReportDialog').then((m) => ({ default: m.GameReport })))
const CoachPane = lazy(() => import('./CoachPane').then((m) => ({ default: m.CoachPane })))
const EnginePane = lazy(() => import('./EnginePane').then((m) => ({ default: m.EnginePane })))
const EvalGraph = lazy(() => import('./EvalGraph').then((m) => ({ default: m.EvalGraph })))
const FlowPane = lazy(() => import('./FlowPane').then((m) => ({ default: m.FlowPane })))
const MovesTab = lazy(() => import('./MovesTab').then((m) => ({ default: m.MovesTab })))

export type PanelModel = {
  analyzeMoves: number
  rating: RatingProgress | null
  lesson: Lesson
  drill: Drill
  tsume: Tsume
  tesuji: TesujiTrainer
  spar: Spar
  watch: Watch
  analyze: AnalyzeGames
  mistakes: Mistakes
  evaluation: Evaluation
  coach: CoachReview
  level: Level
  reply: Reply | null
  spoilerFree: boolean
  bookHere: BookMove[]
  bookLast: BookHit | null
  lanes: Lane[]
  lanesSfen: string
  onHoverLane: (usi: string | null) => void
  onBack: () => void
  setConfirm: (confirm: Confirm) => void
  onReportRoute: (route: FixRoute) => void
  onReportExpand: () => void
  onReportPractice: (items: Mistake[]) => void
  onReturnTo: (mode: Mode) => void
  onReportLesson: (topicId: string) => void
}

function EngineSection({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, ai, assist, gameOver, toMove, sfen, userTurn, play } = useSession()
  const { spoilerFree, evaluation, bookHere } = model
  const live = ai && assist && !spoilerFree && !gameOver
  return (
    <>
      {!ai && (
        <div role="alert">
          <Muted>{t('app.theAiNeedsACross')}</Muted>
          <Button onClick={() => location.reload()}>{t('engine.reloadPage')}</Button>
        </div>
      )}
      {ai && spoilerFree && <Muted>{t('app.theAiStaysQuietUntil')}</Muted>}
      {ai && !spoilerFree && gameOver && <Muted>{t('app.checkmateWon', { winner: t(toMove === 'sente' ? 'common.gote' : 'common.sente') })}</Muted>}
      {!assist && <Muted>{t(mode === 'spar' ? 'app.coachAfterGame' : 'app.helpIsOffTurnIt')}</Muted>}
      {live && (mode === 'lesson' || mode === 'drill') && <Note>{t('engine.lessonNote')}</Note>}
      {live && (
        <EnginePane
          sfen={sfen}
          toMove={toMove}
          analysis={evaluation.analysis}
          showBest={evaluation.showBest}
          setShowBest={evaluation.setShowBest}
          onPlay={play}
          canPlay={userTurn && mode !== 'lesson' && mode !== 'drill'}
          book={bookHere}
        />
      )}
    </>
  )
}

function CoachSection({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, game, cursor, sfens, sfen, course, assist, ai, userTurn, play, preview } = useSession()
  const { tesuji, tsume, drill, analyze, mistakes, coach, bookHere, bookLast, onBack, analyzeMoves } = model
  const { reviewAt } = coach
  return (
    <>
      {mode === 'tesuji' && tesuji.drill && (
        <TesujiPane trainer={tesuji} drill={tesuji.drill} replaying={!!mistakes.mistake && mistakes.previewing} onBack={onBack} />
      )}
      {mode === 'tsume' && tsume.tsume && <TsumePane trainer={tsume} tsume={tsume.tsume} banner={!!mistakes.mistake && !!preview} onBack={onBack} />}
      {mode === 'drill' && (
        <ReviewPane
          trainer={drill}
          startSfen={drill.item ? sfens[drill.drill?.base ?? 0] : null}
          mistakePreview={mistakes.previewing}
          mistakeOk={!!mistakes.mistake && !mistakeIsBad(mistakes.mistake)}
          onOpenGame={(g) => analyze.reviewSlot(g, analyzeMoves)}
          onReturn={drill.origin ? () => model.onReturnTo(drill.origin!) : undefined}
        />
      )}
      {mode === 'view' && <Note>{t('watch.description')}</Note>}
      {mode === 'analyze' && analyze.gameNotes && <KifuNotes notes={analyze.gameNotes} moves={game.moves} ply={cursor} />}
      {(isGameMode(mode) || mode === 'view') && !assist && <Muted>{t(mode === 'spar' ? 'app.coachAfterGame' : 'app.helpIsOffNoRatings')}</Muted>}
      {(isGameMode(mode) || mode === 'view') && assist && (
        <CoachPane
          review={coach.review}
          lastMove={reviewAt > 0 ? game.moves[reviewAt - 1] : undefined}
          prevSfen={reviewAt > 0 ? sfens[reviewAt - 1] : null}
          you={mode === 'spar'}
          bookLast={reviewAt === cursor ? bookLast : bookAtPly(sfens, game.moves, reviewAt)}
          bookHere={bookHere}
          sfen={sfen}
          course={course}
          onPlay={play}
          canPlay={userTurn}
          ai={ai}
          showBook={mode === 'analyze'}
        />
      )}
      {isGameMode(mode) && assist && <MoveCounts />}
    </>
  )
}

function MoveCounts() {
  const { t } = useTranslation()
  const { game, sfens, userSide } = useSession()
  useReviewVersion()
  const counts = new Map<Label, number>()
  let total = 0
  for (const [i, usi] of game.moves.entries()) {
    if (colorSide(positionOf(sfens[i]).color) !== userSide) continue
    total++
    const review = cachedReview(sfens[i], usi)
    if (review) counts.set(review.label, (counts.get(review.label) ?? 0) + 1)
  }
  const rated = [...counts.values()].reduce((sum, count) => sum + count, 0)
  if (rated === 0) return null
  return (
    <CountsSection>
      <CountsHeading>{t('lesson.yourMoves', { value: rated, total })}</CountsHeading>
      <styled.dl display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="{spacing.1} {spacing.3}" m="{spacing.2} 0 0">
        {(Object.entries(LABELS) as [Label, (typeof LABELS)[Label]][])
          .filter(([label]) => counts.has(label))
          .map(([label, meta]) => (
            <styled.div key={label} display="flex" justifyContent="space-between" gap="1" style={{ ['--label' as string]: meta.color }}>
              <dt>
                <styled.span
                  display="inline-block"
                  whiteSpace="nowrap"
                  ml="1.5"
                  color="light-dark(color-mix(in srgb, var(--label) 55%, #000), var(--label))"
                  fontFamily="sans"
                  fontWeight="bold"
                  fontSize="xs"
                >
                  {meta.symbol}
                </styled.span>{' '}
                {meta.text}
              </dt>
              <styled.dd m="0" fontVariantNumeric="tabular-nums">
                {counts.get(label)}
              </styled.dd>
            </styled.div>
          ))}
      </styled.dl>
    </CountsSection>
  )
}

function FlowSection({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, assist, gameOver, startPreview } = useSession()
  const { spoilerFree, lanes, lanesSfen, onHoverLane } = model
  return (
    <>
      {spoilerFree && <Muted>{t('app.findTheMoveYourselfFirst')}</Muted>}
      {!spoilerFree && gameOver && <Muted>{t('app.theGameIsOverCheckmate')}</Muted>}
      {!assist && <Muted>{t(mode === 'spar' ? 'app.coachAfterGame' : 'app.helpIsOffTurnIt2')}</Muted>}
      {assist && !spoilerFree && !gameOver && (
        <FlowPane lanes={lanes} sfen={lanesSfen} onPreview={(moves, title) => startPreview(moves, title)} onHover={onHoverLane} />
      )}
    </>
  )
}

export function PanelBody({ tab, model, overlays = true }: { tab: Tab; model: PanelModel; overlays?: boolean }) {
  const session = useSession()
  useReviewVersion()
  const { mode, course, game, sfens, sfen, cursor, setCursor, selection, ai, assist, userSide, nodes, play } = session
  const { lesson, tsume, drill, mistakes, evaluation, level, reply, bookLast, onBack } = model
  const [choice, choose] = useGameChoice(model.analyze)
  const key = `${mode}|${course?.id ?? ''}|${lesson.lessonMode}|${tab}|${tsume.tsume?.problem.id ?? ''}|${drill.drill?.index ?? ''}`
  const endRate = lesson.done && evaluation.evalSente ? (userSide === 'sente' ? evaluation.senteRate : 1 - evaluation.senteRate) : null
  return (
    <Suspense fallback={null}>
      {(tab === 'moves' || tab === 'report') && ai && assist && game.moves.length > 0 && (isGameMode(mode) || mode === 'view') && (
        <PinnedGraph>
          <EvalGraph
            values={sfens.map((s) => evaluation.evals[strip(s)])}
            labels={sfens.map((_, i) => (i > 0 ? cachedReview(sfens[i - 1], game.moves[i - 1])?.label : undefined))}
            ply={cursor}
            onJump={setCursor}
          />
        </PinnedGraph>
      )}
      <PanelContent className="app-panel-body" key={key}>
        {overlays && level === 'new' && selection && !(mode === 'lesson' && course) && <PieceGuide sfen={sfen} from={selection.from} />}
        {tab === 'engine' && (
          <>
            <EngineSection model={model} />
            <FlowSection model={model} />
          </>
        )}
        {tab === 'report' && isGameMode(mode) && game.moves.length > 0 && (
          <GameReport
            key={game.start}
            game={game}
            userSide={userSide}
            rate={false}
            choice={choice}
            onChoose={choose}
            progress={model.rating}
            onShow={(ply) => setCursor(ply - 1)}
            onRoute={model.onReportRoute}
            onExpand={model.onReportExpand}
            onPractice={model.onReportPractice}
            onLesson={model.onReportLesson}
          />
        )}
        {tab === 'coach' && mode === 'lesson' && (
          <LessonPane
            lesson={lesson}
            mistake={mistakes.mistake}
            mistakePreview={mistakes.previewing}
            level={level}
            reply={reply}
            onPlayReply={play}
            lastNote={bookLast?.branch.note}
            endRate={endRate}
            onBack={onBack}
          />
        )}
        {overlays && lesson.mapOpen && course && (
          <LessonMap course={course} currentNodeId={nodes?.get(strip(sfen))?.id ?? null} onJump={lesson.jumpTo} onClose={() => lesson.setMapOpen(false)} />
        )}
        {tab === 'coach' && <CoachSection model={model} />}
        {tab === 'moves' && <MovesTab model={model} />}
      </PanelContent>
    </Suspense>
  )
}
