import type { Text, Wing } from './strategies'

export type StrategyPage = { id: string; wing: Wing | 'both'; name: Text; about: Text; units: string[]; mains: string[] }

export type Stage = { id: string; name: Text; goal: Text; units: string[]; strategies?: string[] }

export const STRATEGY_PAGES: StrategyPage[] = [
  {
    id: 'bougin',
    wing: 'ibisha',
    name: { ja: '棒銀', en: 'Climbing Silver' },
    about: { ja: '右の銀をまっすぐ進め、飛車と一緒に２筋を破る。最初の居飛車に向く。', en: 'March the right silver straight up and break the second file with the rook. A good first Static Rook plan.' },
    units: ['ibisha-basics', 'bougin-basics', 'bougin-middlegame', 'bougin-castles', 'bougin-vs-furibisha'],
    mains: ['bougin', 'ibisha'],
  },
  {
    id: 'migishiken',
    wing: 'ibisha',
    name: { ja: '右四間飛車', en: 'Right Fourth File Rook' },
    about: { ja: '飛車を４筋へ回し、銀・桂・角と４五を攻める。矢倉にも四間飛車にも使える。', en: 'Swing the rook to the fourth file and attack 4e with silver, knight and bishop. Works against Yagura and Fourth File Rook.' },
    units: ['kishu-migishiken-hidarimino'],
    mains: ['migishiken'],
  },
  {
    id: 'yagura',
    wing: 'ibisha',
    name: { ja: '矢倉', en: 'Yagura' },
    about: { ja: '金銀３枚の矢倉囲いに組む相居飛車の本格派。', en: 'The classical Double Static Rook game built around the three-general Yagura castle.' },
    units: ['yagura-build', 'yagura-bougin', 'yagura-aiyagura', 'yagura-37gin', 'yagura-suzume', 'yagura-waki', 'yagura-vs-bougin', 'yagura-vs-migishiken', 'yagura-vs-hidarimino', 'tutorial-kyusen-yagura'],
    mains: ['yagura', 'kyusen-yagura'],
  },
  {
    id: 'gangi',
    wing: 'ibisha',
    name: { ja: '雁木', en: 'Gangi' },
    about: { ja: '銀を横に並べた雁木囲いで、角道を止めて構える。', en: 'Close the bishop line and build with two silvers side by side.' },
    units: ['gangi'],
    mains: ['gangi'],
  },
  {
    id: 'kakugawari',
    wing: 'ibisha',
    name: { ja: '角換わり', en: 'Bishop Exchange' },
    about: { ja: '序盤で角を交換し、角の打ち込みに気をつけながら右銀で攻める。', en: 'Trade bishops early, then attack with the right silver while guarding against bishop drops.' },
    units: ['kakugawari-basics', 'kakugawari-bougin', 'kakugawari-hayakuri', 'kakugawari-koshikake', 'kakugawari-45kei', 'kakugawari-ittezon'],
    mains: ['kakugawari', 'ittezon', 'hayakurigin', 'koshikakegin'],
  },
  {
    id: 'aigakari',
    wing: 'ibisha',
    name: { ja: '相掛かり', en: 'Double Wing Attack' },
    about: { ja: '互いに飛車先の歩を伸ばし合う、序盤から自由度の高い相居飛車。', en: 'Both sides push their rook pawns early. An open Double Static Rook game.' },
    units: ['aigakari-basics', 'aigakari-bougin', 'hineribisha'],
    mains: ['aigakari'],
  },
  {
    id: 'yokofudori',
    wing: 'ibisha',
    name: { ja: '横歩取り', en: 'Side Pawn Capture' },
    about: { ja: '先手が飛車で３四の歩を取る激しい相居飛車。', en: "A sharp Double Static Rook line where Sente's rook takes the pawn on 3d." },
    units: ['yokofu-basics', 'yokofu-23fu', 'yokofu-45kaku', 'aiyokofu', 'yokofu-85hisha', 'tutorial-yoko-85hi', 'yokofu-aono', 'yokofu-yuuki', 'yokofu-avoid'],
    mains: ['yokofudori', 'yoko-85hi', 'yoko-45kaku'],
  },
  {
    id: 'taifuri',
    wing: 'ibisha',
    name: { ja: '居飛車の対振り飛車', en: 'Static Rook against Ranging Rook' },
    about: { ja: '振り飛車に対して、急戦で早く攻めるか、穴熊などで堅く組むかを選ぶ。', en: 'Against Ranging Rook, choose between attacking early and building a hard castle such as Anaguma.' },
    units: [
      'taifuri-basics',
      'tutorial-funa-kyusen',
      'taifuri-bougin',
      'taifuri-46gin',
      'tutorial-saginomiya',
      'tutorial-yamada',
      'tutorial-hayashikake35',
      'tutorial-kei37',
      'taifuri-45hayashikake',
      'taifuri-ponpon',
      'taifuri-elmo',
      'tutorial-hidarimino',
      'taifuri-anaguma',
      'taifuri-millennium',
      'taifuri-vs-hayaishida',
      'taifuri-bougin-ishida',
      'taifuri-chousoku',
      'tutorial-maruyama',
      'taifuri-vs-kakukoukan',
    ],
    mains: ['funa-kyusen', 'hayashikake45', 'hayashikake35', 'kei37', 'naname', 'yamada', 'saginomiya', 'ponponkei', 'chousoku', 'maruyama', 'ibisha-anaguma', 'hidarimino', 'millennium'],
  },
  {
    id: 'shikenbisha',
    wing: 'furibisha',
    name: { ja: '四間飛車', en: 'Fourth File Rook' },
    about: { ja: '飛車を４筋へ振り、美濃囲いで固めてから相手の攻めをさばく。', en: 'Swing the rook to the fourth file, castle in Mino and counter the opponent’s attack.' },
    units: ['shiken-basics', 'shiken-castles', 'shiken-patterns', 'shiken-vs-igyoku-bougin', 'shiken-vs-funa-bougin', 'shiken-vs-yagura', 'shiken-vs-migishiken', 'shiken-vs-anaguma', 'shiken-tateishi'],
    mains: ['shikenbisha'],
  },
  {
    id: 'fujii',
    wing: 'furibisha',
    name: { ja: '藤井システム', en: 'Fujii System' },
    about: { ja: '玉を囲う前に攻めの形を作り、居飛車穴熊が完成する前に仕掛ける四間飛車。', en: 'A Fourth File Rook system that attacks before Static Rook’s Anaguma is finished, keeping its own king at home.' },
    units: ['fujii-build', 'fujii-vs-anaguma', 'fujii-vs-hidarimino', 'fujii-vs-kyusen'],
    mains: [],
  },
  {
    id: 'kakukoukan',
    wing: 'furibisha',
    name: { ja: '角交換振り飛車', en: 'Bishop-Exchange Ranging Rook' },
    about: { ja: '角道を止めずに振り飛車にし、角交換を前提に戦う。', en: 'Ranging Rook with the bishop line left open, playing for a bishop exchange.' },
    units: ['kakukoukan-shiken', 'kakukoukan-gyakubougin', 'direct-mukai', 'legspe'],
    mains: ['kakukoukan-furi'],
  },
  {
    id: 'sankenbisha',
    wing: 'furibisha',
    name: { ja: '三間飛車', en: 'Third File Rook' },
    about: { ja: '飛車を３筋へ振り、相手の右側の攻めに飛車を近づけて受ける。', en: 'Swing the rook to the third file, close to where Static Rook usually attacks.' },
    units: ['sanken-basics', 'sanken-vs-bougin', 'sanken-tomahawk'],
    mains: ['sankenbisha'],
  },
  {
    id: 'ishida',
    wing: 'furibisha',
    name: { ja: '石田流', en: 'Ishida Style' },
    about: { ja: '三間飛車から歩を伸ばし、飛車を７六へ浮いて攻める積極的な形。', en: 'An active Third File Rook that pushes its pawn and lifts the rook to 7f.' },
    units: ['ishida-basics', 'ishida-honkumi', 'ishida-attack', 'hayaishida', 'ishida-43'],
    mains: ['ishida', 'hayaishida'],
  },
  {
    id: 'nakabisha',
    wing: 'furibisha',
    name: { ja: '中飛車', en: 'Central Rook' },
    about: { ja: '飛車を５筋に振り、中央の歩を伸ばして攻める。ゴキゲン中飛車は角道を開けたまま戦う。', en: 'Swing the rook to the centre and push the central pawn. Gokigen Central Rook keeps the bishop line open.' },
    units: ['gokigen-basics', 'nakabisha-sente', 'gokigen-castles', 'gokigen-attack', 'gokigen-vs-choukyusen', 'gokigen-vs-chousoku', 'gokigen-vs-anaguma'],
    mains: ['nakabisha', 'gokigen'],
  },
  {
    id: 'mukaibisha',
    wing: 'furibisha',
    name: { ja: '向かい飛車', en: 'Opposing Rook' },
    about: { ja: '飛車を２筋（後手は８筋）へ振り、相手の飛車と向かい合って戦う。', en: "Swing the rook to the second file (eighth for Gote) to face the opponent's rook directly." },
    units: ['mukai-build', 'mukai-attack'],
    mains: ['mukaibisha'],
  },
  {
    id: 'aifuri',
    wing: 'furibisha',
    name: { ja: '相振り飛車', en: 'Double Ranging Rook' },
    about: { ja: '両方が飛車を振る戦い。囲いと攻めの方向が対抗形と変わる。', en: 'Both sides range their rooks. Castles and attacking directions differ from Static against Ranging Rook.' },
    units: ['aifuri-basics', 'aifuri-ishida-vs-naka', 'aifuri-vs-ishida', 'aifuri-hidari-anaguma'],
    mains: [],
  },
  {
    id: 'kishu',
    wing: 'both',
    name: { ja: '奇襲戦法と対策', en: 'Surprise openings and answers' },
    about: { ja: '鬼殺し・筋違い角・パックマン・アヒルなど、早い罠と正しい受け方。', en: 'Oni-goroshi, Wrong-diagonal Bishop, Pac-Man, Duck and others: the early traps and how to meet them.' },
    units: ['tutorial-onigoroshi', 'kishu-onigoroshi', 'tutorial-sujichigai', 'kishu-sujichigai', 'kishu-pacman', 'tutorial-ahiru', 'kishu-ahiru'],
    mains: ['sujichigai'],
  },
  {
    id: 'ureshino',
    wing: 'ibisha',
    name: { ja: '嬉野流', en: 'Ureshino Style' },
    about: { ja: '初手▲６八銀から左銀を前に出す、変わった居飛車。', en: 'An unusual Static Rook that opens with ▲6八銀 and advances the left silver.' },
    units: ['ureshino-basics', 'ureshino-new', 'ureshino-vs-bougin', 'ureshino-vs-shiken', 'ureshino-counter'],
    mains: ['torisashi'],
  },
  {
    id: 'handicap',
    wing: 'both',
    name: { ja: '駒落ち', en: 'Handicap games' },
    about: { ja: '上手が駒を落とした将棋で、下手の勝ち方を覚える。', en: 'Games where the stronger player removes pieces. Learn how the weaker side wins.' },
    units: ['handicap-8', 'handicap-6', 'handicap-4', 'handicap-2'],
    mains: [],
  },
]

