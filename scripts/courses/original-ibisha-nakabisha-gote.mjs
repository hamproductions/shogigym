export default {
  id: 'ibisha-vs-nakabisha--gote',
  title: '後手居飛車穴熊：１一玉と中央の銀',
  titleEn: 'Gote Static Rook Anaguma: The King on 1a and a Central Silver',
  myStrategy: 'ibisha',
  opponentStrategy: 'nakabisha',
  mySide: 'gote',
  userSide: 'gote',
  source: '先手中飛車に対する後手居飛車穴熊の標準的な配置から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手玉１一、香１二、銀２二、金３一・３二の穴熊。飛車は８二に残し、もう一枚の銀を４四へ出す。５五で先手歩を取り、５四の歩で銀を支える。先手は飛車５八・銀６六で中央に構える。',
  goalLabel: '穴熊の守備駒と中央の交換を確認する',
  goalSfen: 'ln4gnk/1r4gsl/p1pp1pbpp/4p1p2/1p1Ps4/P1PS1PP1P/1PB4P1/2G1R1SK1/LN3G1NL b p 1',
  rootComment:
    '後手の居飛車で、先手の中飛車に対して１一へ玉を運びます。銀２二と金３一・３二を置くまでを追い、そのあと中央の銀４四と先手の歩５五の接触を比べます。先手番の穴熊を機械的に反転するのではなく、この手番で一手ずつ進めます。',
  rootCommentEn:
    'As Gote with Static Rook, build the king’s shelter on 1a against Sente’s Central Rook. Follow the silver to 2b and the golds to 3a and 3b, then examine the contact between Gote’s silver on 4d and Sente’s pawn on 5e. Play the actual turns rather than assuming a reversed Sente sequence works unchanged.',
  line: {
    moves:
      '5g5f 8c8d 7g7f 8d8e 8h7g 3c3d 6g6f 7a6b 2h5h 5c5d 7i6h 5a4b 5i4h 4b3b 4h3h 2b3c 3h2h 1a1b 3i3h 3b2b 6h6g 2b1a 6i7h 3a2b 1g1f 4a3a 9g9f 6a5b 4g4f 5b4b 3g3f 4b3b 6f6e 6b5c 6g6f 5c4d 5f5e 4d5e',
    notes: {
      8: '▲５八飛で先手が中飛車です。後手は飛車８二のまま、玉を右側の１一へ運びます。',
      15: '△３三角で２二を空けます。先手の角７七は、６六の先手歩で斜めの道が止まっています。',
      17: '△１二香。１一を空けてから玉が入ります。',
      21: '△１一玉。玉は隅へ入りましたが、銀３一と金４一はまだ移していません。',
      23: '△２二銀で玉の斜め前へ銀を寄せます。',
      25: '△３一金で玉側へ最初の金を寄せます。',
      31: 'もう一枚の金は５二・４二を通って３二へ来ました。金３一・３二と銀２二が穴熊の守備駒です。',
      35: '△４四銀で中央へ出ます。５五へはこの銀と５四の歩がともに利きます。',
      36: '▲５五歩で中央の接触ができました。先手銀６六も５五を守っています。駒を取る前に、双方の取り返しを数えます。',
      37: '△５五銀で歩を取ります。後手の５四歩がこの銀を守っています。',
    },
    notesEn: {
      8: '▲5八飛 establishes Sente’s Central Rook. Gote leaves the rook on 8b and walks the king toward 1a.',
      15: '△3三角 clears 2b. Sente’s own pawn on 6f still blocks the diagonal of the bishop on 7g.',
      17: '△1二香 clears 1a before the king enters.',
      21: '△1一玉 reaches the corner. The silver on 3a and gold on 4a have not joined it yet.',
      23: '△2二銀 brings the silver diagonally in front of the king.',
      25: '△3一金 brings the first gold toward the king.',
      31: 'The other gold travels through 5b and 4b to 3b. Golds on 3a and 3b and the silver on 2b are the castle’s guards.',
      35: '△4四銀 develops centrally. Both this silver and the pawn on 5d control 5e.',
      36: '▲5五歩 creates central contact. Sente’s silver on 6f also protects 5e. Count recaptures for both sides before taking.',
      37: '△5五銀 captures the pawn. Gote’s pawn on 5d protects the silver.',
    },
    comment:
      '後手の穴熊は１一玉・１二香・２二銀・３一金・３二金です。中央では後手銀が５五の先手歩を取り、５四歩が銀を支えています。先手銀６六による取り返しを比べます。玉の位置を整えたあとも、中央の交換が角道や持ち駒をどう変えるかを確認します。',
    commentEn:
      'Gote’s shelter consists of king 1a, lance 1b, silver 2b and golds 3a and 3b. Centrally, Gote’s silver has captured Sente’s pawn on 5e, supported by the pawn on 5d. Compare Sente’s recapture with the silver on 6f. After arranging the king, continue examining how exchanges change bishop lines and hands.',
    branches: [
      {
        kind: 'alt',
        moves: '6f5e 5d5e 7g5e',
        notes: {
          0: '▲同銀で先手の銀が６六を空け、角７七から５五への道が開きます。',
          2: '△同歩に▲同角。銀交換のあと、先手角が５五に出ました。',
        },
        notesEn: {
          0: '▲同銀 clears 6f, opening the diagonal from Sente’s bishop on 7g to 5e.',
          2: 'After △同歩, ▲同角 brings Sente’s bishop to 5e following the silver exchange.',
        },
        comment:
          '双方が銀と歩を一枚ずつ持ち、先手の角が５五にいます。後手玉１一の周りの金銀は動いていません。中央の駒を交換しても、玉側の駒と持ち駒を含めて盤面を見直すことが大切です。',
        commentEn:
          'Both sides hold one silver and one pawn, and Sente’s bishop stands on 5e. The guards around Gote’s king on 1a have stayed in place. Reassess the whole board and both hands after central exchanges.',
      },
      {
        kind: 'alt',
        moves: '1f1e',
        comment: '先手が▲１五歩と中央以外を進める比較です。銀５五が銀６六を取れるか、その後の角の取り返しまで確認してから端歩への応手を選びます。',
        commentEn:
          'Compare Sente advancing on the edge with ▲1五歩. Before answering there, check whether silver 5e can capture silver 6f and count the bishop recaptures.',
        branches: [
          {
            kind: 'alt',
            moves: '5e6f 7g6f 3c6f',
            comment:
              '△６六銀で先手銀を取ります。この例で▲同角と取り返すと、△同角で角も取れます。後手角３三から４四・５五が空いたことを確認します。▲同角は強制ではなく、先手が角を逃がす別案もあります。銀の捕獲で計算を止めない比較です。',
            commentEn:
              '△6六銀 captures Sente’s silver. If Sente selects ▲同角, △同角 also captures the bishop. Verify that 4d and 5e are clear on Gote’s diagonal from 3c. The bishop recapture is not forced; Sente can instead move the bishop away. Count beyond the silver capture.',
          },
          {
            kind: 'deviation',
            moves: '1c1d 6f5e 5d5e 7g5e',
            comment:
              '△１四歩は端を接触させますが、先に△６六銀で銀を取る機会を見送る弱い選択です。▲５五銀△同歩▲同角まで進むと、中央の銀が交換されて先手角５五が残ります。',
            commentEn:
              '△1四歩 creates edge contact but is weaker because it misses first capturing the silver with △6六銀. After ▲5五銀 △同歩 ▲同角, the central silvers have been exchanged and Sente’s bishop remains on 5e.',
            branches: [
              {
                kind: 'alt',
                moves: '8b5b 5e6f',
                comment:
                  '△５二飛で角５五へ当て、先手が▲６六角と逃げる応手を選びます。５筋から角が動いたため、双方の飛車が直接向き合います。次に後手は飛車を取る手と、別の歩を動かす手を区別します。',
                commentEn:
                  '△5二飛 attacks bishop 5e, and this selects the retreat ▲6六角. Once the bishop leaves the fifth file, the rooks face one another directly. Distinguish capturing the rook from advancing another pawn.',
                branches: [
                  {
                    kind: 'alt',
                    moves: '5b5h+ 4i5h 3c6f',
                    comment:
                      '△５八飛成で先手飛車を取り、▲同金の応手に△６六角で角を取る比較です。金４九は５八を守りますが、角６六には取り返せません。飛車を交換する順と、角を取る順を続けて数えます。▲同金は選んだ応手で、すべての代案を排除した強制手順とはしません。',
                    commentEn:
                      'Compare △5八飛成, taking Sente’s rook, followed by the selected ▲同金 and △6六角, capturing the bishop. Gold 4i guards 5h but cannot recapture on 6f. Count the rook exchange and subsequent bishop capture together without claiming every alternative reply has been excluded.',
                  },
                  {
                    kind: 'deviation',
                    moves: '6c6d 5h5b+ 3c6f',
                    comment:
                      '△６四歩は飛車５二を取られる弱い選択です。▲５二飛成の後に△６六角で先手角を取れても、後手は飛車と角を交換しています。後手飛車の進出が安全だったと誤解せず、先に△５八飛成で取り合う順と収支を比べます。',
                    commentEn:
                      '△6四歩 is weaker because it allows ▲5二飛成 to capture the rook. Even if △6六角 then takes Sente’s bishop, Gote has exchanged a rook for a bishop. Compare that material result with first initiating the rook exchange on 5h.',
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
