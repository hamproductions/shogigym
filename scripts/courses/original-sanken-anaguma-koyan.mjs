export default {
  id: 'sankenbisha-vs-anaguma--koyan',
  title: 'コーヤン流三間飛車：玉３九と端の桂',
  titleEn: 'Koyan Third File Rook: King on 3i and an Edge Knight',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    'コーヤン流の玉３九・桂２五と角７七の連携という標準的な構想を、新ペタショック定跡（MIT）の候補手から独立して選択。端の交換後は異なる受けを比較し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手三間飛車は玉３九・銀３八、角７七と桂２五を置く。後手穴熊の銀２二が動けない理由を確認し、端の交換、歩の打ち直し、取った香の３筋への投入を別の応手と比較する。',
  goalLabel: '角の斜線と端の交換をつなげる',
  goalSfen: 'ln4gnk/1r1s1bgsl/p2p1p1pp/2p1p1p2/1p1P3NP/2P1PPP2/PPB1SG1P1/2R3S2/LN1G2K1L w - 1',
  rootComment:
    '三間飛車でも玉を２八まで運ばず、３九に置く構想です。右桂を２五へ使い、１筋の歩と角７七を合わせます。端の交換を読む前に、角から相手玉までの斜線と、その途中にいる銀２二を確認します。',
  rootCommentEn:
    'This Third File Rook plan keeps the king on 3i instead of continuing to 2h. Use the right knight on 2e together with the edge pawn and bishop on 7g. Before calculating captures, trace the diagonal toward Gote’s king and locate the silver on 2b that blocks it.',
  line: {
    moves:
      '7g7f 8c8d 6g6f 8d8e 8h7g 3c3d 2h7h 7a6b 7i6h 5a4b 5i4h 4b3b 3i3h 2b3c 4i5h 1a1b 5g5f 3b2b 4g4f 2b1a 3g3f 3a2b 4h3i 4a3a 6h5g 6a5b 1g1f 5b4b 1f1e 4b3b 2i3g 3c4b 6f6e 7c7d 5h4g 5c5d 3g2e',
    notes: {
      6: '▲７八飛で三間飛車です。角は７七で８六を守ります。',
      22: '▲３九玉。銀３八の後ろに玉を置きます。',
      28: '▲１五歩で端の接触に備えます。まだ歩の交換は起きていません。',
      31: '△４二角で３三が空きました。',
      32: '▲６五歩で６六も空き、角７七から６六・５五・４四・３三・２二へ斜線が通ります。',
      36: '▲２五桂は１三と３三へ利きます。１三の歩を取る手を比較枝で読みます。',
    },
    notesEn: {
      6: '▲7八飛 establishes Third File Rook. Bishop 7g guards 8f.',
      22: '▲3九玉 places the king behind silver 3h.',
      28: '▲1五歩 prepares edge contact; no pawns have been exchanged yet.',
      31: '△4二角 clears 3c.',
      32: '▲6五歩 also clears 6f, opening the bishop diagonal through 6f, 5e, 4d and 3c toward 2b.',
      36: '▲2五桂 controls 1c and 3c. Compare capturing the pawn on 1c.',
    },
    comment:
      '後手銀２二が斜めへ動くと、角７七から玉１一への道が開きます。この局面では銀で１三を取ることはできません。桂だけを見ず、この銀の動きを制限する角も合わせて読みます。',
    commentEn:
      'Moving Gote’s silver away from 2b would open the diagonal from bishop 7g to king 1a. In this position the silver cannot legally capture on 1c. Read the knight together with the bishop that restricts this defender.',
    branches: [
      {
        kind: 'alt',
        moves: '6b5c 2e1c+ 1b1c 1e1d 1c1d 1i1d P*1b 1d1b+ 1a1b P*1d 1b1a 3f3e 3d3e L*3g',
        notes: {
          0: 'この比較では△５三銀と中央を整えます。',
          1: '▲１三桂成で歩を取ります。',
          2: '△同香で桂を取る応手です。',
          3: '▲１四歩で香１三へ接触します。',
          5: '△同香▲同香で、先手は相手の香を持ち駒にしました。この香１四は玉１一への王手です。',
          6: '後手が△１二歩打で王手を遮る例を選びます。',
          7: '▲同香成は歩を取る王手ですが、次の玉の取り返しまで読みます。',
          8: '△同玉。香を成っただけで安全だったわけではありません。',
          9: '▲１四歩打で取った歩を使い直します。元の１筋の歩は交換済みなので二歩ではありません。',
          10: '△１一玉と戻る応手を選びます。',
          11: '▲３五歩△同歩で３筋も接触させます。',
          13: '▲３七香打で、取った香を３筋へ使います。３六を通って歩３五へ利きます。３三へ打つと角４二・角７七・金３二の取り合いで香を失うため、金への直接の当たりとは区別します。',
        },
        notesEn: {
          0: 'This comparison selects △5三銀 in the center.',
          1: '▲1三桂成 captures the pawn.',
          2: 'Gote selects △同香, capturing the knight.',
          3: '▲1四歩 makes contact with the lance on 1c.',
          5: '△同香 ▲同香 gives Sente the opposing lance in hand. The lance on 1d checks king 1a.',
          6: 'Gote selects △1二歩打 to interpose against the check.',
          7: '▲同香成 captures the pawn with check, but include the king’s recapture.',
          8: '△同玉 captures the promoted lance. Promotion alone did not make it safe.',
          9: '▲1四歩打 reuses a captured pawn. The original first-file pawn was exchanged, so this is not nifu.',
          10: 'This example selects △1一玉.',
          11: '▲3五歩 △同歩 also creates third-file contact.',
          13: '▲3七香打 reuses the captured lance on the third file, controlling pawn 3e through 3f. Dropping on 3c would lose the lance after bishop 4b captures, bishop 7g recaptures and gold 3b recaptures again.',
        },
        comment:
          '端で取った香を、３筋の歩へ利かせて使いました。先手は歩一枚、後手は桂・香・歩を持ちます。後手の桂２一や銀２二も残るので、端を破っただけで勝ちとはしません。',
        commentEn:
          'The lance acquired at the edge now controls a pawn on the third file. Sente holds one pawn; Gote holds a knight, lance and pawn. Gote’s knight on 2a and silver on 2b remain: opening the edge is not a claim of victory.',
      },
      {
        kind: 'alt',
        moves: '6b5c 2e1c+ 1b1c 1e1d N*5e 1d1c+ 2b1c',
        notes: {
          3: '▲１四歩の接触までは同じです。',
          4: '後手が取った桂を△５五桂と中央へ打つ比較です。桂は４七の金と６七の升へ利きます。',
          5: '先手は▲１三歩成で香を取り、と金を作ります。',
          6: '△同銀でと金を取れます。桂５五が角７七の斜線を止めたため、銀２二を動かしても玉１一への王手にはなりません。',
        },
        notesEn: {
          3: 'The comparison reaches the same ▲1四歩 contact.',
          4: 'Gote instead drops the captured knight on 5e, attacking gold 4g and controlling 6g.',
          5: 'Sente selects ▲1三歩成, capturing the lance and making a tokin.',
          6: '△同銀 can capture the tokin: knight 5e now blocks bishop 7g, so moving silver 2b no longer exposes king 1a to check.',
        },
        comment:
          '後手銀は１三へ移り、と金を取りました。先手は香と歩、後手は歩を持ちます。桂５五は金４七に当たるだけでなく、角７七の道を止めて銀の取り返しを可能にしました。最初の局面にあった銀の制約を、途中の駒の配置が変えた例です。',
        commentEn:
          'Gote’s silver reaches 1c and removes the tokin. Sente holds a lance and pawn; Gote holds a pawn. Knight 5e both attacks gold 4g and blocks bishop 7g, enabling the silver recapture. A new blocker changed the restriction that applied to the silver in the starting position.',
      },
    ],
  },
}
