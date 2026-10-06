const course = {
  id: 'tesuji--hara-gin-kei',
  title: '手筋: 腹銀(桂との連携)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「銀の効果的な手筋」(https://www.shogi-rule.com/koma_gin/)の「腹銀」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '腹銀: 桂馬と連携して銀を玉の脇に打ち、詰みに持ち込む。',
  startSfen: '7nl/7k1/6p2/5N1pp/9/9/9/9/9 b GS 1',
  rootComment: '4四の桂馬が3二を守っています。ここに銀を打つ手を探しましょう。',
  line: {
    moves: 'S*3b 2b1c G*2c',
    notes: {
      0: '桂馬が銀を守っているので、玉は銀を取れません。',
      1: '玉が1三へ逃げると、',
      2: '金を打って詰みです。',
    },
    comment: '銀と金の2枚で、玉の逃げ場がなくなります。',
  },
}

export default course
