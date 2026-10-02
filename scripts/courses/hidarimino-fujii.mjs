export default {
  id: 'shikenbisha-vs-hidarimino--24fu',
  title: '四間飛車(藤井システム型) vs 左美濃(後手・▲2四歩の仕掛け)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  source:
    '開始局面と手順はWikipedia日本語版「左美濃」(https://ja.wikipedia.org/wiki/左美濃)の第1-4図〜第1-6図(1996年5月14日 王位戦予選 谷川浩司 vs 阿部隆)と同節の解説に準拠(CC BY-SA)。開始局面は第1-4図をSFENに変換し、全手を合法手検証済み。',
  goalFormation: '左美濃側の代表的な攻め筋▲2四歩△同歩▲同角(または▲5五歩)への対応を覚える。',
  startSfen: 'l1kg3nl/2s1gr3/2n1p1bpp/ppp1s1pP1/3p1p3/PPP1P1P2/1KSP1PN1P/2S1G2R1/LNBG4L w - 1',
  rootComment:
    '第1-4図。藤井システム型の四間飛車に、左美濃側が▲2四歩と仕掛けた局面。▲2四歩△同歩▲同角は左美濃の代表的な攻め筋で、相手が△同角と取れば左美濃側の作戦成功、△2二飛と回っても▲3三角成か▲2五歩とするのが部分的な定跡とされる。',
  line: {
    moves: '△２四歩',
    notes: { 0: '▲2四歩には△同歩と取ります。' },
    branches: [
      {
        kind: 'main',
        moves: '▲同角',
        notes: { 0: '実戦の進行。角で歩を取り返し、2筋を狙います。' },
        branches: [
          {
            kind: 'main',
            moves: '△２二飛▲３三角成△２八飛成▲１一馬',
            notes: {
              0: '飛車を2筋に回して受けます。',
              1: '△2二飛には▲3三角成か▲2五歩とするのが部分的な定跡。',
              3: '実戦はこの▲1一馬まで進み(第1-5図)、以下▲7五歩→7四歩→7六香(第1-6図)となった。',
            },
            branches: [],
          },
          {
            kind: 'deviation',
            moves: '△同角',
            punishNote: '出典では、相手が△同角と取れば左美濃側の作戦成功とされる。',
            notes: { 0: '角で角を取り返した形。' },
          },
        ],
      },
      {
        kind: 'alt',
        moves: '▲５五歩',
        notes: { 0: '△同歩に▲5五歩とする変化。' },
        branches: [
          {
            kind: 'main',
            moves: '△同角▲２四飛△２二歩',
            notes: {
              0: '▲5五歩は△同角と取ります。',
              2: '△2二歩と受けて、以下△3七角成〜△6四馬で玉頭攻撃をみられる。',
            },
          },
          {
            kind: 'alt',
            moves: '△同銀▲２四角△２二飛▲３三角成△２八飛成▲５五馬',
            notes: {
              0: '銀で取ると、▲2四角から角を成り込まれる。',
              5: '△同銀の場合の進行。馬で5五の銀を取り返されます。',
            },
          },
        ],
      },
    ],
  },
}
