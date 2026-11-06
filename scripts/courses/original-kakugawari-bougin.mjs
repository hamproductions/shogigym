export default {
  id: 'kakugawari--bougin',
  title: '角換わり棒銀：端の交換と飛車の退路',
  titleEn: 'Bishop Exchange Climbing Silver: Edge Exchanges and a Rook Retreat',
  myStrategy: 'kakugawari',
  opponentStrategy: 'kakugawari',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '通常の角換わり棒銀の銀２七・２六と端歩交換の標準的な構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation: '通常の角換わりから右銀２六と歩１六を用意する。比較枝で銀と香の交換、飛車によると金の除去、取った香と桂の中央への打ち直しを読む。',
  goalLabel: '端攻めの前に銀・香・角の持ち駒を読む',
  goalSfen: 'ln1g2knl/1r4g2/p1psppsp1/3p2p1p/1p5P1/2P3PSP/PPSPPP3/2GK3R1/LN3G1NL b Bb 1',
  rootComment:
    '角交換後に右銀を３八・２七・２六へ進めます。２筋だけでなく１五歩からの端の接触も候補です。端へ銀を出すと香で取られることがあるため、一手目の捕獲だけでなく香の取り返しまで数えます。',
  rootCommentEn:
    'After the bishop exchange, develop the right silver through 3h and 2g to 2f. Contact with ▲1五歩 is a candidate alongside play on the second file. A silver entering the edge may be captured by a lance; count the full exchange rather than only the first capture.',
  line: {
    moves: '2g2f 8c8d 7g7f 8d8e 8h7g 4a3b 7i8h 3c3d 2f2e 2b7g+ 8h7g 3a2b 6i7h 2b3c 3i3h 7a6b 3h2g 6c6d 2g2f 1c1d 1g1f 6b6c 3g3f 5a4b 5i6h 4b3a',
    notes: {
      9: '△７七角成で先に後手だけが角を持ちました。次の▲同銀で双方の角交換が完了します。',
      12: '▲７八金で銀７七を守り、角を持ったあとの駒組みを進めます。',
      18: '▲２六銀。２五歩の後ろへ右銀を出しました。',
      20: '▲１六歩で１五への接触を用意します。',
      22: '▲３六歩で３七が空きます。後手の角打ちに対し、空いた升が通り道にもなることに注意します。',
      24: '▲６八玉で玉を動かしました。飛車は２八に残ります。',
    },
    notesEn: {
      9: 'After △7七角成, only Gote holds a bishop so far. The next ▲同銀 completes the exchange for both sides.',
      12: '▲7八金 protects the silver on 7g during development with bishops in hand.',
      18: '▲2六銀 develops the right silver behind the pawn on 2e.',
      20: '▲1六歩 prepares contact on 1e.',
      22: '▲3六歩 clears 3g. A cleared square may also become part of an enemy bishop’s diagonal.',
      24: '▲6八玉 moves the king while leaving the rook on 2h.',
    },
    comment:
      '右銀２六、歩１六と２五、飛車２八を確認します。双方が角を持っているため、銀の進出先だけでなく角を打たれる斜めの道も見ます。次の枝は端で銀と香を交換する応手を選んだ比較です。',
    commentEn:
      'Locate the right silver on 2f, pawns on 1f and 2e, and rook on 2h. With bishops in both hands, inspect drop diagonals as well as the silver’s route. The branch selects replies that exchange a silver for a lance on the edge.',
    branches: [
      {
        kind: 'alt',
        moves: '1f1e 1d1e 2f1e 1a1e 1i1e',
        notes: {
          0: '▲１五歩から端で取り合う例です。',
          2: '▲同銀で取ると、その銀は後手香１一の利きに入ります。',
          4: '△同香に▲同香。先手は香と歩、後手は銀と歩を持ち、双方とも角も持っています。',
        },
        notesEn: {
          0: 'Compare an edge exchange beginning with ▲1五歩.',
          2: '▲同銀 enters the vertical control of Gote’s lance on 1a.',
          4: '△同香 and ▲同香 give Sente a lance and pawn, and Gote a silver and pawn. Both sides also hold a bishop.',
        },
        comment: '先手香１五と、双方が交換で得た持ち駒を確認します。ここから端の歩成りへの対応と、手持ちの香・桂の使い方を別々の枝で比べます。',
        commentEn:
          'Locate Sente’s lance on 1e and the pieces gained in hand. The following branches separately compare answering a promoted pawn and using a captured lance and knight.',
        branches: [
          {
            kind: 'alt',
            moves: 'P*1h 1e1a+ B*5e 2h3h 1h1i+ 3h3i 1i2i 3i2i',
            notes: {
              0: '△１八歩打で１九への成りを狙います。',
              1: 'この例では▲１一香成と奥へ進みます。１三で成ると桂２一に取られるため、その升には止まりません。後手歩１八への対応はまだ残ります。',
              2: '△５五角打で４六・３七を通り飛車２八へ当てます。歩４七にすぐ取られる４六へは打っていません。',
              3: '▲３八飛と移ります。',
              4: '△１九歩成でと金ができました。',
              5: '▲３九飛で２九への横の利きを用意します。',
              6: '△２九とで先手桂を取る応手を選びます。',
              7: '▲同飛でと金を取りました。取ったと金は歩として持ち駒に入ります。',
            },
            notesEn: {
              0: '△1八歩打 prepares promotion on 1i.',
              1: 'This example advances farther with ▲1一香成. Promoting on 1c would allow knight 2a to capture the lance. The pawn on 1h still needs attention.',
              2: '△5五角打 attacks rook 2h through 4f and the cleared 3g square, avoiding a drop on 4f that pawn 4g could capture.',
              3: '▲3八飛 moves the rook.',
              4: '△1九歩成 creates a tokin.',
              5: '▲3九飛 prepares horizontal control of 2i.',
              6: 'This branch selects △2九と, capturing Sente’s knight.',
              7: '▲同飛 removes the tokin, which enters Sente’s hand as a pawn.',
            },
            comment:
              '飛車２九でと金を取り除きましたが、先手の桂も取られています。先手は角・香・歩二枚、後手は銀と桂を持ちます。と金を取った利益だけでなく、取り合い全体を数えてください。',
            commentEn:
              'The rook on 2i has removed the tokin, but Sente’s knight was captured too. Sente holds a bishop, lance and two pawns; Gote holds a silver and knight. Count the entire exchange rather than only the removal of the promoted pawn.',
          },
          {
            kind: 'alt',
            moves: 'P*1h 1e1a+ 1h1i+ 1a2a 3a4b L*4e B*5e 2h3h 1i2i N*4f',
            notes: {
              0: '同じ歩打ちに、今度は▲１一香成と奥へ入る比較です。',
              3: '▲２一成香で後手桂を取ります。成香は金の横の動きができ、玉３一への王手になります。',
              4: 'この例は△４二玉で王手を避けます。',
              5: '▲４五香打。端で取った香を中央へ打ち、４三の歩へ縦に利かせます。',
              6: '△５五角打で飛車２八へ当てる応手を選び、▲３八飛と移ります。',
              8: '後手がと金で桂２九を取る例です。',
              9: '▲４六桂打は歩４七に守られ、３四と５四へ利きます。３四には後手歩がいます。',
            },
            notesEn: {
              0: 'Compare the same pawn drop with Sente advancing farther by ▲1一香成.',
              3: '▲2一成香 captures Gote’s knight. The promoted lance moves sideways like a gold and checks king 3a.',
              4: 'This reply moves the king to 4b, answering check.',
              5: '▲4五香打 reuses the captured lance, controlling pawn 4c along the file.',
              6: 'Gote chooses △5五角打, attacking rook 2h; Sente moves to 3h.',
              8: 'This example lets Gote’s tokin capture the knight on 2i.',
              9: '▲4六桂打 is protected by pawn 4g and controls 3d and 5d, with a Gote pawn on 3d.',
            },
            comment:
              '香４五は歩４三へ、桂４六は歩３四へ利きます。角５五で桂４六を取るなら歩４七で取り返せます。後手も銀・桂を持ち、と金２九と角５五が残ります。交換で得た駒を別の筋へ使う比較で、次の攻めが強制的に成功するとはしていません。',
            commentEn:
              'Lance 4e controls pawn 4c, while knight 4f controls pawn 3d. If bishop 5e captures the knight on 4f, pawn 4g can recapture. Gote holds a silver and knight, with a tokin on 2i and bishop on 5e. This compares redeploying captured pieces on other files without claiming a forced successful attack.',
          },
        ],
      },
    ],
  },
}
