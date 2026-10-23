import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { Position, Square, Color, InitialPositionSFEN, handPieceTypes, unpromotedPieceType, formatMove } from 'tsshogi'

const require = createRequire(import.meta.url)
const YaneuraOu = require('@mizarjp/yaneuraou.k-p')
const dir = new URL('./', import.meta.url)
mkdirSync(dir, { recursive: true })
const write = (name, value) => writeFileSync(new URL(name, dir), JSON.stringify(value, null, 2) + '\n')
const seed = 20261024
let randomState = seed
const random = () => (randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0) / 4294967296
const squares = Array.from({ length: 81 }, (_, i) => new Square((i % 9) + 1, Math.floor(i / 9) + 1))
const pos = (sfen) => {
  const p = Position.newBySFEN(sfen)
  if (!p) throw new Error(`Invalid SFEN ${sfen}`)
  return p
}
const legal = (p) => {
  const sources = [...p.board.listNonEmptySquares().filter((s) => p.board.at(s).color === p.color), ...handPieceTypes.filter((t) => p.hand(p.color).count(t))]
  const out = new Map()
  for (const from of sources)
    for (const to of squares) {
      const m = p.createMove(from, to)
      if (!m) continue
      for (const v of [m, m.withPromote()]) if (p.isValidMove(v)) out.set(v.usi, v)
    }
  return [...out.values()].sort((a, b) => a.usi.localeCompare(b.usi))
}
let checkedPvPlies = 0
const replay = (sfen, moves) => {
  const p = pos(sfen)
  for (const usi of moves) {
    const m = p.createMoveByUSI(usi)
    if (!m || !p.isValidMove(m) || !p.doMove(m)) throw new Error(`Illegal replay ${usi} at ${p.sfen}`)
    checkedPvPlies++
  }
  return p
}
const engine = await YaneuraOu()
let listener
engine.addMessageListener((line) => listener?.(line))
const send = (command, end, onLine) =>
  new Promise((resolve) => {
    listener = (line) => {
      onLine?.(line)
      if (line.startsWith(end)) resolve()
    }
    engine.postMessage(command)
  })
const usiOptions = []
await send('usi', 'usiok', (line) => {
  if (line.startsWith('option ') || line.startsWith('id ')) usiOptions.push(line)
})
write('engine-options.json', usiOptions)
engine.postMessage('setoption name Threads value 1')
engine.postMessage('setoption name USI_Hash value 32')
engine.postMessage('setoption name USI_OwnBook value false')
await send('isready', 'readyok')
let searches = 0
const normalizeAnalysis = (analysis) => {
  analysis.candidateSnapshotSemantics =
    'Latest reported result per MultiPV rank; depths may differ at interrupted iteration; ranks are not guaranteed aligned with final bestmove.'
  analysis.finalBestmoveCandidate = analysis.candidates.find((c) => c.pv[0] === analysis.bestmove) ?? null
  return analysis
}
const analyze = async (sfen, ms, multipv) => {
  const candidates = new Map()
  let bestmove
  engine.postMessage(`setoption name MultiPV value ${multipv}`)
  engine.postMessage(`position sfen ${sfen}`)
  await send(`go movetime ${ms}`, 'bestmove', (line) => {
    if (line.startsWith('bestmove')) bestmove = line.split(' ')[1]
    const pv = /\spv (.+)/.exec(line)
    const score = /\sscore (cp|mate) (-?\d+)/.exec(line)
    if (!pv || !score) return
    const rank = Number(/\smultipv (\d+)/.exec(line)?.[1] ?? 1)
    const tokens = pv[1].trim().split(/\s+/)
    const end = tokens.findIndex((token) => !/^(?:[1-9][a-i][1-9][a-i]\+?|[PLNSGBR]\*[1-9][a-i])$/.test(token))
    const moves = end < 0 ? tokens : tokens.slice(0, end)
    candidates.set(rank, {
      rank,
      depth: Number(/\sdepth (\d+)/.exec(line)?.[1] ?? 0),
      score: {
        kind: score[1],
        value: Number(score[2]),
        perspective: 'side-to-move',
        bound: /\s(lowerbound|upperbound)/.exec(line)?.[1] ?? 'exact-search-score',
      },
      pv: moves,
      engineTerminalTokens: end < 0 ? [] : tokens.slice(end),
    })
  })
  searches++
  const out = [...candidates.values()].sort((a, b) => a.rank - b.rank)
  for (const c of out) replay(sfen, c.pv)
  return normalizeAnalysis({ movetimeMs: ms, requestedMultiPV: multipv, bestmove, candidates: out, pvLegallyReplayed: true })
}
const state = (p) => {
  const sides = {}
  for (const color of [Color.BLACK, Color.WHITE]) {
    const board = {},
      hands = {},
      total = {}
    for (const s of p.board.listNonEmptySquares()) {
      const piece = p.board.at(s)
      if (piece.color !== color) continue
      board[piece.type] = (board[piece.type] ?? 0) + 1
      const base = unpromotedPieceType(piece.type)
      total[base] = (total[base] ?? 0) + 1
    }
    for (const type of handPieceTypes) {
      hands[type] = p.hand(color).count(type)
      total[type] = (total[type] ?? 0) + hands[type]
    }
    sides[color] = { board, hands, totalUnpromotedInventory: total }
  }
  return { sideToMove: p.color, checked: p.checked, sides }
}
const directCaptures = (p) =>
  legal(p)
    .filter((m) => m.capturedPieceType)
    .map((m) => ({ usi: m.usi, notationJa: formatMove(p, m), captured: m.capturedPieceType }))
