import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/app/ui/Button'
import { FilePicker } from '@/app/ui/FilePicker'
import { Rail } from '@/app/rail/Rail'
import { SettingsDialog } from '@/app/dialogs/SettingsDialog'
import { Palette } from '@/app/dialogs/Palette'
import { FloatingPanel, SidePanel } from '@/app/panels/SidePanels'
import { MoveNavigation } from '@/app/panels/NavFooter'
import { MoveRows } from '@/app/panels/MovesPane'
import { EvalGraph } from '@/app/panels/EvalGraph'
import { EngineResultPane } from '@/app/panels/EnginePane'
import { clock as clockStyle, moveButton, moveCounts, panelBody, panelClose, panelHeader, pinnedGraph, plate, plateSide } from '@/app/panels/panels.styles'
import { EvalBar } from '@/app/stage/EvalBar'
import { winRate } from '@/utils/analysis'
import { squareName } from '@/utils/notation'
import { EvalChip, ModeBarHeading } from '@/app/stage/ModeBar'
import { controlIcon, controlLabel, controls, evaluation, helpToggle, miniNav, miniWideLabel, modeBar, takeBack, tools } from '@/app/stage/mode-bar.styles'
import { boardScene, boardWrap, fsExit, stage } from '@/app/stage/stage.styles'
import { useLayout } from '@/app/hooks/useLayout'
import { appShell, shellBase } from '@/app/layout.styles'
import { useView } from '@/app/hooks/useView'
import { useMovePlayback } from '@/app/hooks/useAutoplay'
import { Tabs } from '@/app/ui/Tabs'
import { Text } from '@/components/ui'
import { Wrap } from 'styled-system/jsx'
import { Icon } from '@/app/icons'
import { Segmented } from '@/app/ui/Segmented'
import { cx } from '@/app/ui/cx'
import { gameOver } from '@/app/modes/spar/game-over.styles'
import { setSettings, useSettings } from '@/appearance/settings'
import { TaikyokuBoard, keyOf, type BoardHandle, type TargetKind } from './TaikyokuBoard'
import { TaikyokuBoard3D } from './TaikyokuBoard3D'
import { MovementGuide } from './MovementGuide'
import { catalog, cellAt, same, type EngineMove, type Pos } from './notation'
import { PLY_LIMIT, useTaikyoku, type LogEntry, type Strength, type TimelineEntry } from './useTaikyoku'
import {
  buttons,
  cameraHint,
  choice as choiceStyle,
  loading,
  notation,
  pane,
  row,
  scene,
  setting,
  setup as setupStyle,
  shell,
  victory,
} from './taikyoku.styles'

function webglSupported() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

const gameOverStyles = gameOver()

