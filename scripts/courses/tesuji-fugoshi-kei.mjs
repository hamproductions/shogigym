const course = {
  id: 'tesuji--fugoshi-kei',
  title: '手筋: 歩越しの桂馬',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「桂馬の効果的な手筋」(https://www.shogi-rule.com/koma_keima/)の「歩越しの桂馬」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '歩越しの桂馬: 歩を飛び越える桂馬の王手で、玉が逃げるか桂馬を取るしかない形に追い込む。',
  startSfen: '5B1nl/5g2k/4ppppp/9/9/9/9/9/9 b GN 1',
  rootComment: '1二の玉の前には歩が並んでいます。桂馬の王手を考えましょう。',
  line: {
    moves: 'N*2d 2c2d G*2c',
    notes: {
      0: '桂馬は駒を飛び越えられる唯一の駒です。歩越しに王手をかけます。',
      1: '桂馬を取るしかなく、',
      2: '金を打って詰みです。',
    },
    comment: '玉が2二に逃げた場合も、3二金から詰みです。',
  },
}

export default course
