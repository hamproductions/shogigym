import { useTranslation } from 'react-i18next'
import { LessonMap } from '../../components/Flowchart'
import { useSession } from '../hooks/session'
import type { Evaluation } from '../hooks/useEvaluation'
import type { Mistakes } from '../hooks/useMistake'
import type { CoachReview } from '../hooks/useMoveReview'
import type { Reply } from '../hooks/useOpponent'
import { bookAtPly, strip, type BookHit, type BookMove } from '../lib/book'
import type { Lane } from '../lib/lanes'
import { mistakeIsBad } from '../lib/mistake'
import { ImportBox } from '../modes/analyze/ImportBox'
import { KifuNotes } from '../modes/analyze/KifuNotes'
import type { AnalyzeGames } from '../modes/analyze/useAnalyzeGames'
import { ReviewPane } from '../modes/drill/ReviewPane'
import type { Drill } from '../modes/drill/useDrill'
import { LessonPane } from '../modes/lesson/LessonPane'
import type { Lesson } from '../modes/lesson/useLesson'
import { SparActions } from '../modes/spar/SparActions'
import type { Spar } from '../modes/spar/useSpar'
import { TesujiPane } from '../modes/tesuji/TesujiPane'
import type { TesujiTrainer } from '../modes/tesuji/useTesuji'
import { TsumePane } from '../modes/tsume/TsumePane'
import type { Tsume } from '../modes/tsume/useTsume'
import { PieceGuide } from '../pieces'
import { isGameMode, type Confirm, type Level, type Tab } from '../types'
import { CoachPane } from './CoachPane'
import { EnginePane } from './EnginePane'
import { EvalGraph } from './EvalGraph'
import { FlowPane } from './FlowPane'
import { MovesTab } from './MovesTab'

export type PanelModel = {
  lesson: Lesson
  drill: Drill
  tsume: Tsume
  tesuji: TesujiTrainer
  spar: Spar
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
}

function EngineSection({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, ai, assist, gameOver, toMove, sfen, userTurn, play } = useSession()
  const { spoilerFree, evaluation, bookHere } = model
  const live = ai && assist && !spoilerFree && !gameOver
  return (
    <>
      {!ai && <p className="ws-muted">{t('workshop.theAiNeedsACross')}</p>}
      {ai && spoilerFree && <p className="ws-muted">{t('workshop.theAiStaysQuietUntil')}</p>}
      {ai && !spoilerFree && gameOver && <p className="ws-muted">{t('workshop.checkmateWon', { winner: t(toMove === 'sente' ? 'common.gote' : 'common.sente') })}</p>}
      {!assist && <p className="ws-muted">{t('workshop.helpIsOffTurnIt')}</p>}
      {live && (mode === 'lesson' || mode === 'drill') && <p className="ws-note">{t('engine.lessonNote')}</p>}
      {live && <EnginePane sfen={sfen} toMove={toMove} analysis={evaluation.analysis} showBest={evaluation.showBest} setShowBest={evaluation.setShowBest} onPlay={play} canPlay={userTurn && mode !== 'lesson' && mode !== 'drill'} book={bookHere} />}
    </>
  )
}

