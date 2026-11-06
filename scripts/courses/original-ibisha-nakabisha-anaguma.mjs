export default {
  id: 'ibisha-vs-nakabisha--anaguma',
  title: '中飛車への居飛車穴熊：入口を空けて金銀を寄せる',
  titleEn: 'Static Rook Anaguma against Central Rook: Clear the Corner and Add Guards',
  myStrategy: 'ibisha',
  opponentStrategy: 'nakabisha',
  mySide: 'sente',
  userSide: 'sente',
  source: '角道を止めた中飛車に対する居飛車穴熊の標準的な配置から独立して構成。新ペタショック定跡（MIT）の序盤候補を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手玉９九、香９八、銀８八、金７八・７九の穴熊。飛車は２八に残し、もう一枚の銀を４六へ進める。後手は飛車５二、歩５四・４四、銀４三の中飛車で中央に備える。',
  goalLabel: '囲いの駒と攻めの銀を区別する',
  goalSfen: 'ln5nl/1ksgr1g2/5sbpp/ppppppp2/7P1/P1P1PS3/1PBP1PP1P/LSG4R1/KNG4NL b - 1',
  rootComment:
    '先手の飛車を２筋に置き、後手の中飛車に対して左の穴熊を作ります。角が８八を空け、香が９九を空けてから玉を運びます。玉が隅に着く手と、そのあと金銀を寄せる手を区別して追ってください。',
  rootCommentEn:
    'Keep Sente’s rook on the second file and build a left Anaguma against Gote’s Central Rook. The bishop must clear 8h and the lance must clear 9i before the king can enter. Distinguish reaching the corner from the later moves that bring in the guards.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 8b5b 8h7g 6c6d 5i6h 7a6b 6h7h 6b6c 9i9h 5a6b 7h8h 6b7b 8h9i 7b8b 7i8h 6c7b 6i7i 3a4b 4i5h 4a3b 5g5f 4b4c 5h6h 6a6b 6h7h 9c9d 9g9f 5c5d 3i4h 2b3c 4h5g 7c7d 5g4f 8c8d',
    notes: {
      3: '△４四歩で後手が角道を止めました。先手の角は７七へ上がれます。',
      5: '△５二飛で中飛車です。先手の飛車２八は動かさず、玉を反対側へ運びます。',
      6: '▲７七角で８八を空けます。玉の道を空ける一方、角は８六も守ります。',
      12: '▲９八香で９九が空きます。８八玉から９九へ入る前に必要な手です。',
      16: '▲９九玉で隅へ入りました。この時点では左銀７九と金６九がまだ残っています。',
      18: '▲８八銀で玉の斜め前に銀を置きます。',
      20: '▲７九金。空いた７九へ左の金を寄せます。',
      28: '右金が５八・６八を通って７八へ来ました。金７八・７九と銀８八で玉の周りを固めます。',
      30: '△９四歩に▲９六歩と応じる例です。端歩を突くかどうかは端の接触にも影響するため、毎回同じ手が必要とは限りません。',
      36: '右銀は４八・５七・４六へ進みました。囲いに使った銀８八とは別の役割です。',
    },
    notesEn: {
      3: '△4四歩 closes Gote’s bishop diagonal. Sente can develop the bishop to 7g.',
      5: '△5二飛 establishes Central Rook. Sente leaves the rook on 2h and moves the king to the other wing.',
      6: '▲7七角 clears 8h for the king while also defending 8f.',
      12: '▲9八香 clears 9i before the king enters from 8h.',
      16: '▲9九玉 reaches the corner. The left silver is still on 7i and the left gold on 6i.',
      18: '▲8八銀 places a silver diagonally in front of the king.',
      20: '▲7九金 brings the left gold onto the vacated 7i square.',
      28: 'The right gold reaches 7h via 5h and 6h. Golds on 7h and 7i and the silver on 8h surround the king.',
      30: 'This example answers △9四歩 with ▲9六歩. Advancing the edge pawn changes future contact there; it is not a compulsory rule for every position.',
      36: 'The right silver travels through 4h and 5g to 4f, with a different role from the defensive silver on 8h.',
    },
    comment:
      '玉９九の周りには銀８八、金７八・７九、香９八があります。右辺では銀４六、歩２五、飛車２八が攻めの準備です。囲いができても、中央や端の相手の接触を無視してよいわけではありません。',
    commentEn:
      'Around the king on 9i are the silver on 8h, golds on 7h and 7i, and lance on 9h. On the right, the silver on 4f, pawn on 2e and rook on 2h prepare activity. A completed castle does not make the opponent’s central or edge threats irrelevant.',
    branches: [
      {
        kind: 'alt',
        moves: '3g3f 1c1d',
        notes: {
          0: '▲３六歩を加える例です。後手歩３四は３五を守っています。',
        },
        notesEn: {
          0: 'This example adds ▲3六歩. Gote’s pawn on 3d controls 3e.',
        },
        comment: '銀４六から３五は空升でも、相手の歩が利く升です。先に歩を交換してから銀で取り返す手と、銀を直接その升へ出す誤りを比べます。',
        commentEn:
          'Although 3e is empty, the opposing pawn controls it. Compare exchanging pawns before recapturing with the silver against advancing the silver directly onto that square.',
        branches: [
          {
            kind: 'alt',
            moves: '3f3e 3d3e 4f3e',
            comment:
              '▲３五歩△同歩▲同銀で双方が歩を一枚持ち、先手銀が３五へ進みます。３四の後手歩は交換で消えたため、同じ歩に銀を取られる配置ではありません。穴熊の守りと、攻めの銀の歩交換を分けて確認します。',
            commentEn:
              '▲3五歩 △同歩 ▲同銀 gives each side one pawn and brings Sente’s silver to 3e. Gote’s pawn on 3d disappeared in the exchange, so it can no longer capture this silver. Separate the castle’s defenders from the attacking silver’s pawn exchange.',
          },
          {
            kind: 'deviation',
            moves: '4f3e 3d3e 3f3e',
            comment:
              '▲３五銀と直接出る手は△同歩で銀を取られる誤りです。▲同歩と取り返しても銀を歩と交換したことになります。銀が空升へ進めることと、その升で安全に働けることは別です。',
            commentEn:
              'Advancing directly with ▲3五銀 is a mistake because △同歩 captures the silver. ▲同歩 recaptures only a pawn, leaving a silver-for-pawn loss. Legal access to an empty square does not make that square safe.',
          },
        ],
      },
    ],
  },
}
