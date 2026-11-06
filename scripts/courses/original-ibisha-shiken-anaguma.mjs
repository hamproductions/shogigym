export default {
  id: 'ibisha-vs-shikenbisha--anaguma',
  title: '四間飛車への穴熊：玉の移動と中央の備え',
  titleEn: 'Anaguma against Fourth File Rook: The King’s Route and Central Contact',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source: '四間飛車に対する居飛車穴熊の標準的な玉・香・銀の配置から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation: '先手は玉９九、香９八、銀８八、金７九・５八。右銀５七は中央に残す。後手は飛車４二と歩４四で接触を準備しており、囲いだけを見て待ち続けない。',
  goalLabel: '穴熊の入口と４筋の接触を確認する',
  goalSfen: 'l2g3nl/1ks2r3/ppng1sbpp/2ppppp2/7P1/P1P1P4/1PBPSPP1P/LS2G2R1/KNG4NL b - 1',
  rootComment:
    '角８八と香９九を動かし、玉を９九へ運びます。８八銀を足したあとも、金や中央の銀の位置を一枚ずつ見てください。相手の四間飛車は４筋を使うので、玉が隅に着いた時点で中央の歩も確認します。',
  rootCommentEn:
    'Move the bishop off 8h and lance off 9i, then bring the king to 9i. After adding the silver on 8h, inspect the golds and central silver individually. Gote’s Fourth File Rook can create contact on the fourth file while Sente builds the castle.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 8b4b 8h7g 2b3c 5i6h 3a3b 6h7h 5a6b 9i9h 7a7b 7h8h 6b7a 8h9i 6c6d 7i8h 7c7d 6i7i 3b4c 5g5f 8a7c 3i4h 5c5d 4i5h 7a8b 4h5g 4a5b 9g9f 5b6c',
    notes: {
      6: '▲７七角で８八を空けます。角７七は８六も守っています。',
      12: '▲９八香で９九を空けます。玉はこのあと８八を経由します。',
      16: '▲９九玉で隅へ入りました。まだ銀は７九に残っています。',
      18: '▲８八銀。銀を玉の斜め前へ寄せます。',
      20: '▲７九金。左銀が空けた７九へ金が入ります。',
      28: '▲５七銀。右銀を中央へ出しました。穴熊の銀８八とは別の役割です。',
      31: '△６三金。後手は金を中央へ進めます。４四の歩は残っています。',
    },
    notesEn: {
      6: '▲7七角 clears 8h and also guards 8f.',
      12: '▲9八香 clears 9i. The king will enter through 8h.',
      16: '▲9九玉 reaches the corner. Sente’s left silver is still on 7i.',
      18: '▲8八銀 brings the silver diagonally in front of the king.',
      20: '▲7九金 uses the square vacated by that silver.',
      28: '▲5七銀 develops the right silver centrally, separately from the defensive silver on 8h.',
      31: '△6三金 develops the gold centrally. Gote’s pawn remains on 4d.',
    },
    comment:
      '玉９九・香９八・銀８八に金７九が加わっています。金５八と銀５七は中央側です。穴熊という名前だけで守りの駒数を決めつけず、後手の歩４四と飛車４二の動きも見て次を選びます。',
    commentEn:
      'The king on 9i has a lance on 9h, silver on 8h and gold on 7i nearby. The gold on 5h and silver on 5g remain nearer the center. Count the actual guards, and choose the next move with Gote’s pawn on 4d and rook on 4b in view.',
    branches: [
      {
        kind: 'alt',
        moves: '4g4f 4d4e 4f4e 4c4d 5g4f',
        notes: {
          0: '▲４六歩と接触する比較例です。',
          1: 'この枝では後手が△４五歩と接触し、先手が歩で取ります。',
          3: '後手が銀４四を選んだあと、▲４六銀で右銀を出します。４五には先手歩が残ります。',
        },
        notesEn: {
          0: 'For comparison, Sente creates contact with ▲4六歩.',
          1: 'This branch selects △4五歩, followed by Sente’s pawn capture.',
          3: 'Gote chooses △4四銀, then ▲4六銀 develops Sente’s right silver. Sente’s pawn remains on 4e.',
        },
        comment:
          '囲いの駒はそのままでも、右銀は５七から４六へ移りました。先手は歩を一枚持ち、後手銀４四と先手歩４五が向かい合います。自玉の周りと、中央で動いた駒を分けて確認してください。',
        commentEn:
          'The castle’s pieces stay in place while the right silver moves from 5g to 4f. Sente holds one pawn, with Gote’s silver on 4d facing Sente’s pawn on 4e. Inspect the king’s surroundings separately from the pieces that changed in the center.',
      },
    ],
  },
}
