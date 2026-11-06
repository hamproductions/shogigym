export default {
  id: 'hayaishida--basic',
  title: '早石田：７四歩で道を開け、角を持ち駒へ',
  titleEn: 'Haya-Ishida: Open the Seventh File and Reuse the Bishop',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  source: '早石田の標準的な７筋の歩交換と角打ちを独立した教材として構成。新ペタショック定跡（MIT）の候補手を参照し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '７四歩の交換後、先手が角を交換して５五へ打ち、飛車を７四へ進める。後手銀７三の遮断と、後手が８筋を急いだ場合の９五角による王手飛車を区別する。',
  goalLabel: '角の二つの斜めを読み、飛車の進路を選ぶ',
  goalSfen: 'ln1gkg1nl/1r5s1/p1sppp1pp/2R3p2/1p2B4/9/PP1PPPPPP/5K3/LNSG1GSNL w Pbp 1',
  rootComment:
    '７五の歩と７八の飛車を早く組み合わせます。玉を４八へ動かしたあと、７四歩で角の斜めにある歩を動かします。角交換は終点ではなく、角を別の場所へ打ち直す準備として見てください。',
  rootCommentEn:
    'Combine the pawn on 7e with the rook on 7h early. After moving the king to 4h, use ▲7四歩 to change the pawn on the bishop’s diagonal. Treat the bishop exchange as preparation for a new drop, rather than as the end of the plan.',
  line: {
    moves: '7g7f 3c3d 7f7e 8c8d 2h7h',
    notes: {
      2: '▲７五歩で７六が空きます。７筋に飛車を振る前に歩を進める手順です。',
      4: '▲７八飛。歩７五の後ろに飛車を置きました。角道は開いたままです。',
    },
    notesEn: {
      2: '▲7五歩 clears 7f before the rook swings to the seventh file.',
      4: '▲7八飛 places the rook behind the pawn on 7e, while the bishop diagonal remains open.',
    },
    branches: [
      {
        kind: 'main',
        moves: '7a6b 5i4h 8d8e 7e7d 7c7d 8h2b+ 3a2b B*5e 6b7c 7h7d',
        notes: {
          0: '後手は△６二銀を選びます。序盤定跡の候補手として確認した進行です。',
          1: '▲４八玉で玉を５九から動かします。後手の角打ちに王手が付くかどうかも、玉の位置で変わります。',
          3: '▲７四歩。後手が歩で取ると７三が空きます。',
          5: '▲２二角成で角を取りました。まだ後手は馬を取り返していません。',
          6: '△同銀で角交換が完了します。先手は得た角を次の手で使います。',
          7: '▲５五角。６四・７三を通って８二の飛車へ、４四・３三を通って２二の銀へ斜めの利きが通ります。',
          8: '△７三銀で飛車への道を遮り、８二の飛車を銀で守ります。',
          9: '▲７四飛で歩を取ります。飛車７四、角５五、後手銀７三という接点ができました。',
        },
        notesEn: {
          0: 'Gote chooses △6二銀, a continuation selected from the opening book’s candidates.',
          1: '▲4八玉 moves the king away from 5i. A bishop drop’s checking effect depends on that king position.',
          3: '▲7四歩 challenges the pawn; Gote’s capture clears 7c.',
          5: '▲2二角成 captures the bishop. Gote has not recaptured the horse yet.',
          6: '△同銀 completes the exchange. Sente uses the bishop it gained on the next move.',
          7: '▲5五角 reaches the rook on 8b through 6d and 7c, and the silver on 2b through 4d and 3c.',
          8: '△7三銀 blocks the bishop’s route to the rook and protects the rook on 8b.',
          9: '▲7四飛 captures the pawn. The rook on 7d and bishop on 5e now meet Gote’s silver on 7c.',
        },
        comment:
          '後手銀７三が角の道を止めているため、５五角を打っただけで飛車が取れるわけではありません。飛車７四から銀を取る候補では、８一の桂による取り返しまで数えます。ここからは駒の交換と玉への王手を一手ずつ読みます。',
        commentEn:
          'Gote’s silver on 7c blocks the diagonal, so the bishop drop alone does not win the rook. If considering a rook capture of that silver, include the knight recapture from 8a. Continue by counting exchanges and checks one move at a time.',
      },
      {
        kind: 'deviation',
        moves: '8d8e 5i4h 8e8f 8g8f 8b8f 7e7d 7c7d 8h2b+ 3a2b B*9e',
        notes: {
          2: '後手が銀の準備より８筋の歩交換を急ぐ比較例です。次の歩の捕獲も、この罠を示すための応手です。',
          5: '▲７四歩で７三の歩を動かす狙いです。後手が△同歩を選ぶ例を続けます。',
          9: '▲９五角。８六の飛車と、８四・７三・６二を通った先の５一玉へ同時に利きます。',
        },
        notesEn: {
          2: 'For comparison, Gote rushes the eighth-file exchange before developing the silver. The following pawn capture is chosen to demonstrate the trap.',
          5: '▲7四歩 aims to move the pawn off 7c. This example continues with Gote choosing △同歩.',
          9: '▲9五角 attacks the rook on 8f and checks the king on 5a through 8d, 7c and 6b.',
        },
        comment:
          '９五の角が王手と飛車取りを兼ねました。６二に後手銀がいないこと、７三の歩が動いたこと、後手飛車が８六へ出たことを、本線と比べてください。相手の選んだ誤りを利用する枝であり、どの受けにも同じ攻めが決まるわけではありません。',
        commentEn:
          'The bishop on 9e gives check while attacking the rook. Compare three details with the main line: no silver on 6b, the pawn moved off 7c, and the rook advanced to 8f. This branch exploits Gote’s chosen errors; it is not a forced attack against every defense.',
      },
      {
        kind: 'alt',
        moves: '7a6b 5i4h 8d8e 7e7d 7c7d 8h2b+ 3a2b 7h7d 6b7c 7d7c+ 8a7c P*7d 4c4d',
        notes: {
          7: '今度は角をすぐ打たず、▲７四飛で歩を取ります。先手は角を持ったままです。',
          8: '後手が銀を７三へ進める応手を選びます。',
          9: '▲７三飛成で銀を取り、飛車を渡す比較です。△同桂の取り返しまで数えます。',
          11: '▲７四歩打で桂７三の頭へ歩を置きます。次の７三への成りを候補にします。',
          12: '後手が４四歩と動かす応手を選びます。４三が空きました。桂を逃がすなど、ほかの応手もあります。',
        },
        notesEn: {
          7: 'This time ▲7四飛 captures the pawn before Sente drops the bishop, keeping it in hand.',
          8: 'Gote chooses to develop the silver to 7c.',
          9: '▲7三飛成 captures the silver and concedes the rook. Include the recapture △同桂.',
          11: '▲7四歩打 attacks the head of knight 7c, creating a candidate promotion onto 7c.',
          12: 'Gote chooses △4四歩, clearing 4c. Other replies, including moving the knight, are possible.',
        },
        comment:
          '後手が△４四歩を選び、桂７三が歩７四の前に残っています。先手には角を打つ前に▲７三歩成で桂を取り、飛車８二へ当てる手があります。角打ちの狙いだけでなく、この捕獲と成りを先に確認します。',
        commentEn:
          'After the selected △4四歩, knight 7c remains directly ahead of pawn 7d. Before dropping the bishop, Sente can capture that knight with ▲7三歩成 and attack rook 8b. Check this capture and promotion rather than looking only at bishop-drop targets.',
        branches: [
          {
            kind: 'alt',
            moves: '7d7c+ 8b3b',
            comment:
              '▲７三歩成は歩で桂を取る手で、王手ではありません。と金７三が飛車８二を狙います。この例では△３二飛と、金４一に守られる升へ飛車を逃がします。先手は銀と桂を持ち、と金７三を残します。',
            commentEn:
              '▲7三歩成 captures the knight with a pawn; it is not check. The tokin on 7c attacks rook 8b. This selects △3二飛, escaping to a square guarded by gold 4a. Sente holds a silver and knight and retains the tokin.',
          },
          {
            kind: 'deviation',
            moves: 'B*7f B*6e 7f6e 7c6e',
            comment:
              '▲７六角打は桂２一と歩８五へ利きますが、先に▲７三歩成で桂を取って飛車へ当てる機会を逃す弱い選択です。△６五角打▲同角△同桂と角を交換すると、桂が歩７四の前から６五へ逃げます。角を守って交換できることと、優先すべき駒取りを選べることは別です。',
            commentEn:
              '▲7六角打 targets knight 2a and pawn 8e, but is weaker because it misses first capturing knight 7c with promotion and an attack on the rook. After △6五角打 ▲同角 △同桂, the knight escapes the pawn on 7d by reaching 6e. An available bishop exchange does not replace checking the more urgent capture.',
          },
        ],
      },
    ],
  },
}
