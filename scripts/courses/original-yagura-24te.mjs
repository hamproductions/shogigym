export default {
  id: 'yagura--24te',
  title: '矢倉24手組：骨組みと玉の移動を分ける',
  titleEn: 'The 24-Ply Yagura Framework: Structure Before King Entry',
  myStrategy: 'yagura',
  opponentStrategy: 'yagura',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '標準的な矢倉24手組の配置と駒の経路を新ペタショック定跡（MIT）で照合。駒組み、玉の入城、大駒の配置、７筋の接触を独立して観察する手順と説明を新しく構成。',
  goalFormation:
    '24手で金７八・６七、銀７七、角７九、玉６九の矢倉の骨組みを作る。別の枝で角５七を経て玉が７九・８八へ入り、桂３七・飛車２九の配置と７筋の歩交換を読む。',
  goalLabel: '骨組みができても玉はまだ６九',
  goalSfen: 'ln3kbnl/1r1sg1g2/p2p2spp/1pp1ppp2/9/2PPP1P2/PPSG1P1PP/2G2S1R1/LNBK3NL b - 1',
  rootComment:
    '先手の二枚の金と左銀で矢倉の骨組みを作ります。24手の区切りで、玉まで囲いに入ったかを確かめます。その後は角を移して玉の道を空ける仕事と、右側の攻め駒の配置を分けて進めます。',
  rootCommentEn:
    'Build the Yagura framework with Sente’s two golds and left silver. At the 24-ply checkpoint, check whether the king has actually entered. Then separate clearing the king’s route with the bishop from arranging attacking pieces on the right.',
  line: {
    moves: '7g7f 8c8d 6g6f 3c3d 7i6h 7a6b 5g5f 5c5d 6i7h 3a4b 3i4h 4a3b 4i5h 5a4a 5h6g 7c7d 6h7g 6a5b 8h7i 4b3c 5i6i 2b3a 3g3f 4c4d',
    notes: {
      2: '▲６六歩は角８八の斜線を止める歩です。',
      4: '▲６八銀は次に７七へ出られます。',
      8: '▲７八金。後の玉の位置と取り違えず、今ここにいる駒を確認します。',
      14: '▲６七金で二枚目の金を左側へ運びます。',
      16: '▲７七銀で７八金・６七金と並びます。',
      18: '▲７九角。８八を空けましたが、角自身が７九にいます。',
      20: '▲６九玉。この時点ではまだ８八の玉ではありません。',
      22: '▲３六歩で、後に桂を跳ねる３七を空けます。',
    },
    notesEn: {
      2: '▲6六歩 closes bishop 8h’s diagonal.',
      4: '▲6八銀 prepares development to 7g.',
      8: '▲7八金. Identify the actual piece here rather than confusing it with the king’s later route.',
      14: '▲6七金 transfers the second gold toward the left.',
      16: '▲7七銀 joins golds 7h and 6g.',
      18: '▲7九角 clears 8h but occupies 7i itself.',
      20: '▲6九玉: the king has not yet reached 8h.',
      22: '▲3六歩 clears 3g for a later knight jump.',
    },
    comment:
      '24手で金７八・６七、銀７七、角７九、玉６九です。これがこのコースの骨組みの区切りです。金銀がそろうことと、玉が８八へ入ることは同時ではありません。',
    commentEn:
      'At 24 plies the golds are on 7h and 6g, the silver on 7g, bishop on 7i and king on 6i. This is the framework checkpoint. Arranging the generals and bringing the king to 8h are separate stages.',
    branches: [
      {
        kind: 'alt',
        moves: '9g9f 3b4c 4g4f 9c9d 7i5g 4a3b 6i7i 3b2b 7i8h',
        notes: {
          4: '▲５七角で７九を空けます。角５七の斜線は、右前を歩４六、左前を歩６六が遮っています。',
          6: '▲７九玉と空いた升へ移ります。',
          8: '▲８八玉で金銀の後ろへ入りました。',
        },
        notesEn: {
          4: '▲5七角 clears 7i. Pawn 4f blocks the bishop’s forward-right diagonal and pawn 6f blocks its forward-left diagonal.',
          6: '▲7九玉 uses the newly vacated square.',
          8: '▲8八玉 brings the king behind the generals.',
        },
        comment:
          '玉８八、金７八・６七、銀７七を盤上で指して確かめます。角を５七へ置いただけで３五や６五へ利くとは数えません。間にいる自分の歩も、角道を遮る駒です。',
        commentEn:
          'Locate king 8h, golds 7h and 6g, and silver 7g. Bishop 5g does not yet control 3e or 6e: your own intervening pawns block its diagonals too.',
        branches: [
          {
            kind: 'alt',
            moves: '1c1d 2i3g 6b7c 2h2i 7d7e 7f7e 3a7e 2g2f 7c7d 2f2e 7e6d',
            notes: {
              1: '▲３七桂で４五・２五へ跳ねる力を用意します。',
              3: '▲２九飛。桂が２九を空けてから引きます。',
              5: '△７五歩に▲同歩と取る応手を比較します。',
              6: '△同角は３一から４二・５三・６四を通って取り返します。',
              8: '△７四銀で相手の銀も前へ出ました。',
              10: '△６四角と角を戻す応手を選びます。',
            },
            notesEn: {
              1: '▲3七桂 prepares jumps to 4e or 2e.',
              3: '▲2九飛 retreats after the knight has vacated 2i.',
              5: 'Compare ▲同歩 against △7五歩.',
              6: '△同角 recaptures from 3a through 4b, 5c and 6d.',
              8: '△7四銀 develops the opposing silver.',
              10: 'This example selects the bishop retreat △6四角.',
            },
            comment:
              '先手は玉の入城後に桂３七と飛車２九を配置し、双方が７筋の歩を一枚ずつ持ちました。後手角６四と銀７四も残っています。先手だけが攻めの準備をするわけではなく、相手の接触で歩の位置や持ち駒が変わるところまで読みます。',
            commentEn:
              'After completing king entry, Sente arranges knight 3g and rook 2i. Each side has obtained one pawn from the seventh-file exchange. Gote’s bishop on 6d and silver on 7d remain active too. Read the opponent’s contact and the resulting hands instead of treating development as a one-sided sequence.',
          },
        ],
      },
    ],
  },
}
