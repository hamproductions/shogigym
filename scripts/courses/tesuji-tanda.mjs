export default {
  id: 'tesuji--tanda-fu',
  title: '手筋: 単打の歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source: '局面と手順はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「単打の歩」の図と「金でとった場合」の図をSFENに変換。持ち駒は図に表示がないため、打つ歩だけを置いた。',
  goalFormation: '単打の歩: ただ歩を打つだけで、取った駒の移動で別の駒が取れる。',
  startSfen: 'ln2gs1+Rl/1ks6/pppp1pp1p/9/9/2P6/PP1P1PP1P/2K1GS3/LNSG3NL b P 1',
  rootComment: '龍が2一に入っている局面。後手の金と銀の連携を崩す歩を探しましょう。',
  line: {
    moves: 'P*5b 5a5b 2a4a',
    notes: {
      0: 'ただ歩を打つだけ。それでも驚くべき力を発揮します。',
      1: '金で取ると…',
      2: '銀が取れます。',
    },
    comment: '出典では銀で取った場合も解説されています(金が取れる)。',
  },
}
