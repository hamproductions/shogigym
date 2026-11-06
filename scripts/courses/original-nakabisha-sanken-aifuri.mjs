export default {
  id: 'nakabisha-vs-sankenbisha--aifuri',
  title: '相振り中飛車：美濃と金無双、前へ出た銀',
  titleEn: 'Double Ranging Rook: Mino, Kinmusou and an Advanced Silver',
  myStrategy: 'nakabisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '後手中飛車と先手三間飛車の相振りにおける５五歩・中央銀・美濃と金無双の標準的な配置から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手は飛車５二、歩５五、銀４五、美濃の玉８二と銀７二。先手は石田流の飛車７六と歩７五、金無双の玉３八・金４八５八・銀２八。歩を当てられた銀の引き場所を比べる。',
  goalLabel: '相手の飛車と自玉の位置を確認する',
  goalSfen: 'ln3g1nl/1ksgr2b1/1ppp1p1p1/p5p1p/2P1ps3/P1RP4P/1PNSPPPP1/1B2GGKS1/L6NL b - 1',
  rootComment:
    '先手が三間飛車を選ぶ相振りで、後手の中飛車を持ちます。先手の飛車７六と後手の飛車５二は違う筋を使います。玉８二の美濃と、先手玉３八の金無双を実際の配置で見てから、中央へ出た銀の応手を読みます。',
  rootCommentEn:
    'Play Gote Central Rook in Double Ranging Rook against Sente’s Third File Rook. The rooks on 7f and 5b use different files. Inspect Gote’s Mino around king 8b and Sente’s Kinmusou around king 3h before reading replies with the advanced central silver.',
  line: {
    moves:
      '7g7f 3c3d 6g6f 5c5d 2h7h 8b5b 7i6h 5d5e 6h6g 3a4b 7f7e 4b5c 7h7f 5a6b 5i4h 6b7b 4h3h 7b8b 4i4h 7a7b 6i5h 6a6b 3i2h 5c4d 8i7g 9c9d 9g9f 1c1d 1g1f 4d4e',
    notes: {
      5: '△５二飛で双方が飛車を振りました。',
      7: '△５五歩で中央へ歩を伸ばします。５六に先手駒はまだいません。',
      12: '▲７六飛と浮き、先手は７五歩と組み合わせた石田流の配置です。',
      19: '△７二銀で玉８二の隣を守ります。',
      22: '▲２八銀。先手の金４八・５八は横に並び、玉は３八です。',
      29: '△４五銀。５五の自分の歩があるため、この銀は次に５五へ進めません。４六・３六・５六などの升への利きを見ます。',
    },
    notesEn: {
      5: '△5二飛 means both sides have ranged their rooks.',
      7: '△5五歩 advances centrally. Sente has no piece on 5f yet.',
      12: '▲7六飛 floats the rook with a pawn on 7e, establishing the Ishida arrangement.',
      19: '△7二銀 guards beside king 8b.',
      22: '▲2八銀 joins the Kinmusou: golds 4h and 5h stand side by side beside king 3h.',
      29: '△4五銀 cannot move onto Gote’s own pawn on 5e. Inspect its control of squares such as 4f, 3f and 5f.',
    },
    comment:
      '後手銀４五は前へ出ていますが、先手の４六歩で当てられる候補があります。相振りだから常に攻め続けるという判断はせず、銀を引いたあとも５五歩を支えられるか、玉側の駒はどこにあるかを確かめます。',
    commentEn:
      'Gote’s silver on 4e is advanced, but Sente can consider ▲4六歩 to attack it. Double Ranging Rook does not require continuous attack. Read the silver’s retreat, its support of the central pawn and the actual king-side defenders.',
    branches: [
      {
        kind: 'alt',
        moves: '7e7d 7c7d 7f7d 5e5f 5g5f 4e5f 6g5f 5b5f',
        notes: {
          0: '▲７四歩で、先手が飛車のいる筋を交換しに来る例です。',
          2: '△同歩▲同飛まで交換すると、先手飛車が７四へ出ます。',
          3: '後手は△５六歩で別の筋へ接触します。５五を空けるので、飛車５二の前の道も変わります。',
          4: 'この比較では先手が▲同歩で取ります。',
          5: '△同銀で銀４五を５六へ使います。',
          6: '▲同銀で銀６七が取り返す応手を選びます。',
          7: '△同飛で交換を終えます。５三・５四・５五が空いているため、飛車５二から５六へ進めます。',
        },
        notesEn: {
          0: '▲7四歩 challenges the pawn on Sente’s rook file.',
          2: '△同歩 ▲同飛 completes the exchange and brings Sente’s rook to 7d.',
          3: 'Gote makes contact on a different file with △5六歩, clearing 5e in front of the rook.',
          4: 'This comparison selects ▲同歩.',
          5: '△同銀 uses the advanced silver from 4e on 5f.',
          6: 'Sente selects ▲同銀, recapturing with the silver from 6g.',
          7: '△同飛 completes the exchange. Empty squares 5c, 5d and 5e permit the rook to move from 5b to 5f.',
        },
        comment:
          '先手飛車７四と後手飛車５六が別の筋へ出ました。双方は銀と歩二枚ずつを持ちます。相手の歩交換に応じたあと、中央の歩と銀を使って飛車を働かせる比較であり、この交換が常に最善という主張ではありません。',
        commentEn:
          'Sente’s rook on 7d and Gote’s on 5f are active on different files. Each side holds a silver and two pawns. This comparison answers a pawn exchange and then activates the central rook through pawn and silver exchanges; it does not claim that the sequence is always best.',
      },
      {
        kind: 'alt',
        moves: '4g4f 4e5d 8h9g 2b4d',
        notes: {
          0: '▲４六歩で銀４五に当てます。',
          1: '△５四銀と斜めに引く例です。５五の歩は銀５四の正面なので、この銀が守ります。',
          2: '先手が角を９七へ移す応手を比較します。',
          3: '△４四角。３三を通る道が空いているので２二から上がれます。５五方向の道は自分の歩５五で止まります。',
        },
        notesEn: {
          0: '▲4六歩 attacks the silver on 4e.',
          1: 'This example retreats diagonally with △5四銀, protecting the pawn directly ahead on 5e.',
          2: 'Compare Sente’s reply moving the bishop to 9g.',
          3: '△4四角 develops through the empty 3c square. Gote’s own pawn on 5e blocks the diagonal in that direction.',
        },
        comment:
          '銀５四と角４四を置き直しました。角４四から７七への道は５五歩が止めているので、桂７七へ直接当たってはいません。自分の歩を含めて道を確認すると、見かけだけの駒取りを避けられます。',
        commentEn:
          'The silver is now on 5d and bishop on 4d. The pawn on 5e blocks the bishop’s path toward knight 7g, so it is not a direct attack on that knight. Include your own blockers when checking apparent captures.',
      },
    ],
  },
}
