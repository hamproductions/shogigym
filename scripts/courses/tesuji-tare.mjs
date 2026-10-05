export default {
  id: 'tesuji--tare-fu',
  title: '手筋: 垂れ歩',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「歩の効果的な手筋」(https://www.shogi-rule.com/koma_hu/)の「垂れ歩」の図(部分図、玉なし)をSFENに変換。先手の持ち駒は歩のみ(図に持ち駒の表示がないため打つ駒だけを置いた)。',
  goalFormation: '垂れ歩: 相手の駒から一つ離して歩を打ち、次の成りを受けにくくする。',
  startSfen: '7nl/6gb1/6p1p/9/9/9/6P1P/7R1/7NL b P 1',
  rootComment: '飛車の筋、2筋に歩を使う手筋。相手の駒に直接当てずに打つのがポイントです。',
  line: {
    moves: 'P*2d',
    notes: { 0: 'あえて相手の駒から離して歩を打ちます。歩を垂らしているように見えることから「垂れ歩」。' },
    comment: 'これで後手は2三への歩の成り込みを防ぐ受けがなくなります。',
  },
}
