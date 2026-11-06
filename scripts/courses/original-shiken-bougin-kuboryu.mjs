export default {
  id: 'shikenbisha-vs-bougin--kuboryu',
  title: '久保流の四間飛車：６五歩から角を使い直す',
  titleEn: 'Kubo-Style Fourth File Rook: From △6五歩 to a Redeployed Bishop',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '棒銀に対する６五歩と３筋への飛車転換を新ペタショック定跡（MIT）の候補と照合。角交換後の打ち直し、銀の活動と飛車の再配置を独立した比較として構成し、説明を新しく執筆。',
  goalFormation:
    '後手四間飛車から飛車を３二へ移し、先手棒銀の３五歩に６五歩で応じる。比較枝で４五歩による角道の開通、角の交換と２七への打ち直し、馬４九と銀４五の活動を読む。',
  goalLabel: '歩の接触から大駒の交換後まで数える',
  goalSfen: 'ln1g3n1/1ks1g1r1l/ppp2sbpp/4ppp2/3p2PP1/2P1PP1S1/PP1PS3P/1BKGG2R1/LN5NL b - 1',
  rootComment:
    '後手四間飛車で、先手の棒銀に６筋の歩も使って向き合います。飛車を３筋へ移してから６五歩と伸ばす構想です。角を交換する場合と交換を見送る場合を分け、取った角をどこへ打ち直せるかまで読みます。',
  rootCommentEn:
    'As Gote Fourth File Rook, meet Climbing Silver with a plan using the sixth-file pawn too. Transfer the rook to the third file and advance to 6e. Compare exchanging bishops with postponing the exchange, then inspect where an acquired bishop can be redeployed.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 6i6h 5c5d 3g3f 3b4c 4g4f 6c6d 4h3g 1a1b 3g2f 4b3b 3f3e 6d6e',
    notes: {
      7: '△４二飛で四間飛車です。',
      17: '△７二銀が玉８二の隣を守ります。',
      23: '△４三銀は３四の歩を守ります。',
      25: '△６四歩で６五への準備をします。',
      28: '▲２六銀で先手が棒銀の銀を進めました。',
      29: '△３二飛で、相手が接触しようとする３筋へ飛車を移します。',
      30: '▲３五歩に対し、３筋の交換だけを見るのではありません。',
      31: '△６五歩で反対側にも歩を伸ばします。６四が空きますが、この歩だけで３五歩を取ったことにはなりません。',
    },
    notesEn: {
      7: '△4二飛 establishes Fourth File Rook.',
      17: '△7二銀 guards beside king 8b.',
      23: '△4三銀 guards the pawn on 3d.',
      25: '△6四歩 prepares a later move to 6e.',
      28: '▲2六銀 develops Sente’s Climbing Silver.',
      29: '△3二飛 transfers toward the file on which Sente is preparing contact.',
      30: 'After ▲3五歩, look beyond the third-file exchange alone.',
      31: '△6五歩 extends a pawn on the other side and clears 6d. It does not itself capture Sente’s pawn on 3e.',
    },
    comment:
      '後手の飛車３二・銀４三と歩６五、先手の銀２六・歩３五を確認します。次の枝では３四で歩を交換してから４五歩で角道を開けます。歩が動くたびに、角８八と３三の間の駒を確かめます。',
    commentEn:
      'Locate Gote’s rook on 3b, silver on 4c and pawn on 6e against Sente’s silver on 2f and pawn on 3e. The comparison exchanges pawns on 3d and opens the bishop diagonal with △4五歩. Recheck the blockers between bishops 8h and 3c after each pawn move.',
    branches: [
      {
        kind: 'alt',
        moves: '3e3d 4c3d 9g9f 9c9d 2h3h 4d4e',
        notes: {
          1: '▲３四歩△同銀で双方が歩を一枚持ちます。',
          3: '９筋の歩を双方が一つ進める比較です。',
          4: '▲３八飛と３筋へ飛車を合わせます。',
          5: '△４五歩で４四が空き、角８八と３三の道が通ります。',
        },
        notesEn: {
          1: '▲3四歩 △同銀 leaves one pawn in each hand.',
          3: 'Both sides advance their ninth-file pawn in this comparison.',
          4: '▲3八飛 transfers Sente’s rook to the third file.',
          5: '△4五歩 clears 4d and opens the diagonal between bishops 8h and 3c.',
        },
        comment: '銀３四が３筋にいるため、飛車３二と３八の間はまだ通っていません。ここでは先手が角を取るか、４五歩を取って角交換を見送るかを比較します。',
        commentEn:
          'Silver 3d still blocks the file between rooks 3b and 3h. Compare Sente capturing the bishop with taking the pawn on 4e and postponing that exchange.',
        branches: [
          {
            kind: 'alt',
            moves: '4f4e 3c8h+ 7h8h B*2g',
            comment:
              '先手は▲４五歩で角交換を見送る応手を選びます。△８八角成▲同玉で双方が角を持ち、△２七角打で飛車３八へ当てます。銀３四はまだ飛車３二と３八の間にいるため、先に角の当たりへ応じる場面です。',
            commentEn:
              'Sente selects ▲4五歩 instead of exchanging bishops. △8八角成 ▲同玉 gives each side a bishop; △2七角打 attacks rook 3h. Silver 3d still blocks the rook file. Address the bishop attack before moving that silver.',
            branches: [
              {
                kind: 'main',
                moves: '3h2h 2g4i+ 2f3g 3d4e',
                comment:
                  '▲２八飛と飛車が逃げてから、△４九角成で馬を作ります。▲３七銀の応手に△４五銀で歩を取ります。銀が３筋を離れても、先手飛車は２八なので飛車３二を直ちに取れません。後手は馬４九と銀４五、歩二枚を持ち、先手は角と歩二枚を持ちます。',
                commentEn:
                  'After ▲2八飛 escapes, △4九角成 creates a horse. Against ▲3七銀, △4五銀 captures the pawn. The silver can leave the third file because Sente’s rook is now on 2h and cannot immediately capture rook 3b. Gote has horse 4i, silver 4e and two pawns in hand; Sente holds a bishop and two pawns.',
                branches: [
                  {
                    kind: 'alt',
                    moves: 'B*2f 5d5e 2e2d 4e5f 5g5f 5e5f',
                    comment:
                      '双方が銀を持ち、後手歩は５六です。先手角２六は飛車２八に守られています。後手銀の歩取り、先手銀の取り返し、後手歩の取り返しを最後まで数えました。次は飛車を中央へ回す別の段階です。',
                    commentEn:
                      'Each side holds a silver and Gote’s pawn is on 5f. Sente’s bishop on 2f is guarded by rook 2h. Count the opposing silver capture, Sente’s silver recapture and Gote’s pawn recapture through to the end. The rook’s central transfer is a separate next stage.',
                    branches: [
                      {
                        kind: 'alt',
                        moves: '1g1f 3b3c 2f1e 3c5c P*5d 5c5d S*4e 5d8d 4e5f 8d7d 5f4e 7d7f P*3i',
                        comment:
                          '飛車７六は７七・７八を通って７九を守ります。△７九銀打なら玉８八への王手と金６八への当たりになります。馬で３九の歩を取れることと、この王手を優先することを次の枝で比較します。',
                        commentEn:
                          'Rook 7f guards 7i through 7g and 7h. △7九銀打 checks king 8h and attacks gold 6h. Next compare prioritizing that check with capturing the pawn on 3i using the horse.',
                        notes: {
                          1: '先手の▲１六歩に△３三飛と回ります。',
                          2: '▲１五角は歩１六に守られます。角が２六を離れても、この配置から飛車５三を斜めに取る手はありません。',
                          3: '△５三飛で中央へ回ります。',
                          4: '▲５四歩打は飛車への当たりです。',
                          5: '△同飛で歩を取ります。',
                          6: '▲４五銀打は飛車５四へ当たります。',
                          7: '△８四飛と横へ逃げます。',
                          8: '▲５六銀で残った歩を取る応手を選びます。',
                          9: '△７四飛と７筋へ向き直ります。',
                          10: '▲４五銀と銀を戻し、飛車７四が次に７六へ入っても５六の銀を横に取られない配置へ移ります。',
                          11: '△７六飛で７筋の歩を取ります。',
                          12: '▲３九歩打は３八を守りますが、この局面では強い王手の△７九銀打を許す弱い応手です。７七歩打なら飛車７六への当たりと７筋の遮断になります。',
                        },
                        notesEn: {
                          1: 'After the selected ▲1六歩, △3三飛 begins a transfer.',
                          2: '▲1五角 is guarded by pawn 1f. From this square the bishop cannot capture a rook on 5c diagonally.',
                          3: '△5三飛 transfers to the center.',
                          4: '▲5四歩打 attacks the rook.',
                          5: '△同飛 captures the pawn.',
                          6: '▲4五銀打 attacks rook 5d.',
                          7: '△8四飛 escapes sideways.',
                          8: 'Sente selects ▲5六銀, capturing the remaining pawn.',
                          9: '△7四飛 retargets the seventh file.',
                          10: '▲4五銀 retreats the silver, avoiding a sideways rook capture of it after △7六飛.',
                          11: '△7六飛 captures the seventh-file pawn.',
                          12: '▲3九歩打 controls 3h but is weak here because it allows the strong checking △7九銀打. ▲7七歩打 instead attacks rook 7f and blocks its file.',
                        },
                        branches: [
                          {
                            kind: 'alt',
                            moves: 'S*7i 8h9g',
                            comment:
                              '△７九銀打は王手です。飛車７六が銀を守るため、玉で銀を取れません。▲９七玉と逃げる応手を例にします。金６八への銀の利きも残りますが、ここで詰みや唯一の逃げ道を断定はしません。',
                            commentEn:
                              '△7九銀打 checks. Rook 7f guards the silver, preventing the king from taking it. This selects the escape ▲9七玉. The silver still attacks gold 6h, without asserting mate or a unique king escape.',
                          },
                          {
                            kind: 'deviation',
                            moves: '4i3i',
                            comment:
                              '△３九馬は歩を取れますが、守られた王手の△７九銀打を見送る弱い選択です。馬の追加の横一升の利きを確かめる失敗例として比べます。後手飛車７六・馬３九、先手角１五・銀４五を確認します。中央へ回る、歩の壁を取る、銀の当たりから横へ逃げる、残った歩へ戻る、馬で守備の歩を取る、という別々の仕事を比べました。相手の静かな応手を含む比較で、最善手や強制順を示すものではありません。',
                            commentEn:
                              '△3九馬 captures a pawn but is weaker because it misses the protected checking △7九銀打. Treat it as a mistaken comparison illustrating the horse’s additional one-square sideways move. Locate Gote’s rook on 7f and horse on 3i against Sente’s bishop on 1e and silver on 4e. Compare separate jobs: transfer centrally, capture a pawn blockade, escape a silver attack sideways, return to a remaining pawn and capture a defensive pawn with the horse. The comparison includes selected quiet replies and does not assert best play or a forced line.',
                          },
                        ],
                      },
                    ],
                    notes: {
                      0: '先手が▲２六角打と飛車２八に守られる升へ角を戻す比較です。角２六は馬４九を取る利きではありません。',
                      1: '△５五歩で５六を守ります。銀４五が５六へ進む前に歩の支えを用意します。',
                    },
                    notesEn: {
                      0: 'Sente selects ▲2六角, guarded by rook 2h. Bishop 2f does not attack horse 4i.',
                      1: '△5五歩 guards 5f before the silver advances there.',
                    },
                  },
                ],
              },
              {
                kind: 'deviation',
                moves: '5h4h 2g3h+ 4h3h',
                comment:
                  '▲４八金は飛車への当たりを見送る間違いです。△３八角成▲同金まで数えると、後手は角と引き換えに飛車を取っています。馬が残るという説明ではありません。',
                commentEn:
                  '▲4八金 is a mistake that ignores the attack on the rook. After △3八角成 ▲同金, Gote has exchanged a bishop for a rook. The horse does not remain on the board.',
              },
            ],
          },
          {
            kind: 'alt',
            moves: '8h3c+ 3b3c',
            notes: {
              0: '先手が▲３三角成と角交換を選ぶ別の枝です。',
              1: '△同飛で３三へ取り返します。',
            },
            notesEn: {
              0: 'The alternative selects ▲3三角成, exchanging bishops immediately.',
              1: '△同飛 recaptures on 3c.',
            },
            comment:
              '双方は角と歩を一枚ずつ持ちます。後手飛車３三と先手飛車３八の間には、まだ後手銀３四がいます。角交換の有無と、飛車の道が開いたかどうかを別々に判定します。',
            commentEn:
              'Each side holds a bishop and pawn. Gote’s silver on 3d still blocks the line between rooks 3c and 3h. Judge the bishop exchange separately from whether the rook file has opened.',
          },
        ],
      },
    ],
  },
}
