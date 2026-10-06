const course = {
  id: 'tesuji--hisha-ni-hisha',
  title: '手筋: 飛車には飛車',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「飛車の効果的な手筋」(https://www.shogi-rule.com/koma_hisha/)の「飛車には飛車」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(図は下側の六〜九段のみ表示。上段の駒は置いていない)。',
  goalFormation: '飛車には飛車: 打ち込まれた飛車に飛車を合わせて、打ち込み場所をなくす。',
  startSfen: '9/9/9/9/9/2P1PS3/PPBP1PPPP/3G2SK1/LNr2G1NL b R 1',
  rootComment: '7九に敵の飛車が打ち込まれました。慌てず対処しましょう。',
  line: {
    moves: 'R*6i 7i6i 6h6i',
    notes: {
      0: '自陣に飛車を打たれたら、慌てず飛車を合わせて打ちます。',
      1: '相手は飛車を取らざるを得ず、',
      2: '金が1段下がって取り返すと、打ち込める場所がなくなります。',
    },
    comment: '桂馬が取られるように見えても、飛車を合わせることで局面が収まります。',
  },
}

export default course
