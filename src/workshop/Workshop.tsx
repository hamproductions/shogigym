import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Color, InitialPositionSFEN, PieceType, Position, Square, parseMoves, type Move } from 'tsshogi'
import '@fontsource/shippori-mincho-b1/800.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/500.css'
import '@fontsource/zen-kaku-gothic-new/700.css'
import './workshop.css'
import { Board3D, type BoardArrow } from './Board3D'
import { Icon, type IconName } from './icons'
import { PIECE_INFO, PieceGuide, moveGloss, sees } from './pieces'
import { allEvals, cachedReview, rememberEval, rememberReview } from './memory'
import { PieceViewer } from './PieceViewer'
import { detectTesuji, type Tesuji } from './tesuji'
import { TESUJI_KINDS, TESUJI_DRILLS, markTesuji, pickTesuji, tesujiStats, type TesujiDrill } from './tesujiDrills'
import { deleteGame, loadGames, storeGame, type StoredGame } from './games'
import { PIECE_SETS, loadPieceSet, pieceUrl, type PieceSet } from './pieceSets'
import { addPath, allLines, emptyTree, isMainLine, mainContinuation, mainLine, nodeAt, promote, removeBranch, type Tree } from './tree'
import { PIECE_FONTS, STRENGTH, loadPieceFont, playSound, setSettings, useSettings, type AiStrength, type BoardStyle, type PieceFont, type PieceStyle } from './settings'
import { analyze, engineSupported, scoreToCp, type Score } from '../engine'
import { useAnalysis } from '../hooks'
import { LABELS, describeMove, reviewMove, scoreWinRate, usiPosition, type MoveReview } from '../analysis'
import { formationOf } from '../formation'
import { attackerOf, buildQueue, markOpened, courseProgress, defenderMove, expectedMoves, judgeTsumeMove, markTsume, pickProblem, reviewCounts, PROBLEMS, loadTsumeStats, type Problem, type ReviewItem, type ReviewQueue } from './practice'
import { positionKey, record } from '../srs'
import { loadMistakes, saveMistakes } from '../mistakes'
import { decodeKifuFile, exportGame, parseGame } from '../kifu'
import { classify, type Label } from '../analysis'
import { bookLookup } from '../kifu'
import { COURSES, SETUPS, findPath, sideToMove, type Course, type JosekiNode } from '../model'
import { LessonMap } from '../components/Flowchart'
import { PIECE_CHAR, applyUsi, hasLegalMove, kingSquare, reachable, colorSide, legalTargets, moveText, positionOf, promotionOptions, pvText, type Side } from '../shogi'

type Mode = 'lesson' | 'drill' | 'tsume' | 'tesuji' | 'spar' | 'analyze'
type Tab = 'engine' | 'coach' | 'flow' | 'moves'

const MODES: { id: Mode; icon: IconName; ja: string; name: string; hint: string }[] = [
  { id: 'lesson', icon: 'study', ja: '定跡', name: 'Openings', hint: 'Learn opening lines: study them, then quiz yourself' },
  { id: 'drill', icon: 'review', ja: '復習', name: 'Review', hint: 'Spaced repetition of positions you have learned' },
  { id: 'tsume', icon: 'tsume', ja: '詰将棋', name: 'Tsume', hint: 'Mate problems' },
  { id: 'tesuji', icon: 'flow', ja: '手筋', name: 'Tesuji', hint: 'Find the tactical trick: tataki, tare, focal pawn, forks and more' },
  { id: 'spar', icon: 'spar', ja: '対局', name: 'Play AI', hint: 'Play a game against the AI' },
  { id: 'analyze', icon: 'analyze', ja: '検討', name: 'Analyze', hint: 'Move both sides freely, import and rate games' },
]

