const course = {
  id: 'shogirule--42',
  title: '先手四間飛車 対 後手右四間(将棋ルール.com)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  source:
    '手順は将棋ルール.com「先手四間飛車 対 後手右四間 の定跡」(https://www.shogi-rule.com/joseki-42/)掲載の棋譜ファイル(joseki-42.kif、29手、検討エンジンGPSfishの解析付き)をそのまま使用し、全手を合法手検証済み。終局面のまとめは手順と盤面から独自に書いたもので、ページの文章は転載していない(形勢判断のみ出典による)。',
  goalFormation:
    '後手は△6四歩・△5四銀・△6二飛の右四間で6筋を狙いつつ、△1二香〜△1一玉と穴熊に入りかけている。先手は▲5六銀から▲4五銀と銀を交換し、▲2五銀と打って3四の歩を狙う。1一の後手玉は7七の角と同じ斜めの筋にいる。出典の形勢判断は互角。',
  rootComment: '先手四間飛車 対 後手右四間。最後まで進めると、終局面のまとめが表示されます。',
  line: {
    moves: '7g7f 3c3d 6g6f 7a6b 2h6h 6c6d 5i4h 6b6c 3i3h 6c5d 4h3i 5a4b 7i7h 4b3b 7h6g 8b6b 3i2h 2b3c 6g5f 3b2b 8h7g 1a1b 4g4f 2b1a 5f4e 5d4e 4f4e 3a2b S*2e',
    comment:
      '後手は△6四歩・△5四銀・△6二飛の右四間で6筋を狙いつつ、△1二香〜△1一玉と穴熊に入りかけている。先手は▲5六銀から▲4五銀と銀を交換し、▲2五銀と打って3四の歩を狙う。1一の後手玉は7七の角と同じ斜めの筋にいる。出典の形勢判断は互角。',
  },
}

export default course
