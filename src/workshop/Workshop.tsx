import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Color, InitialPositionSFEN, PieceType, Position, Square, parseMoves, type Move } from 'tsshogi'
import '@fontsource/shippori-mincho-b1/800.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/500.css'
import '@fontsource/zen-kaku-gothic-new/700.css'
import './workshop.css'
import { Board2D } from './Board2D'
import { Board3D, sideStandsFit, type BoardArrow, type StandZones as StandZonesRect } from './Board3D'
import { Icon, type IconName } from './icons'
import { PIECE_INFO, PieceGuide, moveGloss, sees } from './pieces'
import { allEvals, cachedReview, rememberEval, rememberReview } from './memory'
import { PieceViewer } from './PieceViewer'
import { detectTesuji, type Tesuji } from './tesuji'
import { TESUJI_KINDS, TESUJI_DRILLS, markTesuji, pickTesuji, tesujiStats, type TesujiDrill } from './tesujiDrills'
import { deleteGame, loadGames, storeGame, type StoredGame } from './games'
import { PIECE_SETS, loadPieceSet, pieceUrl, type PieceSet } from './pieceSets'
import { addPath, allLines, emptyTree, isMainLine, mainContinuation, mainLine, nodeAt, promote, removeBranch, type Tree } from './tree'
import { PIECE_FINISHES, PIECE_FONTS, STRENGTH, TIME_CONTROLS, type TimeControl, loadPieceFont, playSound, setSettings, useSettings, type AiStrength, type BoardStyle, type Environment, type PieceFinish, type PieceFont, type PieceStyle, type Lang } from './settings'
import { analyze, engineSupported, scoreToCp, type Score } from '../engine'
import { useAnalysis } from '../hooks'
import { EngineName, EngineSettings } from './EngineSettings'
import { LABELS, describeMove, reviewMove, scoreWinRate, usiPosition, type MoveReview } from '../analysis'
import { formationOf } from '../formation'
import { attackerOf, buildQueue, markOpened, courseProgress, defenderMove, expectedMoves, judgeTsumeMove, markTsume, pickProblem, reviewCounts, PROBLEMS, loadTsumeStats, type Problem, type ReviewItem, type ReviewQueue } from './practice'
import { positionKey, record } from '../srs'
import { loadMistakes, saveMistakes } from '../mistakes'
import { decodeKifuFile, exportGame, parseGame } from '../kifu'
import { classify, type Label } from '../analysis'
import { bookLookup } from '../kifu'
import { COURSES, SETUPS, findPath, sideToMove, type Course, type JosekiNode } from '../model'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { LessonMap } from '../components/Flowchart'
import { PIECE_CHAR, applyUsi, hasLegalMove, kingSquare, reachable, colorSide, legalTargets, moveText, positionOf, promotionOptions, pvText, type Side } from '../shogi'

type Mode = 'lesson' | 'drill' | 'tsume' | 'tesuji' | 'spar' | 'analyze'
type Tab = 'engine' | 'coach' | 'flow' | 'moves'

const MODES: { id: Mode; icon: IconName }[] = [
  { id: 'lesson', icon: 'study' },
  { id: 'drill', icon: 'review' },
  { id: 'tsume', icon: 'tsume' },
  { id: 'tesuji', icon: 'flow' },
  { id: 'spar', icon: 'spar' },
  { id: 'analyze', icon: 'analyze' },
]

const TABS: Tab[] = ['coach', 'engine', 'flow', 'moves']

const SHU = '#c8442f'

const strip = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

const PROMOTED_CHAR: Partial<Record<PieceType, string>> = { [PieceType.PAWN]: 'と', [PieceType.LANCE]: '成香', [PieceType.KNIGHT]: '成桂', [PieceType.SILVER]: '成銀', [PieceType.BISHOP]: '馬', [PieceType.ROOK]: '龍' }

const nodesCache = new Map<string, Map<string, JosekiNode>>()
const cachedNodes = (course: Course) => {
  let map = nodesCache.get(course.id)
  if (!map) nodesCache.set(course.id, (map = courseNodes(course)))
  return map
}

const strategyCourses = (setupId: string, side: Side) => {
  const setup = SETUPS.find((x) => x.id === setupId && !x.technique)
  return (setup?.courseIds ?? []).map((id) => COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c && c.userSide === side)
}

function strategyMove(setupId: string, side: Side, sfen: string) {
  const options = strategyCourses(setupId, side).flatMap((c) => {
    const node = cachedNodes(c).get(strip(sfen))
    const pick = node?.branches.find((b) => b.kind === 'main' && b.child) ?? node?.branches.find((b) => b.kind !== 'deviation' && b.child)
    return pick ? [pick] : []
  })
  return options[Math.floor(Math.random() * options.length)]
}

function courseNodes(course: Course) {
  const map = new Map<string, JosekiNode>()
  const walk = (node: JosekiNode) => {
    if (!map.has(strip(node.sfen))) map.set(strip(node.sfen), node)
    node.branches.forEach((b) => b.child && walk(b.child))
  }
  walk(course.root)
  return map
}

const toSente = (score: Score, mover: Side): Score => (mover === 'sente' ? score : 'cp' in score ? { cp: -score.cp } : { mate: -score.mate })

type Selection = { from: Square | PieceType; color: Color } | null

type Level = 'rules' | 'new'
const LEVEL_KEY = 'joseki-practice:level:v1'
const SESSION_KEY = 'joseki-practice:session:v2'

type SavedGame = { start: string; moves: string[]; cursor: number; userSide: Side; tree?: Tree }
type SavedSession = { mode: Mode; lesson?: { courseId: string; lessonMode: 'study' | 'quiz'; moves: string[]; score?: { right: number; wrong: number } }; spar?: SavedGame; analyze?: SavedGame; tsume?: { problemId: string; length: number | 'all' }; drill?: { queue: ReviewQueue } }

