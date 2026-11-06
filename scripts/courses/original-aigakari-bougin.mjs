export default {
  id: 'aigakari--bougin',
  title: '相掛かりのUFO銀：２五までの道と角の守り',
  titleEn: 'Aigakari UFO Silver: The Route to 2e and the Bishop Defense',
  myStrategy: 'aigakari',
  opponentStrategy: 'aigakari',
  mySide: 'sente',
  userSide: 'sente',
  source: '相掛かりの標準的な歩交換とUFO銀の考え方を参考に独立して構成。序盤の候補手は新ペタショック定跡（MIT）で照合し、解説はこのアプリのために書き下ろし。',
  goalFormation:
    '先手の銀は３八・２七・３六を通って２五へ進む。後手角３三が２四を守った場合と、後手が別の駒を動かして歩交換を許す例を比べる。銀の進出だけで突破を断定しない。',
  goalLabel: '銀の進路と２四の守備駒を確認する',
  goalSfen: 'ln1gk1snl/1rs3gb1/p1pppp1p1/6p1p/7S1/9/PPPPPPP1P/1BG4R1/LNS1KG1NL w Pp 1',
  rootComment:
    '先手の相掛かりで、右銀を２筋の攻めに使う練習です。歩を交換したあと、銀を３八・２七・３六・２五へ運びます。銀が着いたら相手の角が２四を守れるかを調べ、攻め駒の位置と突破の成否を分けて考えましょう。',
  rootCommentEn:
    'Practice using Sente’s right silver in Aigakari. After the pawn exchanges, follow its route through 3h, 2g and 3f to 2e. Then inspect whether Gote’s bishop can defend 2d. Developing an attacking piece and proving a breakthrough are separate tasks.',
  line: {
    moves: '2g2f 8c8d 2f2e',
    branches: [
      {
        kind: 'main',
        moves: '8d8e 6i7h 4a3b 2e2d 2c2d 2h2d 1c1d 3i3h P*2c 2d2h 8e8f 8g8f 8b8f P*8g 8f8b 3h2g 3c3d 2g3f 7a7b 3f2e',
        notes: {
          1: '▲７八金。８七の歩を交換したあとも、金は８七を守れます。',
          5: '▲同飛で２四へ出ます。双方が歩を一枚ずつ持ちました。',
          6: '後手は△１四歩を選びました。２三への歩打ちはまだ指していません。',
          7: '▲３八銀。飛車を戻す前に銀を動かす、この手順の選択です。',
          9: '△２三歩に▲２八飛。銀を前へ運ぶため、飛車は後ろへ戻りました。',
          13: '▲８七歩で後手飛車の前に歩を置きます。歩の交換後、二歩にならずに打てることを確認します。',
          15: '▲２七銀。２六の歩は交換済みなので、銀は次に３六へ進めます。',
          17: '▲３六銀。自分の３七の歩は残し、銀がその前へ斜めに出ました。',
          19: '▲２五銀。２四・３四・１四に利く位置です。２四へ歩を打つ案は、相手の守りを見てから選びます。',
        },
        notesEn: {
          1: '▲7八金 can protect 8g after the pawn exchange on the eighth file.',
          5: '▲同飛 reaches 2d. Both sides now hold one pawn.',
          6: 'Gote chooses △1四歩 and has not yet dropped the pawn on 2c.',
          7: '▲3八銀 develops the silver before retreating the rook in this move order.',
          9: 'After △2三歩, ▲2八飛 returns the rook behind the silver’s route.',
          13: '▲8七歩 places a pawn in front of Gote’s rook. The earlier exchange makes this a legal drop without two unpromoted pawns on the file.',
          15: '▲2七銀 enters the second file. The pawn formerly on 2f has been exchanged, and the silver can continue to 3f.',
          17: '▲3六銀 steps diagonally in front of Sente’s pawn, which remains on 3g.',
          19: '▲2五銀 controls 2d, 3d and 1d. Inspect the defenders before deciding whether to drop a pawn on 2d.',
        },
        comment:
          '銀は２五、飛車は２八、持ち歩は一枚です。後手にはまだ角２二と歩２三があります。ここを攻めの準備ができた局面として観察し、角の展開によって２四の守りが変わる点を次の枝で確かめます。',
        commentEn:
          'The silver is on 2e, the rook on 2h, and Sente holds one pawn. Gote still has the bishop on 2b and pawn on 2c. Treat this as an attacking setup, then use the branches to examine how bishop development changes the defense of 2d.',
        branches: [
          {
            kind: 'alt',
            moves: '2b3c 7g7f',
            notes: {
              0: '△３三角で２四に角の利きが加わります。銀を前へ出す前に、この斜めの守りを数えます。',
              1: '▲７六歩で自分の角道を開ける例です。銀だけで急いで突破を狙わず、大駒の働きも整えます。',
            },
            notesEn: {
              0: '△3三角 adds the bishop’s diagonal defense of 2d. Count it before advancing the silver.',
              1: '▲7六歩 opens Sente’s bishop in this example, developing a major piece alongside the silver.',
            },
            comment: '後手角３三が２四を守り、先手角８八も角道を開けました。歩を打てることと、そのあと銀で安全に取り返せることは同じではありません。',
            commentEn:
              'Gote’s bishop on 3c defends 2d, while Sente has opened the bishop on 8h. Being able to drop a pawn does not by itself prove that a later silver capture is safe.',
          },
          {
            kind: 'deviation',
            moves: '6c6d P*2d 2c2d 2e2d',
            notes: {
              0: '後手が歩を６四へ進める比較例です。２四の角の守りは増えていません。',
              1: '▲２四歩。２五の銀が打った歩を守ります。 ▲３四銀で歩を取る別案もあります。ここは持ち歩を使って２四へ進む仕組みの比較です。',
              2: 'この例では後手が歩で取ります。取る以外の応手がないという意味ではありません。',
              3: '▲同銀で２四へ進みます。後ろの２八飛が銀を守ります。',
            },
            notesEn: {
              0: 'For comparison, Gote advances the pawn to 6d without adding a bishop defender to 2d.',
              1: '▲2四歩 drops a pawn protected by the silver on 2e. Capturing the pawn with ▲3四銀 is another option. This comparison instead uses the hand pawn to reach 2d.',
              2: 'Gote chooses to capture with the pawn in this example; the capture is not claimed to be forced.',
              3: '▲同銀 reaches 2d, supported by the rook on 2h.',
            },
            comment: '銀が２四まで進みました。後手が選んだ歩の捕獲に応じた一例です。実戦では、相手の角の位置と王手の有無も調べながら続きを読みます。',
            commentEn:
              'The silver has reached 2d after Gote’s chosen pawn capture. In a game, continue reading with the bishop’s position and possible checks in view.',
            branches: [
              {
                kind: 'alt',
                moves: '7b6c 7g7f 9c9d',
                comment:
                  '先手角８八の道は開きましたが、３三は後手角２二・金３二・桂２一に守られています。角で銀を守るだけでは、この守備駒の組合せを越えられません。',
                commentEn:
                  'Sente’s bishop diagonal is open, but Gote’s bishop 2b, gold 3b and knight 2a all control 3c. Bishop support alone does not overcome that combination of defenders.',
                branches: [
                  {
                    kind: 'deviation',
                    moves: '2d3c 2a3c',
                    comment:
                      '▲３三銀は△同桂で銀を取られる間違いです。銀を角で守っていても、後手角２二と金３二まで含む取り返しを確認する必要があります。さらに角で桂を取る手の問題を次の失敗例で読みます。',
                    commentEn:
                      '▲3三銀 is a mistake because △同桂 captures the silver. Bishop support alone does not account for Gote’s bishop on 2b and gold on 3b. The next mistaken comparison examines additionally capturing the knight with the bishop.',
                    branches: [
                      {
                        kind: 'deviation',
                        moves: '8h3c+ 2b3c',
                        comment:
                          '▲３三銀は△同桂で銀を取られる間違いです。さらに▲同角成と桂を取る手も選ぶと、△同角で馬まで取られ、先手は銀と角を桂と交換してしまいます。角で取り返すことは強制ではありません。桂が１三へ動いた前の比較と、守備駒の違いを確かめます。',
                        commentEn:
                          '▲3三銀 is a mistake because △同桂 captures the silver. If Sente additionally chooses ▲同角成, △同角 takes the horse: Sente has spent a silver and bishop for a knight. The bishop recapture is optional. Compare the defenders with the earlier position where the knight had moved to 1c.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            kind: 'alt',
            moves: '9c9d P*2d 6a6b 2d2c+ 3b2c 2e2d 2c2d 2h2d',
            notes: {
              0: '△９四歩を選ぶ比較です。',
              1: '▲２四歩打。銀２五が歩を守ります。',
              2: '△６二金は歩を取らず、別の守備駒を動かす応手です。',
              3: '▲２三歩成で歩を取り、と金が金３二へ当たります。',
              4: '△同金で金が２三へ出る応手を選びます。',
              5: '▲２四銀は飛車２八に守られます。',
              6: '△同金▲同飛まで数え、銀と金を交換します。',
            },
            notesEn: {
              0: 'This comparison selects △9四歩.',
              1: '▲2四歩打 is guarded by silver 2e.',
              2: '△6二金 develops another defender instead of capturing the pawn.',
              3: '▲2三歩成 captures a pawn and attacks gold 3b.',
              4: 'This selects △同金, drawing the gold to 2c.',
              5: '▲2四銀 is guarded by rook 2h.',
              6: 'Count △同金 ▲同飛: the silver has been exchanged for a gold.',
            },
            comment:
              '飛車２四と金の持ち駒を確認します。歩の成りで金を３二から２三へ動かし、銀を２四へ進めて金と交換しました。相手が歩を放置し、その後金で取る応手を選んだ仕組みの比較で、強制手順ではありません。',
            commentEn:
              'Locate rook 2d and the gold in hand. The pawn promotion drew the gold from 3b to 2c, and the silver advanced to 2d to exchange for it. This compares the mechanism against selected replies that leave the pawn and later capture with the gold; it is not forced.',
            branches: [
              {
                kind: 'alt',
                moves: '2a1c 7g7f 2b8h+ 7i8h',
                comment:
                  '後手が△１三桂を選び、▲７六歩の後に角を交換する比較です。▲同銀で双方が角を持ち、先手銀は８八へ移ります。ここでは飛車２四を残し、持ち角を使う準備をします。',
                commentEn:
                  'Gote selects △1三桂, then exchanges bishops after ▲7六歩. ▲同銀 gives each side a bishop and puts Sente’s silver on 8h. Keep rook 2d while preparing to use the bishop in hand.',
                branches: [
                  {
                    kind: 'alt',
                    moves: '1d1e',
                    notes: {
                      0: '△１五歩は強い飛車の成りを見送る弱い応手の例です。後手は持ち銀を△２二銀と使う別案もあります。',
                    },
                    notesEn: {
                      0: '△1五歩 is a weak reply that permits a stronger rook promotion. Gote can also consider using the silver in hand with △2二銀.',
                    },
                    comment:
                      '２四の飛車は２一へ成る手と、３四の歩を取る手を選べます。まず成りながら銀３一へ当てる手を優先する枝と、歩取りを優先した弱い比較を分けます。',
                    commentEn:
                      'Rook 2d can promote on 2a or capture the pawn on 3d. Separate prioritizing promotion with an attack on silver 3a from the weaker pawn-capture comparison.',
                    branches: [
                      {
                        kind: 'alt',
                        moves: '2d2a+ 6b6a 2a3a',
                        comment:
                          '▲２一飛成で銀３一へ当てます。この例で後手が△６一金と動かすと、▲３一龍で銀を取り、玉５一へ王手します。成りと相手玉への当たりを優先した比較です。△６一金やこの続きが強制とはせず、詰みも断定しません。',
                        commentEn:
                          '▲2一飛成 attacks silver 3a. If Gote selects △6一金, ▲3一龍 captures that silver and checks king 5a. This prioritizes promotion and forcing contact with the king, without claiming the gold move is forced or asserting mate.',
                      },
                      {
                        kind: 'deviation',
                        moves: '2d3d 9d9e',
                        comment:
                          '▲３四飛は歩を取りますが、先に▲２一飛成と銀へ当てる機会を見送る弱い選択です。さらに後手が△９五歩を選ぶと、今度は▲３一飛成で銀を王手で取れます。後手には△４二銀打と銀３一を守る別案もあります。',
                        commentEn:
                          '▲3四飛 gains a pawn but is weaker because it misses the earlier promotion against the silver. If Gote additionally selects △9五歩, ▲3一飛成 can now capture silver 3a with check. Gote also has the defensive alternative △4二銀打, guarding silver 3a.',
                        branches: [
                          {
                            kind: 'alt',
                            moves: '3d3a+ B*4a S*4b',
                            comment:
                              '▲３一飛成は銀を取りながら王手です。△４一角打と合駒する応手には、▲４二銀打も王手になります。龍３一が銀４二を斜め一升で守ります。この王手の継続を、次の角打ちの比較と区別します。',
                            commentEn:
                              '▲3一飛成 captures a silver with check. Against the selected interposition △4一角打, ▲4二銀打 checks again. Dragon 3a guards silver 4b with its one-square diagonal move. Distinguish this forcing continuation from the bishop-drop comparison.',
                          },
                          {
                            kind: 'deviation',
                            moves: 'B*3c 3a4b',
                            comment: '角３三を銀４二で受ける応手を選びます。角を使う次の手では、２二への成りだけでなく銀４二を王手で取る手を比べます。',
                            commentEn: 'This selects the silver move to 4b against bishop 3c. Compare promotion on 2b with capturing silver 4b with check.',
                            branches: [
                              {
                                kind: 'alt',
                                moves: '3c4b+',
                                comment: '▲４二角成は銀を取って王手します。静かな２二角成より先に読む、駒を取りながら玉へ迫る手です。',
                                commentEn: '▲4二角成 captures the silver with check. Read this forcing capture before the quieter promotion on 2b.',
                              },
                              {
                                kind: 'deviation',
                                moves: '3c2b+',
                                comment:
                                  '▲２二角成は馬を作りますが、銀４二を王手で取る強い手を見送る比較です。馬の守りだけでなく、その前に指せた王手と駒取りも確認します。',
                                commentEn:
                                  '▲2二角成 makes a horse but passes up the stronger checking capture of silver 4b. Check the available forcing capture as well as the promoted piece’s protection.',
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
      {
        kind: 'alt',
        moves: '7a6b 2e2d 2c2d 2h2d',
        notes: {
          0: '後手が銀を６二へ出し、２四を角などで守らない早い比較です。',
          1: '▲２四歩で飛車先に接触します。この枝は後手が歩で取る応手を選びます。',
          3: '▲同飛。角２二は２四へ縦には動けず、この飛車を角で取れません。',
        },
        notesEn: {
          0: 'Compare Gote developing the silver to 6b before adding a defender of 2d.',
          1: '▲2四歩 creates rook-pawn contact. This branch selects Gote’s pawn capture.',
          3: '▲同飛 reaches 2d. Bishop 2b cannot move vertically to recapture the rook.',
        },
        comment:
          '双方が歩を一枚ずつ持ち、先手飛車が２四へ出ました。後手の選んだ銀の進出と歩の捕獲に対する、守りのない升を使う比較です。歩を取る以外の応手がないという主張ではありません。',
        commentEn:
          'Each side holds one pawn and Sente’s rook reaches 2d. This uses the unguarded square against the selected silver development and pawn capture, without claiming the capture is forced.',
      },
    ],
  },
}
