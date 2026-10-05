export default {
  id: 'tesuji--hikae-kei',
  title: '手筋: 控えの桂',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  noEngine: true,
  source:
    '局面と手はshogi-rule.com「桂馬の効果的な手筋」(https://www.shogi-rule.com/koma_keima/)の「控えの桂」の図をSFENに変換。持ち駒は図に表示がないため、打つ駒などを手順から推定して置いた。(2六の桂を打つ手と推定した。図に矢印のみで手の種類の記載はない)。',
  goalFormation: '控えの桂: 次に効果的な位置へ跳ねられるよう、桂馬を準備しておく。',
  startSfen: '7nl/4ggks1/4pp1p1/6p1p/9/5PP1P/4PGNP1/6SK1/5G3 b N 1',
  rootComment: '2六に桂馬を置くと、3四へ跳ねる狙いが生まれます。',
  line: {
    moves: 'N*2f',
    notes: {
      0: '次の手で効果的な位置へ跳ねられるよう、桂馬を控えに置きます。',
    },
    comment: '時間が経つほど効果を発揮する手筋で、陣形を崩す狙いや他の攻めとの連動に使います。',
  },
}
