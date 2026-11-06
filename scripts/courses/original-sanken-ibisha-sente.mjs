export default {
  id: 'sankenbisha-vs-ibisha--sente',
  title: '先手三間飛車：７八飛を残して美濃を組む',
  titleEn: 'Sente Third File Rook: Keep the Rook on 7h and Build Mino',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '先手三間飛車の７八飛と美濃囲いの標準的な駒組みを、新ペタショック定跡（MIT）の候補手から独立して選択。後手用の棋譜を機械的に反転せず、この配置に合わせた説明を新しく執筆。',
  goalFormation: '先手は飛車７八・角７七、玉２八・銀３八・金５八の美濃。左銀６七と歩６六・５六・４六を置き、飛車を浮かずに駒組みを進める。',
  goalLabel: '飛車の位置と玉側の守りを確かめる',
  goalSfen: 'ln3g1nl/1r2g1kb1/p2ssp1pp/2ppp1p2/1p7/2PPPP3/PPBS2PPP/2R1G1SK1/LN3G1NL b - 1',
  rootComment:
    '先手で三間飛車を指し、飛車を７八に置く基本形です。玉は右側の２八へ運びます。石田流のように飛車を７六へ浮く構想とは区別し、角７七の後ろの飛車と、中央を支える左銀を確認してください。',
  rootCommentEn:
    'As Sente, establish the normal Third File Rook arrangement with the rook on 7h and move the king toward 2h. Distinguish this from floating the rook to 7f in Ishida. Locate the rook behind bishop 7g and the left silver supporting the center.',
  line: {
    moves: '7g7f 8c8d 6g6f 8d8e 8h7g 3c3d 2h7h 7a6b 7i6h 5a4b 5i4h 4b3b 4h3h 5c5d 3h2h 6a5b 3i3h 3a4b 6i5h 4b5c 5g5f 6c6d 4g4f 7c7d 6h6g 6b6c',
    notes: {
      2: '▲６六歩で６七が空き、自分の角の斜線はいったん歩６六で止まります。',
      4: '▲７七角は８六を守ります。相手の８五歩が８六へ進んだ場合の取り返しを考える配置です。',
      6: '▲７八飛。７七の角を後ろから支えます。飛車の前には角７七と歩７六がいます。',
      8: '▲６八銀で左銀を上げます。今は角７七にも利きます。',
      14: '▲２八玉で玉を飛車と反対側へ運びました。',
      16: '▲３八銀は玉２八の隣です。',
      18: '▲５八金で金を一枚寄せます。右金４九はまだ元の升に残っています。',
      20: '▲５六歩で中央の５七を空けます。',
      22: '▲４六歩。中央の歩は６六・５六・４六です。',
      24: '▲６七銀で左銀が６六歩を守ります。６七は最初に６六歩で空けた升です。',
      25: '後手が△６三銀と歩６四を支える配置を選びました。',
    },
    notesEn: {
      2: '▲6六歩 clears 6g and temporarily blocks Sente’s bishop diagonal on 6f.',
      4: '▲7七角 guards 8f, preparing a recapture if Gote’s pawn on 8e advances there.',
      6: '▲7八飛 supports bishop 7g from behind. The bishop on 7g and pawn on 7f stand in front of the rook.',
      8: '▲6八銀 develops the left silver and also guards bishop 7g at this moment.',
      14: '▲2八玉 takes the king to the wing opposite the rook.',
      16: '▲3八銀 stands beside king 2h.',
      18: '▲5八金 develops one gold. The right gold remains on its starting square, 4i.',
      20: '▲5六歩 clears the central square 5g.',
      22: '▲4六歩 leaves central pawns on 6f, 5f and 4f.',
      24: '▲6七銀 guards pawn 6f, using the square cleared by the earlier pawn move.',
      25: 'Gote selects △6三銀, supporting pawn 6d.',
    },
    comment:
      '先手飛車は７八に残り、玉２八の隣に銀３八、中央寄りに金５八があります。左銀６七は歩６六を守ります。次に歩を動かすときは、空く升と角７七の道の変化を確認し、この形を理由に飛車を自動的に７六へ浮かないでください。',
    commentEn:
      'Sente’s rook remains on 7h, with silver 3h beside king 2h and gold 5h toward the center. Silver 6g guards pawn 6f. Before another pawn advance, inspect the cleared squares and bishop 7g’s changing diagonal; this arrangement does not call for automatically floating the rook to 7f.',
  },
}
