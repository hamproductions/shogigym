export default {
  id: 'nakabisha-vs-anaguma--basic',
  title: '後手中飛車：穴熊を見て銀冠へ組み替える',
  titleEn: 'Gote Central Rook: Reshaping to Silver Crown against Anaguma',
  myStrategy: 'nakabisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '角道を止めた後手中飛車と、居飛車穴熊に対する美濃から銀冠への標準的な組み替えから独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation: '後手中飛車は飛車５二、玉８二、銀７二・４三、金６二・３二。先手の穴熊に対し４五歩を置く。比較枝で８四歩・８三銀・７二金と銀冠へ組み替える。',
  goalLabel: '中央の歩と玉側の銀を別々に使う',
  goalSfen: 'ln5nl/1ksgr1g2/1p3sbpp/p1ppp1p2/5p1P1/P1P1P1P2/1PBPSP2P/LSG4R1/KNG4NL b - 1',
  rootComment:
    '後手の飛車を５二へ振り、角道を止めた中飛車で先手の穴熊に向き合います。中央の銀４三と、玉を守る銀７二は別の役割です。銀冠への組み替えでは、８三の歩を先に動かして銀の行き先を空けます。',
  rootCommentEn:
    'Use Gote’s closed-diagonal Central Rook on 5b against Sente’s Anaguma. The central silver on 4c and defensive silver on 7b have different roles. To reshape into Silver Crown, move the pawn off 8c before bringing the defensive silver there.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 8b5b 8h7g 6c6d 5i6h 7a6b 6h7h 6b6c 9i9h 5a6b 7h8h 6b7b 8h9i 7b8b 7i8h 6c7b 6i7i 3a4b 4i5h 4a3b 5g5f 4b4c 5h6h 6a6b 6h7h 9c9d 9g9f 5c5d 3i4h 2b3c 4h5g 7c7d 3g3f 4d4e',
    notes: {
      5: '△５二飛で中央へ飛車を置きます。４四の自分の歩が角２二の道を止めています。',
      19: '△７二銀。６二・６三を経由した銀が玉８二の隣へ戻りました。',
      25: '△４三銀。もう一枚の銀を中央へ出します。',
      27: '△６二金で金を玉側へ寄せます。',
      33: '△３三角で２四を守ります。',
      37: '△４五歩は４六へ利きます。先手銀５七が４六へ出る場合は、この歩に取られることも読みます。',
    },
    notesEn: {
      5: '△5二飛 places the rook centrally. Gote’s pawn on 4d blocks the bishop on 2b.',
      19: '△7二銀 brings the silver back beside king 8b after developing through 6b and 6c.',
      25: '△4三銀 develops the other silver centrally.',
      27: '△6二金 brings a gold toward the king.',
      33: '△3三角 guards 2d.',
      37: '△4五歩 controls 4f. If Sente’s silver on 5g enters 4f, include this pawn’s capture in the calculation.',
    },
    comment:
      '先手玉は９九の穴熊、後手玉は８二です。中央では後手歩５四・４五と銀４三があり、先手銀５七が残っています。囲いの名前だけで有利不利を決めず、どの筋で接触が起こるか見て次を選びます。',
    commentEn:
      'Sente’s king is in Anaguma on 9i, while Gote’s king stands on 8b. Gote has central pawns on 5d and 4e and a silver on 4c; Sente’s silver remains on 5g. Choose the next move from actual contact squares rather than judging the position from castle names.',
    branches: [
      {
        kind: 'alt',
        moves: '5g6f 8c8d 8g8f 7b8c 7h8g 6b7b',
        notes: {
          0: '比較枝では先手が銀を６六へ運びます。',
          1: '△８四歩で８三を空けます。玉８二の前の歩も動いたことを確認します。',
          3: '△８三銀。７二銀が玉の前へ出ます。',
          5: '△７二金で銀が空けた升へ金を置きます。銀８三・金７二と玉８二が銀冠の配置です。',
        },
        notesEn: {
          0: 'This comparison develops Sente’s silver to 6f.',
          1: '△8四歩 clears 8c. Notice that the pawn in front of king 8b has moved too.',
          3: '△8三銀 brings the silver from 7b in front of the king.',
          5: '△7二金 uses the square vacated by the silver. Silver 8c, gold 7b and king 8b form this Silver Crown arrangement.',
        },
        comment:
          '後手の銀冠と先手の穴熊が向かい合います。先手金８七も前へ進みました。組み替えに使った手数と、中央の歩４五・５四を両方見て、攻め始める前に相手の取り合いを確かめます。',
        commentEn:
          'Gote has reshaped to Silver Crown against Sente’s Anaguma, with Sente’s gold also developed to 8g. Consider the moves spent on the reshape together with central pawns 4e and 5d, and check the opponent’s captures before attacking.',
        branches: [
          {
            kind: 'alt',
            moves: '1g1f 8a7c 1f1e 7c6e 7g6h',
            notes: {
              0: '先手が端歩を進める応手を選び、後手桂の活動を比べます。',
              1: '△７三桂。先に７四歩と動いて７三を空けたため跳べます。９四歩は別の端の接触を用意しており、桂の進路を直接空ける歩ではありません。',
              3: '△６五桂で先手角７七へ利かせます。',
              4: 'この例では▲６八角と引きます。６八が空いていることを確認します。',
            },
            notesEn: {
              0: 'This comparison selects Sente’s edge-pawn advances while developing Gote’s knight.',
              1: '△7三桂 uses the square cleared by the earlier △7四歩. The pawn on 9d prepares separate edge contact; it did not clear the knight’s path.',
              3: '△6五桂 controls Sente’s bishop on 7g.',
              4: 'This example retreats with ▲6八角. Verify that 6h is empty.',
            },
            comment:
              '銀冠の銀８三と金７二を残し、桂を７三・６五へ使いました。角への当たりで相手の置き場所が変わりましたが、桂６五も今後の取り返しを読む必要があります。',
            commentEn:
              'Gote keeps the Silver Crown guards on 8c and 7b while developing the knight through 7c to 6e. The attack changed the bishop’s square, but captures of the advanced knight still need to be read.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: '1g1f 5d5e 5f5e 4c4d 5g5f',
        notes: {
          0: '先手が端歩を進める比較から、後手がすぐ中央を動かす例を見ます。',
          1: '△５五歩で先手歩５六と接触します。',
          2: '▲同歩で先手が歩を持ち、５五に先手歩が残ります。',
          3: '後手が△４四銀と出る応手を選びます。',
          4: '▲５六銀で先手銀も前へ出ます。この銀は５五の自分の歩を守ります。',
        },
        notesEn: {
          0: 'After a selected edge-pawn reply by Sente, compare Gote immediately initiating central contact.',
          1: '△5五歩 meets Sente’s pawn on 5f.',
          2: '▲同歩 gains a pawn in hand and leaves Sente’s pawn on 5e.',
          3: 'This example selects Gote’s development △4四銀.',
          4: '▲5六銀 also develops Sente’s silver and protects its own pawn on 5e.',
        },
        comment:
          '後手が歩を動かした結果、先手は歩を一枚得て銀５六も使えました。飛車５二だけで５五を取るなら、銀５六の取り返しがあります。穴熊へ中央から動いたことだけで攻めの成功とはせず、渡した歩と相手の銀の活動も数えます。',
        commentEn:
          'Gote’s pawn move gave Sente a pawn in hand and development of the silver to 5f. A rook capture on 5e would allow that silver to recapture. Initiating central play against Anaguma alone is not a successful attack: count the pawn conceded and the opponent’s silver activity.',
      },
    ],
  },
}
