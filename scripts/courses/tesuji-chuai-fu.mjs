const course = {
  id: 'tesuji--chuai-fu',
  title: '手筋: 中合いの歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「中合いの歩」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(後手2四の駒は桂として読んだ)。',
  goalFormation: '中合いの歩: 相手の角筋を止めたいとき、歩をぶつけて取らせてから金と歩で受ける。',
  startSfen: 'lnsgkgs1l/1r7/ppppppppp/3b3n1/9/9/5PPPP/4G1SK1/5G1NL b P 1',
  rootComment: '相手の角筋が気になる局面です。角道に歩を上げる手を探しましょう。',
  line: {
    moves: '4g4f 6d4f 5h4g 4f6d P*4f',
    notes: {
      0: '角道にあえて歩を上げ、取らせます。',
      1: '歩を取ってきたら、',
      2: '金を上がって強く受けます。金が上がると桂馬も跳ねられません。',
      3: '角が引いたら、',
      4: '歩を打ってがっちり受けます。',
    },
    comment: '手順通りに高美濃囲いに移行できました。',
  },
}

export default course
