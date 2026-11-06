export default {
  id: 'sujichigaikaku--basic',
  title: '筋違い角：角の目標と向かい飛車の準備',
  titleEn: 'Wrong-Diagonal Bishop: Targets and Opposing Rook Preparation',
  myStrategy: 'sujichigaikaku',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '早い角交換と４五角打という標準的な戦法の定義を新ペタショック定跡（MIT）の収録手と照合。歩を取る角、守る飛車・銀、向かい飛車の駒組みを独立した比較に組み直し、説明を新しく執筆。',
  goalFormation:
    '早い角交換から角４五で３四と６三を狙う。歩を取った角は５六へ戻し、銀６六・桂７七と飛車８八を組み合わせる。中央の銀による歩取りと、銀に支えられた８筋の歩交換・歩打ちを別の枝で読む。',
  goalLabel: '角の目標と銀の支えを分けて読む',
  goalSfen: 'lnkg3nl/2s1gr3/pppp2spp/4pp3/9/1PPSB4/P1NPPPPPP/1RG6/L3KGSNL w Pb 1',
  rootComment:
    '角交換で持ち角を作り、４五へ打つ筋違い角を試します。角だけで攻め続けるのではなく、歩を取った後の戻り場所と、飛車を８筋へ移す準備も追います。表示する応手は比較例で、歩一枚を取ることを局面全体の優位とはしません。',
  rootCommentEn:
    'Try the Wrong-Diagonal Bishop: exchange bishops early, then drop on 4e. Follow both the bishop’s retreat after capturing a pawn and preparations to transfer the rook to the eighth file. The replies are comparisons; gaining a pawn does not establish an overall advantage.',
  line: {
    moves: '7g7f 3c3d 8h2b+ 3a2b B*4e',
    notes: {
      2: '▲２二角成で相手角を取ります。',
      3: '△同銀で双方が角を持ちます。',
      4: '▲４五角打は３四の歩と６三の歩を斜めに狙います。初めの角とは色の違う升へ打ち直した形です。',
    },
    notesEn: {
      2: '▲2二角成 captures the opposing bishop.',
      3: '△同銀 gives each side a bishop in hand.',
      4: '▲4五角打 targets pawns 3d and 6c diagonally. The dropped bishop occupies the other square color from its original square.',
    },
    comment: '角４五から３四と６三の二方向を盤上で追ってください。後手がどちらの歩を守るかで、先手角の進路が変わります。',
    commentEn: 'Trace both diagonals from bishop 4e to 3d and 6c. Gote’s choice of which pawn to defend changes the bishop’s route.',
    branches: [
      {
        kind: 'main',
        moves: '8b6b 4e3d 6b4b 3d5f',
        notes: {
          0: '△６二飛は６三の歩を後ろから守ります。',
          1: '▲３四角で歩を一枚持ちます。',
          2: '△４二飛は４三の歩を守る配置です。',
          3: '▲５六角へ戻します。８三への斜線は６五・７四を通ります。',
        },
        notesEn: {
          0: '△6二飛 guards pawn 6c from behind.',
          1: '▲3四角 gains a pawn in hand.',
          2: '△4二飛 guards pawn 4c.',
          3: '▲5六角 retreats. Its diagonal toward 8c passes through 6e and 7d.',
        },
        branches: [
          {
            kind: 'main',
            moves: '7a7b 7i8h 5a6b 8h7g 6b7a 2h8h 4a5b 8g8f 5c5d 7g6f 4c4d 8i7g 2b3c 6i7h',
            notes: {
              0: '△７二銀が８三の歩を守ります。',
              3: '銀を７九から８八・７七へ進め、飛車を回る８八を空けます。銀が８八にいる間は後手の角打ちもその升へはできません。',
              5: '▲８八飛で向かい飛車へ移ります。',
              9: '▲６六銀は５五・７五へ進める位置です。',
              11: '▲７七桂。銀が７七を空けてから跳ねます。',
              13: '▲７八金で８八を守ります。飛車８八が動いた後も、角打ちへの取り返しを残します。',
            },
            notesEn: {
              0: '△7二銀 guards pawn 8c.',
              3: 'Develop the silver through 8h to 7g, clearing 8h for the rook. While the silver occupies 8h, Gote cannot drop a bishop onto that square.',
              5: '▲8八飛 establishes Opposing Rook.',
              9: '▲6六銀 can next reach 5e or 7e.',
              11: '▲7七桂 follows after the silver clears 7g.',
              13: '▲7八金 guards 8h, keeping a recapture against a bishop drop even after the rook moves.',
            },
            comment:
              '角の歩取りと飛車の配置替えは別の仕事です。銀６六が６五・５五・７五へ、桂７七が６五・８五へ利くことを確認します。次は中央の歩取りと８筋への銀の支えを比較します。',
            commentEn:
              'The bishop’s pawn capture and the rook transfer are separate jobs. Silver 6f controls 6e, 5e and 7e; knight 7g controls 6e and 8e. Next compare a central pawn capture with silver support on the eighth file.',
            branches: [
              {
                kind: 'alt',
                moves: '5d5e 6f5e 4b4c 5e6f',
                comment:
                  '△５五歩を▲同銀で取る比較です。△４三飛に銀は６六へ戻り、先手の持ち歩は二枚です。銀５五は角５六の斜線上にはいなかったため、この後退で角道が新しく開いたとは数えません。',
                commentEn:
                  'Compare △5五歩 ▲同銀. Against △4三飛 the silver returns to 6f, leaving Sente two pawns in hand. Silver 5e was not on bishop 5f’s diagonal, so the retreat does not newly open that bishop line.',
                branches: [
                  {
                    kind: 'alt',
                    moves: '7a8b 6f7e 1c1d 8f8e 2c2d 8e8d 8c8d P*8c',
                    comment:
                      '先手は銀を７五へ運んでから８筋を接触させます。後手が１四歩・２四歩と別の筋を進める間に、銀７五で８四を支える形を作ります。△８四同歩には、銀で取る前に▲８三歩打の王手を選びます。角５六が６五・７四を通って歩８三を守っています。後手の歩８四はまだ残り、飛車８八の線を遮っています。先手の元の８筋の歩は取られたので二歩ではありません。ここからの受けも必要で、突破を断定する図ではありません。',
                    commentEn:
                      'Develop the silver to 7e before contact on the eighth file. The selected △1四歩 and △2四歩 let Sente arrange silver support for 8d. After △同歩 on 8d, choose the checking ▲8三歩打 before a silver recapture. Bishop 5f guards pawn 8c through 6e and 7d. Gote’s pawn remains on 8d, blocking rook 8h’s file. The drop is not nifu because Sente’s original eighth-file pawn was captured. Gote must still answer the check; this diagram does not establish a breakthrough.',
                  },
                  {
                    kind: 'alt',
                    moves: '4c4b 8f8e B*3b 9g9f 3b7f',
                    notes: {
                      0: '△４二飛は金５二に守られます。',
                      2: '△３二角打は飛車４二に守られます。',
                      3: '▲９六歩はこの比較で選んだ応手です。',
                      4: '△７六角で歩を取る応手を選びます。',
                    },
                    notesEn: {
                      0: '△4二飛 is guarded by gold 5b.',
                      2: '△3二角打 is guarded by rook 4b.',
                      3: '▲9六歩 is the selected reply for this comparison.',
                      4: 'This selects △7六角, capturing the pawn.',
                    },
                    comment:
                      '中央の歩５五を銀で取った後の別の比較です。後手角は飛車４二に守られた３二へ打たれ、４三・５四・６五を通って７六の歩を取る応手を選びます。ここで先手が歩を進める手と、飛車で角へ当てる手を区別します。',
                    commentEn:
                      'This comparison follows the silver’s capture of pawn 5e. Gote drops the bishop on 3b, guarded by rook 4b, then selects the pawn capture on 7f through 4c, 5d and 6e. Distinguish Sente advancing the pawn from using the rook to attack the bishop.',
                    branches: [
                      {
                        kind: 'deviation',
                        moves: '8h8f 7f4c',
                        comment:
                          '▲８六飛は横の角７六へ当たる手ですが、この比較では８四歩から歩を交換する攻めを先にする手より評価を落とします。角への当たりだけで最善とは数えません。△４三角と飛車４二に守られる升へ戻る応手を選ぶと、角を追っただけで駒を取ったわけではありません。',
                        commentEn:
                          '▲8六飛 attacks bishop 7f along the rank, but is weaker here than first making contact with ▲8四歩. An attack on the bishop does not establish the best move. The selected △4三角 retreats to a square guarded by rook 4b; chasing the bishop has not won a piece.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            kind: 'deviation',
            moves: '1c1d 5f8c+',
            comment: '△１四歩と７二銀の守りを省く例です。▲８三角成で歩を取って成れます。後手銀７一は８三へ届かず、飛車４二も８三を守っていません。',
            commentEn:
              '△1四歩 omits the silver’s guard from 7b. ▲8三角成 captures the pawn and promotes. Silver 7a cannot reach 8c, and rook 4b does not guard it.',
          },
        ],
      },
      {
        kind: 'deviation',
        moves: '9c9d 4e6c+',
        comment:
          '△９四歩と６三を守らない例には▲６三角成があります。６二の升を空けたままなので、飛車８二は歩６三を守っていません。相手が守る手を指した本筋と区別します。',
        commentEn:
          'After △9四歩 omits the defense of 6c, ▲6三角成 captures and promotes. Rook 8b does not guard pawn 6c with 6b still empty. Distinguish this omission from the defended main example.',
      },
    ],
  },
}
