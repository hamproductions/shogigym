import { otherSide, positionOf, colorSide, type Side } from './shogi'

export type MoveKind = 'main' | 'alt' | 'deviation'

export type MoveDemo = { title: string; usi: string[]; text: string }

export type JosekiMove = {
  usi: string
  kind: MoveKind
  note?: string
  aim?: string
  openEnded?: boolean
  demos?: MoveDemo[]
  punishNote?: string
  child: JosekiNode | null
}

export type JosekiNode = {
  id: string
  sfen: string
  comment?: string
  branches: JosekiMove[]
}

export type RawCourse = {
  id: string
  title: string
  myStrategy: string
  opponentStrategy: string
  mySide: Side
  userSide?: Side
  source?: string
  goalFormation: string
  goalLabel?: string
  root: JosekiNode
}

export type Course = RawCourse & {
  userSide: Side
  notesFromOpponentView: boolean
  noEngine?: boolean
  setupId: string
}

export type Setup = {
  id: string
  name: string
  ja: string
  intro: string
  shikenPlan?: string
  sources: string[]
  courseIds: string[]
  technique?: boolean
}

export const SETUPS: Setup[] = [
  {
    id: 'basics',
    name: 'Basic setup & Mino castle',
    ja: '基本の組み方・美濃囲い',
    intro:
      'Shiken-bisha puts the rook on the 6th file as sente (6八飛) or the 4th file as gote (4二飛), closes the bishop line, and castles the king into Mino (片美濃 → 本美濃 → 高美濃 → 銀冠). Every other line here starts from this build.',
    shikenPlan: 'Learn the build order until it is automatic: rook swing, king walk to 2八/8二, silver beside the king, gold up.',
    sources: ['https://ja.wikipedia.org/wiki/四間飛車', 'https://shogi-joutatsu.com/archives/2472', 'https://www.shogilounge.com/'],
    courseIds: ['shikenbisha-vs-ibisha--sente', 'shikenbisha-vs-ibisha--basic'],
  },
  {
    id: 'bougin',
    name: 'Climbing Silver',
    ja: '棒銀',
    intro:
      'Static Rook marches the right silver straight up (3七→2六→3五 here) to break the 2–3 files with rook, silver and pawn. Fast and dangerous, but the aim is simple to defend, and after the exchanges the silver is often left stranded.',
    shikenPlan: 'Meet ▲3五歩 calmly; Kubo-style △6五歩 counter-attacks with the bishop instead of passively defending.',
    sources: ['https://ja.wikipedia.org/wiki/棒銀', 'https://www.shogilounge.com/'],
    courseIds: ['shikenbisha-vs-bougin--kuboryu', 'ibisha-vs-shikenbisha--bougin', 'ibisha-vs-shikenbisha--gote', 'shogirule--39', 'shogirule--40', 'shogirule--48'],
  },
  {
    id: 'hayashikake',
    name: 'Early ▲4五歩 rapid attack',
    ja: '4五歩早仕掛け',
    intro:
      'A boat-castle (舟囲い) rapid attack that pushes the 4-file pawn into your rook early, combining ▲4五歩, ▲3七桂 and the 2-file pawn sacrifice. Used mainly against 四間飛車 and 三間飛車.',
    shikenPlan: 'In the collected line you take ▲2四歩 with △同歩 and Static Rook ends clearly better (source and engine agree, about +458). The engine prefers △同角 there, so study this line as a failure pattern.',
    sources: ['https://ja.wikipedia.org/wiki/4五歩早仕掛け', 'https://www.shogilounge.com/'],
    courseIds: ['ibisha-vs-shikenbisha--45hayashikake', 'shogirule--47', 'shogirule--47-2'],
  },
  {
    id: 'naname',
    name: 'Diagonal Climbing Silver (Left Silver-46)',
    ja: '斜め棒銀・4六銀左急戦',
    intro: 'Static Rook brings the left silver via 5七 to 4六, aiming the 3-file pawn break at your bishop head.',
    shikenPlan: 'The source line ends with Shiken-bisha doing fine (engine agrees, about −121 for Static Rook).',
    sources: ['https://www.shogilounge.com/'],
    courseIds: ['ibisha-vs-shikenbisha--sente'],
  },
  {
    id: 'yamada',
    name: 'Yamada Joseki',
    ja: '山田定跡',
    intro:
      'Devised by Yamada Michiyoshi. From the Left Silver-57 rapid-attack setup it hits a Shiken-bisha that waits with △3二銀 (not △4三銀), aiming to break through the 2-file. Typical waiting moves are △5四歩, △6四歩 and △1二香.',
    shikenPlan: 'Know which waiting move you chose, because the attack differs for each.',
    sources: ['https://ja.wikipedia.org/wiki/山田定跡', 'https://www.shogilounge.com/'],
    courseIds: ['ibisha-vs-shikenbisha--yamada'],
  },
  {
    id: 'kyusen',
    name: 'Static Rook rapid attack (Funa castle)',
    ja: '舟囲い急戦',
    intro: 'Static Rook keeps the king in the light Funa castle and attacks early, before your Mino is complete. Lines here come from shogi-rule.com game records.',
    shikenPlan: 'Defend with the rook and bishop working together; once their attack stalls, your harder castle decides the game.',
    sources: ['https://www.shogi-rule.com/joseki-37/', 'https://www.shogi-rule.com/joseki-37-2/'],
    courseIds: ['shogirule--37', 'shogirule--37-2'],
  },
  {
    id: 'tateishi',
    name: 'Tateishi style',
    ja: '立石流',
    intro: 'A Shiken-bisha that swings the rook again to the third file and builds a Ishida-like attacking formation. Line from a shogi-rule.com game record.',
    sources: ['https://www.shogi-rule.com/joseki-46/'],
    courseIds: ['shogirule--46'],
  },
  {
    id: 'saginomiya',
    name: 'Saginomiya Joseki',
    ja: '鷺宮定跡',
    intro:
      'A rapid attack created by Aono Teruichi in the late 1970s–80s and spread by Yonenaga Kunio in title matches. It targets the bishop head with ▲3八飛 and ▲3五歩.',
    shikenPlan: '△1二香 is the key defensive resource.',
    sources: ['https://ja.wikipedia.org/wiki/鷺宮定跡', 'https://www.fgfan7.com/entry/2017/04/27/070638', 'https://www.shogilounge.com/'],
    courseIds: ['ibisha-vs-shikenbisha--saginomiya'],
  },
  {
    id: 'anaguma',
    name: 'Static Rook Anaguma',
    ja: '居飛車穴熊',
    intro:
      'Static Rook buries the king in the corner (9九) behind lance, silver and gold. Once built it is harder to crack than your Mino, so Static Rook can attack freely and accept losing material.',
    shikenPlan:
      'Do not let it finish quietly. Either attack before it is complete (速攻, 藤井システム) or build a strong position and fight on the king side.',
    sources: ['https://ja.wikipedia.org/wiki/居飛車穴熊', 'https://hibitonshi.com/2018-08-05-200000/', 'https://en.wikipedia.org/wiki/Fujii_System'],
    courseIds: ['shikenbisha-vs-anaguma--basic', 'shikenbisha-vs-anaguma--sokkou', 'shikenbisha-vs-anaguma--fujii', 'ibisha-vs-shikenbisha--anaguma', 'shogirule--33', 'shogirule--33-2', 'shogirule--35', 'shogirule--35-2', 'shogirule--35-3'],
  },
  {
    id: 'migishiken',
    name: 'Right Fourth File Rook',
    ja: '右四間飛車',
    intro:
      'A Static Rook strategy that moves its rook to its own 4th file, usually with a reclining silver, and smashes the 4-file with ▲4五歩. It still counts as Static Rook, not Ranging Rook.',
    shikenPlan: 'Waiting with △4一金 keeps the 4-file defended without committing.',
    sources: ['https://ja.wikipedia.org/wiki/右四間飛車', 'https://www.shogilounge.com/'],
    courseIds: ['shikenbisha-vs-migishiken--41kin', 'shogirule--42'],
  },
  {
    id: 'ponponkei',
    name: 'Pon-pon Knight',
    ja: 'ポンポン桂',
    intro: 'Static Rook jumps the right knight early (3七→4五/2五) to attack before you have finished castling.',
    sources: ['https://www.shogilounge.com/'],
    courseIds: ['shikenbisha-vs-ponponkei--basic'],
  },
  {
    id: 'torisashi',
    name: 'Bird Catcher (Ureshino)',
    ja: '鳥刺し・嬉野流',
    intro: 'An unorthodox Static Rook system that swings the left silver up the edge side.',
    shikenPlan: 'Defend with the △4三銀 setup and avoid the engine-rejected △4五歩 push.',
    sources: ['https://www.shogilounge.com/'],
    courseIds: ['shikenbisha-vs-torisashi--basic'],
  },
  {
    id: 'kakukoukan',
    name: 'Bishop-exchange Shiken-bisha',
    ja: '角交換四間飛車',
    intro:
      'You leave the bishop line open, swing the rook to the 6th file and then trade bishops yourself. This avoids the bishop-head weakness and leads to slower games. The rook often re-swings to the 8th file to counter the opponent\'s rook pawn.',
    shikenPlan: 'Ignore the early 8-file push and keep castling. Meet △8六歩 with the ▲7七角 fork.',
    sources: ['https://hibitonshi.com/kakukoukan-shiken/', 'https://en.wikipedia.org/wiki/Bishop_Exchange_Fourth_File_Rook'],
    courseIds: ['shikenbisha-vs-ibisha--kakukoukan'],
  },
  {
    id: 'hidarimino',
    name: 'Left Mino / Castle Tower Mino',
    ja: '左美濃・天守閣美濃',
    intro:
      'A Static Rook version of the Mino castle, with the king on the 8th file. It handles both slow and rapid games, and Castle Tower Mino (玉8七) was hard for Ranging Rook to crack from the side.',
    shikenPlan:
      'Fujii System answer: stop the ideal formation and fight at the king head (▲4五歩, ▲2五歩 △同歩 ▲同桂) instead of attacking from the side. The line here is Left Mino’s standard ▲2四歩 strike against a Fujii-type Shiken-bisha, from a 1996 pro game.',
    sources: ['https://ja.wikipedia.org/wiki/左美濃', 'https://en.wikipedia.org/wiki/Fujii_System'],
    courseIds: ['shikenbisha-vs-hidarimino--24fu', 'shogirule--41', 'shogirule--41-2'],
  },
  {
    id: 'sabaki',
    technique: true,
    name: 'Sabaki',
    ja: '捌き',
    intro:
      '捌き means getting your pieces working, often by trading them so they come into your hand. These drills are the 捌き moments from the opening lessons, plus one where the right idea is not to trade lightly.',
    shikenPlan: 'Open the bishop line with △4五歩, trade, and turn a defending silver into an attacking one. Against some setups, defend solidly first instead.',
    sources: ['https://ja.wikipedia.org/wiki/振り飛車'],
    courseIds: ['sabaki--kuboryu', 'sabaki--torisashi'],
  },
  {
    id: 'tesuji',
    technique: true,
    name: 'Tesuji',
    ja: '手筋',
    intro:
      'Classic pawn tesuji from the diagrams on shogi-rule.com: the dangling pawn, the striking pawn, the single drop and the focal pawn. For hundreds more, open 手筋 in the left rail: positions taken from the lessons and tsume where a tesuji is the move.',
    shikenPlan: 'Pawns are the cheapest piece, so most tesuji are pawn sacrifices that pull a defender out of place.',
    sources: ['https://www.shogi-rule.com/koma_hu/'],
    courseIds: ['tesuji--tare-fu', 'tesuji--tanda-fu', 'tesuji--tataki-fu', 'tesuji--shoten-fu'],
  },
  {
    id: 'kuzushi',
    technique: true,
    name: 'Castle breaking',
    ja: '囲い崩し',
    intro:
      'How castles fall: the key squares and the standard strikes against Mino, Funa and Kimura Mino. You play the attacking side, so you learn the attack and, as a Shiken-bisha player, the danger to your own Mino.',
    shikenPlan: 'Mino: the gold on 4九 (6一) and the 3六 (7四) square are the weak points. Funa: the 8七 square and the edge.',
    sources: ['https://ja.wikipedia.org/wiki/美濃囲い', 'https://ja.wikipedia.org/wiki/舟囲い'],
    courseIds: ['kuzushi--mino-36kei', 'kuzushi--kimura-mino', 'kuzushi--funa-hashi'],
  },
  {
    id: 'millennium',
    name: 'Millennium / Elmo',
    ja: 'ミレニアム・エルモ囲い',
    intro:
      'Millennium appeared around 2000 as a counter to the Fujii System: the king tucked into the corner at 8九 (2一 when gote) stays off the bishop diagonal. It is less solid than Anaguma and takes many moves to build.',
    shikenPlan:
      'Finish your Diamond Mino first, then move before it plays ▲6八銀: △6五歩 ▲5七角 △5五歩 is the standard strike. Its weak spots are tokin attacks, the bishop head on 5七 and the 7th file.',
    sources: ['https://shogijam.com/game-commentary/四間飛車対ミレニアムの激しい定跡/', 'https://hibitonshi.com/2018-07-25-200000/', 'https://ja.wikipedia.org/wiki/ミレニアム囲い'],
    courseIds: ['shikenbisha-vs-millennium--65fu'],
  },
  {
    id: 'aifuri',
    name: 'Double Ranging Rook',
    ja: '相振り飛車',
    intro:
      'Both players range their rook. Castles shift from 金無双 to Yagura, Mino and Anaguma, and the rook file matters: 四間 has trouble with the floating-rook formation against an opposing bishop line.',
    shikenPlan:
      'Shiken-bisha is solid here (6七 is covered, so no ▲6五角 drop) but fights away from the enemy king. Trade the 8th- and 6th-file pawns to bank two pawns and swing the rook to the 8th file, or keep the rook unmoved (Nishikawa style) and pick 四間 or 向かい飛車 after the opponent commits.',
    sources: ['https://thirdfilerook.jp/about-third-file-rook-vs-fourth-file-rook/', 'https://ja.wikipedia.org/wiki/相振り飛車', 'https://en.wikipedia.org/wiki/Double_Ranging_Rook'],
    courseIds: ['shikenbisha-vs-aifuri--2fu', 'shikenbisha-vs-aifuri--nishikawa'],
  },
]

