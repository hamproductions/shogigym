export default {
  id: 'shikenbisha-vs-migishiken--41kin',
  title: '右四間への４一金型：守る駒のつながりを読む',
  titleEn: 'Gold on 4a against Right Fourth File Rook: Trace the Defenders',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '右四間飛車に対する四間飛車の４一金待機・５四銀・１二香という標準的な守備構想を、新ペタショック定跡（MIT）の候補手と照合。馬の移動と角４六の選択を独立した比較枝に構成し、説明を新しく執筆。',
  goalFormation:
    '後手は飛車４二・銀５四・金４一・香１二で、先手の右四間飛車へ向き合う。角２四と金３一の守備関係、角４六に飛車で取る場合と逃げる場合を比較する。',
  goalLabel: '駒ごとの守りを一つずつ確認する',
  goalSfen: 'ln1g1g1n1/1ks2r2l/ppppp2pp/4sppb1/7N1/2P1SPPP1/PP1PP3P/1BK1GR3/LNSG4L b - 1',
  rootComment:
    '先手が銀を５六、飛車を４八へ運ぶ右四間に対し、後手四間飛車で受ける構想です。金をすぐ５二へ動かさず、４一に残す形を比べます。桂跳ねに備える香と、中央の銀も合わせて配置を作ります。',
  rootCommentEn:
    'Meet Sente’s Right Fourth File Rook, with silver development toward 5f and a rook on 4h, using Gote Fourth File Rook. Compare keeping the gold on 4a rather than immediately developing it to 5b, alongside a central silver and a lance prepared for the knight jump.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 3i4h 8b4b 4g4f 5a6b 4h4g 6b7b 4g5f 3a3b 2h4h 7b8b 5i6h 7a7b 6h7h 3b4c 3g3f 2b3c 4i5h 4c5d 2i3g 1a1b 3g2e 3c2d',
    notes: {
      10: '▲５六銀で先手の攻め銀が中央へ出ます。',
      12: '▲４八飛で右四間です。相手の飛車４二と同じ筋に来ました。',
      17: '△４三銀から中央へ使う準備をします。金４一は元の升です。',
      21: '△５四銀は４五・５五・６五へ利きます。',
      23: '△１二香で１一を空けます。角に１一へ入られても、その升には香が残っていません。',
      24: '▲２五桂は角３三への当たりです。',
      25: '△２四角と逃がします。今の角２四は歩２三が守ります。',
    },
    notesEn: {
      10: '▲5六銀 develops Sente’s attacking silver centrally.',
      12: '▲4八飛 establishes Right Fourth File Rook opposite Gote’s rook on 4b.',
      17: '△4三銀 prepares central development while gold 4a remains on its starting square.',
      21: '△5四銀 controls 4e, 5e and 6e.',
      23: '△1二香 clears 1a. A bishop entering 1a will no longer find the lance there.',
      24: '▲2五桂 attacks bishop 3c.',
      25: '△2四角 retreats to a square guarded by pawn 2c.',
    },
    comment:
      '後手は銀５四・金４一・香１二、先手は銀５六・桂２五・飛車４八です。４筋の歩交換で角道が開いたら、馬の位置と守る駒を読み直します。金が元の升にいることだけで、相手の攻めを全部防いだとはしません。',
    commentEn:
      'Gote has silver 5d, gold 4a and lance 1b against Sente’s silver 5f, knight 2e and rook 4h. If a fourth-file exchange opens the bishop diagonal, recalculate the horse’s location and the actual defenders. Keeping the gold on its starting square is not a claim that every attack has been stopped.',
    branches: [
      {
        kind: 'alt',
        moves: '4f4e 4d4e 8h1a+ 4a3a 9g9f',
        notes: {
          1: '▲４五歩△同歩で４四が空き、角８八の道が開きます。',
          2: 'この比較では▲１一角成と空いている隅へ入ります。香は１二に逃げています。',
          3: '△３一金は飛車４二と桂２一を守ります。馬１一へ直接当てる手ではありません。',
          4: '先手が▲９六歩と別の筋を選ぶ比較です。次の角４六は、この応手を選んだあとの例です。',
        },
        notesEn: {
          1: '▲4五歩 △同歩 clears 4d and opens bishop 8h’s diagonal.',
          2: 'This comparison selects ▲1一角成, entering the empty corner. The lance has moved to 1b.',
          3: '△3一金 guards rook 4b and knight 2a; it does not directly attack horse 1a.',
          4: 'Sente selects ▲9六歩 on another file. The following bishop move to 4f is a comparison after this chosen reply.',
        },
        comment:
          '金３一が飛車４二と桂２一を守り、飛車４二が横に香１二を守ります。角２四は歩２三が守っています。馬１一に近い駒も、このように守る駒を個別に確認します。「全駒が守られている」「取れる駒がない」という結論には置き換えません。',
        commentEn:
          'Gold 3a guards rook 4b and knight 2a; the rook guards lance 1b along the rank. Pawn 2c guards bishop 2d. Check these specific defenders near horse 1a rather than replacing them with a blanket claim that every piece is defended or no capture is legal.',
        branches: [
          {
            kind: 'alt',
            moves: '2d4f',
            comment:
              '△４六角で飛車４八へ縦の筋をふさぐ形を作ります。角は飛車の動きで取れますが、歩４五が角４六を守っています。飛車を逃がす手もあり、取ることは強制されません。',
            commentEn:
              '△4六角 places the bishop on rook 4h’s file. The rook can capture it, but pawn 4e guards the bishop on 4f. Rook retreats remain legal; the capture is not forced.',
            branches: [
              {
                kind: 'alt',
                moves: '4h4f 4e4f',
                notes: {
                  0: 'この枝では▲同飛を選びます。',
                  1: '△同歩で飛車を取り返します。',
                },
                notesEn: {
                  0: 'This branch selects ▲同飛.',
                  1: '△同歩 recaptures the rook.',
                },
                comment:
                  '先手は角、後手は飛車と歩を持ちます。後手が角を渡して飛車を取った比較です。先手馬１一や銀５六は残っているため、飛車を取っただけで終局とはしません。',
                commentEn:
                  'Sente holds a bishop; Gote holds a rook and pawn. Gote traded the bishop for the rook in this selected continuation. Sente’s horse on 1a and silver on 5f remain, so the rook capture is not a terminal conclusion.',
              },
              {
                kind: 'alt',
                moves: '4h3h',
                comment:
                  '▲３八飛は角を取らずに逃げる合法手です。角４六と歩４五は残っています。相手の飛車が同じ筋にいても、交換に応じる手だけがあるわけではありません。',
                commentEn:
                  '▲3八飛 legally retreats instead of capturing. Bishop 4f and pawn 4e remain. Sharing the rook’s file does not make the exchange compulsory.',
              },
            ],
          },
        ],
      },
    ],
  },
}
