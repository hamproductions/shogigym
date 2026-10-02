export default {
  id: 'shikenbisha-vs-aifuri--nishikawa',
  title: '相振り飛車: 西川流(先手) vs 三間飛車・△3六歩には四間飛車',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'sente',
  source:
    '開始局面と手順は三間飛車のひとくちメモ「相振り飛車の基礎知識 三間飛車VS四間飛車とは」(https://thirdfilerook.jp/about-third-file-rook-vs-fourth-file-rook/)の第2図(9手目▲8五歩まで)〜第3図(13手目▲6八飛まで)に準拠。本文は「▲6六飛」だが第3図の図面は飛車が6八にあり図のキャプションも▲6八飛のため、▲6八飛とした。開始局面は第2図をSFENに変換し、第3図と一致することを確認、全手を合法手検証済み。',
  goalFormation: '飛車と左銀の移動を保留して8筋を伸ばし、後手が3筋から動いてきたら四間飛車、動いてこなければ向かい飛車にする。',
  startSfen: 'lnsg1gsnl/3k2rb1/pppppp1pp/9/1P4p2/2PP5/P1B1PPPPP/7R1/LNSGKGSNL w - 10',
  rootComment:
    '第2図。西川和宏六段が編み出した西川流。▲7六歩△3四歩▲6六歩△3二飛(三間飛車)に▲7七角と上がり、飛車と左銀の移動を保留して8筋の歩を伸ばしていきます。四間飛車と向かい飛車を両天秤にかけた作戦です。',
  line: {
    moves: '△３六歩▲同歩△同飛▲６八飛',
    notes: {
      0: '後手が3筋から動いてきました。',
      3: '後手が動いてきたら四間飛車にします(第3図)。後手が動いてこなければ、ストレートに向かい飛車にします。',
    },
    comment: '第3図。詳しくは西川六段の「これからの相振り飛車」。',
  },
}
