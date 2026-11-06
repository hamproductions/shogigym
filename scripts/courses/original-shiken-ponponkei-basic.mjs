export default {
  id: 'shikenbisha-vs-ponponkei--basic',
  title: 'ポンポン桂への四間飛車：桂取りと竜への備え',
  titleEn: 'Fourth File Rook against Ponpon Knight: Capture the Knight and Defend the Pieces',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '四間飛車への早い桂跳ねと、角交換後の飛車４一・金４二という標準的な守備構想を新ペタショック定跡（MIT）の候補手と照合。歩の受けとの違いと玉の選択を独立した比較として構成し、説明を新しく執筆。',
  goalFormation: '後手四間飛車は桂４五を歩で取り、角交換後に先手の竜を許す比較を読む。飛車４一が香１一を、金４二が桂３三・銀４三を守る具体的な関係を確認する。',
  goalLabel: '成駒の位置と守る駒を分けて数える',
  goalSfen: 'ln1g3nl/1ks1gr3/ppp2sbpp/3pppp2/7P1/2P1P1P2/PP1PSPN1P/1BKGGS1R1/LN6L b - 1',
  rootComment:
    '先手が右桂を早く使うポンポン桂に、後手四間飛車で向き合います。桂を取る手だけで終わらず、そのあと角が交換されて飛車が進む可能性まで読みます。竜ができたかどうかと、実際に取れる駒があるかどうかは別々に確認します。',
  rootCommentEn:
    'Meet Sente’s early right-knight attack with Gote Fourth File Rook. Read beyond the knight capture to possible bishop exchanges and rook advances. Distinguish whether a dragon has been created from which captures are actually available.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 6i6h 5c5d 3g3f 3b4c 2i3g 6c6d',
    notes: {
      7: '△４二飛で四間飛車です。',
      23: '△４三銀が４四の歩を守ります。',
      24: '▲３七桂。桂は次に４五へ跳ぶ候補があります。',
      25: '△６四歩で反対側にも歩を使います。４四歩がまだ４五へ利いていることを確認します。',
    },
    notesEn: {
      7: '△4二飛 establishes Fourth File Rook.',
      23: '△4三銀 guards pawn 4d.',
      24: '▲3七桂 leaves a possible jump to 4e.',
      25: '△6四歩 develops on the other side. Check that pawn 4d still controls 4e.',
    },
    comment:
      '先手桂３七と後手歩４四を見ます。桂４五には歩で取る手がありますが、それで角道も開きます。次の枝では、桂の捕獲と角交換、そのあとの飛車の動きを一続きに読みます。',
    commentEn:
      'Locate Sente’s knight on 3g and Gote’s pawn on 4d. Capturing a knight on 4e with that pawn also opens the bishop diagonal. The comparison follows the knight capture through the bishop exchange and subsequent rook moves.',
    branches: [
      {
        kind: 'alt',
        moves: '3g4e 4d4e',
        notes: {
          0: '▲４五桂を選ぶ比較です。桂は３三と５三へ利いて角３三に当たりますが、歩４四にも取られる升です。',
          1: '△同歩で桂を持ち駒にしました。４四が空き、角８八と３三の道が通ります。',
        },
        notesEn: {
          0: '▲4五桂 controls 3c and 5c, attacking bishop 3c, but lands on a square controlled by pawn 4d.',
          1: '△同歩 gains the knight in hand and clears 4d between bishops 8h and 3c.',
        },
        branches: [
          {
            kind: 'alt',
            moves: '8h3c+ 2a3c 2e2d 2c2d 2h2d',
            notes: {
              1: '▲３三角成△同桂で角を交換します。桂２一が３三へ移りました。',
              4: '▲２四歩△同歩▲同飛で先手飛車が２四へ出ます。双方が角を持っていることも忘れないでください。',
            },
            notesEn: {
              1: '▲3三角成 △同桂 exchanges bishops and moves Gote’s knight from 2a to 3c.',
              4: '▲2四歩 △同歩 ▲同飛 advances Sente’s rook to 2d. Each side also holds a bishop.',
            },
            branches: [
              {
                kind: 'alt',
                moves: '4b4a 2d2c+ 5b4b',
                notes: {
                  0: '△４一飛で香１一を横から守ります。途中の３一・２一は空いています。',
                  1: '▲２三飛成で竜ができる応手を選びます。',
                  2: '△４二金は桂３三と銀４三を守る手です。竜２三へ直接当てる金の動きではありません。',
                },
                notesEn: {
                  0: '△4一飛 guards lance 1a along the rank through empty 3a and 2a.',
                  1: 'Sente selects ▲2三飛成, creating a dragon.',
                  2: '△4二金 guards knight 3c and silver 4c. It does not directly attack the dragon on 2c.',
                },
                comment:
                  '金４二は飛車４一も守り、飛車４一は香１一を守ります。先手は角と歩、後手は角・桂・歩を持ちます。竜で桂３三を取るなら金４二の取り返しまで読む必要があります。すべての駒取りが不可能だという意味ではありません。',
                commentEn:
                  'Gold 4b also guards rook 4a, which guards lance 1a. Sente holds a bishop and pawn; Gote holds a bishop, knight and pawn. A dragon capture of knight 3c must include the gold’s recapture. This is not a claim that every capture is impossible.',
              },
              {
                kind: 'alt',
                moves: 'P*2b B*3a 4b4a 3a2b+ 5b4b',
                notes: {
                  0: '歩で受ける別の比較として△２二歩打を選びます。',
                  1: '▲３一角打は飛車４二へ当てる手です。角交換で持った角を使います。',
                  2: '△４一飛を選びます。今度は飛車が角３一へ横に当たりました。',
                  3: '▲２二角成で角を動かし、打たれた歩を取りながら成ります。',
                  4: '△４二金で桂３三と銀４三を支えます。',
                },
                notesEn: {
                  0: 'For comparison, Gote selects the pawn defense △2二歩打.',
                  1: '▲3一角打 attacks rook 4b with the bishop acquired in the exchange.',
                  2: 'This example selects △4一飛, which now attacks bishop 3a along the rank.',
                  3: '▲2二角成 moves the bishop away and captures the dropped pawn with promotion.',
                  4: '△4二金 supports knight 3c and silver 4c.',
                },
                comment:
                  '先手は飛車２四に加え、馬２二を作り、歩二枚を持ちます。後手の手持ちは角と桂です。歩打ちで飛車の侵入を止めようとしても、持ち角からの当たりが別にある比較です。この枝だけで形勢や唯一の受けを断定しません。',
                commentEn:
                  'Sente has rook 2d and horse 2b, holding two pawns. Gote holds a bishop and knight. A pawn aimed at stopping the rook does not remove threats from a bishop in hand. This comparison makes no verdict on the position or claim of a unique defense.',
              },
            ],
          },
          {
            kind: 'alt',
            moves: '2e2d 3c8h+',
            notes: {
              0: '先手が角交換を見送り、▲２四歩と先に接触する比較です。',
              1: '△８八角成で後手から角を取ります。',
            },
            notesEn: {
              0: 'Sente postpones the bishop exchange and selects ▲2四歩 first.',
              1: '△8八角成 initiates the exchange from Gote’s side.',
            },
            branches: [
              {
                kind: 'alt',
                moves: '7h8h',
                comment: '▲同玉で取り返す応手を選びます。双方が角を持ち、後手は桂も持ちます。先手玉は７八から８八へ動きました。',
                commentEn: 'This branch selects ▲同玉. Both sides hold a bishop, and Gote also holds a knight. Sente’s king has moved from 7h to 8h.',
              },
              {
                kind: 'alt',
                moves: '7h6i',
                comment:
                  '▲６九玉も合法で、角をすぐ取り返さない選択です。後手馬８八が盤上に残り、先手にはまだ角の持ち駒がありません。取り返しを選んだ枝と区別します。',
                commentEn:
                  '▲6九玉 is also legal and postpones recapturing the bishop. Gote’s horse remains on 8h, and Sente has no bishop in hand yet. Distinguish this from the selected recapture branch.',
              },
            ],
          },
        ],
      },
    ],
  },
}
