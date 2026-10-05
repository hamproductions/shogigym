export default {
  id: 'tesuji--ryodori-hisha',
  title: '手筋: 飛車の両取り',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「飛車の効果的な手筋」(https://www.shogi-rule.com/koma_hisha/)の「飛車の両取り」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '飛車の両取り: 上下左右の利きを活かして、王手と角取りを同時にかける。',
  startSfen: '3gkgsnl/9/6ppp/9/7b1/9/9/9/9 b R 1',
  rootComment: '5五に飛車を打つと、5一の玉と2五の角が飛車の利きに入ります。',
  line: {
    moves: 'R*5e',
    notes: {
      0: '飛車の縦と横の利きで、玉と角を同時に狙います。',
    },
    comment: '飛車の十字の利きを活かした両取りです。',
  },
}
