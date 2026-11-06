export default {
  id: 'sankenbisha-vs-45hayashikake--sabaki',
  title: '三間飛車の捌き：４筋への接触に５筋も使う',
  titleEn: 'Third File Rook Activity: Meeting Fourth-File Contact with Fifth-File Play',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '三間飛車への４五歩早仕掛けで５筋の歩を進め、大駒の交換と再投入を考える標準的な構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手三間飛車で４五歩を取り、５筋も歩交換して５六歩へ進める。角交換後は手持ちの角を別の斜めへ打ち直す比較例を読み、相手の飛車の活動と両方を数える。',
  goalLabel: '中央の歩と角交換後の道を読む',
  goalSfen: 'lns2g1nl/1k2gsr2/pppp2bpp/6p2/5p1P1/2P1p1P2/PP1P2N1P/1BK1GS1R1/LNSG4L b 2p 1',
  rootComment:
    '先手の４五歩に向き合う後手三間飛車です。接触した４筋だけを見ず、５筋の歩も使う例を読みます。「捌き」は大駒を交換したり道を開いたりして働かせる考え方ですが、交換すれば必ず得になるわけではありません。',
  rootCommentEn:
    'Play Gote Third File Rook against ▲4五歩. Look beyond the fourth-file contact to an example using the fifth-file pawn too. Piece activity may involve exchanges and opened lines, but an exchange is not automatically profitable.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b3b 5i6h 3a4b 6h7h 5a6b 5g5f 5c5d 4i5h 6b7b 3g3f 6a5b 4g4f 7b8b 4f4e 4d4e 5f5e 5d5e 2i3g 5e5f',
    notes: {
      7: '△３二飛で三間飛車です。',
      20: '▲４五歩で先手が接触します。',
      21: 'ここでは△同歩と取る応手を選びます。４四が空いて角道が開きました。',
      22: '▲５五歩で５筋にも接触します。',
      23: '△同歩で後手が歩二枚を持ちました。',
      25: '△５六歩とさらに進めます。５七へ進む手も候補になりますが、先手の角交換や桂の跳躍にも応じる必要があります。',
    },
    notesEn: {
      7: '△3二飛 establishes Third File Rook.',
      20: '▲4五歩 creates Sente’s contact.',
      21: 'This line selects △同歩, clearing 4d and opening the bishop diagonal.',
      22: '▲5五歩 creates contact on the fifth file too.',
      23: '△同歩 gives Gote two pawns in hand.',
      25: '△5六歩 advances again, with a possible future move to 5g. Sente’s bishop exchange and knight jumps still require replies.',
    },
    comment:
      '後手歩は４五と５六に進み、先手桂は３七です。後手玉８二の隣にはまだ銀がいないので、囲いが完成した図としては扱いません。中央の接触と自玉の守りの両方を見ます。',
    commentEn:
      'Gote’s pawns have reached 4e and 5f, with Sente’s knight on 3g. No silver has joined Gote’s king on 8b yet, so this is not a completed castle. Inspect both the central contact and the king’s defenders.',
    branches: [
      {
        kind: 'alt',
        moves: '8h3c+ 4b3c 3g4e 5f5g+ P*5c 5g5h 6i5h 5b5c 4e3c+ 3b3c',
        notes: {
          0: '角交換から、５筋の歩を成る別の比較を読みます。',
          2: '▲４五桂で歩を取り、先手にも歩の持ち駒ができました。銀３三への当たりもあります。',
          3: '△５七歩成で金５八へ当てます。銀３三への当たりは残した比較です。',
          4: '▲５三歩打は金５二に当たりますが、自分の金５八への当たりを消しません。',
          5: '△５八とで金を取ります。５三歩を取る手だけが候補ではありません。',
          6: '▲同金で６九の金がと金を取り返す応手を選びます。',
          7: '△５三金で打った歩も取ります。',
          8: '▲３三桂成△同飛まで、残っていた銀への当たりも数えます。',
        },
        notesEn: {
          0: 'After the bishop exchange, compare promoting the fifth-file pawn.',
          2: '▲4五桂 captures a pawn, giving Sente a pawn in hand and attacking silver 3c.',
          3: '△5七歩成 attacks gold 5h while leaving the attack on silver 3c unresolved.',
          4: '▲5三歩打 attacks gold 5b but does not remove the attack against Sente’s own gold on 5h.',
          5: '△5八と captures the gold. Capturing the pawn on 5c was not Gote’s only candidate.',
          6: 'This branch selects ▲同金, recapturing the tokin with the gold from 6i.',
          7: '△5三金 also captures the dropped pawn.',
          8: 'Continue through ▲3三桂成 △同飛 to count the still-pending attack on Gote’s silver.',
        },
        comment:
          '後手は金を取りましたが、銀３三も取られています。先手は角・銀・歩、後手は角・金・桂と歩三枚を持ちます。５三への歩打ちで相手の当たりが消えると思い込まず、双方の駒取りを最後まで数える例です。',
        commentEn:
          'Gote captured a gold but also lost silver 3c. Sente holds a bishop, silver and pawn; Gote holds a bishop, gold, knight and three pawns. The pawn drop on 5c did not erase the opposing threat: count both sides’ captures through the end.',
      },
      {
        kind: 'alt',
        moves: '8h3c+ 4b3c 3g4e B*4d 4e3c+ 3b3c 2e2d 2c2d 2h2d 4d9i+',
        notes: {
          0: '先手が角を交換する応手を比較します。',
          1: '△同銀で双方が角を持ちました。',
          2: '▲４五桂で後手歩を取り、銀３三へ当てます。',
          3: 'この例では△４四角打と別の斜めを使います。５五・６六・７七・８八を通って香９九へ利きます。銀３三への当たりは残っています。',
          4: '▲３三桂成で先に銀を取る応手を選びます。',
          5: '△同飛で後手が桂を取り返します。２四を守っていた銀３三は、これで盤上から消えました。',
          6: '▲２四歩から歩を取り合う順へ進みます。',
          8: '▲同飛で先手飛車も２四へ出ます。今は銀３三による取り返しはありません。',
          9: '△９九角成で香を取って馬になります。',
        },
        notesEn: {
          0: 'Compare Sente choosing the bishop exchange.',
          1: '△同銀 gives each side a bishop in hand.',
          2: '▲4五桂 captures Gote’s pawn and attacks silver 3c.',
          3: 'This example drops △4四角 on another diagonal, reaching lance 9i through 5e, 6f, 7g and 8h. The attack on silver 3c remains unresolved.',
          4: 'Sente first selects ▲3三桂成, capturing the silver.',
          5: '△同飛 recaptures the knight and removes the silver that previously guarded 2d.',
          6: 'Now continue with ▲2四歩 and the pawn exchange.',
          8: '▲同飛 activates Sente’s rook on 2d without an immediate silver recapture from 3c.',
          9: '△9九角成 captures the lance and promotes to a horse.',
        },
        comment:
          '後手馬９九と先手飛車２四ができた比較例です。先手は角・銀と歩二枚、後手は桂・香と歩三枚を持ちます。後手飛車は桂を取り返して３三へ進みました。馬ができた一手だけで優勢とはせず、次の駒取りまで読んでください。',
        commentEn:
          'This comparison leaves Gote’s horse on 9i and Sente’s rook on 2d. Sente holds a bishop, silver and two pawns; Gote holds a knight, lance and three pawns. Gote’s rook has recaptured on 3c. Making a horse alone is not a claim of advantage: read the next captures too.',
      },
    ],
  },
}
