export default {
  id: 'nakabisha-vs-chousoku--gote',
  title: '後手ゴキゲン中飛車：二枚銀への銀対抗',
  titleEn: 'Gote Gokigen Central Rook: A Silver against Two Attacking Silvers',
  myStrategy: 'nakabisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source: 'ゴキゲン中飛車の銀対抗と超速二枚銀の標準的な配置から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation: '後手は飛車５二・歩５五・銀４四・角３三で構える。先手銀４六と６六の双方が５五に利くため、歩を取られたあとの銀と角の取り返しを数える。',
  goalLabel: '５五を守る銀と角道の変化を読む',
  goalSfen: 'ln1g3nl/1ks1r1g2/pppp1pbpp/5sp2/4p2P1/2PS1SP2/PP1PPP2P/1BK1G2R1/LN1G3NL b - 1',
  rootComment:
    '後手の中飛車で５五の歩を置き、超速の二枚銀に銀４四で向き合います。先手銀が４六と６六に来ると、どちらも５五を狙います。駒の数だけでなく、６六銀が動いたあとの先手角８八の道も確認してください。',
  rootCommentEn:
    'As Gote Central Rook, place a pawn on 5e and meet the two attacking silvers with a silver on 4d. Sente’s silvers on 4f and 6f both control 5e. In addition to counting attackers, inspect the bishop on 8h when the silver leaves 6f.',
  line: {
    moves: '2g2f 3c3d 7g7f 5c5d 2f2e 8b5b 3i4h 5d5e 3g3f 2b3c 4h3g 3a4b 3g4f 4b5c 5i6h 5c4d 6h7h 5a6b 7i6h 6b7b 6h7g 7b8b 7g6f 7a7b 4i5h 4a3b',
    notes: {
      7: '△５五歩。飛車５二の前に歩を置きます。',
      9: '△３三角で２四を守ります。',
      15: '△４四銀で５五を守ります。４二・５三を経由した銀です。',
      22: '▲６六銀。先手は右銀４六に加えて左銀も５五へ利かせました。',
      23: '△７二銀で玉８二の隣へ銀を置きます。',
      25: '△３二金。次は先手番で、中央を取る手も読む必要があります。',
    },
    notesEn: {
      7: '△5五歩 places the pawn in front of the rook on 5b.',
      9: '△3三角 guards 2d.',
      15: '△4四銀 protects 5e after developing through 4b and 5c.',
      22: '▲6六銀 adds the left silver’s control of 5e to that of the right silver on 4f.',
      23: '△7二銀 places a silver beside king 8b.',
      25: '△3二金 completes this setup. Sente moves next, so central captures remain candidates.',
    },
    comment:
      '後手銀４四は５五を守りますが、先手にも銀二枚と角８八があります。中央で交換すると角道が開くため、銀で取り返せることだけを見て守りが完成したとは考えません。',
    commentEn:
      'Gote’s silver on 4d guards 5e, but Sente has two silvers and the bishop on 8h. Central exchanges can open that bishop’s diagonal. A legal silver recapture alone does not settle the whole defense.',
    branches: [
      {
        kind: 'alt',
        moves: '2i3g 6c6d 3g4e 3c2b',
        notes: {
          0: '銀だけでなく、▲３七桂から攻める準備も比べます。',
          1: 'この例では後手が△６四歩を選びます。',
          2: '▲４五桂は角３三に当たります。桂の利きは３三と５三です。',
          3: '△２二角と逃がす応手を選びます。２二から２四へは縦に進めないため、角による２四の守りがなくなりました。',
        },
        notesEn: {
          0: 'Compare preparing an attack with ▲3七桂 as well as the two silvers.',
          1: 'This example selects △6四歩.',
          2: '▲4五桂 attacks bishop 3c. The knight controls 3c and 5c.',
          3: 'This branch retreats with △2二角. A bishop cannot move vertically from 2b to 2d, so it no longer guards 2d.',
        },
        comment: '後手は角への当たりに対応しましたが、２筋と中央の二つの接触が残っています。次の枝で違う筋の歩交換を比較します。',
        commentEn:
          'Gote has answered the attack on the bishop, while pawn contact remains possible on both the second and central files. Compare the two continuations.',
        branches: [
          {
            kind: 'alt',
            moves: '2e2d 2c2d 2h2d',
            notes: {
              0: '▲２四歩で、角が守らなくなった升に接触します。',
              2: '△同歩▲同飛で、先手飛車が２四へ出ます。',
            },
            notesEn: {
              0: '▲2四歩 contacts the square no longer guarded by the bishop.',
              2: '△同歩 ▲同飛 brings Sente’s rook to 2d.',
            },
            comment: '桂４五による角への当たりから、角の移動と２筋の歩交換につながりました。後手番なので、ここから飛車への対応を考える局面です。',
            commentEn:
              'The knight attack led to a bishop retreat and a second-file pawn exchange. Gote moves next and must consider how to meet the advanced rook.',
          },
          {
            kind: 'alt',
            moves: '5g5f 5e5f',
            notes: {
              0: '別の比較では先手が▲５六歩と中央で接触します。',
              1: '△同歩で後手歩が５六へ進み、先手歩を取ります。',
            },
            notesEn: {
              0: 'The alternative selects ▲5六歩, making contact in the center.',
              1: '△同歩 advances Gote’s pawn to 5f and captures Sente’s pawn.',
            },
            comment: '後手は歩を一枚持ちました。５六の歩は銀６六と４六の間にあります。２筋を交換した枝とは、中央の歩の位置も持ち駒も異なります。',
            commentEn:
              'Gote gains a pawn in hand. The pawn on 5f stands between Sente’s silvers on 6f and 4f. Both the central pawn location and the hands differ from the second-file exchange.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: '6f5e 4d5e 4f5e',
        notes: {
          0: '▲５五銀で歩を取る例です。６六が空き、角８八から５五への道が開きました。',
          1: 'この枝は△同銀を選びます。',
          2: '▲同銀で先手のもう一枚の銀が取り返します。後手飛車５二がこの銀を取る場合、角の取り返しも読む必要があります。',
        },
        notesEn: {
          0: '▲5五銀 captures the pawn and clears 6f, opening the bishop diagonal from 8h to 5e.',
          1: 'This branch selects △同銀.',
          2: '▲同銀 recaptures with Sente’s other silver. Before taking it with the rook on 5b, include the bishop recapture.',
        },
        comment:
          '先手銀５五は角８八に守られています。双方は銀を一枚ずつ持ち、先手は歩も一枚持ちます。交換の途中の一手だけで駒得や優劣を決めないことが要点です。',
        commentEn:
          'Sente’s silver on 5e is protected by the bishop on 8h. Both sides hold one silver, and Sente also holds a pawn. Count beyond a single capture before judging material or the position.',
        branches: [
          {
            kind: 'alt',
            moves: '5b5e 8h5e 3c5e',
            notes: {
              0: '飛車で取る別の交換例です。',
              1: '▲同角で先手が飛車を取ります。',
              2: '△同角で後手角３三が５五へ取り返します。銀４四が消えたため、この斜めの道も通っています。',
            },
            notesEn: {
              0: 'Compare the further rook capture.',
              1: '▲同角 captures Gote’s rook.',
              2: '△同角 recaptures from 3c to 5e. Removing the silver from 4d opened this diagonal too.',
            },
            comment:
              '後手角は５五に残ります。先手は飛車・銀・歩、後手は角と銀二枚を持ちます。先手が飛車を取っただけの局面で止めず、後手の角の取り返しまで数えた交換例です。',
            commentEn:
              'Gote’s bishop remains on 5e. Sente holds a rook, silver and pawn; Gote holds a bishop and two silvers. The exchange includes Gote’s bishop recapture rather than stopping when Sente takes the rook.',
          },
        ],
      },
    ],
  },
}
