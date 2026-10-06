const course = {
  id: 'shogirule--40',
  title: '後手四間飛車 対 先手棒銀(将棋ルール.com)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  source:
    '手順は将棋ルール.com「後手四間飛車 対 先手棒銀 の定跡」(https://www.shogi-rule.com/joseki-40/)掲載の棋譜ファイル(joseki-40.kif、36手、検討エンジンGPSfishの解析付き)をそのまま使用し、全手を合法手検証済み。終局面のまとめは手順と盤面から独自に書いたもので、ページの文章は転載していない(形勢判断のみ出典による)。',
  goalFormation:
    '先手は▲3七銀〜▲2六銀の棒銀に▲3八飛・▲3五歩を加え、3筋から攻める構え。後手は△1二香と香を先に逃がし、飛車を△3二飛と3筋へ回して、角を△5一角〜△6二角と引いた。6二の角は4四と3五の歩がどけば2六の銀に当たる筋にいる。出典の形勢判断は互角。',
  rootComment: '後手四間飛車 対 先手棒銀。最後まで進めると、終局面のまとめが表示されます。',
  line: {
    moves:
      '7g7f 3c3d 2g2f 4c4d 3i4h 8b4b 5i6h 7a7b 6h7h 9c9d 9g9f 3a3b 5g5f 4a5b 4i5h 5a6b 3g3f 6b7a 2f2e 2b3c 7i6h 7a8b 6h5g 1a1b 6i6h 5c5d 4h3g 3b4c 3g2f 4b3b 2h3h 3c5a 3f3e 5a6b 4g4f 5b4b',
    comment:
      '先手は▲3七銀〜▲2六銀の棒銀に▲3八飛・▲3五歩を加え、3筋から攻める構え。後手は△1二香と香を先に逃がし、飛車を△3二飛と3筋へ回して、角を△5一角〜△6二角と引いた。6二の角は4四と3五の歩がどけば2六の銀に当たる筋にいる。出典の形勢判断は互角。',
  },
}

export default course
