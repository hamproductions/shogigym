export default {
  id: 'ibisha-vs-sankenbisha--37kei',
  title: '三間飛車への３七桂：５筋と４筋の歩を比べる',
  titleEn: '▲3七桂 against Third File Rook: Compare the Fifth- and Fourth-File Pawns',
  myStrategy: 'ibisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '三間飛車に対する３七桂早仕掛けの標準的な配置と歩交換の考え方から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '桂３七を用意し、５五歩と４五歩で接触する。後手５三銀と、４五で取り合って桂４五・左銀４六になる比較枝を区別する。５筋を動かさず角交換する枝では、桂が３七に残る違いを確認する。',
  goalLabel: '歩の交換後に残る桂と銀を数える',
  goalSfen: 'ln1g3nl/1ks1g2r1/ppp1s1bpp/3p1pp2/4pP1P1/2P3P2/PP1PS1N1P/1BK1GS1R1/LN1G4L b p 1',
  rootComment:
    '右桂を３七へ跳ね、左銀を５七へ運ぶ急戦です。歩を突く順で中央に残る駒が変わります。５筋を動かす本線と、４筋から角交換する枝を並べ、桂がどこに残り、誰に守られているかを比べてください。',
  rootCommentEn:
    'Prepare the right knight on 3g and the left silver on 5g. The pawn sequence changes which pieces remain in the center. Compare a line that first moves the fifth-file pawn with a fourth-file bishop exchange, tracking the knight’s square and its protection.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b3b 5i6h 3a4b 6h7h 5a6b 5g5f 6b7b 3g3f 4a5b 4i5h 7b8b 4g4f 6c6d 2i3g 3b2b 7i6h 7a7b 6h5g 5c5d',
    notes: {
      18: '▲４六歩で４五への接触を準備します。',
      20: '▲３七桂。桂は２五と４五に跳べます。３六歩が３七を空けたことも確認します。',
      21: '△２二飛で後手が飛車を２筋へ寄せる例です。もとの三間飛車から配置が変わりました。',
      24: '左銀は７九から６八・５七へ来ました。右銀４八は自陣に残っています。',
    },
    notesEn: {
      18: '▲4六歩 prepares contact on 4e.',
      20: '▲3七桂 can jump to 2e or 4e. Notice that ▲3六歩 cleared its destination on 3g.',
      21: 'Gote chooses △2二飛, shifting from Third File Rook to the second file.',
      24: 'The left silver has traveled from 7i through 6h to 5g. The right silver remains on 4h.',
    },
    branches: [
      {
        kind: 'main',
        moves: '5f5e 5d5e 4f4e 4b5c',
        notes: {
          0: '▲５五歩に後手が歩で取る応手を選びます。',
          2: '▲４五歩で次の接触です。桂３七は４五に利いています。',
          3: '△５三銀で後手は４四の歩を残します。３七桂の利きがあっても、歩を取る応手に限定できません。',
        },
        notesEn: {
          0: 'This line selects Gote’s pawn capture after ▲5五歩.',
          2: '▲4五歩 creates the next contact, supported by the knight on 3g.',
          3: '△5三銀 leaves the pawn on 4d in place. The knight’s control of 4e does not force Gote to capture there.',
        },
        comment:
          '後手歩５五と先手歩４五が残り、先手桂は３七、後手銀は５三です。比較枝では後手が４五の歩を取り、桂が進む例を見ます。実際の相手の応手によって駒の残り方を読み分けます。',
        commentEn:
          'Gote has a pawn on 5e, Sente a pawn on 4e, Sente’s knight remains on 3g and Gote’s silver stands on 5c. Compare the branch where Gote captures on 4e and the knight advances. Track the pieces resulting from the actual reply.',
      },
      {
        kind: 'alt',
        moves: '5f5e 5d5e 4f4e 4d4e 3g4e 3c4d 5g4f',
        notes: {
          0: '▲５五歩で中央に接触を作ります。ここでは後手が歩で取る応手を選びます。',
          2: '▲４五歩で４筋にも接触を作ります。',
          3: 'この比較例では後手が△同歩と取ります。後手には△５三銀などの別の応手もあり、この歩取りが最善という主張ではありません。',
          4: '△同歩に▲同桂。桂が３七から４五へ跳ね、歩を取りました。',
          5: 'この例では後手が角を４四へ動かします。５五の後手歩が、その角の５五方向の利きを途中で止めています。',
          6: '▲４六銀で桂４五を守ります。５七から４六へ来たのは左銀です。',
        },
        notesEn: {
          0: '▲5五歩 creates central contact. This line selects Gote’s pawn capture.',
          2: '▲4五歩 creates contact on the fourth file too.',
          3: 'This comparison selects △同歩. Gote also has replies such as △5三銀; the pawn capture is not presented as the best defense.',
          4: 'After △同歩, ▲同桂 jumps from 3g to 4e and captures the pawn.',
          5: 'Gote chooses △4四角. Its own pawn on 5e blocks that diagonal beyond the pawn.',
          6: '▲4六銀 protects the knight on 4e. This is the left silver coming from 5g.',
        },
        comment:
          '桂４五・銀４六と、後手角４四・歩５五を確認します。先手は歩を一枚持ち、後手は二枚持っています。王手や駒取りが始まる前に、盤上の駒だけでなく合駒や打ち込みに使う持ち歩も数えます。',
        commentEn:
          'Locate the knight on 4e and silver on 4f, facing Gote’s bishop on 4d and pawn on 5e. Sente holds one pawn and Gote two. Count the pawns available for drops as well as the board pieces before reading further checks and captures.',
        branches: [
          {
            kind: 'alt',
            moves: '4d6b',
            comment:
              '角を６二へ戻す応手を比較します。銀４六をそのまま３五へ出すと、歩３四と角６二の斜線があるため安全な準備にはなりません。銀を別の経路へ運ぶ例と失敗例を分けます。',
            commentEn:
              'Compare the bishop retreat to 6b. Simply advancing silver 4f to 3e is unsafe against pawn 3d and the bishop’s diagonal. Separate a different silver route from that mistake.',
            branches: [
              {
                kind: 'deviation',
                moves: '4f3e 3d3e 3f3e',
                comment:
                  '▲３五銀は△同歩で銀を取られる誤りです。▲同歩と取り返しても、銀を歩と交換したことに変わりはありません。後手角６二も５三・４四を通して３五へ利いています。',
                commentEn:
                  '▲3五銀 is a mistake because △同歩 takes it. ▲同歩 recaptures only a pawn, leaving a silver-for-pawn loss. Bishop 6b also controls 3e through 5c and 4d.',
              },
              {
                kind: 'alt',
                moves: '4f3g 7c7d 3g2f 9c9d 2f1e 5b5c 2e2d',
                notes: {
                  0: '▲３七銀と一度引きます。桂は４五に残ります。',
                  2: '▲２六銀。飛車２八が銀を後ろから守ります。',
                  4: '▲１五銀で２四を守る配置へ移ります。今の後手歩１三は１四を守り、１五を直接取る手ではありません。',
                  5: '△５三金はこの比較で選んだ応手です。後手には端歩など別の備え方もあります。',
                  6: '▲２四歩で飛車先へ接触します。',
                },
                notesEn: {
                  0: '▲3七銀 retreats while knight 4e remains.',
                  2: '▲2六銀 is guarded from behind by rook 2h.',
                  4: '▲1五銀 controls 2d. Gote’s pawn on 1c controls 1d and cannot immediately capture silver 1e.',
                  5: '△5三金 is the selected reply; Gote can also prepare with an edge-pawn move.',
                  6: '▲2四歩 creates rook-file contact.',
                },
                comment:
                  '銀１五が２四を支えます。後手の歩や金の移動を選んだ配置であり、この銀の経路を強制できるとはしません。後手が２四を取る順と、別の筋を進める順を比較します。',
                commentEn:
                  'Silver 1e supports 2d. This selects Gote’s pawn and gold developments rather than claiming that the silver route is forced. Compare accepting the pawn on 2d with advancing on another file.',
                branches: [
                  {
                    kind: 'alt',
                    moves: '2c2d 2h2d 2b2d 1e2d',
                    comment:
                      '△同歩▲同飛△同飛▲同銀と取り返します。銀を１五へ置いたことが、２四の飛車交換後の取り返しを可能にしました。桂４五を残し、銀２四と双方の飛車の持ち駒を確認します。先手は歩二枚、後手は歩三枚です。',
                    commentEn:
                      'Count △同歩 ▲同飛 △同飛 ▲同銀. Silver 1e makes the recapture on 2d possible after the rook exchange. Knight 4e remains, the silver reaches 2d, and each side holds a rook. Sente holds two pawns and Gote three.',
                  },
                  {
                    kind: 'alt',
                    moves: '6d6e 2d2c+',
                    comment: '△６五歩と２筋を取らない応手には▲２三歩成で歩を取り、飛車２二へ当てる比較です。飛車２八がと金２三を守っています。',
                    commentEn: 'Against the selected △6五歩 leaving the second file, ▲2三歩成 captures the pawn and attacks rook 2b. Rook 2h guards the tokin.',
                    branches: [
                      {
                        kind: 'deviation',
                        moves: '2b2c 2h2c+',
                        comment:
                          '△同飛は守られたと金を取る誤りです。▲同飛成で取り返し、先手は龍２三と飛車の持ち駒を得ます。途中の２七・２六・２五・２四は空いています。',
                        commentEn:
                          '△同飛 mistakenly captures the protected tokin. ▲同飛成 recaptures, giving Sente a dragon on 2c and a rook in hand. The intervening 2g, 2f, 2e and 2d squares are empty.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        kind: 'alt',
        moves: '4f4e 4d4e 8h3c+ 2a3c',
        notes: {
          0: '５筋を動かさず、先に▲４五歩と突く比較例です。',
          2: '△同歩で４四が空いたあと、▲３三角成で角を交換します。',
          3: '△同桂で後手の桂が３三へ来ました。先手の桂は３七に残っています。',
        },
        notesEn: {
          0: 'For comparison, push ▲4五歩 before moving the fifth-file pawn.',
          2: '△同歩 clears 4d, allowing ▲3三角成 to exchange bishops.',
          3: '△同桂 brings Gote’s knight to 3c. Sente’s knight remains on 3g.',
        },
        comment:
          'この枝では双方が角を持ち、５筋の歩は５六と５四に残ります。取り合う枝の桂４五・銀４六と同じ局面ではありません。歩の順が違うと、その後の駒交換と持ち駒も変わることを確認します。',
        commentEn:
          'Both sides hold a bishop here, and the fifth-file pawns remain on 5f and 5d. This is a different position from the capture branch’s knight on 4e and silver on 4f. Changing the pawn order also changes later exchanges and hands.',
      },
    ],
  },
}
