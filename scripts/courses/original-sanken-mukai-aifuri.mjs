export default {
  id: 'sankenbisha-vs-mukaibisha--aifuri',
  title: '相振り三間飛車：歩を交換して相手の飛車を受ける',
  titleEn: 'Double Ranging Rook: Exchange Pawns and Meet the Opposing Rook',
  myStrategy: 'sankenbisha',
  opponentStrategy: 'mukaibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '後手三間飛車と先手向かい飛車の標準的な相振り構想を、新ペタショック定跡（MIT）の候補手と照合して独立に構成。別の飛車の引き場所を用いた比較枝と説明を新しく執筆。',
  goalFormation: '後手飛車３二・歩３五と美濃、先手飛車８八・歩８六と金無双。３筋の歩交換で手持ちを得てから、８筋の交換に歩を打って対応する比較を読む。',
  goalLabel: '取った歩の再利用先を見つける',
  goalSfen: 'ln1g3nl/1ks1g1rb1/pppp1s1pp/4pp3/6p2/1PPP5/P1BSPPPPP/1R2GGKS1/LN5NL b - 1',
  rootComment:
    'これから後手飛車３二と先手飛車８八の相振りを組みます。先手の向かい飛車は後手玉側の８筋へ向かう構想です。飛車の違う筋を一緒に見て、自分の歩交換で得た持ち駒を守りへ使う例を読みます。',
  rootCommentEn:
    'We will build a Double Ranging Rook position with Gote’s rook on 3b and Sente’s on 8h. Sente’s Opposing Rook plan targets the eighth file on Gote’s king wing. Read both rook files together: a pawn gained on your own file can later be used in defense.',
  line: {
    moves: '7g7f 3c3d 6g6f 3d3e 8h7g 8b3b 7i6h 5a6b 6h6g 6b7b 2h8h 7b8b 5i4h 7a7b 4h3h 4a5b 4i4h 3a4b 6i5h 4c4d 3i2h 4b4c 8g8f 5c5d',
    notes: {
      3: '△３五歩で飛車を振る筋の歩を伸ばします。',
      5: '△３二飛。先手はまだ飛車を移していません。',
      8: '▲６七銀は歩６六を守ります。',
      10: '▲８八飛で向かい飛車になりました。',
      13: '△７二銀で玉８二の隣を守ります。銀は８三へも利きます。',
      18: '▲５八金。先手は金４八・５八を横に並べる金無双です。',
      20: '▲２八銀で玉３八の隣へ銀を置きます。',
      21: '△４三銀は３四へ利きます。３五の歩を直接守る升ではありません。',
      22: '▲８六歩で先手も飛車先の歩を進めます。',
    },
    notesEn: {
      3: '△3五歩 advances the pawn on the intended rook file.',
      5: '△3二飛 ranges Gote’s rook. Sente has not transferred its rook yet.',
      8: '▲6七銀 guards pawn 6f.',
      10: '▲8八飛 establishes Opposing Rook.',
      13: '△7二銀 guards beside king 8b and also controls 8c.',
      18: '▲5八金 places Sente’s golds side by side on 4h and 5h in Kinmusou.',
      20: '▲2八銀 places a silver beside king 3h.',
      21: '△4三銀 controls 3d, not the pawn square on 3e itself.',
      22: '▲8六歩 advances Sente’s rook pawn too.',
    },
    comment:
      '後手の３五歩と先手の８六歩が、それぞれの飛車の前にあります。後手の手持ちはまだありません。次の比較では３筋で歩を交換してから、８筋を守る歩打ちまで進めます。',
    commentEn:
      'Gote’s pawn on 3e and Sente’s on 8f stand ahead of their respective rooks. Gote has nothing in hand yet. The comparison first exchanges third-file pawns, then uses a pawn drop to meet contact on the eighth file.',
    branches: [
      {
        kind: 'alt',
        moves: '8f8e 3e3f 3g3f 3b3f P*3g 3f3d 8e8d 8c8d 8h8d P*8c 8d8f',
        notes: {
          0: '先手が▲８五歩と伸ばす応手を選びます。',
          1: '△３六歩で相手の３七歩へ接触します。',
          3: '▲同歩△同飛で双方が歩を一枚ずつ持ちました。',
          4: '▲３七歩打は飛車３六への当たりです。',
          5: '△３四飛と引きます。銀４三が３四を守ります。先手歩４七が利く４六へは移っていません。',
          6: '▲８四歩で先手も飛車先を交換しに来ます。',
          8: '△同歩▲同飛で先手飛車が８四へ出ました。',
          9: '△８三歩打で飛車８四へ当てます。３筋で得た歩をここで使えます。銀７二が歩８三を守っています。',
          10: '先手が▲８六飛と引く応手を選びます。',
        },
        notesEn: {
          0: 'Sente selects ▲8五歩.',
          1: '△3六歩 contacts Sente’s pawn on 3g.',
          3: '▲同歩 △同飛 leaves one pawn in each hand.',
          4: '▲3七歩打 attacks rook 3f.',
          5: '△3四飛 retreats to a square guarded by silver 4c, avoiding 4f, which Sente’s pawn on 4g controls.',
          6: '▲8四歩 challenges the pawn on Sente’s own rook file.',
          8: '△同歩 ▲同飛 brings Sente’s rook to 8d.',
          9: '△8三歩打 attacks that rook, reusing a pawn gained earlier. Silver 7b guards the dropped pawn.',
          10: 'Sente selects the retreat ▲8六飛.',
        },
        comment:
          '後手飛車３四は銀４三に守られ、先手飛車は８六です。双方は歩を一枚持ちます。歩打ちで飛車を動かしたあとも、相手の歩や銀の利きを確かめて引き場所を選びます。',
        commentEn:
          'Gote’s rook on 3d is guarded by silver 4c; Sente’s rook is on 8f. Each side holds one pawn. After a drop attacks a rook, choose the retreat square from the actual pawn and silver controls.',
      },
    ],
  },
}
