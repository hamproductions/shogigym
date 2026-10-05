export default {
  id: 'tesuji--shoten-fu',
  title: '手筋: 焦点の歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「焦点の歩」の図をSFENに変換。持ち駒は図に表示がないため、打つ歩だけを置いた。',
  goalFormation: '焦点の歩: 多くの駒が利いている地点に打つ。どの駒で取っても、どこかの利きが消える。',
  startSfen: 'lnsgkg1nl/6rb1/pppppp2p/9/6SR1/9/PPPPPP2P/1B7/LNSGKGSNL b P 1',
  rootComment: '3三には後手の飛車・角・桂馬が利いています。',
  line: {
    moves: 'P*3c',
    notes: { 0: '飛車、角、桂馬の焦点に歩を打ちます。どれで取っても利きが一つ消え、銀や飛車が働きます。' },
    comment: '出典では桂・飛・角それぞれで取った場合を解説しています(桂で取ると銀が取れる)。',
  },
}
