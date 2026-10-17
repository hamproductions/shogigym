import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { moveText } from '@/utils/shogi'
import { useSession } from '@/app/hooks/session'
import { Icon } from '@/app/icons'
import { SideMark } from '@/app/ui/SideMark'
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
import { Select } from '@/app/ui/Select'
import { cx } from '@/app/ui/cx'
import { styled } from 'styled-system/jsx'
import {
  boardFlip,
  controlIcon,
  controlLabel,
  controls,
  evaluation,
  gameSetup,
  helpToggle,
  miniNav,
  miniStep,
  miniWideLabel,
  modeBar,
  resign,
  takeBack,
  tools,
} from './mode-bar.styles'
import { useGlide } from '@/app/hooks/useGlide'
import { engineSupported, restartEngine, useEngineStatus } from '@/utils/engine'
import { FAMILIES, STRATEGIES } from '@/data/strategies'
import { strategyCourses } from '@/utils/book'

type ModeBarProps = {
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
  onOpenGame: () => void
  tsume: Tsume
  tesuji: Tesuji
  lesson: Lesson
  drill: Drill
}

export function ModeBarHeading({
  seal,
  title,
  instruction,
  ply,
  lastMove,
  turn,
  flipped,
  busy,
}: {
  seal: ReactNode
  title: string
  instruction: string
  ply: string
  lastMove?: string
  turn: 'sente' | 'gote'
  flipped?: boolean
  busy?: boolean
}) {
  const { t } = useTranslation()
  const [before, after] = t('app.toMove', { side: '\u0001' }).split('\u0001')
  return (
    <styled.div
      className="app-modebar-heading"
      display="contents"
      _compact={{
        order: '-1',
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        m: 'var(--stage-gutter) var(--stage-gutter) 0',
        p: '1.5',
        borderRadius: 'lg',
        bg: 'overlay',
        boxShadow: 'inset 0 0 0 1px {colors.border}',
        '[data-sheet-up] &': { display: 'none' },
      }}
    >
      <styled.span
        flex="none"
        display="grid"
        placeItems="center"
        minW="48px"
        h="48px"
        p="0 {spacing.2}"
        borderRadius="md"
        bg="var(--mode, {colors.accent})"
        color="mode.ink"
        fontFamily="mincho"
        fontWeight="heavy"
        fontSize="lg"
        letterSpacing="seal"
        _compact={{ minW: '32px', h: '32px', fontSize: 'sm' }}
        _short={{ minW: '30px', h: '30px', fontSize: 'sm' }}
      >
        {seal}
      </styled.span>
      <styled.span flex="1" minW="0" display="flex" flexDirection="column" _compact={{ flex: '1 1 0' }}>
        <styled.strong
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          fontFamily="mincho"
          fontWeight="heavy"
          fontSize="lg"
          lineHeight="snug"
          _compact={{ display: 'block', fontSize: 'sm' }}
          _short={{ fontSize: 'md' }}
        >
          {title}
        </styled.strong>
        <styled.span
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          color="fg.muted"
          fontSize="sm"
          _compact={{ display: 'none' }}
          _short={{ display: 'none' }}
          role="status"
          aria-busy={busy}
        >
          {instruction}
        </styled.span>
      </styled.span>
      <styled.span
        className="app-lastmove"
        flex="none"
        w="9em"
        display="flex"
        flexDirection="column"
        alignItems="flex-end"
        lineHeight="tight"
        _compact={{ gap: '0', w: '8em', ml: 'auto' }}
      >
        <styled.span color="fg.muted" fontSize="2xs" _compact={{ display: 'block' }} _short={{ display: 'none' }}>
          {ply}
        </styled.span>
        <styled.strong
          maxW="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          fontFamily="mincho"
          fontWeight="heavy"
          fontSize="xl"
          color="highlight"
          _compact={{ fontSize: 'md' }}
          _short={{ fontSize: 'md' }}
          title={lastMove}
        >
          {lastMove ?? '\u00a0'}
        </styled.strong>
        <styled.span color="fg.muted" fontSize="xs" _compact={{ display: 'block' }} _short={{ display: 'none' }}>
          {before}
          <SideMark side={turn} flipped={flipped} />
          {after}
        </styled.span>
      </styled.span>
    </styled.div>
  )
}

