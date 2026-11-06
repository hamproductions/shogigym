export default {
  id: 'ibisha-vs-hayaishida--42gyoku',
  title: '早石田への４二玉：王手の線を外して中央を整える',
  titleEn: '△4二玉 against Haya-Ishida: Leave the Checking Diagonal and Develop',
  myStrategy: 'ibisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '早い７五歩に対する４二玉と、通常の石田流に対する中央の配置を独立して構成。新ペタショック定跡（MIT）で序盤候補を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手は先手の７五歩に４二玉と動いてから、石田流の浮き飛車に備える。銀６三が７四を守り、歩６五は次の６六への接触を作る。玉の移動と、中央の駒の利きを別々に確認する。',
  goalLabel: '王手の線と歩の接触を確認する',
  goalSfen: 'ln4gnl/1r2gsk2/p1psppbpp/6p2/1pPp5/2RP5/PPNSPPPPP/1B2G1SK1/L4G1NL b - 1',
  rootComment:
    '７五歩を見た後手が、飛車先を急ぐ前に玉を４二へ動かす順です。９五の角から５一へ通る斜めの線に、玉が残るかどうかをまず確認します。そのあと相手が角道を閉じた場合は、浮き飛車と中央の歩に備える配置を作ります。',
  rootCommentEn:
    'After ▲7五歩, Gote moves the king to 4b before rushing the rook pawn. First inspect whether the king remains on the diagonal from 9e to 5a. If Sente closes the bishop line, develop against the floating rook and the central pawns.',
  line: {
    moves: '7g7f 3c3d 7f7e 5a4b',
    notes: {
      3: '△４二玉。９五から８四・７三・６二を通る斜めの終点は５一です。玉が４二へ移ると、その線上の王手ではなくなります。すべての角打ちを防ぐという意味ではありません。',
    },
    notesEn: {
      3: '△4二玉 leaves the diagonal from 9e through 8d, 7c and 6b to 5a. A bishop on that line would no longer check this king. The move does not prevent every bishop drop.',
    },
    branches: [
      {
        kind: 'main',
        moves: '6g6f 8c8d 2h7h 8d8e 7h7f 7a6b 5i4h 6c6d 4h3h 6b6c 6i5h 4b3b 3h2h 3a4b 3i3h 4a3a 8i7g 2b3c 7i6h 6a5b 6h6g 6d6e',
        notes: {
          0: '▲６六歩で角道が閉じました。早い角交換を使う枝とは違う配置へ進みます。',
          4: '▲７六飛で先手が浮き飛車に構えます。後手は８筋の飛車を維持します。',
          9: '△６三銀。７四へ斜めに利くため、先手の７筋の歩を動かす候補に備える駒です。',
          11: '△３二玉で玉をさらに動かします。中央の銀６三と玉３二は別の役割を持ちます。',
          15: '△３一金。玉３二の後ろを金で守ります。',
          17: '△３三角。４四・５五を通って６六の先手歩へ利きます。',
          21: '△６五歩で６六の歩と向かい合います。６五歩が次に６六へ進めば、先手の歩を取る接触です。銀６三の７四への利きは、この歩を突く前からありました。',
        },
        notesEn: {
          0: '▲6六歩 closes the bishop diagonal, creating a different position from the early bishop-exchange branch.',
          4: '▲7六飛 establishes Sente’s floating rook. Gote keeps the rook on the eighth file.',
          9: '△6三銀 controls 7d diagonally, relevant when Sente considers moving the seventh-file pawn.',
          11: '△3二玉 develops the king further. The king and the silver on 6c have different jobs.',
          15: '△3一金 protects the king on 3b from behind.',
          17: '△3三角 reaches Sente’s pawn on 6f through 4d and 5e.',
          21: '△6五歩 faces the pawn on 6f and prepares a possible capture there. The silver on 6c already controlled 7d before this pawn advance.',
        },
        comment:
          '先手の６六歩、６七銀、７六飛に対し、後手は６五歩、６三銀、３三角です。歩を交換すると、角の途中の升や銀の取り返し方が変わります。４二玉の一手で序盤が終わるわけではなく、その後の配置も読む練習です。',
        commentEn:
          'Compare Sente’s pawn on 6f, silver on 6g and rook on 7f with Gote’s pawn on 6e, silver on 6c and bishop on 3c. A pawn exchange changes the bishop’s route and the silver’s recaptures. △4二玉 starts the plan; it does not replace reading the later position.',
        branches: [
          {
            kind: 'alt',
            moves: '1g1f 8e8f 7f8f',
            notes: {
              0: '先手が▲１六歩を選ぶ比較です。',
              1: '△８六歩で８筋に接触します。',
              2: '▲同飛で先手飛車が８六へ移ります。',
            },
            notesEn: {
              0: 'This comparison selects ▲1六歩.',
              1: '△8六歩 creates eighth-file contact.',
              2: '▲同飛 brings Sente’s rook to 8f.',
            },
            comment:
              '飛車８二と先手飛車８六が同じ筋です。飛車を９二へ逃がすだけでは、桂８一が先手飛車の前に残ります。ここは飛車を交換する応手と、その桂を失う退避を分けます。',
            commentEn:
              'The rooks on 8b and 8f share a file. Simply retreating to 9b leaves knight 8a exposed to Sente’s rook. Compare exchanging rooks with that retreat.',
            branches: [
              {
                kind: 'alt',
                moves: '8b8f 8g8f 7c7d 7e7d 6c7d',
                notes: {
                  0: '△同飛で飛車を取り、▲同歩まで交換します。',
                  2: '△７四歩で今度は７筋に接触します。',
                  4: '▲同歩△同銀で後手銀が７四へ進みます。飛車は双方の持ち駒なので、先手飛車７六から銀を取る配置ではありません。',
                },
                notesEn: {
                  0: '△同飛 ▲同歩 exchanges rooks.',
                  2: '△7四歩 creates contact on the seventh file.',
                  4: '▲同歩 △同銀 develops Gote’s silver to 7d. Both rooks are now in hand; there is no Sente rook on 7f that can capture this silver.',
                },
                comment:
                  '８筋の飛車交換と７筋の歩交換を分けて読みました。後手銀７四は次の７五歩打を守る配置です。ただし、歩を打つ狙いは相手が飛車をどこへ置くかで変わります。',
                commentEn:
                  'Separate the eighth-file rook exchange from the seventh-file pawn exchange. Silver 7d guards a possible pawn drop on 7e, whose purpose depends on where the opposing rook is placed.',
                branches: [
                  {
                    kind: 'deviation',
                    moves: 'R*7f P*7e 7f7e 7d7e',
                    comment:
                      '▲７六飛打は自分の歩６六・８六と桂７七に囲まれる誤りです。△７五歩打で飛車へ当てると、▲同飛には△同銀と取り返せます。銀７四が歩を守ることに加え、飛車が横へ逃げる６六・８六と下の７七を自分の駒が塞いでいることを確認します。この選んだ取り合いの最後に、後手は飛車二枚を持ちます。',
                    commentEn:
                      '▲7六飛打 is a mistake: Sente’s own pawns on 6f and 8f and knight on 7g restrict the rook. △7五歩打 attacks it, and ▲同飛 permits △同銀. Count both silver 7d’s support and the rook’s own blockers on 6f, 8f and 7g. At the end of this selected exchange, Gote holds both rooks.',
                  },
                ],
              },
              {
                kind: 'deviation',
                moves: '8b9b 8f8a+ 9b7b',
                comment:
                  '△９二飛は飛車自体を香９一で守っても、桂８一を守れない誤りです。▲８一飛成で桂を取られます。龍８一は飛車９二へも斜め一升で当たるため、この例では△７二飛と銀６三に守られる升へ逃げます。退避先だけでなく、元の飛車が守っていた駒も確認します。',
                commentEn:
                  '△9二飛 is a mistake even though lance 9a guards the rook: it leaves knight 8a undefended. ▲8一飛成 captures that knight. Dragon 8a also attacks rook 9b with its one-square diagonal move, so this selects △7二飛, guarded by silver 6c. Check the piece previously protected by the rook as well as the rook’s destination.',
              },
            ],
          },
        ],
      },
      {
        kind: 'alt',
        moves: '2h7h 2b8h+ 7i8h B*4e',
        notes: {
          0: '先手が角道を閉じずに▲７八飛と振る比較例です。',
          1: '△８八角成で角を交換します。玉４二は、９五から５一へ向かう斜めにはいません。',
          3: '△４五角と打つ例です。角は５六を通って６七の歩へ、３六を通って２七の歩へ利きます。',
        },
        notesEn: {
          0: 'For comparison, Sente ranges with ▲7八飛 without closing the bishop diagonal.',
          1: '△8八角成 exchanges bishops. Gote’s king on 4b is off the diagonal from 9e to 5a.',
          3: 'The example △4五角 reaches the pawn on 6g through 5f and the pawn on 2g through 3f.',
        },
        comment:
          '角を交換したあとにも、持ち角の使い場所を調べます。４五の角が二つの歩を狙っていても、先手に受けがないとまでは判断していません。玉を移した目的と、角打ちへの応手を分けて読んでください。',
        commentEn:
          'After the exchange, inspect possible bishop drops. The bishop on 4e attacks two pawns, but this lesson does not claim that Sente has no defense. Separate the purpose of moving the king from the replies to the bishop drop.',
      },
    ],
  },
}
