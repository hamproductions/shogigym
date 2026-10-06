const course = {
  id: 'tesuji--keito-gin',
  title: '手筋: 桂頭の銀',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「銀の効果的な手筋」(https://www.shogi-rule.com/koma_gin/)の「桂頭の銀」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(図は2枚の駒のみの部分図。後手は桂馬以外に駒がないため跳ねる手を置いた)。',
  goalFormation: '桂頭の銀: 桂馬の頭に銀を打ち、跳ね先を全て受けつつ桂馬を取りにいく。',
  startSfen: '9/9/9/4n4/9/9/9/9/9 b S 1',
  rootComment: '5四に相手の桂馬がいます。その頭に打つ駒を探しましょう。',
  line: {
    moves: 'S*5e 5d4f 5e4f',
    notes: {
      0: '桂馬の頭に銀を打ちます。桂馬の跳ね先をすべて受けています。',
      1: '跳ねると、',
      2: '銀で取られてしまいます。',
    },
    comment: '「桂頭の銀定跡なり」の格言通り、桂馬キラーとして力を発揮します。',
  },
}

export default course
