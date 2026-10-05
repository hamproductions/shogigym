export default {
  id: 'tesuji--wariuchi-gin-kin',
  title: '手筋: 割り打ちの銀(金と金の間)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「銀の効果的な手筋」(https://www.shogi-rule.com/koma_gin/)の「割り打ちの銀」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(部分図。2筋以降と4筋より下の駒は図が不明のため置いていない)。',
  goalFormation: '割り打ちの銀: 斜め後ろに動ける銀の特性を活かし、金と金の間に打って両取りにする。',
  startSfen: 'lns3snl/2r1g1gk1/pp1ppp1pp/9/9/9/9/9/9 b S 1',
  rootComment: '5二と3二に金が並び、4一が空いています。その間に銀を打つ手を探しましょう。',
  line: {
    moves: 'S*4a',
    notes: {
      0: '金と金の間に銀を割り打ちます。銀は斜め後ろに動けるので、両方の金に利きます。',
    },
    comment: '斜め後ろに動ける駒は玉と角以外にないため、多くの駒の弱点を突けます。',
  },
}
