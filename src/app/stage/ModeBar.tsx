import './mode-bar.css'
import { useTranslation } from 'react-i18next'
import { moveText } from '@/utils/shogi'
import { useSession } from '@/app/hooks/session'
import { Icon } from '@/app/icons'
import { sideMark } from '@/utils/notation'
import type { Spar } from '@/app/modes/spar/useSpar'
import type { Watch } from '@/app/modes/view/useWatch'
import type { TesujiTrainer as Tesuji } from '@/app/modes/tesuji/useTesuji'
import type { Tsume } from '@/app/modes/tsume/useTsume'
import { LessonControls, ReviewControls, TesujiControls, TsumeControls } from './PracticeControls'
import type { Drill } from '@/app/modes/drill/useDrill'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import { STRENGTH, TIME_CONTROLS, setSettings, useSettings, type AiStrength } from '@/appearance/settings'
import { MODES, isGameMode, type LessonMode } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { cx } from '@/app/ui/cx'
import { useGlide } from '@/app/hooks/useGlide'
import { engineSupported, restartEngine, useEngineStatus } from '@/utils/engine'
import { FAMILIES, STRATEGIES } from '@/data/strategies'
import { strategyCourses } from '@/utils/book'

interface ModeBarProps {
  onFlip: () => void
  title: string
  instruction: string
  lessonMode: LessonMode
  sheetUp: boolean
  panelHidden: boolean
  onPanel: (hidden: boolean) => void
  spar: Spar
  watch: Watch
  onWatchSetup: () => void
  evalRate: number | null
  barShown: boolean
  onStartOver: () => void
  tsume: Tsume
  tesuji: Tesuji
  lesson: Lesson
  drill: Drill
}

function EvalChip({ rate, barShown }: { rate: number; barShown: boolean }) {
  const { t } = useTranslation()
  const fill = useGlide<HTMLSpanElement>('width', rate * 100)
  return (
    <span
      className={`app-eval-chip${barShown ? ' has-bar' : ''}`}
      title={t('app.winChance', { value: Math.round(rate * 100), value2: 100 - Math.round(rate * 100) })}
    >
      <span className="app-eval-label">{t('app.winChanceShort')}</span>
      <span className="app-eval-track">
        <span ref={fill} style={{ width: `${rate * 100}%` }} />
      </span>
      <b>
        {rate >= 0.5 ? '☗' : '☖'} {Math.round(Math.max(rate, 1 - rate) * 100)}%
      </b>
    </span>
  )
}

function ModeSeal({ lessonMode }: { lessonMode: LessonMode }) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  const { mode, course } = useSession()
  if (!ja) {
    const icon = MODES.find((m) => m.id === mode)?.icon
    return icon ? <Icon name={icon} size={22} /> : null
  }
  if (mode === 'lesson' && course) return t(lessonMode === 'study' ? 'modes.sealStudy' : 'modes.sealQuiz')
  return t(`modes.${mode}.name`)
}

function EngineStatusText({ instruction }: { instruction: string }) {
  const { t } = useTranslation()
  const engine = useEngineStatus()
  let status = instruction
  if (!engineSupported()) status = t('engine.theAiNeedsACross')
  else if (engine.error) status = engine.error
  else if (engine.loading) status = t('engine.loadingEngine')
  return <output aria-busy={engine.loading}>{status}</output>
}

function LastMove() {
  const { t } = useTranslation()
  const { lastMove, prevSfen, plyBase, preview, cursor, toMove } = useSession()
  return (
    <span className="app-lastmove">
      {lastMove && prevSfen ? (
        <>
          <span className="app-ply">{t('app.move', { value: plyBase + (preview ? preview.base + preview.step : cursor) })}</span>
          <strong title={moveText(prevSfen, lastMove)}>{moveText(prevSfen, lastMove)}</strong>
        </>
      ) : (
        <span className="app-ply">{plyBase > 0 ? t('app.afterMove', { plyBase }) : t('app.startPosition')}</span>
      )}
      <span className={`app-turn ${toMove}`}>{t('app.toMove', { side: sideMark(toMove) })}</span>
    </span>
  )
}

function EngineRecovery({ watch }: { watch: Watch }) {
  const { t } = useTranslation()
  const engine = useEngineStatus()
  const { mode } = useSession()
  return (
    <>
      {engine.error && (isGameMode(mode) || mode === 'view') && (
        <Button
          size="sm"
          onClick={() => {
            restartEngine()
            if (mode === 'view') watch.toggle()
          }}
        >
          {t('tsume.tryAgain')}
        </Button>
      )}
      {!engineSupported() && (
        <Button size="sm" onClick={() => location.reload()}>
          {t('engine.reloadPage')}
        </Button>
      )}
    </>
  )
}

