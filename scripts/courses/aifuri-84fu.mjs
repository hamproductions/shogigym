export default {
  id: 'shikenbisha-vs-aifuri--2fu',
  title: '相振り飛車: 四間飛車(先手) vs 三間飛車・2歩を手持ちにする手筋',
  titleEn: 'Double Ranging Rook: Fourth File Rook vs Third File Rook, winning two pawns in hand',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'sente',
  source:
    '手順は三間飛車のひとくちメモの相振り飛車の解説を参考(https://thirdfilerook.jp/about-third-file-rook-vs-fourth-file-rook/)。開始局面をSFENに起こし、全手を合法手検証済み。解説はこのアプリのために書き下ろし。',
  goalFormation: '8筋と6筋の歩を捨てて取り返し、歩を二枚手持ちにしながら飛車を8筋へ回す。相手の玉に近い筋で飛車が働く。',
  startSfen: 'lnsg3nl/2k1g1rb1/ppppps1pp/5p3/1P1P2p2/2P6/P1B1PPPPP/2SR1K3/LN1G1GSNL b - 19',
  rootComment:
    '先手が四間飛車、後手が三間飛車の相振り飛車。双方が飛車を振るので、飛車先の歩を使った小さな交換が戦いの出だしになります。ここでは8筋と6筋の歩を連続して突き捨て、飛車を6筋から8筋へ移す流れを覚えます。',
  line: {
    moves: '▲８四歩△同歩▲６四歩△同歩▲同飛△６三歩▲８四飛',
    notes: {
      0: '8五の歩を8四に突き出す。取られても構わない捨て歩で、後手の8筋の歩を一つ前に引き出す狙い。',
      2: '同じ要領で6筋の歩を突き出す。後手の歩が6四に上がると、飛車で取れる形になる。',
      4: '6八の飛車で6四の歩を取る。歩を一枚得た代わりに、飛車が敵陣近くに出ていく。',
      5: '後手は歩を打って飛車を追い、6筋にとどまれなくする。',
      6: '飛車を8四へ滑らせ、取れる歩をもう一枚拾う。8筋は後手玉に近く、飛車の働きが大きい。これで歩の持ち駒が二枚になった。',
    },
    comment: '歩を二枚手持ちにし、飛車は8筋に回った局面。以後は持ち歩を使って、8筋から後手陣に圧力をかける。',
  },
}
