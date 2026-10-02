export default {
  id: 'shikenbisha-vs-aifuri--2fu',
  title: '相振り飛車: 四間飛車(先手) vs 三間飛車・2歩を手持ちにする手筋',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'sente',
  source:
    '開始局面と手順は三間飛車のひとくちメモ「相振り飛車の基礎知識 三間飛車VS四間飛車とは」(https://thirdfilerook.jp/about-third-file-rook-vs-fourth-file-rook/)の第4図(18手目△4三銀まで)〜第5図(25手目▲8四飛まで)に準拠。開始局面は第4図をSFENに変換し、第5図と一致することを確認、全手を合法手検証済み。',
  goalFormation: '6筋と8筋の歩を交換して2歩を手持ちにし、飛車を戦いやすい8筋へ転換した形(第5図)。',
  startSfen: 'lnsg3nl/2k1g1rb1/ppppps1pp/5p3/1P1P2p2/2P6/P1B1PPPPP/2SR1K3/LN1G1GSNL b - 19',
  rootComment:
    '第4図。相振り飛車の四間飛車は、玉を深く囲う相手に対して争点がずれがちで損な戦法と言われますが、6七の地点が守られていて▲6五角を打たれる隙がない安定感があります。ここから四間飛車で有名な、6筋と8筋の歩をまとめて交換する手筋を指します。',
  line: {
    moves: '▲８四歩△同歩▲６四歩△同歩▲同飛△６三歩▲８四飛',
    notes: {
      0: 'まず8筋の歩を突き捨てます。局面によって歩を突く順番で微妙な紛れが生じます。',
      2: '続けて6筋の歩も突き捨てます。',
      4: '飛車で6筋の歩を取ります。',
      6: '飛車を8筋に転換。2歩を手持ちにしつつ、戦いやすい8筋に飛車が回れて一石二鳥です。',
    },
    comment: '第5図。2歩を手持ちにし、飛車は8筋に転換しました。',
  },
}