function WatchControls({ watch, onWatchSetup }: { watch: Watch; onWatchSetup: () => void }) {
  const { t } = useTranslation()
  const { mode } = useSession()
  if (mode !== 'view') return null
  let watchKey = 'newGame.start'
  if (watch.started) watchKey = watch.running ? 'watch.pause' : 'watch.resume'
  return (
    <>
      <Button size="sm" onClick={watch.started ? watch.toggle : onWatchSetup} disabled={watch.started && !watch.canPlay}>
        <Icon name={watch.running ? 'pause' : 'play'} size={16} />
        {t(watchKey)}
      </Button>
      <Button size="sm" onClick={watch.restart}>
        {t('watch.newGame')}
      </Button>
    </>
  )
}

function AssistToggle() {
  const { t } = useTranslation()
  const settings = useSettings()
  const { mode } = useSession()
  if (!isGameMode(mode) && mode !== 'view') return null
  return (
    <Button
      size="sm"
      variant="ghost"
      className={cx('app-help-toggle', settings.assist && 'on')}
      onClick={() => setSettings({ assist: !settings.assist })}
      title={settings.assist ? t('app.helpIsOnEvalBar') : t('app.noHelpClickToShow')}
      aria-pressed={settings.assist}
      aria-label={settings.assist ? t('app.coachOn') : t('app.coachOff')}
    >
      <span className="app-control-icon">
        <Icon name="coach" />
      </span>
      <span className="app-control-label">{settings.assist ? t('app.coachOn') : t('app.coachOff')}</span>
    </Button>
  )
}

function SparMoveControls({ spar }: { spar: Spar }) {
  const { t } = useTranslation()
  const { mode, game, gameOver } = useSession()
  if (mode !== 'spar' || game.moves.length === 0 || gameOver || spar.resigned) return null
  return (
    <>
      <Button
        size="sm"
        variant={spar.erred ? 'primary' : 'secondary'}
        className="app-takeback"
        onClick={spar.takeBack}
        disabled={spar.lastUserMove < 0}
        title={t('app.takeBackYourLastMove3')}
        aria-label={t('app.takeBack')}
      >
        <span className="app-control-icon">
          <Icon name="undo" />
        </span>
        <span className="app-control-label">{t('app.takeBack')}</span>
      </Button>
      <Button size="sm" variant="ghost" className="app-resign" onClick={spar.confirmResign} title={t('app.resign')} aria-label={t('app.resign')}>
        <span className="app-control-icon">
          <Icon name="resign" />
        </span>
        <span className="app-control-label">{t('app.resign')}</span>
      </Button>
    </>
  )
}

function ModeControls({ lesson, drill, tsume, tesuji }: { lesson: Lesson; drill: Drill; tsume: Tsume; tesuji: Tesuji }) {
  const { mode, course } = useSession()
  return (
    <>
      {mode === 'lesson' && course && <LessonControls lesson={lesson} />}
      {mode === 'drill' && <ReviewControls drill={drill} />}
      {mode === 'tsume' && <TsumeControls trainer={tsume} />}
      {mode === 'tesuji' && <TesujiControls trainer={tesuji} />}
    </>
  )
}

function StartOverButton({ onStartOver }: { onStartOver: () => void }) {
  const { t } = useTranslation()
  const { mode, game } = useSession()
  if (mode === 'spar' || mode === 'view' || mode === 'tsume' || mode === 'tesuji' || game.moves.length === 0) return null
  return (
    <Button size="sm" variant="ghost" onClick={onStartOver} title={t('app.startOver')} aria-label={t('app.startOver')}>
      <Icon name="reset" size={16} />
    </Button>
  )
}

function SparSetupButton({ spar }: { spar: Spar }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { mode } = useSession()
  if (mode !== 'spar') return null
  return (
    <Button
      variant={spar.erred ? 'secondary' : 'primary'}
      className="app-game-setup"
      onClick={() => spar.setNewGameOpen(true)}
      title={`${STRENGTH[settings.opponent].label} · ${TIME_CONTROLS[settings.timeControl].label}`}
      aria-label={t('newGame.button')}
    >
      <span className="app-control-icon">
        <Icon name="newGame" />
      </span>
      <span className="app-control-label">{t('newGame.button')}</span>
    </Button>
  )
}

