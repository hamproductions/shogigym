export default {
  id: 'ibisha-vs-shikenbisha--bougin',
  title: '四間飛車への棒銀：３筋の遮断と飛車の道',
  titleEn: 'Climbing Silver against Fourth File Rook: Blockers on the Third File',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source: '四間飛車に対する棒銀の銀３七・２六と３筋の歩交換の構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '右銀２六、左銀５七、飛車３八で３筋に向き合う。後手も飛車を４二から３二へ移し、銀３四が飛車同士の間に残る。比較枝は銀がそれたときの飛車捕獲と、その後の歩成り・取り返しを扱う。',
  goalLabel: '飛車の間に残る銀を確認する',
  goalSfen: 'ln5nl/1ksggbr2/ppp4pp/3ppps2/5P1P1/2P1P2S1/PP1PS3P/1BK1G1R2/LN1G3NL w Pp 1',
  rootComment:
    '右銀を４八・３七・２六へ運ぶ棒銀です。３五歩の接触に飛車を合わせますが、後手も四間飛車から３二へ飛車を移します。３筋に誰が残って飛車の道を止めるかを見てください。',
  rootCommentEn:
    'Develop the right silver through 4h and 3g to 2f. Match the third-file pawn contact with the rook, while Gote shifts from Fourth File Rook to 3b. Track the piece that remains between the two rooks.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5i6h 3a3b 6h7h 5a6b 5g5f 6b7b 3g3f 4a5b 4i5h 7b8b 4h3g 7a7b 3g2f 3b4c 7i6h 6c6d 6h5g 5c5d 4g4f 6a6b 3f3e 4b3b 2h3h 3c4b 3e3d',
    notes: {
      18: '▲３七銀。３六歩で空けた升へ右銀を進めます。',
      20: '▲２六銀。２五歩と飛車２八が同じ筋にいます。',
      28: '▲３五歩で後手歩３四と接触します。',
      29: '△３二飛で後手が戦いの筋へ飛車を寄せます。',
      30: '▲３八飛。飛車を移しても、３五と３四の歩が残る間は３二まで通りません。',
    },
    notesEn: {
      18: '▲3七銀 develops the right silver onto the square cleared by ▲3六歩.',
      20: '▲2六銀 joins the pawn on 2e and rook on 2h on one file.',
      28: '▲3五歩 challenges Gote’s pawn on 3d.',
      29: '△3二飛 brings Gote’s rook toward the contact.',
      30: '▲3八飛 changes files, but the pawns on 3e and 3d still block a route to 3b.',
    },
    branches: [
      {
        kind: 'main',
        moves: '4c3d 4f4e',
        notes: {
          0: '歩交換後、後手銀が３四に来ました。双方の飛車の間をこの銀が止めています。',
          1: '▲４五歩。後手が銀で取ると３四が空きます。歩で取る場合や、取らずに指す場合は別に読みます。',
        },
        notesEn: {
          0: 'After the pawn exchange, Gote’s silver stands on 3d between the two rooks.',
          1: '▲4五歩 would clear 3d if the silver captured. A pawn capture or a move elsewhere must be read separately.',
        },
        comment:
          '銀３四が残っているので、先手飛車３八はまだ後手飛車３二を取れません。歩４五を取れるかは、取る駒を動かしたあとの盤面で判断します。比較枝では銀で取る具体的な失敗を追います。',
        commentEn:
          'The silver on 3d still blocks Sente’s rook from capturing the rook on 3b. Assess a capture of the pawn on 4e from the resulting position. The comparison follows the concrete mistake of capturing with the silver.',
        branches: [
          {
            kind: 'deviation',
            moves: '3d4e 3h3b+ 2c2d P*3d 1c1d',
            notes: {
              0: '△同銀は３筋の遮断を外す失敗例です。',
              1: '▲３二飛成で後手飛車を取り、竜になります。後手角４二は竜へ横には動けないので、その角で直ちに取り返せません。',
              2: 'ここからの△２四歩と△１四歩は、と金の変化を比較するために選んだ応手です。最善の抵抗とはしていません。',
              3: '▲３四歩打。３筋の自分の歩は交換で消えているので打てます。',
            },
            notesEn: {
              0: '△同銀 is a mistake that removes the blocker from the third file.',
              1: '▲3二飛成 captures the rook and promotes. The bishop on 4b cannot move sideways to recapture this dragon immediately.',
              2: 'The following △2四歩 and △1四歩 are chosen replies for comparing pawn promotion, not claimed to be Gote’s best resistance.',
              3: '▲3四歩打 is legal because Sente’s original third-file pawn has been exchanged.',
            },
            comment: '竜３二と持ち飛車があります。次の角の展開と、と金を作る比較を分けます。と金や竜への桂２一の取り返しも数えます。',
            commentEn:
              'Sente has a dragon on 3b and a rook in hand. Compare developing the bishop with making a tokin, including knight 2a’s captures of the resulting pieces.',
            branches: [
              {
                kind: 'alt',
                moves: '8h4d',
                comment: '▲４四角と角を中央へ使う選択です。持ち飛車も残し、と金を急ぐ手と比べます。',
                commentEn: '▲4四角 develops the bishop centrally while retaining the rook in hand. Compare this with rushing the pawn promotion.',
              },
              {
                kind: 'deviation',
                moves: '3d3c+ 4b3c',
                comment: '▲３三歩成は、この比較では角の展開を見送る弱い手です。△同角でと金は残りません。続けて角を取る場合も桂２一を数えます。',
                commentEn:
                  '▲3三歩成 is the weaker comparison here, passing up bishop development. △同角 removes the tokin. Also count knight 2a before recapturing that bishop.',
                branches: [
                  {
                    kind: 'alt',
                    moves: 'R*3a',
                    comment: '▲３一飛打で持ち飛車を使い、桂２一へ横に当てます。竜３二も残っています。',
                    commentEn: '▲3一飛打 uses the rook in hand to attack knight 2a horizontally, while retaining the dragon on 3b.',
                  },
                  {
                    kind: 'deviation',
                    moves: '3b3c 2a3c',
                    comment:
                      '▲同竜は△同桂まで数えます。竜は残らず、先手は飛車と角、後手は飛車と歩三枚を持ちます。先に後手飛車を取った分の交換も含め、今の竜だけを見て駒得を決めません。',
                    commentEn:
                      'Count ▲同竜 through △同桂. The dragon is gone: Sente holds a rook and bishop, and Gote a rook and three pawns. Include the earlier capture of Gote’s rook when counting the entire exchange.',
                  },
                ],
              },
            ],
          },
          {
            kind: 'alt',
            moves: 'P*3f 4e4d 3f3g+ 3h3i 3g3h 3i5i 3h4i',
            notes: {
              0: '後手が△３六歩打と反撃する比較です。元の３筋の後手歩は交換されているので打てます。',
              1: '▲４四歩で後手歩を取ります。',
              2: '△３七歩成。先手も攻めだけを追うと飛車３八を取られます。',
              3: '▲３九飛と引き、△３八とには▲５九飛と移る例です。',
              6: '後手がと金を４九へ動かす応手を選びます。',
            },
            notesEn: {
              0: 'Compare Gote’s counterattack △3六歩打. Gote’s original third-file pawn has been exchanged, making the drop legal.',
              1: '▲4四歩 captures Gote’s pawn.',
              2: '△3七歩成 threatens the rook on 3h, so Sente cannot read only its own attack.',
              3: 'This example retreats with ▲3九飛, then moves to 5i after △3八と.',
              6: 'Gote chooses to move the tokin to 4i.',
            },
            comment:
              '後手と金４九は飛車５九へ横に利いています。先手歩４四を先に成ると、その間に飛車を取られるため、攻めの歩と自分の飛車への当たりを一緒に確認します。',
            commentEn:
              'Gote’s tokin on 4i attacks rook 5i sideways. Promoting the pawn on 4d first allows that rook capture; read the attack on your rook alongside your attacking pawn.',
            branches: [
              {
                kind: 'alt',
                moves: '5i4i',
                comment:
                  '▲４九飛で先に反撃のと金を取ります。飛車は４筋へ移り、歩４四を後ろから守ります。歩の成りを急ぐ前に、自分の飛車を取る駒を取り除いた順です。',
                commentEn:
                  '▲4九飛 first removes the counterattacking tokin. The rook transfers to the fourth file and guards pawn 4d from behind. Remove the attacker of your rook before rushing the pawn promotion.',
                branches: [
                  {
                    kind: 'deviation',
                    moves: '5b4c 4d4c+ 3d4c',
                    notes: {
                      0: '△４三金は先手歩４四の利きへ入る弱い応手です。銀３四が４三を守っていても、金を歩と交換されます。',
                      1: '▲同歩成で金を取ります。',
                      2: '△同銀で先手の最初のと金は消えました。',
                    },
                    notesEn: {
                      0: '△4三金 is weaker because it enters pawn 4d’s control. Silver 3d guards 4c, but Gote still exchanges a gold for a pawn.',
                      1: '▲同歩成 captures the gold.',
                      2: '△同銀 removes Sente’s first tokin.',
                    },
                    comment: '後手銀４三が最初のと金を取りました。飛車４九から銀４三を取れるため、歩を打ち直す前にその捕獲を比べます。',
                    commentEn:
                      'Gote’s silver on 4c has captured the first tokin. Rook 4i can now capture that silver, so compare the capture before redropping a pawn.',
                    branches: [
                      {
                        kind: 'alt',
                        moves: '4i4c+',
                        comment: '▲４三飛成で銀を取り、竜になります。持ち歩を打つ前に、すでに取れる駒を確認した例です。',
                        commentEn: '▲4三飛成 captures the silver and promotes. Check existing captures before spending a pawn from hand.',
                      },
                      {
                        kind: 'deviation',
                        moves: 'P*4d 4c5b 4d4c+',
                        comment:
                          '▲４四歩打は銀をすぐ取る手を見送る弱い比較です。△５二銀を選んだ後は▲４三歩成で拠点を作り直し、飛車３二と角４二へ当てます。飛車４九がと金を守り、先手は金と歩二枚、後手は歩一枚を持ちます。',
                        commentEn:
                          '▲4四歩打 is the weaker comparison, passing up the immediate silver capture. After the selected △5二銀, ▲4三歩成 rebuilds an anchor attacking rook 3b and bishop 4b. Rook 4i guards the tokin. Sente holds a gold and two pawns; Gote holds one pawn.',
                      },
                    ],
                  },
                ],
              },
              {
                kind: 'deviation',
                moves: '4d4c+ 4i5i 4c3b 5i5h 6i5h',
                comment:
                  '▲４三歩成を急ぐと、△５九とで飛車を取られます。▲３二とで後手飛車を取り返しても、△５八とで金を取られ、▲同金まで進むと飛車交換に加えて金を歩と交換した損が残ります。先に▲４九飛と反撃のと金を取る順と比較します。',
                commentEn:
                  'Rushing ▲4三歩成 allows △5九と to capture the rook. Even after ▲3二と takes Gote’s rook, △5八と captures a gold. After ▲同金, the rooks have been exchanged but Sente has additionally lost a gold for a pawn. Compare first removing the counterattacking tokin with ▲4九飛.',
              },
            ],
          },
          {
            kind: 'alt',
            moves: '5b5c 5g4f',
            notes: {
              0: '後手が△５三金と構える応手を比較します。',
              1: '▲４六銀で左銀も攻めに加えます。右銀２六と、左銀４六を区別します。',
            },
            notesEn: {
              0: 'Compare Gote’s quiet development △5三金.',
              1: '▲4六銀 adds the left silver. Distinguish it from the right silver on 2f.',
            },
            comment:
              '先手は銀二枚を２六と４六へ出しました。後手の４四歩が４五の先手歩を取ると銀４六への当たりにもなるため、銀を加えただけで攻めの成功とは決めません。',
            commentEn:
              'Sente now has silvers on 2f and 4f. Gote’s pawn capture from 4d to 4e would also attack the silver on 4f. Adding another silver alone does not prove the attack succeeds.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: '3b3d 2f3e 3d3b',
        notes: {
          0: '歩３四を銀ではなく飛車で取る応手を比べます。',
          1: '▲３五銀で飛車３四へ当てます。飛車３八が銀３五を守っています。',
          2: 'この例は△３二飛と引きます。△同飛と銀を取るなら、▲同飛で取り返せます。',
        },
        notesEn: {
          0: 'Compare recapturing pawn 3d with the rook rather than the silver.',
          1: '▲3五銀 attacks rook 3d, supported by Sente’s rook on 3h.',
          2: 'This example retreats to 3b. A rook capture of the silver would allow Sente’s rook recapture.',
        },
        comment:
          '後手飛車が３二へ戻り、先手銀は３五へ進みました。銀で取る本線では３四銀が残ります。取り返す駒を変えると、安い駒で大駒へ当てる手が生まれる違いを確認します。',
        commentEn:
          'Gote’s rook returns to 3b while Sente’s silver develops to 3e. The silver-recapture main line instead leaves a silver on 3d. Changing the recapturing piece allows a cheaper piece to attack the major piece.',
      },
    ],
  },
}
