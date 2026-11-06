export default {
  id: 'ibisha-vs-shikenbisha--45hayashikake',
  title: '四間飛車への４五歩：角道と交換する駒',
  titleEn: '▲4五歩 against Fourth File Rook: Bishop Lines and Exchanges',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '４五歩早仕掛けの標準的な角道を開く構想と、歩打ちで銀を動かす交換の考え方から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手が４五歩で接触し、後手が取った場合に角を交換する。比較枝では歩４五の打ち直しと銀・桂の交換を切り分ける。角交換後の枝では、飛車２四と歩６七に守られた角６六の配置を確かめる。',
  goalLabel: '４筋の歩を動かしたあとの角道を読む',
  goalSfen: 'ln1g4l/1ks1gr3/ppp2sn1p/3pp1pR1/5p3/2P1P1P2/PP1PS3P/2KGGS3/LN5NL w BPb2p 1',
  rootComment:
    '４六の歩を４五へ進め、４四の後手歩と接触します。４筋の歩が動くと角８八から３三への斜めの道が開きます。後手が取る場合と接触を残す場合を分け、交換が終わるたびに持ち駒を数えてください。',
  rootCommentEn:
    'Push the pawn from 4f to 4e against Gote’s pawn on 4d. Moving these pawns can open the diagonal from Sente’s bishop on 8h to 3c. Separate a capture from a reply that leaves the contact unresolved, and recount both hands after each exchange.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e',
    branches: [
      {
        kind: 'main',
        moves: '2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 6i6h 6c6d 3g3f 5c5d 4g4f 3b4c 4f4e',
        notes: {
          2: '△４二飛。４筋の歩が動いたあとは、この飛車の縦の道にも注意します。',
          13: '▲５七銀。左銀を中央へ運びました。右銀４八とは別の銀です。',
          19: '▲４六歩で４七が空きます。次に４五へ進める準備です。',
          21: '▲４五歩。４四の歩がどちらへ動くかで角道が変わります。',
        },
        notesEn: {
          2: '△4二飛 places Gote’s rook on the fourth file. Watch its vertical path after the pawns move.',
          13: '▲5七銀 develops the left silver centrally. The right silver remains on 4h.',
          19: '▲4六歩 clears 4g and prepares the advance to 4e.',
          21: '▲4五歩 creates contact. The bishop diagonal depends on Gote’s response with the pawn on 4d.',
        },
        branches: [
          {
            kind: 'main',
            moves: '4d4e 8h3c+ 2a3c 2e2d 2c2d 2h2d',
            notes: {
              0: 'この枝では△同歩を選びます。４四が空き、角８八から３三までの道が通りました。',
              1: '▲３三角成で角を取ります。３三は敵陣なので成れます。',
              2: '△同桂で後手が取り返します。双方が角を持ちました。',
              3: '▲２四歩で飛車先にも接触します。後手が歩で取る応手を続けます。',
              5: '▲同飛で歩を取り返します。後手歩４五を先手銀５七で直ちに取れるわけではありません。',
            },
            notesEn: {
              0: 'This line selects △同歩, clearing 4d and opening the diagonal from 8h to 3c.',
              1: '▲3三角成 captures the bishop and promotes in the enemy camp.',
              2: '△同桂 recaptures. Both sides now hold a bishop.',
              3: '▲2四歩 creates contact on the rook file. This example continues with Gote’s pawn capture.',
              5: '▲同飛 recaptures the pawn. Sente’s silver on 5g cannot immediately capture Gote’s pawn on 4e.',
            },
            comment:
              '先手飛車が２四へ出て、後手歩は４五に残り、双方に角の持ち駒があります。元の角道だけでなく、角打ちの候補も加わりました。相手玉８二への攻めと自玉７八の守りの両方を読みます。',
            commentEn:
              'Sente’s rook has reached 2d, Gote’s pawn remains on 4e, and both sides have a bishop in hand. Bishop drops now join the original diagonals as candidates. Read both attacks against king 8b and defense around king 7h.',
            branches: [
              {
                kind: 'alt',
                moves: '3c2e',
                notes: {
                  0: '△２五桂で桂が飛車２四のすぐ下へ来ました。',
                },
                notesEn: {
                  0: '△2五桂 places the knight immediately behind rook 2d.',
                },
                comment: 'この桂を飛車で取る手と、捕獲を見送って飛車交換を待つ弱い比較を分けます。',
                commentEn: 'Separate capturing this knight from the weaker comparison that waits for a rook exchange.',
                branches: [
                  {
                    kind: 'alt',
                    moves: '2d2e',
                    comment: '▲２五飛で桂を取れます。後手の盤上の駒では、この飛車を直ちに取り返せません。端歩で待つ前に、この捕獲を優先して比較します。',
                    commentEn:
                      '▲2五飛 captures the knight without an immediate recapture by a Gote board piece. Compare prioritizing that capture before waiting with an edge pawn.',
                  },
                  {
                    kind: 'deviation',
                    moves: '1g1f 4c4d',
                    notes: {
                      0: '▲１六歩は桂を取る機会を見送る弱い選択です。',
                      1: '△４四銀で３三を守る準備をします。銀４四は後ろ斜めの３三にも利きます。',
                    },
                    notesEn: {
                      0: '▲1六歩 is weaker because it misses the knight capture.',
                      1: '△4四銀 prepares control of 3c, a backward diagonal square for this silver.',
                    },
                    comment: '銀４四が３三を守っても、桂２五を飛車２四で取る手はまだ残っています。',
                    commentEn: 'Although silver 4d now guards 3c, rook 2d can still capture knight 2e.',
                    branches: [
                      {
                        kind: 'alt',
                        moves: '2d2e',
                        comment: '▲２五飛で桂を取れます。後手の盤上の駒では、この飛車を直ちに取り返せません。端歩で待つ前に、この捕獲を優先して比較します。',
                        commentEn:
                          '▲2五飛 captures the knight without an immediate recapture by a Gote board piece. Compare prioritizing that capture before waiting with an edge pawn.',
                      },
                      {
                        kind: 'deviation',
                        moves: '9g9f B*3c 2d2c+ 4b2b 2c2b 3c2b R*2a',
                        notes: {
                          0: '▲９六歩も桂２五を飛車で取る機会を見送る弱い待ち手です。以下はその選択を仮定して飛車交換の仕組みだけを比べます。',
                          1: '△３三角打は銀４四に守られ、２二を角が守ります。',
                          2: '▲２三飛成で角３三の当たりから外れます。桂２五がいるため、２八へは引けません。',
                          3: '△２二飛で飛車をぶつけます。角３三が取り返しを用意し、その角も銀４四が守ります。',
                          4: '▲同竜に△同角で飛車交換です。双方に飛車の持ち駒が入りました。',
                          6: '▲２一飛打で、交換した飛車を盤上へ戻します。後手の角２二に当たりますが、後手にも飛車の持ち駒があります。',
                        },
                        notesEn: {
                          0: '▲9六歩 is another weaker wait that misses the knight capture. The continuation assumes that choice to compare the rook-exchange mechanism.',
                          1: '△3三角打 is protected by silver 4d and guards 2b.',
                          2: '▲2三飛成 escapes the bishop attack. Knight 2e prevents a retreat through that square to 2h.',
                          3: '△2二飛 offers a rook exchange, with bishop 3c ready to recapture and silver 4d protecting that bishop.',
                          4: '▲同竜 and △同角 exchange rooks, giving each side a rook in hand.',
                          6: '▲2一飛打 returns the exchanged rook to the board and attacks the bishop on 2b. Gote still has a rook in hand too.',
                        },
                        comment:
                          '先手は角と歩、後手は飛車と歩二枚を持っています。先手飛車２一と後手角２二を確認します。飛車を交換したあとも相手の大駒の打ち込みは残るので、飛車打ちだけで攻めが決まるとはしていません。',
                        commentEn:
                          'Sente holds a bishop and pawn; Gote holds a rook and two pawns. Locate Sente’s rook on 2a and Gote’s bishop on 2b. Gote’s major-piece drops remain possible, so the rook drop alone is not a winning conclusion.',
                      },
                    ],
                  },
                ],
              },
              {
                kind: 'alt',
                moves: '4c3b B*6f',
                notes: {
                  0: '後手が銀を３二へ引く応手を比較します。',
                  1: '▲６六角打は歩６七に守られ、５五・４四を通って桂３三へ当たります。',
                },
                notesEn: {
                  0: 'Compare Gote retreating the silver to 3b.',
                  1: '▲6六角打 is protected by pawn 6g and attacks knight 3c through 5e and 4d.',
                },
                comment:
                  '飛車２四は２三へ、角６六は３三へ利きます。飛車の横の最初の升３四には後手歩があり、その歩を取る候補はあっても、その先へ飛び越すことはできません。角６六の守りは先手歩６七で確認します。選んだ銀の後退に対する配置例で、相手の応手をすべて退けた結論ではありません。',
                commentEn:
                  'Rook 2d controls 2c while bishop 6f controls 3c. Gote’s pawn on 3d is the first blocker sideways: the rook can consider capturing it but cannot jump beyond it. Sente’s pawn on 6g guards bishop 6f. This illustrates a placement after the selected silver retreat, not a conclusion against every defense.',
              },
              {
                kind: 'deviation',
                moves: '4b4a 2d2b+',
                notes: {
                  0: '後手が飛車を４一へ引き、２筋への進入を止めない応手を比べます。',
                  1: '▲２二飛成。２三が空いているため、２四から２二へ進んで成れます。',
                },
                notesEn: {
                  0: 'Compare Gote retreating the rook to 4a without preventing entry on the second file.',
                  1: '▲2二飛成 crosses the empty 2c square and promotes on 2b.',
                },
                comment:
                  '先手竜２二と後手飛車４一を確認します。この応手では飛車の成り込みを許しましたが、後手の角の持ち駒も残っています。竜を作ったことだけで勝ちとはせず、その後の王手と駒取りを読みます。',
                commentEn:
                  'Locate Sente’s dragon on 2b and Gote’s rook on 4a. This reply allowed promotion, but Gote still holds a bishop. Making a dragon alone is not a winning conclusion; continue reading checks and captures.',
              },
            ],
          },
          {
            kind: 'alt',
            moves: '1c1d 2i3g 1d1e 4e4d 4c4d P*4e 4d4e 3g4e 4b4e',
            notes: {
              0: '比較用に後手が端歩を進める応手を選びます。以下を強制する手順ではありません。',
              1: '▲３七桂は４五を守ります。',
              3: '▲４四歩で歩を取り、持ち歩を一枚得ます。',
              4: 'この例では後手が銀で取り返します。',
              5: '▲４五歩打で銀４四に当てます。自分の４筋の歩は取られているため二歩ではありません。',
              7: '△同銀に▲同桂で銀を取ります。',
              8: '△同飛で後手が桂を取り返しました。桂で銀を取った一手だけで損得を判定しないでください。',
            },
            notesEn: {
              0: 'This comparison selects an edge-pawn advance by Gote. The following sequence is not forced.',
              1: '▲3七桂 guards 4e.',
              3: '▲4四歩 captures a pawn and gains a pawn in hand.',
              4: 'This example selects Gote’s silver recapture.',
              5: '▲4五歩打 attacks the silver on 4d. Sente’s fourth-file pawn has been captured, so the drop is not nifu.',
              7: '△同銀 and ▲同桂 exchange the silver for the pawn and knight.',
              8: '△同飛 recaptures the knight. Count beyond the knight’s capture before judging the exchange.',
            },
            comment:
              '先手は銀を持ち、後手は桂と歩二枚を持っています。飛車４五と角３三は盤上に残っています。ここでは歩の打ち直しと銀・桂の交換だけを確認し、勝ち手順とはしていません。',
            commentEn:
              'Sente holds a silver; Gote holds a knight and two pawns. Gote’s rook on 4e and bishop on 3c remain on the board. This example isolates the pawn drop and silver–knight exchange without claiming a winning continuation.',
          },
          {
            kind: 'alt',
            moves: '6d6e 2e2d 2c2d 4e4d 3c4d 8h4d 4c4d 2h2d',
            notes: {
              0: '後手が６五歩を選び、接触を残す比較です。',
              1: '先に２筋で歩を取り合います。',
              3: '▲４四歩に△同角と取る別の応手です。',
              5: '▲同角を△同銀で取り返すと、２四を守っていた角３三が盤上から消えます。',
              7: '▲２四飛で歩を取ります。この順では△同角の取り返しはありません。',
            },
            notesEn: {
              0: 'This comparison selects △6五歩, leaving the fourth-file contact unresolved.',
              1: 'First exchange the second-file pawns.',
              3: 'Compare answering ▲4四歩 with the bishop capture △同角.',
              5: '▲同角 and △同銀 remove the bishop that previously guarded 2d from 3c.',
              7: '▲2四飛 captures the pawn without a bishop recapture in this position.',
            },
            comment:
              '双方が角を持ち、後手銀は４四、先手飛車は２四にいます。取り返す駒を角に変えたことで、その後に２四を守る角がなくなりました。銀で取る枝との違いを盤面で確かめます。',
            commentEn:
              'Both sides hold a bishop, with Gote’s silver on 4d and Sente’s rook on 2d. Choosing the bishop recapture changed the subsequent defense of 2d. Compare the actual board with the silver-capture branch.',
          },
        ],
      },
      {
        kind: 'deviation',
        moves: '8b4b 2e2d 2c2d 2h2d',
        notes: {
          0: '後手が角を３三へ動かさず、飛車を４二へ振る比較です。',
          1: '▲２四歩に△同歩を選ぶと、２四の守りを比べられます。',
          3: '▲同飛で歩を取ります。角２二は２四へ縦に動けないため、この飛車を角で取れません。',
        },
        notesEn: {
          0: 'Compare Gote swinging to 4b before developing the bishop to 3c.',
          1: 'This example answers ▲2四歩 with △同歩 to compare the defense of 2d.',
          3: '▲同飛 captures the pawn. A bishop on 2b cannot move vertically to recapture this rook on 2d.',
        },
        comment:
          '飛車２四まで進めた早い比較例です。後手がどの駒で２四を守るかが、歩交換後の取り返しを変えます。歩を取る応手を選んだ例であり、後手にほかの応手がないという意味ではありません。',
        commentEn:
          'This early comparison reaches rook 2d. The defender Gote chooses for 2d changes the recaptures after the pawn exchange. The example selects a pawn capture rather than claiming Gote has no other reply.',
      },
    ],
  },
}
