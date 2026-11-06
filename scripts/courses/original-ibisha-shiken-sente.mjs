export default {
  id: 'ibisha-vs-shikenbisha--sente',
  title: '４六銀左：二枚の銀を取り違えない急戦',
  titleEn: 'Left Silver on 4f: Track the Two Silvers Separately',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '四間飛車への４六銀左急戦の標準的な左銀の経路と３筋の接触から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手の左銀が７九・６八・５七・４六と進み、右銀は４八に残る。飛車２八と歩３五を置き、後手飛車３二・銀４三への応手を読む。比較枝では角と飛車の交換を最後の取り返しまで数える。',
  goalLabel: '左銀４六と３筋の接触を確認する',
  goalSfen: 'ln1g3nl/1ks1g1r2/ppp2sbpp/3pppp2/6PP1/2P1PS3/PP1P1P2P/1BKGGS1R1/LN5NL b - 1',
  rootComment:
    '攻めに使うのは７九から出る左銀です。５七を経由して４六へ進み、３五歩の接触に合わせます。右銀４八と左銀４六を区別し、銀を進める手と飛車を移す手を同じものとして覚えないでください。',
  rootCommentEn:
    'The attacking silver starts on 7i, travels through 5g and reaches 4f to join the contact on 3e. Distinguish it from the right silver on 4h. Developing a silver and transferring a rook are separate decisions.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 6i6h 6c6d 3g3f 5c5d 5g4f 3b4c 3f3e 4b3b',
    notes: {
      6: '▲４八銀は右銀です。左銀が動き出すのは後です。',
      16: '▲６八銀で左銀を運び始めます。玉７八と金５八に囲まれた升から中央へ出ます。',
      18: '▲５七銀。５六歩で空けた升を使います。',
      24: '▲４六銀で左銀が目標の位置へ来ました。３五と５五へ利きます。',
      26: '▲３五歩で３四の後手歩と接触します。今は自分の歩がいるため、銀４六から３五へは進めません。',
      27: '△３二飛。後手も３筋へ飛車を合わせました。歩交換後の取り返しを確認します。',
    },
    notesEn: {
      6: '▲4八銀 moves the right silver. The left silver develops later.',
      16: '▲6八銀 begins the left silver’s route toward the center, alongside king 7h and gold 5h.',
      18: '▲5七銀 uses the square cleared by ▲5六歩.',
      24: '▲4六銀 reaches the target square and controls 3e and 5e.',
      26: '▲3五歩 contacts Gote’s pawn on 3d. Sente’s own pawn currently prevents the silver from moving to 3e.',
      27: '△3二飛 also transfers Gote’s rook to the third file. Examine recaptures after a pawn exchange.',
    },
    comment:
      '左銀４六、右銀４八、飛車２八が先手の配置です。後手銀４三は３四を守ります。歩３五で接触しただけでは、銀で３四を取れるわけではありません。銀の動ける升と歩のいる升を分けて見ます。',
    commentEn:
      'Sente has the left silver on 4f, right silver on 4h and rook on 2h. Gote’s silver on 4c guards 3d. Contact with the pawn on 3e does not let Sente’s silver immediately capture on 3d. Distinguish the silver’s movement squares from the pawn’s square.',
    branches: [
      {
        kind: 'alt',
        moves: '3e3d 4c3d 2h3h',
        notes: {
          0: '▲３四歩で後手歩を取ります。先手は歩を一枚持ちます。',
          1: 'この枝では△同銀で取り返す応手を選びます。',
          2: '▲３八飛で交換した筋へ飛車を寄せます。ただし後手銀３四が残るため、３二の飛車まで通ってはいません。',
        },
        notesEn: {
          0: '▲3四歩 captures Gote’s pawn and gains a pawn in hand.',
          1: 'This branch selects △同銀 as Gote’s recapture.',
          2: '▲3八飛 transfers to the exchanged file. Gote’s silver on 3d still blocks the path to the rook on 3b.',
        },
        comment:
          '双方に歩が一枚ずつ入りました。先手銀４六、後手銀３四、双方の飛車の位置を確認します。後手の４五歩は銀４六への当たりにもなるので、次の攻めだけでなく相手の接触も読みます。',
        commentEn:
          'Both sides hold one pawn. Locate Sente’s silver on 4f, Gote’s silver on 3d and both rooks. Gote’s possible △4五歩 would attack the silver on 4f, so read the opponent’s contact as well as your next attacking move.',
      },
      {
        kind: 'alt',
        moves: '3e3d 4c3d 2h3h 3d2e 1g1f 4d4e 8h3c+ 3b3c 3h3c+ 2a3c',
        comment:
          '角と飛車の交換を最後まで数えました。双方が飛車と角を持ち、先手は歩一枚、後手は歩二枚です。銀４六は歩４五に狙われていますが、５五へ出ると歩５四に取られます。',
        commentEn:
          'Count both major-piece exchanges through their final recaptures. Both sides hold a rook and bishop; Sente holds one pawn and Gote two. Pawn 4e attacks silver 4f, but advancing to 5e would put it under pawn 5d.',
        branches: [
          {
            kind: 'alt',
            moves: '4f3g',
            comment: '▲３七銀と引き、歩４五の当たりから外します。５四歩の前へ銀を進める手とは区別してください。',
            commentEn: '▲3七銀 retreats out of the attack from pawn 4e. Distinguish this from advancing in front of the pawn on 5d.',
            branches: [
              {
                kind: 'alt',
                moves: 'R*3d 3g2h',
                comment:
                  '後手は交換した飛車を３四へ打ち、３七銀を縦に狙います。銀は２八へ逃げる応手を選びました。飛車３四は後手銀２五に守られ、飛車打ちが王手というわけではありません。',
                commentEn:
                  'Gote drops the exchanged rook on 3d, attacking silver 3g along the file. This example retreats the silver to 2h. Gote’s silver on 2e guards the rook on 3d; the rook drop itself is not check.',
              },
            ],
          },
          {
            kind: 'deviation',
            moves: '4f5e 5d5e 5f5e',
            comment: '▲５五銀は△同歩で銀を失います。▲同歩は歩の取り返しにすぎず、銀を取り戻す手ではありません。',
            commentEn: '▲5五銀 loses the silver to △同歩. Sente’s pawn recapture gains a pawn, not the lost silver.',
            branches: [
              {
                kind: 'deviation',
                moves: 'B*4f',
                comment: '△４六角打も失敗です。歩４五の支えがあっても、▲同歩で角を取れます。後手が歩で取り返しても角と歩の交換になります。',
                commentEn:
                  '△4六角打 is also a mistake. Protection from pawn 4e does not stop ▲同歩 from taking the bishop. Gote’s pawn recapture would exchange a bishop for a pawn.',
                branches: [
                  {
                    kind: 'alt',
                    moves: '4g4f 4e4f',
                    comment: '角打ちを歩で取り、後手の歩が取り返しました。持ち駒を使う前に、相手の歩による捕獲も確認します。',
                    commentEn:
                      'Sente’s pawn captures the dropped bishop and Gote’s pawn recaptures. Before dropping a piece, check captures by enemy pawns as well.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        kind: 'alt',
        moves: '3e3d 3c2b 2e2d 2c2d 2h2d',
        notes: {
          0: '▲３四歩で歩を取ったあと、角の応手を比べます。',
          1: '△２二角と引くと、角３三による２四の守りがなくなります。',
          2: '▲２四歩で、その２四へ接触します。',
          3: 'この枝では△同歩で取り返します。',
          4: '▲同飛で２筋の歩交換を終えます。角２二は同じ筋を縦に進めないので、この飛車を取れません。',
        },
        notesEn: {
          0: 'After ▲3四歩 captures the pawn, compare a bishop reply.',
          1: '△2二角 retreats, removing the bishop on 3c that guarded 2d.',
          2: '▲2四歩 makes contact on the newly unguarded square.',
          3: 'This branch selects △同歩.',
          4: '▲同飛 completes the second-file pawn exchange. The bishop on 2b cannot capture vertically down the file.',
        },
        comment:
          '飛車２四、先手歩３四、後手角２二の位置を確認します。先手の持ち駒は歩二枚、後手は歩一枚です。角の移動で消えた守りを、具体的な歩交換につなげました。',
        commentEn:
          'Locate rook 2d, Sente’s pawn on 3d and Gote’s bishop on 2b. Sente holds two pawns and Gote one. The pawn exchange demonstrates the consequence of the bishop leaving its defensive diagonal.',
      },
    ],
  },
}
