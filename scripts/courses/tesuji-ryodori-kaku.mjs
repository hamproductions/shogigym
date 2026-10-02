export default {
  id: 'tesuji--ryodori-kaku',
  title: '手筋: 両取りの角(王手飛車)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source: '局面と手はshogi-rule.com「角の効果的な手筋」(https://www.shogi-rule.com/koma_kaku/)の「両取りの角」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '王手飛車取り: 角を打って、王手をかけつつ飛車に当てる。',
  startSfen: 'lnsg1gsnl/1r5k1/pp1ppp1pp/2p3p2/9/9/9/9/9 b B 1',
  rootComment: '5五に角を打つと、2二の玉と8二の飛車が同じ角の利きに入ります。',
  line: {
    moves: 'B*5e',
    notes: {
      0: '斜めどこへでも動ける特性を活かした王手飛車取り。'
    },
    comment: '角の斜めの利きで王手と飛車取りを同時にかける、最も有名な両取りです。',
  },
}
