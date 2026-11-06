export default {
  id: 'shikenbisha-vs-anaguma--sokkou',
  title: '四間飛車の速攻：３九玉から４筋へ向かう',
  titleEn: 'Fourth File Rook Rapid Attack: From King 3i toward the Fourth File',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '玉３九で待機し右桂と角を使う四間飛車の標準的な速攻構想を、新ペタショック定跡（MIT）の候補手と照合。端で得た香の再投入、別の桂交換、角への取り返しを独立した比較枝として新しく構成。',
  goalFormation: '先手は玉３九・銀３八、桂２五・角７七から飛車を４八へ移す。後手の穴熊準備に対し、４筋の歩交換と持ち駒の投入、桂と銀の応手を比較する。',
  goalLabel: '攻めの道と自玉への角道を同時に読む',
  goalSfen: 'ln3gs2/1r2g2kl/p1pps1npp/4pppb1/1p1P3N1/2P2PP1P/PPB1P2P1/3S1RS2/LN1G1GK1L b - 1',
  rootComment:
    '先手四間飛車から、玉を３九に置いて右桂を使う構想を読みます。相手が穴熊へ向かう間に飛車を４八へ移しますが、速く攻めるだけで安全になるわけではありません。自玉への斜線と、それを止めたり取り返したりする駒も確認します。',
  rootCommentEn:
    'From Sente Fourth File Rook, examine a plan that keeps the king on 3i and uses the right knight. Transfer the rook to 4h while Gote prepares Anaguma, checking the opposing bishop’s diagonal and your actual blockers and recaptures alongside the attack.',
  line: {
    moves: '7g7f 8c8d 6g6f 8d8e 8h7g 3c3d 2h6h 5a4b 5i4h 4b3b 3i3h 5c5d 4h3i 7a6b 1g1f 6b5c 4g4f 2b3c 3g3f 3b2b 2i3g 4c4d 6f6e 1a1b 3g2e 3c2d 6h4h 6a5b 7i6h',
    notes: {
      6: '▲６八飛で四間飛車を選びます。',
      12: '▲３九玉。玉を２八まで運ばず、この升に置く構想です。',
      20: '▲３七桂で右桂を使い始めます。',
      22: '▲６五歩で角７七の斜線を６六から先へ開けます。後手歩４四がまだ途中を止めています。',
      24: '▲２五桂は角３三へ当たります。',
      25: 'この例では△２四角と逃がす応手を選びます。',
      26: '▲４八飛で４筋へ移ります。先手歩４六はまだ飛車の前にあります。',
      28: '▲６八銀は５七を守ります。角２四から３五・４六・５七への道では、今は先手歩４六が途中を止めています。',
    },
    notesEn: {
      6: '▲6八飛 chooses Fourth File Rook.',
      12: '▲3九玉 keeps the king here instead of continuing to 2h.',
      20: '▲3七桂 begins developing the right knight.',
      22: '▲6五歩 clears 6f on bishop 7g’s diagonal. Gote’s pawn on 4d still blocks that line farther ahead.',
      24: '▲2五桂 attacks bishop 3c.',
      25: 'This line selects the retreat △2四角.',
      26: '▲4八飛 transfers to the fourth file, still behind Sente’s pawn on 4f.',
      28: '▲6八銀 guards 5g. On the diagonal from bishop 2d through 3e and 4f toward 5g, Sente’s pawn on 4f is currently a blocker.',
    },
    branches: [
      {
        kind: 'main',
        moves: '2a3c',
        comment:
          '△３三桂は角７七の斜線上に新しい駒を置きます。先手は玉３九・銀３八、飛車４八・桂２五です。後手玉２二と香１二は穴熊の準備ですが、まだ玉１一・銀２二の配置ではありません。桂が加わった後は、４四歩を動かした場合の角道も読み直します。',
        commentEn:
          '△3三桂 adds a new blocker on bishop 7g’s diagonal. Sente has king 3i, silver 3h, rook 4h and knight 2e. Gote’s king on 2b and lance on 1b prepare Anaguma, but the king and silver have not reached 1a and 2b. Recalculate the diagonal if the pawn on 4d moves now that a knight has joined it.',
      },
      {
        kind: 'alt',
        moves: '9c9d',
        comment:
          '比較用に後手が△９四歩と別の筋を選ぶ局面です。ここからの枝は、この静かな応手を前提にした例で、同じ攻めがすべての受けに通るという意味ではありません。',
        commentEn:
          'For comparison, Gote selects the quiet △9四歩 on another file. The following examples start from that selected reply and do not claim the same attack succeeds against every defense.',
        branches: [
          {
            kind: 'deviation',
            moves: '2e1c+',
            comment: '▲１三桂成は、角で取る応手を見落とす弱い比較です。香で取る手順は、その応手を選んだ場合の条件付きの例です。',
            commentEn:
              '▲1三桂成 is the weaker comparison: the bishop can capture the knight. The lance-recapture line is conditional on Gote selecting that reply.',
            branches: [
              {
                kind: 'alt',
                moves: '2d1c',
                comment: '△１三角で成桂を取れます。先手には角を直ちに取り返す盤上の駒がなく、桂と歩の交換です。',
                commentEn: '△1三角 captures the promoted knight. Sente has no immediate board recapture of that bishop: this exchanges a knight for a pawn.',
              },
              {
                kind: 'alt',
                moves: '1b1c 1f1e 1c1e',
                notes: {},
                notesEn: {},
                comment: '後手香１五は角２四にも守られています。香で取り返す前に、この角の取り方を読みます。',
                commentEn: 'Gote’s lance on 1e is also guarded by bishop 2d. Read that bishop’s capture before recapturing with the lance.',
                branches: [
                  {
                    kind: 'deviation',
                    moves: '1i1e',
                    notes: {},
                    notesEn: {},
                    comment:
                      '▲同香は角２四から△１五角で取られます。先に得た後手香には自分の桂を支払っているため、さらに香を失う手を安全な攻めとして扱いません。',
                    commentEn:
                      '▲同香 allows bishop 2d to capture the lance on 1e. The earlier opposing lance cost Sente a knight, so this additional lance loss is not a safe attacking continuation.',
                    branches: [
                      {
                        kind: 'alt',
                        moves: '2d1e',
                        comment: '△１五角で香を取ります。元の角道を残したまま端の取り返しだけを見ると、この捕獲を見落とします。',
                        commentEn: '△1五角 captures the lance. Following only the edge recaptures overlooks the bishop’s existing diagonal.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            kind: 'alt',
            moves: '4f4e 2a3c 2e3c+ 2d3c 4e4d 5c4d',
            notes: {
              1: '△３三桂を選ぶ別の受けです。',
              3: '▲同桂成△同角で桂を交換します。後手角が３三へ戻りました。',
              5: '▲４四歩△同銀で、今度は銀を使う取り返しを選びます。',
            },
            notesEn: {
              1: 'Compare the defensive knight move △3三桂.',
              3: '▲同桂成 △同角 exchanges knights and returns Gote’s bishop to 3c.',
              5: '▲4四歩 △同銀 selects a silver recapture.',
            },
            comment: '後手銀４四を飛車で取る手と、歩を打つ弱い比較を分けます。角３三の取り返しには先手角７七も利いています。',
            commentEn:
              'Compare capturing silver 4d with the rook against the weaker pawn drop. Sente’s bishop on 7g also controls the recapture square if bishop 3c takes the rook.',
            branches: [
              {
                kind: 'alt',
                moves: '4h4d 3c4d 7g4d',
                comment: '飛車で銀を取り、△同角▲同角まで数えます。先手は飛車を渡して銀と角を得ました。最初の銀取りだけで交換を止めず、角の取り返しも含めます。',
                commentEn:
                  'Count the rook capture of the silver through △同角 ▲同角. Sente gives a rook for a silver and bishop; include both bishop recaptures rather than stopping at the first capture.',
              },
              {
                kind: 'deviation',
                moves: 'P*4e 4d5e 4h5h',
                comment:
                  '▲４五歩打は、飛車で銀を取る機会を見送る弱い比較です。△５五銀▲５八飛では銀は残り、飛車５八は金４九・６九に守られます。銀を捕まえた手順ではありません。',
                commentEn:
                  '▲4五歩打 is the weaker comparison, passing up the rook capture of the silver. After △5五銀 ▲5八飛, the silver remains and golds 4i and 6i guard rook 5h. This has not trapped the silver.',
              },
            ],
          },
          {
            kind: 'alt',
            moves: '4f4e 2d5g+ 6h5g',
            notes: {
              0: '▲４五歩で４六を空けたあとの角道を確認します。',
              1: '△５七角成は歩を取って成る合法手です。ただし飛車４八が途中にいるため、玉３九への王手ではありません。',
              2: '▲同銀で６八の銀が取り返せます。',
            },
            notesEn: {
              0: 'Inspect the bishop diagonal after ▲4五歩 clears 4f.',
              1: '△5七角成 legally captures a pawn and promotes. It does not check king 3i because rook 4h blocks the diagonal farther along.',
              2: '▲同銀 recaptures with the silver from 6h.',
            },
            comment:
              '角を取れたのは銀６八が５七を守っていたからです。先手は角、後手は歩を持ちます。攻めの歩を動かすときも、自玉への途中の駒と、相手の成り込みへの取り返しを合わせて確かめます。',
            commentEn:
              'The recapture works because silver 6h guarded 5g. Sente holds a bishop and Gote a pawn. When advancing an attacking pawn, inspect both the blockers toward your king and the recapture available against an opposing promotion.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: '9c9d 3f3e 2d3e',
        comment:
          'この比較では後手が９四歩を選び、先手が３五歩と歩を差し出します。△同角で歩を取った後は、３六の先手歩がなくなっており、角３五を歩で取る手はありません。端の香を取り返す升１五への角２四の利きも外れました。',
        commentEn:
          'This comparison selects △9四歩 and Sente offering the pawn with ▲3五歩. After △同角 captures it, the former pawn on 3f is gone and cannot capture the bishop on 3e. The bishop has also left the diagonal from 2d to the lance’s recapture square on 1e.',
        branches: [
          {
            kind: 'deviation',
            moves: '2e1c+',
            comment: '▲１三桂成は、角で取る応手を見落とす弱い比較です。香で取る手順は、その応手を選んだ場合の条件付きの例です。',
            commentEn:
              '▲1三桂成 is the weaker comparison: the bishop can capture the knight. The lance-recapture line is conditional on Gote selecting that reply.',
            branches: [
              {
                kind: 'alt',
                moves: '3e1c',
                comment: '△１三角で成桂を取れます。先手には角を直ちに取り返す盤上の駒がなく、桂と歩の交換です。',
                commentEn: '△1三角 captures the promoted knight. Sente has no immediate board recapture of that bishop: this exchanges a knight for a pawn.',
              },
              {
                kind: 'alt',
                moves: '1b1c 1f1e 1c1e 1i1e 5b5a',
                notes: {
                  0: '△同香は、角３五で桂を取る手を見送った選んだ応手です。',
                  3: '△同香▲１五歩△同香▲同香まで、端で桂・歩・香を交換しました。先手は香と歩を持ちます。',
                  4: '△５一金は△１七角成の王手を見送る弱い待ち手として選びます。先手は今、持ち香でその道を止められます。',
                },
                notesEn: {
                  0: 'The selected △同香 passes up bishop 3e capturing the knight.',
                  3: '△同香 ▲1五歩 △同香 ▲同香 exchanges a knight, pawn and lance at the edge. Sente holds a lance and pawn.',
                  4: '△5一金 is selected as a weaker waiting move, passing up the checking △1七角成. Sente can now block that route with the lance in hand.',
                },
                comment: '端の交換後、香１五と角３五が残ります。次の香打ちでは、飛車を狙う前に自玉への角成りの道を確認します。',
                commentEn:
                  'After the edge exchange, lance 1e and bishop 3e remain. Before using the captured lance to attack, inspect the bishop’s promotion route toward your king.',
                branches: [
                  {
                    kind: 'alt',
                    moves: 'L*2f',
                    comment: '▲２六香打は歩２七に守られ、角３五から１七への道を止めます。端で取った香を守りへ使い、△１七角成の王手を防ぐ選択です。',
                    commentEn:
                      '▲2六香打 is guarded by pawn 2g and blocks the bishop’s path from 3e to 1g. It redeploys the captured lance defensively, preventing the immediate checking △1七角成.',
                  },
                  {
                    kind: 'deviation',
                    moves: '4f4e 8b4b',
                    comment: '▲４五歩は▲２六香打の守りを後回しにする弱い比較です。後手も△１七角成の王手を見送って△４二飛を選びます。',
                    commentEn:
                      '▲4五歩 is the weaker comparison, postponing the defensive ▲2六香打. Gote also passes up the checking △1七角成 and selects △4二飛.',
                    branches: [
                      {
                        kind: 'deviation',
                        moves: '4e4d 5c4d',
                        comment: '▲４四歩も角の王手を止めません。△同銀は、ここでも王手を見送って歩を取る選んだ応手です。',
                        commentEn:
                          '▲4四歩 still leaves the checking bishop promotion available. The selected △同銀 again passes up that check to capture the pawn.',
                        branches: [
                          {
                            kind: 'deviation',
                            moves: 'P*4e 4d5e',
                            comment: '▲４五歩打も香による守りを後回しにする比較です。後手が再び王手を見送って△５五銀を選んだ局面から、二つの香打ちを比べます。',
                            commentEn:
                              '▲4五歩打 again postpones the lance defense. Gote once more passes up the check and selects △5五銀; compare the two lance drops from that conditional position.',
                            branches: [
                              {
                                kind: 'alt',
                                moves: 'L*2f',
                                comment: '▲２六香打は歩２七に守られ、角３五から１七への道を止めます。端で取った香を守りへ使い、△１七角成の王手を防ぐ選択です。',
                                commentEn:
                                  '▲2六香打 is guarded by pawn 2g and blocks the bishop’s path from 3e to 1g. It redeploys the captured lance defensively, preventing the immediate checking △1七角成.',
                              },
                              {
                                kind: 'deviation',
                                moves: 'L*4d 3e1g+ 3i2i',
                                comment:
                                  '▲４四香打は飛車４二へ当たりますが、△１七角成の王手を見落とす弱い比較です。▲２九玉と逃げた後も相手の桂打ちなどを読みます。飛車への当たりだけで、攻めが成功したとは判断しません。',
                                commentEn:
                                  '▲4四香打 attacks rook 4b but is the weaker comparison: it overlooks △1七角成 with check. After ▲2九玉, further threats such as knight drops still need calculation. An attack on the rook alone does not establish a successful attack.',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}
