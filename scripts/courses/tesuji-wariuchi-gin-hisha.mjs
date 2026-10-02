export default {
  id: 'tesuji--wariuchi-gin-hisha',
  title: '手筋: 割り打ちの銀(飛車と金の間)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source: '局面と手はshogi-rule.com「銀の効果的な手筋」(https://www.shogi-rule.com/koma_gin/)の「割り打ちの銀」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(部分図)。',
  goalFormation: '割り打ちの銀: 飛車と金の間に銀を打ち、両方に当てる。',
  startSfen: 'lns3snl/2g1r1gk1/pp1ppp1pp/9/9/9/9/9/9 b S 1',
  rootComment: '5二に飛車、3二に金が並んでいます。その間の4一に銀を打ちましょう。',
  line: {
    moves: 'S*4a',
    notes: {
      0: '飛車と金の間に銀を割り打ちます。'
    },
    comment: '飛車を取られないように動かすと、金が取れます。',
  },
}
