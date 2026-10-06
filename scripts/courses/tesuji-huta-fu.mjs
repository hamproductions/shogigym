const course = {
  id: 'tesuji--huta-fu',
  title: '手筋: ふた歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「ふた歩」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: 'ふた歩: 敵の飛車の頭に歩を打ち、逃げ場をなくして捕獲する。',
  startSfen: 'lnsgk2nl/6gb1/p1ppppspp/9/9/1rPP5/P1N1PPP1P/1SGGB2R1/L1K3SNL b P 1',
  rootComment: '8六に敵の飛車が侵入しています。歩でふたをする手を探しましょう。',
  line: {
    moves: 'P*8e',
    notes: {
      0: '飛車の頭に歩でふたをします。',
    },
    comment: '初心者が引っかかりやすい手筋なので注意しましょう。',
  },
}

export default course