const control = (p, from) => squares.filter((to) => p.listAttackers(to).some((s) => s.usi === from)).map((s) => s.usi)
const undefended = (p) =>
  p.board.listNonEmptySquares().flatMap((s) => {
    const piece = p.board.at(s)
    const attackers = p
      .listAttackers(s)
      .filter((a) => p.board.at(a).color !== piece.color)
      .map((a) => a.usi)
    const defenders = p
      .listAttackers(s)
      .filter((a) => p.board.at(a).color === piece.color)
      .map((a) => a.usi)
    return attackers.length && !defenders.length
      ? [{ square: s.usi, piece: piece.type, color: piece.color, geometricAttackers: attackers, geometricDefenders: defenders }]
      : []
  })
const configurations = Array.from({ length: 4 }, (_, i) => ({
  id: `random-${i + 1}`,
  policy:
    'First 12 plies select seeded random legal MultiPV candidates; remaining moves use real YaneuraOu SkillLevel final bestmove. SkillLevel is an uncalibrated engine setting, not Elo.',
}))
const games = existsSync(new URL('games.json', dir)) ? JSON.parse(readFileSync(new URL('games.json', dir), 'utf8')) : []
for (const config of configurations) {
  if (games.some((g) => g.id === config.id)) continue
  randomState = seed + configurations.indexOf(config)
  const buckets = [
    [0, 4],
    [5, 9],
    [10, 14],
    [15, 20],
  ]
  const index = configurations.indexOf(config)
  const pickLevel = ([low, high]) => low + Math.floor(random() * (high - low + 1))
  const strength = {
    black: pickLevel(buckets[index]),
    white: pickLevel(buckets[3 - index]),
    stratifiedBuckets: { black: buckets[index], white: buckets[3 - index] },
  }
  engine.postMessage('usinewgame')
  const p = pos(InitialPositionSFEN.STANDARD)
  const seen = new Map()
  const moves = []
  let termination = '160-ply-horizon; no outcome adjudicated'
  for (let i = 0; i < 160; i++) {
    const key = p.sfen.split(' ').slice(0, 3).join(' ')
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    if (count >= 4) {
      termination = 'fourfold-position-repeat; perpetual-check responsibility not adjudicated'
      break
    }
    const available = legal(p)
    if (!available.length) {
      termination = p.checked ? 'checkmate; all legal replies enumerated absent' : 'no-legal-move'
      break
    }
    const before = p.sfen
    engine.postMessage(`setoption name SkillLevel value ${strength[p.color]}`)
    const analysis = await analyze(before, 150, 3)
    analysis.skillLevel = strength[p.color]
    let usi = analysis.bestmove
    let selection = { kind: 'engine-final-bestmove-with-SkillLevel', skillLevel: strength[p.color] }
    if (i < 12 && analysis.candidates.length) {
      const candidates = analysis.candidates.filter((c) => c.pv.length && available.some((m) => m.usi === c.pv[0]))
      if (candidates.length) {
        const candidate = candidates[Math.floor(random() * candidates.length)]
        usi = candidate.pv[0]
        selection = {
          kind: 'seeded-random-legal-opening-candidate',
          candidateRank: candidate.rank,
          availableCandidates: candidates.map((c) => c.pv[0]),
          skillLevel: strength[p.color],
        }
      }
    }
    if (usi === 'resign') {
      termination = `engine-resignation:${p.color}; not a checkmate proof`
      break
    }
    const m = p.createMoveByUSI(usi)
    if (!m || !p.isValidMove(m)) throw new Error(`Invalid selection ${usi}`)
    const entry = {
      ply: i + 1,
      sfenBefore: before,
      usi,
      notationJa: formatMove(p, m),
      mover: p.color,
      captured: m.capturedPieceType,
      promotion: m.promote,
      drop: typeof m.from === 'string',
      piece: m.pieceType,
      selection,
    }
    if (!p.doMove(m)) throw new Error('Move rejected')
    moves.push({ ...entry, sfenAfter: p.sfen, givesCheck: p.checked, generationAnalysis: analysis })
  }
  replay(
    InitialPositionSFEN.STANDARD,
    moves.map((m) => m.usi),
  )
  games.push({
    id: config.id,
    provenance: 'synthetic seeded engine self-play; not a human game or published record',
    seed,
    strength,
    openingRandomizedPlies: 12,
    policy: config.policy,
    start: InitialPositionSFEN.STANDARD,
    termination,
    finalSfen: p.sfen,
    plies: moves.length,
    moves,
  })
  write('games.json', games)
  console.log(`Generated ${config.id}: ${moves.length} plies; ${termination}`)
}
const facts = existsSync(new URL('facts.json', dir)) ? JSON.parse(readFileSync(new URL('facts.json', dir), 'utf8')) : []
const moverScore = (analysis, mover, negate) => {
  const score = analysis.finalBestmoveCandidate?.score
  return score ? { ...score, value: score.value * (negate ? -1 : 1), perspective: `actual-mover:${mover}` } : null
}
for (const game of games) {
  game.randomChoiceSeed = seed + configurations.findIndex((c) => c.id === game.id)
  for (const m of game.moves) normalizeAnalysis(m.generationAnalysis)
}
write('games.json', games)
for (const fact of facts) {
  normalizeAnalysis(fact.review.before)
  normalizeAnalysis(fact.review.after)
  fact.review.before.skillLevel = 20
  fact.review.after.skillLevel = 20
  delete fact.review.beforeTopScoreFromActualMover
  delete fact.review.afterTopScoreFromActualMover
  fact.review.beforeFinalBestScoreFromActualMover = moverScore(fact.review.before, fact.mover, false)
  fact.review.afterFinalBestScoreFromActualMover = moverScore(fact.review.after, fact.mover, true)
}
write('facts.json', facts)
for (const fact of facts)
  for (const key of ['before', 'after'])
    for (const candidate of fact.review[key].candidates) replay(key === 'before' ? fact.sfenBefore : fact.sfenAfter, candidate.pv)
