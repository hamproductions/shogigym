export default {
  id: 'sankenbisha-vs-ibisha--basic',
  title: '後手三間飛車：３二の飛車と美濃の配置',
  titleEn: 'Gote Third File Rook: Rook 3b and the Mino Arrangement',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source: '角道を止める後手三間飛車と美濃囲いの標準的な駒組みを、新ペタショック定跡（MIT）の候補手から独立して選択。比較枝と説明はこのアプリ用に新しく構成。',
  goalFormation: '後手飛車３二・角３三、玉８二・銀７二・金５二の美濃。中央の歩５四・６四を確認し、角道が開いて角交換になった場合の飛車の取り返しを比べる。',
  goalLabel: '玉側と飛車側の配置を分けて見る',
  goalSfen: 'ln1g3nl/1ks1gsr2/1pp3bpp/p2pppp2/7P1/P1P1PPP2/1P1PS3P/1BK1GS1R1/LN1G3NL b - 1',
  rootComment:
    '後手で三間飛車を組みます。飛車は３二へ、玉は反対側の８二へ運びます。駒組みでは両方を進めますが、囲いの名前だけで守りを判断せず、銀と金のいる升を確認してください。',
  rootCommentEn:
    'Build Third File Rook as Gote, moving the rook to 3b and the king toward 8b on the opposite wing. Develop both parts of the position, but identify the actual silver and gold squares rather than relying on the castle name alone.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b3b 5g5f 3a4b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 3g3f 5c5d 4g4f 6c6d 9g9f 9c9d',
    notes: {
      3: '△４四歩で角の斜線を自分の歩が止めます。',
      5: '△３三角で２四を守ります。',
      7: '△３二飛。飛車３二から角３三へ縦に利いています。角３三が前へ利く方向とは区別します。',
      15: '△８二玉。飛車３二とは反対側へ移りました。',
      17: '△７二銀で玉の隣に銀を置きます。',
      19: '△５二金。玉８二・銀７二と、この金の位置を合わせて確認します。',
      21: '△５四歩で５三が空きます。',
      23: '△６四歩で６三を空け、６五へ進める候補を作ります。今の６四は金５二が直接守る升ではありません。',
    },
    notesEn: {
      3: '△4四歩 blocks Gote’s bishop diagonal with its own pawn.',
      5: '△3三角 guards 2d.',
      7: '△3二飛 controls the square of bishop 3c along the file. Distinguish this support from the bishop’s own diagonal control.',
      15: '△8二玉 reaches the wing opposite rook 3b.',
      17: '△7二銀 places a silver beside the king.',
      19: '△5二金 joins the arrangement with king 8b and silver 7b.',
      21: '△5四歩 clears 5c.',
      23: '△6四歩 clears 6c and leaves a possible advance to 6e. Gold 5b does not directly guard 6d in this position.',
    },
    comment:
      '飛車３二・角３三、玉８二・銀７二・金５二を確認します。中央の歩は４四・５四・６四です。４四歩を動かすと角８八との道が開くため、次の比較では角交換まで進め、飛車がどの升へ取り返せるかを見ます。',
    commentEn:
      'Locate rook 3b, bishop 3c, king 8b, silver 7b and gold 5b. The central pawns stand on 4d, 5d and 6d. Moving the pawn on 4d opens the diagonal toward bishop 8h; the comparison follows the exchange through the rook’s recapture.',
    branches: [
      {
        kind: 'alt',
        moves: '4f4e 4d4e 8h3c+ 3b3c',
        notes: {
          0: '▲４五歩で角道上の歩に接触する例です。',
          1: 'この枝では△同歩と取り、４四が空きます。',
          2: '▲３三角成で角を取る応手を選びます。',
          3: '△同飛で飛車３二が３三へ取り返します。飛車による角の支えが、実際の取り返しにつながりました。',
        },
        notesEn: {
          0: '▲4五歩 challenges the pawn blocking the bishops’ diagonal.',
          1: 'This example selects △同歩, clearing 4d.',
          2: 'Sente selects ▲3三角成, capturing the bishop.',
          3: '△同飛 recaptures from 3b to 3c, demonstrating the rook’s support of the bishop square.',
        },
        comment: '角は双方の持ち駒となり、後手は歩も一枚持ちます。飛車が３三へ動いたので、元の３二の配置とは違います。交換後には双方の角打ちも加えて読みます。',
        commentEn:
          'Each side holds a bishop, and Gote also holds one pawn. The rook has moved to 3c, changing the original arrangement on 3b. Include bishop drops for both sides when continuing from the exchange.',
      },
    ],
  },
}
