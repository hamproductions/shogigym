export default {
  id: 'shikenbisha-vs-torisashi--basic',
  title: '鳥刺しへの四間飛車：銀を足してから飛車を寄せる',
  titleEn: 'Fourth File Rook against Torisashi: Add the Silver before Transferring the Rook',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '鳥刺しの左銀と角７九、対する四間飛車の銀４三・飛車３二という標準的な構想を、新ペタショック定跡（MIT）の候補手と照合。守備の変化と高美濃への比較を独立に構成し、説明を新しく執筆。',
  goalFormation: '先手鳥刺しの角７九・左銀４六に対し、後手は銀３二を４三へ進めて３四の守りを増やしてから飛車を３二へ移す。玉８二・銀７二・金５二も確認する。',
  goalLabel: '準備の一手で増えた守りを見つける',
  goalSfen: 'ln1g3nl/1ks1g1r2/pppppsbpp/5pp2/6PP1/4PS2P/PPPP1P3/2K2S1R1/LNBG1G1NL w - 1',
  rootComment:
    '先手が左銀を６八から５七へ運び、角を７九へ引く鳥刺しに向き合います。後手は四間飛車から、３筋の接触に備えて銀を足す構想です。銀を上げたことで新しく守る升を、飛車を寄せる前後で比較します。',
  rootCommentEn:
    'Meet Torisashi, in which Sente develops the left silver through 6h and 5g and retreats the bishop to 7i. From Gote Fourth File Rook, add a silver defender before preparing for third-file contact. Compare the newly guarded square before and after the rook transfer.',
  line: {
    moves: '7i6h 3c3d 5g5f 4c4d 6h5g 8b4b 2g2f 5a6b 2f2e 7a7b 8h7i 2b3c 5i6h 6b7a 6h7h 7a8b 3i4h 3a3b 3g3f 4a5b 1g1f 3b4c 5g4f 4b3b 3f3e',
    notes: {
      0: '▲６八銀から、７九を空ける出だしです。',
      4: '▲５七銀で６八も空きます。',
      10: '▲７九角で、角を左銀の後ろへ引きます。今は銀５七がその斜線の途中にいます。',
      15: '△８二玉。銀７二と玉側の配置を確認します。',
      17: '△３二銀の段階では、この銀は３四を守っていません。',
      19: '△５二金で守り駒を玉側へ配置します。',
      21: '△４三銀で３四を新しく守りました。３二の銀とは利きが違います。',
      22: '▲４六銀は７九からの角道の途中に立ちます。角７九はまだ３五へ直接利いていません。',
      23: '△３二飛と寄せます。３三には自分の角がいるため、飛車から３四へ直接は通っていません。',
      24: '▲３五歩で３四歩へ接触します。３四を守っている銀４三をもう一度確認します。',
    },
    notesEn: {
      0: '▲6八銀 clears the bishop’s retreat square on 7i.',
      4: '▲5七銀 also clears 6h.',
      10: '▲7九角 retreats behind the left silver. Silver 5g currently blocks that diagonal.',
      15: '△8二玉 joins the king-side arrangement with silver 7b.',
      17: 'The silver on 3b does not guard 3d at this stage.',
      19: '△5二金 develops another king-side defender.',
      21: '△4三銀 newly guards 3d, unlike its previous square on 3b.',
      22: '▲4六銀 stands on the diagonal from bishop 7i, so that bishop does not yet directly control 3e.',
      23: '△3二飛 transfers files, but the friendly bishop on 3c blocks a direct rook line to 3d.',
      24: '▲3五歩 contacts pawn 3d. Locate silver 4c guarding that square.',
    },
    comment:
      '銀４三による３四の守りを用意してから、飛車を３二へ移しました。角３三が飛車の前を止め、先手の角７九も銀４六に止められています。駒の名前だけで攻めや守りの枚数を数えず、実際の途中の駒を確かめます。',
    commentEn:
      'The silver established control of 3d before the rook moved to 3b. Bishop 3c blocks that rook line, while Sente’s silver on 4f blocks bishop 7i. Count actual open lines and intervening pieces rather than inferring attackers or defenders from piece names alone.',
    branches: [
      {
        kind: 'alt',
        moves: '6c6d 9g9f 5b6c 1f1e 7c7d',
        notes: {
          0: '後手が△６四歩で６三を空ける比較です。３筋の接触は残っています。',
          1: '先手が▲９六歩とすぐ取り合わない応手を選びます。',
          2: '△６三金で空いた升へ進みます。金６三は歩６四を守り、銀７二も金６三を守っています。',
          4: '先手の▲１五歩に△７四歩。金６三がこの歩７四も守ります。',
        },
        notesEn: {
          0: 'Compare △6四歩, clearing 6c while third-file contact remains.',
          1: 'Sente selects ▲9六歩 instead of an immediate exchange.',
          2: '△6三金 uses the cleared square, guarding pawn 6d. Silver 7b also guards gold 6c.',
          4: 'After the selected ▲1五歩, △7四歩 is also protected by gold 6c.',
        },
        comment:
          '玉８二・銀７二・金６三へ守りを組み替えました。これは相手が静かな応手を選んだ比較で、角を交換すれば必ず得になるとか、ここから強制的に攻め込めるという主張ではありません。３筋の歩交換が始まれば、銀４三による取り返しも読み直します。',
        commentEn:
          'The shelter now uses king 8b, silver 7b and gold 6c. This comparison includes selected quiet replies, with no claim of an automatically profitable bishop exchange or forced counterattack. Recalculate silver 4c’s recaptures if the third-file exchange begins.',
      },
    ],
  },
}
