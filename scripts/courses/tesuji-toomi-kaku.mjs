export default {
  id: 'tesuji--toomi-kaku',
  title: '手筋: 遠見の角',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「角の効果的な手筋」(https://www.shogi-rule.com/koma_kaku/)の「遠見の角」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(出典の図は複数の手順を含むアニメーションGIFだが、最初の打ち込みの1手のみ採用)。',
  goalFormation: '遠見の角: 急所になりそうなラインを狙って、遠目から角を打つ。',
  startSfen: 'ln5nl/1r3kg2/p1psp2pp/3bspp2/1p1p3P1/2P1PS3/PPSP1P2P/2G6/LNK1RG1NL b B 1',
  rootComment: '1八から5四、6三へ続く斜めのラインに注目しましょう。',
  line: {
    moves: 'B*1h',
    notes: {
      0: '相手の急所となりそうなラインを、遠くから角で狙います。',
    },
    comment: '「遠見の角に好手あり」の格言通り、角は遠くから打つと威力を発揮します。',
  },
}
