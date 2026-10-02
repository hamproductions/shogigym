export default {
  id: 'kuzushi--mino-36kei',
  title: '囲い崩し: 美濃囲いに△3六桂',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '局面と手順はWikipedia日本語版「美濃囲い」(https://ja.wikipedia.org/wiki/美濃囲い)の図「美濃囲いの有名なくずし例」と同節の解説に準拠(CC BY-SA)。図の局面(△3六桂と打たれた局面、持ち駒は先手 銀桂歩2・後手 角銀歩)をSFENに変換し、全手を合法手検証済み。',
  goalFormation: '美濃囲いは3六への桂打ちと角のにらみに弱い。△3六桂を▲同歩と取らせて△8八飛成〜△5五角の王手飛車を決める。',
  startSfen: 'l+R3g1nl/3sg1k2/p2p1p1p1/2P1p1p1p/3P5/6n1P/P3PPPP1/LB2G1SK1/1r3G1NL b SN2Pbsp 1',
  rootComment:
    '△3六桂と打たれた局面。一段飛車と角のにらみがあると、美濃囲いは△3六桂であっという間に寄ってしまいやすい。▲1八玉は△1七銀、▲1七玉は△2八銀で、どちらも△4九飛成で金を手に入れると詰む。ここでは▲同歩と取った場合を確かめます。',
  line: {
    moves: '▲３六歩△８八飛成▲同龍△５五角',
    notes: {
      0: '△3六桂を▲同歩と取ると…',
      1: '飛車を切って龍を8八に引き寄せます。',
      3: '△5五角が王手飛車。玉と8八の龍を同時に狙います。',
    },
    comment: '王手飛車がかかり、美濃側は受けきれません。美濃を寄せる急所は4九(後手なら6一)の金を動かすことで、3九に角や銀を打つ展開になると美濃の玉は寄ってしまいます。',
  },
}