function PanelNav({ panelHidden, onPanel }: { panelHidden: boolean; onPanel: (hidden: boolean) => void }) {
  const { t } = useTranslation()
  const { nav } = useSession()
  if (!panelHidden) {
    return (
      <div className="app-mini-nav">
        <Button size="sm" className="app-mini-wide" onClick={() => onPanel(true)} title={t('app.boardOnlyHideThePanel')} aria-label={t('app.hideThePanel')}>
          <Icon name="panel" size={16} />
          <span>{t('app.hidePanel')}</span>
        </Button>
      </div>
    )
  }
  return (
    <div className="app-mini-nav">
      <Button size="sm" onClick={nav.back} disabled={!nav.canBack} title={t('app.back')} aria-label={t('app.back2')}>
        <Icon name="prev" size={16} />
      </Button>
      <Button size="sm" onClick={nav.forward} disabled={!nav.canForward} title={t('app.forward')} aria-label={t('app.forward2')}>
        <Icon name="next" size={16} />
      </Button>
      <Button size="sm" className="app-mini-wide" onClick={() => onPanel(false)} title={t('app.showThePanelP')} aria-label={t('app.showThePanel')}>
        <Icon name="panel" size={16} />
        <span>{t('app.panel')}</span>
      </Button>
    </div>
  )
}

export function ModeBar({
  onFlip,
  title,
  instruction,
  lessonMode,
  sheetUp,
  panelHidden,
  onPanel,
  spar,
  watch,
  onWatchSetup,
  evalRate,
  barShown,
  onStartOver,
  tsume,
  tesuji,
  lesson,
  drill,
}: ModeBarProps) {
  const { t } = useTranslation()
  const { mode } = useSession()
  return (
    <header className={`app-modebar${sheetUp ? ' sheet-up' : ''} m-${mode}${mode === 'lesson' ? ` l-${lessonMode}` : ''}`}>
      <div className="app-modebar-heading">
        <span className="app-modebar-seal">
          <ModeSeal lessonMode={lessonMode} />
        </span>
        <span className="app-modebar-text">
          <strong>{title}</strong>
          <EngineStatusText instruction={instruction} />
        </span>
        <LastMove />
      </div>
      <div className="app-modebar-controls">
        <EngineRecovery watch={watch} />
        <WatchControls watch={watch} onWatchSetup={onWatchSetup} />
        <AssistToggle />
        <SparMoveControls spar={spar} />
        <ModeControls lesson={lesson} drill={drill} tsume={tsume} tesuji={tesuji} />
        <StartOverButton onStartOver={onStartOver} />
        <SparSetupButton spar={spar} />
        <Button size="sm" variant="ghost" className="app-board-flip" onClick={onFlip} title={t('app.flipTheBoardF')} aria-label={t('app.flip')}>
          <Icon name="flip" size={16} />
        </Button>
        {evalRate !== null && <EvalChip rate={evalRate} barShown={barShown} />}
        <PanelNav panelHidden={panelHidden} onPanel={onPanel} />
      </div>
    </header>
  )
}

export function WatchOptions({ watch }: { watch: Watch }) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  return (
    <>
      {watch.bots.map((strength, index) => (
        <fieldset key={watch.name(index)} className="app-bot-settings" aria-label={watch.name(index)}>
          <span>
            {watch.name(index)}
            {watch.side(index) && ` · ${t(`common.${watch.side(index)}`)}`}
          </span>
          <select
            className="app-field"
            aria-label={t('watch.difficulty', { bot: watch.name(index) })}
            value={strength}
            onChange={(event) => watch.setBot(index, event.target.value as AiStrength)}
          >
            {(Object.entries(STRENGTH) as [AiStrength, (typeof STRENGTH)[AiStrength]][]).map(([id, level]) => (
              <option key={id} value={id}>
                {level.label}
              </option>
            ))}
          </select>
          <select
            className="app-field"
            aria-label={t('watch.strategy', { bot: watch.name(index) })}
            value={watch.strategies[index]}
            onChange={(event) => watch.setStrategy(index, event.target.value)}
          >
            <option value="random">{t('app.randomStrategy')}</option>
            <option value="">{t('app.noStrategy')}</option>
            {Object.entries(FAMILIES).map(([family, label]) => {
              const choices = STRATEGIES.filter(
                (strategy) =>
                  strategy.family === family && (strategyCourses(strategy.id, 'sente').length > 0 || strategyCourses(strategy.id, 'gote').length > 0),
              )
              return choices.length ? (
                <optgroup key={family} label={ja ? label.ja : label.en}>
                  {choices.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {ja ? strategy.ja : strategy.en}
                    </option>
                  ))}
                </optgroup>
              ) : null
            })}
          </select>
        </fieldset>
      ))}
    </>
  )
}
