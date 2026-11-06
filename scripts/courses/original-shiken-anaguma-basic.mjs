export default {
  id: 'shikenbisha-vs-anaguma--basic',
  title: '四間飛車と穴熊：囲いの途中で４五歩を比べる',
  titleEn: 'Fourth File Rook versus Anaguma: Consider △4五歩 during Construction',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '四間飛車から居飛車穴熊へ向き合う標準的な６四歩・７四歩・７三桂の構想を、新ペタショック定跡（MIT）の候補手と照合して独立に構成。説明はこのアプリ用に新しく執筆。',
  goalFormation: '後手飛車４二、玉７一・銀７二・金５二。６四歩と７四歩、桂７三を置き、先手玉９九に銀８八の蓋ができる前に４五歩へ進める。',
  goalLabel: '囲いの残り手数と角道を確認する',
  goalSfen: 'l1kg3nl/2s1gr3/ppn1psbpp/2pp2p2/5p1P1/2PPP4/PPB1SPP1P/L3G2R1/KNSG3NL b - 1',
  rootComment:
    '後手四間飛車から、先手が穴熊へ向かう配置を読みます。相手の玉の移動だけで囲いが完成したとはせず、銀７九がどこに残るかも確認します。こちらは玉と守り駒を運びながら、歩と桂を前へ使う準備をします。',
  rootCommentEn:
    'Play Gote Fourth File Rook as Sente heads toward Anaguma. A king move alone does not complete the castle: also locate the silver that starts on 7i. Develop your king shelter while preparing the pawns and knight for play farther forward.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 7a7b 4i5h 6b7a 8h7g 4a5b 6g6f 6c6d 4h5g 3b4c 7h8h 7c7d 9i9h 8a7c 8h9i 4d4e',
    notes: {
      7: '△４二飛で四間飛車です。',
      13: '△７二銀は玉６二の隣を守ります。',
      15: '△７一玉。８二へ進める形だけでなく、７一に玉を置く配置をこの例では選びます。',
      17: '△５二金で玉側の守りを足します。',
      19: '△６四歩は６五へ進む候補を作ります。',
      21: '△４三銀で４四の歩を守ります。４五を直接守る銀ではありません。',
      23: '△７四歩で７三を空けました。',
      25: '△７三桂は６五と８五へ利きます。６四歩と同じ升６五を使える準備です。',
      26: '▲９九玉ですが、銀はまだ７九です。銀８八の蓋はまだありません。',
      27: '△４五歩で４四が空き、角３三から４四・５五・６六へ斜線が通ります。６六には先手歩がいます。',
    },
    notesEn: {
      7: '△4二飛 establishes Fourth File Rook.',
      13: '△7二銀 guards beside king 6b.',
      15: '△7一玉 selects a shelter with the king on 7a rather than continuing to 8b in this example.',
      17: '△5二金 adds a king-side defender.',
      19: '△6四歩 leaves a possible advance to 6e.',
      21: '△4三銀 guards pawn 4d, not the destination square 4e directly.',
      23: '△7四歩 clears 7c.',
      25: '△7三桂 controls 6e and 8e, preparing to use 6e alongside the pawn on 6d.',
      26: '▲9九玉 leaves the silver on 7i. The silver lid on 8h has not been placed yet.',
      27: '△4五歩 clears 4d, opening bishop 3c’s diagonal through 4d and 5e toward Sente’s pawn on 6f.',
    },
    comment:
      '後手は玉７一・銀７二・金５二、飛車４二・桂７三です。先手の穴熊は銀８八の手が残っています。４五歩で角道を開ける候補を示しましたが、完成前なら必ず攻めが決まるという意味ではありません。歩６六への角の利きと、次の先手の応手を読んでください。',
    commentEn:
      'Gote has king 7a, silver 7b, gold 5b, rook 4b and knight 7c. Sente still has the silver move to 8h available to finish the Anaguma lid. The line illustrates opening the bishop diagonal with △4五歩, not a guaranteed attack whenever the castle is incomplete. Continue by reading the pressure on pawn 6f and Sente’s replies.',
  },
}