const TABS: { id: Tab; ja: string; name: string }[] = [
  { id: 'coach', ja: '指導', name: 'Coach' },
  { id: 'engine', ja: '形勢', name: 'AI' },
  { id: 'flow', ja: 'この先', name: 'What next' },
  { id: 'moves', ja: '棋譜', name: 'Moves' },
]

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
  const [mode, setMode] = useState<Mode>('lesson')
  const settings = useSettings()
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
  const panelHidden = compact ? !drawer : panelPrefs.hidden
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
    if (nextMode !== mode && (mode === 'spar' || mode === 'analyze' || mode === 'lesson')) saved.current[mode] = { game, cursor, userSide, flipped, course, lessonMode, score, tree }
    setPreview(null)
    setPlaying(false)
    setTree(emptyTree())
    setSlotId(null)
    setPeekFrom(null)
    setResigned(false)
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

  const [gameTitle, setGameTitle] = useState('this game')
  const [plyBase, setPlyBase] = useState(0)
  const importGame = (text: string): string | null => {
    const parsed = parseGame(text)
    if (parsed instanceof Error) return `Could not read that game: ${parsed.message}`
    let at: string | null = parsed.startSfen
    let valid = 0
    for (const usi of parsed.moves) {
      at = applyUsi(at, usi)
      if (!at) break
      valid++
    }
    if (valid < parsed.moves.length) return `Move ${valid + 1} (${parsed.moves[valid]}) is not legal in that position, so the game can't be loaded. Check the record and try again.`
    const run = () => {
      load(parsed.startSfen, 'sente', 'analyze', null)
      setGame({ start: parsed.startSfen, moves: parsed.moves })
      setCursor(0)
      setGameNotes({ title: parsed.title, comments: parsed.comments ?? [], ending: parsed.ending, moves: parsed.moves.join(' ') })
      setGameTitle(parsed.title || 'this game')
      setTab('moves')
    }
    const variations = countMoves(tree) - mainLine(tree).length
    if (mode === 'analyze' && game.moves.length > 0) setConfirm({ text: `Load this game (${parsed.moves.length} moves)? The game on the board (${game.moves.length} moves${variations > 0 ? ' plus its variations' : ''}) will be replaced.`, run, yes: 'Load it', no: 'Cancel' })
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
      setPreview({ base: cursor, moves: [usi, ...line], step: 1, title: `if they play ${moveText(liveSfen, usi)}` })
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
    setMistake({ base: cursor, usi, expected, note: reason ?? deviation?.punishNote ?? deviation?.note, loss, known: deviation?.kind === 'deviation' || !!reason, verdict })
    setPreview({ base: cursor, moves: [usi, ...refutation], step: 1, title: `why ${moveText(liveSfen, usi)} fails` })
    setPlaying(true)
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
    if ((mode !== 'lesson' && mode !== 'spar') || (mode === 'lesson' && !course) || !atEnd || toMove === userSide || resigned) return
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
  }, [mode, atEnd, toMove, userSide, liveSfen, nodes, course, settings.opponent, settings.aiStrategy, resigned])
  const reply = !preview && pending && pending.key === liveSfen && atEnd && (mode === 'lesson' || mode === 'spar') && toMove !== userSide ? pending : null
  useEffect(() => {
    if (!reply || (mode === 'lesson' && lessonMode === 'study')) return
    const timer = setTimeout(() => play(reply.usi), mode === 'spar' ? 900 : 1000)
    return () => clearTimeout(timer)
  }, [reply, mode, lessonMode, play])

  const canMove = (userTurn && !(mode === 'spar' && resigned)) || (mode === 'lesson' && !!course && lessonMode === 'study' && !preview)
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
      setNudge(position.board.at(selection.from)?.type === PieceType.KING ? 'Your king cannot go there: that square is attacked.' : 'That move would leave your king in check.')
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
      setNudge(`That is the opponent's piece. You play ${position.color === Color.BLACK ? '☗' : '☖'}.`)
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
    const added = saveMistakes([{ id: `${before}|${usi}`, sfen: before, played: usi, best: review.best.move, bestPv: review.best.pv, label: review.label, reasons: review.reasons, game: 'your game vs the AI', ply: reviewAt }])
    if (added) setNudge('Saved to 復習 Review: you will practise this position later.')
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
    arrows.push({ usi: best.move, color: SHU, label: 'best' })
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
    ? `${peekPiece.color === Color.BLACK ? '☗' : '☖'}${PIECE_INFO[peekPiece.type].ja.slice(0, 1)} on ${peekSquare.file}${'一二三四五六七八九'[peekSquare.rank - 1]} covers ${peekTargets.length} ${peekTargets.length === 1 ? 'square' : 'squares'}.${level === 'new' ? ` ${PIECE_INFO[peekPiece.type].moves}` : ''}`
    : enemyKing
      ? peekTargets.length
        ? `The ${enemyColor === Color.BLACK ? '☗' : '☖'} king you are attacking can escape to ${peekTargets.length} ${peekTargets.length === 1 ? 'square' : 'squares'}.`
        : `The ${enemyColor === Color.BLACK ? '☗' : '☖'} king you are attacking has no escape square.`
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
      setAnnounce({ side: positionOf(sfens[cursor - 1]).color, name: tesuji.ja, kind: '手筋', key: Date.now() })
      setTesujiNote({ ...tesuji, at: cursor })
    }
    for (const color of [Color.BLACK, Color.WHITE]) {
      const f = formationOf(position, color)
      for (const [name, kind] of [
        [f.strategy, '戦法'],
        [f.castle, '囲い'],
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
  const checkHelp = mode === 'spar' && inCheck && userTurn && atEnd && !gameOver && !preview ? '王手: your king is attacked. Move it away, block the line, or capture the attacker.' : null
  const kanji = (sq: Square) => `${PIECE_INFO[position.board.at(sq)!.type].ja.slice(0, 1)}${sq.file}${'一二三四五六七八九'[sq.rank - 1]}`
  const focusNote = focusSquare && focusCell ? `${focusSquare.file}${'一二三四五六七八九'[focusSquare.rank - 1]}: ☗ ${focusCell.s.length ? focusCell.s.map(kanji).join(' ') : 'none'} · ☖ ${focusCell.g.length ? focusCell.g.map(kanji).join(' ') : 'none'}${focusCell.s.length !== focusCell.g.length ? ` — ${focusCell.s.length > focusCell.g.length ? '☗' : '☖'} controls it` : focusCell.s.length ? ' — contested' : ''}` : null
  if (focusSquare && focusCell) {
    arrows.length = 0
    for (const sq of focusCell.s) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: '#1f7ae0' })
    for (const sq of focusCell.g) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: '#d2402a' })
  }
  const boardNote = nudge ?? (checking ? 'Checking that move…' : (focusNote ?? peekNote ?? (tesujiNote && tesujiNote.at === cursor ? `手筋 ${tesujiNote.ja} (${tesujiNote.en}): ${tesujiNote.explain}` : checkHelp)))
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
  const [scanning, setScanning] = useState(false)
  const scanGame = async () => {
    setScanning(true)
    for (const s of sfens) {
      if (evals[strip(s)] !== undefined) continue
      const result = await analyze(usiPosition(s), { multipv: 1, movetime: 250 })
      const top = result.candidates[0]
      if (top) {
        const cp = scoreToCp(toSente(top.score, colorSide(positionOf(s).color)))
        setEvals((e) => ({ ...e, [strip(s)]: cp }))
      }
    }
    setScanning(false)
  }
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
      else if (event.key === 't') setTilted((v) => !v)
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

  const modeInstruction = () => {
    if (checking) return 'Checking that move…'
    if (preview && mistake) return mistakeIsBad(mistake) ? 'Watch how it gets punished, then go back and try again.' : 'Watch what follows, then go back and play the lesson move.'
    if (preview) return 'Preview: watch it play out, then keep these moves or exit the preview.'
    if (mode === 'lesson') {
      if (!course) return 'Pick a technique or an opening, then Study or Quiz.'
      if (lessonOffBook) return 'Off the lesson line. Go back to it, or explore in Analyze.'
      if (lessonDone) return 'Line complete.'
      if (lessonAsking) return lessonMode === 'study' ? `Your move as ${userSide === 'sente' ? '☗' : '☖'}: play the green arrow.${lessonGood.some((b) => b.note) ? ' The coach tells you why.' : ''}` : showAnswer ? 'Answer shown: play the green arrow.' : `Your move as ${userSide === 'sente' ? '☗' : '☖'}: find the book move. No hints.`
      return lessonMode === 'study' ? 'Their move is shown. Press Space or Play their move.' : 'Their reply comes in a moment.'
    }
    if (mode === 'drill') return drillItem ? (drillItem.kind === 'mistake' && !drill?.result ? 'Find a better move than the one you played in your game.' : drill?.result ? 'Next card when you are ready.' : drill?.queue === 'new' ? 'Learn this move: play the green arrow.' : 'Play the move you learned.') : 'Pick what to review.'
    if (mode === 'tesuji') return tesujiDrill ? (tesujiDrill.status === 'asking' ? `${colorSide(position.color) === 'sente' ? '☗' : '☖'} to move: find the 手筋.` : 'Next drill when you are ready.') : 'Find the tesuji.'
    if (mode === 'tsume') return tsume ? `${attackerOf(tsume.problem) === 'sente' ? '☗' : '☖'} to play: mate in ${tsume.problem.mate}. Every attacking move must give check.` : 'Every attacking move must give check.'
    if (mode === 'spar') return resigned ? 'You resigned. Review the game, or start a new one.' : position.checked && !hasLegalMove(position) ? 'Checkmate. The game is over.' : !atEnd ? 'Looking back at earlier moves. Play a move here to try a variation, or press ⏭ to return.' : userTurn ? (position.checked ? '王手! Your king is in check.' : 'Your move.') : 'The AI is thinking.'
    return 'Try anything. The AI tab rates the position.'
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
    const names = mode === 'spar' ? (userSide === 'sente' ? { sente: 'You', gote: ai } : { sente: ai, gote: 'You' }) : gameNotes?.title && gameNotes.title !== 'Imported game' ? { title: gameNotes.title } : course ? { title: course.title } : {}
    return exportGame(game.start, lines, names)
  }
  const saveSlot = () => {
    const id = slotId ?? String(Date.now())
    const d = new Date()
    const when = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    const title = mode === 'spar' ? `vs AI as ${userSide === 'sente' ? '☗' : '☖'} · ${when}` : `${gameTitle && gameTitle !== 'this game' ? gameTitle : 'Analysis'} · ${when}`
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
    if (mode === 'analyze' && game.moves.length > 0 && slotId !== g.id) setConfirm({ text: `Open “${g.title}”? The game on the board will be replaced (save it first if you want to keep it).`, run, yes: 'Open it', no: 'Cancel' })
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
    setNudge('待った: your last move was taken back. Try another.')
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
      setGameTitle('your game vs the AI')
      setAutoRate(moves.join(' '))
      setTab('moves')
    }
    const open = saved.current.analyze?.game.moves.length ?? 0
    if (open > 0) setConfirm({ text: `Open this game in 検討 Analyze? The game already open there (${open} moves) will be replaced.`, run, yes: 'Open it', no: 'Cancel' })
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
  const saved = useRef<Partial<Record<Mode, { game: { start: string; moves: string[] }; cursor: number; userSide: Side; flipped: boolean; course: Course | null; lessonMode: 'study' | 'quiz'; score: { right: number; wrong: number; shown?: number; retried?: number }; tree?: Tree }>>>({})
  const enterMode = (m: Mode) => {
    if (m === mode && m === 'lesson' && course && !preview) return load(InitialPositionSFEN.STANDARD, 'sente', 'lesson', null), setPickerSetup(null)
    if (m === mode) return
    saved.current[mode] = { game, cursor, userSide, flipped, course, lessonMode, score, tree }
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

  const commands = useCommands({ sfen, setMode: enterMode, setFlipped, setTilted, openCourse, play, newGame: () => load(InitialPositionSFEN.STANDARD, userSide, mode === 'lesson' ? 'analyze' : mode, null) })

  return (
    <div className={`ws${panelHidden ? ' panel-hidden' : ''}${compact && drawer ? ' drawer-open' : ''}`} style={{ ['--panel-w' as string]: `${panelWidth}px` }}>
      <nav className="ws-rail" aria-label="Mode">
        <div className="ws-seal" title="ShogiLab 将棋ラボ">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 3 L50 11 L57 61 H7 L14 11 Z" fill="#e9c98f" stroke="#7a4a1c" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M32 7.5 L47.2 14.3 L53.4 57.5 H10.6 L16.8 14.3 Z" fill="none" stroke="#c8442f" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
            <text x="32" y="47" textAnchor="middle" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize="30" fill="#1d140c">
              究
            </text>
          </svg>
        </div>
        {MODES.map((m) => (
          <button key={m.id} className={`ws-rail-btn${mode === m.id ? ' on' : ''}`} onClick={() => enterMode(m.id)} aria-pressed={mode === m.id} title={`${m.name}: ${m.hint}`}>
            <Icon name={m.icon} size={20} />
            <span className="ws-ja">{m.ja}</span>
            <span>{m.name}</span>
          </button>
        ))}
        <div className="ws-rail-gap" />
        <button className="ws-rail-btn" onClick={() => setPalette(true)} title="Search lines and commands (⌘K)">
          <Icon name="command" size={20} />
          <span>⌘K</span>
        </button>
        <button className={`ws-rail-btn${showSettings ? ' on' : ''}`} onClick={() => setShowSettings(true)} title="Settings: sound, pieces, board, AI">
          <Icon name="gear" size={20} />
          <span className="ws-ja">設定</span>
          <span>Settings</span>
        </button>
        <button className={`ws-rail-btn${showControl ? ' on' : ''}`} onClick={() => setShowControl((v) => !v)} title="利き map: who controls each square (blue ☗, red ☖, purple contested). Press C" aria-pressed={showControl}>
          <span className="ws-ja" style={{ fontSize: 18 }}>利</span>
          <span>Control</span>
        </button>
        <button className={`ws-rail-btn${tilted ? ' on' : ''}`} onClick={() => setTilted((v) => !v)} title="Tilt the board (T)">
          <Icon name="tilt" size={20} />
          <span>Tilt</span>
        </button>
        <button className="ws-rail-btn" onClick={() => setFlipped((v) => !v)} title="Flip the board (F)">
          <Icon name="flip" size={20} />
          <span>Flip</span>
        </button>
      </nav>

      <section className={`ws-stage${previewing ? ' previewing' : ''}`}>
        <header className={`ws-modebar m-${mode}${mode === 'lesson' ? ` l-${lessonMode}` : ''}`}>
          <span className="ws-modebar-seal">{mode === 'lesson' ? (course ? (lessonMode === 'study' ? '研究' : '試験') : '定跡') : MODES.find((m) => m.id === mode)!.ja}</span>
          <span className="ws-modebar-text">
            <strong>
              {mode === 'lesson'
                ? course
                  ? `${lessonMode === 'study' ? 'Study' : 'Quiz'}: ${course.title}`
                  : 'Openings: pick a lesson'
                : mode === 'tsume' && tsume
                  ? `Tsume: mate in ${tsume.problem.mate}`
                  : mode === 'drill'
                    ? drillItem
                      ? `Review card ${drill!.index + 1} of ${drill!.items.length}`
                      : 'Review'
                    : mode === 'spar'
                      ? `vs AI ${userSide === 'sente' ? '☗' : '☖'}`
                      : mode === 'tesuji'
                        ? `手筋: ${tesujiDrill && tesujiDrill.filter !== 'all' ? tesujiDrill.filter : 'mixed'}`
                        : 'Analyze: move both sides freely'}
            </strong>
            <span>{modeInstruction()}</span>
          </span>
          <span className="ws-lastmove">
            {lastMove && prevSfen ? (
              <>
                <span className="ws-ply">{plyBase + (preview ? preview.base + preview.step : cursor)}手目</span>
                <strong>{moveText(prevSfen, lastMove)}</strong>
              </>
            ) : (
              <span className="ws-ply">{plyBase > 0 ? `${plyBase}手目の局面` : '開始局面'}</span>
            )}
            <span className={`ws-turn ${toMove}`}>{toMove === 'sente' ? '☗' : '☖'} to move</span>
          </span>
          {(mode === 'spar' || mode === 'analyze') && (
            <button className={`ws-help-toggle${settings.assist ? ' on' : ''}`} onClick={() => setSettings({ assist: !settings.assist })} title={settings.assist ? 'Help is on: eval bar, AI arrows and move ratings. Click to play with no help.' : 'No help: click to show the eval bar, AI arrows and move ratings again.'} aria-pressed={settings.assist}>
              {settings.assist ? 'Help on' : 'No help'}
            </button>
          )}
          {!panelHidden && (
            <div className="ws-mini-nav">
              <button className="ws-mini-wide" onClick={() => setPanel({ hidden: true })} title="Board only: hide the panel (P)" aria-label="Hide the panel">
                <Icon name="panel" size={16} />
                <span>Board only</span>
              </button>
            </div>
          )}
          {panelHidden && (
            <div className="ws-mini-nav">
              {mode === 'spar' && !resigned && !gameOver && (
                <button onClick={takeBack} disabled={lastUserMove < 0} title="待った: take back your last move" aria-label="Take back">
                  待った
                </button>
              )}
              <button onClick={() => (preview ? setPreview({ ...preview, step: Math.max(0, preview.step - 1) }) : setCursor((c) => Math.max(0, c - 1)))} disabled={preview ? preview.step === 0 : cursor === 0} title="Back (←)" aria-label="Back">
                <Icon name="prev" size={16} />
              </button>
              <button onClick={() => (preview ? setPreview({ ...preview, step: Math.min(preview.moves.length, preview.step + 1) }) : setCursor((c) => Math.min(game.moves.length, c + 1)))} disabled={preview ? preview.step >= preview.moves.length : atEnd} title="Forward (→)" aria-label="Forward">
                <Icon name="next" size={16} />
              </button>
              <button className="ws-mini-wide" onClick={() => setPanel({ hidden: false })} title="Show the panel (P)" aria-label="Show the panel">
                <Icon name="panel" size={16} />
                <span>Panel</span>
              </button>
            </div>
          )}
          {mode === 'spar' && (
            <label className="ws-strength">
              <span>AI</span>
              <select value={settings.opponent} onChange={(e) => setSettings({ opponent: e.target.value as AiStrength })} aria-label="AI strength">
                {(Object.keys(STRENGTH) as AiStrength[]).map((k) => (
                  <option key={k} value={k}>
                    {STRENGTH[k].label}
                  </option>
                ))}
              </select>
              <select value={settings.aiStrategy} onChange={(e) => setSettings({ aiStrategy: e.target.value })} aria-label="AI strategy" title="What the AI plays against your 四間飛車. It follows that setup's book lines while it can, then thinks for itself.">
                <option value="">Any strategy</option>
                {SETUPS.filter((x) => !x.technique && strategyCourses(x.id, userSide).length > 0).map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.ja}
                  </option>
                ))}
              </select>
            </label>
          )}
          {inCheck && !gameOver && <span className="ws-check">王手</span>}
        </header>
        <div className="ws-board-wrap">
          {ai && assist && (mode === 'analyze' || mode === 'spar' || (mode === 'lesson' && !!course && lessonMode === 'study')) && <div className="ws-evalbar" aria-label="Evaluation">
            <div className="ws-evalbar-fill" style={{ ['--rate' as string]: `${(flipped ? 1 - senteRate : senteRate) * 100}%` }} />
            {evalSente && (
              <span className={`ws-evalbar-text ${(senteRate >= 0.5) !== flipped ? 'bottom' : 'top'} ${senteRate >= 0.5 ? 'light' : 'dark'}`} title={`Win chance: ☗ ${Math.round(senteRate * 100)}% / ☖ ${100 - Math.round(senteRate * 100)}%`}>
                {senteRate >= 0.5 ? '☗' : '☖'}
                <br />
                {Math.round(Math.max(senteRate, 1 - senteRate) * 100)}
              </span>
            )}
          </div>}
          <Board3D
            key={`${settings.pieceStyle}|${settings.boardStyle}|${fontReady}`}
            position={position}
            flipped={flipped}
            tilted={tilted}
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
          />
          {preview && mistake && (
            <div className={`ws-preview mistake${mistakeIsBad(mistake) ? '' : ' ok'}`} role="status">
              <span className="ws-preview-seal">{mistakeSeal(mistake)}</span>
              {mode === 'drill' && <span className="ws-short">{mistakeIsBad(mistake) ? 'Better' : 'Lesson'}: {moveText(sfens[mistake.base], mistake.expected)}</span>}
              {mode === 'tsume' && <span className="ws-short">Not mate</span>}
              <span>
                {mistakeHeadline(moveText(sfens[mistake.base], mistake.usi), mistake)}. {playing ? 'Watch what follows.' : preview.step < preview.moves.length ? 'Paused.' : 'That is how it continues.'}
              </span>
              <button onClick={() => (playing ? setPlaying(false) : (preview.step >= preview.moves.length && setPreview({ ...preview, step: 1 }), setPlaying(true)))}>{playing ? 'Pause' : 'Replay'}</button>
              {mode !== 'drill' && (
                <button className="primary" onClick={goBack}>
                  Go back and try again
                </button>
              )}
            </div>
          )}
          {preview && !mistake && (
            <div className="ws-preview" role="status">
              <span className="ws-preview-seal">検討</span>
              <span>
                Preview: {preview.title}, <span className="ws-nowrap">move {preview.step} of {preview.moves.length}</span>
              </span>
              <button onClick={() => setPlaying((v) => !v)}>{playing ? 'Pause' : 'Play'}</button>
              <button onClick={keepPreview} disabled={preview.step === 0}>Keep these moves</button>
              <button onClick={() => (setPreview(null), setPlaying(false))}>Exit preview</button>
            </div>
          )}
          {!preview && onVariation && (
            <div className="ws-preview branch" role="status">
              <span className="ws-preview-seal">変化</span>
              <span>
                {atEnd ? (
                  <>
                    Variation
                  </>
                ) : (
                  <>
                    Move {cursor} of {game.moves.length}. <strong className="ws-branch-tip">Play a different move to branch (変化)</strong>
                  </>
                )}
              </span>
              <button title="Go back to the main line"
                onClick={() => {
                  let i = 0
                  const main = mainLine(tree)
                  while (i < game.moves.length && main[i] === game.moves[i]) i++
                  setGame((g) => ({ ...g, moves: main }))
                  setCursor(i)
                }}
              >
                Main line
              </button>
              <button onClick={() => setTree((t) => promote(t, game.moves))} title="Make this variation the main line">
                Make it main
              </button>
            </div>
          )}
          {!preview && !onVariation && previewing && (
            <div className="ws-preview" role="status">
              <span className="ws-preview-seal">{playing ? '再生' : '検討'}</span>
              <span>{playing ? 'Playing the line' : <>Move {cursor} of {game.moves.length}. <strong className="ws-branch-tip">{mode === 'spar' || mode === 'analyze' ? 'Play a different move to branch (変化)' : 'A move here replaces what came after'}</strong></>}</span>
              <button onClick={() => (playing ? setPlaying(false) : (setCursor(game.moves.length), setPlaying(false)))}>{playing ? 'Pause' : 'Go to the last move'}</button>
            </div>
          )}
          {mode === 'tsume' && <span className="ws-plate top"><span className="ws-plate-side">{flipped ? '☗ Sente' : '☖ Gote'}</span><span className="ws-muted">{(flipped ? 'sente' : 'gote') === userSide ? 'You attack' : 'Defends'}</span></span>}
          {mode === 'tsume' && <span className="ws-plate bottom"><span className="ws-plate-side">{flipped ? '☖ Gote' : '☗ Sente'}</span><span className="ws-muted">{(flipped ? 'gote' : 'sente') === userSide ? 'You attack' : 'Defends'}</span></span>}
          {mode !== 'tsume' && !(mode === 'lesson' && !course) && <Plate className="top" position={position} color={flipped ? Color.BLACK : Color.WHITE} who={mode === 'analyze' || (mode === 'lesson' && !course) || (mode === 'drill' && !drillItem) ? null : (flipped ? 'sente' : 'gote') === userSide ? 'You' : 'Opponent'} />}
          {compact && !drawer && (
            <button className="ws-phone-task" onClick={() => setDrawer(true)}>
              <span>{modeInstruction()}</span>
              <b>{mode === 'lesson' && !course ? 'Pick a lesson' : mode === 'drill' && !drillItem ? 'Pick a queue' : 'Panel'} ›</b>
            </button>
          )}
          {mode !== 'tsume' && !(mode === 'lesson' && !course) && <Plate className="bottom" position={position} color={flipped ? Color.WHITE : Color.BLACK} who={mode === 'analyze' || (mode === 'lesson' && !course) || (mode === 'drill' && !drillItem) ? null : (flipped ? 'gote' : 'sente') === userSide ? 'You' : 'Opponent'} />}
          {((gameOver && game.moves.length > 0 && (mode === 'spar' || mode === 'analyze')) || (resigned && mode === 'spar')) && endHidden !== sfen && (
            <div className="ws-gameover" role="status">
              <button className="ws-gameover-x" onClick={() => setEndHidden(sfen)} aria-label="Hide this and look at the board" title="Look at the board">
                ×
              </button>
              <strong>{resigned && !gameOver ? '投了' : '詰み'}</strong>
              <span>
                {resigned && !gameOver ? `You resigned. ${userSide === 'sente' ? '☖ Gote' : '☗ Sente'} wins` : toMove === 'sente' ? '☖ Gote' : '☗ Sente'}{resigned && !gameOver ? '' : ' wins'}
                {mode === 'spar' ? ((toMove === 'sente' ? 'gote' : 'sente') === userSide ? '. Well played!' : '. The AI wins this one.') : '.'}
              </span>
              <div className="ws-actions">
                {mode === 'spar' && (
                  <button onClick={reviewGame}>
                    Review this game
                  </button>
                )}
                {mode === 'spar' && (
                  <button className="primary" onClick={() => load(InitialPositionSFEN.STANDARD, userSide, 'spar', null)}>
                    New game
                  </button>
                )}
              </div>
            </div>
          )}
          {announce && (
            <div key={announce.key} className={`ws-announce ${announce.side === Color.BLACK ? 'sente' : 'gote'}`} role="status">
              <span>
                {announce.side === Color.BLACK ? '☗ 先手' : '☖ 後手'} {announce.kind}
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
              Hint: the first move uses your {pieceOfFirst(tsume.problem)}.
            </div>
          )}
          {promotion && (
            <div className="ws-promote" role="dialog" aria-label="Promote?">
              {promotion.map((m) => (
                <button key={m.usi} className={m.promote ? 'yes' : 'no'} onClick={() => void commit(m.usi)}>
                  <span className={`ws-koma${m.promote ? ' promoted' : ''}`}>{m.promote ? (PROMOTED_CHAR[m.pieceType] ?? PIECE_CHAR[m.pieceType]) : PIECE_CHAR[m.pieceType]}</span>
                  <span>{m.promote ? '成る' : '成らない'}</span>
                </button>
              ))}
              <button className="cancel" onClick={() => (setPromotion(null), setSelection(null))} title="Cancel this move (Esc)">
                <span className="ws-koma-x">×</span>
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {compact && drawer && <div className="ws-drawer-back" onPointerDown={() => setDrawer(false)} aria-hidden="true" />}
      <aside className={`ws-panel${sheetIsOpen ? ' open' : ''}`}>
        <div
          className="ws-panel-resize"
          title="Drag to resize the panel"
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
          aria-label={sheetIsOpen ? 'Collapse panel' : 'Expand panel'}
        />
        <div className="ws-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
              <span className="ws-ja">{t.ja}</span>
              <span>{t.name}</span>
            </button>
          ))}
          <button className="ws-panel-close" onClick={() => setPanel({ hidden: true })} title="Close the panel (P)" aria-label="Close the panel">
            ×
          </button>
        </div>
        <div className="ws-panel-body">
          {level === 'new' && selection && !(mode === 'lesson' && course) && <PieceGuide sfen={sfen} from={selection.from} />}
          {tab === 'engine' && !ai && <p className="ws-muted">The AI needs a cross-origin isolated page. Reload from the dev server.</p>}
          {tab === 'engine' && ai && spoilerFree && <p className="ws-muted">The AI stays quiet until you answer.</p>}
          {tab === 'engine' && ai && !spoilerFree && gameOver && <p className="ws-muted">Checkmate: {toMove === 'sente' ? '☖ Gote' : '☗ Sente'} has won. Step back to analyse earlier positions.</p>}
          {tab === 'engine' && !assist && <p className="ws-muted">Help is off. Turn it back on in the header to see the AI's view.</p>}
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
                  <span className="ws-kifu-tag">棋譜コメント</span> {gameNotes.comments[cursor]}
                </p>
              )}
              {gameNotes.ending && cursor === gameNotes.moves.split(' ').length && <p className="ws-note">{gameNotes.ending}</p>}
            </div>
          )}
          {tab === 'coach' && mode === 'spar' && (
            <div className="ws-seg ws-spar-side" role="group" aria-label="Your side">
              {(['sente', 'gote'] as const).map((side) => (
                <button key={side} className={userSide === side ? 'on' : ''} onClick={() => (side === userSide ? undefined : game.moves.length > 0 ? setConfirm({ text: `Start a new game as ${side === 'sente' ? '☗ sente' : '☖ gote'}? Your current game (${game.moves.length} moves) will be lost.`, run: () => load(InitialPositionSFEN.STANDARD, side, 'spar', null) }) : load(InitialPositionSFEN.STANDARD, side, 'spar', null))}>
                  {side === 'sente' ? 'Play ☗ sente' : 'Play ☖ gote'}
                </button>
              ))}
            </div>
          )}
          {tab === 'coach' && mode === 'spar' && game.moves.length > 0 && !gameOver && (
            <div className="ws-actions ws-spar-actions">
              {!resigned && (
                <button onClick={takeBack} disabled={lastUserMove < 0} title="Take back your last move and the AI's reply">
                  待った Take back
                </button>
              )}
              {!resigned && (
                <button onClick={() => setConfirm({ text: 'Resign this game? You can still review it afterwards.', run: () => setResigned(true), yes: 'Resign', no: 'Keep playing' })}>
                  Resign
                </button>
              )}
              <button onClick={reviewGame}>Review in 検討 Analyze</button>
            </div>
          )}
          {tab === 'coach' && (mode === 'spar' || mode === 'analyze') && !assist && <p className="ws-muted">Help is off: no ratings, arrows or eval while you play. Your mistakes are still saved; review the game in 検討 Analyze afterwards with help on.</p>}
          {tab === 'coach' && (mode === 'spar' || mode === 'analyze') && assist && <CoachPane review={review} lastMove={reviewAt > 0 ? game.moves[reviewAt - 1] : undefined} prevSfen={reviewAt > 0 ? sfens[reviewAt - 1] : null} you={mode === 'spar'} bookLast={reviewAt === cursor ? bookLast : bookAt(reviewAt)} bookHere={bookHere} sfen={sfen} course={course} onPlay={play} canPlay={userTurn} hide={false} ai={ai} showBook={mode === 'analyze'} />}
          {tab === 'flow' && spoilerFree && <p className="ws-muted">Find the move yourself first. The options appear here after you answer.</p>}
          {tab === 'flow' && !spoilerFree && gameOver && <p className="ws-muted">The game is over: checkmate. Step back to look at earlier positions.</p>}
          {tab === 'flow' && !assist && <p className="ws-muted">Help is off. Turn it back on in the header to see the lines.</p>}
          {tab === 'flow' && assist && !spoilerFree && !gameOver && <FlowPane lanes={lanes} sfen={lanesRef.current.sfen} onPreview={startPreview} onHover={setHoverLane} />}
          {tab === 'moves' && (mode === 'spar' || mode === 'analyze') && !preview && (
            <GamesBox current={slotId} onSave={saveSlot} onCopy={exportKif} onOpen={openSlot} onDelete={(g) => setConfirm({ text: `Delete “${g.title}”? This cannot be undone.`, run: () => (deleteGame(g.id), g.id === slotId && setSlotId(null)), yes: 'Delete', no: 'Keep it' })} onImport={importGame} />
          )}
          {tab === 'moves' &&
            (preview && previewSfens ? (
              <>
                <p className="ws-muted">Showing a preview. These moves are not part of your game.</p>
                <MovesPane sfens={[...sfens.slice(0, preview.base), ...previewSfens]} moves={[...game.moves.slice(0, preview.base), ...preview.moves]} cursor={preview.base + preview.step} setCursor={(i) => i >= preview.base && setPreview({ ...preview, step: i - preview.base })} title={gameTitle} />
              </>
            ) : (
              <MovesPane
                sfens={sfens}
                moves={game.moves}
                cursor={cursor}
                setCursor={setCursor}
                title={gameTitle}
                onScore={(k, cp) => setEvals((e) => ({ ...e, [k]: cp }))}
                tree={mode === 'spar' || mode === 'analyze' ? tree : null}
                autoRate={mode === 'analyze' && autoRate === game.moves.join(' ')}
                onSwitch={(path) => {
                  const node = nodeAt(tree, path)
                  setGame((g) => ({ ...g, moves: [...path, ...mainContinuation(node)] }))
                  setCursor(path.length)
                }}
                onDelete={(path, size) =>
                  setConfirm({
                    text: `Delete this variation (${size} ${size === 1 ? 'move' : 'moves'})? This cannot be undone.`,
                    run: () => setTree((t) => removeBranch(t, path)),
                    yes: 'Delete',
                    no: 'Keep it',
                  })
                }
              />
            ))}
        </div>
        {ai && assist && game.moves.length > 0 && (mode === 'analyze' || mode === 'spar') && <EvalGraph className={tab === 'moves' ? '' : 'phone-hidden'} values={sfens.map((s) => evals[strip(s)])} cursor={cursor} onJump={setCursor} onScan={scanGame} scanning={scanning} />}
        <footer className="ws-nav">
          <button onClick={() => (preview ? setPreview({ ...preview, step: 0 }) : setCursor(0))} disabled={preview ? preview.step === 0 : cursor === 0} title="Start (Home)">
            <Icon name="first" />
          </button>
          <button onClick={() => (preview ? setPreview({ ...preview, step: Math.max(0, preview.step - 1) }) : setCursor((c) => Math.max(0, c - 1)))} disabled={preview ? preview.step === 0 : cursor === 0} title="Back (←)">
            <Icon name="prev" />
          </button>
          <button className="ws-play" onClick={() => setPlaying((v) => !v)} disabled={!playing && (!upcoming || !autoplayAllowed)} title={playing ? 'Pause (Space)' : 'Play the line forward (Space)'} aria-pressed={playing}>
            <Icon name={playing ? 'pause' : 'play'} />
          </button>
          <button onClick={() => (preview ? setPreview({ ...preview, step: Math.min(preview.moves.length, preview.step + 1) }) : setCursor((c) => Math.min(game.moves.length, c + 1)))} disabled={preview ? preview.step >= preview.moves.length : atEnd} title="Forward (→)">
            <Icon name="next" />
          </button>
          <button onClick={() => (preview ? setPreview({ ...preview, step: preview.moves.length }) : setCursor(game.moves.length))} disabled={preview ? preview.step >= preview.moves.length : atEnd} title="Latest (End)">
            <Icon name="last" />
          </button>
          <button onClick={() => (game.moves.length > 0 ? setConfirm({ text: 'Start over from the beginning? The moves on the board will be cleared.', run: () => load(course ? course.root.sfen : InitialPositionSFEN.STANDARD, userSide, mode, course) }) : undefined)} title="Start over">
            <Icon name="reset" />
          </button>
        </footer>
      </aside>

      {palette && <Palette commands={commands} onClose={() => setPalette(false)} />}
      {confirm && (
        <div className="ws-palette-back" onPointerDown={() => performance.now() - confirmAt.current > 250 && setConfirm(null)}>
          <div className="ws-dialog" role="alertdialog" aria-label="Confirm" onPointerDown={(e) => e.stopPropagation()}>
            <p>{confirm.text}</p>
            <div className="ws-actions">
              <button onClick={() => setConfirm(null)} autoFocus>
                {confirm.no ?? 'Keep playing'}
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (performance.now() - confirmAt.current < 250) return
                  confirm.run()
                  setConfirm(null)
                }}
              >
                {confirm.yes ?? 'Yes, start new'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} level={level} onLevel={setLevel} onViewer={() => (setShowSettings(false), setShowViewer(true))} />}
      {showViewer && <PieceViewer onClose={() => setShowViewer(false)} />}
      {welcome && (
        <div className="ws-palette-back">
          <div className="ws-dialog ws-welcome" role="dialog" aria-label="Welcome">
            <div className="ws-steps" aria-hidden="true">
              {[0, 1, 2].map((n) => (
                <i key={n} className={n === welcomeStep ? 'on' : n < welcomeStep ? 'done' : ''} />
              ))}
            </div>
            {welcomeStep === 0 && (
              <>
                <h2>ようこそ ShogiLab</h2>
                <p>A workshop for learning 四間飛車: study real opening lines, quiz yourself, solve tsume and play the AI. How well do you know shogi?</p>
                <div className="ws-welcome-choices">
                  <button className={level === 'rules' ? 'primary' : ''} onClick={() => (setLevelOnly('rules'), setWelcomeStep(1))}>
                    <strong>I know the rules</strong>
                    <span>I can read 7六歩-style moves and know how every piece moves.</span>
                  </button>
                  <button className={level === 'new' ? 'primary' : ''} onClick={() => (setLevelOnly('new'), setWelcomeStep(1))}>
                    <strong>New to shogi</strong>
                    <span>Show how each piece moves when I tap it, and describe lesson moves in plain English.</span>
                  </button>
                </div>
              </>
            )}
            {welcomeStep === 1 && (
              <>
                <h2>How the screen works</h2>
                <ul className="ws-tour">
                  {MODES.map((m) => (
                    <li key={m.id}>
                      <Icon name={m.icon} size={18} />
                      <strong>
                        {m.ja} {m.name}
                      </strong>
                      <span>{m.hint}.</span>
                    </li>
                  ))}
                  <li>
                    <Icon name="coach" size={18} />
                    <strong>Side panel</strong>
                    <span>Coach explains moves, AI rates the position, What next shows lines, Moves lists the game. Hide it with Board only or ×.</span>
                  </li>
                  <li>
                    <Icon name="prev" size={18} />
                    <strong>Step back</strong>
                    <span>← and → walk through moves. Play a different move to try a 変化 variation; the game is kept.</span>
                  </li>
                </ul>
                <div className="ws-actions">
                  <button onClick={() => setWelcomeStep(0)}>Back</button>
                  <button className="primary" onClick={() => setWelcomeStep(2)}>
                    Next
                  </button>
                </div>
              </>
            )}
            {welcomeStep === 2 && (
              <>
                <h2>Where do you want to start?</h2>
                <div className="ws-welcome-choices">
                  <button
                    className="primary"
                    onClick={() => {
                      finishWelcome()
                      const first = COURSES.find((c) => c.id === SETUPS[0].courseIds[0])
                      if (first) openCourse(first, 'study')
                    }}
                  >
                    <strong>Learn the basic 四間飛車 setup</strong>
                    <span>Study mode walks you through every move with the reason. Then quiz yourself.</span>
                  </button>
                  <button onClick={() => (finishWelcome(), load(InitialPositionSFEN.STANDARD, 'sente', 'spar', null))}>
                    <strong>Play the AI</strong>
                    <span>Beginner strength. The coach rates your moves and your mistakes go to Review.</span>
                  </button>
                  <button onClick={() => (finishWelcome(), enterMode('tsume'))}>
                    <strong>Solve 1手詰</strong>
                    <span>Mate-in-one puzzles to warm up.</span>
                  </button>
                  <button onClick={finishWelcome}>
                    <strong>Just look around</strong>
                    <span>Pick anything from the lesson list.</span>
                  </button>
                </div>
                <p className="ws-muted">Your level and display options are in 設定 Settings.</p>
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
  const side = rate > 0.5 ? '☗ Sente' : '☖ Gote'
  if (lead < 0.04) return 'The position is even'
  if (lead < 0.12) return `${side} is slightly better`
  if (lead < 0.25) return `${side} is better`
  if (lead < 0.4) return `${side} is clearly better`
  return `${side} is winning`
}

function EnginePane({ sfen, toMove, analysis, showBest, setShowBest, onPlay, canPlay, book }: { sfen: string; toMove: Side; analysis: ReturnType<typeof useAnalysis>['analysis']; showBest: boolean; setShowBest: (v: boolean) => void; onPlay: (usi: string) => void; canPlay: boolean; book: { usi: string; note?: string }[] }) {
  const [openLine, setOpenLine] = useState<number | null>(null)
  if (!engineSupported()) return <p className="ws-muted">The AI needs a cross-origin isolated page. Reload from the dev server.</p>
  if (!analysis || !analysis.candidates.length) return <p className="ws-muted">Analysing the position…</p>
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
      <p className="ws-legend">Board arrows: solid = the AI's best move, dashed = other good candidates (their win-chance cost is listed below).</p>
      <AiControls />
      <div className="ws-standing">
        <strong>{standing(senteRate)}</strong>
        <div className="ws-meter" aria-hidden="true">
          <span style={{ width: `${senteRate * 100}%` }} />
        </div>
        <span className="ws-muted">
          Win chance: ☗ {Math.round(senteRate * 100)}% against ☖ {Math.round((1 - senteRate) * 100)}%
        </span>
      </div>

      <div className="ws-best">
        <span className="ws-muted">Best move for {toMove === 'sente' ? '☗' : '☖'}</span>
        <div className="ws-best-row">
          <strong>{moveText(sfen, best.move)}</strong>
          {book.some((b) => b.usi === best.move) && <span className="ws-pill">book</span>}
          {canPlay && <button onClick={() => onPlay(best.move)}>Play it</button>}
        </div>
        {why(best.move) && <p>{why(best.move)}</p>}
        {answer(best) && <p className="ws-muted">They would likely answer {answer(best)}.</p>}
      </div>

      {others.length > 0 && <h3 className="ws-sub">Other moves</h3>}
      {others.map((c) => {
        const loss = Math.max(0, Math.round((bestRate - scoreWinRate(c.score)) * 100))
        return (
          <div key={c.multipv} className="ws-alt">
            <div className="ws-alt-row">
              <strong>{moveText(sfen, c.move)}</strong>
              <span className={`ws-loss${loss >= 10 ? ' bad' : loss >= 4 ? ' meh' : ''}`}>{loss === 0 ? 'just as good' : `−${loss}% win chance`}</span>
              {canPlay && <button onClick={() => onPlay(c.move)}>Play</button>}
            </div>
            {why(c.move) && <p>{why(c.move)}</p>}
          </div>
        )
      })}

      <button className="ws-more" onClick={() => setOpenLine(openLine === null ? 1 : null)}>
        {openLine === null ? 'See how the best line continues' : 'Hide the line'}
      </button>
      {openLine !== null && <p className="ws-pv">{pvText(sfen, best.pv, 8)}</p>}

      <label className="ws-toggle">
        <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} />
        <span>Show the best move as an arrow</span>
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
                  {you ? 'Your move ' : ''}
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
                  Better was <strong>{moveText(prevSfen, review.best.move)}</strong>
                  {review.bestReasons[0] && !review.bestReasons[0].startsWith('Engine line') ? `: ${review.bestReasons[0]}` : '.'}
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
                <span style={{ color: LABELS.book.color }}>Book move</span>
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
                <span style={{ color: LABELS.mistake.color }}>Known mistake</span>
              </div>
              {(bookLast.branch.punishNote ?? bookLast.branch.note) && <p className="ws-note warn">{bookLast.branch.punishNote ?? bookLast.branch.note}</p>}
            </>
          ) : ai ? (
            <p className="ws-muted">Checking {moveText(prevSfen, lastMove)}…</p>
          ) : (
            <p className="ws-muted">{moveText(prevSfen, lastMove)} is off the book. Turn the AI on (A) to have it rated.</p>
          )}
        </div>
      ) : (
        <p className="ws-muted">{course ? course.root.comment ?? course.goalFormation : 'Make a move. The coach checks it against the book and the AI and tells you why.'}</p>
      )}
      {showBook && bookHere.length > 0 && (
        <div className="ws-book">
          <h3>Book moves from the lessons</h3>
          {hide ? (
            <p className="ws-muted">Your move. Find the book move; the coach reveals it after you play.</p>
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

function MovesPane({ sfens, moves, cursor, setCursor, title, onScore, tree, onSwitch, onDelete, autoRate }: { sfens: string[]; moves: string[]; cursor: number; setCursor: (i: number) => void; title: string; onScore?: (sfen: string, cp: number) => void; tree?: Tree | null; onSwitch?: (path: string[]) => void; onDelete?: (path: string[], size: number) => void; autoRate?: boolean }) {
  const [, setTick] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const tesujis = useMemo(() => moves.map((usi, i) => (sfens[i] ? detectTesuji(sfens[i], usi) : null)), [moves, sfens])
  useEffect(() => {
    const row = listRef.current?.children[Math.max(0, cursor - 1)] as HTMLElement | undefined
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
  if (moves.length === 0) return <p className="ws-muted">No moves yet. Play on the board, or import a game in 検討 Analyze (Coach tab).</p>
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
  const mistakes = current?.items.filter((l) => l === 'mistake' || l === 'miss' || l === 'blunder').length ?? 0
  return (
    <div>
      <div className="ws-rate">
        {engineSupported() && progress === null && !rated && <button onClick={rate}>{current ? 'Rate the remaining moves' : 'Rate every move'}</button>}
        {progress !== null && <span className="ws-muted">Rating move {progress} of {moves.length}…</span>}
        {rated && progress === null && (
          <>
            <span className="ws-muted">{mistakes ? `${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'} found.` : 'No mistakes found.'}</span>
            {mistakes > 0 && saved === null && !allSaved && <button onClick={saveMine}>Save them as review cards</button>}
            {mistakes > 0 && saved === null && allSaved && <span className="ws-muted">Already saved to 復習 Review.</span>}
            {saved !== null && <span className="ws-muted">All {mistakes} {mistakes === 1 ? 'is' : 'are'} in 復習 Review now. Practise them there.</span>}
          </>
        )}
      </div>
      {tree && <p className="ws-legend ws-branch-help">What-if: click any move below, then play a different move on the board. It becomes a 変化 variation and the game is kept.</p>}
      <p className="ws-legend">本 book move · ?! inaccuracy · ? mistake · ?? blunder · ! great · 変 variation · red tag = 手筋 (tesuji) found</p>
      <ol className="ws-moves" ref={listRef}>
        {moves.map((usi, i) => {
          const label = current?.items[i]
          const siblings = tree ? (nodeAt(tree, moves.slice(0, i))?.children ?? []).filter((c) => c.usi !== usi) : []
          return (
            <li key={i} className={[siblings.length ? 'has-vars' : '', tree && !isMainLine(tree, moves.slice(0, i + 1)) ? 'in-var' : ''].join(' ')}>
              <button className={cursor === i + 1 ? 'on' : ''} onClick={() => setCursor(i + 1)}>
                <span className="ws-move-no">{i + 1}</span>
                {moveText(sfens[i], usi, moves[i - 1])}
                {tesujis[i] && (
                  <span className="ws-move-tesuji" title={`手筋 ${tesujis[i]!.ja}: ${tesujis[i]!.explain}`}>
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
                  <span className="ws-vars-tag">変化</span>
                  {siblings.map((c) => (
                    <span key={c.usi} className="ws-var">
                      <button onClick={() => onSwitch?.([...moves.slice(0, i), c.usi])} title="Switch to this line">
                        {moveText(sfens[i], c.usi, moves[i - 1])}
                        {c.children.length > 0 && <small> +{countMoves(c)}</small>}
                      </button>
                      <button className="ws-var-x" onClick={() => onDelete?.([...moves.slice(0, i), c.usi], countMoves(c) + 1)} aria-label="Delete this variation" title="Delete this variation">
                        ×
                      </button>
                    </span>
                  ))}
                </span>
              )}
            </li>
          )
        })}
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
  if (!move) return 'pieces'
  const name = PIECE_INFO[move.pieceType]
  return move.from instanceof Square ? `${name.ja} on the board` : `${name.ja} in hand (a drop)`
}

function TesujiPane({ drill, sfen, onFilter, onNext, onHint, onShow }: { drill: { item: TesujiDrill; filter: string; status: 'asking' | 'right' | 'shown'; missed: boolean; hint: boolean; wrong?: string }; sfen: string; onFilter: (f: string) => void; onNext: () => void; onHint: () => void; onShow: () => void }) {
  const stats = tesujiStats()
  const pool = TESUJI_DRILLS.filter((d) => drill.filter === 'all' || d.tesuji === drill.filter)
  const side = colorSide(positionOf(sfen).color) === 'sente' ? '☗' : '☖'
  return (
    <div className="ws-practice">
      <div className="ws-seg small ws-tesuji-filter" role="group" aria-label="Tesuji type">
        {['all', ...TESUJI_KINDS].map((k) => (
          <button key={k} className={drill.filter === k ? 'on' : ''} onClick={() => onFilter(k)}>
            {k === 'all' ? 'Mixed' : k}
          </button>
        ))}
      </div>
      <p className="ws-task">
        {side} to move. Find the {drill.hint || drill.status !== 'asking' ? <strong>{drill.item.tesuji}</strong> : '手筋'}.
      </p>
      {drill.status === 'asking' && drill.wrong && <p className="ws-result wrong">{moveText(sfen, drill.wrong)} is not it. Look again{drill.hint ? '' : ', or take a hint'}.</p>}
      {drill.status === 'asking' && drill.hint && <p className="ws-note">{drill.item.explain}</p>}
      {drill.status !== 'asking' && (
        <div className={`ws-card ${drill.status === 'right' ? 'good' : ''}`}>
          <strong>
            {drill.status === 'right' ? '✓ ' : ''}
            {moveText(sfen, drill.item.answer)}: {drill.item.tesuji} <span className="ws-muted">({drill.item.en})</span>
          </strong>
          <p>{drill.item.explain}</p>
          {drill.item.note && <p className="ws-note">{drill.item.note}</p>}
          <p className="ws-muted">From: {drill.item.from}</p>
        </div>
      )}
      <div className="ws-actions">
        <button className="primary" onClick={onNext}>
          Next
        </button>
        {drill.status === 'asking' && !drill.hint && <button onClick={onHint}>Hint</button>}
        {drill.status === 'asking' && <button onClick={onShow}>Show answer</button>}
      </div>
      <p className="ws-muted">
        Solved first try: {pool.filter((d) => stats.solved.includes(d.id)).length} of {pool.length}
      </p>
    </div>
  )
}

function TsumePane({ tsume, onLength, onNext, onRetry, onHint, onShow, escape, onEscape }: { tsume: { problem: Problem; status: string; reason?: string; hint: number; length: number | 'all'; good: number; missed?: boolean; seen?: boolean }; onLength: (n: number | 'all') => void; onNext: () => void; onRetry: () => void; onHint: () => void; onShow: () => void; escape: boolean; onEscape: () => void }) {
  const stats = loadTsumeStats()
  const pool = PROBLEMS.filter((p) => tsume.length === 'all' || p.mate === tsume.length)
  const attacker = attackerOf(tsume.problem)
  return (
    <div className="ws-practice">
      <div className="ws-seg small" role="group" aria-label="Problem length">
        {([1, 3, 5, 7, 'all'] as const).map((n) => (
          <button key={n} className={tsume.length === n ? 'on' : ''} onClick={() => onLength(n)}>
            {n === 'all' ? 'Mixed' : `${n}手詰`}
          </button>
        ))}
      </div>
      <p className="ws-task">
        {attacker === 'sente' ? '☗' : '☖'} to play and mate in {tsume.problem.mate}.<span className="ws-wide"> Every attacking move must give check.</span>
      </p>
      <div className="ws-tsume-status">
        {tsume.status === 'checking' ? (
          <p className="ws-muted">Checking your move…</p>
        ) : tsume.status === 'solved' ? (
          <p className="ws-result right">{tsume.seen ? '詰み. Solved after seeing the solution, so it is not counted as solved yet.' : tsume.hint >= 2 ? '詰み. Solved after the first move was shown, so it is not counted as solved yet.' : tsume.missed ? '詰み. Solved on a second try, so it is not counted as solved yet. Next time, first try.' : '詰み. Solved.'}</p>
        ) : tsume.status === 'wrong' ? (
          <p className="ws-result wrong">Not mate. {tsume.reason}</p>
        ) : tsume.status === 'shown' ? (
          <p className="ws-pv">Solution: {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}</p>
        ) : tsume.good > 0 ? (
          <p className="ws-result right">✓ Check, and still mate in time. Keep going.</p>
        ) : (
          <p className={tsume.hint >= 1 ? 'ws-note ws-hint-line' : 'ws-note ws-hint-line idle'}>
            {tsume.hint >= 1 ? `Hint: the first move uses your ${pieceOfFirst(tsume.problem)}.${tsume.hint >= 2 ? ' The yellow arrow shows it.' : ''}` : 'Stuck? Hint tells you which piece moves first.'}
          </p>
        )}
      </div>
      <div className="ws-actions">
        <button className="primary" onClick={onNext}>
          Next problem
        </button>
        {(tsume.status === 'playing' || tsume.status === 'wrong') && <button onClick={onShow}>Show solution</button>}
        {(tsume.status === 'wrong' || tsume.status === 'shown') && <button onClick={onRetry}>Try again</button>}
        {tsume.status === 'playing' && <button onClick={onHint} disabled={tsume.hint >= 2}>{tsume.hint === 0 ? 'Hint' : 'Show move'}</button>}
      </div>
      <label className="ws-check-row">
        <input type="checkbox" checked={escape} onChange={onEscape} />
        <span>逃げ道: show where the king can run (K)</span>
      </label>
      {tsume.status === 'solved' && <p className="ws-pv">Solution: {pvText(tsume.problem.sfen, tsume.problem.pv, tsume.problem.mate)}</p>}
      <p className="ws-muted">
        Solved {pool.filter((p) => stats.solved.includes(p.id)).length} of {pool.length} in this set.
      </p>
    </div>
  )
}

function sfenAfter(start: string, moves: string[]) {
  return moves.reduce((s, usi) => applyUsi(s, usi) ?? s, start)
}

function untilText(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `in ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `in ${hours} h`
  return `in ${Math.round(hours / 24)} days`
}

function ReviewPane({ drill, item, startSfen, onQueue, onNext, onRetry, mistakePreview, mistakeOk }: { drill: { queue: ReviewQueue; items: ReviewItem[]; index: number; result: null | 'right' | 'wrong'; retry: boolean; answered: number } | null; item: ReviewItem | undefined; startSfen: string | null; onQueue: (q: ReviewQueue) => void; onNext: () => void; onRetry: () => void; mistakePreview: boolean; mistakeOk?: boolean }) {
  const counts = useMemo(() => reviewCounts(), [drill?.queue, drill?.index, drill?.items])
  const queues: { id: ReviewQueue; label: string; n: number }[] = [
    { id: 'due', label: 'Due', n: counts.due },
    { id: 'new', label: 'Learn new', n: counts.new },
    { id: 'difficult', label: 'Difficult', n: counts.difficult },
    { id: 'mistakes', label: 'My game mistakes', n: counts.mistakes },
  ]
  return (
    <div className="ws-practice">
      <div className="ws-seg" role="group" aria-label="Review queue">
        {queues.map((q) => (
          <button key={q.id} className={drill?.queue === q.id ? 'on' : ''} onClick={() => onQueue(q.id)}>
            {q.label} <span>{q.n > 99 ? '99+' : q.n}</span>
          </button>
        ))}
      </div>
      {item && startSfen ? (
        <>
          <p className="ws-muted">
            Card {drill!.index + 1} of {drill!.items.length}
            {item.kind === 'position' ? `, from ${item.course.title}` : ''}
            {item.kind === 'position' && item.moves.length > 0 ? `, after ${moveText(item.moves.length > 1 ? sfenAfter(item.course.root.sfen, item.moves.slice(0, -1)) : item.course.root.sfen, item.moves.at(-1)!)}` : ''}
          </p>
          {!drill!.result && <p className="ws-task">{item.kind === 'position' ? (drill!.queue === 'new' && !drill!.result && !drill!.retry ? `New position. Play ${moveText(startSfen, expectedMoves(item)[0])} (green arrow).` : `Your move as ${item.course.userSide === 'sente' ? '☗' : '☖'}: play the move from the lesson.`) : `In ${item.mistake.game === 'Imported game' ? 'an imported game' : item.mistake.game} you played ${moveText(item.mistake.sfen, item.mistake.played)} here. Find the better move.`}</p>}
          {drill!.retry && !drill!.result && <p className="ws-muted">Retry. Only your first try counts for the schedule.</p>}
          {item.kind === 'position' && drill!.queue === 'new' && !drill!.result && !drill!.retry && item.node.branches.find((b) => b.usi === expectedMoves(item)[0])?.note && <p className="ws-note">{item.node.branches.find((b) => b.usi === expectedMoves(item)[0])!.note}</p>}
          {drill!.result === 'right' && <p className="ws-result right">{drill!.retry ? 'Right this time. The card still comes back soon, because the first try missed.' : 'Right. It comes back later on a longer interval.'}</p>}
          {drill!.result === 'wrong' && (
            <p className={`ws-result ${mistakeOk ? 'ok' : 'wrong'}`}>
              {mistakeOk ? `A good move too, but the lesson plays ${moveText(startSfen, expectedMoves(item)[0])}.` : `Not this one. The better move was ${moveText(startSfen, expectedMoves(item)[0])}.`}{mistakePreview ? ' The board is showing what your move leads to.' : ' It is marked with a green arrow.'}
              {!drill!.retry && ' This card comes back in about 4 hours.'}
            </p>
          )}
          {item.kind === 'position' && drill!.result && item.node.branches.find((b) => b.usi === expectedMoves(item)[0])?.note && <p className="ws-note">{item.node.branches.find((b) => b.usi === expectedMoves(item)[0])!.note}</p>}
          {item.kind === 'mistake' && drill!.result === 'wrong' && !drill!.retry && item.mistake.reasons[0] && <p className="ws-note">Why your game move was bad: {item.mistake.reasons[0]}</p>}
          <div className="ws-actions">
            {drill!.result && <button onClick={onRetry}>Try it again</button>}
            <button className="primary" onClick={onNext}>
              {drill!.result ? 'Next card' : 'Skip'}
            </button>
          </div>
        </>
      ) : (
        <div className="ws-card">
          <strong>{drill && drill.items.length > 0 ? `Done: ${drill.answered} of ${drill.items.length} ${drill.items.length === 1 ? 'card' : 'cards'} answered` : drill?.queue === 'due' ? 'Nothing due right now' : 'Nothing in this queue'}</strong>
          {counts.new > 0 && drill?.queue !== 'new' && (
            <button className="primary" onClick={() => onQueue('new')}>
              Learn {Math.min(10, counts.new)} new positions
            </button>
          )}
          {counts.started > 0 && Number.isFinite(counts.nextDue) && counts.nextDue > Date.now() && (
            <p>
              {counts.started} {counts.started === 1 ? 'position is' : 'positions are'} in your schedule. The next ones come back {untilText(counts.nextDue - Date.now())}.
            </p>
          )}
          {drill?.queue === 'mistakes' && counts.mistakes === 0 && <p>Your own mistakes land here. In 検討 Analyze, import a game, rate every move in the 棋譜 Moves tab, then save the mistakes.</p>}
          {drill?.queue === 'difficult' && <p>A position lands here after 3 or more misses while it is still early in its schedule.</p>}
          {counts.started === 0 && drill?.queue !== 'mistakes' && drill?.queue !== 'difficult' && <p>Positions you quiz in 定跡 Openings, or learn here, come back on a schedule: after 4 hours, 1 day, 3 days, 1 week, then longer. A miss starts the position over.</p>}
        </div>
      )}
    </div>
  )
}

type Mistake = { usi: string; loss: number | null; known: boolean; verdict?: MoveReview }

const mistakeIsBad = (m: Mistake) => m.known || (m.verdict ? ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(m.verdict.label) : (m.loss ?? 0) >= 8)

function mistakeSeal(m: Mistake) {
  const label = m.verdict?.label
  if (label === 'blunder') return '大悪手'
  if (label === 'mistake' || label === 'miss' || (m.known && !label)) return '悪手'
  if (label === 'inaccuracy') return '緩手'
  if (!mistakeIsBad(m)) return '別'
  return '✗'
}

function mistakeHeadline(move: string, m: Mistake) {
  if (m.verdict && !m.known) {
    const label = LABELS[m.verdict.label].text
    const loss = m.loss ? ` (−${m.loss}% win chance)` : ''
    return ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(m.verdict.label) ? `${move}: ${label}${loss}` : `${move}: ${label}, but not this lesson's move`
  }
  if (m.known) return `${move} is a known mistake`
  if ((m.loss ?? 0) >= 8) return `${move} is a mistake (−${m.loss}% win chance)`
  return `${move} is playable, but not this lesson's move`
}

function OpeningPicker({ onOpen, level, setupId, setSetupId }: { onOpen: (c: Course, sub: 'study' | 'quiz') => void; level: Level; setupId: string | null; setSetupId: (id: string | null) => void }) {
  useEffect(() => {
    document.querySelector('.ws-panel-body')?.scrollTo(0, 0)
  }, [setupId])
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const groups = SETUPS.map((setup) => ({ setup, courses: setup.courseIds.map((id) => COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c) })).filter((g) => g.courses.length)
  const card = (c: Course) => {
    const { learned, total } = courseProgress(c)
    const side = c.userSide === 'sente' ? '☗' : '☖'
    return (
      <div key={c.id} className="ws-lesson-card">
        <span className="ws-lesson-title">{c.title}</span>
        <span className="ws-lesson-meta">
          <span className={`ws-role ${c.notesFromOpponentView ? 'defend' : 'attack'}`}>{c.notesFromOpponentView ? `They attack, you defend as ${side}` : `You play ${side} ${c.userSide}`}</span>
          <span>
            <span title="Your moves in this lesson that you got right in Quiz without help">{learned}/{total} right in Quiz</span>
          </span>
        </span>
        <span className="ws-lesson-buttons">
          <button className="primary" onClick={() => onOpen(c, 'study')}>
            Study
          </button>
          <button onClick={() => onOpen(c, 'quiz')}>Quiz</button>
        </span>
        <i className="ws-progress" style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
      </div>
    )
  }
  if (q) {
    const hits = groups.flatMap((g) => g.courses.filter((c) => `${c.title} ${g.setup.ja} ${g.setup.name}`.toLowerCase().includes(q)))
    return (
      <div className="ws-picker">
        <input className="ws-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: 鷺宮, 穴熊, 棒銀…" aria-label="Search lessons" autoFocus />
        {hits.length ? hits.map(card) : <p className="ws-muted">No lesson matches “{query}”.</p>}
      </div>
    )
  }
  const group = groups.find((g) => g.setup.id === setupId)
  if (group)
    return (
      <div className="ws-picker">
        <button className="ws-back" onClick={() => setSetupId(null)}>
          ← Back
        </button>
        <h2 className="ws-picker-title">
          {group.setup.ja}
          <span>{group.setup.name}</span>
        </h2>
        <p className="ws-picker-intro">{group.setup.intro}</p>
        {group.setup.shikenPlan && <p className="ws-picker-intro plan">{group.setup.shikenPlan}</p>}
        {group.courses.map(card)}
      </div>
    )
  return (
    <div className="ws-picker">
      <h2 className="ws-picker-title">
        What do you want to learn?
        <span>You play 四間飛車. Pick a technique, or the setup your opponent plays.</span>
      </h2>
      {level === 'new' && <p className="ws-picker-intro">Click any piece on the board to see how it moves. Lesson moves get a plain-English description.</p>}
      <input className="ws-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: 鷺宮, 穴熊, 棒銀…" aria-label="Search lessons" />
      {groups.some((g) => g.setup.technique) && <h3 className="ws-sub">Techniques</h3>}
      {[...groups.filter((g) => g.setup.technique), ...groups.filter((g) => !g.setup.technique)].map(({ setup, courses }, i, all) => {
        const p = courses.map(courseProgress).reduce((a, b) => ({ learned: a.learned + b.learned, total: a.total + b.total }), { learned: 0, total: 0 })
        return (
          <Fragment key={setup.id}>
          {!setup.technique && all[i - 1]?.setup.technique && <h3 className="ws-sub">Openings by what your opponent plays</h3>}
          <button className="ws-setup" onClick={() => setSetupId(setup.id)}>
            <span className="ws-lib-ja">
              {setup.ja}
              {setup.id === 'basics' && p.learned === 0 && <em className="ws-start">Start here</em>}
            </span>
            <span className="ws-lib-en">
              {setup.name}, {courses.length} {courses.length === 1 ? 'lesson' : 'lessons'}
            </span>
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
  return (
    <details className="ws-source">
      <summary>ShogiLab 将棋ラボ: credits and licences</summary>
      <p>Engine: YaneuraOu (WASM build by mizar, GPL-3.0). Opening data: Shiryu181/shogi-joseki (GPL-3.0), plus lines from hibitonshi.com, shogijam.com, thirdfilerook.jp and Wikipedia (CC BY-SA). Mate problems: YaneuraOu mate set. Rules and kifu: tsshogi (MIT). Fonts: Shippori Mincho B1, Zen Kaku Gothic New (SIL OFL).</p>
    </details>
  )
}

function quizSummary({ right, wrong, shown = 0, retried = 0 }: { right: number; wrong: number; shown?: number; retried?: number }) {
  const n = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`
  if (right === 0 && retried === 0 && (shown > 0 || wrong > 0)) return 'You needed help for every move this time. Quiz it again.'
  if (wrong === 0 && shown === 0 && retried === 0) return right === 1 ? 'Your move was right, no mistakes.' : `All ${right} moves right, no mistakes.`
  const parts = [`${n(right, 'move', 'moves')} found first try`, retried ? `${retried} found after a wrong try` : '', shown ? `${n(shown, 'answer', 'answers')} shown` : '', wrong ? n(wrong, 'wrong try', 'wrong tries') : ''].filter(Boolean)
  return `${parts.join(', ')}. Quiz it again until it is clean.`
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
          ← Lessons
        </button>
        {progress && progress.total > 0 && (
          <span className="ws-progress-count">
            Your moves {Math.min(progress.done, progress.total)} / {progress.total}
          </span>
        )}
        <button className="ws-back" onClick={onMap}>
          Lesson map
        </button>
      </div>
      <div className="ws-seg big" role="group" aria-label="Lesson mode">
        <button className={lessonMode === 'study' ? 'on' : ''} onClick={() => onLessonMode('study')}>
          研究 Study<span>moves shown, with reasons</span>
        </button>
        <button className={lessonMode === 'quiz' ? 'on' : ''} onClick={() => onLessonMode('quiz')}>
          試験 Quiz<span>find the moves yourself</span>
        </button>
      </div>
      {lessonMode === 'quiz' && (score.right > 0 || score.wrong > 0 || justRight) && (
        <p className="ws-score">
          <span className="right">✓ {score.right}</span>
          <span className="wrong">✗ {score.wrong}</span>
          {justRight && !mistake && !done && <span className="ws-just-right">Right, that is the lesson move.</span>}
        </p>
      )}
      {checking && <p className="ws-muted">Checking that move…</p>}
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
          {mistake.verdict && !mistake.note && mistake.verdict.reasons.length === 0 && <p>{mistakeIsBad(mistake) ? 'The opponent gets the better of it. Watch the board.' : 'Nothing goes wrong right away. The lesson plays a different plan, shown when you go back.'}</p>}
          <p className="ws-muted">
            {lessonMode === 'study' ? `The lesson move is ${moveText(sfen, mistake.expected)}${mistake.verdict && mistake.verdict.best.move !== mistake.expected && mistake.verdict.best.move !== mistake.usi ? `; the AI's top choice is ${moveText(sfen, mistake.verdict.best.move)}` : ''}. ` : ''}
            {playing ? 'The board is playing out what follows.' : 'That is how it continues.'}
          </p>
          <button className="primary" onClick={onBack}>
            Go back and try again
          </button>
        </div>
      ) : offBook ? (
        <div className="ws-card">
          <strong>You left the lesson line</strong>
          <p>The book has no moves from this position. Go back to the last lesson position, or explore this one freely.</p>
          <div className="ws-actions">
            <button className="primary" onClick={onBackToLine}>
              Back to the lesson line
            </button>
            <button onClick={onExplore}>Explore it in 検討 Analyze</button>
          </div>
        </div>
      ) : whatIf ? (
        <div className="ws-card">
          <strong>Preview: {whatIf}</strong>
          <p>The AI plays the best continuation on the board. Use “Keep these moves” to carry on from there, or “Exit preview” to go back to the lesson.</p>
        </div>
      ) : done ? (
        <div className="ws-card good">
          <strong>Line complete</strong>
          <div className="ws-actions">
            {lessonMode === 'study' && (
              <button className="primary" onClick={() => onRestart('quiz')}>
                Quiz this line
              </button>
            )}
            {nextCourse && (
              <button className={lessonMode === 'quiz' ? 'primary' : ''} onClick={() => onOpen(nextCourse, lessonMode)}>
                Next lesson
              </button>
            )}
            <button onClick={() => onRestart()}>Start again</button>
            <button onClick={onChange}>Other lessons</button>
          </div>
          {endComment && <p className="ws-endnote">{endComment}</p>}
          <p>{lessonMode === 'quiz' ? quizSummary(score) : jumped ? 'End of this branch. You jumped here from the Lesson map; play it from the start to learn it.' : 'You have seen the whole line. Now try it without hints.'}</p>
          {endRate !== null && (
            <p className={endRate >= 0.55 ? 'ws-end good' : endRate <= 0.45 ? 'ws-end bad' : 'ws-end'}>
              {endRate >= 0.55
                ? `AI's view of the final position: you are better (${Math.round(endRate * 100)}% win chance).`
                : endRate <= 0.45
                  ? `AI's view of the final position: you are worse (${Math.round(endRate * 100)}% win chance).`
                  : `AI's view of the final position: about even (${Math.round(endRate * 100)}% win chance).`}
            </p>
          )}
        </div>
      ) : asking ? (
        <div className="ws-card">
          {lessonMode === 'quiz' && !showAnswer && (
            <button className={`ws-answer-top${mistake && !mistakePreview ? ' primary' : ''}`} onClick={onShowAnswer}>
              Show me the answer
            </button>
          )}
          {mistake && !mistakePreview && <p className="ws-result wrong">{mistakeIsBad(mistake) ? `${moveText(sfen, mistake.usi)} was ${mistake.verdict ? `a ${LABELS[mistake.verdict.label].text.toLowerCase()}` : 'a mistake'}. Try again.` : `${moveText(sfen, mistake.usi)} is not this lesson's move. Try again.`}</p>}
          {lessonMode === 'study' || showAnswer ? (
            <>
              <strong>Your move as {side}</strong>
              {good.map((g) => (
                <div key={g.usi} className="ws-answer">
                  <span className="ws-answer-move">{moveText(sfen, g.usi)}</span>
                  {level === 'new' && <span className="ws-gloss">{moveGloss(sfen, g.usi)}</span>}
                  {g.note && <p>{g.note}</p>}
                </div>
              ))}
              <p className="ws-muted">Play it on the board (green arrow).</p>
            </>
          ) : (
            <>
              <strong>Your move as {side}: find the book move</strong>
            </>
          )}
        </div>
      ) : (
        <div className="ws-card">
          <strong>Their move{reply ? `: ${moveText(sfen, reply.usi)}` : ''}</strong>
          {level === 'new' && reply && <span className="ws-gloss">{moveGloss(sfen, reply.usi)}</span>}
          {reply?.note && <p>{reply.note}</p>}
          {lessonMode === 'study' && reply ? (
            <button className="primary" onClick={onPlayReply}>
              Play their move <span className="ws-key">Space</span>
            </button>
          ) : (
            <p className="ws-muted">Coming in a moment.</p>
          )}
        </div>
      )}
      {lastMove && prevSfen && lastNote && !mistakePreview && (
        <div className="ws-last">
          <span className="ws-muted">Last move {moveText(prevSfen, lastMove)}</span>
          <p>{lastNote}</p>
        </div>
      )}
      {!lastMove && course.root.comment && <p className="ws-last">{course.root.comment}</p>}
      <button className="ws-explore" onClick={onExplore}>
        Try your own moves from here
        <span>Opens this position in 検討 Analyze. Move both sides freely; the AI rates every move.</span>
      </button>
      {course.source && (
        <details className="ws-source">
          <summary>Source</summary>
          <p>{course.source}</p>
        </details>
      )}
    </div>
  )
}

function GamesBox({ current, onSave, onCopy, onOpen, onDelete, onImport }: { current: string | null; onSave: () => boolean; onCopy: () => string; onOpen: (g: StoredGame) => void; onDelete: (g: StoredGame) => void; onImport: (text: string) => string | null }) {
  const [note, setNote] = useState<string | null>(null)
  const [view, setView] = useState<'none' | 'saved' | 'load'>('none')
  const games = loadGames()
  return (
    <div className="ws-games">
      <div className="ws-actions">
        <button className="primary" onClick={() => setNote(onSave() ? (current ? 'Saved (updated this slot).' : 'Saved to your games.') : 'Could not save: browser storage is full or blocked.')}>
          {current ? 'Save changes' : 'Save game'}
        </button>
        <button className={view === 'saved' ? 'on' : ''} onClick={() => setView(view === 'saved' ? 'none' : 'saved')}>
          Saved games <span className="ws-count">{games.length}</span>
        </button>
        <button className={view === 'load' ? 'on' : ''} onClick={() => setView(view === 'load' ? 'none' : 'load')}>
          Load a game
        </button>
        <button onClick={() => navigator.clipboard.writeText(onCopy()).then(() => setNote('KIF copied. Paste it into ShogiGUI, Kifu for Windows or 81Dojo.'), () => setNote('Could not copy to the clipboard.'))}>Copy KIF</button>
      </div>
      {note && <p className="ws-muted">{note}</p>}
      {view === 'saved' && (
        <ul className="ws-game-list">
          {games.length === 0 && <li className="ws-muted">No saved games yet. Press Save game to keep this one.</li>}
          {games.map((g) => (
            <li key={g.id} className={g.id === current ? 'on' : ''}>
              <button className="ws-game-open" onClick={() => onOpen(g)}>
                <strong>{g.title}</strong>
                <span>
                  {g.moves.length} moves{g.tree && g.tree.children.length > 1 ? ' · with variations' : ''}
                </span>
              </button>
              <button className="ws-var-x" onClick={() => onDelete(g)} aria-label={`Delete ${g.title}`} title="Delete">
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
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <details className="ws-import" open={open} onToggle={(e) => {
        const box = e.currentTarget
        if (box.open) setTimeout(() => box.querySelector('.ws-actions')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
      }}>
      <summary>
        <span className="ws-lib-ja">棋譜を読み込む</span>
        <span className="ws-lib-en">Import a game: KIF, KI2, CSA, USI or SFEN</span>
      </summary>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Paste a game record here" />
      <div className="ws-actions">
        <button className="primary" onClick={() => setError(onImport(text))} disabled={!text.trim()}>
          Load it
        </button>
        <label className="ws-file">
          Open a file
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
  return useCallback(
    (query: string): Command[] => {
      const q = query.trim().toLowerCase()
      const out: Command[] = []
      if (q) {
        const position = positionOf(sfen)
        const direct = position.createMoveByUSI(query.trim())
        const [parsed] = direct && position.isValidMove(direct) ? [[direct]] : parseMoves(position, query.trim())
        const move = parsed?.[0]
        if (move && position.isValidMove(move)) out.push({ id: `play-${move.usi}`, label: `Play ${moveText(sfen, move.usi)}`, run: () => play(move.usi) })
      }
      const base: Command[] = [
        ...MODES.map((m) => ({ id: `mode-${m.id}`, label: `${m.name} mode`, hint: m.hint, run: () => setMode(m.id) })),
        { id: 'flip', label: 'Flip the board', hint: 'F', run: () => setFlipped((v) => !v) },
        { id: 'tilt', label: 'Tilt the board', hint: 'T', run: () => setTilted((v) => !v) },
        { id: 'new', label: 'New game from the start', run: newGame },
        ...COURSES.map((c) => ({ id: `course-${c.id}`, label: c.title, hint: SETUPS.find((s) => s.courseIds.includes(c.id))?.ja, run: () => openCourse(c) })),
      ]
      const terms = [q, ...Object.entries(ALIASES).filter(([en]) => q.length >= 3 && en.startsWith(q)).map(([, ja]) => ja)]
      return [...out, ...base.filter((c) => !q || terms.some((t) => `${c.label} ${c.hint ?? ''}`.toLowerCase().includes(t)))].slice(0, 12)
    },
    [sfen, setMode, setFlipped, setTilted, openCourse, play, newGame],
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
      <div className="ws-palette" onPointerDown={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <input
          ref={input}
          value={query}
          placeholder="Search lines, type a move like 76歩 or 7g7f, or a command"
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
          {items.length === 0 && <li className="ws-muted ws-empty">No match. Try a line name like 鷺宮 or mino, or a move like 76歩.</li>}
        </ul>
      </div>
    </div>
  )
}

function EvalGraph({ values, cursor, onJump, onScan, scanning, className = '' }: { values: (number | undefined)[]; cursor: number; onJump: (i: number) => void; onScan: () => void; scanning: boolean; className?: string }) {
  const W = 360
  const H = 88
  const n = Math.max(values.length - 1, 1)
  const x = (i: number) => (i / n) * W
  const y = (cp: number) => H / 2 - (Math.max(-2000, Math.min(2000, cp)) / 2000) * (H / 2 - 4)
  const known = values.map((v, i) => (v === undefined ? null : [x(i), y(v)])).filter((p): p is number[] => p !== null)
  const line = known.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
  const area = known.length ? `${line}L${known.at(-1)![0].toFixed(1)},${H / 2}L${known[0][0].toFixed(1)},${H / 2}Z` : ''
  const missing = values.some((v) => v === undefined)
  return (
    <div className={`ws-graph ${className}`}>
      <div className="ws-graph-axis">
        <span>先手有利</span>
        <span>後手有利</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Evaluation by move"
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
      {missing && values.length > 1 && (
        <button className="ws-graph-scan" onClick={onScan} disabled={scanning}>
          {scanning ? 'Scoring every move…' : 'Score every move'}
        </button>
      )}
    </div>
  )
}

function Plate({ position, color, who, className }: { position: ReturnType<typeof positionOf>; color: Color; who: 'You' | 'Opponent' | null; className: string }) {
  const { strategy, castle } = formationOf(position, color)
  return (
    <div className={`ws-plate ${className}`}>
      <span className="ws-plate-side">{color === Color.BLACK ? '☗ Sente' : '☖ Gote'}</span>
      {who && <span className="ws-muted">{who}</span>}
      {strategy && <span className="ws-pill" title="Strategy, from where the rook is">{strategy}</span>}
      {castle && <span className="ws-pill" title="Castle, from where the king, golds and silvers stand">{castle}</span>}
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
  if (!lanes.length)
    return (
      <div className="ws-off">
        <p>No book line from this position, and the AI is still thinking.</p>
      </div>
    )
  return (
    <div className="ws-flow">
      <p className="ws-muted">What can happen from the position on the board. Click a line to watch it play out.</p>
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
              <span className="ws-lane-tag">{lane.tag === 'book' ? '定跡 book' : lane.tag === 'mistake' ? '悪手 known mistake' : 'AI line'}</span>
              {lane.loss !== undefined && <span className={`ws-loss${lane.loss >= 10 ? ' bad' : lane.loss >= 4 ? ' meh' : ''}`}>{lane.best ? 'best' : lane.loss === 0 ? '≈ best' : `−${lane.loss}%`}</span>}
            </span>
            <span className="ws-lane-steps">
              {steps.map((t, i) => (
                <span key={i} className={i === 0 ? 'first' : ''}>
                  {i > 0 && <i aria-hidden="true">→</i>}
                  {t}
                </span>
              ))}
              {lane.forks && <span className="ws-muted"> then {lane.forks} choices</span>}
            </span>
            {lane.note && <span className="ws-lane-note">{lane.note}</span>}
          </button>
        )
      })}
    </div>
  )
}

function SettingsDialog({ onClose, level, onLevel, onViewer }: { onClose: () => void; level: Level; onLevel: (l: Level) => void; onViewer: () => void }) {
  const st = useSettings()
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
  return (
    <div className="ws-palette-back" onPointerDown={onClose}>
      <div className="ws-dialog ws-settings" role="dialog" aria-label="Settings" onPointerDown={(e) => e.stopPropagation()}>
        <h2>設定 Settings</h2>
        <h3>You</h3>
        {seg<Level>('Shogi knowledge', level, [{ v: 'rules', t: 'I know the rules' }, { v: 'new', t: 'New to shogi' }], onLevel)}
        <h3>Sound</h3>
        {seg('Sound effects', st.sound, [{ v: true, t: 'On' }, { v: false, t: 'Off' }], (v) => setSettings({ sound: v }))}
        <label className="ws-setting">
          <span>Volume</span>
          <input type="range" min={0} max={1} step={0.05} disabled={!st.sound} value={st.volume} onChange={(e) => setSettings({ volume: Number(e.target.value) })} onMouseUp={() => playSound('move')} />
        </label>
        <h3>Board and pieces</h3>
        {seg<PieceSet>('Piece set', st.pieceSet, (Object.keys(PIECE_SETS) as PieceSet[]).map((v) => ({ v, t: PIECE_SETS[v].label })), (v) => setSettings({ pieceSet: v }))}
        <div className="ws-piece-sample" aria-label="Preview">
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
        <button className="ws-viewer-open" onClick={onViewer}>
          Inspect a piece in 3D ›
        </button>
        {PIECE_SETS[st.pieceSet].credit && <p className="ws-muted ws-credit">{PIECE_SETS[st.pieceSet].credit}</p>}
        {st.pieceSet === 'letters' && seg<PieceFont>('Piece lettering', st.pieceFont, (Object.keys(PIECE_FONTS) as PieceFont[]).map((v) => ({ v, t: PIECE_FONTS[v].label })), (v) => setSettings({ pieceFont: v }))}
        {st.pieceSet === 'letters' && seg<PieceStyle>('Piece faces', st.pieceStyle, [{ v: 'two', t: '二字 王将' }, { v: 'one', t: '一字 王' }], (v) => setSettings({ pieceStyle: v }))}
        {seg<BoardStyle>('Board wood', st.boardStyle, [{ v: 'kaya', t: '榧 Kaya' }, { v: 'shin-kaya', t: '新榧 Light' }, { v: 'dark', t: '濃色 Dark' }], (v) => setSettings({ boardStyle: v }))}
        <h3>AI</h3>
        {seg('Thinking time', st.thinkMs, [{ v: 500, t: 'Fast' }, { v: 1500, t: 'Normal' }, { v: 4000, t: 'Deep' }], (v) => setSettings({ thinkMs: v }))}
        {seg('Candidate moves shown', st.candidates, [{ v: 1, t: '1' }, { v: 2, t: '2' }, { v: 3, t: '3' }, { v: 5, t: '5' }], (v) => setSettings({ candidates: v }))}
        {seg<AiStrength>('対局 opponent strength', st.opponent, (Object.keys(STRENGTH) as AiStrength[]).map((k) => ({ v: k, t: STRENGTH[k].label })), (v) => setSettings({ opponent: v }))}
        <div className="ws-actions">
          <button className="primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function AiControls() {
  const st = useSettings()
  return (
    <div className="ws-inline-settings">
      <div className="ws-seg small" role="group" aria-label="Thinking time">
        {[
          { v: 500, t: 'Fast' },
          { v: 1500, t: 'Normal' },
          { v: 4000, t: 'Deep' },
        ].map((o) => (
          <button key={o.v} className={st.thinkMs === o.v ? 'on' : ''} onClick={() => setSettings({ thinkMs: o.v })}>
            {o.t}
          </button>
        ))}
      </div>
      <div className="ws-seg small" role="group" aria-label="Candidate moves">
        {[1, 2, 3, 5].map((n) => (
          <button key={n} className={st.candidates === n ? 'on' : ''} onClick={() => setSettings({ candidates: n })}>
            {n} {n === 1 ? 'line' : 'lines'}
          </button>
        ))}
      </div>
    </div>
  )
}

