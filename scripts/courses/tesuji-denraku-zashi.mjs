export default {
  id: 'tesuji--denraku-zashi',
  title: '手筋: 田楽刺し',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「香車の効果的な手筋」(https://www.shogi-rule.com/koma_kyosha/)の「田楽刺し」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '田楽刺し: 直進できない駒の頭に香車を打って串刺しにする。',
  startSfen: 'lns1kgsnl/1r2g4/pppp1pppp/4b4/8p/9/9/9/9 b L 1',
  rootComment: '5四の角は真っ直ぐ進めません。その頭に香車を打つ手を探しましょう。',
  line: {
    moves: 'L*5e',
    notes: {
      0: '直進できない角の頭に香車を打ち、後ろの金まで串刺しにします。',
    },
    comment: '角が逃げても、後ろに並んだ金に香車の利きが残ります。',
  },
}
