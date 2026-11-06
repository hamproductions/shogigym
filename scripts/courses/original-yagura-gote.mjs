export default {
  id: 'yagura--gote',
  title: '後手矢倉：３筋の接触と持ち歩の守り',
  titleEn: 'Gote Yagura: Third-File Contact and a Defensive Pawn',
  myStrategy: 'yagura',
  opponentStrategy: 'yagura',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '後手矢倉の24手の基本配置、角６四と銀による３筋の取り返しを新ペタショック定跡（MIT）の収録候補と照合。入城後の比較、角交換と持ち歩の役割を独立した短い段階に分け、解説を新しく執筆。',
  goalFormation:
    '24手で後手の金３二・５二、銀３三、角３一、玉４一を整える。その後は金４三を経て玉が３二・２二へ入り、角６四による対抗、銀３四での取り返し、角交換後の３五歩打の働きを読む。',
  goalLabel: '相手銀の前進を合法手と利きで区別する',
  goalSfen: 'ln3kbnl/1r1sg1g2/p2p2spp/1pp1ppp2/9/2PPP1P2/PPSG1P1PP/2G2S1R1/LNBK3NL b - 1',
  rootComment:
    '後手の金銀と玉の経路を追います。駒組みの24手と、その後に先手が３筋を接触させる場面を分けます。持ち歩で銀の進出先を守ることは、その銀の移動自体を反則にすることとは違います。',
  rootCommentEn:
    'Follow Gote’s generals and king route. Separate the 24-ply framework from Sente’s later third-file contact. Using a pawn to control a silver’s destination is different from making that silver move illegal.',
  line: {
    moves: '7g7f 8c8d 6g6f 3c3d 7i6h 7a6b 5g5f 5c5d 6i7h 3a4b 3i4h 4a3b 4i5h 5a4a 5h6g 7c7d 6h7g 6a5b 8h7i 4b3c 5i6i 2b3a 3g3f 4c4d',
    notes: {
      3: '△３四歩で角道を開きます。',
      9: '△４二銀から３三へ進める準備です。',
      11: '△３二金。玉はまだ５一にいます。',
      13: '△４一玉は入城の途中です。',
      17: '△５二金でもう一枚の金を動かします。',
      19: '△３三銀で２四・３四・４四を守ります。',
      21: '△３一角で２二を空けます。',
      23: '△４四歩までで24手です。',
    },
    notesEn: {
      3: '△3四歩 opens the bishop diagonal.',
      9: '△4二銀 prepares development to 3c.',
      11: '△3二金. The king is still on 5a.',
      13: '△4一玉 is an intermediate king square.',
      17: '△5二金 develops the other gold.',
      19: '△3三銀 guards 2d, 3d and 4d.',
      21: '△3一角 clears 2b.',
      23: '△4四歩 reaches 24 plies.',
    },
    comment:
      '後手は金３二・５二、銀３三、角３一、玉４一です。まだ玉２二の完成形ではありません。金３二を動かしてから玉の道を空ける段階と、先手の歩への対応を別に確認します。',
    commentEn:
      'Gote has golds on 3b and 5b, silver 3c, bishop 3a and king 4a. The king has not reached 2b. Distinguish moving gold 3b to clear the king’s route from responding to Sente’s pawn contact.',
    branches: [
      {
        kind: 'alt',
        moves: '4h3g 3b4c 9g9f 4a3b 2g2f 3b2b 3f3e 3a6d 3e3d 3c3d 7i4f 6d4f 4g4f P*3e',
        notes: {
          1: '△４三金で３二を空けます。金５二も残ります。',
          5: '△２二玉で入城します。',
          7: '△６四角は５五を通して、先手角が４六へ出る升と向き合う位置です。今の歩３五へ直接利くわけではありません。',
          9: '▲３四歩を△同銀で取り返します。双方が歩を一枚持ちます。',
          11: '▲４六角に△同角。６四から５五を通って角を取ります。',
          12: '▲同歩で先手歩４七が４六へ移り、双方が角を持ちます。',
          13: '△３五歩打。後手の３筋の元の歩は取られたので二歩ではありません。歩３五は３六を守ります。',
        },
        notesEn: {
          1: '△4三金 clears 3b while the other gold stays on 5b.',
          5: '△2二玉 completes king entry.',
          7: '△6四角 faces the square 4f through 5e, where Sente’s bishop can develop. It does not directly control pawn 3e.',
          9: 'After ▲3四歩, △同銀 recaptures. Each side holds one pawn.',
          11: 'Against ▲4六角, △同角 captures through 5e.',
          12: '▲同歩 moves Sente’s pawn from 4g to 4f; each side now holds a bishop.',
          13: '△3五歩打 is not nifu because Gote’s original third-file pawn was captured. Pawn 3e controls 3f.',
        },
        comment:
          '後手銀３四、歩３五、玉２二を確認します。先手銀３七は３六へ動くこと自体はできますが、その升を後手歩が守っています。歩打ちを「銀が動けなくなる手」とせず、進んだ後に何で取れるかを読みます。',
        commentEn:
          'Locate Gote’s silver on 3d, pawn on 3e and king on 2b. Sente’s silver on 3g can legally move to 3f, but Gote’s pawn controls that square. Read the subsequent capture rather than describing the pawn drop as making the silver move illegal.',
        branches: [
          {
            kind: 'main',
            moves: '6i7i 6c6d 7i8h 1c1d',
            notes: {
              1: '△６四歩で６三を空け、銀６二の前を進めます。',
              3: '△１四歩を選ぶ比較です。相手銀への歩の利きと、玉２二の周囲の升を見直します。',
            },
            notesEn: {
              1: '△6四歩 clears 6c and advances the pawn ahead of silver 6b.',
              3: 'This selects △1四歩. Recheck the pawn’s control against the silver and the squares around king 2b.',
            },
            comment:
              '先手は角と歩一枚、後手は角を持ちます。後手は銀３四と歩３五を残しながら６筋も進め、先手玉は８八へ入りました。角を持っただけで有利とはせず、次の打ち場所と銀の進路を実際の空升から探す区切りです。',
            commentEn:
              'Sente holds a bishop and one pawn; Gote holds a bishop. Gote retains silver 3d and pawn 3e while advancing on the sixth file; Sente’s king has reached 8h. Holding a bishop alone establishes no advantage. Use the actual empty squares to examine its next drop and the silver’s routes.',
          },
          {
            kind: 'deviation',
            moves: '3g3f 3e3f',
            comment:
              '▲３六銀は合法ですが、この配置では△同歩で銀を取られます。飛車２八は３六へ斜めに取り返せません。銀の移動を禁じる規則があるのではなく、歩の利きに進んだ結果です。',
            commentEn:
              '▲3六銀 is legal, but △同歩 captures it here. Rook 2h cannot recapture diagonally on 3f. The move is punished by the pawn’s control, not prohibited by a movement rule.',
          },
        ],
      },
    ],
  },
}