const rawFiles = {
  ...import.meta.glob<string>('../vendor/shiryu-joseki/src/data/joseki/*.json', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('./data/joseki/*.json', { eager: true, query: '?raw', import: 'default' }),
}

function toCourse(raw: RawCourse): Course | null {
  const setup = SETUPS.find((s) => s.courseIds.includes(raw.id))
  if (!setup) return null
  const shikenIsMe = raw.myStrategy === 'shikenbisha'
  return {
    ...raw,
    userSide: raw.userSide ?? (shikenIsMe ? raw.mySide : otherSide(raw.mySide)),
    notesFromOpponentView: (raw.userSide ?? (shikenIsMe ? raw.mySide : otherSide(raw.mySide))) !== raw.mySide,
    setupId: setup.id,
  }
}

const DERIVED: { id: string; from: string; start: number; end: number; title: string; goalFormation: string }[] = [
  {
    id: 'sabaki--kuboryu',
    from: 'shikenbisha-vs-bougin--kuboryu',
    start: 37,
    end: 48,
    title: '捌き: 棒銀に△4五歩から捌く(久保流)',
    goalFormation: '△4五歩で角道を開けて捌き、角を成り込み、守りの銀を4五へ捌く。',
  },
  {
    id: 'sabaki--torisashi',
    from: 'shikenbisha-vs-torisashi--basic',
    start: 19,
    end: 22,
    title: '捌き: 軽く捌かず手厚く受ける(鳥刺し)',
    goalFormation: '鳥刺しには△3二銀型のまま軽く捌かず、△4三銀から手厚く受け止める。',
  },
]

function cut(node: JosekiNode, depth: number): JosekiNode {
  const main = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
  if (depth <= 0) return { ...node, branches: [] }
  return { ...node, branches: node.branches.map((b) => (b === main && b.child ? { ...b, child: cut(b.child, depth - 1) } : b)) }
}

function derive(base: RawCourse, spec: (typeof DERIVED)[number]): RawCourse {
  let node = base.root
  for (let i = 0; i < spec.start; i++) {
    const next = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
    if (!next?.child) break
    node = next.child
  }
  return { ...base, id: spec.id, title: spec.title, goalFormation: spec.goalFormation, source: `${base.title}の${spec.start + 1}手目から${spec.end}手目までを切り出したもの。手順と解説は元のコースと同じ出典(${base.source ?? 'Shiryu181/shogi-joseki'})。`, root: cut(node, spec.end - spec.start) }
}

const RAW: RawCourse[] = Object.values(rawFiles).map((text) => JSON.parse(text) as RawCourse)

export const COURSES: Course[] = [...RAW, ...DERIVED.map((d) => derive(RAW.find((r) => r.id === d.from)!, d))]
  .map((raw) => toCourse(raw))
  .filter((c): c is Course => c !== null)

export const courseById = (id: string) => COURSES.find((c) => c.id === id)

export const sideToMove = (node: JosekiNode): Side => colorSide(positionOf(node.sfen).color)

export function findPath(root: JosekiNode, targetId: string): JosekiMove[] | null {
  for (const branch of root.branches) {
    if (!branch.child) continue
    if (branch.child.id === targetId) return [branch]
    const rest = findPath(branch.child, targetId)
    if (rest) return [branch, ...rest]
  }
  return null
}

export function walkNodes(root: JosekiNode, visit: (node: JosekiNode, path: JosekiMove[]) => void, path: JosekiMove[] = []) {
  visit(root, path)
  for (const branch of root.branches) if (branch.child) walkNodes(branch.child, visit, [...path, branch])
}

export type Verdict = 'good' | 'mistake' | 'opponent-mistake' | 'book'

export function verdictFor(course: Course, mover: Side, kind: MoveKind): Verdict {
  if (kind !== 'deviation') return mover === course.userSide ? 'good' : 'book'
  return mover === course.userSide ? 'mistake' : 'opponent-mistake'
}
