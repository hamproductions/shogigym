export default {
  id: 'tesuji--tsukisute-fu',
  title: '手筋: 突き捨ての歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source: '局面と手はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「突き捨ての歩」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '突き捨ての歩: 駒の利きをよくするため、あえて歩を捨てる。',
  startSfen: 'ln2bg1nl/1R4sk1/p2p1g1pp/4ppp2/1pP4P1/P1BPP2SP/1P1G1PP2/1KGS5/LN5NL b - 1',
  rootComment: '7六の角の利きが5四の歩で止まっています。5筋の歩を突き捨てる手を探しましょう。',
  line: {
    moves: '5f5e 5d5e 7f4c+',
    notes: {
      0: '駒の利きをよくするため、あえて歩を突き捨てます。',
      1: '歩を取らせると、',
      2: '角が相手の金を直撃できるようになりました。',
    },
    comment: '金を取る角成が受からないため、超優勢です。',
  },
}
