export default {
  id: 'tesuji--tsugi-kei',
  title: '手筋: 継ぎ桂',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source: '局面と手はshogi-rule.com「桂馬の効果的な手筋」(https://www.shogi-rule.com/koma_keima/)の「継ぎ桂」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。',
  goalFormation: '継ぎ桂: 桂馬の跳び先に桂馬を足していき、相手の陣形を崩す。',
  startSfen: '7nl/4ggks1/4pppp1/8p/9/5PPNP/4PGNP1/6SK1/5G3 b N 1',
  rootComment: '2六と3七に桂馬が並んでいます。3四に桂馬を足す手を探しましょう。',
  line: {
    moves: 'N*3d 3c3d 2f3d',
    notes: {
      0: '桂馬の跳び先に桂馬を足していきます。一見タダで桂馬をあげているように見えますが、',
      1: '歩で取らせてから、',
      2: 'もう一枚の桂馬で取り返し、金と銀に両取りをかけます。',
    },
    comment: '陣形を崩す方が得になる場面で効果的です。',
  },
}