function CoachSection({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { mode, game, cursor, sfens, sfen, course, assist, ai, gameOver, userTurn, play, preview } = useSession()
  const { tesuji, tsume, drill, analyze, spar, mistakes, coach, bookHere, bookLast, onBack } = model
  const { reviewAt } = coach
  return (
    <>
      {mode === 'tesuji' && tesuji.drill && <TesujiPane trainer={tesuji} drill={tesuji.drill} />}
      {mode === 'tsume' && tsume.tsume && <TsumePane trainer={tsume} tsume={tsume.tsume} banner={!!mistakes.mistake && !!preview} onBack={onBack} />}
      {mode === 'drill' && <ReviewPane trainer={drill} startSfen={drill.item ? sfens[drill.drill?.base ?? 0] : null} mistakePreview={mistakes.previewing} mistakeOk={!!mistakes.mistake && !mistakeIsBad(mistakes.mistake)} />}
      {mode === 'analyze' && <ImportBox onImport={analyze.importGame} />}
      {mode === 'analyze' && analyze.gameNotes && <KifuNotes notes={analyze.gameNotes} moves={game.moves} cursor={cursor} />}
      {mode === 'spar' && game.moves.length > 0 && !gameOver && <SparActions spar={spar} erred={spar.erred} />}
      {isGameMode(mode) && !assist && <p className="ws-muted">{t('workshop.helpIsOffNoRatings')}</p>}
      {isGameMode(mode) && assist && <CoachPane review={coach.review} lastMove={reviewAt > 0 ? game.moves[reviewAt - 1] : undefined} prevSfen={reviewAt > 0 ? sfens[reviewAt - 1] : null} you={mode === 'spar'} bookLast={reviewAt === cursor ? bookLast : bookAtPly(sfens, game.moves, reviewAt)} bookHere={bookHere} sfen={sfen} course={course} onPlay={play} canPlay={userTurn} ai={ai} showBook={mode === 'analyze'} />}
    </>
  )
}

function FlowSection({ model }: { model: PanelModel }) {
  const { t } = useTranslation()
  const { assist, gameOver, startPreview } = useSession()
  const { spoilerFree, lanes, lanesSfen, onHoverLane } = model
  return (
    <>
      {spoilerFree && <p className="ws-muted">{t('workshop.findTheMoveYourselfFirst')}</p>}
      {!spoilerFree && gameOver && <p className="ws-muted">{t('workshop.theGameIsOverCheckmate')}</p>}
      {!assist && <p className="ws-muted">{t('workshop.helpIsOffTurnIt2')}</p>}
      {assist && !spoilerFree && !gameOver && <FlowPane lanes={lanes} sfen={lanesSfen} onPreview={(moves, title) => startPreview(moves, title)} onHover={onHoverLane} />}
    </>
  )
}

export function PanelBody({ tab, model, overlays = true }: { tab: Tab; model: PanelModel; overlays?: boolean }) {
  const session = useSession()
  const { mode, course, game, sfens, sfen, cursor, setCursor, selection, ai, assist, userSide, nodes, play } = session
  const { lesson, tsume, drill, mistakes, evaluation, level, reply, bookLast, onBack } = model
  const key = `${mode}|${course?.id ?? ''}|${lesson.lessonMode}|${tab}|${tsume.tsume?.problem.id ?? ''}|${drill.drill?.index ?? ''}`
  const endRate = lesson.done && evaluation.evalSente ? (userSide === 'sente' ? evaluation.senteRate : 1 - evaluation.senteRate) : null
  return (
    <div className="ws-panel-body" key={key}>
      {tab === 'moves' && ai && assist && game.moves.length > 0 && isGameMode(mode) && <EvalGraph values={sfens.map((s) => evaluation.evals[strip(s)])} cursor={cursor} onJump={setCursor} />}
      {overlays && level === 'new' && selection && !(mode === 'lesson' && course) && <PieceGuide sfen={sfen} from={selection.from} />}
      {tab === 'engine' && <EngineSection model={model} />}
      {tab === 'coach' && mode === 'lesson' && <LessonPane lesson={lesson} mistake={mistakes.mistake} mistakePreview={mistakes.previewing} level={level} reply={reply} onPlayReply={() => reply && play(reply.usi)} lastNote={bookLast?.branch.note} endRate={endRate} onBack={onBack} />}
      {overlays && lesson.mapOpen && course && <LessonMap course={course} currentNodeId={nodes?.get(strip(sfen))?.id ?? null} onJump={lesson.jumpTo} onClose={() => lesson.setMapOpen(false)} />}
      {tab === 'coach' && <CoachSection model={model} />}
      {tab === 'flow' && <FlowSection model={model} />}
      {tab === 'moves' && <MovesTab model={model} />}
    </div>
  )
}