for (const game of games) {
  replay(
    game.start,
    game.moves.map((m) => m.usi),
  )
  for (const m of game.moves) for (const c of m.generationAnalysis.candidates) replay(m.sfenBefore, c.pv)
}
engine.postMessage('setoption name SkillLevel value 20')
for (const game of games) {
  const n = game.moves.length
  const chosen = new Set([Math.min(11, n - 1), Math.floor(n * 0.4), Math.floor(n * 0.7)])
  const event = game.moves.findIndex((m, i) => i > 15 && (m.promotion || m.givesCheck || m.drop))
  chosen.add(event >= 0 ? event : n - 2)
  const capture = game.moves.findIndex((m, i) => i > 15 && m.captured && !chosen.has(i))
  chosen.add(capture >= 0 ? capture : n - 1)
  for (let j = n - 1; chosen.size < 5 && j >= 0; j--) chosen.add(j)
  if (game.termination.startsWith('checkmate')) {
    chosen.add(n - 1)
    for (let j = n - 2; chosen.size < 6 && j >= 0; j--) chosen.add(j)
  }
  for (const i of [...chosen].sort((a, b) => a - b)) {
    const m = game.moves[i]
    if (facts.some((f) => f.id === `${game.id}-${m.ply}`)) continue
    const before = pos(m.sfenBefore),
      after = pos(m.sfenAfter)
    const move = before.createMoveByUSI(m.usi)
    const beforeReview = await analyze(before.sfen, 300, 3)
    const afterReview = await analyze(after.sfen, 300, 3)
    beforeReview.skillLevel = 20
    afterReview.skillLevel = 20
    const slider = ['rook', 'bishop', 'lance', 'horse', 'dragon'].includes(m.piece)
    facts.push({
      id: `${game.id}-${m.ply}`,
      gameId: game.id,
      ply: m.ply,
      phaseByPly: m.ply <= 25 ? 'opening' : m.ply <= 65 ? 'middle' : 'late-trajectory-not-proven-endgame',
      ...m,
      generationAnalysis: undefined,
      before: state(before),
      after: state(after),
      terminal:
        i === n - 1 ? { isGameEndpoint: true, checked: after.checked, legalReplyCount: legal(after).length, recordedTermination: game.termination } : null,
      legalCapturesBeforeForSideToMove: directCaptures(before),
      legalCapturesAfterForSideToMove: directCaptures(after),
      geometricallyAttackedUndefendedBefore: undefended(before),
      geometricallyAttackedUndefendedAfter: undefended(after),
      movedSliderControl: slider
        ? {
            beforeFrom: typeof move.from === 'string' ? null : move.from.usi,
            beforeSquares: typeof move.from === 'string' ? [] : control(before, move.from.usi),
            afterFrom: move.to.usi,
            afterSquares: control(after, move.to.usi),
            semantics: 'geometric attacks, not forced wins; blockers respected by tsshogi listAttackers',
          }
        : null,
      review: {
        before: beforeReview,
        after: afterReview,
        beforeFinalBestScoreFromActualMover: moverScore(beforeReview, m.mover, false),
        afterFinalBestScoreFromActualMover: moverScore(afterReview, m.mover, true),
      },
      limits: [
        'Short engine searches and PV are evidence of candidate lines only, not proof of forced outcomes.',
        'Geometric attacks may involve pinned pieces; absence of geometric defenders does not prove a safe capture.',
        'Phase labels reflect trajectory ply only.',
      ],
    })
    write('facts.json', facts)
  }
  console.log(`Reviewed ${game.id}: ${facts.filter((f) => f.gameId === game.id).length} positions`)
}
write('generation-summary.json', {
  provenance: 'Synthetic self-play generated locally; no external games or lesson positions used',
  seed,
  rng: 'LCG1664525/1013904223 uint32',
  reproducibility:
    'Seeded choices and exact recorded moves reproduce the stored games. Wall-time engine searches and internal SkillLevel randomization can vary across hardware/reruns; seeds control application candidate and level choices only.',
  engine: '@mizarjp/yaneuraou.k-p',
  runtimeEngineId: usiOptions.find((line) => line.startsWith('id name ')),
  skillLevelOption: usiOptions.find((line) => line.startsWith('option name SkillLevel ')),
  threads: 1,
  hashMiB: 32,
  ownBook: false,
  generationMs: 150,
  generationSkillLevel: 'Random supported SkillLevel per side; recorded in games.strength and generationAnalysis.skillLevel',
  reviewSkillLevel: 20,
  openingRandomization: 'Seeded random legal MultiPV candidate first 12 plies',
  reviewMs: 300,
  multipv: 3,
  games: games.map(({ id, plies, termination, strength }) => ({ id, plies, termination, strength })),
  selectedPositions: facts.length,
  searchesExecutedThisInvocation: searches,
  recordedGenerationAnalyses: games.reduce((sum, g) => sum + g.plies, 0),
  recordedReviewAnalyses: facts.length * 2,
  checkedReplayPlies: checkedPvPlies,
  legality:
    'All played moves and every recorded candidate PV replayed with tsshogi isValidMove + doMove; terminal no-move conditions enumerate all legal moves.',
  sha256: Object.fromEntries(
    games.map((g) => [
      g.id,
      createHash('sha256')
        .update(g.moves.map((m) => m.usi).join(' '))
        .digest('hex'),
    ]),
  ),
  limits: [
    'No claim of real human play, calibrated player strength, long-search optimality, forced mate from short PV, or complete game outcomes at horizon.',
    'Fourfold repeat stops do not adjudicate perpetual-check fouls.',
    'No audio, browser, feature code, network or model inference used.',
  ],
})
console.log(`Complete: ${games.length} games, ${facts.length} facts, ${searches} bounded searches; all recorded PVs legal`)
process.exit(0)
