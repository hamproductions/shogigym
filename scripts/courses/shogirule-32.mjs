export default {
  id: 'shogirule--32',
  title: '先手矢倉「脇システム」(将棋ルール.com)',
  myStrategy: 'yagura',
  opponentStrategy: 'yagura',
  mySide: 'sente',
  source:
    '手順は将棋ルール.com「先手矢倉「脇システム」の定跡」(https://www.shogi-rule.com/joseki-32/)掲載の棋譜ファイル(joseki-32.kif、56手、検討エンジンGPSfishの解析付き)をそのまま使用し、全手を合法手検証済み。終局面のまとめは手順と盤面から独自に書いたもので、ページの文章は転載していない(出典ページに形勢判断の記載はない)。',
  goalFormation:
    '双方が▲7九角・△3一角と角を引き、▲4六角・△6四角と同じ形で角を向かい合わせた脇システム。先手は▲6四角△同銀と角を交換し、▲2六銀から▲1五歩と端を攻めて銀と香を交換した。後手は△6九角から△4七角成と馬を作り、先手は▲1三歩・▲4一角・▲1四同香と後手玉の端に迫る。',
  rootComment: '先手矢倉「脇システム」。最後まで進めると、終局面のまとめが表示されます。',
  line: {
    moves:
      '7g7f 8c8d 7i6h 3c3d 6g6f 7a6b 5g5f 5c5d 3i4h 3a4b 4i5h 4a3b 6i7h 5a4a 5i6i 7c7d 5h6g 6a5b 6h7g 4b3c 8h7i 2b3a 3g3f 4c4d 4h3g 3a6d 7i4f 5b4c 2g2f 6b7c 2f2e 8d8e 6i7i 4a3a 7i8h 3a2b 1g1f 9c9d 9g9f 1c1d 4f6d 7c6d 3g2f B*6i 1f1e 1d1e 2f1e 1a1e 1i1e 6i4g+ P*1c 2a1c B*4a P*1d 1e1d P*1b',
    comment:
      '双方が▲7九角・△3一角と角を引き、▲4六角・△6四角と同じ形で角を向かい合わせた脇システム。先手は▲6四角△同銀と角を交換し、▲2六銀から▲1五歩と端を攻めて銀と香を交換した。後手は△6九角から△4七角成と馬を作り、先手は▲1三歩・▲4一角・▲1四同香と後手玉の端に迫る。',
  },
}