export function TaikyokuPage({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const { lang, assist } = useSettings()
  const board = useRef<BoardHandle>(null)
  const [selected, setSelected] = useState<Pos | null>(null)
  const [inspected, setInspected] = useState<Pos | null>(null)
  const [view, setView] = useState<'3d' | 'map'>(() => (webglSupported() ? '3d' : 'map'))
  const [setup, setSetup] = useState<{ done: number; total: number } | null>(null)
  const [boardError, setBoardError] = useState('')
  const layout = useLayout({ mode: 'taikyoku', needsPicking: false, welcome: false })
  const panelOpen = !layout.panelHidden
  const setPanelOpen = (open: boolean) => layout.setPanel({ hidden: !open })
  const [tab, setTab] = useState<'coach' | 'engine' | 'moves'>('coach')
  const rightTab = layout.twoPanels && tab === 'moves' ? 'coach' : tab
  const hud = useView()
  const { showControl, setShowControl } = hud
  const [showSettings, setShowSettings] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [playing, setPlaying] = useState(false)
  const restoreStarted = useRef(false)
  const [storageReady, setStorageReady] = useState(false)
  const [stateError, setStateError] = useState('')
  const [showBest, setShowBest] = useState(true)
  const [route, setRoute] = useState<EngineMove | null>(null)
  const [choice, setChoice] = useState<{ to: Pos; options: EngineMove[] } | null>(null)

  const pieceName = useCallback(
    (key: string) => {
      const info = catalog[key]
      return info ? (lang === 'ja' ? info.k || key : info.n) : key
    },
    [lang],
  )

  const onEvent = useCallback((entry?: Omit<LogEntry, 'text'>) => {
    if (!entry || entry.ply === 0) {
      setSelected(null)
      setInspected(null)
      setRoute(null)
    }
    setChoice(null)
  }, [])

  const {
    timeline,
    timelineEntries,
    cursor,
    seek,
    game,
    thinking,
    score,
    auto,
    setAuto,
    strength,
    setStrength,
    winner,
    error,
    play,
    undo,
    reset,
    engineMove,
    analysis,
    evaluations,
    restoring,
    exportState,
    importState,
  } = useTaikyoku(onEvent, assist)
  const trackedGame = useRef(game)
  useEffect(() => {
    if (!game || trackedGame.current === game) return
    trackedGame.current = game
    const follow = (pos: Pos | null) => {
      if (!pos) return null
      const destination = game.previous && game.last && same(pos, game.last.from) ? game.last.to : pos
      const before = game.previous ? cellAt(game.previous.grid, pos) : null
      const after = cellAt(game.snap.grid, destination)
      return after && (!before || before.side === after.side) ? destination : null
    }
    setSelected(follow)
    setInspected((pos) => {
      if (pos && game.previous && !cellAt(game.previous.grid, pos)) return pos
      return follow(pos)
    })
    setRoute((current) => (current && game.last && same(current.from, game.last.from) ? null : current))
  }, [game])

  useEffect(() => {
    if (!game || restoreStarted.current) return
    restoreStarted.current = true
    let saved: unknown
    try {
      const text = localStorage.getItem('joseki-practice:taikyoku:v1')
      if (text) saved = JSON.parse(text)
    } catch {
      setStateError(t('taikyoku.state.invalid'))
    }
    if (!saved) return setStorageReady(true)
    void importState(saved).then((valid) => {
      if (!valid) setStateError(t('taikyoku.state.invalid'))
      setStorageReady(valid)
    })
  }, [game, importState, t])

  useEffect(() => {
    if (!storageReady || !game || restoring || thinking) return
    try {
      localStorage.setItem('joseki-practice:taikyoku:v1', JSON.stringify(exportState()))
    } catch {
      setStateError(t('games.couldNotSaveBrowserStorage'))
    }
  }, [storageReady, game, restoring, thinking, exportState, t])

  const saveState = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(exportState(), null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `taikyoku-${new Date().toISOString().replaceAll(':', '-')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const humanTurn = !!game && !error && game.moves.length < PLY_LIMIT && !winner && !auto && !thinking && game.snap.turn === 'b'
  const playableFocus = selected ?? inspected

  // legal moves of the selected piece, grouped by the square the player taps
  const byTarget = useMemo(() => {
    const map = new Map<string, EngineMove[]>()
    if (!game || !playableFocus || !humanTurn) return map
    for (const m of game.legal) {
      if (!same(m.from, playableFocus)) continue
      const stays = same(m.from, m.to)
      if (stays && !(m.mid && cellAt(game.snap.grid, m.mid))) continue // jitto: the pass button
      const at = stays && m.mid ? m.mid : m.to
      const key = keyOf(at)
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return map
  }, [game, playableFocus, humanTurn])

  const jitto = useMemo(
    () =>
      game && playableFocus && humanTurn
        ? game.legal.find((m) => same(m.from, playableFocus) && same(m.to, playableFocus) && !(m.mid && cellAt(game.snap.grid, m.mid)))
        : undefined,
    [game, playableFocus, humanTurn],
  )

  const targets = useMemo(() => {
    const map = new Map<string, TargetKind>()
    if (!game) return map
    byTarget.forEach((_, key) => {
      const [file, rank] = key.split(',').map(Number)
      map.set(key, cellAt(game.snap.grid, { file, rank }) ? 'capture' : 'step')
    })
    const focus = selected ?? inspected
    const cell = focus ? cellAt(game.snap.grid, focus) : null
    if (focus && cell && !selected) {
      for (const move of game.sideMoves[cell.side]) {
        if (!same(move.from, focus)) continue
        const target = same(move.from, move.to) ? move.mid : move.to
        if (target) map.set(keyOf(target), cellAt(game.snap.grid, target) ? 'capture' : 'step')
      }
    }
    if (route && focus && same(route.from, focus)) {
      if (route.mid) map.set(keyOf(route.mid), 'via')
      if (!same(route.from, route.to)) map.set(keyOf(route.to), cellAt(game.snap.grid, route.to) ? 'capture' : 'step')
    }
    choice?.options.forEach((m) => {
      if (m.mid && !same(m.mid, choice.to)) map.set(keyOf(m.mid), 'via')
    })
    return map
  }, [game, byTarget, choice, selected, inspected, route])

  const commit = useCallback(
    (move: EngineMove) => {
      setSelected(null)
      setInspected(move.from)
      setChoice(null)
      play(move)
    },
    [play],
  )

  const onCell = useCallback(
    (pos: Pos) => {
      if (!game) return
      const focus = selected ?? inspected
      if (focus && same(pos, focus)) {
        setSelected(null)
        setInspected(null)
        setChoice(null)
        setRoute(null)
        return
      }
      const piece = cellAt(game.snap.grid, pos)
      if (humanTurn) {
        const options = byTarget.get(keyOf(pos))
        if (options?.length === 1) return commit(options[0])
        if (options) return setChoice({ to: pos, options })
      }
      if (inspected && !same(pos, inspected)) {
        const from = cellAt(game.snap.grid, inspected)
        const preview = from && game.sideMoves[from.side].find((move) => same(move.from, inspected) && same(move.to, pos))
        if (preview) return setRoute(preview)
      }
      setChoice(null)
      setRoute(null)
      setTab('coach')
      setPanelOpen(true)
      if (piece?.side === 'b') {
        setSelected(pos)
        setInspected(null)
        return
      }
      setSelected(null)
      setInspected(pos)
    },
    [game, humanTurn, selected, inspected, byTarget, commit],
  )

  const focusPos = selected ?? inspected
  const focusCell = game && focusPos ? cellAt(game.snap.grid, focusPos) : null
  const info = focusCell ? catalog[focusCell.key] : null
  const promoted = info?.p ? catalog[info.p] : null
  const coverage = game && focusPos ? game.control.get(keyOf(focusPos)) : null
  const peekTargets = useMemo(() => {
    if (!game || !focusPos || !focusCell) return []
    return [...game.control].flatMap(([key, cell]) => {
      if (!cell[focusCell.side].some((from) => same(from, focusPos))) return []
      const [file, rank] = key.split(',').map(Number)
      return [{ file, rank }]
    })
  }, [game, focusPos, focusCell])
  const arrows = useMemo(() => {
    if (route && focusPos && same(route.from, focusPos)) return [{ move: route, color: '#c8442f' }]
    if (inspected && !focusCell) {
      return (['b', 'w'] as const).flatMap((side) =>
        (coverage?.[side] ?? []).map((from) => ({
          move: { from, to: inspected, mid: null, promote: false, text: '' },
          color: side === 'b' ? '#1f7ae0' : '#d2402a',
        })),
      )
    }
    return assist && showBest && !winner && analysis ? [{ move: analysis.bestmove, color: '#c8442f', label: t('app.best') }] : []
  }, [route, focusPos, inspected, focusCell, coverage, assist, showBest, winner, analysis, t])

  const optionLabel = (m: EngineMove) => {
    const base = same(m.from, m.to) ? t('taikyoku.opt.igui') : m.mid ? t('taikyoku.opt.via', { square: squareName(m.mid) }) : t('taikyoku.opt.move')
    return m.promote ? `${base} · ${t('taikyoku.opt.promote')}` : base
  }

  const status = (() => {
    if (error) return t('taikyoku.status.error')
    if (!game) return t('taikyoku.status.loading')
    if (winner) return t('taikyoku.status.won', { who: t(winner === 'b' ? 'taikyoku.sente' : 'taikyoku.gote') })
    if (game.moves.length >= PLY_LIMIT) return t('taikyoku.status.limit')
    if (!game.legal.length) return t('taikyoku.status.noLegal')
    if (thinking) return t('taikyoku.status.thinking')
    if (auto) return t('taikyoku.status.auto')
    return t(game.snap.turn === 'b' ? 'taikyoku.status.yourMove' : 'taikyoku.status.paused')
  })()

  const royals = useMemo(() => {
    if (!game) return []
    return game.snap.grid.flatMap((row, rank) =>
      row.flatMap((cell, file) => (cell && catalog[cell.key]?.r ? [{ cell, pos: { file: file + 1, rank: rank + 1 } }] : [])),
    )
  }, [game])

  const navigate = (index: number) => {
    setPlaying(false)
    setSelected(null)
    setInspected(null)
    setChoice(null)
    seek(index)
  }
  const playbackStep = useCallback(() => seek(cursor + 1, true), [seek, cursor])
  const stopPlayback = useCallback(() => setPlaying(false), [])
  useMovePlayback(playing, !thinking, cursor < timeline.length, playbackStep, stopPlayback, cursor)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowPalette((open) => !open)
        return
      }
      if (showPalette || showSettings || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]'))) return
      if (event.key === ' ') {
        event.preventDefault()
        if (playing || cursor < timeline.length) setPlaying(!playing)
      } else if (event.key === 'ArrowLeft') navigate(cursor - 1)
      else if (event.key === 'ArrowRight') navigate(cursor + 1)
      else if (event.key === 'Home') navigate(0)
      else if (event.key === 'End') navigate(timeline.length)
      else if (event.key === 'p') layout.togglePanel()
      else if (event.key === 'c' && !event.metaKey && !event.ctrlKey) setShowControl(!showControl)
      else if (event.key === 'Escape') {
        setSelected(null)
        setInspected(null)
        setChoice(null)
        setPlaying(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const cp = score?.cp ?? 0
  const evalRate = winner ? (winner === 'b' ? 1 : 0) : winRate(cp)
  const evalBar = assist && !hud.hideUi
  const plies = game?.moves.length ?? 0
  const formatEntry = (entry: TimelineEntry, previous?: EngineMove, compact = false) => {
    const { move, piece, side } = entry
    const destination = previous && same(previous.to, move.to) ? '同' : squareName(move.to)
    const via = move.mid ? ` (${squareName(move.from)} → ${squareName(move.mid)} → ${squareName(move.to)})` : ` (${squareName(move.from)})`
    return `${side === 'b' ? '☗' : '☖'}${destination}${catalog[piece.key]?.k || piece.key}${move.promote ? '成' : ''}${compact ? '' : via}`
  }
  const moveLabel = (index: number) => (timelineEntries[index] ? formatEntry(timelineEntries[index], timelineEntries[index - 1]?.move) : '')

  const movesPane = (
    <>
      {assist && timeline.length > 0 && (
        <div className={pinnedGraph}>
          <EvalGraph values={evaluations} labels={[]} ply={cursor} onJump={navigate} />
        </div>
      )}
      <div className={cx('app-panel-body', panelBody)}>
        <Wrap gap="2" align="center">
          <Button size="sm" onClick={saveState} disabled={!game || restoring} title={t('games.saveGame')}>
            {t('games.saveGame')}
          </Button>
          <FilePicker
            size="sm"
            accept=".json,application/json"
            disabled={!game || restoring || thinking}
            onFile={async (file) => {
              setPlaying(false)
              try {
                const valid = await importState(JSON.parse(await file.text()))
                setStateError(valid ? '' : t('taikyoku.state.invalid'))
                if (valid) {
                  onEvent()
                  setStorageReady(true)
                }
              } catch {
                setStateError(t('taikyoku.state.invalid'))
              }
            }}
          >
            {t('games.loadAGame')}
          </FilePicker>
        </Wrap>
        {stateError && (
          <Text role="alert" tone="muted" size="sm" my="1em">
            {stateError}
          </Text>
        )}
        {restoring && (
          <Text role="status" tone="muted" size="sm" my="1em">
            {t('taikyoku.state.loading')}
          </Text>
        )}
        {timeline.length ? (
          <MoveRows
            count={timeline.length}
            title={t('taikyoku.history')}
            cell={(index) => (
              <div key={index}>
                <button className={moveButton} onClick={() => navigate(index + 1)} aria-current={cursor === index + 1 ? 'step' : undefined}>
                  <span className={notation}>{moveLabel(index)}</span>
                </button>
              </div>
            )}
          />
        ) : (
          <Text tone="muted" size="sm" my="1em">
            {t('moves.noMovesYetPlayOn')}
          </Text>
        )}
      </div>
    </>
  )

  return (
    <div
      className={cx('app-shell', shellBase, appShell, shell)}
      data-zoned={layout.zoned || undefined}
      data-panel-hidden={!panelOpen || undefined}
      data-drawer-open={(layout.compact && layout.drawer) || undefined}
      data-sheet-set={!!layout.sheetH || undefined}
      data-fs={hud.hideUi || undefined}
      style={{ ['--panel-w' as string]: `${layout.panelWidth}px`, ['--sheet-h' as string]: layout.sheetH ?? undefined }}
    >
      <Rail
        mode={auto ? 'view' : 'spar'}
        onMode={onBack}
        navigation={false}
        onBack={onBack}
        backLabel={t('taikyoku.back')}
        compact={layout.compact}
        view={hud}
        settingsOpen={showSettings}
        onSettings={() => setShowSettings(true)}
        onPalette={() => setShowPalette(true)}
        snapshotName="taikyoku"
        tools={[
          {
            id: 'view',
            icon: 'tilt',
            label: view === '3d' ? '3D' : '2D',
            run: () => {
              setSetup(null)
              setBoardError('')
              setView(view === '3d' ? 'map' : '3d')
            },
          },
          { id: 'fit', icon: 'orbit', label: t('taikyoku.zoom.fit'), run: () => board.current?.fit() },
          { id: 'mine', icon: 'spar', label: t('taikyoku.zoom.mine'), run: () => board.current?.focus({ file: 18, rank: 6 }, 22) },
          { id: 'last', icon: 'orbit', label: t('taikyoku.zoom.last'), disabled: !game?.last, run: () => game?.last && board.current?.focus(game.last.to, 44) },
          { id: 'settings', icon: 'gear', label: t('rail.settings'), on: showSettings, run: () => setShowSettings(true) },
          { id: 'hide', icon: 'panel', label: t('app.hideUiShort'), run: () => hud.setHideUi(true) },
          ...(document.fullscreenEnabled
            ? [
                {
                  id: 'fullscreen',
                  icon: hud.fullscreen ? ('exitFullscreen' as const) : ('fullscreen' as const),
                  label: t('app.fullScreen2'),
                  on: hud.fullscreen,
                  run: hud.toggleFullscreen,
                },
              ]
            : []),
        ]}
      />
      <section className={cx('app-stage', stage)}>
        <header className={cx('app-modebar', modeBar({ mode: auto ? 'view' : 'spar' }))} data-sheet-up={(layout.compact && layout.drawer) || undefined}>
          <ModeBarHeading
            seal={lang === 'ja' ? auto ? '観戦' : '対局' : <Icon name={auto ? 'flow' : 'spar'} />}
            title={lang === 'ja' ? '大局将棋' : 'Taikyoku shogi'}
            instruction={status}
            busy={thinking || restoring || !game}
            ply={t('taikyoku.ply', { n: plies })}
            lastMove={plies && timelineEntries[plies - 1] ? formatEntry(timelineEntries[plies - 1], timelineEntries[plies - 2]?.move, true) : undefined}
            turn={game?.snap.turn === 'w' ? 'gote' : 'sente'}
          />
          {assist && (
            <div className={evaluation}>
              <EvalChip rate={evalRate} barShown={evalBar} />
            </div>
          )}
          <div className={controls}>
            {' '}
            <div className={tools}>
              <Button
                size="sm"
                variant="ghost"
                className={helpToggle}
                onClick={() => setSettings({ assist: !assist })}
                title={assist ? t('app.helpIsOnEvalBar') : t('app.noHelpClickToShow')}
                aria-pressed={assist}
                aria-label={assist ? t('app.coachOn') : t('app.coachOff')}
              >
                <span className={controlIcon}>
                  <Icon name="coach" />
                </span>
                <span className={controlLabel}>{assist ? t('app.coachOn') : t('app.coachOff')}</span>
              </Button>
              <Button size="sm" variant="primary" onClick={reset}>
                <Icon name="newGame" /> <span className={controlLabel}>{t('taikyoku.new')}</span>
              </Button>
              {plies > 0 && (
                <Button size="sm" className={takeBack} onClick={undo} disabled={auto}>
                  <Icon name="undo" /> <span className={controlLabel}>{t('taikyoku.undo')}</span>
                </Button>
              )}
            </div>
            <div className={miniNav} data-panel-open={panelOpen || undefined}>
              <Button size="sm" onClick={layout.togglePanel} title={t(panelOpen ? 'app.hideThePanel' : 'app.showThePanel')}>
                <Icon name="panel" size={16} />
                <span className={miniWideLabel}>{t(panelOpen ? 'app.hidePanel' : 'app.panel')}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className={cx('app-board-wrap', boardWrap)} data-eval={evalBar || undefined}>
          {evalBar && <EvalBar rate={evalRate} flipped={false} />}
          <section className={cx('app-board-scene', boardScene, scene)} aria-label={t('taikyoku.board')}>
            {game && view === '3d' && (
              <TaikyokuBoard3D
                ref={board}
                snap={game.snap}
                selected={selected}
                inspected={inspected}
                arrows={arrows}
                peekTargets={peekTargets}
                targets={targets}
                captures={game.captures}
                onZones={layout.setZones}
                sideRoom={0}
                control={game.control}
                showControl={showControl}
                animate={game.animate}
                last={game.last}
                onCell={onCell}
                onProgress={(done, total) => setSetup(done >= total ? null : { done, total })}
              />
            )}
            {game && view === 'map' && (
              <TaikyokuBoard
                ref={board}
                snap={game.snap}
                selected={selected}
                inspected={inspected}
                arrows={arrows}
                peekTargets={peekTargets}
                targets={targets}
                control={game.control}
                showControl={showControl}
                animate={game.animate}
                last={game.last}
                lang={lang === 'ja' ? 'ja' : 'en'}
                onCell={onCell}
                onProgress={(done, total) => setSetup(done >= total ? null : { done, total })}
                onError={setBoardError}
              />
            )}
            {game &&
              (['w', 'b'] as const).map((side) => (
                <div key={side} className={cx('app-plate', side === 'w' ? 'top' : 'bottom', plate)}>
                  <span className={clockStyle({ state: game.snap.turn === side ? 'on' : 'idle' })}>
                    {side === 'b' ? '☗' : '☖'} {game.snap.counts[side]}
                  </span>
                  <span className={plateSide}>{t(side === 'b' ? 'taikyoku.sente' : 'taikyoku.gote')}</span>
                  <Text as="span" tone="muted" size="sm">
                    {t('taikyoku.royal')} × {game.snap.royals[side]}
                  </Text>
                </div>
              ))}
            {winner && (
              <div className={gameOverStyles.root} role="status">
                <strong className={gameOverStyles.headline}>{status}</strong>
                <Button onClick={reset}>{t('taikyoku.new')}</Button>
              </div>
            )}
            {view === '3d' && <div className={cameraHint}>{t('taikyoku.camera')}</div>}
            {setup && (
              <div className={setupStyle} role="status">
                {t('taikyoku.setup', { done: setup.done, total: setup.total })}
              </div>
            )}
            {!game && !error && <div className={loading}>{t('taikyoku.status.loading')}</div>}
            {boardError && (
              <div className={loading} role="alert">
                {boardError}
              </div>
            )}
            {choice && (
              <div className={choiceStyle} role="group" aria-label={t('taikyoku.opt.title')}>
                <span>{t('taikyoku.opt.title')}</span>
                {choice.options.map((m) => (
                  <Button key={m.text} onClick={() => commit(m)}>
                    {optionLabel(m)}
                  </Button>
                ))}
                <Button variant="ghost" onClick={() => setChoice(null)}>
                  {t('taikyoku.opt.cancel')}
                </Button>
              </div>
            )}
          </section>
        </div>
        <button className={cx('app-fs-exit', fsExit)} onClick={() => hud.setHideUi(false)}>
          <Icon name="panel" /> {t('taikyoku.hud')}
        </button>
      </section>
      {layout.twoPanels && layout.zones && (
        <FloatingPanel
          zone={layout.zones.under}
          header={
            <Tabs
              value="moves"
              onChange={() => setTab('moves')}
              items={[{ id: 'moves', label: <span className={lang === 'ja' ? 'app-ja' : 'app-en'}>{t('tabs.moves')}</span> }]}
            />
          }
        >
          {movesPane}
        </FloatingPanel>
      )}
      <SidePanel
        layout={layout}
        sheetOpen={layout.sheetOpen ?? true}
        header={
          <div className={panelHeader}>
            <Tabs
              value={rightTab}
              onChange={setTab}
              items={[
                { id: 'coach', label: <span className={lang === 'ja' ? 'app-ja' : 'app-en'}>{t('tabs.coach')}</span> },
                { id: 'engine', label: <span className={lang === 'ja' ? 'app-ja' : 'app-en'}>{t('tabs.engine')}</span> },
                ...(!layout.twoPanels ? [{ id: 'moves' as const, label: t('tabs.moves') }] : []),
              ]}
            />
            {!layout.compact && (!layout.panelSide || layout.floatingAvailable) && (
              <Button
                variant="icon"
                className="app-panel-dock"
                onClick={layout.togglePanelSide}
                title={t(layout.panelSide ? 'app.floatPanel' : 'app.dockPanelSide')}
                aria-label={t(layout.panelSide ? 'app.floatPanel' : 'app.dockPanelSide')}
              >
                <Icon name={layout.panelSide ? 'floating' : 'panel'} />
              </Button>
            )}
            {!layout.compact && (
              <Button
                variant="icon"
                className={panelClose}
                onClick={() => setPanelOpen(false)}
                title={t('app.closeThePanelP')}
                aria-label={t('app.closeThePanel')}
              >
                <Icon name="close" />
              </Button>
            )}
          </div>
        }
        footer={
          <MoveNavigation
            first={() => navigate(0)}
            back={() => navigate(cursor - 1)}
            forward={() => navigate(cursor + 1)}
            last={() => navigate(timeline.length)}
            canBack={!!cursor && !thinking}
            canForward={cursor < timeline.length && !thinking}
            running={playing}
            canPlay={playing || cursor < timeline.length}
            toggle={() => setPlaying(!playing)}
            playTitle={t(playing ? 'app.pauseSpace' : 'app.playTheLineForwardSpace')}
          />
        }
      >
        {!layout.twoPanels && rightTab === 'moves' && movesPane}
        <div className={cx('app-panel-body', panelBody, pane)} hidden={rightTab === 'moves'}>
          <div className={pane} hidden={rightTab !== 'coach'}>
            {game && (
              <div className={cx(moveCounts, victory)}>
                <b>{t('taikyoku.victory.title')}</b>
                <Text tone="muted" size="sm">
                  {t('taikyoku.victory.rule')}
                </Text>
                <div className={row}>
                  <span>
                    ☗ {t('taikyoku.sente')}: <b>{game.snap.royals.b}</b>
                  </span>
                  <span>
                    ☖ {t('taikyoku.gote')}: <b>{game.snap.royals.w}</b>
                  </span>
                </div>
                <div className={buttons}>
                  {royals.map(({ cell, pos }) => (
                    <Button
                      key={keyOf(pos)}
                      onClick={() => {
                        setSelected(null)
                        setChoice(null)
                        setInspected(pos)
                        board.current?.focus(pos, 44)
                      }}
                    >
                      {cell.side === 'b' ? '☗' : '☖'} {pieceName(cell.key)} · {squareName(pos)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={pane} hidden={rightTab !== 'coach'}>
            <div>
              {info && focusCell ? (
                <>
                  <div>
                    <b>{lang === 'ja' ? info.k || info.n : info.n}</b>
                    <Text as="div" tone="muted" size="sm">
                      {lang === 'ja' ? info.n : info.k} · {squareName(focusPos!)} · {t(focusCell.side === 'b' ? 'taikyoku.sente' : 'taikyoku.gote')}
                    </Text>
                    <Text as="div" tone="muted" size="sm">
                      {promoted ? t('taikyoku.promotesTo', { piece: lang === 'ja' ? promoted.k || promoted.n : promoted.n }) : t('taikyoku.noPromotion')}
                      {info.r ? ` · ${t('taikyoku.royal')}` : ''}
                    </Text>
                  </div>
                </>
              ) : (
                <Text as="span" tone="muted" size="sm">
                  {t('taikyoku.hint')}
                </Text>
              )}
              {jitto && (
                <Button onClick={() => commit(jitto)} title={t('taikyoku.jittoHint')}>
                  {t('taikyoku.jitto')}
                </Button>
              )}
            </div>
            {focusPos && (
              <section className={moveCounts}>
                <h3>
                  {squareName(focusPos)} · {t('rail.control')}
                </h3>
                {(['b', 'w'] as const).map((side) => (
                  <div key={side}>
                    <strong>
                      {t(side === 'b' ? 'taikyoku.sente' : 'taikyoku.gote')} · {coverage?.[side].length ?? 0}
                    </strong>
                    <div className={buttons}>
                      {coverage?.[side].map((pos) => {
                        const cell = cellAt(game!.snap.grid, pos)
                        return (
                          <Button
                            key={keyOf(pos)}
                            size="sm"
                            onClick={() => {
                              setSelected(null)
                              setChoice(null)
                              setRoute(null)
                              setInspected(pos)
                              board.current?.focus(pos, 44)
                            }}
                          >
                            {cell ? pieceName(cell.key) : ''} · {squareName(pos)}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </section>
            )}
            {focusCell && (
              <section className={moveCounts}>
                <h3>{t('taikyoku.movement')}</h3>
                <MovementGuide cell={focusCell!} lang={lang} />
                {route && (
                  <Text role="status" aria-live="polite" tone="muted" size="sm" my="1em">
                    {pieceName(focusCell!.key)} · {squareName(route.from)} → {route.mid ? `${squareName(route.mid)} → ` : ''}
                    {squareName(route.to)} · {optionLabel(route)}
                  </Text>
                )}
              </section>
            )}
          </div>
          <div className={pane} hidden={rightTab !== 'engine'}>
            <Wrap gap="2" align="center">
              <Button size="sm" onClick={engineMove} disabled={!game || thinking || auto || !!winner || plies >= PLY_LIMIT || !game?.legal.length || !!error}>
                <Icon name="engine" /> <span>{t('taikyoku.engineMove')}</span>
              </Button>
              <Button size="sm" on={auto} onClick={() => setAuto(!auto)} disabled={!!winner || !game || plies >= PLY_LIMIT || !game?.legal.length || !!error}>
                <Icon name={auto ? 'pause' : 'play'} /> <span>{auto ? t('taikyoku.auto.stop') : t('taikyoku.auto.start')}</span>
              </Button>
            </Wrap>
            <div className={setting}>
              <span>{t('taikyoku.strength.label')}</span>
              <Segmented<Strength>
                value={strength}
                onChange={setStrength}
                label={t('taikyoku.strength.label')}
                options={[
                  { v: 'nap', t: t('taikyoku.strength.nap') },
                  { v: 'normal', t: t('taikyoku.strength.normal') },
                  { v: 'deep', t: t('taikyoku.strength.deep') },
                ]}
              />
            </div>

            {score && (
              <Text tone="muted" size="sm" my="1em">
                {t('taikyoku.eval', { cp: `${cp > 0 ? '+' : ''}${cp}`, depth: score.depth })}
              </Text>
            )}
            {assist && analysis && game && (
              <EngineResultPane
                analysis={{
                  bestmove: analysis.bestmove.text,
                  candidates: [
                    {
                      multipv: 1,
                      move: analysis.bestmove.text,
                      pv: analysis.pv.map((move) => move.text),
                      score: { cp: game.snap.turn === 'b' ? analysis.score.cp : -analysis.score.cp },
                      depth: analysis.score.depth,
                    },
                  ],
                }}
                toMove={game.snap.turn === 'b' ? 'sente' : 'gote'}
                showBest={showBest}
                setShowBest={setShowBest}
                canPlay={humanTurn}
                onPlay={() => commit(analysis.bestmove)}
                name={
                  <Text tone="muted" size="sm" my="1em">
                    TaikyokuShogi-Stockfish
                  </Text>
                }
                formatMove={() =>
                  formatEntry({ move: analysis.bestmove, piece: cellAt(game.snap.grid, analysis.bestmove.from)!, side: game.snap.turn }, game.last ?? undefined)
                }
                formatPv={() =>
                  (analysis.entries ?? []).map((entry, index) => formatEntry(entry, analysis.entries?.[index - 1]?.move ?? game.last ?? undefined)).join(' → ')
                }
              />
            )}
          </div>
        </div>
      </SidePanel>
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} availableTabs={['general', 'pieces', 'about']} customFace />}
      {showPalette && (
        <Palette
          onClose={() => setShowPalette(false)}
          commands={(query) =>
            [
              { id: 'new', label: t('taikyoku.new'), run: reset },
              { id: 'back', label: t('taikyoku.back'), run: onBack },
              { id: 'engine', label: t('taikyoku.engineMove'), run: engineMove },
              { id: 'settings', label: t('rail.settings'), run: () => setShowSettings(true) },
              { id: 'fit', label: t('taikyoku.zoom.fit'), run: () => board.current?.fit() },
              ...(humanTurn
                ? game!.legal.map((move) => ({
                    id: move.text,
                    label: `${pieceName(cellAt(game!.snap.grid, move.from)!.key)} ${squareName(move.from)} → ${squareName(move.to)}`,
                    hint: move.text,
                    run: () => commit(move),
                  }))
                : []),
            ]
              .filter((command) => `${command.label} ${'hint' in command ? command.hint : ''}`.toLowerCase().includes(query.trim().toLowerCase()))
              .slice(0, 12)
          }
        />
      )}
    </div>
  )
}
