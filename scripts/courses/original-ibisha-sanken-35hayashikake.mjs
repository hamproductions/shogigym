export default {
  id: 'ibisha-vs-sankenbisha--35hayashikake',
  title: '三間飛車への３五歩：左銀を使う早仕掛け',
  titleEn: '▲3五歩 against Third File Rook: An Early Attack with the Left Silver',
  myStrategy: 'ibisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source: '三間飛車に対する３五歩早仕掛けの標準的な歩と左銀の配置から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手は左銀を６八・５七から４六へ運ぶ。３五歩で後手の３四歩に接触し、後手が銀４三を足す場合、歩を取る場合、別の筋を動かす場合を比べる。右銀４八は自陣に残る。',
  goalLabel: '３筋の応手と左銀の進路を読む',
  goalSfen: 'ln1g3nl/1ks1g1r2/ppp2sbpp/3pppp2/6PP1/2P1PS3/PP1P1P2P/1BKGGS1R1/LN5NL w - 1',
  rootComment:
    '三間飛車の角３三の前にある３四の歩へ、▲３五歩と接触します。攻めに使う銀は右銀ではなく、７九から６八・５七へ運んだ左銀です。相手が歩を取ったかどうかで、３五の升を誰が占めるかを確認してください。',
  rootCommentEn:
    'Use ▲3五歩 to challenge the pawn on 3d in front of Gote’s bishop on 3c. The attacking silver is the left silver from 7i, developed through 6h and 5g; the right silver remains on 4h. Track who occupies 3e after Gote’s reply.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b3b 5g5f 3a4b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 6i6h 6c6d 3g3f 5c5d 3f3e',
    notes: {
      5: '△３三角で２四を守ってから、後手は飛車を３二へ振ります。',
      16: '▲６八銀。玉が７八へ移った後の６八を左銀が使います。',
      18: '▲５七銀。５六歩で空けた５七へ銀を進めました。',
      22: '▲３六歩で３五歩の準備です。',
      24: '▲３五歩で３四の後手歩に当てます。後手が取れば３五の先手歩は消えるため、そのあとの銀の進路も変わります。',
    },
    notesEn: {
      5: 'Gote first defends 2d with △3三角, then swings the rook to 3b.',
      16: '▲6八銀 uses the square the king vacated on its way to 7h.',
      18: '▲5七銀 enters the square cleared by ▲5六歩.',
      22: '▲3六歩 prepares the push to 3e.',
      24: '▲3五歩 challenges Gote’s pawn on 3d. If Gote captures, Sente’s pawn leaves 3e, changing the silver’s route afterward.',
    },
    branches: [
      {
        kind: 'main',
        moves: '4b4c 5g4f',
        notes: {
          0: '△４三銀で後手が守りを足す例です。３四の歩はまだ取っていません。',
          1: '▲４六銀。左銀が攻めに加わります。ただし３五には自分の歩がいるので、今すぐ▲３五銀とは進めません。',
        },
        notesEn: {
          0: 'Gote develops △4三銀 without capturing the pawn on 3e.',
          1: '▲4六銀 brings the left silver into the attack. Sente’s own pawn still occupies 3e, so ▲3五銀 is not currently available.',
        },
        comment:
          '先手銀４六と歩３五、後手銀４三と歩３四が残っています。早仕掛けは、この接点から相手の応手を読んで続ける作戦です。銀が出ただけで攻めの成功が確定するわけではありません。',
        commentEn:
          'Sente has a silver on 4f and pawn on 3e; Gote has a silver on 4c and pawn on 3d. Continue reading from this contact. Developing the silver alone does not prove that the attack has succeeded.',
      },
      {
        kind: 'alt',
        moves: '3d3e 2e2d 2c2d 5g4f 4b4c 4f3e',
        notes: {
          0: '後手が△同歩と取る比較例です。３五には後手の歩が残ります。',
          1: '▲２四歩で２筋にも接触を作ります。この枝では後手が歩で取る応手を選びます。',
          3: '▲４六銀で左銀を出します。',
          5: '▲３五銀で後手歩を取りました。歩を交換して空いた３五へ銀を運んだ形です。',
        },
        notesEn: {
          0: 'For comparison, △同歩 leaves Gote’s pawn on 3e.',
          1: '▲2四歩 creates contact on the second file too. This branch selects Gote’s pawn capture.',
          3: '▲4六銀 develops the left silver.',
          5: '▲3五銀 captures Gote’s pawn, using the square opened by the exchange.',
        },
        comment:
          '３筋と２筋で歩を渡す順でも、手持ちの歩と盤上の銀を分けて数えます。銀３五の次の候補は、後手の角３三・銀４三・歩４四の配置を見て選びます。選んだ応手の一例であり、強制的な勝ち手順ではありません。',
        commentEn:
          'Count the pawns in hand separately from the developed silver after the two pawn contacts. Choose the next move with Gote’s bishop on 3c, silver on 4c and pawn on 4d in view. This is a selected continuation, not a forced winning sequence.',
      },
      {
        kind: 'alt',
        moves: '4d4e 8h3c+ 2a3c 2e2d 2c2d 2h2d',
        notes: {
          0: '後手が△４五歩と進める別の応手です。４四が空き、角８八から３三への道が開きます。',
          1: '▲３三角成で角を取り、△同桂で角交換になります。',
          3: '▲２四歩で飛車先にも接触します。この枝は後手が歩で取る応手を選びます。',
          5: '▲同飛で飛車を２四へ出しました。銀５七と歩３五は残り、銀４六の枝とは配置が違います。',
        },
        notesEn: {
          0: 'Another reply is △4五歩, clearing 4d and opening the bishop diagonal from 8h to 3c.',
          1: '▲3三角成 and △同桂 exchange bishops.',
          3: '▲2四歩 creates rook-file contact. This branch selects Gote’s pawn capture.',
          5: '▲同飛 activates the rook on 2d. The silver remains on 5g and pawn on 3e, unlike the silver-on-4f branch.',
        },
        comment:
          '先手飛車２四と後手桂３三、双方の角の持ち駒を確認します。角道を開いた応手に合わせて角を交換した結果、２四を守っていた角３三が盤上から消えました。相手の次の角打ちも読む必要があります。',
        commentEn:
          'Locate Sente’s rook on 2d, Gote’s knight on 3c and both bishops in hand. The response opening the diagonal allowed the bishop exchange, removing the bishop that guarded 2d. Gote’s possible bishop drops still need to be read.',
      },
      {
        kind: 'deviation',
        moves: '6d6e 3e3d 3c2b 5g4f',
        notes: {
          0: '後手が３筋をそのままにして６筋の歩を進める例です。',
          1: '▲３四歩で歩を取り、３三の角に当てます。',
          2: 'この例では角を２二へ引きます。',
        },
        notesEn: {
          0: 'This example leaves the third-file contact unresolved while Gote advances the sixth-file pawn.',
          1: '▲3四歩 captures the pawn and attacks the bishop on 3c.',
          2: 'Gote chooses to retreat the bishop to 2b.',
        },
        comment:
          '後手が歩を取らない枝では、先手歩が３四まで進みました。歩を取る枝の銀３五と比べ、同じ３五歩の出発点でも盤上に残る駒が違うことを確かめてください。',
        commentEn:
          'When Gote leaves the pawn contact unresolved, Sente’s pawn reaches 3d. Compare it with the silver on 3e in the capture branch: the same initial push can leave different pieces on the board.',
      },
    ],
  },
}
