export default {
  id: 'sankenbisha-vs-nakabisha--aifuri',
  title: '石田流と中飛車：７筋の歩と中央の銀',
  titleEn: 'Ishida versus Central Rook: Seventh-File Pawns and a Central Silver',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'nakabisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '先手石田流と後手ゴキゲン中飛車の標準的な相振り配置を新ペタショック定跡（MIT）の候補手と照合。歩の打ち直しと中央の歩取りを、独立した短い比較枝として新しく構成。',
  goalFormation:
    '先手は飛車７六・歩７五・桂７七の石田流、玉３八・金４八５八・銀２八の金無双。銀６七は中央の５六を守り、比較枝で７筋の歩成りと打ち直し、銀による５五歩の捕獲を読む。',
  goalLabel: '飛車の筋と銀の守備範囲を合わせる',
  goalSfen: 'ln3g1nl/1ksgr2b1/1ppp1p1p1/p5p1p/2PPps3/2R5P/PPNSPPPP1/1B2GGKS1/L6NL b - 1',
  rootComment:
    '後手の中飛車に対し、先手も飛車を振ります。飛車を７六へ浮かせる石田流と、金二枚を横に並べる金無双を組み合わせます。銀を６七へ進めた形では５六・６六・７六などを守りますが、５五の歩へ直接利くわけではありません。',
  rootCommentEn:
    'Meet Gote Central Rook by ranging Sente’s rook too. Combine Ishida’s floating rook on 7f with Kinmusou’s two golds side by side. Once developed to 6g, the silver controls squares such as 5f, 6f and 7f; it does not directly attack the pawn on 5e.',
  line: {
    moves:
      '7g7f 3c3d 6g6f 5c5d 2h7h 8b5b 7i6h 5d5e 6h6g 3a4b 7f7e 4b5c 7h7f 5a6b 5i4h 6b7b 4h3h 7b8b 4i4h 7a7b 6i5h 6a6b 3i2h 5c4d 8i7g 9c9d 6f6e 4d4e 1g1f 1c1d',
    notes: {
      5: '△５二飛で後手は中飛車です。',
      8: '▲６七銀は６六歩と５六の升を守ります。',
      12: '▲７六飛と浮きました。銀６七は飛車７六も守っています。',
      16: '▲３八玉で玉を右側へ運びます。',
      20: '▲５八金。金４八・５八が横に並びました。',
      22: '▲２八銀で金無双の銀を置きます。',
      24: '▲７七桂は６五と８五へ利きます。歩７五を直接守る桂ではありません。',
      26: '▲６五歩で６六を空けますが、角８八の道はまだ自分の桂７七で止まっています。',
    },
    notesEn: {
      5: '△5二飛 establishes Gote Central Rook.',
      8: '▲6七銀 guards pawn 6f and square 5f.',
      12: '▲7六飛 floats the rook. Silver 6g also guards that rook square.',
      16: '▲3八玉 brings the king to the right wing.',
      20: '▲5八金 places the golds side by side on 4h and 5h.',
      22: '▲2八銀 places the Kinmusou silver.',
      24: '▲7七桂 controls 6e and 8e; it does not directly guard pawn 7e.',
      26: '▲6五歩 clears 6f, but Sente’s own knight on 7g still blocks bishop 8h.',
    },
    comment:
      '飛車７六の前に歩７五、中央に銀６七があります。歩を成る攻めと、銀で５五を取る攻めを別の枝で比較します。銀を動かす前には、角８八を止める桂７七も確認してください。',
    commentEn:
      'Pawn 7e stands ahead of rook 7f, with silver 6g in the center. Compare a pawn-promotion attack and a silver capture on 5e in separate branches. Before moving the silver, also inspect knight 7g blocking bishop 8h.',
    branches: [
      {
        kind: 'alt',
        moves: '7e7d 9d9e 7d7c+ 7b7c P*7d',
        notes: {
          0: '▲７四歩で接触します。',
          1: '後手が接触を見送る△９五歩を選ぶ比較です。',
          2: '▲７三歩成で歩を取り、玉８二へ王手をかけます。',
          3: '△同銀でと金を取る応手です。銀が７二から７三へ動きました。',
          4: '▲７四歩打は飛車７六が守る升への打ち直しです。',
        },
        notesEn: {
          0: '▲7四歩 creates contact.',
          1: 'This comparison selects △9五歩, leaving that contact unanswered.',
          2: '▲7三歩成 captures a pawn and checks king 8b.',
          3: '△同銀 captures the tokin, drawing the silver from 7b to 7c.',
          4: '▲7四歩打 reuses the pawn on a square protected by rook 7f.',
        },
        comment: '打ち直した歩７四は飛車７六に守られています。銀で取る手には、その飛車の取り返しがあります。',
        commentEn: 'The redropped pawn on 7d is protected by rook 7f. Capturing it with the silver permits the rook’s recapture.',
        branches: [
          {
            kind: 'deviation',
            moves: '7c7d 7f7d',
            comment:
              '先手飛車は７四に進み、先手は銀、後手は歩二枚を持ちます。先手が取った歩は７四へ打ったため、もう手持ちにはありません。歩成りが取られても、打ち直した歩と飛車を組み合わせられる例です。後手が７四歩を取らない応手まで否定した手順ではありません。',
            commentEn:
              'Sente’s rook reaches 7d. Sente holds a silver; Gote holds two pawns. Sente spent the captured pawn on the drop to 7d and no longer holds it. Even after the promoted pawn is captured, a pawn redrop can coordinate with the rook. This example does not exclude Gote declining the pawn on 7d.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: '7g8e 2a3c 6g6f 6c6d 6f5e',
        notes: {
          0: '▲８五桂で７七を空けます。角８八の斜線が７七・６六を通るようになりました。',
          1: '後手が△３三桂を選びます。この桂は後手角２二の斜め前に立ちます。',
          2: '▲６六銀で５五歩へ当てます。今はこの銀が角道を止めています。',
          3: '後手が△６四歩と中央の接触を見送る比較です。',
          4: '▲５五銀で歩を取ります。６六が空き、角８八が銀５五を守る道が通りました。',
        },
        notesEn: {
          0: '▲8五桂 clears 7g, allowing bishop 8h’s diagonal to pass through 7g and 6f.',
          1: 'Gote selects △3三桂, placing a knight diagonally in front of its own bishop on 2b.',
          2: '▲6六銀 attacks pawn 5e, though the silver now blocks Sente’s bishop diagonal.',
          3: 'This comparison selects △6四歩 instead of answering the central contact.',
          4: '▲5五銀 captures the pawn and clears 6f, opening bishop 8h’s support of the silver.',
        },
        comment:
          '銀５五は角８八に守られ、先手は歩を一枚持ちます。後手角２二の道は自分の桂３三で止まっています。銀の歩取りだけでなく、その手で開いた味方の道と、相手の角を止める駒まで確認した例です。',
        commentEn:
          'Bishop 8h protects silver 5e, and Sente holds one pawn. Gote’s own knight on 3c blocks bishop 2b. Read the captured pawn together with the friendly line opened by the move and the blocker on the opposing bishop’s line.',
      },
    ],
  },
}
