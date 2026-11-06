export default {
  id: 'shikenbisha-vs-ibisha--sente',
  title: '先手四間飛車：美濃から８筋へ振り直す',
  titleEn: 'Sente Fourth File Rook: From Mino to an Eighth-File Transfer',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '先手四間飛車の美濃と向かい飛車への転換という標準的な構想を、新ペタショック定跡（MIT）の候補手と照合。角で歩を取り返したあとの二つの中央の歩を独立した比較として構成し、説明を新しく執筆。',
  goalFormation:
    '先手飛車６八、玉２八・銀３八・金５八の美濃。比較枝では飛車を８八へ振り直し、８筋の歩を角で取り返してから６五歩と５五歩の中央の接触を用意する。',
  goalLabel: '飛車の移動前後の通り道を確認する',
  goalSfen: 'ln3g1nl/1r1sg1kb1/p3sp1p1/2ppp1p1p/1p7/2PPPP3/PPBS2PPP/3RG1SK1/LN3G1NL b - 1',
  rootComment:
    '先手四間飛車で、銀を先に３八へ進める組み方を読みます。この場合は玉が自分の銀を通れないため、４八から３九を経由して２八へ運びます。囲ったあとも飛車の位置を固定せず、８筋へ移る比較を見ます。',
  rootCommentEn:
    'Build Sente Fourth File Rook with the silver developed to 3h first. The king cannot pass through its own silver, so its route from 4h to 2h goes through 3i. After building the castle, compare transferring the rook to the eighth file.',
  line: {
    moves: '7g7f 8c8d 6g6f 8d8e 8h7g 3c3d 2h6h 7a6b 3i3h 5a4b 5i4h 4b3b 4h3i 5c5d 3i2h 6a5b 7i7h 3a4b 6i5h 4b5c 5g5f 6c6d 4g4f 7c7d 7h6g 1c1d',
    notes: {
      6: '▲６八飛で四間飛車を選びます。',
      8: '▲３八銀を先に上げます。この升には自分の玉を動かせません。',
      10: '▲４八玉。次に３八へは銀がいるため進めません。',
      12: '▲３九玉と銀の後ろを通ります。',
      14: '▲２八玉で美濃の玉の位置へ来ました。',
      16: '▲７八銀で左銀も上げます。飛車６八がいるので６八へは進めません。',
      18: '▲５八金で玉側へ金を寄せます。',
      24: '▲６七銀は歩６六を守り、飛車を８八へ動かす途中の７八も空けました。',
    },
    notesEn: {
      6: '▲6八飛 chooses Fourth File Rook.',
      8: '▲3八銀 develops the silver first. The king cannot move onto that friendly piece.',
      10: '▲4八玉 cannot continue through 3h because the silver occupies it.',
      12: '▲3九玉 passes behind the silver.',
      14: '▲2八玉 reaches the Mino king square.',
      16: '▲7八銀 develops the left silver. Rook 6h prevents it from using 6h.',
      18: '▲5八金 develops a king-side defender.',
      24: '▲6七銀 guards pawn 6f and clears 7h along the rook’s possible route to 8h.',
    },
    comment:
      '飛車６八、玉２八、銀３八、金５八の配置です。左銀が７八を空け、角も７七へ動いているので、飛車が６八から７八を通って８八へ動けます。次の比較で実際に振り直します。',
    commentEn:
      'The arrangement has rook 6h, king 2h, silver 3h and gold 5h. The left silver has cleared 7h and the bishop has moved to 7g, allowing the rook to travel from 6h through 7h to 8h. The comparison makes that transfer on the board.',
    branches: [
      {
        kind: 'alt',
        moves: '6h8h 9c9d 8g8f 8e8f 7g8f 5c4d 6f6e 4a4b 6g6f 2b3c 5f5e',
        notes: {
          0: '▲８八飛で相手の飛車８二と同じ筋へ移ります。間には双方の歩が残っています。',
          1: '後手が△９四歩と別の筋を選ぶ比較です。',
          2: '▲８六歩で歩をぶつけます。',
          3: '後手が△同歩で取る応手を選びます。',
          4: '▲同角で角７七が８六へ取り返します。飛車は８八のまま、角８六がその前を止めています。',
          5: '後手が△４四銀と中央へ出る例です。',
          6: '▲６五歩で６六を空けます。６四の後手歩との接触も残ります。',
          8: '▲６六銀で６五歩を守り、５五へも利かせます。',
          9: '後手が△３三角を選ぶ比較です。',
          10: '▲５五歩で５四歩へ接触します。この歩５五は銀６六が守ります。',
        },
        notesEn: {
          0: '▲8八飛 transfers onto the file of Gote’s rook on 8b, with both pawns still between the rooks.',
          1: 'This comparison selects △9四歩 on another file.',
          2: '▲8六歩 offers pawn contact.',
          3: 'Gote selects △同歩.',
          4: '▲同角 recaptures from 7g to 8f. The rook remains on 8h, blocked farther ahead by its own bishop on 8f.',
          5: 'Gote selects the central development △4四銀.',
          6: '▲6五歩 clears 6f and leaves contact with Gote’s pawn on 6d.',
          8: '▲6六銀 protects pawn 6e and also controls 5e.',
          9: 'This comparison selects △3三角.',
          10: '▲5五歩 contacts pawn 5d, protected by silver 6f.',
        },
        comment:
          '双方は歩を一枚持ちます。先手は飛車８八・角８六に、銀６六と歩６五・５五を合わせました。８筋を交換しても飛車の前には自分の角が残ります。中央の接触に相手がどう取り返すかも、守る銀を含めて読み続けます。',
        commentEn:
          'Each side holds one pawn. Sente combines rook 8h and bishop 8f with silver 6f and pawns 6e and 5e. The eighth-file exchange has not removed Sente’s own bishop from the rook line. Continue by calculating central recaptures together with the supporting silver.',
      },
    ],
  },
}
