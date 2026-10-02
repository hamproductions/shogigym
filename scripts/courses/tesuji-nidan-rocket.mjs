export default {
  id: 'tesuji--nidan-rocket',
  title: '手筋: 2段ロケット',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source: '局面と手はshogi-rule.com「香車の効果的な手筋」(https://www.shogi-rule.com/koma_kyosha/)の「2段ロケット」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。香車と飛車を持ち駒でなく盤上の駒として置いた(図に持ち駒の表示がない)。',
  goalFormation: '2段ロケット: 直進できる駒を2枚縦に並べて、1点を突き破る。',
  startSfen: '5gknl/4g1s2/4pppp1/8p/9/9/7L1/7R1/9 b - 1',
  rootComment: '2筋に香車と飛車が縦に並んでいます。2三の歩を目がけて突っ込みましょう。',
  line: {
    moves: '2g2c+ 3b2c 2h2c+',
    notes: {
      0: '香車と飛車を縦に並べ、1点を突き破ります。',
      1: '銀で取り返されても、',
      2: '後ろの飛車で取り返せます。',
    },
    comment: '香車が上、飛車が下ですが、逆でも2段ロケットです。状況に応じて使い分けます。',
  },
}
