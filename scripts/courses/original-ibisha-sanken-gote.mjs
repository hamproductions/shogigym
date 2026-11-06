export default {
  id: 'ibisha-vs-sankenbisha--gote',
  title: '後手居飛車：通常の三間飛車に備える',
  titleEn: 'Gote Static Rook: Preparing against Normal Third File Rook',
  myStrategy: 'ibisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'gote',
  userSide: 'gote',
  source: '先手の通常の三間飛車に対する後手居飛車の標準的な配置から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手は飛車８二・歩８五、玉３二・金５二、銀４四で構える。先手は飛車７八・角７七、玉２八・銀３八の美濃囲い。７筋の歩は７六のままで、石田流の浮き飛車とは区別する。',
  goalLabel: '飛車先の守りと中央の銀を確認する',
  goalSfen: 'ln3g1nl/1r1sg1kb1/p4p1p1/2pppsp1p/1p7/2PPPP2P/PPBS2PP1/2R1G1SK1/LN3G1NL b - 1',
  rootComment:
    '後手居飛車で、先手の飛車７八に向き合います。この教材の先手は角道を６六歩で止め、角７七で８六を守る通常の三間飛車です。飛車の位置だけでなく、角と歩の位置も見て作戦を区別してください。',
  rootCommentEn:
    'Play Gote Static Rook against Sente’s rook on 7h. Sente closes the bishop diagonal with a pawn on 6f and places the bishop on 7g to guard 8f. Identify this normal Third File Rook formation from its bishop and pawns as well as its rook.',
  line: {
    moves: '7g7f 8c8d 6g6f 8d8e 8h7g 3c3d 2h7h 7a6b 5i4h 5c5d 4h3h 5a4b 3h2h 4b3b 3i3h 6a5b 7i6h 3a4b 5g5f 7c7d 6i5h 4b5c 1g1f 1c1d 6h6g 6c6d 4g4f 5c4d',
    notes: {
      4: '▲７七角で８六を守りました。後手の８五歩をすぐ取れるという意味ではありません。',
      6: '▲７八飛。７六歩と７七角が残る、通常の三間飛車です。',
      13: '△３二玉で飛車８二から離れます。角２二はまだ動かしていません。',
      15: '△５二金で６一を空け、玉側へ金を寄せます。',
      21: '△５三銀。３一の銀が４二を経由して中央へ来ました。もう一枚の銀は６二に残ります。',
      25: '△６四歩。６三が空き、６五で先手の６六歩と接触する候補ができます。',
      27: '△４四銀で５五へ利かせます。先手の５六歩と６七銀も含め、中央の接触を読む位置です。',
    },
    notesEn: {
      4: '▲7七角 guards 8f. It does not immediately capture Gote’s pawn on 8e.',
      6: '▲7八飛 establishes normal Third File Rook, with the pawn on 7f and bishop on 7g still in place.',
      13: '△3二玉 moves away from the rook on 8b. Gote’s bishop remains on 2b.',
      15: '△5二金 clears 6a and brings a gold toward the king.',
      21: '△5三銀 develops the silver from 3a through 4b. The other silver stays on 6b.',
      25: '△6四歩 clears 6c and makes contact on 6e with Sente’s pawn on 6f a candidate.',
      27: '△4四銀 controls 5e. Read future central contact with Sente’s pawn on 5f and silver on 6g in view.',
    },
    comment:
      '後手は飛車先を８五まで伸ばし、玉３二と銀４四を配置しました。先手角７七が８六を守るので、８筋の歩交換は相手の応手も読んで判断します。次の例では６筋の交換を選び、角道の変化を確認します。',
    commentEn:
      'Gote has a pawn on 8e, king on 3b and silver on 4d. Sente’s bishop on 7g guards 8f, so assess a rook-pawn exchange together with Sente’s replies. The comparison branch chooses a sixth-file exchange to show how the bishop diagonal changes.',
    branches: [
      {
        kind: 'alt',
        moves: '6f6e 6d6e 6g6f',
        notes: {
          0: '先手が▲６五歩と接触する例です。６六が空いて角７七の斜め前が開きます。',
          1: 'この枝では△同歩と取ります。後手は歩を一枚持ち、６五には後手歩が残ります。',
          2: '▲６六銀で先手銀が６五の歩に当たります。角７七の道は再び６六の自分の銀で止まります。',
        },
        notesEn: {
          0: 'Sente chooses ▲6五歩, clearing 6f in front of the bishop on 7g.',
          1: 'This branch selects △同歩. Gote gains a pawn in hand and leaves a pawn on 6e.',
          2: '▲6六銀 attacks the pawn on 6e. Sente’s own silver now blocks the bishop diagonal on 6f again.',
        },
        comment:
          '６六歩が銀に替わりました。角７七からの道は、歩を動かした瞬間と銀を進めたあとで違います。交換のあとも、飛車７八・角７七・銀６六を別々に見て、実際に通る道を確かめます。',
        commentEn:
          'The pawn on 6f has been replaced by a silver. The bishop diagonal differs immediately after the pawn push and after the silver develops. Check the actual paths of the rook on 7h, bishop on 7g and silver on 6f separately.',
      },
    ],
  },
}
