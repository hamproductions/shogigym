export default {
  id: 'ibisha-vs-gokigen--chousoku',
  title: '超速２枚銀：４六と６六から５五を調べる',
  titleEn: 'Chousoku Two Silvers: Examine 5e from 4f and 6f',
  myStrategy: 'ibisha',
  opponentStrategy: 'nakabisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    'ゴキゲン中飛車に対する超速３七銀と２枚銀の標準的な配置から独立して構成。新ペタショック定跡（MIT）で候補手を参照し、説明はこのアプリのために書き下ろし。',
  goalFormation:
    '先手の右銀４六と左銀６六が５五の後手歩に利く。後手銀４四も５五を守るため、銀を一枚進めたあとの取り返しまで数える。角８八の道は左銀６六の移動で変わる。',
  goalLabel: '２枚の銀と角の利きが重なる順を読む',
  goalSfen: 'ln1g3nl/1ks1r1g2/pppp1pbpp/5sp2/4p2P1/2PS1SP2/PP1PPP2P/1BK1G2R1/LN1G3NL b - 1',
  rootComment:
    '先手の居飛車で、後手の５五歩へ２枚の銀を向けます。右銀は４八・３七・４六、左銀は６八・７七・６六へ進めます。銀の数だけで有利と決めず、後手銀４四による取り返しと、左銀が動いた後の角道を確認しましょう。',
  rootCommentEn:
    'As Sente, develop two silvers toward Gote’s pawn on 5e. The right silver travels through 4h and 3g to 4f; the left travels through 6h and 7g to 6f. Count the recapture by Gote’s silver on 4d and the bishop line opened by the left silver, rather than declaring an advantage from the number of silvers alone.',
  line: {
    moves: '2g2f 3c3d 7g7f 5c5d 2f2e 8b5b 3i4h 5d5e 3g3f 2b3c 4h3g 3a4b 3g4f 4b5c 5i6h 5c4d 6h7h 5a6b 7i6h 6b7b 6h7g 7b8b 7g6f 7a7b 4i5h 4a3b',
    notes: {
      5: '△５二飛で後手が中飛車に構えました。先手は飛車を２八に置いたまま銀を使います。',
      8: '▲３六歩で３七を空けます。右銀が４八から３七へ進むための手です。',
      12: '▲４六銀。５五の歩へ利きます。後手は銀を５三から４四へ進めて対抗します。',
      15: '△４四銀で５五の後手歩に銀の守りが付きました。先手銀４六だけを見て歩がただで取れるとは判断できません。',
      18: '▲６八銀。玉が７八へ動いて空けた６八を、左銀の道として使います。',
      20: '▲７七銀。７六へ進めた歩の後ろに銀が入りました。',
      22: '▲６六銀。４六と６六の銀がともに５五へ利く、２枚銀の配置です。６六の銀は８八の角道を途中で止めてもいます。',
      24: '▲５八金で玉７八の近くに守りを足します。攻めの銀２枚と、玉を守る金の役割を分けて見ます。',
    },
    notesEn: {
      5: '△5二飛 establishes Central Rook. Sente keeps the rook on 2h and develops the silvers.',
      8: '▲3六歩 clears 3g for the silver coming from 4h.',
      12: '▲4六銀 attacks the pawn on 5e. Gote brings its silver through 5c to 4d to meet it.',
      15: '△4四銀 protects Gote’s pawn on 5e. The presence of Sente’s silver on 4f alone does not make that pawn free.',
      18: '▲6八銀 uses the square vacated when the king moved to 7h as a route for the left silver.',
      20: '▲7七銀 develops behind the pawn that advanced to 7f.',
      22: '▲6六銀 completes the two-silver placement: both silvers control 5e. The silver on 6f also blocks the bishop’s diagonal from 8h.',
      24: '▲5八金 adds a defender near the king on 7h. Distinguish the attacking silvers from the gold’s defensive role.',
    },
    comment:
      '銀４六・６六、後手銀４四、歩５五を確認します。左銀が５五へ進むと６六が空き、８八の角から５五への斜めの道が開きます。次の枝は、その変化を実際の捕獲で確かめる例です。',
    commentEn:
      'Locate Sente’s silvers on 4f and 6f, Gote’s silver on 4d, and the pawn on 5e. Moving the left silver to 5e clears 6f and opens the bishop’s diagonal from 8h. The branches test that change with actual captures.',
    branches: [
      {
        kind: 'alt',
        moves: '2e2d 3c2d 6f5e 4d5e 8h5e',
        notes: {
          0: '▲２四歩で２三の歩にぶつけます。後手が角で取る応手を比較します。',
          1: '△同角で角が３三から２四へ移りました。この例では歩で取る応手ではありません。',
          2: '▲５五銀で左銀が歩を取り、６六を空けます。',
          4: '△同銀に▲同角。左銀が空けた６六を通り、角が８八から５五へ出ました。',
        },
        notesEn: {
          0: '▲2四歩 challenges the pawn on 2c. Compare Gote’s bishop capture.',
          1: '△同角 moves the bishop from 3c to 2d. This example uses the bishop capture rather than a pawn capture.',
          2: '▲5五銀 captures with the left silver and clears 6f.',
          4: 'After △同銀, ▲同角 brings the bishop from 8h to 5e through the cleared 6f square.',
        },
        comment:
          '歩を２四へ進めた枝では、後手角が２四、先手角が５五にいます。後手の２三歩が角２四を守るため、▲２四飛と角を取っても△同歩と取り返されます。角の位置だけでなく、その後ろの歩も数えてください。',
        commentEn:
          'After the 2d pawn challenge, Gote’s bishop stands on 2d and Sente’s on 5e. Gote’s pawn on 2c protects the bishop on 2d, so ▲2四飛 can be met by △同歩. Count the pawn behind the bishop as well as the bishop itself.',
      },
      {
        kind: 'deviation',
        moves: '6f5e 4d5e 4f5e 3c5e 8h5e 5b5e',
        notes: {
          0: '角３三を残したままの▲５五銀は弱い接触です。',
          1: '△同銀▲同銀だけで止めず、後手角と飛車の取り返しまで読みます。',
          3: '△同角で後手角が銀５五を取ります。',
          4: '▲同角と取り返す応手を選ぶと、△同飛が残ります。',
        },
        notesEn: {
          0: '▲5五銀 is a weak contact while the bishop remains on 3c.',
          1: 'Continue beyond △同銀 ▲同銀 to include Gote’s bishop and rook.',
          3: '△同角 captures silver 5e.',
          4: 'If Sente chooses ▲同角, △同飛 remains.',
        },
        comment:
          '先手は銀二枚と角を失い、後手は銀と角を失っています。先手銀５五を角８八が守っていても、後手の角３三と飛車５二が順に取り返せるため、それだけでは安全な進出になりません。角が２四へ動いた別の枝と守備駒の違いを比べます。',
        commentEn:
          'Sente has lost two silvers and a bishop; Gote has lost a silver and bishop. Bishop 8h’s support does not make silver 5e safe against successive recaptures by bishop 3c and rook 5b. Compare the defenders with the separate branch where Gote’s bishop moved to 2d.',
      },
      {
        kind: 'deviation',
        moves: '6f5e 4d5e 4f5e 5b5e 8h5e 3c5e',
        notes: {
          0: '同じ▲５五銀の誤りから、後手が飛車で取り返す別の比較です。',
          3: '後手がさらに△同飛と銀を取る比較例です。飛車が５五へ出た後に、先手の角がその升へ届くかを調べます。',
          4: '▲同角で飛車を取ります。６六と７七が空いているため、８八から５五まで角が通ります。',
          5: '△同角で後手の角も３三から５五へ通り、先手角を取り返します。４四の後手銀は交換済みなので、この斜めの道が開いています。',
        },
        notesEn: {
          0: 'From the same mistaken ▲5五銀, compare Gote’s alternative rook recapture.',
          3: 'For comparison, Gote goes on to capture the silver with △同飛. Check whether Sente’s bishop reaches 5e after the rook arrives.',
          4: '▲同角 captures the rook. The cleared squares 7g and 6f let the bishop travel from 8h to 5e.',
          5: '△同角 recaptures with Gote’s bishop from 3c. The earlier silver exchange cleared 4d, opening this diagonal to 5e.',
        },
        comment:
          '後手角５五をすぐ取り返す合法手はありません。先手の持ち駒は飛車・銀・歩、後手は角・銀２枚で、盤上には後手角５五が残ります。先手は銀２枚と角を失い、後手は銀と飛車を失いました。飛車を取った瞬間で止めず、相手の角の取り返しまで数えて判断します。',
        commentEn:
          'Sente has no immediate legal recapture of the bishop on 5e. Sente holds a rook, silver and pawn; Gote holds a bishop and two silvers, with another Gote bishop on 5e. Sente lost two silvers and a bishop, while Gote lost a silver and rook. Count the final bishop recapture rather than stopping when the rook is taken.',
      },
    ],
  },
}
