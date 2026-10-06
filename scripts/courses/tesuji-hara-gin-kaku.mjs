const course = {
  id: 'tesuji--hara-gin-kaku',
  title: '手筋: 腹銀(角との連携)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「銀の効果的な手筋」(https://www.shogi-rule.com/koma_gin/)の「腹銀」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(4一の駒を馬として読んだ。玉の逃げ方は図に従う)。',
  goalFormation: '腹銀: 玉の脇腹に銀を打ち、角と連携して終盤に有利な形を作る。',
  startSfen: '5+B1nl/7k1/5ppp1/8p/9/9/9/9/9 b S 1',
  rootComment: '4一の馬と連携して、玉の脇に銀を打つ手を探しましょう。',
  line: {
    moves: 'S*3b 2b1c 3b2c+',
    notes: {
      0: '王手ではありませんが、玉の脇腹に銀を張り付けて動きを制限します。',
      1: '玉が逃げると、',
      2: '角と連動した成銀で詰みです。',
    },
    comment: '数手先を見越した手筋で難易度は高めですが、終盤で威力を発揮します。',
  },
}

export default course
