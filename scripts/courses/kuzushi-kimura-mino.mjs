export default {
  id: 'kuzushi--kimura-mino',
  title: '囲い崩し: 木村美濃に△3五歩▲同歩△3六歩',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '局面と手順はWikipedia日本語版「美濃囲い」(https://ja.wikipedia.org/wiki/美濃囲い)の図「木村美濃囲いの攻略」と同節の解説に準拠(CC BY-SA)。図の局面(△3六歩まで、持ち駒は先手 角歩3・後手 角)をSFENに変換し、全手を合法手検証済み。',
  goalFormation: '木村美濃は玉に紐がなく、角の打ち込みで金銀を崩される。四間飛車側から見れば、自分の美濃がこう崩されるという警告。',
  startSfen: 'ln5nl/1r3gk2/p1s1sg1p1/2p1pp2p/3G2P2/PPP1PPp1P/2S2SNP1/3R2GK1/LN6L b B3Pb 1',
  rootComment: '木村美濃囲いのくずし例。居飛車が△3五歩▲同歩△3六歩とした場面です。',
  line: {
    moves: '▲３六銀△７九角▲４八飛△５七角成',
    notes: {
      0: '▲同銀ならば…',
      1: '△7九角と打つのが狙い。',
      2: '▲4八飛と受けると…',
      3: '△5七角成。▲6九飛ならば△4六角成で、▲4七銀には△同馬▲同金△5七銀と攻めが続きます。',
    },
    comment: '玉に紐がないため、一旦王手がかかると為す術もなく即詰みか一手一手の寄りになりやすい。7八飛型の三間飛車や5八飛型の中飛車でも△6九角が同じ狙いになります。',
  },
}
