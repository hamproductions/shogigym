export default {
  id: 'tesuji--soko-fu',
  title: '手筋: 底歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source: '局面と手はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「底歩」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(同内容が金の手筋(https://www.shogi-rule.com/koma_kin/)の「底歩」にも掲載)。',
  goalFormation: '底歩: 金の下に歩を打ち、飛車の横からの攻めを大きく遅らせる。',
  startSfen: 'lnsgkgs1l/9/ppppppppp/3b3n1/9/5P3/6PPP/1+r1G2SK1/5G1NL b P 1',
  rootComment: '8八に敵の龍がいて、6八の金が横から狙われています。金の下に歩を打つ手を探しましょう。',
  line: {
    moves: 'P*6i',
    notes: {
      0: '金の真下に歩を打つ。金と歩の2枚セットで飛車の横利きを止めます。',
    },
    comment: 'この金は捨てるつもりで指します。崩すのに何手もかかるため、終盤の詰む詰まないの勝負で威力を発揮します。',
  },
}
