const course = {
  id: 'shikenbisha-vs-anaguma--fujii',
  title: '四間飛車 vs 居飛車穴熊(先手・藤井システム)',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  source:
    '手順はWikipedia英語版「Fujii System」(https://en.wikipedia.org/wiki/Fujii_System)の Development 節の29手に準拠(西洋式表記からUSIに変換し合法手検証済み)。解説は同記事の本文に準拠。',
  goalFormation: '玉は居玉のまま、左銀を4七、右桂を3七、端歩を1五まで伸ばし、▲6五歩で角筋を相手玉(2二)に通した形。',
  goalLabel: '藤井システムの攻撃態勢が整いました',
  rootComment: '藤井猛九段が創案した、居飛車穴熊・左美濃対策の四間飛車。穴熊が完成する前に、居玉のまま角筋と端から攻めかかります。',
  line: {
    moves: '7g7f 3c3d 6g6f 8c8d 2h6h 7a6b 1g1f 5a4b 3i3h 4b3b 7i7h 5c5d 7h6g 6a5b 1f1e 6b5c 6i5h 8d8e 8h7g 2b3c 4g4f 3b2b 3g3f 4c4d 2i3g 5b4c 6f6e 4a3b 3h4g',
    notes: {
      4: '角道を止めて飛車を6筋へ。四間飛車です。',
      6: '玉を囲う前に端歩を突きます。相手が穴熊を目指すなら、居玉のまま1筋から速攻をかけるのが藤井システムの特徴です。',
      12: '銀を6七へ進めます。',
      14: '端歩を5段目まで突き越し、端攻めの準備をします。',
      24: '右桂を3七へ跳ねて攻めに参加させます。',
      26: '6筋の歩を突いて角筋を通します。角は相手玉のいる2二の筋を直接にらみ、相手が穴熊(2一)に潜っても同じ筋の上にいます。',
      28: '3八の銀を4七へ上がり、3七に跳ねた桂の頭を守ります。',
    },
    comment:
      '藤井システムの基本形。玉は居玉のまま、角筋・右桂・端歩で穴熊の完成前に攻めかかります。相手が香を1二に上がって穴熊に入ってきたら▲2五桂、▲4五歩で角筋を開けて攻めます。逆に相手が早い戦いを仕掛けてきたら、▲4八玉〜▲3九玉と美濃囲いに切り替えます。',
  },
}

export default course