export const STAGES: Stage[] = [
  {
    id: 'rules',
    name: { ja: 'ルールを覚える', en: 'Learn the rules' },
    goal: { ja: '駒の動き、成り、持ち駒、反則を覚えて、一局を最後まで指せるようになる。', en: 'Learn how the pieces move, promotion, drops and fouls, and play a game to the end.' },
    units: ['rules-game', 'rules-setup', 'rules-moves', 'rules-promotion', 'rules-drops', 'rules-checkmate', 'rules-fouls', 'rules-draws', 'rules-tsume'],
  },
  {
    id: 'basics',
    name: { ja: '指し方の基本', en: 'How to play' },
    goal: { ja: '駒の損得、攻めと受け、序盤・中盤・終盤で何を考えるかを知る。', en: 'Material, attack and defence, and what to think about in the opening, middlegame and endgame.' },
    units: ['basics-value', 'basics-attack-defense', 'basics-mate-words', 'endgame-mate1', 'basics-plan', 'basics-opening', 'basics-middlegame', 'basics-endgame', 'basics-forks', 'basics-bishop-trade'],
  },
  {
    id: 'first-strategy',
    name: { ja: '最初の戦法を一つ覚える', en: 'Learn your first strategy' },
    goal: { ja: '居飛車なら棒銀か右四間飛車、振り飛車なら四間飛車か中飛車を一つ選び、初手から攻め方まで指せるようにする。', en: 'Pick one: Climbing Silver or Right Fourth File Rook for Static Rook, Fourth File Rook or Central Rook for Ranging Rook. Learn it from move one to the attack.' },
    units: ['castles-first', 'ibisha-basics', 'bougin-basics', 'kishu-migishiken-hidarimino', 'shiken-basics', 'gokigen-basics'],
    strategies: ['bougin', 'migishiken', 'shikenbisha', 'nakabisha'],
  },
  {
    id: 'tesuji',
    name: { ja: '駒ごとの手筋', en: 'Tactics for each piece' },
    goal: { ja: '歩から飛車まで、駒ごとによく出る手筋を覚えて、中盤で使えるようにする。', en: 'The standard tactics of each piece, from pawn to rook, ready for use in the middlegame.' },
    units: ['tesuji-pawn', 'tesuji-lance', 'tesuji-knight', 'tesuji-silver', 'tesuji-gold', 'tesuji-bishop', 'tesuji-rook', 'proverb-three-pawns', 'proverb-gold-last'],
  },
  {
    id: 'castles',
    name: { ja: '囲いと囲い崩し', en: 'Castles and how to break them' },
    goal: { ja: '主な囲いの形と弱点を知り、美濃・矢倉・穴熊・舟囲いを崩す筋を覚える。', en: 'The main castles and their weak points, and how to break Mino, Yagura, Anaguma and Funa.' },
    units: [
      'castles-funa',
      'castles-mino',
      'castles-yagura',
      'castles-hidarimino',
      'castles-anaguma',
      'castles-nakazumai',
      'castles-aifuri',
      'castles-other',
      'attack-funa',
      'attack-mino-side',
      'attack-mino-kobin',
      'attack-mino-aifuri',
      'attack-yagura-side',
      'attack-yagura-head',
      'attack-anaguma',
      'attack-kinmusou',
      'attack-edge',
    ],
  },
  {
    id: 'endgame',
    name: { ja: '寄せと詰み', en: 'Mating attacks' },
    goal: { ja: '３手・５手詰を解き、詰めろと必至で相手玉を追い詰め、自玉を守り切る。', en: 'Solve three- and five-move mates, chase the king with mating threats, and keep your own king safe.' },
    units: ['endgame-mate3', 'endgame-mate-tesuji', 'endgame-yose', 'endgame-tsumero', 'endgame-defense', 'endgame-mate5', 'endgame-tsume-study', 'judgment-four-factors'],
  },
  {
    id: 'strategies',
    name: { ja: '戦法の定跡を深める', en: 'Go deeper into strategies' },
    goal: { ja: '自分の戦法の定跡と、よく当たる相手の戦法への対策を覚える。', en: "Learn your strategy's main lines and how to meet the strategies you face most." },
    units: [],
    strategies: ['bougin', 'migishiken', 'shikenbisha', 'nakabisha', 'sankenbisha', 'ishida', 'mukaibisha', 'taifuri', 'yagura', 'gangi', 'kishu', 'ureshino'],
  },
  {
    id: 'advanced',
    name: { ja: '有段者とプロの戦型', en: 'Dan-level and professional openings' },
    goal: { ja: 'プロでも指される角換わり・相掛かり・横歩取り・藤井システム・相振り飛車などを学ぶ。', en: 'Bishop Exchange, Double Wing Attack, Side Pawn Capture, Fujii System, Double Ranging Rook and other openings played by professionals.' },
    units: [],
    strategies: ['kakugawari', 'aigakari', 'yokofudori', 'fujii', 'kakukoukan', 'aifuri', 'handicap'],
  },
]

