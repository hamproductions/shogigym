export default {
  id: 'sankenbisha-vs-bougin--53kin',
  title: '三間飛車の５三金型：銀を追う歩と角の経路',
  titleEn: 'Third File Rook with Gold 5c: A Pawn against the Silver and a Bishop Route',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '三間飛車の５三金・４三銀型という標準的な守備配置を新ペタショック定跡（MIT）の候補手と照合し、独立した比較手順を構成。説明はこのアプリ用に新しく執筆。',
  goalFormation: '後手は飛車３二・金５三・銀４三、玉８二と銀７二で構える。３筋の歩交換後の歩打ちで銀に当てる例と、香１二から角を７三へ使い直す準備を読む。',
  goalLabel: '金と銀が守る升を確かめる',
  goalSfen: 'ln1g3nl/1ks3r2/ppp1gsbp1/3pppp1p/7P1/2P1PPPSP/PP1PS4/1BK1G2R1/LN1G3NL b - 1',
  rootComment:
    '後手の三間飛車で、先手の銀２六に向き合います。金５三と銀４三は別々の駒ですが、どちらも４四へ利きます。３筋の接触では、取った歩をすぐ使い直せるか、銀の逃げ道がどこに残るかを一手ずつ確認します。',
  rootCommentEn:
    'Play Gote Third File Rook against Sente’s silver on 2f. Gold 5c and silver 4c are separate defenders, both controlling 4d. At third-file contact, inspect whether a captured pawn can be reused and which retreat squares remain for the attacking silver.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b3b 5g5f 3a4b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 3g3f 5c5d 4g4f 6c6d 4h3g 5b5c 3g2f 4b4c 1g1f 1c1d',
    notes: {
      7: '△３二飛で三間飛車です。',
      17: '△７二銀で玉８二の隣を守ります。',
      25: '△５三金。金は４四・５四・６四などへ利きます。',
      26: '▲２六銀で先手の右銀が飛車先へ来ました。',
      27: '△４三銀は３四・４四・５四へ利きます。金５三との共通の守りも見ます。',
      29: '△１四歩で先手の１六歩に向き合います。',
    },
    notesEn: {
      7: '△3二飛 establishes Third File Rook.',
      17: '△7二銀 guards beside king 8b.',
      25: '△5三金 controls squares including 4d, 5d and 6d.',
      26: '▲2六銀 brings Sente’s right silver to the rook wing.',
      27: '△4三銀 controls 3d, 4d and 5d. Compare its shared defensive squares with gold 5c.',
      29: '△1四歩 faces Sente’s pawn on 1f.',
    },
    comment:
      '銀２六が３五へ進むには、今その升に利く後手歩３四との交換を読む必要があります。角３三も３筋にいるので、角を移す手と歩を取る手を別々の段階として比べます。',
    commentEn:
      'Before Sente’s silver can advance to 3e, calculate the exchange with Gote’s pawn on 3d. The bishop also occupies the third file on 3c. Compare moving that bishop and capturing the pawn as distinct stages.',
    branches: [
      {
        kind: 'alt',
        moves: '3f3e 1a1b 2h3h 3c5a 9g9f 3d3e 2f3e P*3d 3e2f 7c7d 9f9e 6d6e 1f1e 5a7c',
        notes: {
          0: '▲３五歩の接触に対し、準備の手を比べます。',
          1: '△１二香で１一を空けます。香を上げただけで３筋の歩交換を防いだわけではありません。',
          2: '先手が飛車を３八へ寄せる例です。',
          3: '△５一角で角を３筋から外します。３三から４二を通る斜めです。',
          4: '▲９六歩はこの比較のために選んだ待ち手です。',
          6: '△同歩▲同銀まで３筋の歩を交換します。双方は歩を一枚持ちます。',
          7: '△３四歩打で銀３五に当てます。３四は銀４三が守っています。',
          8: '先手が▲２六銀と戻る例です。他の逃げ方まで排除した主張ではありません。',
          9: '△７四歩で７三を空けます。',
          11: '先手の▲９五歩に△６五歩とし、角５一から７三への途中の６二も空いていることを確かめます。',
          13: '先手が▲１五歩と接触したところで、後手は△７三角を選びます。端の当たりを残す比較です。',
        },
        notesEn: {
          0: 'Compare preparation after ▲3五歩 creates contact.',
          1: '△1二香 clears 1a. Moving the lance alone does not prevent a third-file pawn exchange.',
          2: 'Sente selects a rook transfer to 3h.',
          3: '△5一角 leaves the third file along the diagonal through 4b.',
          4: '▲9六歩 is a selected waiting move for this comparison.',
          6: '△同歩 ▲同銀 exchanges the third-file pawns, leaving one pawn in each hand.',
          7: '△3四歩打 attacks silver 3e. Silver 4c guards the drop.',
          8: 'This example selects ▲2六銀; it does not claim that all other retreats are excluded.',
          9: '△7四歩 clears 7c.',
          11: 'After the selected ▲9五歩, △6五歩 also changes the central contact. Check that 6b is empty on the bishop route from 5a to 7c.',
          13: 'After ▲1五歩, Gote selects △7三角, leaving the edge contact unresolved for comparison.',
        },
        comment:
          '角７三から６四・５五・４六へ斜線が通り、先手歩４六へ当たっています。香１二、歩３四、角７三の役割はそれぞれ違います。先手も１五で接触しているため、反撃の形だけで優劣を断定しません。',
        commentEn:
          'Bishop 7c reaches Sente’s pawn on 4f through empty 6d and 5e. Lance 1b, pawn 3d and bishop 7c serve different roles. Sente also has edge contact on 1e, so this counterattacking arrangement is not itself a verdict on the position.',
      },
      {
        kind: 'alt',
        moves: '3f3e 3c5a 2h3h 3d3e 2f3e P*3d',
        notes: {
          1: 'この比較では角を先に５一へ引きます。',
          5: '３筋の歩交換後、△３四歩打で銀に当てます。',
        },
        notesEn: {
          1: 'This comparison retreats the bishop to 5a first.',
          5: 'After exchanging third-file pawns, △3四歩打 attacks the silver.',
        },
        comment: '角を先に５一へ戻してから歩を交換する別の準備順です。歩３四を打った後、先手銀３五の逃げ先を比較します。',
        commentEn:
          'This alternative preparation retreats the bishop to 5a before exchanging pawns. After the pawn drop on 3d, compare retreats for Sente’s silver on 3e.',
        branches: [
          {
            kind: 'deviation',
            moves: '3e4d 5c4d 8h4d 4c4d',
            notes: {
              0: '▲４四銀は歩を取りますが、金５三と銀４三の両方が４四を守っています。',
              1: '△同金で銀を取る応手を選びます。',
              2: '▲同角の取り返しまで読みます。４四は敵陣の外なので、この着手では角を成れません。',
              3: '△同銀で角も取り返し、交換を終えます。',
            },
            notesEn: {
              0: '▲4四銀 captures a pawn, but both gold 5c and silver 4c guard 4d.',
              1: 'This example selects △同金.',
              2: 'Include ▲同角. The destination 4d lies outside Sente’s promotion zone, so this move cannot promote the bishop.',
              3: '△同銀 completes the recapture sequence.',
            },
            comment: '先手は金と歩二枚、後手は角と銀を持ち、後手銀４四が残ります。銀を一度取っただけで止めず、角ともう一枚の守り駒の取り返しまで数えました。',
            commentEn:
              'Sente holds a gold and two pawns; Gote holds a bishop and silver, with a silver remaining on 4d. Count the bishop capture and the second defender’s recapture rather than stopping at the first silver capture.',
          },
        ],
      },
    ],
  },
}
