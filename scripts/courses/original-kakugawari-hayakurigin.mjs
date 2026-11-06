export default {
  id: 'kakugawari--hayakurigin',
  title: '角換わり早繰り銀：３五から２四への交換',
  titleEn: 'Bishop Exchange Fast Silver: From 3e to an Exchange on 2d',
  myStrategy: 'kakugawari',
  opponentStrategy: 'kakugawari',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '通常の角換わり早繰り銀の銀３七・４六と、３筋・２筋の連続した歩交換の標準的な構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '右銀を３八・３七・４六へ運び、３五歩の交換後に３五銀と出る。後手の３四歩打に対し、２四歩から双方の銀を交換し、飛車を２四へ進める比較枝を読む。',
  goalLabel: '銀が移る升と次の取り返しを読む',
  goalSfen: 'ln1g3nl/1r3kg2/p1p1ppspp/3ps4/1p4SP1/2P6/PPSPPP2P/2GK3R1/LN3G1NL w BPbp 1',
  rootComment:
    '早繰り銀では、右銀を３七から４六へ出し、３筋で歩を交換します。２六へ進む棒銀と進路を比べてください。角換わりなので双方が角を持ち、銀を前へ出しても角打ちへの注意は続きます。',
  rootCommentEn:
    'Fast Silver develops the right silver through 3g to 4f and exchanges pawns on the third file. Compare this route with Climbing Silver’s advance to 2f. Both sides hold bishops after the exchange, so bishop drops remain relevant as the silver advances.',
  line: {
    moves: '2g2f 8c8d 7g7f 4a3b 2f2e 8d8e 8h7g 3c3d 7i8h 2b7g+ 8h7g 3a2b 6i7h 2b3c 3i3h 7a6b 3g3f 6c6d 3h3g 6b6c 3g4f 6c5d 5i6h 5a4b 3f3e 3d3e 4f3e',
    notes: {
      16: '▲３六歩で３七を空けます。',
      18: '▲３七銀。２七ではなく３七を経由します。',
      20: '▲４六銀で３五と５五へ利かせます。',
      21: '後手銀は６二・６三から５四へ進みました。もう一枚の銀は３三です。',
      24: '▲３五歩で接触します。この例は△同歩と取る応手を続けます。',
      26: '▲同銀で３五へ進み、歩を一枚持ちました。後手銀３三は２四を守っています。',
    },
    notesEn: {
      16: '▲3六歩 clears 3g.',
      18: '▲3七銀 uses 3g rather than Climbing Silver’s 2g route.',
      20: '▲4六銀 controls 3e and 5e.',
      21: 'Gote’s other silver has developed through 6b and 6c to 5d. The defensive silver remains on 3c.',
      24: '▲3五歩 creates contact. This example continues with △同歩.',
      26: '▲同銀 reaches 3e and gains a pawn in hand. Gote’s silver on 3c still guards 2d.',
    },
    comment:
      '先手銀３五、後手銀３三と５四を確認します。双方に角と歩の持ち駒があります。３五の銀は２四にも動けますが、２三の歩と３三銀の取り返しまで含めて読む必要があります。',
    commentEn:
      'Locate Sente’s silver on 3e and Gote’s silvers on 3c and 5d. Both sides hold a bishop and pawn. The silver on 3e can reach 2d, but read the pawn on 2c and silver on 3c as potential recaptures.',
    branches: [
      {
        kind: 'alt',
        moves: 'P*3d 2e2d 2c2d 3e2d 3c2d 2h2d',
        notes: {
          0: '△３四歩打は銀３五への当たりです。',
          1: 'この例では銀を引かず▲２四歩と接触します。以下の取り合いは選んだ応手です。',
          2: '後手が歩で取る例です。銀で取る応手は別の順になります。',
          3: '▲同銀に△同銀で、先手の右銀が取られます。',
          5: '▲同飛で後手銀も取り、双方が銀を一枚ずつ持ちました。',
        },
        notesEn: {
          0: '△3四歩打 attacks the silver on 3e.',
          1: 'This example creates contact with ▲2四歩 rather than retreating the silver. The following captures are selected replies.',
          2: 'Gote chooses the pawn capture. A silver capture gives a different move order.',
          3: '▲同銀 and △同銀 remove Sente’s right silver.',
          5: '▲同飛 also captures Gote’s silver. Both sides now hold one silver.',
        },
        comment:
          '先手の持ち駒は角・銀・歩二枚、後手は角・銀・歩一枚です。飛車２四と後手銀５四が盤上に残ります。銀交換だけで攻めの成功とは決めず、次の歩打ちや角打ちと飛車の退路を確認します。',
        commentEn:
          'Sente holds a bishop, silver and two pawns; Gote holds a bishop, silver and one pawn. The rook on 2d and Gote’s silver on 5d remain on the board. The exchange alone does not prove a successful attack: examine pawn drops, bishop drops and the rook’s retreat squares.',
        branches: [
          {
            kind: 'alt',
            moves: 'P*2c 2d3d 8b8d B*1e 4b5b S*3c 3b3c 1e3c+',
            notes: {
              0: '△２三歩打で飛車へ当てます。',
              1: '▲３四飛で後手歩を取り、別の筋へ移る例です。',
              2: '後手が飛車を８四へ出す応手を選びます。',
              3: '▲１五角打は２四・３三を通る玉４二への王手です。２四へ打つと歩２三に取られるため、その升を避けます。',
              4: 'この例では△５二玉と避けます。',
              5: '▲３三銀打。交換で手に入れた銀を使い、金３二へ当てます。角１五と飛車３四が銀を守っています。',
              6: '△同金と銀を取る応手には、▲同角成で金を取ります。',
            },
            notesEn: {
              0: '△2三歩打 attacks the rook.',
              1: 'This example chooses ▲3四飛, capturing Gote’s pawn and changing files.',
              2: 'Gote chooses to develop the rook to 8d.',
              3: '▲1五角打 checks king 4b through 2d and 3c. A drop on 2d would instead be captured by pawn 2c.',
              4: 'This reply moves the king to 5b.',
              5: '▲3三銀打 reuses the acquired silver to attack gold 3b. Both bishop 1e and rook 3d protect the silver.',
              6: 'This example answers △同金 with ▲同角成, capturing the gold.',
            },
            comment:
              '先手は飛車３四と馬３三で３筋へ利かせ、金と歩三枚を持っています。後手は角と銀二枚を持ちます。相手が銀を金で取る応手を選んだ交換例であり、銀打ちから金取りまでを常に強制できるとはしていません。',
            commentEn:
              'Sente’s rook on 3d and horse on 3c act on the third file, with a gold and three pawns in hand. Gote holds a bishop and two silvers. This selects Gote’s gold capture rather than claiming the silver drop always forces the exchange.',
          },
        ],
      },
    ],
  },
}