export function EvalChip({ rate, barShown, flipped }: { rate: number; barShown: boolean; flipped?: boolean }) {
  const { t } = useTranslation()
  const fill = useGlide<HTMLSpanElement>('width', rate * 100)
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      gap="2"
      p="{spacing.1} {spacing.2.5}"
      borderRadius="md"
      bg="surface.2"
      fontSize="sm"
      whiteSpace="nowrap"
      _compact={{ order: '3', flex: '1', h: '28px', p: '{spacing.1} {spacing.2}', '&[data-bar]': { display: 'inline-flex' } }}
      css={{ '&[data-bar]': { display: 'none' } }}
      data-bar={barShown || undefined}
      title={t('app.winChance', { value: Math.round(rate * 100), value2: 100 - Math.round(rate * 100) })}
    >
      <styled.span color="fg.muted" fontSize="xs" _compact={{ display: 'inline' }}>
        {t('app.winChanceShort')}
      </styled.span>
      <styled.span
        position="relative"
        w="160px"
        h="14px"
        borderRadius="full"
        bg="meter.track"
        overflow="hidden"
        _compact={{ flex: '1', w: 'auto', h: '12px' }}
        css={{ '& > span': { position: 'absolute', inset: '0 auto 0 0', bg: 'meter.fill' } }}
      >
        <span ref={fill} style={{ width: `${rate * 100}%` }} />
      </styled.span>
      <styled.b minW="56px" fontSize="md" fontVariantNumeric="tabular-nums" _compact={{ minW: '0' }}>
        <SideMark side={rate >= 0.5 ? 'sente' : 'gote'} flipped={flipped} /> {Math.round(Math.max(rate, 1 - rate) * 100)}%
      </styled.b>
    </styled.span>
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
  onOpenGame,
  tsume,
  tesuji,
  lesson,
  drill,
}: ModeBarProps) {
  const { t } = useTranslation()
  const settings = useSettings()
  const engine = useEngineStatus()
  const unavailable = !engineSupported()
  const ja = settings.lang === 'ja'
  const { mode, course, lastMove, prevSfen, plyBase, preview, cursor, toMove, nav, gameOver, game, flipped } = useSession()
  const seal = !ja ? (
    <Icon name={MODES.find((m) => m.id === mode)!.icon} size={22} />
  ) : mode === 'lesson' && course ? (
    t(lessonMode === 'study' ? 'modes.sealStudy' : 'modes.sealQuiz')
  ) : (
    t(`modes.${mode}.name`)
  )
  return (
    <header className={cx('app-modebar', modeBar({ mode: mode === 'lesson' ? lessonMode : mode }))} data-sheet-up={sheetUp || undefined}>
      <ModeBarHeading
        seal={seal}
        title={title}
        instruction={unavailable ? t('engine.theAiNeedsACross') : engine.error ? engine.error : engine.loading ? t('engine.loadingEngine') : instruction}
        busy={engine.loading}
        ply={
          lastMove && prevSfen
            ? t('app.move', { value: plyBase + (preview ? preview.base + preview.step : cursor) })
            : plyBase > 0
              ? t('app.afterMove', { plyBase })
              : t('app.startPosition')
        }
        lastMove={lastMove && prevSfen ? moveText(prevSfen, lastMove) : undefined}
        turn={toMove}
        flipped={flipped}
      />
      {evalRate !== null && (
        <div className={evaluation}>
          <EvalChip rate={evalRate} barShown={barShown} flipped={flipped} />
        </div>
      )}
      <div className={controls}>
        <div className={tools}>
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
          {unavailable && (
            <Button size="sm" onClick={() => location.reload()}>
              {t('engine.reloadPage')}
            </Button>
          )}
          {mode === 'view' && (
            <>
              <Button
                size="sm"
                onClick={watch.started ? watch.toggle : onWatchSetup}
                disabled={watch.started && !watch.canPlay}
                title={t(!watch.started ? 'newGame.start' : watch.running ? 'watch.pause' : 'watch.resume')}
                aria-label={t(!watch.started ? 'newGame.start' : watch.running ? 'watch.pause' : 'watch.resume')}
              >
                <Icon name={watch.running ? 'pause' : 'play'} size={16} />
                <span className={controlLabel}>{t(!watch.started ? 'newGame.start' : watch.running ? 'watch.pause' : 'watch.resume')}</span>
              </Button>
              <Button size="sm" onClick={watch.restart} title={t('watch.newGame')} aria-label={t('watch.newGame')}>
                <span className={controlIcon}>
                  <Icon name="newGame" size={16} />
                </span>
                <span className={controlLabel}>{t('watch.newGame')}</span>
              </Button>
            </>
          )}
          {(isGameMode(mode) || mode === 'view') && (
            <Button
              size="sm"
              variant="ghost"
              className={helpToggle}
              onClick={() => setSettings({ assist: !settings.assist })}
              title={settings.assist ? t('app.helpIsOnEvalBar') : t('app.noHelpClickToShow')}
              aria-pressed={settings.assist}
              aria-label={settings.assist ? t('app.coachOn') : t('app.coachOff')}
            >
              <span className={controlIcon}>
                <Icon name="coach" />
              </span>
              <span className={controlLabel}>{settings.assist ? t('app.coachOn') : t('app.coachOff')}</span>
            </Button>
          )}
          {mode === 'spar' && game.moves.length > 0 && !gameOver && !spar.resigned && (
            <>
              <Button
                size="sm"
                variant={spar.erred ? 'primary' : 'secondary'}
                className={takeBack}
                onClick={spar.takeBack}
                disabled={spar.lastUserMove < 0}
                title={t('app.takeBackYourLastMove3')}
                aria-label={t('app.takeBack')}
              >
                <span className={controlIcon}>
                  <Icon name="undo" />
                </span>
                <span className={controlLabel}>{t('app.takeBack')}</span>
              </Button>
              <Button size="sm" variant="ghost" className={resign} onClick={spar.confirmResign} title={t('app.resign')} aria-label={t('app.resign')}>
                <span className={controlIcon}>
                  <Icon name="resign" />
                </span>
                <span className={controlLabel}>{t('app.resign')}</span>
              </Button>
            </>
          )}
          {mode === 'lesson' && course && <LessonControls lesson={lesson} />}
          {mode === 'drill' && <ReviewControls drill={drill} />}
          {mode === 'tsume' && <TsumeControls trainer={tsume} />}
          {mode === 'tesuji' && <TesujiControls trainer={tesuji} />}
          {mode === 'analyze' && (
            <Button size="sm" onClick={onOpenGame} title={t('rail.openTitle')} aria-label={t('rail.open')}>
              <span className={controlIcon}>
                <Icon name="import" size={16} />
              </span>
              <span className={controlLabel}>{t('rail.open')}</span>
            </Button>
          )}
          {mode !== 'spar' && mode !== 'view' && mode !== 'tsume' && mode !== 'tesuji' && (
            <Button
              size="sm"
              variant="ghost"
              disabled={game.moves.length === 0}
              onClick={onStartOver}
              title={t('app.startOver')}
              aria-label={t('app.startOver')}
            >
              <Icon name="reset" size={16} />
            </Button>
          )}
          {mode === 'spar' && (
            <Button
              variant={spar.erred ? 'secondary' : 'primary'}
              className={gameSetup}
              onClick={() => spar.setNewGameOpen(true)}
              title={`${STRENGTH[settings.opponent].label} · ${TIME_CONTROLS[settings.timeControl].label}`}
              aria-label={t('newGame.button')}
            >
              <span className={controlIcon}>
                <Icon name="newGame" />
              </span>
              <span className={controlLabel}>{t('newGame.button')}</span>
            </Button>
          )}
          <Button size="sm" variant="ghost" className={boardFlip} onClick={onFlip} title={t('app.flipTheBoardF')} aria-label={t('app.flip')}>
            <Icon name="flip" size={16} />
          </Button>
        </div>
        <div className={miniNav} data-panel-open={!panelHidden || undefined}>
          <Button size="sm" className={miniStep} onClick={nav.back} disabled={!nav.canBack} title={t('app.back')} aria-label={t('app.back2')}>
            <Icon name="prev" size={16} />
          </Button>
          <Button size="sm" className={miniStep} onClick={nav.forward} disabled={!nav.canForward} title={t('app.forward')} aria-label={t('app.forward2')}>
            <Icon name="next" size={16} />
          </Button>
          <Button
            size="sm"
            onClick={() => onPanel(!panelHidden)}
            title={t(panelHidden ? 'app.showThePanelP' : 'app.boardOnlyHideThePanel')}
            aria-label={t(panelHidden ? 'app.showThePanel' : 'app.hideThePanel')}
          >
            <Icon name="panel" size={16} />
            <span className={miniWideLabel}>{t(panelHidden ? 'app.panel' : 'app.hidePanel')}</span>
          </Button>
        </div>
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
        <styled.div
          key={index}
          display="flex"
          alignItems="center"
          gap="1"
          color="fg.muted"
          fontSize="xs"
          css={{
            '& + &': { mt: '3' },
            '& [data-scope=select][data-part=root]': { w: 'auto' },
            '& [data-scope=select][data-part=trigger]': { maxW: '200px', fontSize: 'xs' },
          }}
          role="group"
          aria-label={watch.name(index)}
        >
          <span>
            {watch.name(index)}
            {watch.side(index) && ` · ${t(`common.${watch.side(index)}`)}`}
          </span>
          <Select
            portal={false}
            label={t('watch.difficulty', { bot: watch.name(index) })}
            value={strength}
            options={(Object.entries(STRENGTH) as [AiStrength, (typeof STRENGTH)[AiStrength]][]).map(([id, level]) => ({ value: id, label: level.label }))}
            onChange={(value) => watch.setBot(index, value as AiStrength)}
          />
          <Select
            portal={false}
            label={t('watch.strategy', { bot: watch.name(index) })}
            value={watch.strategies[index]}
            options={[
              { value: 'random', label: t('app.randomStrategy') },
              { value: '', label: t('app.noStrategy') },
            ]}
            groups={Object.entries(FAMILIES).flatMap(([family, label]) => {
              const choices = STRATEGIES.filter(
                (strategy) =>
                  strategy.family === family && (strategyCourses(strategy.id, 'sente').length > 0 || strategyCourses(strategy.id, 'gote').length > 0),
              )
              return choices.length
                ? [{ label: ja ? label.ja : label.en, options: choices.map((strategy) => ({ value: strategy.id, label: ja ? strategy.ja : strategy.en })) }]
                : []
            })}
            onChange={(value) => watch.setStrategy(index, value)}
          />
        </styled.div>
      ))}
    </>
  )
}
