export default {
  id: 'shikenbisha-vs-aifuri--nishikawa',
  title: '相振り飛車: 西川流(先手) vs 三間飛車・△3六歩には四間飛車',
  titleEn: 'Double Ranging Rook: Nishikawa style vs Third File Rook, answer △3六歩 with Fourth File Rook',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'sente',
  source:
    '手順は三間飛車のひとくちメモの相振り飛車の解説を参考(https://thirdfilerook.jp/about-third-file-rook-vs-fourth-file-rook/)。開始局面をSFENに起こし、全手を合法手検証済み。解説はこのアプリのために書き下ろし。',
  goalFormation: '飛車をまだ2八に置いたまま8筋の歩を伸ばし、後手の出方を見る。後手が3筋で動けば飛車を6八に回して四間飛車、動かなければ向かい飛車に振る。',
  startSfen: 'lnsg1gsnl/3k2rb1/pppppp1pp/9/1P4p2/2PP5/P1B1PPPPP/7R1/LNSGKGSNL w - 10',
  rootComment:
    '先手は7七に角を上げ、飛車の振り先と左の銀をあえて決めないまま8筋の歩を突き進めます。後手の三間飛車の動きを確かめてから、四間飛車か向かい飛車かを選ぶ、待ちの構えを学びます。',
  line: {
    moves: '△３六歩▲同歩△同飛▲６八飛',
    notes: {
      0: '後手が3筋の歩を突き出し、先手の3六の歩に当てて攻めてきた。',
      1: '3七の歩で取って応じる。歩を一枚手に入れる。',
      2: '後手の飛車が3六まで出て、先手陣の右側ににらみを利かせる。',
      3: '後手が3筋で動いたので、飛車を6八に回して四間飛車に決める。動いてこない場合は、飛車を8八に振って向かい飛車にする。',
    },
    comment: '先手は四間飛車に決まった局面。後手が3筋を動かしたことで、先手の飛車の振り先が確定する。',
  },
}