export function Workshop() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('lesson')
  const settings = useSettings()
  const ja = settings.lang === 'ja'
  const [tab, setTab] = useState<Tab>('coach')
  const [lessonMode, setLessonMode] = useState<'study' | 'quiz'>('study')
  const [mistake, setMistake] = useState<{ base: number; usi: string; expected: string; note?: string; loss: number | null; known: boolean; verdict?: MoveReview } | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState<{ right: number; wrong: number; shown?: number; retried?: number }>({ right: 0, wrong: 0 })
  const missedHere = useRef(new Set<string>())
  const [jumped, setJumped] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
  const [game, setGame] = useState({ start: InitialPositionSFEN.STANDARD as string, moves: [] as string[] })
  const [cursor, setCursor] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [tilted, setTilted] = useState(false)
  const [userSide, setUserSide] = useState<Side>('sente')
  const [selection, setSelection] = useState<Selection>(null)
  const [promotion, setPromotion] = useState<Move[] | null>(null)
  const [palette, setPalette] = useState(false)
  const [zones, setZones] = useState<StandZonesRect | null>(null)
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const [sheetH, setSheetH] = useState(() => {
    try {
      return Number(localStorage.getItem('joseki-practice:sheet:v1')) || 46
    } catch {
      return 50
    }
  })
  const [fullscreen, setFullscreen] = useState(() => !!document.fullscreenElement)
  const [hideUi, setHideUi] = useState(false)
  const [orbit, setOrbit] = useState(false)
  const [more, setMore] = useState(false)
  const [modeMenu, setModeMenu] = useState(false)
  const [moreAt, setMoreAt] = useState<DOMRect | null>(null)
  useEffect(() => {
    if (!more && !modeMenu) return
    const close = () => (setMore(false), setModeMenu(false))
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', key)
    }
  }, [more, modeMenu])
  const [newGame, setNewGame] = useState(false)
  const askedNewGame = useRef(false)
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'h' || e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest('input, textarea, select')) return
      setHideUi((v) => !v)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])
  const [showBest, setShowBest] = useState(true)
  const [level, setLevelState] = useState<Level>(() => {
    try {
      return localStorage.getItem(LEVEL_KEY) === 'new' ? 'new' : 'rules'
    } catch {
      return 'rules'
    }
  })
  const [welcome, setWelcome] = useState(() => {
    try {
      return localStorage.getItem(LEVEL_KEY) === null
    } catch {
      return false
    }
  })
  const [welcomeStep, setWelcomeStep] = useState(0)
  const setLevelOnly = (next: Level) => setLevelState(next)
  const finishWelcome = () => setLevel(level)
  const setLevel = (next: Level) => {
    setWelcome(false)
    setLevelState(next)
    try {
      localStorage.setItem(LEVEL_KEY, next)
    } catch (error) {
      console.warn('level not persisted', error)
    }
  }
  const [sheetOpen, setSheetOpen] = useState<boolean | null>(null)
  const ai = engineSupported() && !course?.noEngine
  const [fontReady, setFontReady] = useState('mincho')
  useEffect(() => {
    let live = true
    Promise.all([loadPieceFont(settings.pieceFont), loadPieceSet(settings.pieceSet)])
      .catch(() => undefined)
      .then(() => live && setFontReady(`${settings.pieceFont}|${settings.pieceSet}`))
    return () => {
      live = false
    }
  }, [settings.pieceFont, settings.pieceSet])
  const assist = settings.assist || (mode !== 'spar' && mode !== 'analyze')
  const [playing, setPlaying] = useState(false)
  const [lessonMap, setLessonMap] = useState(false)
  const [peekFrom, setPeekFrom] = useState<Square | null>(null)
  const [pickerSetup, setPickerSetup] = useState<string | null>(null)
  const [showEscape, setShowEscape] = useState(false)
  const [tsume, setTsume] = useState<{ problem: Problem; onBook: boolean; status: 'playing' | 'checking' | 'solved' | 'wrong' | 'shown'; reason?: string; hint: number; length: number | 'all'; good: number; missed?: boolean; seen?: boolean } | null>(null)
  const [drill, setDrill] = useState<{ queue: ReviewQueue; items: ReviewItem[]; index: number; base: number; result: null | 'right' | 'wrong'; retry: boolean; answered: number } | null>(null)

  const sfens = useMemo(() => {
    const out = [game.start]
    const p = positionOf(game.start)
    for (const usi of game.moves) {
      const move = p.createMoveByUSI(usi)
      if (!move || !p.doMove(move)) break
      out.push(p.sfen)
    }
    return out
  }, [game])

  const [preview, setPreview] = useState<{ base: number; moves: string[]; step: number; title: string } | null>(null)
  const previewSfens = useMemo(() => {
    if (!preview) return null
    const out = [sfens[preview.base]]
    for (const usi of preview.moves) {
      const next = applyUsi(out.at(-1)!, usi)
      if (!next) break
      out.push(next)
    }
    return out
  }, [preview, sfens])
  const liveSfen = sfens[cursor]
  const sfen = preview && previewSfens ? previewSfens[Math.min(preview.step, previewSfens.length - 1)] : liveSfen
  const position = useMemo(() => positionOf(sfen), [sfen])
  const toMove = colorSide(position.color)
  const lastMove = preview ? (preview.step > 0 ? preview.moves[preview.step - 1] : preview.base > 0 ? game.moves[preview.base - 1] : undefined) : cursor > 0 ? game.moves[cursor - 1] : undefined
  const startPreview = (moves: string[], title: string) => {
    setPreview({ base: cursor, moves, step: 0, title })
    setPlaying(true)
  }
  const keepPreview = () => {
    if (!preview) return
    const kept = preview.moves.slice(0, preview.step)
    setGame((g) => ({ ...g, moves: [...g.moves.slice(0, preview.base), ...kept] }))
    setCursor(preview.base + kept.length)
    setPreview(null)
    setPlaying(false)
  }
  const atEnd = cursor === game.moves.length
  const userTurn = mode === 'analyze' || (mode === 'lesson' && !course) || toMove === userSide || (mode === 'spar' && !atEnd)
  const nodes = useMemo(() => (course ? courseNodes(course) : null), [course])

  const { analysis } = useAnalysis(sfen, ai && engineSupported(), settings.candidates, settings.thinkMs)

  const [tree, setTree] = useState<Tree>(emptyTree)
  const treeRef = useRef(tree)
  treeRef.current = tree
  const modeRef = useRef(mode)
  const gameRef = useRef(game)
  gameRef.current = game
  modeRef.current = mode
  const sfensRef = useRef(sfens)
  sfensRef.current = sfens
  const [endHidden, setEndHidden] = useState('')
  const [resigned, setResigned] = useState(false)
  const timeControl = TIME_CONTROLS[settings.timeControl] ?? TIME_CONTROLS.none
  const clockOn = timeControl.main + timeControl.byoyomi > 0
  const freshClock = () => ({ sente: timeControl.main * 1000, gote: timeControl.main * 1000, byo: timeControl.byoyomi * 1000, flagged: null as Side | null })
  const [clock, setClock] = useState(freshClock)
  const [justRight, setJustRight] = useState(false)
  const lineProgress = useMemo(() => {
    if (!course) return null
    let node: JosekiNode | null = course.root
    let total = 0
    let done = 0
    let ply = 0
    while (node) {
      const next: JosekiNode['branches'][number] | undefined = node.branches.find((b) => b.kind === 'main' && b.child) ?? node.branches.find((b) => b.kind !== 'deviation' && b.child)
      if (!next) break
      if (sideToMove(node) === course.userSide) {
        total++
        if (ply < cursor && game.moves[ply] === next.usi) done++
      }
      node = next.child
      ply++
    }
    return { done, total }
  }, [course, cursor, game.moves])
  const [checking, setChecking] = useState(false)
  const [showControl, setShowControl] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  useEffect(() => {
    const open = () => setShowViewer(true)
    window.addEventListener('shogilab:viewer', open)
    return () => window.removeEventListener('shogilab:viewer', open)
  }, [])
  const [tesujiDrill, setTesujiDrill] = useState<{ item: TesujiDrill; filter: string; status: 'asking' | 'right' | 'shown'; missed: boolean; hint: boolean; wrong?: string } | null>(null)
  const [tesujiNote, setTesujiNote] = useState<(Tesuji & { at: number }) | null>(null)
  useEffect(() => {
    if (!tesujiNote) return
    const t = setTimeout(() => setTesujiNote(null), 6000)
    return () => clearTimeout(t)
  }, [tesujiNote])
  const [panelPrefs, setPanelPrefs] = useState<{ width: number; hidden: boolean }>(() => {
    try {
      return { width: 380, hidden: false, ...JSON.parse(localStorage.getItem('joseki-practice:panel:v1') ?? '{}') }
    } catch {
      return { width: 380, hidden: false }
    }
  })
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)')
    const on = () => setCompact(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const [drawer, setDrawer] = useState(false)
  const needsPicking = (mode === 'lesson' && !course) || (mode === 'drill' && !drill?.items.length)
  useEffect(() => {
    if (compact && needsPicking && !welcome) setDrawer(true)
  }, [compact, needsPicking, mode, welcome])
  useEffect(() => {
    if (drawer) document.querySelector('.ws-panel-body')?.scrollTo(0, 0)
  }, [drawer])
  const panelWidth = panelPrefs.width
  const flatView = settings.environment === 'flat' || settings.environment === 'diagram' || settings.environment === 'broadcast'
  const panelHidden = compact ? !drawer : panelPrefs.hidden
  const zoned = !compact && settings.environment !== 'diagram' && settings.environment !== 'broadcast' && viewport.w >= 1100 && sideStandsFit(viewport.w - 100, viewport.h - 110)
  const compactRef = useRef(compact)
  compactRef.current = compact
  const panelHiddenRef = useRef(panelHidden)
  panelHiddenRef.current = panelHidden
  const setPanel = (patch: Partial<{ width: number; hidden: boolean }>) => {
    if (compactRef.current && patch.hidden !== undefined) return setDrawer(!patch.hidden)
    setPanelPrefs((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem('joseki-practice:panel:v1', JSON.stringify(next))
      } catch (error) {
        console.warn('panel prefs not persisted', error)
      }
      return next
    })
  }
  const [slotId, setSlotId] = useState<string | null>(null)
  const [autoRate, setAutoRate] = useState('')
  const [gameNotes, setGameNotes] = useState<{ title: string; comments: string[]; ending?: string; moves: string } | null>(null)
  const [nudge, setNudge] = useState<string | null>(null)
  useEffect(() => {
    if (!nudge) return
    const t = setTimeout(() => setNudge(null), 2200)
    return () => clearTimeout(t)
  }, [nudge])
  const [confirm, setConfirm] = useState<{ text: string; run: () => void; yes?: string; no?: string } | null>(null)
  const confirmAt = useRef(0)
  useEffect(() => {
    if (confirm) confirmAt.current = performance.now()
  }, [confirm])
  const [showSettings, setShowSettings] = useState(false)
  const play = useCallback(
    (usi: string) => {
      setSelection(null)
      setPromotion(null)
      setPeekFrom(null)
      const at = sfensRef.current[cursor]
      const mv = at ? positionOf(at).createMoveByUSI(usi) : null
      playSound(mv?.capturedPieceType ? 'capture' : 'move')
      const g = gameRef.current
      const path = [...g.moves.slice(0, cursor), usi]
      const branching = modeRef.current === 'spar' || modeRef.current === 'analyze'
      const existing = branching ? nodeAt(treeRef.current, path) : null
      setGame({ ...g, moves: g.moves[cursor] === usi ? g.moves : existing ? [...path, ...mainContinuation(existing)] : path })
      setCursor(cursor + 1)
    },
    [cursor],
  )

  const load = (start: string, side: Side, nextMode: Mode, nextCourse: Course | null) => {
    if (nextMode !== mode && (mode === 'spar' || mode === 'analyze' || mode === 'lesson')) saved.current[mode] = { game, cursor, userSide, flipped, course, lessonMode, score, tree, resigned }
    setPreview(null)
    setPlaying(false)
    setTree(emptyTree())
    setSlotId(null)
    setPeekFrom(null)
    setResigned(false)
    setClock(freshClock())
    setJustRight(false)
    setSheetOpen(null)
    setPlyBase(0)
    setMistake(null)
    setShowAnswer(false)
    setScore({ right: 0, wrong: 0 })
    missedHere.current = new Set()
    setJumped(false)
    setGame({ start, moves: [] })
    setCursor(0)
    setUserSide(side)
    setFlipped(side === 'gote')
    setMode(nextMode)
    setCourse(nextCourse)
    setSelection(null)
    setPromotion(null)
  }

  const jumpTo = (nodeId: string) => {
    if (!course) return
    setPreview(null)
    if (lessonMode === 'quiz') setLessonMode('study')
    const path = findPath(course.root, nodeId) ?? []
    setMistake(null)
    setScore({ right: 0, wrong: 0 })
    setJumped(true)
    setGame({ start: course.root.sfen, moves: path.map((b) => b.usi) })
    setCursor(path.length)
    setSelection(null)
    setPromotion(null)
  }

  const [gameTitle, setGameTitle] = useState('')
  const [plyBase, setPlyBase] = useState(0)
  const importGame = (text: string): string | null => {
    const parsed = parseGame(text)
    if (parsed instanceof Error) return t('workshop.couldNotReadThatGame', { message: parsed.message })
    let at: string | null = parsed.startSfen
    let valid = 0
    for (const usi of parsed.moves) {
      at = applyUsi(at, usi)
      if (!at) break
      valid++
    }
    if (valid < parsed.moves.length) return t('workshop.moveIsNotLegalIn', { value: valid + 1, value2: parsed.moves[valid] })
    const run = () => {
      load(parsed.startSfen, 'sente', 'analyze', null)
      setGame({ start: parsed.startSfen, moves: parsed.moves })
      setCursor(0)
      setGameNotes({ title: parsed.title, comments: parsed.comments ?? [], ending: parsed.ending, moves: parsed.moves.join(' ') })
      setGameTitle(parsed.title || '')
      setTab('moves')
    }
    const variations = countMoves(tree) - mainLine(tree).length
    if (mode === 'analyze' && game.moves.length > 0) setConfirm({ text: t(variations > 0 ? 'workshop.loadGameReplaceVariations' : 'workshop.loadGameReplace', { count: parsed.moves.length, current: game.moves.length }), run, yes: t('workshop.loadIt'), no: t('workshop.cancel') })
    else run()
    return null
  }

  const startTesuji = (filter: string, exclude?: string) => {
    const item = pickTesuji(filter, exclude)
    if (!item) return
    load(item.sfen, colorSide(positionOf(item.sfen).color), 'tesuji', null)
    setTesujiDrill({ item, filter, status: 'asking', missed: false, hint: false })
    setTab('coach')
  }

  const startTsume = (length: number | 'all', exclude?: string) => {
    const problem = pickProblem(length, exclude)
    load(problem.sfen, attackerOf(problem), 'tsume', null)
    setTsume({ problem, onBook: true, status: 'playing', hint: 0, length, good: 0 })
    setTab('coach')
  }

  const loadReview = (queue: ReviewQueue, items: ReviewItem[], index: number, retry = false, answered = 0) => {
    const item = items[index]
    if (!item) {
      setMode('drill')
      setTab('coach')
      setPreview(null)
      setMistake(null)
      setCourse(null)
      setGame({ start: InitialPositionSFEN.STANDARD, moves: [] })
      setCursor(0)
      setPlyBase(0)
      setFlipped(false)
      return setDrill({ queue, items, index, base: 0, result: null, retry: false, answered })
    }
    if (item.kind === 'position') {
      setPlyBase(0)
      setGame({ start: item.course.root.sfen, moves: item.moves })
      setCursor(item.moves.length)
      setUserSide(item.course.userSide)
      setFlipped(item.course.userSide === 'gote')
      setCourse(item.course)
    } else {
      setGame({ start: item.mistake.sfen, moves: [] })
      setCursor(0)
      setPlyBase(item.mistake.ply - 1)
      const side = colorSide(positionOf(item.mistake.sfen).color)
      setUserSide(side)
      setFlipped(side === 'gote')
      setCourse(null)
    }
    setMode('drill')
    setPreview(null)
    setSelection(null)
    setMistake(null)
    setDrill({ queue, items, index, base: item.kind === 'position' ? item.moves.length : 0, result: null, retry, answered })
    setTab('coach')
  }
  const startReview = (queue: ReviewQueue) => loadReview(queue, buildQueue(queue), 0)

  const drillItem = drill && mode === 'drill' ? drill.items[drill.index] : undefined
  const drillAsking = !!drillItem && !drill?.result

  const commit = async (usi: string) => {
    setPromotion(null)
    setPeekFrom(null)
    if (mode === 'tesuji' && tesujiDrill) {
      if (tesujiDrill.status !== 'asking') return
      if (usi === tesujiDrill.item.answer) {
        playSound('right')
        play(usi)
        markTesuji(tesujiDrill.item.id, !tesujiDrill.missed)
        setTesujiDrill({ ...tesujiDrill, status: 'right' })
      } else {
        playSound('wrong')
        setSelection(null)
        setTesujiDrill({ ...tesujiDrill, missed: true, wrong: usi })
      }
      return
    }
    if (mode === 'tsume' && tsume) {
      if (tsume.status !== 'playing' || toMove !== userSide) return
      setTsume({ ...tsume, status: 'checking' })
      const verdict = await judgeTsumeMove(tsume.problem, game.moves.slice(0, cursor), sfen, usi, tsume.onBook)
      play(usi)
      if (verdict.kind === 'solved') {
        markTsume(tsume.problem.id, tsume.hint >= 2 || tsume.missed ? 'failed' : 'solved')
        setTsume({ ...tsume, status: 'solved' })
        playSound('complete')
      } else if (verdict.kind === 'wrong') {
        markTsume(tsume.problem.id, 'failed')
        setTsume({ ...tsume, status: 'wrong', reason: verdict.reason, missed: true })
        setGame((g) => ({ ...g, moves: g.moves.slice(0, cursor) }))
        setCursor(cursor)
        await showMistake(usi, tsume.problem.pv[cursor] ?? usi, undefined, verdict.reason)
        return
      } else setTsume({ ...tsume, status: 'playing', onBook: tsume.onBook && !verdict.offBook, good: tsume.good + 1 })
      return
    }
    if (mode === 'lesson' && course && !preview && toMove !== userSide) {
      const book = nodes?.get(strip(liveSfen))?.branches.find((b) => b.usi === usi && b.kind !== 'deviation')
      if (book) return play(usi)
      const after = applyUsi(liveSfen, usi)
      const line = after && engineSupported() ? ((await analyze(usiPosition(after), { multipv: 1, movetime: 700 })).candidates[0]?.pv.slice(0, 5) ?? []) : []
      setSelection(null)
      setMistake(null)
      setPreview({ base: cursor, moves: [usi, ...line], step: 1, title: t('workshop.ifTheyPlay', { move: moveText(liveSfen, usi) }) })
      setPlaying(true)
      return
    }
    if (mode === 'lesson' && course && !preview && toMove === userSide) {
      const node = nodes?.get(strip(liveSfen))
      const good = node?.branches.filter((b) => b.kind !== 'deviation' && b.child).map((b) => b.usi) ?? []
      if (node && good.length) {
        const ok = good.includes(usi)
        const assisted = showAnswer || missedHere.current.has(strip(liveSfen))
        if (lessonMode === 'quiz' && !(ok && assisted)) record(positionKey(liveSfen), ok)
        if (!ok) missedHere.current.add(strip(liveSfen))
        setJustRight(ok && !assisted && lessonMode === 'quiz')
        if (ok) setScore((sc) => (showAnswer ? { ...sc, shown: (sc.shown ?? 0) + 1 } : assisted ? { ...sc, retried: (sc.retried ?? 0) + 1 } : { ...sc, right: sc.right + 1 }))
        setShowAnswer(false)
        playSound(ok ? 'right' : 'wrong')
        if (ok) {
          setMistake(null)
          play(usi)
          return
        }
        setChecking(true)
        const verdict = await showMistake(usi, good[0], node.branches.find((b) => b.usi === usi)).finally(() => setChecking(false))
        if (!verdict || ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(verdict.label) || node.branches.some((b) => b.usi === usi && b.kind === 'deviation')) setScore((sc) => ({ ...sc, wrong: sc.wrong + 1 }))
        return
      }
    }
    if (drillAsking && drill && cursor === drill.base && drillItem) {
      const expected = expectedMoves(drillItem)
      const ok = expected.includes(usi)
      if (!drill.retry) record(drillItem.key, ok)
      setDrill({ ...drill, result: ok ? 'right' : 'wrong', answered: drill.retry ? drill.answered : drill.answered + 1 })
      if (!ok) {
        await showMistake(usi, expected[0], drillItem.kind === 'position' ? drillItem.node.branches.find((b) => b.usi === usi) : undefined)
        return
      }
    }
    play(usi)
  }

  async function showMistake(usi: string, expected: string, deviation?: JosekiNode['branches'][number], reason?: string) {
    let refutation: string[] = []
    if (deviation?.child) {
      let n: JosekiNode | null = deviation.child
      while (n && n.branches.length && refutation.length < 6) {
        const next: JosekiNode['branches'][number] = n.branches.find((b) => b.kind === 'main') ?? n.branches[0]
        refutation.push(next.usi)
        n = next.child
      }
    }
    let loss: number | null = null
    let verdict: MoveReview | undefined
    if (ai) {
      verdict = await reviewMove(liveSfen, usi, { movetime: 600 })
      if (!deviation?.child && verdict.reply) refutation = verdict.reply.pv.slice(0, modeRef.current === 'tsume' ? 1 : 5)
      loss = Math.max(0, Math.round(verdict.loss * 100))
    }
    setSelection(null)
    setPromotion(null)
    const found: Mistake = { usi, loss, known: deviation?.kind === 'deviation' || !!reason, verdict }
    setMistake({ base: cursor, expected, note: reason ?? deviation?.punishNote ?? deviation?.note, ...found })
    if (mistakeIsBad(found)) {
      setPreview({ base: cursor, moves: [usi, ...refutation], step: 1, title: t('workshop.whyFails', { move: moveText(liveSfen, usi) }) })
      setPlaying(true)
    }
    setTab('coach')
    return verdict
  }

  useEffect(() => {
    if (mode !== 'tsume' || !tsume || tsume.status !== 'playing' || !atEnd || cursor === 0 || toMove === userSide) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const usi = await defenderMove(tsume.problem, game.moves, liveSfen, tsume.onBook)
      if (!cancelled && usi) play(usi)
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [mode, tsume, atEnd, cursor, toMove, userSide, game.moves, liveSfen, play])

  const openCourse = (c: Course, sub: 'study' | 'quiz' = 'study') => {
    markOpened(c.id)
    load(c.root.sfen, c.userSide, 'lesson', c)
    setLessonMode(sub)
    setPickerSetup(SETUPS.find((x) => x.courseIds.includes(c.id))?.id ?? null)
    setTab('coach')
    setSheetOpen(false)
  }

  const [pending, setPending] = useState<{ key: string; usi: string; note?: string; source: 'book' | 'ai' } | null>(null)
  useEffect(() => {
    if ((mode !== 'lesson' && mode !== 'spar') || (mode === 'lesson' && !course) || !atEnd || toMove === userSide || resigned || (mode === 'spar' && clock.flagged)) return
    let cancelled = false
    const book = mode === 'lesson' ? nodes?.get(strip(liveSfen))?.branches.find((b) => b.kind === 'main' && b.child) ?? nodes?.get(strip(liveSfen))?.branches.find((b) => b.kind !== 'deviation' && b.child) : undefined
    const run = async () => {
      if (book) return setPending({ key: liveSfen, usi: book.usi, note: book.note, source: 'book' })
      const planned = mode === 'spar' && settings.aiStrategy ? strategyMove(settings.aiStrategy, userSide, liveSfen) : undefined
      if (planned) return setPending({ key: liveSfen, usi: planned.usi, note: planned.note, source: 'book' })
      if (mode === 'lesson' || !engineSupported()) return
      const level = STRENGTH[settings.opponent]
      const result = await analyze(usiPosition(liveSfen), { multipv: level.pickFrom, movetime: level.movetime })
      const top = result.candidates[0] ? scoreWinRate(result.candidates[0].score) : 0
      const pool = result.candidates.filter((c) => top - scoreWinRate(c.score) <= level.maxLoss)
      const pick = pool[Math.floor(Math.random() * pool.length)]?.move ?? result.bestmove
      if (!cancelled && pick && pick !== 'resign' && pick !== 'win') setPending({ key: liveSfen, usi: pick, source: 'ai' })
    }
    run()
    return () => {
      cancelled = true
    }
  }, [mode, atEnd, toMove, userSide, liveSfen, nodes, course, settings.opponent, settings.aiStrategy, resigned, clock.flagged])
  const reply = !preview && pending && pending.key === liveSfen && atEnd && (mode === 'lesson' || mode === 'spar') && toMove !== userSide ? pending : null
  useEffect(() => {
    if (!reply || (mode === 'lesson' && lessonMode === 'study')) return
    const timer = setTimeout(() => play(reply.usi), mode === 'spar' ? 900 : 1000)
    return () => clearTimeout(timer)
  }, [reply, mode, lessonMode, play])

  const canMove = (userTurn && !(mode === 'spar' && (resigned || clock.flagged))) || (mode === 'lesson' && !!course && lessonMode === 'study' && !preview)
  const select = (from: Square | PieceType, color: Color) => setSelection({ from, color })
  const targets = useMemo(() => (selection ? legalTargets(position, selection.from) : []), [selection, position])

  const attempt = (from: Square | PieceType, to: Square) => {
    const options = promotionOptions(position, from, to)
    if (options.length === 0) return setSelection(null)
    if (options.length === 1) return void commit(options[0].usi)
    setPromotion(options)
  }

  const onSquare = (square: Square) => {
    setPlaying(false)
    if (preview) return setPreview(null)
    if (!atEnd && (mode === 'tsume' || mode === 'drill')) return
    if (selection && targets.some((t) => t.equals(square))) return attempt(selection.from, square)
    const piece = position.board.at(square)
    if (selection?.from instanceof Square && piece?.color !== selection.color && sees(sfen, selection.from).some((t) => t.equals(square))) {
      setSelection(null)
      setNudge(position.board.at(selection.from)?.type === PieceType.KING ? t('workshop.yourKingCannotGoThere') : t('workshop.thatMoveWouldLeaveYour'))
      return
    }
    if (mode === 'lesson' && !course) return setPeekFrom(piece && !(peekFrom && peekFrom.equals(square)) ? square : null)
    if (selection?.from instanceof Square && selection.from.equals(square)) return setSelection(null)
    if (piece && piece.color === position.color && canMove) {
      setPeekFrom(null)
      if (mistake && !preview) setMistake(null)
      return select(square, piece.color)
    }
    setSelection(null)
    if (piece && piece.color !== position.color && (mode === 'drill' || mode === 'tsume' || (mode === 'lesson' && lessonMode === 'quiz')) && userTurn) {
      setNudge(t('workshop.thatIsTheOpponentS', { side: position.color === Color.BLACK ? '☗' : '☖' }))
      return
    }
    setPeekFrom(peekFrom && peekFrom.equals(square) ? null : square)
  }

  const onHand = (color: Color, type: PieceType) => {
    if (preview) return setPreview(null)
    if (mode === 'lesson' && !course) return
    if (color !== position.color || !canMove) return
    if (selection && !(selection.from instanceof Square) && selection.from === type) return setSelection(null)
    if (mistake && !preview) setMistake(null)
    select(type, color)
  }

  const onDrop = (from: Square | PieceType, to: Square) => {
    if (preview) return setPreview(null)
    if (mode === 'lesson' && !course) return setSelection(null)
    if (!canMove) return setSelection(null)
    attempt(from, to)
  }

  const onVariation = (mode === 'spar' || mode === 'analyze') && cursor > 0 && !isMainLine(tree, game.moves.slice(0, cursor))
  useEffect(() => {
    if (mode !== 'spar' && mode !== 'analyze') return
    setTree((t) => addPath(t, game.moves))
  }, [game, mode])
  const autoplayAllowed = mode === 'analyze' || mode === 'spar' || !!preview
  const sheetIsOpen = sheetOpen ?? ((mode === 'lesson' && !course) || (mode === 'drill' && !drillItem))
  const reviewAt = mode === 'spar' && cursor > 0 && colorSide(positionOf(sfens[cursor - 1]).color) !== userSide ? cursor - 1 : cursor
  const review = useReview(sfens, game.moves, reviewAt, ai && (mode === 'spar' || mode === 'analyze'))
  useEffect(() => {
    if (mode !== 'spar' || !ai || !atEnd || game.moves.length === 0) return
    const n = game.moves.length
    const before = sfens[n - 1]
    const usi = game.moves[n - 1]
    if (!before || colorSide(positionOf(before).color) === userSide || cachedReview(before, usi)) return
    const timer = setTimeout(() => {
      reviewMove(before, usi, { movetime: 400 })
        .then((r) => rememberReview(before, usi, r))
        .catch(() => undefined)
    }, 1500)
    return () => clearTimeout(timer)
  }, [mode, ai, atEnd, game.moves, sfens, userSide])
  useEffect(() => {
    if (mode !== 'spar' || !review || reviewAt === 0 || !['mistake', 'miss', 'blunder'].includes(review.label)) return
    const before = sfens[reviewAt - 1]
    const usi = game.moves[reviewAt - 1]
    if (!before || !usi || colorSide(positionOf(before).color) !== userSide) return
    const added = saveMistakes([{ id: `${before}|${usi}`, sfen: before, played: usi, best: review.best.move, bestPv: review.best.pv, label: review.label, reasons: review.reasons, game: t('workshop.yourGameVsTheAi'), ply: reviewAt }])
    if (added) setNudge(t('workshop.savedToReviewYouWill'))
  }, [review, reviewAt, mode, userSide])
  const bookHere = useMemo(() => {
    if (!nodes) return uniqueBook(sfen)
    const node = nodes.get(strip(sfen))
    return node ? node.branches.filter((b) => b.kind !== 'deviation' && b.child).map((b) => ({ usi: b.usi, note: b.note, kind: b.kind })) : []
  }, [sfen, nodes])
  const prevSfen = preview && previewSfens ? (preview.step > 0 ? previewSfens[preview.step - 1] : preview.base > 0 ? sfens[preview.base - 1] : null) : cursor > 0 ? sfens[cursor - 1] : null
  const bookAt = (i: number) => {
    if (i < 1) return null
    for (const hit of bookLookup(sfens[i - 1])) {
      const branch = hit.node.branches.find((b) => b.usi === game.moves[i - 1])
      if (branch) return { branch, course: hit.course }
    }
    return null
  }
  const bookLast = useMemo(() => {
    if (!lastMove || !prevSfen) return null
    const own = nodes?.get(strip(prevSfen))?.branches.find((b) => b.usi === lastMove)
    if (own && course) return { branch: own, course }
    for (const hit of [...bookLookup(prevSfen)].sort((a, b) => Number(a.course.notesFromOpponentView) - Number(b.course.notesFromOpponentView))) {
      const branch = hit.node.branches.find((b) => b.usi === lastMove)
      if (branch) return { branch: neutralBranch(branch, hit.course), course: hit.course }
    }
    return null
  }, [prevSfen, lastMove, nodes, course])

  const best = analysis?.candidates[0]
  const arrows: BoardArrow[] = []
  const gameOver = !preview && !hasLegalMove(position)
  const clockRunning = mode === 'spar' && clockOn && !resigned && !gameOver && atEnd && !clock.flagged
  useEffect(() => {
    setClock(freshClock())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.timeControl])
  const movesSeen = useRef(game.moves.length)
  useEffect(() => {
    const before = movesSeen.current
    movesSeen.current = game.moves.length
    if (mode !== 'spar' || !clockOn || game.moves.length <= before || !atEnd) return
    const mover: Side = toMove === 'sente' ? 'gote' : 'sente'
    setClock((c) => ({ ...c, [mover]: c[mover] + (c[mover] > 0 || !timeControl.byoyomi ? timeControl.increment * 1000 : 0), byo: timeControl.byoyomi * 1000 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.moves.length])
  useEffect(() => {
    if (!clockRunning) return
    let last = performance.now()
    const side = toMove
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = now - last
      last = now
      setClock((c) => {
        if (c.flagged) return c
        const main = c[side] - dt
        if (main > 0) return { ...c, [side]: main }
        if (!timeControl.byoyomi) return { ...c, [side]: 0, flagged: side }
        const byo = c.byo + main
        return byo > 0 ? { ...c, [side]: 0, byo } : { ...c, [side]: 0, byo: 0, flagged: side }
      })
    }, 100)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockRunning, toMove])
  const clockFor = (side: Side) => {
    if (mode !== 'spar' || !clockOn) return undefined
    const active = clockRunning && toMove === side
    const main = clock[side]
    const inByo = main <= 0 && timeControl.byoyomi > 0
    const ms = inByo ? (toMove === side ? clock.byo : timeControl.byoyomi * 1000) : main
    const total = Math.ceil(ms / 1000)
    const text = inByo ? t('workshop.byoyomi', { total }) : `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
    return { text, active, low: active && total <= 10, out: clock.flagged === side }
  }
  const inCheck = position.checked
  const checkKey = inCheck && !preview ? sfen : ''
  useEffect(() => {
    if (checkKey) playSound('wrong')
  }, [checkKey])
  const lessonNode = mode === 'lesson' && course ? nodes?.get(strip(liveSfen)) : undefined
  const lessonGood = lessonNode?.branches.filter((b) => b.kind !== 'deviation' && b.child) ?? []
  const lessonAsking = mode === 'lesson' && !!course && !preview && toMove === userSide && lessonGood.length > 0
  const lessonOffBook = mode === 'lesson' && !!course && !preview && !nodes?.get(strip(liveSfen))
  const lessonDone = mode === 'lesson' && !!course && atEnd && !preview && !!lessonNode && lessonNode.branches.filter((b) => b.kind !== 'deviation').length === 0
  const spoilerFree = (lessonAsking && lessonMode === 'quiz' && !showAnswer) || (drillAsking && drill?.queue !== 'new') || (mode === 'tsume' && tsume?.status !== 'solved' && tsume?.status !== 'shown') || (mode === 'tesuji' && tesujiDrill?.status === 'asking')
  if (!gameOver && ai && assist && best && showBest && !spoilerFree && (mode === 'analyze' || tab === 'engine')) {
    for (const c of analysis!.candidates.slice(1)) if (c.move !== best.move) arrows.push({ usi: c.move, color: SHU, dashed: true })
    arrows.push({ usi: best.move, color: SHU, label: t('workshop.best') })
  }
  if (mode === 'tesuji' && tesujiDrill && tesujiDrill.status === 'shown' && cursor === 0) arrows.push({ usi: tesujiDrill.item.answer, color: '#4f8a2a' })
  if (drillItem && !preview && (drill?.result === 'wrong' || (drill?.queue === 'new' && !drill.result))) arrows.push({ usi: expectedMoves(drillItem)[0], color: '#4f8a2a' })
  if (lessonAsking && (lessonMode === 'study' || showAnswer)) for (const b of lessonGood) arrows.push({ usi: b.usi, color: '#4f8a2a', dashed: b.kind !== 'main' })
  if (mode === 'tsume' && tsume && tsume.hint >= 2 && cursor === 0) arrows.push({ usi: tsume.problem.pv[0], color: '#d4a017' })
  if (assist && review && review.label !== 'book' && ['mistake', 'blunder', 'miss', 'inaccuracy'].includes(review.label) && tab === 'coach' && review.reply && reviewAt === cursor && !preview) arrows.push({ usi: review.reply.move, color: '#2b6cb0' })

  if (reply) arrows.push({ usi: reply.usi, color: '#8fa6d8' })
  const evalSente = ai && best ? toSente(best.score, toMove) : null
  const upcoming = preview ? preview.moves[preview.step] : cursor < game.moves.length ? game.moves[cursor] : (nodes?.get(strip(sfen))?.branches.find((b) => b.kind === 'main' && b.child) ?? nodes?.get(strip(sfen))?.branches.find((b) => b.kind !== 'deviation' && b.child))?.usi ?? (ai ? best?.move : undefined)
  useEffect(() => {
    if (!playing) return
    if (!upcoming) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      if (preview) setPreview({ ...preview, step: preview.step + 1 })
      else if (cursor < game.moves.length) setCursor(cursor + 1)
      else play(upcoming)
    }, 1100)
    return () => clearTimeout(timer)
  }, [playing, upcoming, cursor, game.moves.length, play, preview])
  if (preview && upcoming) arrows.push({ usi: upcoming, color: '#8fa6d8' })
  const previewing = !!preview || playing || !atEnd
  const liveLanes = useMemo(() => buildLanes(sfen, nodes, ai ? analysis : null), [sfen, nodes, ai, analysis])
  const lanesRef = useRef({ lanes: liveLanes, sfen })
  if (!preview) lanesRef.current = { lanes: gameOver ? [] : liveLanes, sfen }
  const lanes = lanesRef.current.lanes
  const [hoverLane, setHoverLane] = useState<string | null>(null)
  if (hoverLane && !preview && tab === 'flow') arrows.push({ usi: hoverLane, color: '#e0a23a' })
  const peekSquare = peekFrom && position.board.at(peekFrom) ? peekFrom : null
  const focusSquare = peekFrom && !position.board.at(peekFrom) ? peekFrom : null
  const control = useMemo(() => {
    const grid = new Map<string, { s: Square[]; g: Square[] }>()
    for (const sq of position.board.listNonEmptySquares()) {
      const piece = position.board.at(sq)!
      for (const t of sees(sfen, sq)) {
        const cell = grid.get(t.usi) ?? { s: [], g: [] }
        ;(piece.color === Color.BLACK ? cell.s : cell.g).push(sq)
        grid.set(t.usi, cell)
      }
    }
    return grid
  }, [sfen, position])
  const focusCell = focusSquare ? (control.get(focusSquare.usi) ?? { s: [], g: [] }) : null
  const heat = [
    ...(showControl
      ? [...control.entries()].map(([usi, c]) => {
          const d = c.s.length - c.g.length
          return { square: Square.newByUSI(usi)!, color: d > 0 ? 0x1f7ae0 : d < 0 ? 0xd2402a : 0x9a5ad0, opacity: Math.min(0.42, 0.14 + 0.1 * Math.abs(d || 1)), label: String(Math.max(c.s.length, c.g.length) && (d === 0 ? c.s.length : Math.abs(d))) }
        })
      : []),
    ...(focusSquare ? [{ square: focusSquare, color: focusCell && focusCell.s.length !== focusCell.g.length ? (focusCell.s.length > focusCell.g.length ? 0x1f7ae0 : 0xd2402a) : 0x9a5ad0, opacity: 0.35 }] : []),
  ]
  const enemyColor = mode === 'analyze' || (mode === 'lesson' && !course) ? (position.color === Color.BLACK ? Color.WHITE : Color.BLACK) : userSide === 'sente' ? Color.WHITE : Color.BLACK
  const enemyKing = showEscape && mode === 'tsume' ? kingSquare(sfen, enemyColor) : null
  const peekTargets = peekSquare ? sees(sfen, peekSquare).filter((sq) => level !== 'new' || position.board.at(sq)?.color !== position.board.at(peekSquare)?.color) : enemyKing ? reachable(sfen, enemyKing) : []
  const peekPiece = peekSquare ? position.board.at(peekSquare) : null
  const peekNote = peekSquare && peekPiece
    ? t('workshop.pieceCovers', { piece: `${peekPiece.color === Color.BLACK ? '☗' : '☖'}${PIECE_INFO[peekPiece.type].ja.slice(0, 1)}`, square: `${peekSquare.file}${'一二三四五六七八九'[peekSquare.rank - 1]}`, count: peekTargets.length }) + (level === 'new' ? ` ${PIECE_INFO[peekPiece.type].moves}` : '')
    : enemyKing
      ? peekTargets.length
        ? t('workshop.kingEscapes', { side: enemyColor === Color.BLACK ? '☗' : '☖', count: peekTargets.length })
        : t('workshop.theKingYouAreAttacking', { side: enemyColor === Color.BLACK ? '☗' : '☖' })
      : null
  const [announce, setAnnounce] = useState<{ side: Color; name: string; kind: string; key: number } | null>(null)
  const announced = useRef<{ start: string; seen: Set<string> }>({ start: '', seen: new Set() })
  const lastCursor = useRef(0)
  useEffect(() => {
    const stepped = cursor === lastCursor.current + 1
    lastCursor.current = cursor
    if (announced.current.start !== game.start) {
      const startPosition = positionOf(game.start)
      const seen = new Set<string>()
      for (const color of [Color.BLACK, Color.WHITE]) {
        const f = formationOf(startPosition, color)
        for (const name of [f.strategy, f.castle]) if (name) seen.add(`${color}|${name}`)
      }
      announced.current = { start: game.start, seen }
    }
    if (preview || mode === 'tsume' || cursor === 0) return
    const tesuji = stepped && sfens[cursor - 1] ? detectTesuji(sfens[cursor - 1], game.moves[cursor - 1]) : null
    if (tesuji) {
      setAnnounce({ side: positionOf(sfens[cursor - 1]).color, name: tesuji.ja, kind: t('workshop.tesuji'), key: Date.now() })
      setTesujiNote({ ...tesuji, at: cursor })
    }
    for (const color of [Color.BLACK, Color.WHITE]) {
      const f = formationOf(position, color)
      for (const [name, kind] of [
        [f.strategy, t('workshop.strategy')],
        [f.castle, t('workshop.castle')],
      ] as const) {
        if (!name || name === '居玉' || name === '居飛車') continue
        const id = `${color}|${name}`
        if (announced.current.seen.has(id)) continue
        announced.current.seen.add(id)
        if (!stepped) continue
        setAnnounce({ side: color, name, kind, key: Date.now() })
        return
      }
    }
  }, [sfen, preview, mode, cursor, game.start, position])
  useEffect(() => {
    if (!announce) return
    const t = setTimeout(() => setAnnounce(null), 1800)
    return () => clearTimeout(t)
  }, [announce])
  const checkHelp = mode === 'spar' && inCheck && userTurn && atEnd && !gameOver && !preview ? t('workshop.checkYourKingIsAttacked') : null
  const kanji = (sq: Square) => `${PIECE_INFO[position.board.at(sq)!.type].ja.slice(0, 1)}${sq.file}${'一二三四五六七八九'[sq.rank - 1]}`
  const focusNote = focusSquare && focusCell ? `${focusSquare.file}${'一二三四五六七八九'[focusSquare.rank - 1]}: ☗ ${focusCell.s.length ? focusCell.s.map(kanji).join(' ') : t('workshop.none')} · ☖ ${focusCell.g.length ? focusCell.g.map(kanji).join(' ') : t('workshop.none')}${focusCell.s.length !== focusCell.g.length ? t('workshop.controlsIt', { value: focusCell.s.length > focusCell.g.length ? '☗' : '☖' }) : focusCell.s.length ? t('workshop.contested') : ''}` : null
  if (focusSquare && focusCell) {
    arrows.length = 0
    for (const sq of focusCell.s) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: '#1f7ae0' })
    for (const sq of focusCell.g) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: '#d2402a' })
  }
  const boardNote = nudge ?? (checking ? t('workshop.checkingThatMove') : (focusNote ?? peekNote ?? (tesujiNote && tesujiNote.at === cursor ? t('workshop.tesuji2', { ja: tesujiNote.ja, en: tesujiNote.en, explain: tesujiNote.explain }) : checkHelp)))
  const castles = [Color.BLACK, Color.WHITE].flatMap((color) => {
    const f = formationOf(position, color)
    return f.castle && f.castle !== '居玉' ? [{ squares: f.squares, color: color === Color.BLACK ? '#b8432f' : '#2f5d9b', label: f.castle }] : []
  })
  const reviewedMove = !preview && reviewAt > 0 ? game.moves[reviewAt - 1] : undefined
  const stamp = !assist ? null : review && reviewedMove ? { square: reviewedMove.slice(2, 4), text: LABELS[review.label].symbol, color: LABELS[review.label].color } : lastMove && bookLast ? { square: lastMove.slice(2, 4), text: '本', color: '#a88865' } : null
  const [evals, setEvalsState] = useState<Record<string, number>>(allEvals)
  const setEvals = (f: (e: Record<string, number>) => Record<string, number>) =>
    setEvalsState((e) => {
      const next = f(e)
      for (const k of Object.keys(next)) if (next[k] !== e[k]) rememberEval(k, next[k])
      return next
    })
  const evalKey = strip(sfen)
  const evalCp = evalSente ? scoreToCp(evalSente) : null
  useEffect(() => {
    if (evalCp !== null) setEvals((e) => (e[evalKey] === evalCp ? e : { ...e, [evalKey]: evalCp }))
  }, [evalKey, evalCp])
  const senteRate = evalSente ? scoreWinRate(evalSente) : 0.5

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPalette((v) => !v)
        return
      }
      if (palette || (event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') return
      if (event.key === ' ' && document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'BUTTON') document.activeElement.blur()
      if (event.key === 'Escape' && (showSettings || confirm)) {
        setShowSettings(false)
        setConfirm(null)
        return
      }
      if (event.key === 'Escape' && promotion) {
        setPromotion(null)
        setSelection(null)
        return
      }
      if (preview) {
        if (event.key === 'ArrowRight') setPreview({ ...preview, step: Math.min(preview.moves.length, preview.step + 1) })
        else if (event.key === 'ArrowLeft') setPreview({ ...preview, step: Math.max(0, preview.step - 1) })
        else if (event.key === 'Escape') {
          setPreview(null)
          setPlaying(false)
        }
        else if (event.key === ' ') {
          event.preventDefault()
          setPlaying((v) => !v)
        }
        return
      }
      if (event.key === 'ArrowRight' && reply) {
        event.preventDefault()
        play(reply.usi)
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        if (reply && !playing) play(reply.usi)
        else if (lessonAsking && lessonMode === 'study' && lessonGood[0]) void commit(lessonGood[0].usi)
        else if (autoplayAllowed) setPlaying((v) => !v)
        return
      }
      if (event.key === 'ArrowLeft') setCursor((c) => Math.max(0, c - 1))
      else if (event.key === 'ArrowRight') setCursor((c) => Math.min(game.moves.length, c + 1))
      else if (event.key === 'Home') setCursor(0)
      else if (event.key === 'End') setCursor(game.moves.length)
      else if (event.key === 'f') setFlipped((v) => !v)
      else if (event.key === 'p') setPanel({ hidden: !panelHiddenRef.current })
      else if (event.key === 't' && !flatView) setTilted((v) => !v)
      else if (event.key === 'c' && !event.metaKey && !event.ctrlKey) setShowControl((v) => !v)
      else if (event.key === 'k' && modeRef.current === 'tsume') {
        setPeekFrom(null)
        setShowEscape((v) => !v)
      }
      else if (event.key === 'Escape') {
        setSelection(null)
        setPeekFrom(null)
      }
      else return
      setSelection(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [palette, game.moves.length, reply, play, playing, preview, promotion, showSettings, confirm, autoplayAllowed, lessonAsking, lessonMode, lessonGood])

  const studyReply = mode === 'lesson' && course && lessonMode === 'study' && !lessonAsking && !lessonDone && !preview && !mistake ? reply : null

  const modeInstruction = () => {
    const me = userSide === 'sente' ? '☗' : '☖'
    if (checking) return t('workshop.checkingThatMove')
    if (preview && mistake) return mistakeIsBad(mistake) ? t('workshop.watchHowItGetsPunished') : t('workshop.watchWhatFollowsThenGo')
    if (mistake && !preview) return mistakeIsBad(mistake) ? t('workshop.wasAMistakeTryAgain', { move: moveText(sfens[mistake.base], mistake.usi) }) : t('workshop.isAFineMoveBut', { move: moveText(sfens[mistake.base], mistake.usi) })
    if (preview) return t('workshop.previewWatchItPlayOut')
    if (mode === 'lesson') {
      if (!course) return t('workshop.pickATechniqueOrAn')
      if (lessonOffBook) return t('workshop.offTheLessonLineGo')
      if (lessonDone) return t('workshop.lineComplete')
      if (lessonAsking) return lessonMode === 'study' ? t('workshop.studyYourMove', { side: me }) + (lessonGood.some((b) => b.note) ? t('workshop.coachTellsWhy') : '') : showAnswer ? t('workshop.answerShownPlayTheGreen') : t('workshop.yourMoveAsFindThe', { me })
      return lessonMode === 'study' ? (compact ? t('workshop.theirMoveIsShownTap') : t('workshop.theirMoveIsShownPress')) : t('workshop.theirReplyComesInA')
    }
    if (mode === 'drill') return drillItem ? (drillItem.kind === 'mistake' && !drill?.result ? t('workshop.findABetterMoveThan') : drill?.result ? t('workshop.nextCardWhenYouAre') : drill?.queue === 'new' ? t('workshop.learnThisMovePlayThe') : t('workshop.playTheMoveYouLearned')) : t('workshop.pickWhatToReview')
    if (mode === 'tesuji') return tesujiDrill ? (tesujiDrill.status === 'asking' ? t('workshop.toMoveFindTheTesuji', { side: colorSide(position.color) === 'sente' ? '☗' : '☖' }) : t('workshop.nextDrillWhenYouAre')) : t('workshop.findTheTesuji')
    if (mode === 'tsume') return tsume ? t('workshop.toPlayMateInEvery', { side: attackerOf(tsume.problem) === 'sente' ? '☗' : '☖', mate: tsume.problem.mate }) : t('workshop.everyAttackingMoveMustGive')
    if (mode === 'spar') return resigned ? t('workshop.youResignedReviewTheGame') : position.checked && !hasLegalMove(position) ? t('workshop.checkmateTheGameIsOver') : !atEnd ? t('workshop.lookingBackAtEarlierMoves') : userTurn ? (position.checked ? t('workshop.checkYourKingIsIn') : t('workshop.yourMove')) : t('workshop.theAiIsThinking')
    return t('workshop.tryAnythingTheAiTab')
  }

  const explore = () => {
    if (!course) return
    saved.current.lesson = { game, cursor, userSide, flipped, course, lessonMode, score }
    const moves = preview ? [...game.moves.slice(0, preview.base), ...preview.moves.slice(0, preview.step)] : game.moves.slice(0, cursor)
    const start = game.start
    const keepFlip = flipped
    load(start, 'sente', 'analyze', null)
    setGame({ start, moves })
    setCursor(moves.length)
    setFlipped(keepFlip)
    setTab('coach')
  }

  const exportKif = () => {
    const lines = (mode === 'spar' || mode === 'analyze') && tree.children.length ? allLines(tree) : [game.moves]
    const ai = `ShogiLab AI (${STRENGTH[settings.opponent].label})`
    const names = mode === 'spar' ? (userSide === 'sente' ? { sente: t('workshop.you'), gote: ai } : { sente: ai, gote: t('workshop.you') }) : gameNotes?.title && gameNotes.title !== 'Imported game' ? { title: gameNotes.title } : course ? { title: course.title } : {}
    return exportGame(game.start, lines, names)
  }
  const saveSlot = () => {
    const id = slotId ?? String(Date.now())
    const d = new Date()
    const when = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    const title = mode === 'spar' ? t('workshop.vsAiAs', { side: userSide === 'sente' ? '☗' : '☖', when }) : `${gameTitle || t('workshop.analysis')} · ${when}`
    const ok = storeGame({ id, title, savedAt: Date.now(), start: game.start, moves: tree.children.length ? mainLine(tree) : game.moves, tree: tree.children.length ? tree : undefined, userSide })
    if (ok) setSlotId(id)
    return ok
  }
  const openSlot = (g: StoredGame) => {
    const run = () => {
      load(g.start, g.userSide, 'analyze', null)
      setGame({ start: g.start, moves: g.moves })
      if (g.tree) setTree(g.tree)
      setCursor(g.moves.length)
      setGameTitle(g.title)
      setSlotId(g.id)
      setTab('moves')
    }
    if (mode === 'analyze' && game.moves.length > 0 && slotId !== g.id) setConfirm({ text: t('workshop.openTheGameOnThe', { title: g.title }), run, yes: t('workshop.openIt'), no: t('workshop.cancel') })
    else run()
  }

  const lastUserMove = (() => {
    for (let i = Math.min(cursor, game.moves.length) - 1; i >= 0; i--) if (sfens[i] && colorSide(positionOf(sfens[i]).color) === userSide) return i
    return -1
  })()
  const takeBack = () => {
    if (lastUserMove < 0) return
    setPending(null)
    setPlaying(false)
    setSelection(null)
    setMistake(null)
    setTree((t) => removeBranch(t, game.moves.slice(0, lastUserMove + 1)))
    setGame((g) => ({ ...g, moves: g.moves.slice(0, lastUserMove) }))
    setCursor(lastUserMove)
    setNudge(t('workshop.takeBackYourLastMove'))
  }

  const reviewGame = () => {
    const moves = game.moves
    const start = game.start
    let at = start
    let first = 0
    for (let i = 0; i < moves.length && !first; i++) {
      const label = cachedReview(at, moves[i])?.label
      if (label && ['mistake', 'miss', 'blunder'].includes(label)) first = i + 1
      at = applyUsi(at, moves[i]) ?? at
    }
    const run = () => {
      load(start, userSide, 'analyze', null)
      setGame({ start, moves })
      setCursor(first)
      setGameTitle(t('workshop.yourGameVsTheAi'))
      setAutoRate(moves.join(' '))
      setTab('moves')
    }
    const open = saved.current.analyze?.game.moves.length ?? 0
    if (open > 0) setConfirm({ text: t('workshop.openThisGameInAnalyze', { count: open }), run, yes: t('workshop.openIt'), no: t('workshop.cancel') })
    else run()
  }

  const goBack = () => {
    setPreview(null)
    setPlaying(false)
    if (mode === 'tsume' && tsume) setTsume({ ...tsume, status: 'playing', onBook: true, good: 0 })
  }

  useEffect(() => {
    document.querySelector('.ws-panel-body')?.scrollTo(0, 0)
  }, [mode])
  useEffect(() => {
    if (mode === 'lesson' || mode === 'drill' || mode === 'tsume') document.querySelector('.ws-panel-body')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [mode, cursor, preview === null, lessonDone])
  const saved = useRef<Partial<Record<Mode, { resigned?: boolean; game: { start: string; moves: string[] }; cursor: number; userSide: Side; flipped: boolean; course: Course | null; lessonMode: 'study' | 'quiz'; score: { right: number; wrong: number; shown?: number; retried?: number }; tree?: Tree }>>>({})
  const enterMode = (m: Mode) => {
    if (m === mode && m === 'lesson' && course && !preview) return load(InitialPositionSFEN.STANDARD, 'sente', 'lesson', null), setPickerSetup(null)
    if (m === mode) return
    saved.current[mode] = { game, cursor, userSide, flipped, course, lessonMode, score, tree, resigned }
    setShowEscape(false)
    setPeekFrom(null)
    setTab('coach')
    const back = saved.current[m]
    if (back && (m === 'spar' || m === 'analyze' || (m === 'lesson' && back.course))) {
      load(back.game.start, back.userSide, m, back.course)
      setGame(back.game)
      setCursor(back.cursor)
      setFlipped(back.flipped)
      setLessonMode(back.lessonMode)
      setScore(back.score)
      if (back.tree) setTree(back.tree)
      if (back.resigned) setResigned(true)
      return
    }
    if (m === 'tesuji') return startTesuji(tesujiDrill?.filter ?? 'all')
    if (m === 'tsume') return startTsume(tsume?.length ?? (loadTsumeStats().solved.length < 5 ? 1 : 3))
    if (m === 'drill') {
      const counts = reviewCounts()
      return startReview(counts.due === 0 && counts.mistakes > 0 ? 'mistakes' : 'due')
    }
    if (m === 'lesson') {
      setPickerSetup(null)
      return load(InitialPositionSFEN.STANDARD, 'sente', 'lesson', null)
    }
    if (m === 'spar') return load(InitialPositionSFEN.STANDARD, 'sente', 'spar', null)
    load(InitialPositionSFEN.STANDARD, 'sente', 'analyze', null)
  }

  const restored = useRef(false)
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const data = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as SavedSession | null
      if (!data) return
      const valid = (start: string, moves: string[]) => {
        let at: string | null = Position.newBySFEN(start) ? start : null
        for (const usi of moves) at = at && applyUsi(at, usi)
        return !!at
      }
      for (const m of ['spar', 'analyze'] as const) {
        const g = data[m]
        if (g && valid(g.start, g.moves)) saved.current[m] = { game: { start: g.start, moves: g.moves }, cursor: g.cursor, userSide: g.userSide, flipped: g.userSide === 'gote', course: null, lessonMode: 'study', score: { right: 0, wrong: 0 }, tree: g.tree }
      }
      const lesson = data.lesson
      const c = lesson && COURSES.find((x) => x.id === lesson.courseId)
      if (c && lesson && valid(c.root.sfen, lesson.moves)) {
        saved.current.lesson = { game: { start: c.root.sfen, moves: lesson.moves }, cursor: lesson.moves.length, userSide: c.userSide, flipped: c.userSide === 'gote', course: c, lessonMode: lesson.lessonMode, score: lesson.score ?? { right: 0, wrong: 0 } }
      }
      const back = saved.current[data.mode]
      if (back && (data.mode === 'spar' || data.mode === 'analyze' || data.mode === 'lesson')) {
        load(back.game.start, back.userSide, data.mode, back.course)
        setGame(back.game)
        setCursor(back.cursor)
        setFlipped(back.flipped)
        setLessonMode(back.lessonMode)
        setScore(back.score)
        if (back.tree) setTree(back.tree)
        if (back.course) setPickerSetup(SETUPS.find((x) => x.courseIds.includes(back.course!.id))?.id ?? null)
      }
      const problem = data.mode === 'tsume' && data.tsume ? PROBLEMS.find((p) => p.id === data.tsume!.problemId) : undefined
      if (problem) {
        load(problem.sfen, attackerOf(problem), 'tsume', null)
        setTsume({ problem, onBook: true, status: 'playing', hint: 0, length: data.tsume!.length, good: 0 })
      }
      if (data.mode === 'drill' && data.drill) startReview(data.drill.queue)
    } catch (error) {
      console.warn('session not restored', error)
    }
  })
  useEffect(() => {
    if (!restored.current) return
    try {
      const prev = (JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as SavedSession | null) ?? { mode: 'lesson' }
      const next: SavedSession = { ...prev, mode }
      if (mode === 'lesson') next.lesson = course ? { courseId: course.id, lessonMode, moves: game.moves.slice(0, cursor), score } : undefined
      if (mode === 'spar') next.spar = { start: game.start, moves: game.moves, cursor, userSide, tree }
      if (mode === 'analyze') next.analyze = { start: game.start, moves: game.moves, cursor, userSide, tree }
      if (mode === 'tsume' && tsume) next.tsume = { problemId: tsume.problem.id, length: tsume.length }
      if (mode === 'drill') next.drill = drill ? { queue: drill.queue } : undefined
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    } catch (error) {
      console.warn('session not saved', error)
    }
  }, [mode, course, lessonMode, game, cursor, userSide, score, tree, tsume, drill])

  const twoPanels = zoned && !panelPrefs.hidden && !!zones && zones.under.width >= 240 && zones.under.height >= 200
  useEffect(() => {
    if (twoPanels && tab === 'moves') setTab('coach')
  }, [twoPanels, tab])

  const panelBody = (tab: Tab) => (
    <div className="ws-panel-body" key={`${mode}|${course?.id ?? ''}|${lessonMode}|${tab}|${tsume?.problem.id ?? ''}|${drill?.index ?? ''}`}>
      {tab === 'moves' && ai && assist && game.moves.length > 0 && (mode === 'analyze' || mode === 'spar') && <EvalGraph values={sfens.map((s) => evals[strip(s)])} cursor={cursor} onJump={setCursor} />}
      {level === 'new' && selection && !(mode === 'lesson' && course) && <PieceGuide sfen={sfen} from={selection.from} />}
      {tab === 'engine' && !ai && <p className="ws-muted">{t('workshop.theAiNeedsACross')}</p>}
      {tab === 'engine' && ai && spoilerFree && <p className="ws-muted">{t('workshop.theAiStaysQuietUntil')}</p>}
      {tab === 'engine' && ai && !spoilerFree && gameOver && <p className="ws-muted">{t('workshop.checkmateWon', { winner: t(toMove === 'sente' ? 'common.gote' : 'common.sente') })}</p>}
      {tab === 'engine' && !assist && <p className="ws-muted">{t('workshop.helpIsOffTurnIt')}</p>}
      {tab === 'engine' && ai && assist && !spoilerFree && !gameOver && <EnginePane sfen={sfen} toMove={toMove} analysis={analysis} showBest={showBest} setShowBest={setShowBest} onPlay={play} canPlay={userTurn} book={bookHere} />}
      {tab === 'coach' && mode === 'lesson' && (
        <LessonPane
          course={course}
          lessonMode={lessonMode}
          justRight={justRight}
          progress={lineProgress}
          checking={checking}
          onLessonMode={(m) => {
            if (m === 'quiz' && course && lessonMode !== 'quiz' && game.moves.length > 0) return openCourse(course, 'quiz')
            setLessonMode(m)
            setShowAnswer(false)
            setScore({ right: 0, wrong: 0 })
          }}
          onOpen={openCourse}
          onChange={() => (load(InitialPositionSFEN.STANDARD, 'sente', 'lesson', null), setPickerSetup(null))}
          onMap={() => setLessonMap(true)}
          onRestart={(sub) => course && openCourse(course, sub ?? lessonMode)}
          asking={lessonAsking}
          done={lessonDone}
          good={lessonGood.map((b) => ({ usi: b.usi, note: b.note }))}
          sfen={liveSfen}
          userSide={userSide}
          mistake={mistake}
          showAnswer={showAnswer}
          onShowAnswer={() => setShowAnswer(true)}
          onBack={goBack}
          onExplore={explore}
          whatIf={preview && !mistake ? preview.title : null}
          offBook={lessonOffBook}
          onBackToLine={() => {
            let i = cursor
            while (i > 0 && !nodes?.get(strip(sfens[i]))) i--
            setGame((g) => ({ ...g, moves: g.moves.slice(0, i) }))
            setCursor(i)
          }}
          endComment={lessonDone ? lessonNode?.comment : undefined}
          jumped={jumped}
          mistakePreview={!!preview && !!mistake}
          playing={playing}
          score={score}
          lastNote={bookLast?.branch.note}
          endRate={lessonDone && evalSente ? (userSide === 'sente' ? senteRate : 1 - senteRate) : null}
          level={level}
          pickerSetup={pickerSetup}
          onPickerSetup={setPickerSetup}
          reply={reply}
          onPlayReply={() => reply && play(reply.usi)}
          lastMove={lastMove}
          prevSfen={prevSfen}
        />
      )}
      {lessonMap && course && <LessonMap course={course} currentNodeId={nodes?.get(strip(sfen))?.id ?? null} onJump={jumpTo} onClose={() => setLessonMap(false)} />}
      {tab === 'coach' && mode === 'tesuji' && tesujiDrill && (
        <TesujiPane
          drill={tesujiDrill}
          sfen={tesujiDrill.item.sfen}
          onFilter={(f) => startTesuji(f)}
          onNext={() => startTesuji(tesujiDrill.filter, tesujiDrill.item.id)}
          onHint={() => setTesujiDrill({ ...tesujiDrill, hint: true, missed: true })}
          onShow={() => (setTesujiDrill({ ...tesujiDrill, status: 'shown', missed: true }), markTesuji(tesujiDrill.item.id, false))}
        />
      )}
      {tab === 'coach' && mode === 'tsume' && tsume && (
        <TsumePane
          tsume={tsume}
          onLength={(n) => startTsume(n)}
          escape={showEscape}
          onEscape={() => (setPeekFrom(null), setShowEscape((v) => !v))}
          onNext={() => startTsume(tsume.length, tsume.problem.id)}
          onRetry={() => (load(tsume.problem.sfen, attackerOf(tsume.problem), 'tsume', null), setTsume({ ...tsume, status: 'playing', onBook: true, good: 0 }))}
          onHint={() => setTsume({ ...tsume, hint: tsume.hint + 1 })}
          onShow={() => {
            markTsume(tsume.problem.id, 'failed')
            setGame({ start: tsume.problem.sfen, moves: tsume.problem.pv })
            setCursor(tsume.problem.pv.length)
            setTsume({ ...tsume, status: 'shown', hint: 2, seen: true })
          }}
        />
      )}
      {tab === 'coach' && mode === 'drill' && <ReviewPane drill={drill} item={drillItem} startSfen={drillItem ? sfens[drill?.base ?? 0] : null} onQueue={startReview} onNext={() => drill && loadReview(drill.queue, drill.items, drill.index + 1, false, drill.answered)} onRetry={() => drill && loadReview(drill.queue, drill.items, drill.index, true, drill.answered)} mistakePreview={!!preview && !!mistake} mistakeOk={!!mistake && !mistakeIsBad(mistake)} />}
      {tab === 'coach' && mode === 'analyze' && <ImportBox onImport={importGame} />}
      {tab === 'coach' && mode === 'analyze' && gameNotes && game.moves.join(' ').startsWith(gameNotes.moves.split(' ').slice(0, cursor).join(' ')) && cursor <= gameNotes.moves.split(' ').length && (
        <div className="ws-kifu-notes">
          {gameNotes.title !== 'Imported game' && cursor === 0 && <p className="ws-muted">{gameNotes.title}</p>}
          {gameNotes.comments[cursor] && (
            <p className="ws-note">
              <span className="ws-kifu-tag">{t('workshop.comment')}</span> {gameNotes.comments[cursor]}
            </p>
          )}
          {gameNotes.ending && cursor === gameNotes.moves.split(' ').length && <p className="ws-note">{gameNotes.ending}</p>}
        </div>
      )}
      {tab === 'coach' && mode === 'spar' && game.moves.length > 0 && !gameOver && (
        <div className="ws-actions ws-spar-actions">
          {!resigned && (
            <button onClick={takeBack} disabled={lastUserMove < 0} title={t('workshop.takeBackYourLastMove3')}>
              {t('workshop.takeBack')}
            </button>
          )}
          {!resigned && (
            <button onClick={() => setConfirm({ text: t('workshop.resignThisGameYouCan'), run: () => setResigned(true), yes: t('workshop.resign2'), no: t('workshop.keepPlaying') })}>
              {t('workshop.resign')}
            </button>
          )}
        </div>
      )}
      {tab === 'coach' && (mode === 'spar' || mode === 'analyze') && !assist && <p className="ws-muted">{t('workshop.helpIsOffNoRatings')}</p>}
      {tab === 'coach' && (mode === 'spar' || mode === 'analyze') && assist && <CoachPane review={review} lastMove={reviewAt > 0 ? game.moves[reviewAt - 1] : undefined} prevSfen={reviewAt > 0 ? sfens[reviewAt - 1] : null} you={mode === 'spar'} bookLast={reviewAt === cursor ? bookLast : bookAt(reviewAt)} bookHere={bookHere} sfen={sfen} course={course} onPlay={play} canPlay={userTurn} hide={false} ai={ai} showBook={mode === 'analyze'} />}
      {tab === 'flow' && spoilerFree && <p className="ws-muted">{t('workshop.findTheMoveYourselfFirst')}</p>}
      {tab === 'flow' && !spoilerFree && gameOver && <p className="ws-muted">{t('workshop.theGameIsOverCheckmate')}</p>}
      {tab === 'flow' && !assist && <p className="ws-muted">{t('workshop.helpIsOffTurnIt2')}</p>}
      {tab === 'flow' && assist && !spoilerFree && !gameOver && <FlowPane lanes={lanes} sfen={lanesRef.current.sfen} onPreview={startPreview} onHover={setHoverLane} />}
      {tab === 'moves' &&
        (preview && previewSfens ? (
          <>
            <p className="ws-muted">{t('workshop.showingAPreviewTheseMoves')}</p>
            <MovesPane sfens={[...sfens.slice(0, preview.base), ...previewSfens]} moves={[...game.moves.slice(0, preview.base), ...preview.moves]} cursor={preview.base + preview.step} setCursor={(i) => i >= preview.base && setPreview({ ...preview, step: i - preview.base })} title={gameTitle || t('workshop.thisGame')} />
          </>
        ) : (
          <MovesPane
            sfens={sfens}
            moves={game.moves}
            cursor={cursor}
            setCursor={setCursor}
            title={gameTitle || t('workshop.thisGame')}
            onScore={(k, cp) => setEvals((e) => ({ ...e, [k]: cp }))}
            tree={mode === 'spar' || mode === 'analyze' ? tree : null}
            autoRate={mode === 'analyze' && autoRate === game.moves.join(' ')}
            canRate={mode === 'analyze' || gameOver || resigned}
            onSwitch={(path) => {
              const node = nodeAt(tree, path)
              setGame((g) => ({ ...g, moves: [...path, ...mainContinuation(node)] }))
              setCursor(path.length)
            }}
            onDelete={(path, size) =>
              setConfirm({
                text: t('workshop.deleteVariation', { count: size }),
                run: () => setTree((t) => removeBranch(t, path)),
                yes: t('workshop.delete'),
                no: t('workshop.keepIt'),
              })
            }
          />
        ))}
      {tab === 'moves' && (mode === 'spar' || mode === 'analyze') && !preview && (
        <GamesBox current={slotId} onSave={saveSlot} onCopy={exportKif} onOpen={openSlot} onDelete={(g) => setConfirm({ text: t('workshop.deleteThisCannotBeUndone', { title: g.title }), run: () => (deleteGame(g.id), g.id === slotId && setSlotId(null)), yes: t('workshop.delete'), no: t('workshop.keepIt') })} onImport={importGame} />
      )}
    </div>
  )

  useEffect(() => {
    if (mode !== 'spar') {
      askedNewGame.current = false
      return
    }
    if (!askedNewGame.current && game.moves.length === 0) setNewGame(true)
    askedNewGame.current = true
  }, [mode, game.moves.length])

  const commands = useCommands({ sfen, setMode: enterMode, setFlipped, setTilted, openCourse, play, newGame: () => load(InitialPositionSFEN.STANDARD, userSide, mode === 'lesson' ? 'analyze' : mode, null) })

  return (
    <div className={`ws${hideUi ? ' fs' : ''}${zoned ? ' zoned' : panelHidden ? ' panel-hidden' : ''}${compact && drawer ? ' drawer-open' : ''}`} style={{ ['--panel-w' as string]: `${panelWidth}px`, ['--sheet-h' as string]: sheetH }}>
      <nav className="ws-rail" aria-label={t('workshop.mode')}>
        <div className="ws-seal" title={t('workshop.shogilab')}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 3 L50 11 L57 61 H7 L14 11 Z" fill="#e9c98f" stroke="#7a4a1c" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M32 7.5 L47.2 14.3 L53.4 57.5 H10.6 L16.8 14.3 Z" fill="none" stroke="#c8442f" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
            <text x="32" y="47" textAnchor="middle" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize="30" fill="#1d140c">
              究
            </text>
          </svg>
        </div>
        {compact && (
          <div className="ws-menu-wrap ws-mode-menu">
            <button className="ws-rail-btn on" onClick={(e) => (e.stopPropagation(), setMore(false), setModeMenu((v) => !v))} aria-expanded={modeMenu}>
              <Icon name="menu" size={20} />
              <span>{t(`modes.${mode}.name`)}</span>
            </button>
            {modeMenu && (
              <div className="ws-more-menu left" onPointerDown={(e) => e.stopPropagation()} onClick={() => setModeMenu(false)}>
                {MODES.map((m) => (
                  <button key={m.id} className={`ws-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => enterMode(m.id)}>
                    <Icon name={m.icon} size={20} />
                    <span>{t(`modes.${m.id}.name`)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {!compact &&
          MODES.map((m) => (
          <button key={m.id} className={`ws-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => enterMode(m.id)} aria-pressed={mode === m.id} title={t('modes.title', { name: t(`modes.${m.id}.name`), hint: t(`modes.${m.id}.hint`) })}>
            <Icon name={m.icon} size={20} />
            <span className={ja ? 'ws-ja' : 'ws-en'}>{t(`modes.${m.id}.name`)}</span>
          </button>
        ))}
        <div className="ws-rail-gap" />
        <button className="ws-rail-btn" onClick={() => setFlipped((v) => !v)} title={t('workshop.flipTheBoardF')}>
          <Icon name="flip" size={20} />
          <span>{t('workshop.flip')}</span>
        </button>
        <button className={`ws-rail-btn${tilted && !flatView ? ' on' : ''}`} onClick={() => setTilted((v) => !v)} disabled={flatView} title={t('workshop.tiltTheBoardT')}>
          <Icon name="tilt" size={20} />
          <span>{t('workshop.tilt')}</span>
        </button>
        {!flatView && (
          <button className={`ws-rail-btn${orbit ? ' on' : ''}`} onClick={() => setOrbit((v) => !v)} title={t('workshop.lookAroundHint')} aria-pressed={orbit}>
            <Icon name="orbit" size={20} />
            <span>{t('workshop.lookAround')}</span>
          </button>
        )}
        <button className={`ws-rail-btn${showSettings ? ' on' : ''}`} onClick={() => setShowSettings(true)} title={t('workshop.settingsSoundPiecesBoardAi')}>
          <Icon name="gear" size={20} />
          <span className={ja ? 'ws-ja' : 'ws-en'}>{t('rail.settings')}</span>
        </button>
        <div className="ws-menu-wrap">
          <button className={`ws-rail-btn${more ? ' on' : ''}`} onClick={(e) => (e.stopPropagation(), setModeMenu(false), setMoreAt(e.currentTarget.getBoundingClientRect()), setMore((v) => !v))} aria-expanded={more} title={t('rail.more')}>
            <Icon name="more" size={20} />
            <span>{t('rail.more')}</span>
          </button>
          {more && (
            <div className="ws-more-menu" style={moreAt && !compact ? { left: moreAt.right + 8, bottom: window.innerHeight - moreAt.bottom } : undefined} onPointerDown={(e) => e.stopPropagation()} onClick={() => setMore(false)}>
              <button className={`ws-rail-btn${showControl ? ' on' : ''}`} onClick={() => setShowControl((v) => !v)} title={t('workshop.controlMapWhoControlsEach')} aria-pressed={showControl}>
                <Icon name="control" size={20} />
                <span>{t('rail.control')}</span>
              </button>
              <button className="ws-rail-btn" onClick={() => setHideUi(true)} title={`${t('workshop.hideUi')} (H)`}>
                <Icon name="panel" size={20} />
                <span>{t('workshop.hideUiShort')}</span>
              </button>
              {document.fullscreenEnabled && (
                <button className={`ws-rail-btn${fullscreen ? ' on' : ''}`} onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())} title={fullscreen ? t('workshop.exitFullScreenEsc') : t('workshop.fullScreen')} aria-pressed={fullscreen}>
                  <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} size={20} />
                  <span>{t('workshop.fullScreen2')}</span>
                </button>
              )}
              <button className="ws-rail-btn" onClick={() => window.dispatchEvent(new CustomEvent('shogilab:snapshot', { detail: `shogilab-${mode}-${cursor}` }))}>
                <Icon name="image" size={20} />
                <span>{t('rail.exportImage')}</span>
              </button>
              {!flatView && (
                <button className="ws-rail-btn" onClick={() => window.dispatchEvent(new Event('shogilab:tableflip'))}>
                  <Icon name="tableflip" size={20} />
                  <span>{t('rail.tableFlip')}</span>
                </button>
              )}
              <button className="ws-rail-btn" onClick={() => setPalette(true)} title={t('workshop.searchLinesAndCommandsK')}>
                <Icon name="command" size={20} />
                <span>⌘K</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className={`ws-stage${previewing ? ' previewing' : ''}`}>
        <button className="ws-fs-exit" onClick={() => setHideUi(false)} aria-label={t('workshop.showUi')} title={`${t('workshop.showUi')} (H)`}>
          <Icon name="exitFullscreen" size={18} />
        </button>
        <header className={`ws-modebar${compact && drawer ? ' sheet-up' : ''} m-${mode}${mode === 'lesson' ? ` l-${lessonMode}` : ''}`}>
          <span className="ws-modebar-seal">{!ja ? <Icon name={MODES.find((m) => m.id === mode)!.icon} size={22} /> : mode === 'lesson' && course ? t(lessonMode === 'study' ? 'modes.sealStudy' : 'modes.sealQuiz') : t(`modes.${mode}.name`)}</span>
          <span className="ws-modebar-text">
            <strong>
              {mode === 'lesson'
                ? course
                  ? `${lessonMode === 'study' ? t('workshop.study') : t('workshop.quiz')}: ${course.title}`
                  : t('workshop.openingsPickALesson')
                : mode === 'tsume' && tsume
                  ? t('workshop.tsumeMateIn', { mate: tsume.problem.mate })
                  : mode === 'drill'
                    ? drillItem
                      ? t('workshop.reviewCardOf', { value: drill!.index + 1, itemsCount: drill!.items.length })
                      : t('workshop.review')
                    : mode === 'spar'
                      ? t('workshop.vsAi', { side: userSide === 'sente' ? '☗' : '☖' })
                      : mode === 'tesuji'
                        ? `${t('workshop.tesuji')}: ${tesujiDrill && tesujiDrill.filter !== 'all' ? tesujiDrill.filter : t('workshop.mixed')}`
                        : t('workshop.analyzeMoveBothSidesFreely')}
            </strong>
            <span>{modeInstruction()}</span>
          </span>
          <span className="ws-lastmove">
            {lastMove && prevSfen ? (
              <>
                <span className="ws-ply">{t('workshop.move', { value: plyBase + (preview ? preview.base + preview.step : cursor) })}</span>
                <strong>{moveText(prevSfen, lastMove)}</strong>
              </>
            ) : (
              <span className="ws-ply">{plyBase > 0 ? t('workshop.afterMove', { plyBase }) : t('workshop.startPosition')}</span>
            )}
            <span className={`ws-turn ${toMove}`}>{t('workshop.toMove', { side: toMove === 'sente' ? '☗' : '☖' })}</span>
          </span>
          {(mode === 'spar' || mode === 'analyze') && (
            <button className={`ws-help-toggle${settings.assist ? ' on' : ''}`} onClick={() => setSettings({ assist: !settings.assist })} title={settings.assist ? t('workshop.helpIsOnEvalBar') : t('workshop.noHelpClickToShow')} aria-pressed={settings.assist}>
              {settings.assist ? t('workshop.coachOn') : t('workshop.coachOff')}
            </button>
          )}
          {!panelHidden && (
            <div className="ws-mini-nav">
              <button className="ws-mini-wide" onClick={() => setPanel({ hidden: true })} title={t('workshop.boardOnlyHideThePanel')} aria-label={t('workshop.hideThePanel')}>
                <Icon name="panel" size={16} />
                <span>{t('workshop.hidePanel')}</span>
              </button>
            </div>
          )}
          {panelHidden && (
            <div className="ws-mini-nav">
              {mode === 'spar' && !resigned && !gameOver && (
                <button onClick={takeBack} disabled={lastUserMove < 0} title={t('workshop.takeBackYourLastMove2')} aria-label={t('workshop.takeBack')}>
                  {t('workshop.takeBack')}
                </button>
              )}
              <button onClick={() => (preview ? setPreview({ ...preview, step: Math.max(0, preview.step - 1) }) : setCursor((c) => Math.max(0, c - 1)))} disabled={preview ? preview.step === 0 : cursor === 0} title={t('workshop.back')} aria-label={t('workshop.back2')}>
                <Icon name="prev" size={16} />
              </button>
              <button onClick={() => (preview ? setPreview({ ...preview, step: Math.min(preview.moves.length, preview.step + 1) }) : setCursor((c) => Math.min(game.moves.length, c + 1)))} disabled={preview ? preview.step >= preview.moves.length : atEnd} title={t('workshop.forward')} aria-label={t('workshop.forward2')}>
                <Icon name="next" size={16} />
              </button>
              <button className="ws-mini-wide" onClick={() => setPanel({ hidden: false })} title={t('workshop.showThePanelP')} aria-label={t('workshop.showThePanel')}>
                <Icon name="panel" size={16} />
                <span>{t('workshop.panel')}</span>
              </button>
            </div>
          )}
          {mode === 'spar' && (
            <button className="ws-game-setup" onClick={() => setNewGame(true)} title={`${STRENGTH[settings.opponent].label} · ${TIME_CONTROLS[settings.timeControl].label}`}>
              <b>{t('newGame.button')}</b>
            </button>
          )}
          {ai && assist && evalSente && (mode === 'analyze' || mode === 'spar' || (mode === 'lesson' && !!course && lessonMode === 'study')) && (
            <span className="ws-eval-chip" title={t('workshop.winChance', { value: Math.round(senteRate * 100), value2: 100 - Math.round(senteRate * 100) })}>
              <span className="ws-eval-track">
                <span style={{ width: `${senteRate * 100}%` }} />
              </span>
              <b>
                {senteRate >= 0.5 ? '☗' : '☖'} {Math.round(Math.max(senteRate, 1 - senteRate) * 100)}%
              </b>
            </span>
          )}
          {inCheck && !gameOver && <span className="ws-check">{t('workshop.check')}</span>}
        </header>
        <div className="ws-board-wrap">
          {settings.environment === 'diagram' || settings.environment === 'broadcast' ? (
            <Board2D style={settings.environment} position={position} flipped={flipped} tilted={false} lastMove={lastMove} selected={selection?.from ?? null} selectedColor={selection?.color} targets={targets} arrows={arrows} heat={heat} checkSquare={inCheck ? kingSquare(sfen, position.color) : null} onSquare={onSquare} onHand={onHand} onDrop={onDrop} />
          ) : (
          <Board3D
            key={`${settings.pieceStyle}|${settings.boardStyle}|${settings.pieceFinish}|${settings.coords}|${settings.environment}|${fontReady}`}
            position={position}
            flipped={flipped}
            tilted={tilted && !flatView}
            lastMove={lastMove}
            selected={selection?.from ?? null}
            selectedColor={selection?.color}
            targets={targets}
            arrows={arrows}
            castles={castles}
            snapKey={`${mode}|${game.start}|${course?.id ?? ''}|${tsume?.problem.id ?? ''}`}
            peek={peekTargets}
            heat={heat}
            checkSquare={inCheck ? kingSquare(sfen, position.color) : null}
            peekFrom={peekSquare ?? enemyKing}
            stamp={stamp}
            onSquare={onSquare}
            onHand={onHand}
            onDrop={onDrop}
            onZones={setZones}
            orbit={orbit && !flatView}
            sideRoom={0}
          />
          )}
          {preview && mistake && (
            <div className={`ws-preview mistake${mistakeIsBad(mistake) ? '' : ' ok'}`} role="status">
              <span className="ws-preview-seal">{mistakeSeal(mistake)}</span>
              {mode === 'drill' && <span className="ws-short">{mistakeIsBad(mistake) ? t('workshop.better') : t('workshop.lesson')}: {moveText(sfens[mistake.base], mistake.expected)}</span>}
              {mode === 'tsume' && <span className="ws-short">{t('workshop.notMate')}</span>}
              {mode === 'lesson' && <span className="ws-short">{mistake.verdict ? LABELS[mistake.verdict.label].text : t('workshop.mistake')}</span>}
              <span>
                {mistakeHeadline(moveText(sfens[mistake.base], mistake.usi), mistake)}{t('workshop.headlineEnd')}{playing ? t('workshop.watchWhatFollows') : preview.step < preview.moves.length ? t('workshop.paused') : t('workshop.thatIsHowItContinues')}
              </span>
              <button onClick={() => (playing ? setPlaying(false) : (preview.step >= preview.moves.length && setPreview({ ...preview, step: 1 }), setPlaying(true)))}>{playing ? t('workshop.pause') : t('workshop.replay')}</button>
              {mode !== 'drill' && (
                <button className="primary" onClick={goBack}>
                  {t('workshop.goBackAndTryAgain')}
                </button>
              )}
            </div>
          )}
          {preview && !mistake && (
            <div className="ws-preview" role="status">
              <span className="ws-preview-seal">{t('workshop.preview')}</span>
              <span>
                {t('workshop.preview2')}: {preview.title}, <span className="ws-nowrap">{t('workshop.moveOf', { step: preview.step, movesCount: preview.moves.length })}</span>
              </span>
              <button onClick={() => setPlaying((v) => !v)}>{playing ? t('workshop.pause') : t('workshop.play')}</button>
              <button onClick={keepPreview} disabled={preview.step === 0}>{t('workshop.keepTheseMoves')}</button>
              <button onClick={() => (setPreview(null), setPlaying(false))}>{t('workshop.exitPreview')}</button>
            </div>
          )}
          {!preview && onVariation && (
            <div className="ws-preview branch" role="status">
              <span className="ws-preview-seal">{t('workshop.branch')}</span>
              <span>
                {atEnd ? (
                  <>
                    {t('workshop.variation')}
                  </>
                ) : (
                  <>
                    {t('workshop.moveOf2', { cursor, movesCount: game.moves.length })} <strong className="ws-branch-tip">{t('workshop.playADifferentMoveTo')}</strong>
                  </>
                )}
              </span>
              <button title={t('workshop.goBackToTheMain')}
                onClick={() => {
                  let i = 0
                  const main = mainLine(tree)
                  while (i < game.moves.length && main[i] === game.moves[i]) i++
                  setGame((g) => ({ ...g, moves: main }))
                  setCursor(i)
                }}
              >
                {t('workshop.mainLine')}
              </button>
              <button onClick={() => setTree((t) => promote(t, game.moves))} title={t('workshop.makeThisVariationTheMain')}>
                {t('workshop.makeItMain')}
              </button>
            </div>
          )}
          {!preview && !onVariation && previewing && (
            <div className="ws-preview" role="status">
              <span className="ws-preview-seal">{playing ? t('workshop.play') : t('workshop.review2')}</span>
              <span>{playing ? t('workshop.playingTheLine') : <>{t('workshop.moveOf2', { cursor, movesCount: game.moves.length })} <strong className="ws-branch-tip">{mode === 'spar' || mode === 'analyze' ? t('workshop.playADifferentMoveTo') : t('workshop.aMoveHereReplacesWhat')}</strong></>}</span>
              <button onClick={() => (playing ? setPlaying(false) : (setCursor(game.moves.length), setPlaying(false)))}>{playing ? t('workshop.pause') : t('workshop.goToTheLastMove')}</button>
            </div>
          )}
          {mode === 'tsume' && <span className="ws-plate top"><span className="ws-plate-side">{flipped ? t('workshop.sente') : t('workshop.gote')}</span><span className="ws-muted">{(flipped ? 'sente' : 'gote') === userSide ? t('workshop.youAttack') : t('workshop.defends')}</span></span>}
          {mode === 'tsume' && <span className="ws-plate bottom"><span className="ws-plate-side">{flipped ? t('workshop.gote') : t('workshop.sente')}</span><span className="ws-muted">{(flipped ? 'gote' : 'sente') === userSide ? t('workshop.youAttack') : t('workshop.defends')}</span></span>}
          {mode !== 'tsume' && !(mode === 'lesson' && !course) && <Plate className="top" clock={clockFor(flipped ? 'sente' : 'gote')} position={position} color={flipped ? Color.BLACK : Color.WHITE} who={mode === 'analyze' || (mode === 'lesson' && !course) || (mode === 'drill' && !drillItem) ? null : (flipped ? 'sente' : 'gote') === userSide ? t('workshop.you') : t('workshop.opponent')} />}
          {compact && !drawer && (
            <button className="ws-phone-task" onClick={() => (studyReply ? play(studyReply.usi) : setDrawer(true))}>
              <span>{modeInstruction()}</span>
              <b>{studyReply ? t('workshop.playTheirMove') : mode === 'lesson' && !course ? t('workshop.pickALesson') : mode === 'drill' && !drillItem ? t('workshop.pickAQueue') : t('workshop.panel')} ›</b>
            </button>
          )}
          {mode !== 'tsume' && !(mode === 'lesson' && !course) && <Plate className="bottom" clock={clockFor(flipped ? 'gote' : 'sente')} position={position} color={flipped ? Color.WHITE : Color.BLACK} who={mode === 'analyze' || (mode === 'lesson' && !course) || (mode === 'drill' && !drillItem) ? null : (flipped ? 'gote' : 'sente') === userSide ? t('workshop.you') : t('workshop.opponent')} />}
          {((gameOver && game.moves.length > 0 && (mode === 'spar' || mode === 'analyze')) || ((resigned || clock.flagged) && mode === 'spar')) && endHidden !== sfen && (
            <div className="ws-gameover" role="status">
              <button className="ws-gameover-x" onClick={() => setEndHidden(sfen)} aria-label={t('workshop.hideThisAndLookAt')} title={t('workshop.lookAtTheBoard')}>
                ×
              </button>
              <strong>{clock.flagged && mode === 'spar' && !gameOver ? t('workshop.outOfTime') : resigned && !gameOver ? t('workshop.resigned') : t('workshop.checkmate')}</strong>
              <span>
                {clock.flagged && mode === 'spar' && !gameOver
                  ? t(clock.flagged === userSide ? 'workshop.youFlagged' : 'workshop.aiFlagged', { winner: t(clock.flagged === 'sente' ? 'common.gote' : 'common.sente') })
                  : resigned && !gameOver
                    ? t('workshop.youResigned', { winner: t(userSide === 'sente' ? 'common.gote' : 'common.sente') })
                    : t(mode !== 'spar' ? 'workshop.wins' : (toMove === 'sente' ? 'gote' : 'sente') === userSide ? 'workshop.youWin' : 'workshop.aiWins', { winner: t(toMove === 'sente' ? 'common.gote' : 'common.sente') })}
              </span>
              <div className="ws-actions">
                {mode === 'spar' && !flatView && <button onClick={() => window.dispatchEvent(new Event('shogilab:tableflip'))}>{t('rail.tableFlip')}</button>}
                {mode === 'spar' && (
                  <button onClick={reviewGame}>
                    {t('workshop.reviewThisGame')}
                  </button>
                )}
                {mode === 'spar' && (
                  <button className="primary" onClick={() => setNewGame(true)}>
                    {t('workshop.newGame')}
                  </button>
                )}
              </div>
            </div>
          )}
          {announce && (
            <div key={announce.key} className={`ws-announce ${announce.side === Color.BLACK ? 'sente' : 'gote'}`} role="status">
              <span>
                {announce.side === Color.BLACK ? t('workshop.sente') : t('workshop.gote')} {announce.kind}
              </span>
              <strong>{announce.name}</strong>
            </div>
          )}
          {boardNote && (
            <div className="ws-peek" role="status">
              {boardNote}
            </div>
          )}
          {!boardNote && mode === 'tsume' && tsume && tsume.status === 'playing' && tsume.good === 0 && tsume.hint >= 1 && (
            <div className="ws-peek ws-phone-only" role="status">
              {t('workshop.hintTheFirstMoveUses', { piece: pieceOfFirst(tsume.problem) })}
            </div>
          )}
          {promotion && (
            <div className="ws-promote" role="dialog" aria-label={t('workshop.promote')}>
              {promotion.map((m) => (
                <button key={m.usi} className={m.promote ? 'yes' : 'no'} onClick={() => void commit(m.usi)}>
                  <span className={`ws-koma${m.promote ? ' promoted' : ''}`}>{m.promote ? (PROMOTED_CHAR[m.pieceType] ?? PIECE_CHAR[m.pieceType]) : PIECE_CHAR[m.pieceType]}</span>
                  <span>{m.promote ? t('workshop.promote2') : t('workshop.donTPromote')}</span>
                </button>
              ))}
              <button className="cancel" onClick={() => (setPromotion(null), setSelection(null))} title={t('workshop.cancelThisMoveEsc')}>
                <span className="ws-koma-x">×</span>
                <span>{t('workshop.cancel')}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {twoPanels && zones && (
        <aside className="ws-panel ws-panel-left" style={{ ...zones.under }}>
          <div className="ws-tabs" role="tablist">
            <button role="tab" aria-selected className="on">
              <span className={ja ? 'ws-ja' : 'ws-en'}>{t('tabs.moves')}</span>
            </button>
          </div>
          {panelBody('moves')}
        </aside>
      )}
      <aside className={`ws-panel${sheetIsOpen ? ' open' : ''}`} style={zoned ? (zones && !panelPrefs.hidden ? { ...zones.over } : { display: 'none' }) : undefined}>
        {compact && (
          <div
            className="ws-sheet-grip"
            role="separator"
            aria-orientation="horizontal"
            onPointerDown={(e) => {
              e.preventDefault()
              const move = (ev: PointerEvent) => setSheetH(Math.round(Math.min(78, Math.max(22, 100 - (ev.clientY / window.innerHeight) * 100))))
              const up = () => {
                window.removeEventListener('pointermove', move)
                window.removeEventListener('pointerup', up)
                setSheetH((h) => {
                  try {
                    localStorage.setItem('joseki-practice:sheet:v1', String(h))
                  } catch (error) {
                    console.warn('sheet size not persisted', error)
                  }
                  return h
                })
              }
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', up)
            }}
          />
        )}
        <div
          className="ws-panel-resize"
          title={t('workshop.dragToResizeThePanel')}
          onPointerDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startW = panelWidth
            const move = (ev: PointerEvent) => setPanel({ width: Math.min(560, Math.max(320, startW + startX - ev.clientX)) })
            const up = () => {
              window.removeEventListener('pointermove', move)
              window.removeEventListener('pointerup', up)
            }
            window.addEventListener('pointermove', move)
            window.addEventListener('pointerup', up)
          }}
        />
        <button
          className="ws-sheet-handle"
          onClick={() => setSheetOpen(!sheetIsOpen)}
          onPointerDown={(e) => {
            const startY = e.clientY
            const up = (ev: PointerEvent) => {
              window.removeEventListener('pointerup', up)
              const dy = ev.clientY - startY
              if (dy < -30) setSheetOpen(true)
              else if (dy > 30) setSheetOpen(false)
            }
            window.addEventListener('pointerup', up)
          }}
          aria-label={sheetIsOpen ? t('workshop.collapsePanel') : t('workshop.expandPanel')}
        />
        <div className="ws-tabs" role="tablist">
          {TABS.filter((id) => !(twoPanels && id === 'moves')).map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              <span className={ja ? 'ws-ja' : 'ws-en'}>{t(`tabs.${id}`)}</span>
            </button>
          ))}
          <button className="ws-panel-close" onClick={() => setPanel({ hidden: true })} title={t('workshop.closeThePanelP')} aria-label={t('workshop.closeThePanel')}>
            ×
          </button>
        </div>
        {panelBody(tab)}
        <footer className="ws-nav" hidden={game.moves.length === 0 && !preview}>
          <button onClick={() => (preview ? setPreview({ ...preview, step: 0 }) : setCursor(0))} disabled={preview ? preview.step === 0 : cursor === 0} title={t('workshop.startHome')}>
            <Icon name="first" />
          </button>
          <button onClick={() => (preview ? setPreview({ ...preview, step: Math.max(0, preview.step - 1) }) : setCursor((c) => Math.max(0, c - 1)))} disabled={preview ? preview.step === 0 : cursor === 0} title={t('workshop.back')}>
            <Icon name="prev" />
          </button>
          <button className="ws-play" onClick={() => setPlaying((v) => !v)} disabled={!playing && (!upcoming || !autoplayAllowed)} title={playing ? t('workshop.pauseSpace') : t('workshop.playTheLineForwardSpace')} aria-pressed={playing}>
            <Icon name={playing ? 'pause' : 'play'} />
          </button>
          <button onClick={() => (preview ? setPreview({ ...preview, step: Math.min(preview.moves.length, preview.step + 1) }) : setCursor((c) => Math.min(game.moves.length, c + 1)))} disabled={preview ? preview.step >= preview.moves.length : atEnd} title={t('workshop.forward')}>
            <Icon name="next" />
          </button>
          <button onClick={() => (preview ? setPreview({ ...preview, step: preview.moves.length }) : setCursor(game.moves.length))} disabled={preview ? preview.step >= preview.moves.length : atEnd} title={t('workshop.latestEnd')}>
            <Icon name="last" />
          </button>
          <button onClick={() => (game.moves.length > 0 ? setConfirm({ text: t('workshop.startOverFromTheBeginning'), run: () => load(course ? course.root.sfen : InitialPositionSFEN.STANDARD, userSide, mode, course) }) : undefined)} title={t('workshop.startOver')}>
            <Icon name="reset" />
          </button>
        </footer>
      </aside>

      {newGame && (
        <NewGameDialog
          side={userSide}
          onClose={() => setNewGame(false)}
          onStart={(side) => {
            setNewGame(false)
            load(InitialPositionSFEN.STANDARD, side, 'spar', null)
          }}
        />
      )}
      {palette && <Palette commands={commands} onClose={() => setPalette(false)} />}
      {confirm && (
        <div className="ws-palette-back" onPointerDown={() => performance.now() - confirmAt.current > 250 && setConfirm(null)}>
          <div className="ws-dialog" role="alertdialog" aria-label={t('workshop.confirm')} onPointerDown={(e) => e.stopPropagation()}>
            <p>{confirm.text}</p>
            <div className="ws-actions">
              <button onClick={() => setConfirm(null)} autoFocus>
                {confirm.no ?? t('workshop.keepPlaying')}
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (performance.now() - confirmAt.current < 250) return
                  confirm.run()
                  setConfirm(null)
                }}
              >
                {confirm.yes ?? t('workshop.yesStartNew')}
              </button>
            </div>
          </div>
        </div>
      )}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} level={level} onLevel={setLevel} />}
      {showViewer && <PieceViewer onClose={() => setShowViewer(false)} />}
      {welcome && (
        <div className="ws-palette-back">
          <div className="ws-dialog ws-welcome" role="dialog" aria-label={t('workshop.welcome')}>
            <div className="ws-steps" aria-hidden="true">
              {[0, 1, 2].map((n) => (
                <i key={n} className={n === welcomeStep ? 'on' : n < welcomeStep ? 'done' : ''} />
              ))}
            </div>
            {welcomeStep === 0 && (
              <>
                <h2>{t('workshop.welcomeToShogilab')}</h2>
                <p>{t('workshop.aWorkshopForLearningThe')}</p>
                <div className="ws-welcome-choices">
                  <button className={level === 'rules' ? 'primary' : ''} onClick={() => (setLevelOnly('rules'), setWelcomeStep(1))}>
                    <strong>{t('workshop.iKnowTheRules')}</strong>
                    <span>{t('workshop.iCanRead7Style')}</span>
                  </button>
                  <button className={level === 'new' ? 'primary' : ''} onClick={() => (setLevelOnly('new'), setWelcomeStep(1))}>
                    <strong>{t('workshop.newToShogi')}</strong>
                    <span>{t('workshop.showHowEachPieceMoves')}</span>
                  </button>
                </div>
              </>
            )}
            {welcomeStep === 1 && (
              <>
                <h2>{t('workshop.howTheScreenWorks')}</h2>
                <ul className="ws-tour">
                  {MODES.map((m) => (
                    <li key={m.id}>
                      <Icon name={m.icon} size={18} />
                      <strong>{t(`modes.${m.id}.name`)}</strong>
                      <span>{t('modes.sentence', { hint: t(`modes.${m.id}.hint`) })}</span>
                    </li>
                  ))}
                  <li>
                    <Icon name="coach" size={18} />
                    <strong>{t('workshop.sidePanel')}</strong>
                    <span>{t('workshop.coachExplainsMovesAiRates')}</span>
                  </li>
                  <li>
                    <Icon name="prev" size={18} />
                    <strong>{t('workshop.stepBack')}</strong>
                    <span>{t('workshop.andWalkThroughMovesPlay')}</span>
                  </li>
                </ul>
                <div className="ws-actions">
                  <button onClick={() => setWelcomeStep(0)}>{t('workshop.back2')}</button>
                  <button className="primary" onClick={() => setWelcomeStep(2)}>
                    {t('workshop.next')}
                  </button>
                </div>
              </>
            )}
            {welcomeStep === 2 && (
              <>
                <h2>{t('workshop.whereDoYouWantTo')}</h2>
                <div className="ws-welcome-choices">
                  <button
                    className="primary"
                    onClick={() => {
                      finishWelcome()
                      const first = COURSES.find((c) => c.id === SETUPS[0].courseIds[0])
                      if (first) openCourse(first, 'study')
                    }}
                  >
                    <strong>{t('workshop.learnTheBasicFourthFile')}</strong>
                    <span>{t('workshop.studyModeWalksYouThrough')}</span>
                  </button>
                  <button onClick={() => (finishWelcome(), load(InitialPositionSFEN.STANDARD, 'sente', 'spar', null))}>
                    <strong>{t('workshop.playTheAi')}</strong>
                    <span>{t('workshop.beginnerStrengthTheCoachRates')}</span>
                  </button>
                  <button onClick={() => (finishWelcome(), enterMode('tsume'))}>
                    <strong>{t('workshop.solveMateInOne')}</strong>
                    <span>{t('workshop.mateInOnePuzzlesTo')}</span>
                  </button>
                  <button onClick={finishWelcome}>
                    <strong>{t('workshop.justLookAround')}</strong>
                    <span>{t('workshop.pickAnythingFromTheLesson')}</span>
                  </button>
                </div>
                <p className="ws-muted">{t('workshop.yourLevelAndDisplayOptions')}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function neutralNote(note: string | undefined, course: Course) {
  if (!note) return note
  const other = course.userSide === 'sente' ? '後手' : '先手'
  const mine = course.userSide === 'sente' ? '先手' : '後手'
  return note.replace(/相手/g, other).replace(/こちら|自分/g, mine)
}

function neutralBranch<T extends { note?: string; punishNote?: string }>(branch: T, course: Course): T {
  return { ...branch, note: neutralNote(branch.note, course), punishNote: neutralNote(branch.punishNote, course) }
}

function uniqueBook(sfen: string) {
  const seen = new Map<string, { usi: string; note?: string; kind: string }>()
  for (const hit of [...bookLookup(sfen)].sort((a, b) => Number(a.course.notesFromOpponentView) - Number(b.course.notesFromOpponentView)))
    for (const b of hit.node.branches) {
      if (b.kind === 'deviation' || !b.child) continue
      const existing = seen.get(b.usi)
      const note = neutralNote(b.note, hit.course)
      if (!existing) seen.set(b.usi, { usi: b.usi, note, kind: b.kind })
      else if (!existing.note && note) existing.note = note
    }
  return [...seen.values()]
}

function useReview(sfens: string[], moves: string[], cursor: number, enabled: boolean) {
  const [state, setState] = useState<{ key: string; review: MoveReview } | null>(null)
  const key = cursor > 0 ? `${sfens[cursor - 1]}|${moves[cursor - 1]}` : ''
  useEffect(() => {
    if (!key || !enabled || !engineSupported()) return
    let cancelled = false
    const [prev, usi] = key.split('|')
    const known = cachedReview(prev, usi)
    if (known) {
      queueMicrotask(() => !cancelled && setState({ key, review: known }))
      return () => {
        cancelled = true
      }
    }
    reviewMove(prev, usi, { inBook: bookLookup(prev).some((h) => h.node.branches.some((b) => b.usi === usi && b.kind !== 'deviation')) })
      .then((review) => {
        rememberReview(prev, usi, review)
        if (!cancelled) setState({ key, review })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [key, enabled])
  return enabled && state?.key === key ? state.review : null
}

function standing(rate: number) {
  const lead = Math.abs(Math.round(rate * 100) - 50) / 100
  const side = rate > 0.5 ? i18n.t('engine.sente') : i18n.t('engine.gote')
  if (lead < 0.04) return i18n.t('engine.thePositionIsEven')
  if (lead < 0.12) return i18n.t('engine.isSlightlyBetter', { side })
  if (lead < 0.25) return i18n.t('engine.isBetter', { side })
  if (lead < 0.4) return i18n.t('engine.isClearlyBetter', { side })
  return i18n.t('engine.isWinning', { side })
}

function EnginePane({ sfen, toMove, analysis, showBest, setShowBest, onPlay, canPlay, book }: { sfen: string; toMove: Side; analysis: ReturnType<typeof useAnalysis>['analysis']; showBest: boolean; setShowBest: (v: boolean) => void; onPlay: (usi: string) => void; canPlay: boolean; book: { usi: string; note?: string }[] }) {
  const { t } = useTranslation()
  const [openLine, setOpenLine] = useState<number | null>(null)
  if (!engineSupported()) return <p className="ws-muted">{t('engine.theAiNeedsACross')}</p>
  if (!analysis || !analysis.candidates.length)
    return (
      <>
        <EngineName />
        <p className="ws-muted">{t('engine.analysingThePosition')}</p>
      </>
    )
  const [best, ...others] = analysis.candidates
  const bestRate = scoreWinRate(best.score)
  const senteRate = scoreWinRate(toSente(best.score, toMove))
  const why = (usi: string) => {
    const note = book.find((b) => b.usi === usi)?.note
    const what = describeMove(sfen, usi)
    return [note, what.length ? `It ${what.join(', ')}.` : null].filter(Boolean).join(' ')
  }
  const answer = (c: (typeof analysis.candidates)[number]) => {
    if (c.pv.length < 2) return null
    const after = applyUsi(sfen, c.move)
    return after ? moveText(after, c.pv[1]) : null
  }
  return (
    <div className="ws-engine">
      <EngineName />
      <div className="ws-standing">
        <strong>{standing(senteRate)}</strong>
        <div className="ws-meter" aria-hidden="true">
          <span style={{ width: `${senteRate * 100}%` }} />
        </div>
        <span className="ws-muted">
          {t('engine.winChanceAgainst', { value: Math.round(senteRate * 100), value2: Math.round((1 - senteRate) * 100) })}
        </span>
      </div>

      <div className="ws-best">
        <span className="ws-muted">{t('engine.bestMoveFor', { side: toMove === 'sente' ? '☗' : '☖' })}</span>
        <div className="ws-best-row">
          <strong>{moveText(sfen, best.move)}</strong>
          {book.some((b) => b.usi === best.move) && <span className="ws-pill">{t('engine.book')}</span>}
          {canPlay && <button onClick={() => onPlay(best.move)}>{t('engine.playIt')}</button>}
        </div>
        {why(best.move) && <p>{why(best.move)}</p>}
        {answer(best) && <p className="ws-muted">{t('engine.theyWouldLikelyAnswer', { move: answer(best) })}</p>}
      </div>

      {others.length > 0 && <h3 className="ws-sub">{t('engine.otherMoves')}</h3>}
      {others.map((c) => {
        const loss = Math.max(0, Math.round((bestRate - scoreWinRate(c.score)) * 100))
        return (
          <div key={c.multipv} className="ws-alt">
            <div className="ws-alt-row">
              <strong>{moveText(sfen, c.move)}</strong>
              <span className={`ws-loss${loss >= 10 ? ' bad' : loss >= 4 ? ' meh' : ''}`}>{loss === 0 ? t('engine.justAsGood') : t('engine.winChance', { loss })}</span>
              {canPlay && <button onClick={() => onPlay(c.move)}>{t('engine.play')}</button>}
            </div>
            {why(c.move) && <p>{why(c.move)}</p>}
          </div>
        )
      })}

      <button className="ws-more" onClick={() => setOpenLine(openLine === null ? 1 : null)}>
        {openLine === null ? t('engine.seeHowTheBestLine') : t('engine.hideTheLine')}
      </button>
      {openLine !== null && <p className="ws-pv">{pvText(sfen, best.pv, 8)}</p>}

      <label className="ws-toggle">
        <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} />
        <span>{t('engine.showTheBestMoveAs')}</span>
      </label>
    </div>
  )
}

function CoachPane(props: {
  review: MoveReview | null
  lastMove?: string
  prevSfen: string | null
  bookLast: { branch: { note?: string; punishNote?: string; kind: string; aim?: string }; course: Course } | null
  bookHere: { usi: string; note?: string; kind: string }[]
  sfen: string
  course: Course | null
  onPlay: (usi: string) => void
  canPlay: boolean
  hide: boolean
  ai: boolean
  showBook: boolean
  you?: boolean
}) {
  const { t } = useTranslation()
  const { review, lastMove, prevSfen, bookLast, bookHere, sfen, course, onPlay, canPlay, hide, ai, showBook, you } = props
  return (
    <div className="ws-coach">
      {lastMove && prevSfen ? (
        <div className="ws-verdict">
          {review ? (
            <>
              <div className="ws-verdict-head">
                <span className="ws-badge" style={{ background: LABELS[review.label].color }}>
                  {LABELS[review.label].symbol}
                </span>
                <strong>
                  {you ? t('coach.yourMove') : ''}
                  {moveText(prevSfen, lastMove)}
                </strong>
                <span style={{ color: LABELS[review.label].color }}>{LABELS[review.label].text}</span>
              </div>
              {bookLast?.branch.note && <p className="ws-note">{bookLast.branch.note}</p>}
              {bookLast?.branch.kind === 'deviation' && bookLast.branch.punishNote && <p className="ws-note warn">{bookLast.branch.punishNote}</p>}
              {review.reasons.slice(0, 2).map((r) => (
                <p key={r} className="ws-reason">
                  {r}
                </p>
              ))}
              {['inaccuracy', 'mistake', 'miss', 'blunder'].includes(review.label) && review.best.move !== lastMove && !review.reasons.some((r) => r.startsWith('The best move')) && (
                <p className="ws-reason">
                  {t('coach.betterWas')}<strong>{moveText(prevSfen, review.best.move)}</strong>
                  {review.bestReasons[0] && !review.bestReasons[0].startsWith('Engine line') ? `: ${review.bestReasons[0]}` : t('coach.betterWasEnd')}
                </p>
              )}
            </>
          ) : bookLast && bookLast.branch.kind !== 'deviation' ? (
            <>
              <div className="ws-verdict-head">
                <span className="ws-badge" style={{ background: LABELS.book.color }}>
                  {LABELS.book.symbol}
                </span>
                <strong>{moveText(prevSfen, lastMove)}</strong>
                <span style={{ color: LABELS.book.color }}>{t('coach.bookMove')}</span>
              </div>
              {bookLast.branch.note && <p className="ws-note">{bookLast.branch.note}</p>}
            </>
          ) : bookLast ? (
            <>
              <div className="ws-verdict-head">
                <span className="ws-badge" style={{ background: LABELS.mistake.color }}>
                  {LABELS.mistake.symbol}
                </span>
                <strong>{moveText(prevSfen, lastMove)}</strong>
                <span style={{ color: LABELS.mistake.color }}>{t('coach.knownMistake')}</span>
              </div>
              {(bookLast.branch.punishNote ?? bookLast.branch.note) && <p className="ws-note warn">{bookLast.branch.punishNote ?? bookLast.branch.note}</p>}
            </>
          ) : ai ? (
            <p className="ws-muted">{t('coach.checking', { move: moveText(prevSfen, lastMove) })}</p>
          ) : (
            <p className="ws-muted">{t('coach.isOffTheBookTurn', { move: moveText(prevSfen, lastMove) })}</p>
          )}
        </div>
      ) : (
        <p className="ws-muted">{course ? course.root.comment ?? course.goalFormation : t('coach.makeAMoveTheCoach')}</p>
      )}
      {showBook && bookHere.length > 0 && (
        <div className="ws-book">
          <h3>{t('coach.bookMovesFromTheLessons')}</h3>
          {hide ? (
            <p className="ws-muted">{t('coach.yourMoveFindTheBook')}</p>
          ) : (
            bookHere.map((b) => (
              <button key={b.usi} className="ws-book-move" disabled={!canPlay} onClick={() => onPlay(b.usi)}>
                <strong>{moveText(sfen, b.usi)}</strong>
                {b.note && <span>{b.note}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function MovesPane({ sfens, moves, cursor, setCursor, title, onScore, tree, onSwitch, onDelete, autoRate, canRate = true }: { canRate?: boolean; sfens: string[]; moves: string[]; cursor: number; setCursor: (i: number) => void; title: string; onScore?: (sfen: string, cp: number) => void; tree?: Tree | null; onSwitch?: (path: string[]) => void; onDelete?: (path: string[], size: number) => void; autoRate?: boolean }) {
  const { t } = useTranslation()
  const [, setTick] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const tesujis = useMemo(() => moves.map((usi, i) => (sfens[i] ? detectTesuji(sfens[i], usi) : null)), [moves, sfens])
  useEffect(() => {
    const row = listRef.current?.querySelector('button.on') ?? listRef.current?.lastElementChild
    row?.scrollIntoView({ block: 'nearest' })
  }, [cursor, moves.length])
  const [progress, setProgress] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const reviews = moves.map((usi, i) => cachedReview(sfens[i], usi) ?? null)
  const rated = moves.length > 0 && reviews.every(Boolean)
  const current = rated || reviews.some(Boolean) ? { items: reviews.map((r) => r?.label ?? null), reviews } : null
  const rateRef = useRef<() => Promise<void>>(async () => undefined)
  const autoStarted = useRef(false)
  useEffect(() => {
    if (!autoRate || autoStarted.current || rated || progress !== null || moves.length === 0 || !engineSupported()) return
    autoStarted.current = true
    void rateRef.current()
  })
  if (moves.length === 0) return <p className="ws-muted">{t('moves.noMovesYetPlayOn')}</p>
  const rate = async () => {
    setSaved(null)
    const results = new Map<number, Awaited<ReturnType<typeof analyze>>>()
    const at = async (n: number) => {
      const hit = results.get(n)
      if (hit) return hit
      const result = await analyze(usiPosition(sfens[n]), { multipv: 2, movetime: 400 })
      results.set(n, result)
      const top = result.candidates[0]
      if (top) onScore?.(strip(sfens[n]), scoreToCp(toSente(top.score, colorSide(positionOf(sfens[n]).color))))
      return result
    }
    let previousLoss = 0
    for (let i = 1; i <= moves.length; i++) {
      const usi = moves[i - 1]
      const known = cachedReview(sfens[i - 1], usi)
      if (known) {
        previousLoss = known.loss
        continue
      }
      setProgress(i)
      const before = await at(i - 1)
      const after = await at(i)
      if (before.candidates.length) {
        const inBook = bookLookup(sfens[i - 1]).some((h) => h.node.branches.some((b) => b.usi === usi && b.kind !== 'deviation'))
        const review = classify({ sfen: sfens[i - 1], usi, before, after, inBook, previousLoss })
        previousLoss = review.loss
        rememberReview(sfens[i - 1], usi, review)
      }
      setTick((t) => t + 1)
    }
    setProgress(null)
  }
  rateRef.current = rate

  const savedIds = new Set(loadMistakes().map((m) => m.id))
  const allSaved = reviews.every((r, i) => !r || !['mistake', 'miss', 'blunder'].includes(r.label) || savedIds.has(`${sfens[i]}|${moves[i]}`))
  const saveMine = () => {
    const bad: Label[] = ['mistake', 'miss', 'blunder']
    const items = reviews.flatMap((r, i) =>
      r && bad.includes(r.label)
        ? [{ id: `${sfens[i]}|${moves[i]}`, sfen: sfens[i], played: moves[i], best: r.best.move, bestPv: r.best.pv, label: r.label, reasons: r.reasons, game: title, ply: i + 1 }]
        : [],
    )
    setSaved(saveMistakes(items))
  }
  const cell = (i: number) => {
    const usi = moves[i]
      const label = current?.items[i]
      const siblings = tree ? (nodeAt(tree, moves.slice(0, i))?.children ?? []).filter((c) => c.usi !== usi) : []
      return (
        <div key={i} className={[siblings.length ? 'has-vars' : '', tree && !isMainLine(tree, moves.slice(0, i + 1)) ? 'in-var' : ''].join(' ')}>
          <button className={cursor === i + 1 ? 'on' : ''} onClick={() => setCursor(i + 1)}>
            {moveText(sfens[i], usi, moves[i - 1])}
            {tesujis[i] && (
              <span className="ws-move-tesuji" title={t('moves.tesuji', { value: tesujis[i]!.ja, value2: tesujis[i]!.explain })}>
                {tesujis[i]!.ja}
              </span>
            )}
            {label && label !== 'good' && label !== 'excellent' && label !== 'best' && (
              <span className="ws-move-label" style={{ color: LABELS[label].color }} title={LABELS[label].text}>
                {LABELS[label].symbol}
              </span>
            )}
          </button>
          {siblings.length > 0 && (
            <span className="ws-vars">
              <span className="ws-vars-tag">{t('moves.var')}</span>
              {siblings.map((c) => (
                <span key={c.usi} className="ws-var">
                  <button onClick={() => onSwitch?.([...moves.slice(0, i), c.usi])} title={t('moves.switchToThisLine')}>
                    {moveText(sfens[i], c.usi, moves[i - 1])}
                    {c.children.length > 0 && <small> +{countMoves(c)}</small>}
                  </button>
                  <button className="ws-var-x" onClick={() => onDelete?.([...moves.slice(0, i), c.usi], countMoves(c) + 1)} aria-label={t('moves.deleteThisVariation')} title={t('moves.deleteThisVariation')}>
                    ×
                  </button>
                </span>
              ))}
            </span>
          )}
        </div>
      )
  }
  const mistakes = current?.items.filter((l) => l === 'mistake' || l === 'miss' || l === 'blunder').length ?? 0
  return (
    <div>
      <div className="ws-rate">
        {engineSupported() && canRate && progress === null && !rated && <button onClick={rate}>{current ? t('moves.rateTheRemainingMoves') : t('moves.rateEveryMove')}</button>}
        {progress !== null && <span className="ws-muted">{t('moves.ratingMoveOf', { progress, movesCount: moves.length })}</span>}
        {rated && progress === null && (
          <>
            <span className="ws-muted">{mistakes ? t('moves.mistakesFound', { count: mistakes }) : t('moves.noMistakesFound')}</span>
            {mistakes > 0 && saved === null && !allSaved && <button onClick={saveMine}>{t('moves.saveThemAsReviewCards')}</button>}
            {mistakes > 0 && saved === null && allSaved && <span className="ws-muted">{t('moves.alreadySavedToReview')}</span>}
            {saved !== null && <span className="ws-muted">{t('moves.allSaved', { count: mistakes })}</span>}
          </>
        )}
      </div>
      <ol className="ws-moves" ref={listRef} title={t('moves.bookMoveInaccuracyMistakeBlunder')}>
        {Array.from({ length: Math.ceil(moves.length / 2) }, (_, r) => (
          <li key={r} className="ws-move-row">
            <span className="ws-move-no">{r + 1}.</span>
            {[2 * r, 2 * r + 1].map((i) => (i < moves.length ? cell(i) : <span key={i} />))}
          </li>
        ))}
      </ol>
    </div>
  )
}

function countMoves(node: Tree): number {
  let n = 0
  const walk = (t: Tree) => t.children.forEach((c) => (n++, walk(c)))
  walk(node)
  return n
}

function pieceOfFirst(problem: Problem) {
  const position = positionOf(problem.sfen)
  const move = position.createMoveByUSI(problem.pv[0])
  if (!move) return i18n.t('tsume.pieces')
  const name = PIECE_INFO[move.pieceType]
  return move.from instanceof Square ? i18n.t('tsume.onTheBoard', { ja: name.ja }) : i18n.t('tsume.inHandADrop', { ja: name.ja })
}

function TesujiPane({ drill, sfen, onFilter, onNext, onHint, onShow }: { drill: { item: TesujiDrill; filter: string; status: 'asking' | 'right' | 'shown'; missed: boolean; hint: boolean; wrong?: string }; sfen: string; onFilter: (f: string) => void; onNext: () => void; onHint: () => void; onShow: () => void }) {
  const { t } = useTranslation()
  const stats = tesujiStats()
  const pool = TESUJI_DRILLS.filter((d) => drill.filter === 'all' || d.tesuji === drill.filter)
  const side = colorSide(positionOf(sfen).color) === 'sente' ? '☗' : '☖'
  const lang = useSettings().lang
  return (
    <div className="ws-practice">
      <div className="ws-seg small ws-tesuji-filter" role="group" aria-label={t('tesuji.tesujiType')}>
        {['all', ...TESUJI_KINDS].map((k) => (
          <button key={k} className={drill.filter === k ? 'on' : ''} onClick={() => onFilter(k)}>
            {k === 'all' ? t('tesuji.mixed') : k}
          </button>
        ))}
      </div>
      <p className="ws-task">
        {t('tesuji.toMoveFindThe', { side })}
        {drill.hint || drill.status !== 'asking' ? <strong>{drill.item.tesuji}</strong> : t('tesuji.tesuji')}
        {t('tesuji.findTheEnd')}
      </p>
      {drill.status === 'asking' && drill.wrong && <p className="ws-result wrong">{drill.hint ? t('tesuji.isNotItLookAgain', { move: moveText(sfen, drill.wrong) }) : t('tesuji.isNotItLookAgain2', { move: moveText(sfen, drill.wrong) })}</p>}
      {drill.status === 'asking' && drill.hint && <p className="ws-note">{drill.item.explain}</p>}
      {drill.status !== 'asking' && (
        <div className={`ws-card ${drill.status === 'right' ? 'good' : ''}`}>
          <strong>
            {drill.status === 'right' ? '✓ ' : ''}
            {moveText(sfen, drill.item.answer)}: {drill.item.tesuji} {lang !== 'ja' && <span className="ws-muted">({drill.item.en})</span>}
          </strong>
          <p>{drill.item.explain}</p>
          {drill.item.note && <p className="ws-note">{drill.item.note}</p>}
          <p className="ws-muted">{t('tesuji.from', { from: drill.item.from })}</p>
        </div>
      )}
      <div className="ws-actions">
        <button className="primary" onClick={onNext}>
          {t('tesuji.next')}
        </button>
        {drill.status === 'asking' && !drill.hint && <button onClick={onHint}>{t('tesuji.hint')}</button>}
        {drill.status === 'asking' && <button onClick={onShow}>{t('tesuji.showAnswer')}</button>}
      </div>
      <p className="ws-muted">
        {t('tesuji.solvedFirstTryOf', { value: pool.filter((d) => stats.solved.includes(d.id)).length, poolCount: pool.length })}
      </p>
    </div>
  )
}

function TsumePane({ tsume, onLength, onNext, onRetry, onHint, onShow, escape, onEscape }: { tsume: { problem: Problem; status: string; reason?: string; hint: number; length: number | 'all'; good: number; missed?: boolean; seen?: boolean }; onLength: (n: number | 'all') => void; onNext: () => void; onRetry: () => void; onHint: () => void; onShow: () => void; escape: boolean; onEscape: () => void }) {
  const { t } = useTranslation()
  const stats = loadTsumeStats()
  const pool = PROBLEMS.filter((p) => tsume.length === 'all' || p.mate === tsume.length)
  const attacker = attackerOf(tsume.problem)
  return (
    <div className="ws-practice">
      <div className="ws-seg small" role="group" aria-label={t('tsume.problemLength')}>
        {([1, 3, 5, 7, 'all'] as const).map((n) => (
          <button key={n} className={tsume.length === n ? 'on' : ''} onClick={() => onLength(n)}>
            {n === 'all' ? t('tsume.mixed') : t('tsume.mateIn', { n })}
          </button>
        ))}
      </div>
      <p className="ws-task">
        {t('tsume.toPlayAndMateIn', { side: attacker === 'sente' ? '☗' : '☖', mate: tsume.problem.mate })}<span className="ws-wide">{t('tsume.everyAttackingMoveMustGive')}</span>
      </p>
      <div className="ws-tsume-status">
        {tsume.status === 'checking' ? (
          <p className="ws-muted">{t('tsume.checkingYourMove')}</p>
        ) : tsume.status === 'solved' ? (
          <p className="ws-result right">{tsume.seen ? t('tsume.mateSolvedAfterSeeingThe') : tsume.hint >= 2 ? t('tsume.mateSolvedAfterTheFirst') : tsume.missed ? t('tsume.mateSolvedOnASecond') : t('tsume.mateSolved')}</p>
        ) : tsume.status === 'wrong' ? (
          <p className="ws-result wrong">{t('tsume.notMate')} {tsume.reason}</p>
        ) : tsume.status === 'shown' ? (
          <p className="ws-pv">{t('tsume.solution')}{pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}</p>
        ) : tsume.good > 0 ? (
          <p className="ws-result right">{t('tsume.checkAndStillMateIn')}</p>
        ) : (
          <p className={tsume.hint >= 1 ? 'ws-note ws-hint-line' : 'ws-note ws-hint-line idle'}>
            {tsume.hint >= 1 ? t('tsume.hintTheFirstMoveUses', { piece: pieceOfFirst(tsume.problem) }) + (tsume.hint >= 2 ? t('tsume.theYellowArrowShowsIt') : '') : t('tsume.stuckHintTellsYouWhich')}
          </p>
        )}
      </div>
      <div className="ws-actions">
        <button className="primary" onClick={onNext}>
          {t('tsume.nextProblem')}
        </button>
        {(tsume.status === 'playing' || tsume.status === 'wrong') && <button onClick={onShow}>{t('tsume.showSolution')}</button>}
        {(tsume.status === 'wrong' || tsume.status === 'shown') && <button onClick={onRetry}>{t('tsume.tryAgain')}</button>}
        {tsume.status === 'playing' && <button onClick={onHint} disabled={tsume.hint >= 2}>{tsume.hint === 0 ? t('tsume.hint') : t('tsume.showMove')}</button>}
      </div>
      <label className="ws-check-row">
        <input type="checkbox" checked={escape} onChange={onEscape} />
        <span>{t('tsume.escapeSquaresShowWhereThe')}</span>
      </label>
      {tsume.status === 'solved' && <p className="ws-pv">{t('tsume.solution')}{pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}</p>}
      <p className="ws-muted">
        {t('tsume.solvedOfInThisSet', { value: pool.filter((p) => stats.solved.includes(p.id)).length, poolCount: pool.length })}
      </p>
    </div>
  )
}

function sfenAfter(start: string, moves: string[]) {
  return moves.reduce((s, usi) => applyUsi(s, usi) ?? s, start)
}

function untilText(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return i18n.t('review.inMin', { minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 48) return i18n.t('review.inH', { hours })
  return i18n.t('review.inDays', { count: Math.round(hours / 24) })
}

function ReviewPane({ drill, item, startSfen, onQueue, onNext, onRetry, mistakePreview, mistakeOk }: { drill: { queue: ReviewQueue; items: ReviewItem[]; index: number; result: null | 'right' | 'wrong'; retry: boolean; answered: number } | null; item: ReviewItem | undefined; startSfen: string | null; onQueue: (q: ReviewQueue) => void; onNext: () => void; onRetry: () => void; mistakePreview: boolean; mistakeOk?: boolean }) {
  const { t } = useTranslation()
  const counts = useMemo(() => reviewCounts(), [drill?.queue, drill?.index, drill?.items])
  const queues: { id: ReviewQueue; label: string; n: number }[] = [
    { id: 'due', label: t('review.due'), n: counts.due },
    { id: 'new', label: t('review.learnNew'), n: counts.new },
    { id: 'difficult', label: t('review.difficult'), n: counts.difficult },
    { id: 'mistakes', label: t('review.myGameMistakes'), n: counts.mistakes },
  ]
  return (
    <div className="ws-practice">
      <div className="ws-seg" role="group" aria-label={t('review.reviewQueue')}>
        {queues.map((q) => (
          <button key={q.id} className={drill?.queue === q.id ? 'on' : ''} onClick={() => onQueue(q.id)}>
            {q.label} <span>{q.n > 99 ? '99+' : q.n}</span>
          </button>
        ))}
      </div>
      {item && startSfen ? (
        <>
          <p className="ws-muted">
            {t('review.cardOf', { value: drill!.index + 1, itemsCount: drill!.items.length })}
            {item.kind === 'position' ? t('review.from', { title: item.course.title }) : ''}
            {item.kind === 'position' && item.moves.length > 0 ? t('review.after', { move: moveText(item.moves.length > 1 ? sfenAfter(item.course.root.sfen, item.moves.slice(0, -1)) : item.course.root.sfen, item.moves.at(-1)!) }) : ''}
          </p>
          {!drill!.result && <p className="ws-task">{item.kind === 'position' ? (drill!.queue === 'new' && !drill!.result && !drill!.retry ? t('review.newPositionPlayGreenArrow', { move: moveText(startSfen, expectedMoves(item)[0]) }) : t('review.yourMoveAsPlayThe', { side: item.course.userSide === 'sente' ? '☗' : '☖' })) : t('review.inGameYouPlayed', { game: item.mistake.game === 'Imported game' ? t('review.anImportedGame') : item.mistake.game, move: moveText(item.mistake.sfen, item.mistake.played) })}</p>}
          {drill!.retry && !drill!.result && <p className="ws-muted">{t('review.retryOnlyYourFirstTry')}</p>}
          {item.kind === 'position' && drill!.queue === 'new' && !drill!.result && !drill!.retry && item.node.branches.find((b) => b.usi === expectedMoves(item)[0])?.note && <p className="ws-note">{item.node.branches.find((b) => b.usi === expectedMoves(item)[0])!.note}</p>}
          {drill!.result === 'right' && <p className="ws-result right">{drill!.retry ? t('review.rightThisTimeTheCard') : t('review.rightItComesBackLater')}</p>}
          {drill!.result === 'wrong' && (
            <p className={`ws-result ${mistakeOk ? 'ok' : 'wrong'}`}>
              {mistakeOk ? t('review.aGoodMoveTooBut', { move: moveText(startSfen, expectedMoves(item)[0]) }) : t('review.notThisOneTheBetter', { move: moveText(startSfen, expectedMoves(item)[0]) })}{mistakePreview ? t('review.theBoardIsShowingWhat') : t('review.itIsMarkedWithA')}
              {!drill!.retry && t('review.thisCardComesBackIn')}
            </p>
          )}
          {item.kind === 'position' && drill!.result && item.node.branches.find((b) => b.usi === expectedMoves(item)[0])?.note && <p className="ws-note">{item.node.branches.find((b) => b.usi === expectedMoves(item)[0])!.note}</p>}
          {item.kind === 'mistake' && drill!.result === 'wrong' && !drill!.retry && item.mistake.reasons[0] && <p className="ws-note">{t('review.whyYourGameMoveWas')}{item.mistake.reasons[0]}</p>}
          <div className="ws-actions">
            {drill!.result && <button onClick={onRetry}>{t('review.tryItAgain')}</button>}
            <button className="primary" onClick={onNext}>
              {drill!.result ? t('review.nextCard') : t('review.skip')}
            </button>
          </div>
        </>
      ) : (
        <div className="ws-card">
          <strong>{drill && drill.items.length > 0 ? t('review.doneAnswered', { answered: drill.answered, count: drill.items.length }) : drill?.queue === 'due' ? t('review.nothingDueRightNow') : t('review.nothingInThisQueue')}</strong>
          {counts.new > 0 && drill?.queue !== 'new' && (
            <button className="primary" onClick={() => onQueue('new')}>
              {t('review.learnNewPositions', { count: Math.min(10, counts.new) })}
            </button>
          )}
          {counts.started > 0 && Number.isFinite(counts.nextDue) && counts.nextDue > Date.now() && (
            <p>
              {t('review.inSchedule', { count: counts.started, when: untilText(counts.nextDue - Date.now()) })}
            </p>
          )}
          {drill?.queue === 'mistakes' && counts.mistakes === 0 && <p>{t('review.yourOwnMistakesLandHere')}</p>}
          {drill?.queue === 'difficult' && <p>{t('review.aPositionLandsHereAfter')}</p>}
          {counts.started === 0 && drill?.queue !== 'mistakes' && drill?.queue !== 'difficult' && <p>{t('review.positionsYouQuizInOpenings')}</p>}
        </div>
      )}
    </div>
  )
}

type Mistake = { usi: string; loss: number | null; known: boolean; verdict?: MoveReview }

const mistakeIsBad = (m: Mistake) => m.known || (m.verdict ? ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(m.verdict.label) : (m.loss ?? 0) >= 8)

function mistakeSeal(m: Mistake) {
  const label = m.verdict?.label
  if (label === 'blunder') return i18n.t('mistake.blunder')
  if (label === 'mistake' || label === 'miss' || (m.known && !label)) return i18n.t('mistake.mistake')
  if (label === 'inaccuracy') return i18n.t('mistake.inaccuracy')
  if (!mistakeIsBad(m)) return i18n.t('mistake.other')
  return '✗'
}

function mistakeHeadline(move: string, m: Mistake) {
  if (m.verdict && !m.known) {
    const label = LABELS[m.verdict.label].text
    const loss = m.loss ? i18n.t('mistake.winChance', { loss: m.loss }) : ''
    return ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(m.verdict.label) ? `${move}: ${label}${loss}` : i18n.t('mistake.butNotThisLessonS', { move, label })
  }
  if (m.known) return i18n.t('mistake.isAKnownMistake', { move })
  if ((m.loss ?? 0) >= 8) return i18n.t('mistake.isAMistakeWinChance', { move, loss: m.loss })
  return i18n.t('mistake.isPlayableButNotThis', { move })
}

function OpeningPicker({ onOpen, level, setupId, setSetupId }: { onOpen: (c: Course, sub: 'study' | 'quiz') => void; level: Level; setupId: string | null; setSetupId: (id: string | null) => void }) {
  const { t } = useTranslation()
  useEffect(() => {
    document.querySelector('.ws-panel-body')?.scrollTo(0, 0)
  }, [setupId])
  const [query, setQuery] = useState('')
  const ja = useSettings().lang === 'ja'
  const q = query.trim().toLowerCase()
  const groups = SETUPS.map((setup) => ({ setup, courses: setup.courseIds.map((id) => COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c) })).filter((g) => g.courses.length)
  const card = (c: Course) => {
    const { learned, total } = courseProgress(c)
    const side = c.userSide === 'sente' ? '☗' : '☖'
    return (
      <div key={c.id} className="ws-lesson-card">
        <span className="ws-lesson-title">{c.title}</span>
        <span className="ws-lesson-meta">
          <span className={`ws-role ${c.notesFromOpponentView ? 'defend' : 'attack'}`}>{c.notesFromOpponentView ? t('picker.theyAttackYouDefendAs', { side }) : t('picker.youPlay', { side: t(c.userSide === 'sente' ? 'common.sente' : 'common.gote') })}</span>
          <span>
            <span title={t('picker.yourMovesInThisLesson')}>{t('picker.rightInQuiz', { learned, total })}</span>
          </span>
        </span>
        <span className="ws-lesson-buttons">
          <button className="primary" onClick={() => onOpen(c, 'study')}>
            {t('picker.study')}
          </button>
          <button onClick={() => onOpen(c, 'quiz')}>{t('picker.quiz')}</button>
        </span>
        <i className="ws-progress" style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
      </div>
    )
  }
  if (q) {
    const hits = groups.flatMap((g) => g.courses.filter((c) => `${c.title} ${g.setup.ja} ${g.setup.name}`.toLowerCase().includes(q)))
    return (
      <div className="ws-picker">
        <input className="ws-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('picker.searchAnagumaBGinSagimiya')} aria-label={t('picker.searchLessons')} autoFocus />
        {hits.length ? hits.map(card) : <p className="ws-muted">{t('picker.noLessonMatches', { query })}</p>}
      </div>
    )
  }
  const group = groups.find((g) => g.setup.id === setupId)
  if (group)
    return (
      <div className="ws-picker">
        <button className="ws-back" onClick={() => setSetupId(null)}>
          {t('picker.back')}
        </button>
        <h2 className="ws-picker-title">{ja ? group.setup.ja : group.setup.name}</h2>
        <p className="ws-picker-intro">{group.setup.intro}</p>
        {group.setup.shikenPlan && <p className="ws-picker-intro plan">{group.setup.shikenPlan}</p>}
        {group.courses.map(card)}
      </div>
    )
  return (
    <div className="ws-picker">
      <h2 className="ws-picker-title">
        {t('picker.whatDoYouWantTo')}
        <span>{t('picker.youPlayTheFourthFile')}</span>
      </h2>
      {level === 'new' && <p className="ws-picker-intro">{t('picker.clickAnyPieceOnThe')}</p>}
      <input className="ws-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('picker.searchAnagumaBGinSagimiya')} aria-label={t('picker.searchLessons')} />
      {groups.some((g) => g.setup.technique) && <h3 className="ws-sub">{t('picker.techniques')}</h3>}
      {[...groups.filter((g) => g.setup.technique), ...groups.filter((g) => !g.setup.technique)].map(({ setup, courses }, i, all) => {
        const p = courses.map(courseProgress).reduce((a, b) => ({ learned: a.learned + b.learned, total: a.total + b.total }), { learned: 0, total: 0 })
        return (
          <Fragment key={setup.id}>
          {!setup.technique && all[i - 1]?.setup.technique && <h3 className="ws-sub">{t('picker.openingsByWhatYourOpponent')}</h3>}
          <button className="ws-setup" onClick={() => setSetupId(setup.id)}>
            <span className="ws-lib-ja">
              {ja ? setup.ja : setup.name}
              {setup.id === 'basics' && p.learned === 0 && <em className="ws-start">{t('picker.startHere')}</em>}
            </span>
            <span className="ws-lib-en">{t('picker.lessonCount', { count: courses.length })}</span>
            <span className="ws-setup-go" aria-hidden="true">
              ›
            </span>
            <i className="ws-progress" style={{ width: `${p.total ? (p.learned / p.total) * 100 : 0}%` }} />
          </button>
          </Fragment>
        )
      })}
      <Credits />
    </div>
  )
}

function Credits() {
  const { t } = useTranslation()
  return (
    <details className="ws-source">
      <summary>{t('picker.shogilabCreditsAndLicences')}</summary>
      <p>{t('picker.engineYaneuraouWasmBuildBy')}</p>
    </details>
  )
}

function quizSummary({ right, wrong, shown = 0, retried = 0 }: { right: number; wrong: number; shown?: number; retried?: number }) {
  if (right === 0 && retried === 0 && (shown > 0 || wrong > 0)) return i18n.t('lesson.youNeededHelpForEvery')
  if (wrong === 0 && shown === 0 && retried === 0) return right === 1 ? i18n.t('lesson.yourMoveWasRightNo') : i18n.t('lesson.allMovesRightNoMistakes', { right })
  const parts = [i18n.t('lesson.firstTry', { count: right }), retried ? i18n.t('lesson.afterWrongTry', { count: retried }) : '', shown ? i18n.t('lesson.answersShown', { count: shown }) : '', wrong ? i18n.t('lesson.wrongTries', { count: wrong }) : ''].filter(Boolean)
  return i18n.t('lesson.quizAgainUntilClean', { parts: parts.join(i18n.t('lesson.listSeparator')) })
}

function LessonPane(props: {
  course: Course | null
  lessonMode: 'study' | 'quiz'
  onLessonMode: (m: 'study' | 'quiz') => void
  justRight: boolean
  progress: { done: number; total: number } | null
  checking: boolean
  onOpen: (c: Course, sub: 'study' | 'quiz') => void
  onChange: () => void
  onMap: () => void
  onRestart: (sub?: 'study' | 'quiz') => void
  asking: boolean
  done: boolean
  good: { usi: string; note?: string }[]
  sfen: string
  userSide: Side
  mistake: { base: number; usi: string; expected: string; note?: string; loss: number | null; known: boolean; verdict?: MoveReview } | null
  showAnswer: boolean
  onShowAnswer: () => void
  onBack: () => void
  mistakePreview: boolean
  playing: boolean
  score: { right: number; wrong: number; shown?: number; retried?: number }
  lastNote?: string
  lastMove?: string
  prevSfen: string | null
  reply: { usi: string; note?: string } | null
  onPlayReply: () => void
  endRate: number | null
  level: Level
  pickerSetup: string | null
  onPickerSetup: (id: string | null) => void
  onExplore: () => void
  whatIf: string | null
  offBook: boolean
  onBackToLine: () => void
  endComment?: string
  jumped: boolean
}) {
  const { t } = useTranslation()
  const { justRight, progress, checking, jumped, offBook, onBackToLine, endComment, whatIf, onExplore, pickerSetup, onPickerSetup, playing, level, endRate, reply, onPlayReply, course, lessonMode, onLessonMode, onOpen, onChange, onMap, onRestart, asking, done, good, sfen, userSide, mistake, showAnswer, onShowAnswer, onBack, mistakePreview, score, lastNote, lastMove, prevSfen } = props
  if (!course) return <OpeningPicker onOpen={onOpen} level={level} setupId={pickerSetup} setSetupId={onPickerSetup} />
  const side = userSide === 'sente' ? '☗' : '☖'
  const setup = SETUPS.find((s) => s.courseIds.includes(course.id))
  const siblings = (setup?.courseIds ?? []).map((id) => COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c)
  const nextCourse = siblings[siblings.findIndex((c) => c.id === course.id) + 1] ?? SETUPS.slice(SETUPS.indexOf(setup!) + 1).flatMap((s) => s.courseIds).map((id) => COURSES.find((c) => c.id === id)).find((c): c is Course => !!c)
  return (
    <div className="ws-lesson-pane">
      <div className="ws-lesson-top">
        <button className="ws-back" onClick={onChange}>
          {t('lesson.lessons')}
        </button>
        {progress && progress.total > 0 && (
          <span className="ws-progress-count">
            {t('lesson.yourMoves', { value: Math.min(progress.done, progress.total), total: progress.total })}
          </span>
        )}
        <button className="ws-back" onClick={onMap}>
          {t('lesson.lessonMap')}
        </button>
      </div>
      <div className="ws-seg big" role="group" aria-label={t('lesson.lessonMode')}>
        <button className={lessonMode === 'study' ? 'on' : ''} onClick={() => onLessonMode('study')}>
          {t('lesson.study')}
          <span>{t('lesson.movesShownWithReasons')}</span>
        </button>
        <button className={lessonMode === 'quiz' ? 'on' : ''} onClick={() => onLessonMode('quiz')}>
          {t('lesson.quiz')}
          <span>{t('lesson.findTheMovesYourself')}</span>
        </button>
      </div>
      {lessonMode === 'quiz' && (score.right > 0 || score.wrong > 0 || justRight) && (
        <p className="ws-score">
          <span className="right">✓ {score.right}</span>
          <span className="wrong">✗ {score.wrong}</span>
          {justRight && !mistake && !done && <span className="ws-just-right">{t('lesson.rightThatIsTheLesson')}</span>}
        </p>
      )}
      {checking && <p className="ws-muted">{t('lesson.checkingThatMove')}</p>}
      {mistakePreview && mistake ? (
        <div className={`ws-card ${mistakeIsBad(mistake) ? 'bad' : 'good'}`}>
          <div className="ws-verdict-head">
            {mistake.verdict && (
              <span className="ws-badge" style={{ background: LABELS[mistake.verdict.label].color }}>
                {LABELS[mistake.verdict.label].symbol}
              </span>
            )}
            <strong>{mistakeHeadline(moveText(sfen, mistake.usi), mistake)}</strong>
          </div>
          {mistake.note && <p>{mistake.note}</p>}
          {mistake.verdict && mistake.verdict.reasons.length > 0 && (
            <ul className="ws-why">
              {mistake.verdict.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {mistake.verdict && !mistake.note && mistake.verdict.reasons.length === 0 && <p>{mistakeIsBad(mistake) ? t('lesson.theOpponentGetsTheBetter') : t('lesson.nothingGoesWrongRightAway')}</p>}
          <p className="ws-muted">
            {lessonMode === 'study' ? (mistake.verdict && mistake.verdict.best.move !== mistake.expected && mistake.verdict.best.move !== mistake.usi ? t('lesson.theLessonMoveIsThe', { move: moveText(sfen, mistake.expected), move2: moveText(sfen, mistake.verdict.best.move) }) : t('lesson.theLessonMoveIs', { move: moveText(sfen, mistake.expected) })) : ''}
            {playing ? t('lesson.theBoardIsPlayingOut') : t('lesson.thatIsHowItContinues')}
          </p>
          <button className="primary" onClick={onBack}>
            {t('lesson.goBackAndTryAgain')}
          </button>
        </div>
      ) : offBook ? (
        <div className="ws-card">
          <strong>{t('lesson.youLeftTheLessonLine')}</strong>
          <p>{t('lesson.theBookHasNoMoves')}</p>
          <div className="ws-actions">
            <button className="primary" onClick={onBackToLine}>
              {t('lesson.backToTheLessonLine')}
            </button>
            <button onClick={onExplore}>{t('lesson.exploreItInAnalyze')}</button>
          </div>
        </div>
      ) : whatIf ? (
        <div className="ws-card">
          <strong>{t('lesson.preview', { whatIf })}</strong>
          <p>{t('lesson.theAiPlaysTheBest')}</p>
        </div>
      ) : done ? (
        <div className="ws-card good">
          <strong>{t('lesson.lineComplete')}</strong>
          <div className="ws-actions">
            {lessonMode === 'study' && (
              <button className="primary" onClick={() => onRestart('quiz')}>
                {t('lesson.quizThisLine')}
              </button>
            )}
            {nextCourse && (
              <button className={lessonMode === 'quiz' ? 'primary' : ''} onClick={() => onOpen(nextCourse, lessonMode)}>
                {t('lesson.nextLesson')}
              </button>
            )}
            <button onClick={() => onRestart()}>{t('lesson.startAgain')}</button>
            <button onClick={onChange}>{t('lesson.otherLessons')}</button>
          </div>
          {endComment && <p className="ws-endnote">{endComment}</p>}
          <p>{lessonMode === 'quiz' ? quizSummary(score) : jumped ? t('lesson.endOfThisBranchYou') : t('lesson.youHaveSeenTheWhole')}</p>
          {endRate !== null && (
            <p className={endRate >= 0.55 ? 'ws-end good' : endRate <= 0.45 ? 'ws-end bad' : 'ws-end'}>
              {endRate >= 0.55
                ? t('lesson.aiSViewOfThe', { value: Math.round(endRate * 100) })
                : endRate <= 0.45
                  ? t('lesson.aiSViewOfThe2', { value: Math.round(endRate * 100) })
                  : t('lesson.aiSViewOfThe3', { value: Math.round(endRate * 100) })}
            </p>
          )}
        </div>
      ) : asking ? (
        <div className="ws-card">
          {lessonMode === 'quiz' && !showAnswer && (
            <button className={`ws-answer-top${mistake && !mistakePreview ? ' primary' : ''}`} onClick={onShowAnswer}>
              {t('lesson.showMeTheAnswer')}
            </button>
          )}
          {mistake && !mistakePreview && <p className="ws-result wrong">{mistakeIsBad(mistake) ? t('lesson.wasLabel', { move: moveText(sfen, mistake.usi), label: (mistake.verdict ? LABELS[mistake.verdict.label] : LABELS.mistake).text }) : t('lesson.isNotThisLessonS', { move: moveText(sfen, mistake.usi) })}</p>}
          {lessonMode === 'study' || showAnswer ? (
            <>
              <strong>{t('lesson.yourMoveAs', { side })}</strong>
              {good.map((g) => (
                <div key={g.usi} className="ws-answer">
                  <span className="ws-answer-move">{moveText(sfen, g.usi)}</span>
                  {level === 'new' && <span className="ws-gloss">{moveGloss(sfen, g.usi)}</span>}
                  {g.note && <p>{g.note}</p>}
                </div>
              ))}
              <p className="ws-muted">{t('lesson.playItOnTheBoard')}</p>
            </>
          ) : (
            <>
              <strong>{t('lesson.yourMoveAsFindThe', { side })}</strong>
            </>
          )}
        </div>
      ) : (
        <div className="ws-card">
          <strong>{reply ? t('lesson.theirMove', { move: moveText(sfen, reply.usi) }) : t('lesson.theirMove2')}</strong>
          {level === 'new' && reply && <span className="ws-gloss">{moveGloss(sfen, reply.usi)}</span>}
          {reply?.note && <p>{reply.note}</p>}
          {lessonMode === 'study' && reply ? (
            <button className="primary" onClick={onPlayReply}>
              {t('lesson.playTheirMove')} <span className="ws-key">Space</span>
            </button>
          ) : (
            <p className="ws-muted">{t('lesson.comingInAMoment')}</p>
          )}
        </div>
      )}
      {lastMove && prevSfen && lastNote && !mistakePreview && (
        <div className="ws-last">
          <span className="ws-muted">{t('lesson.lastMove', { move: moveText(prevSfen, lastMove) })}</span>
          <p>{lastNote}</p>
        </div>
      )}
      {!lastMove && course.root.comment && <p className="ws-last">{course.root.comment}</p>}
      <button className="ws-explore" onClick={onExplore}>
        {t('lesson.tryYourOwnMovesFrom')}
        <span>{t('lesson.opensThisPositionInAnalyze')}</span>
      </button>
      {course.source && (
        <details className="ws-source">
          <summary>{t('lesson.source')}</summary>
          <p>{course.source}</p>
        </details>
      )}
    </div>
  )
}

function GamesBox({ current, onSave, onCopy, onOpen, onDelete, onImport }: { current: string | null; onSave: () => boolean; onCopy: () => string; onOpen: (g: StoredGame) => void; onDelete: (g: StoredGame) => void; onImport: (text: string) => string | null }) {
  const { t } = useTranslation()
  const [note, setNote] = useState<string | null>(null)
  const [view, setView] = useState<'none' | 'saved' | 'load'>('none')
  const games = loadGames()
  return (
    <div className="ws-games">
      <div className="ws-actions">
        <button className="primary" onClick={() => setNote(onSave() ? (current ? t('games.savedUpdatedThisSlot') : t('games.savedToYourGames')) : t('games.couldNotSaveBrowserStorage'))}>
          {current ? t('games.saveChanges') : t('games.saveGame')}
        </button>
        <button className={view === 'saved' ? 'on' : ''} onClick={() => setView(view === 'saved' ? 'none' : 'saved')}>
          {t('games.savedGames')} <span className="ws-count">{games.length}</span>
        </button>
        <button className={view === 'load' ? 'on' : ''} onClick={() => setView(view === 'load' ? 'none' : 'load')}>
          {t('games.loadAGame')}
        </button>
        <button onClick={() => navigator.clipboard.writeText(onCopy()).then(() => setNote(t('games.kifCopiedPasteItInto')), () => setNote(t('games.couldNotCopyToThe')))}>{t('games.copyKif')}</button>
      </div>
      {note && <p className="ws-muted">{note}</p>}
      {view === 'saved' && (
        <ul className="ws-game-list">
          {games.length === 0 && <li className="ws-muted">{t('games.noSavedGamesYetPress')}</li>}
          {games.map((g) => (
            <li key={g.id} className={g.id === current ? 'on' : ''}>
              <button className="ws-game-open" onClick={() => onOpen(g)}>
                <strong>{g.title}</strong>
                <span>
                  {t('games.moves', { count: g.moves.length })}{g.tree && g.tree.children.length > 1 ? t('games.withVariations') : ''}
                </span>
              </button>
              <button className="ws-var-x" onClick={() => onDelete(g)} aria-label={t('games.delete', { title: g.title })} title={t('games.delete2')}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {view === 'load' && <ImportBox onImport={onImport} open />}
    </div>
  )
}

function ImportBox({ onImport, open }: { onImport: (text: string) => string | null; open?: boolean }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <details className="ws-import" open={open} onToggle={(e) => {
        const box = e.currentTarget
        if (box.open) setTimeout(() => box.querySelector('.ws-actions')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
      }}>
      <summary>
        <span className="ws-lib-ja">{t('games.importAGame')}</span>
        <span className="ws-lib-en">{t('games.kifKi2CsaUsiOr')}</span>
      </summary>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={t('games.pasteAGameRecordHere')} />
      <div className="ws-actions">
        <button className="primary" onClick={() => setError(onImport(text))} disabled={!text.trim()}>
          {t('games.loadIt')}
        </button>
        <label className="ws-file">
          {t('games.openAFile')}
          <input
            type="file"
            accept=".kif,.kifu,.ki2,.csa,.txt,.usi,.sfen"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) setError(onImport(decodeKifuFile(await file.arrayBuffer())))
            }}
          />
        </label>
      </div>
      {error && <p className="ws-result wrong">{error}</p>}
    </details>
  )
}

type Command = { id: string; label: string; hint?: string; run: () => void }

function useCommands({ sfen, setMode, setFlipped, setTilted, openCourse, play, newGame }: { sfen: string; setMode: (m: Mode) => void; setFlipped: (f: (v: boolean) => boolean) => void; setTilted: (f: (v: boolean) => boolean) => void; openCourse: (c: Course) => void; play: (usi: string) => void; newGame: () => void }) {
  const { t } = useTranslation()
  return useCallback(
    (query: string): Command[] => {
      const q = query.trim().toLowerCase()
      const out: Command[] = []
      if (q) {
        const position = positionOf(sfen)
        const direct = position.createMoveByUSI(query.trim())
        const [parsed] = direct && position.isValidMove(direct) ? [[direct]] : parseMoves(position, query.trim())
        const move = parsed?.[0]
        if (move && position.isValidMove(move)) out.push({ id: `play-${move.usi}`, label: t('palette.play', { move: moveText(sfen, move.usi) }), run: () => play(move.usi) })
      }
      const base: Command[] = [
        ...MODES.map((m) => ({ id: `mode-${m.id}`, label: t('palette.modeCommand', { name: t(`modes.${m.id}.name`) }), hint: t(`modes.${m.id}.hint`), run: () => setMode(m.id) })),
        { id: 'flip', label: t('palette.flipTheBoard'), hint: 'F', run: () => setFlipped((v) => !v) },
        { id: 'viewer', label: t('palette.pieceViewerDebug'), run: () => window.dispatchEvent(new Event('shogilab:viewer')) },
        { id: 'tilt', label: t('palette.tiltTheBoard'), hint: 'T', run: () => setTilted((v) => !v) },
        { id: 'new', label: t('palette.newGameFromTheStart'), run: newGame },
        ...COURSES.map((c) => ({ id: `course-${c.id}`, label: c.title, hint: SETUPS.find((s) => s.courseIds.includes(c.id))?.ja, run: () => openCourse(c) })),
      ]
      const terms = [q, ...Object.entries(ALIASES).filter(([en]) => q.length >= 3 && en.startsWith(q)).map(([, ja]) => ja)]
      return [...out, ...base.filter((c) => !q || terms.some((t) => `${c.label} ${c.hint ?? ''}`.toLowerCase().includes(t)))].slice(0, 12)
    },
    [sfen, setMode, setFlipped, setTilted, openCourse, play, newGame, t],
  )
}

const ALIASES: Record<string, string> = {
  mino: '美濃',
  takamino: '高美濃',
  ginkan: '銀冠',
  anaguma: '穴熊',
  millennium: 'ミレニアム',
  yagura: '矢倉',
  funagakoi: '舟囲い',
  shikenbisha: '四間飛車',
  sankenbisha: '三間飛車',
  nakabisha: '中飛車',
  mukaibisha: '向かい飛車',
  ibisha: '居飛車',
  furibisha: '振り飛車',
  aifuri: '相振',
  kyusen: '急戦',
  bogin: '棒銀',
  fujii: '藤井',
  tateishi: '立石',
  ishida: '石田',
  sabaki: '捌',
  kuzushi: '崩',
  hidari: '左美濃',
  static: '居飛車',
  ranging: '振り飛車',
  castle: '囲',
}

function Palette({ commands, onClose }: { commands: (q: string) => Command[]; onClose: () => void }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const items = commands(query)
  useEffect(() => input.current?.focus(), [])
  const run = (c: Command | undefined) => {
    if (!c) return
    c.run()
    onClose()
  }
  return (
    <div className="ws-palette-back" onPointerDown={onClose}>
      <div className="ws-palette" onPointerDown={(e) => e.stopPropagation()} role="dialog" aria-label={t('palette.commandPalette')}>
        <input
          ref={input}
          value={query}
          placeholder={t('palette.searchLinesTypeAMove')}
          onChange={(e) => {
            setQuery(e.target.value)
            setIndex(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            else if (e.key === 'ArrowDown') setIndex((i) => Math.min(items.length - 1, i + 1))
            else if (e.key === 'ArrowUp') setIndex((i) => Math.max(0, i - 1))
            else if (e.key === 'Enter') run(items[index])
          }}
        />
        <ul>
          {items.map((c, i) => (
            <li key={c.id}>
              <button className={i === index ? 'on' : ''} onMouseEnter={() => setIndex(i)} onClick={() => run(c)}>
                <span>{c.label}</span>
                {c.hint && <span className="ws-muted">{c.hint}</span>}
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="ws-muted ws-empty">{t('palette.noMatchTryALine')}</li>}
        </ul>
      </div>
    </div>
  )
}

function EvalGraph({ values, cursor, onJump, className = '' }: { values: (number | undefined)[]; cursor: number; onJump: (i: number) => void; className?: string }) {
  const { t } = useTranslation()
  const W = 360
  const H = 88
  const n = Math.max(values.length - 1, 1)
  const x = (i: number) => (i / n) * W
  const y = (cp: number) => H / 2 - (Math.max(-2000, Math.min(2000, cp)) / 2000) * (H / 2 - 4)
  const known = values.map((v, i) => (v === undefined ? null : [x(i), y(v)])).filter((p): p is number[] => p !== null)
  const line = known.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
  const area = known.length ? `${line}L${known.at(-1)![0].toFixed(1)},${H / 2}L${known[0][0].toFixed(1)},${H / 2}Z` : ''
  return (
    <div className={`ws-graph ${className}`}>
      <div className="ws-graph-axis">
        <span>{t('graph.senteAhead')}</span>
        <span>{t('graph.goteAhead')}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={t('graph.evaluationByMove')}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onJump(Math.round(((e.clientX - rect.left) / rect.width) * n))
        }}
      >
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="ws-graph-mid" />
        {area && <path d={area} className="ws-graph-area" />}
        {line && <path d={line} className="ws-graph-line" />}
        <line x1={x(cursor)} x2={x(cursor)} y1="0" y2={H} className="ws-graph-cursor" />
      </svg>
    </div>
  )
}

function Plate({ position, color, who, className, clock }: { position: ReturnType<typeof positionOf>; color: Color; who: string | null; className: string; clock?: { text: string; active: boolean; low: boolean; out: boolean } }) {
  const { t } = useTranslation()
  const { strategy, castle } = formationOf(position, color)
  return (
    <div className={`ws-plate ${className}`}>
      {clock && <span className={`ws-clock${clock.active ? ' on' : ''}${clock.low ? ' low' : ''}${clock.out ? ' out' : ''}`} role="timer">{clock.out ? t('plate.outOfTime') : clock.text}</span>}
      <span className="ws-plate-side">{color === Color.BLACK ? t('plate.sente') : t('plate.gote')}</span>
      {who && <span className="ws-muted">{who}</span>}
      {strategy && <span className="ws-pill" title={t('plate.strategyFromWhereTheRook')}>{strategy}</span>}
      {castle && <span className="ws-pill" title={t('plate.castleFromWhereTheKing')}>{castle}</span>}
    </div>
  )
}

type Lane = { first: string; moves: string[]; tag: 'book' | 'mistake' | 'ai'; note?: string; loss?: number; forks?: number; best?: boolean }

function buildLanes(sfen: string, nodes: Map<string, JosekiNode> | null, analysis: ReturnType<typeof useAnalysis>['analysis']): Lane[] {
  const lanes: Lane[] = []
  const branchesHere = nodes ? (nodes.get(strip(sfen))?.branches ?? []) : bookLookup(sfen).flatMap((h) => h.node.branches.map((b) => neutralBranch(b, h.course)))
  for (const b of branchesHere) {
    if (lanes.some((l) => l.first === b.usi)) continue
    const moves = [b.usi]
    let n = b.child
    while (n && n.branches.length === 1 && n.branches[0].child && moves.length < 6) {
      moves.push(n.branches[0].usi)
      n = n.branches[0].child
    }
    lanes.push({ first: b.usi, moves, tag: b.kind === 'deviation' ? 'mistake' : 'book', note: b.kind === 'deviation' ? (b.punishNote ?? b.note) : b.note, forks: n && n.branches.length > 1 ? n.branches.length : undefined })
  }
  const candidates = (analysis?.candidates ?? []).filter((c) => /^([1-9][a-i]|[PLNSGBR]\*)[1-9][a-i]\+?$/.test(c.move))
  if (candidates.length) {
    const bestRate = scoreWinRate(candidates[0].score)
    for (const c of candidates) {
      const loss = Math.max(0, Math.round((bestRate - scoreWinRate(c.score)) * 100))
      const existing = lanes.find((l) => l.first === c.move)
      const best = c === candidates[0]
      if (existing) Object.assign(existing, { loss, best })
      else lanes.push({ first: c.move, moves: c.pv.slice(0, 6), tag: 'ai', loss, best })
    }
  }
  const order = { book: 0, ai: 1, mistake: 2 }
  return lanes.sort((a, b) => order[a.tag] - order[b.tag])
}

function FlowPane({ lanes, sfen, onPreview, onHover }: { lanes: Lane[]; sfen: string; onPreview: (moves: string[], title: string) => void; onHover: (usi: string | null) => void }) {
  const { t } = useTranslation()
  if (!lanes.length)
    return (
      <div className="ws-off">
        <p>{t('flow.noBookLineFromThis')}</p>
      </div>
    )
  return (
    <div className="ws-flow">
      <p className="ws-muted">{t('flow.whatCanHappenFromThe')}</p>
      {lanes.map((lane) => {
        const steps: string[] = []
        let at = sfen
        for (const usi of lane.moves) {
          steps.push(moveText(at, usi))
          const next = applyUsi(at, usi)
          if (!next) break
          at = next
        }
        return (
          <button key={lane.first} className={`ws-lane ${lane.tag}`} onClick={() => onPreview(lane.moves, steps[0])} onMouseEnter={() => onHover(lane.first)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(lane.first)} onBlur={() => onHover(null)}>
            <span className="ws-lane-head">
              <span className="ws-lane-tag">{lane.tag === 'book' ? t('flow.book') : lane.tag === 'mistake' ? t('flow.knownMistake') : t('flow.aiLine')}</span>
              {lane.loss !== undefined && <span className={`ws-loss${lane.loss >= 10 ? ' bad' : lane.loss >= 4 ? ' meh' : ''}`}>{lane.best ? t('flow.best') : lane.loss === 0 ? t('flow.best2') : `−${lane.loss}%`}</span>}
            </span>
            <span className="ws-lane-steps">
              {steps.map((t, i) => (
                <span key={i} className={i === 0 ? 'first' : ''}>
                  {i > 0 && <i aria-hidden="true">→</i>}
                  {t}
                </span>
              ))}
              {lane.forks && <span className="ws-muted">{t('flow.thenChoices', { forks: lane.forks })}</span>}
            </span>
            {lane.note && <span className="ws-lane-note">{lane.note}</span>}
          </button>
        )
      })}
    </div>
  )
}

function NewGameDialog({ side, onClose, onStart }: { side: Side; onClose: () => void; onStart: (side: Side) => void }) {
  const { t } = useTranslation()
  const st = useSettings()
  const [pick, setPick] = useState<Side>(side)
  const row = (label: string, body: ReactNode) => (
    <div className="ws-setting">
      <span>{label}</span>
      <div className="ws-seg">{body}</div>
    </div>
  )
  return (
    <div className="ws-palette-back" onPointerDown={onClose}>
      <div className="ws-dialog ws-newgame" role="dialog" aria-label={t('newGame.title')} onPointerDown={(e) => e.stopPropagation()}>
        <h2>{t('newGame.title')}</h2>
        {row(
          t('newGame.side'),
          (['sente', 'gote'] as const).map((x) => (
            <button key={x} className={pick === x ? 'on' : ''} onClick={() => setPick(x)}>
              {x === 'sente' ? t('workshop.playSente') : t('workshop.playGote')}
            </button>
          )),
        )}
        {row(
          t('newGame.strength'),
          (Object.keys(STRENGTH) as AiStrength[]).map((k) => (
            <button key={k} className={st.opponent === k ? 'on' : ''} onClick={() => setSettings({ opponent: k })}>
              {STRENGTH[k].label}
            </button>
          )),
        )}
        {row(
          t('newGame.clock'),
          (Object.keys(TIME_CONTROLS) as TimeControl[]).map((k) => (
            <button key={k} className={st.timeControl === k ? 'on' : ''} onClick={() => setSettings({ timeControl: k })} title={TIME_CONTROLS[k].hint}>
              {TIME_CONTROLS[k].label}
            </button>
          )),
        )}
        <label className="ws-setting">
          <span>{t('newGame.strategy')}</span>
          <select value={st.aiStrategy} onChange={(e) => setSettings({ aiStrategy: e.target.value })}>
            <option value="">{t('workshop.anyStrategy')}</option>
            {SETUPS.filter((x) => !x.technique && strategyCourses(x.id, pick).length > 0).map((x) => (
              <option key={x.id} value={x.id}>
                {x.ja}
              </option>
            ))}
          </select>
        </label>
        <div className="ws-actions">
          <button onClick={onClose}>{t('workshop.cancel')}</button>
          <button className="primary" onClick={() => onStart(pick)}>
            {t('newGame.start')}
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsDialog({ onClose, level, onLevel }: { onClose: () => void; level: Level; onLevel: (l: Level) => void }) {
  const { t } = useTranslation()
  const st = useSettings()
  const [tab, setTab] = useState<'general' | 'board' | 'pieces' | 'play'>('general')
  const seg = <T extends string | number | boolean>(label: string, value: T, options: { v: T; t: string }[], set: (v: T) => void) => (
    <div className="ws-setting">
      <span>{label}</span>
      <div className="ws-seg">
        {options.map((o) => (
          <button key={String(o.v)} className={value === o.v ? 'on' : ''} onClick={() => set(o.v)}>
            {o.t}
          </button>
        ))}
      </div>
    </div>
  )
  const tabs = [
    { id: 'general', label: t('settings.general') },
    { id: 'board', label: t('settings.board') },
    { id: 'pieces', label: t('settings.pieces') },
    { id: 'play', label: t('settings.playAi') },
  ] as const
  return (
    <div className="ws-palette-back" onPointerDown={onClose}>
      <div className="ws-dialog ws-settings" role="dialog" aria-label={t('settings.settings')} onPointerDown={(e) => e.stopPropagation()}>
        <div className="ws-settings-head">
          <h2>{t('settings.settings')}</h2>
          <button className="ws-dialog-x" onClick={onClose} aria-label={t('settings.closeSettings')} title={t('settings.closeEsc')}>
            ×
          </button>
        </div>
        <div className="ws-settings-tabs" role="tablist">
          {tabs.map((x) => (
            <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? 'on' : ''} onClick={() => setTab(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="ws-settings-body">
          {tab === 'general' && (
            <>
                {seg<Lang>('Language / 言語', st.lang, [{ v: 'en', t: 'English' }, { v: 'ja', t: '日本語' }], (v) => setSettings({ lang: v }))}
                {seg<Level>(t('settings.shogiKnowledge'), level, [{ v: 'rules', t: t('settings.iKnowTheRules') }, { v: 'new', t: t('settings.newToShogi') }], onLevel)}
                {seg(t('settings.soundEffects'), st.sound, [{ v: true, t: t('settings.on') }, { v: false, t: t('settings.off') }], (v) => setSettings({ sound: v }))}
                <label className="ws-setting">
                  <span>{t('settings.volume')}</span>
                  <input type="range" min={0} max={1} step={0.05} disabled={!st.sound} value={st.volume} onChange={(e) => setSettings({ volume: Number(e.target.value) })} onMouseUp={() => playSound('move')} />
                </label>
            </>
          )}
          {tab === 'board' && (
            <>
                {seg<Environment>(t('settings.setting'), st.environment, [{ v: 'traditional', t: t('settings.traditional') }, { v: 'casual', t: t('settings.casual') }, { v: 'flat', t: t('settings.2d') }, { v: 'diagram', t: t('settings.diagram') }, { v: 'broadcast', t: t('settings.broadcast') }], (v) => setSettings({ environment: v }))}
                {seg(t('settings.boardCoordinates'), st.coords, [{ v: true, t: t('settings.showWiderMargin') }, { v: false, t: t('settings.hide') }], (v) => setSettings({ coords: v }))}
                {seg<BoardStyle>(t('settings.boardWood'), st.boardStyle, [{ v: 'kaya', t: t('settings.kaya') }, { v: 'shin-kaya', t: t('settings.light') }, { v: 'dark', t: t('settings.dark') }], (v) => setSettings({ boardStyle: v }))}
            </>
          )}
          {tab === 'pieces' && (
            <>
                {seg<PieceSet>(t('settings.pieceSet'), st.pieceSet, (Object.keys(PIECE_SETS) as PieceSet[]).map((v) => ({ v, t: PIECE_SETS[v].label })), (v) => setSettings({ pieceSet: v }))}
                <div className="ws-piece-sample" aria-label={t('settings.preview')}>
                  {(['OU', 'HI', 'KA', 'KI', 'GI', 'FU', 'RY', 'TO'] as const).map((code) =>
                    st.pieceSet === 'letters' ? (
                      <span key={code} className={`ws-sample-koma${code === 'RY' || code === 'TO' ? ' promoted' : ''}`} style={{ fontFamily: `"${PIECE_FONTS[st.pieceFont].family}", serif`, fontWeight: PIECE_FONTS[st.pieceFont].weight }}>
                        {[...(st.pieceStyle === 'one' ? { OU: '王', HI: '飛', KA: '角', KI: '金', GI: '銀', FU: '歩', RY: '龍', TO: 'と' }[code] : { OU: '王将', HI: '飛車', KA: '角行', KI: '金将', GI: '銀将', FU: '歩兵', RY: '龍王', TO: 'と' }[code])].map((c, i, all) => (
                          <i key={i} className={all.length === 1 ? 'one' : ''}>
                            {c}
                          </i>
                        ))}
                      </span>
                    ) : (
                      <img key={code} src={pieceUrl(st.pieceSet, code)} alt={code} />
                    ),
                  )}
                </div>
                {seg<PieceFinish>(t('settings.pieceFinish'), st.pieceFinish, (Object.keys(PIECE_FINISHES) as PieceFinish[]).map((v) => ({ v, t: PIECE_FINISHES[v].label })), (v) => setSettings({ pieceFinish: v }))}
                <p className="ws-muted ws-credit">{PIECE_FINISHES[st.pieceFinish].hint}</p>
                {PIECE_SETS[st.pieceSet].credit && <p className="ws-muted ws-credit">{PIECE_SETS[st.pieceSet].credit}</p>}
                {st.pieceSet === 'letters' && seg<PieceFont>(t('settings.pieceLettering'), st.pieceFont, (Object.keys(PIECE_FONTS) as PieceFont[]).map((v) => ({ v, t: PIECE_FONTS[v].label })), (v) => setSettings({ pieceFont: v }))}
                {st.pieceSet === 'letters' && seg<PieceStyle>(t('settings.pieceFaces'), st.pieceStyle, [{ v: 'two', t: t('settings.twoCharacters') }, { v: 'one', t: t('settings.oneCharacter') }], (v) => setSettings({ pieceStyle: v }))}
            </>
          )}
          {tab === 'play' && (
            <>
                {seg(t('settings.thinkingTime'), st.thinkMs, [{ v: 500, t: t('settings.fast') }, { v: 1500, t: t('settings.normal') }, { v: 4000, t: t('settings.deep') }], (v) => setSettings({ thinkMs: v }))}
                {seg(t('settings.candidateMovesShown'), st.candidates, [{ v: 1, t: '1' }, { v: 2, t: '2' }, { v: 3, t: '3' }, { v: 5, t: '5' }], (v) => setSettings({ candidates: v }))}
                <EngineSettings />
            </>
          )}
        </div>
      </div>
    </div>
  )
}


