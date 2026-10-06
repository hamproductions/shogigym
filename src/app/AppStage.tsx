import { useTranslation } from 'react-i18next'
import type { phoneTaskFor, Drill, Layout, Lesson, Mistakes, Session, Spar, Tesuji, Tsume, Watch } from '@/app/appStatus'
import type { useAnnouncements } from '@/app/hooks/useAnnouncements'
import type { useBoardDecor } from '@/app/hooks/useBoardDecor'
import type { useBoardInput } from '@/app/hooks/useBoardInput'
import type { useView } from '@/app/hooks/useView'
import { BoardStage } from '@/app/stage/BoardStage'
import { ModeBar } from '@/app/stage/ModeBar'
import { Icon } from './icons'

interface AppStageProps {
  session: Session
  view: ReturnType<typeof useView>
  layout: Layout
  spar: Spar
  watch: Watch
  tsume: Tsume
  tesuji: Tesuji
  lesson: Lesson
  drill: Drill
  title: string
  instruction: string
  evalRate: number | null
  evalBar: boolean
  decor: ReturnType<typeof useBoardDecor>
  input: ReturnType<typeof useBoardInput>
  commit: (usi: string) => void
  mistake: Mistakes['mistake']
  onBack: () => void
  phoneTask: ReturnType<typeof phoneTaskFor>
  announce: ReturnType<typeof useAnnouncements>['announce']
  /** The 3D furigoma toss is on the board. */
  tossing: boolean
  onToss: (faces: boolean[]) => void
  onWatchSetup: () => void
  onStartOver: () => void
}

export function AppStage({
  session,
  view,
  layout,
  spar,
  watch,
  tsume,
  tesuji,
  lesson,
  drill,
  title,
  instruction,
  evalRate,
  evalBar,
  decor,
  input,
  commit,
  mistake,
  onBack,
  phoneTask,
  announce,
  tossing,
  onToss,
  onWatchSetup,
  onStartOver,
}: AppStageProps) {
  const { t } = useTranslation()
  const { mode, preview, atEnd, playing } = session
  const previewing = preview || !atEnd || (playing && mode !== 'view' && mode !== 'spar')
  return (
    <section className={`app-stage${previewing ? ' previewing' : ''}`}>
      <button className="app-fs-exit" onClick={() => view.setHideUi(false)} aria-label={t('app.showUi')} title={`${t('app.showUi')} (Esc)`}>
        <Icon name="panel" size={18} />
        <span>{t('app.showUi')} (Esc)</span>
      </button>
      <ModeBar
        onFlip={() => session.setFlipped((v) => !v)}
        title={title}
        instruction={instruction}
        lessonMode={lesson.lessonMode}
        sheetUp={layout.compact && layout.drawer}
        panelHidden={layout.panelHidden}
        onPanel={(hidden) => layout.setPanel({ hidden })}
        spar={spar}
        watch={watch}
        onWatchSetup={onWatchSetup}
        evalRate={evalRate}
        barShown={evalBar}
        onStartOver={onStartOver}
        tsume={tsume}
        tesuji={tesuji}
        lesson={lesson}
        drill={drill}
      />
      <BoardStage
        furigoma={tossing}
        onFurigoma={onToss}
        evalRate={evalBar ? evalRate : null}
        view={view}
        decor={decor}
        input={input}
        commit={commit}
        mistake={mistake}
        onBack={onBack}
        spar={spar}
        watch={watch}
        tsume={tsume.tsume}
        hasDrillCard={!!drill.item}
        phoneTask={phoneTask}
        announce={announce}
        onZones={layout.setZones}
      />
    </section>
  )
}
