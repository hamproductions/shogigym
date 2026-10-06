const course = {
  id: 'tesuji--mino-kuzushi',
  title: '手筋: 美濃崩し',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「桂馬の効果的な手筋」(https://www.shogi-rule.com/koma_keima/)の「美濃崩し」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '美濃崩し: 角と桂馬を連動させ、玉を狙えるラインを作って美濃囲いを崩す。',
  startSfen: 'ln1g3nl/1ks1g4/pppppp2p/6p2/4B2p1/9/9/9/9 b GN 1',
  rootComment: '8二の玉に対し、7四に桂馬を打つ手を探しましょう。',
  line: {
    moves: 'N*7d 8b9b G*8b',
    notes: {
      0: '角の利きと連動した、最も有名な美濃囲いの崩し方です。',
      1: '玉は9二へ逃げるしかありません。',
      2: '金を打って詰みです。',
    },
    comment: 'ポイントは玉を狙えるラインに角を配置することです。控えの桂や継ぎ桂と組み合わせるとさらに効果的です。',
  },
}

export default course
