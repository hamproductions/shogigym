const course = {
  id: 'tesuji--renda-fu',
  title: '手筋: 連打の歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「連打の歩」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(持ち駒の歩2枚は手順から推定。図は手順のコマ送りを読み取った)。',
  goalFormation: '連打の歩: 常に自分の手番になるよう歩を打ち続け、香車を確実に奪う。',
  startSfen: 'ln2g3l/1ks1s4/pppp1pp2/7S1/9/2P5p/PP1P1PP2/2K1G2R1/LNSG3NL b 2P 1',
  rootComment: '1一に相手の香車がいて、2四に銀が控えています。歩を連打する手順を探しましょう。',
  line: {
    moves: 'P*1b 1a1b P*1c 1b1c 2d1c+',
    notes: {
      0: '歩を連打して、香車を確実に奪います。',
      1: '香車は歩を取るしかなく、',
      2: 'もう一度歩を打ちます。',
      3: '香車が取るとき、',
      4: '銀で香車が取れます。',
    },
    comment: 'ポイントは常に自分の手番になるように歩を連打し続けることです。',
  },
}

export default course
