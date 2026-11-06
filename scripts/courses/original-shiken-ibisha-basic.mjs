export default {
  id: 'shikenbisha-vs-ibisha--basic',
  title: '後手四間飛車：角道を開き、囲いを組み替える',
  titleEn: 'Gote Fourth File Rook: Open a Bishop Line and Reorganize the Castle',
  myStrategy: 'shikenbisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '四間飛車の美濃・４五歩と銀４四・銀冠への組み替えという標準的な構想を、新ペタショック定跡（MIT）の候補手と照合して独立に選択。説明と待機の比較枝を新しく執筆。',
  goalFormation: '後手は飛車４二・玉８二の美濃から４五歩と伸ばし、銀４四で支える。比較枝では８四歩、銀８三、金７二へ組み替えて銀冠の配置を作る。',
  goalLabel: '動かした駒の元の守りも確認する',
  goalSfen: 'ln1g3nl/1ks1gr3/ppppp1bpp/5sp2/3P1p1P1/2P1P1P2/PP2SP2P/1BK1GS1R1/LN1G3NL b - 1',
  rootComment:
    '後手四間飛車で玉を美濃へ運び、そのあと角道と囲いを調整する例です。４五歩で斜線を開く手と、銀を４四へ進めて歩を守る手は別々に数えます。相手が接触を急がない比較枝では、銀冠への組み替えも確認します。',
  rootCommentEn:
    'Build Gote Fourth File Rook with Mino, then examine changes to the bishop diagonal and castle. Count opening the diagonal with △4五歩 separately from developing the silver to 4d to support that pawn. A comparison with no immediate opposing contact also demonstrates a Silver Crown reorganization.',
  line: {
    moves: '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 3g3f 3b4c 6g6f 4d4e 6f6e 4c4d',
    notes: {
      7: '△４二飛は先手の２筋とは違う筋へ飛車を置く手です。',
      17: '△７二銀で玉８二の隣を守ります。',
      19: '△５二金を置き、美濃の玉・銀・金の位置を確認します。',
      21: '△４三銀が４四歩を守ります。',
      22: '▲６六歩と相手が角道を自分の歩で止める例です。',
      23: '△４五歩で４四が空きます。角３三から４四・５五・６六へ道が通り、６六の先手歩に当たります。',
      24: '▲６五歩でその歩が動き、６六も空きました。',
      25: '△４四銀は４五歩を正面から守ります。同時に角３三の斜め前に自分の銀を置くため、角道はこの銀で再び止まります。',
    },
    notesEn: {
      7: '△4二飛 places the rook on a different file from Sente’s second-file rook.',
      17: '△7二銀 guards beside king 8b.',
      19: '△5二金 completes the king, silver and gold arrangement of Mino.',
      21: '△4三銀 guards pawn 4d.',
      22: 'This example selects ▲6六歩, blocking Sente’s own bishop diagonal.',
      23: '△4五歩 clears 4d, letting bishop 3c reach Sente’s pawn on 6f through 4d and 5e.',
      24: '▲6五歩 moves that pawn and clears 6f too.',
      25: '△4四銀 guards pawn 4e directly ahead. It also places a friendly silver diagonally in front of bishop 3c, blocking that bishop line again.',
    },
    comment:
      '銀４四で４五歩を支える形になりました。角道を一度開けたあとも、自分の銀が新しい壁になったことを確認します。玉８二・銀７二・金５二の美濃は、次の比較で銀冠へ組み替えます。',
    commentEn:
      'Silver 4d supports pawn 4e. Although the pawn advance opened the diagonal, your own silver has now become a new blocker. The comparison reorganizes the Mino arrangement of king 8b, silver 7b and gold 5b toward Silver Crown.',
    branches: [
      {
        kind: 'alt',
        moves: '9g9f 8c8d 1g1f 7b8c 7f7e 5b6b 4g4f 6b7b 6i6h 9c9d 1f1e 9a9b',
        notes: {
          0: '先手が端の▲９六歩を選ぶ比較です。',
          1: '△８四歩で銀を置く８三を空けます。',
          2: '先手が▲１六歩と接触を急がない例です。',
          3: '△８三銀で玉８二の前へ銀を置きます。元の７二は空きました。',
          5: '先手の▲７五歩に、後手は△６二金と寄せる手を選びます。',
          7: '▲４六歩に△７二金。銀が空けた升を金で埋めます。４筋の接触は残っています。',
          9: '▲６八金△９四歩まで、玉側の配置を比較しました。',
          11: '先手が▲１五歩を選ぶ比較で、後手は△９二香と１段上げます。９一が空き、香９二は玉８二の隣に置かれます。',
        },
        notesEn: {
          0: 'This comparison selects Sente’s edge move ▲9六歩.',
          1: '△8四歩 clears 8c for the silver.',
          2: 'Sente selects ▲1六歩 without immediate contact.',
          3: '△8三銀 develops in front of king 8b and clears 7b.',
          5: 'After ▲7五歩, Gote selects △6二金.',
          7: '▲4六歩 is met here by △7二金, filling the square vacated by the silver. Fourth-file contact remains unresolved.',
          9: '▲6八金 △9四歩 completes this comparison of the king-side arrangement.',
          11: 'After the selected ▲1五歩, △9二香 lifts the lance, clearing 9a and placing it beside king 8b.',
        },
        comment:
          '玉８二・銀８三・金７二の銀冠です。銀を前へ出したため、最初の銀７二による守りとは利きが変わりました。この枝では相手がすぐ取り合わない手を選んでおり、どの局面でも囲いの組み替えを優先するという意味ではありません。',
        commentEn:
          'King 8b, silver 8c and gold 7b form Silver Crown. The advanced silver controls different squares from its original post on 7b. Sente selected replies without immediate exchanges here; the example does not recommend prioritizing castle reorganization in every position.',
      },
    ],
  },
}
