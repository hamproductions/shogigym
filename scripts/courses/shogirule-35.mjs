const course = {
  id: 'shogirule--35',
  title: '先手四間飛車「藤井システム」(将棋ルール.com)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  source:
    '手順は将棋ルール.com「先手四間飛車「藤井システム」の定跡」(https://www.shogi-rule.com/joseki-35/)掲載の棋譜ファイル(joseki-35.kif、47手、検討エンジンGPSfishの解析付き)をそのまま使用し、全手を合法手検証済み。終局面のまとめは手順と盤面から独自に書いたもので、ページの文章は転載していない(形勢判断のみ出典による)。',
  goalFormation:
    '先手は居玉(5九)のまま、▲1五歩・▲3七桂〜▲2五桂・▲4五歩と、後手の囲いが整う前に攻めかかった。桂を3三で交換し、▲4四歩・▲3五歩・▲6四歩と歩を使ったため、終局面の先手の持ち駒は銀1枚で歩がない。後手は角を5一→7三→6四と転回し、1九の香まで利かせている。出典の形勢判断は後手優勢。',
  rootComment: '先手四間飛車「藤井システム」。最後まで進めると、終局面のまとめが表示されます。',
  line: {
    moves:
      '7g7f 8c8d 2h6h 3c3d 6g6f 7a6b 1g1f 5a4b 3i3h 4b3b 7i7h 5c5d 7h6g 6a5b 1f1e 6b5c 6i5h 2b3c 4g4f 3b2b 3g3f 4c4d 2i3g 8d8e 8h7g 5b4c 6f6e 4a3b 3h4g 7c7d 3g2e 3c5a 4f4e 5a7c 4e4d 5c4d P*4e 4d3c 2e3c+ 2a3c 4e4d 4c4b 3f3e 3d3e 6e6d 7c6d 6g5f',
    comment:
      '先手は居玉(5九)のまま、▲1五歩・▲3七桂〜▲2五桂・▲4五歩と、後手の囲いが整う前に攻めかかった。桂を3三で交換し、▲4四歩・▲3五歩・▲6四歩と歩を使ったため、終局面の先手の持ち駒は銀1枚で歩がない。後手は角を5一→7三→6四と転回し、1九の香まで利かせている。出典の形勢判断は後手優勢。',
  },
}

export default course