export type Tutorial = { name: Text; unit: string; page: string }

const tutorial = (ja: string, en: string, unit: string, page: string): Tutorial => ({ name: { ja, en }, unit, page })

export const TUTORIALS: Tutorial[] = [
  tutorial('棒銀', 'Climbing Silver', 'bougin-basics', 'bougin'),
  tutorial('右四間飛車', 'Right Fourth File Rook', 'kishu-migishiken-hidarimino', 'migishiken'),
  tutorial('矢倉', 'Yagura', 'yagura-build', 'yagura'),
  tutorial('矢倉棒銀', 'Yagura Climbing Silver', 'yagura-bougin', 'yagura'),
  tutorial('３七銀戦法', 'Silver-37 Yagura', 'yagura-37gin', 'yagura'),
  tutorial('雀刺し', 'Sparrow Attack', 'yagura-suzume', 'yagura'),
  tutorial('脇システム', 'Waki System', 'yagura-waki', 'yagura'),
  tutorial('急戦矢倉・居角左美濃', 'Rapid Yagura attack', 'tutorial-kyusen-yagura', 'yagura'),
  tutorial('雁木', 'Gangi', 'gangi', 'gangi'),
  tutorial('角換わり', 'Bishop Exchange', 'kakugawari-basics', 'kakugawari'),
  tutorial('角換わり棒銀', 'Bishop Exchange Climbing Silver', 'kakugawari-bougin', 'kakugawari'),
  tutorial('早繰り銀', 'Rapid Advancing Silver', 'kakugawari-hayakuri', 'kakugawari'),
  tutorial('腰掛け銀', 'Reclining Silver', 'kakugawari-koshikake', 'kakugawari'),
  tutorial('▲４五桂速攻', 'Early ▲4五桂', 'kakugawari-45kei', 'kakugawari'),
  tutorial('一手損角換わり', 'Tempo-loss Bishop Exchange', 'kakugawari-ittezon', 'kakugawari'),
  tutorial('相掛かり', 'Double Wing Attack', 'aigakari-basics', 'aigakari'),
  tutorial('相掛かり棒銀', 'Double Wing Climbing Silver', 'aigakari-bougin', 'aigakari'),
  tutorial('ひねり飛車', 'Twisting Rook', 'hineribisha', 'aigakari'),
  tutorial('横歩取り', 'Side Pawn Capture', 'yokofu-basics', 'yokofudori'),
  tutorial('横歩取り△８五飛', 'Side Pawn: △8五飛', 'tutorial-yoko-85hi', 'yokofudori'),
  tutorial('横歩取り△３三角型', 'Side Pawn: △3三角', 'yokofu-85hisha', 'yokofudori'),
  tutorial('横歩取り△４五角', 'Side Pawn: △4五角', 'yokofu-45kaku', 'yokofudori'),
  tutorial('横歩取り△２三歩', 'Side Pawn: △2三歩', 'yokofu-23fu', 'yokofudori'),
  tutorial('相横歩取り', 'Mutual Side Pawn', 'aiyokofu', 'yokofudori'),
  tutorial('青野流', 'Aono style', 'yokofu-aono', 'yokofudori'),
  tutorial('勇気流', 'Yuuki style', 'yokofu-yuuki', 'yokofudori'),
  tutorial('居飛車の対振り飛車', 'Static Rook against Ranging Rook', 'taifuri-basics', 'taifuri'),
  tutorial('舟囲い急戦', 'Funa-castle rapid attack', 'tutorial-funa-kyusen', 'taifuri'),
  tutorial('対振り棒銀', 'Climbing Silver against Ranging Rook', 'taifuri-bougin', 'taifuri'),
  tutorial('４六銀左急戦', 'Left Silver-46', 'taifuri-46gin', 'taifuri'),
  tutorial('鷺宮定跡', 'Saginomiya Joseki', 'tutorial-saginomiya', 'taifuri'),
  tutorial('山田定跡', 'Yamada Joseki', 'tutorial-yamada', 'taifuri'),
  tutorial('４五歩早仕掛け', 'Early ▲4五歩', 'taifuri-45hayashikake', 'taifuri'),
  tutorial('▲３五歩早仕掛け', 'Early ▲3五歩', 'tutorial-hayashikake35', 'taifuri'),
  tutorial('▲３七桂早仕掛け', 'Early ▲3七桂', 'tutorial-kei37', 'taifuri'),
  tutorial('ポンポン桂', 'Pon-pon Knight', 'taifuri-ponpon', 'taifuri'),
  tutorial('elmo囲い急戦', 'Elmo castle rapid attack', 'taifuri-elmo', 'taifuri'),
  tutorial('居飛車穴熊', 'Static Rook Anaguma', 'taifuri-anaguma', 'taifuri'),
  tutorial('左美濃', 'Left Mino', 'tutorial-hidarimino', 'taifuri'),
  tutorial('ミレニアム', 'Millennium', 'taifuri-millennium', 'taifuri'),
  tutorial('石田流に棒金', 'Climbing Gold against Ishida', 'taifuri-bougin-ishida', 'taifuri'),
  tutorial('超速▲３七銀', 'Super-fast ▲3七銀', 'taifuri-chousoku', 'taifuri'),
  tutorial('丸山ワクチン', 'Maruyama Vaccine', 'tutorial-maruyama', 'taifuri'),
  tutorial('四間飛車', 'Fourth File Rook', 'shiken-basics', 'shikenbisha'),
  tutorial('立石流', 'Tateishi style', 'shiken-tateishi', 'shikenbisha'),
  tutorial('藤井システム', 'Fujii System', 'fujii-build', 'fujii'),
  tutorial('角交換四間飛車', 'Bishop-Exchange Fourth File Rook', 'kakukoukan-shiken', 'kakukoukan'),
  tutorial('逆棒銀', 'Reverse Climbing Silver', 'kakukoukan-gyakubougin', 'kakukoukan'),
  tutorial('ダイレクト向かい飛車', 'Direct Opposing Rook', 'direct-mukai', 'kakukoukan'),
  tutorial('レグスペ', 'Legspe', 'legspe', 'kakukoukan'),
  tutorial('三間飛車', 'Third File Rook', 'sanken-basics', 'sankenbisha'),
  tutorial('トマホーク', 'Tomahawk', 'sanken-tomahawk', 'sankenbisha'),
  tutorial('石田流', 'Ishida Style', 'ishida-basics', 'ishida'),
  tutorial('早石田', 'Quick Ishida', 'hayaishida', 'ishida'),
  tutorial('４→３戦法', 'Fourth-to-Third File Rook', 'ishida-43', 'ishida'),
  tutorial('ゴキゲン中飛車', 'Gokigen Central Rook', 'gokigen-basics', 'nakabisha'),
  tutorial('先手中飛車', 'Sente Central Rook', 'nakabisha-sente', 'nakabisha'),
  tutorial('中飛車左穴熊', 'Central Rook Left Anaguma', 'aifuri-hidari-anaguma', 'aifuri'),
  tutorial('向かい飛車', 'Opposing Rook', 'mukai-build', 'mukaibisha'),
  tutorial('相振り飛車', 'Double Ranging Rook', 'aifuri-basics', 'aifuri'),
  tutorial('鬼殺し', 'Oni-goroshi', 'tutorial-onigoroshi', 'kishu'),
  tutorial('筋違い角', 'Wrong-diagonal Bishop', 'tutorial-sujichigai', 'kishu'),
  tutorial('パックマン', 'Pac-Man', 'kishu-pacman', 'kishu'),
  tutorial('アヒル戦法', 'Duck', 'tutorial-ahiru', 'kishu'),
  tutorial('嬉野流', 'Ureshino Style', 'ureshino-basics', 'ureshino'),
  tutorial('新嬉野流', 'New Ureshino', 'ureshino-new', 'ureshino'),
  tutorial('八枚落ち', 'Eight-piece handicap', 'handicap-8', 'handicap'),
  tutorial('六枚落ち', 'Six-piece handicap', 'handicap-6', 'handicap'),
  tutorial('四枚落ち', 'Four-piece handicap', 'handicap-4', 'handicap'),
  tutorial('二枚落ち', 'Two-piece handicap', 'handicap-2', 'handicap'),
]

export const strategyPage = (id: string) => STRATEGY_PAGES.find((page) => page.id === id)

export const pageForMain = (main: string) => STRATEGY_PAGES.find((page) => page.mains.includes(main))

export const stageUnits = (stage: Stage) => [...stage.units, ...(stage.strategies ?? []).flatMap((id) => strategyPage(id)?.units ?? [])]

export const PATH_UNITS = [...new Set(STAGES.flatMap(stageUnits))]

export const nextUnitAfter = (unit: string) => PATH_UNITS[PATH_UNITS.indexOf(unit) + 1]

const FINISHED_KEY = 'joseki-practice:finished-chapters:v1'

export function finishedChapters(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FINISHED_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function markChapterFinished(courseId: string) {
  const finished = finishedChapters()
  if (finished.has(courseId)) return
  finished.add(courseId)
  try {
    localStorage.setItem(FINISHED_KEY, JSON.stringify([...finished]))
  } catch {
    void 0
  }
}
