const course = {
  id: 'tesuji--okuri-hisha',
  title: '手筋: 飛車の送りの手筋',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「飛車の効果的な手筋」(https://www.shogi-rule.com/koma_hisha/)の「飛車の送りの手筋」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(同内容が金の手筋(https://www.shogi-rule.com/koma_kin/)の「飛車の送りの手筋」にも掲載。図はアニメーションGIFのコマ送りを読み取った)。',
  goalFormation: '飛車の送り: 飛車の利きにある玉の守り駒を、反対側に金を打って剥がし、詰みまで持っていく。',
  startSfen: '3g3nl/2R2sk2/4ppppp/9/9/9/9/9/9 b G 1',
  rootComment: '飛車の利きの筋に玉がいて、4二の銀が守っています。反対側に金を打つ手を探しましょう。',
  line: {
    moves: 'G*2b 3b2b 7b4b+ G*3b S*3a 2b1b 4b3b',
    notes: {
      0: '飛車の利きの筋に玉がいます。守りの駒を剥がすため、反対側に金を打ちます。',
      1: '一見、金がタダで取れるようですが、',
      2: '飛車で銀を取り、王手になります。',
      3: '金を合駒に打っても、',
      4: '取った銀を打ち、',
      5: '玉は1二へ逃げるしかありません。',
      6: '飛車で金を取って詰みです。',
    },
    comment: '玉に金を取らせることで、飛車の利きから守り駒を剥がす手筋です。',
  },
}

export default course
