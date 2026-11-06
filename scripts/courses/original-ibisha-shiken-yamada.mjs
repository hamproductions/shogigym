export default {
  id: 'ibisha-vs-shikenbisha--yamada',
  title: '山田の構想：３二銀を見て歩から接触する',
  titleEn: 'The Yamada Plan: Pawn Contact against a Silver on 3b',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '四間飛車の３二銀型に対して３五歩を先に入れ、左銀を活用する山田定跡の標準的な構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手銀が３二に残る配置へ３五歩から接触する。左銀は５七・４六・３五へ進む。後手が３六歩と進めた場合はその歩が残り、角交換では３二の銀が３三へ取り返せる。',
  goalLabel: '３二銀と交換後の残り駒を確認する',
  goalSfen: 'ln1g3nl/1ks1gr3/ppp3spp/3pp4/5pSP1/2P1P1p2/PP1P1P2P/2KGGS1R1/LN5NL b Bbp 1',
  rootComment:
    '後手銀が４三へ出ず３二にいる形を見て、先に３五歩と接触する山田の構想です。この教材では後手が歩を取り、さらに３六へ進める応手を比較します。銀が前へ出たとき、取れた駒と残った相手歩を区別してください。',
  rootCommentEn:
    'The Yamada plan begins with ▲3五歩 against Gote’s silver on 3b rather than 4c. This course follows the reply that captures the pawn and advances it again to 3f. When the left silver develops, distinguish captured pieces from the enemy pawn that remains.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 6i6h 6c6d 3g3f 5c5d 3f3e 3d3e 5g4f 3e3f 4f3e 4d4e 8h3c+ 3b3c',
    notes: {
      9: '△３二銀。この銀を４三へ動かしていない点を確認します。',
      24: '▲３五歩。先に歩を接触させてから左銀を出します。',
      26: '△同歩に▲４六銀。左銀が３五の後手歩へ利きます。',
      27: '△３六歩で後手歩は銀の前から進みました。銀４六は横の３六へ動けないので、その歩を今すぐ取れません。',
      28: '▲３五銀。歩は取らず、空いた３五へ銀を進めます。',
      29: '△４五歩で角道が開きました。３六の後手歩はそのまま残ります。',
      31: '角交換を△３三銀で取り返します。３二銀を残したことで、この取り返しが可能です。',
    },
    notesEn: {
      9: '△3二銀 leaves this silver on 3b rather than developing it to 4c.',
      24: '▲3五歩 creates pawn contact before the left silver develops.',
      26: 'After △同歩, ▲4六銀 controls the pawn on 3e.',
      27: '△3六歩 advances the pawn away. A silver on 4f cannot move sideways to 3f, so it cannot immediately capture that pawn.',
      28: '▲3五銀 develops onto the cleared square without capturing a pawn.',
      29: '△4五歩 opens the bishop diagonal. Gote’s pawn remains on 3f.',
      31: '△3三銀 recaptures after the bishop exchange, using the silver that stayed on 3b.',
    },
    comment:
      '先手銀３五、後手銀３三、後手歩３六が残り、双方が角を持っています。歩３六は３七へ進んで成る候補もあるため、２筋への攻めだけを追わず、相手の歩の位置も確かめます。',
    commentEn:
      'Sente’s silver stands on 3e, Gote’s silver on 3c and Gote’s pawn on 3f; both sides hold a bishop. The pawn may advance to 3g and promote, so examine its location alongside possible attacks on the second file.',
    branches: [
      {
        kind: 'alt',
        moves: '2e2d 2c2d 3e2d 3c2d 2h2d 4b4c 2d2h',
        notes: {
          0: '▲２四歩で別の筋にも接触します。以下は歩と銀で取り合う応手を選んだ例です。',
          2: '▲同銀。後手銀３三も２四へ利くため、ここで取り合いは終わりません。',
          4: '△同銀に▲同飛。双方の銀が一枚ずつ持ち駒になりました。',
          5: '△４三飛へ移り、歩４五を後ろから支えます。２四の先手飛車と同じ段の４四へは出ていません。',
          6: 'この例では▲２八飛と引きます。銀交換後も、後手の飛車と角の持ち駒を読む必要があります。',
        },
        notesEn: {
          0: '▲2四歩 creates contact on another file. This example selects the following pawn and silver captures.',
          2: '▲同銀 does not end the exchange: Gote’s silver on 3c also controls 2d.',
          4: 'After △同銀, ▲同飛 leaves both sides holding a silver.',
          5: '△4三飛 supports pawn 4e from behind, avoiding 4d on the same rank as Sente’s rook on 2d.',
          6: 'This example retreats with ▲2八飛. Gote’s rook and bishop in hand remain relevant after the silver exchange.',
        },
        comment:
          '双方が角と銀を一枚ずつ持ち、先手は歩一枚、後手は歩二枚です。飛車は２八と４三、後手歩は３六に残っています。銀を交換しただけで２筋の勝敗は決まりません。盤上と持ち駒を合わせて次を読みます。',
        commentEn:
          'Both sides hold a bishop and silver. Sente has one pawn in hand and Gote two. The rooks stand on 2h and 4c, and Gote’s pawn remains on 3f. The silver exchange alone does not decide the second-file attack; read the board and hands together.',
        branches: [
          {
            kind: 'alt',
            moves: '4c5c 2h2b+',
            notes: {
              0: '後手が飛車を５三へ寄せる応手を比較します。飛車５三は金５二が守り、竜２二をすぐ取る利きではありません。',
              1: '▲２二飛成。２七から２三までが空いているので成り込めます。',
            },
            notesEn: {
              0: 'Compare Gote transferring the rook to 5c, guarded by gold 5b and without an immediate capture of a dragon on 2b.',
              1: '▲2二飛成 promotes through the empty squares from 2g to 2c.',
            },
            comment:
              '先手は竜２二を作りましたが、後手玉８二の周りには銀７二・金６一と５二が残ります。先手の持ち駒は角・銀・歩、後手は角・銀・歩二枚です。成駒と持ち駒の利益を、相手玉の守りと分けて数えます。',
            commentEn:
              'Sente has a dragon on 2b, while Gote’s king on 8b retains silver 7b and golds 6a and 5b. Sente holds a bishop, silver and pawn; Gote holds a bishop, silver and two pawns. Assess promotion and hands separately from the opponent’s king defenders.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: 'B*6f 5b6c 2e2d 2c2d 3e2d 3c2d 2h2d',
        notes: {
          0: '▲６六角打で角を置き直す比較です。後手銀３三へ斜めに利きます。',
          1: '後手が金を６三へ寄せる待ち手を選びます。この一手を強制していません。',
          2: '▲２四歩と接触します。',
          4: '△同歩に▲同銀。後手銀３三も２四へ利いています。',
          6: '△同銀を▲同飛と取り返します。待ち手を利用した攻めも、銀の最後の取り返しまで数えます。',
        },
        notesEn: {
          0: 'Compare redeploying with ▲6六角打, controlling the diagonal toward silver 3c.',
          1: 'Gote chooses the waiting move △6三金. Sente has not forced this reply.',
          2: '▲2四歩 creates contact.',
          4: 'After △同歩, ▲同銀 enters a square also controlled by Gote’s silver on 3c.',
          6: '△同銀 and ▲同飛 complete the silver exchange. Using a waiting reply still requires counting the final recapture.',
        },
        comment:
          '先手角は６六、飛車は２四で、双方が銀を一枚ずつ持ちます。後手金６三が動いたからといって、角の持ち駒や飛車４二の反撃が消えたわけではありません。応手を見て攻める例として確認します。',
        commentEn:
          'Sente’s bishop stands on 6f and rook on 2d, and both sides hold a silver. Gote’s gold move did not remove its bishop in hand or the rook on 4b. This compares timing against the stated reply without claiming a decisive attack.',
      },
      {
        kind: 'alt',
        moves: '2e2d 3f3g+',
        notes: {
          0: '▲２四歩に後手が歩を取らず、△３七歩成と進める競争を比べます。',
          1: 'このと金は銀４八へ利いています。先手には▲同銀で取る候補もあります。',
        },
        notesEn: {
          0: 'Compare Gote ignoring ▲2四歩 and advancing its own pawn with △3七歩成.',
          1: 'The tokin attacks silver 4h. Sente also has the candidate ▲同銀 to capture it.',
        },
        comment: '先手番です。と金３七は銀４八へ当たり、先手銀４八も３七を取れます。次の失敗例は、この取り返しを選ばず歩成りを急ぐ手から始めます。',
        commentEn:
          'Sente moves next. Tokin 3g attacks silver 4h, while that silver can capture on 3g. The mistake branch begins when Sente chooses to rush its own promotion instead of that recapture.',
        branches: [
          {
            kind: 'deviation',
            moves: '2d2c+ 3g4h 2c3c 4h5h 6h5h 2a3c',
            notes: {
              0: 'この失敗例では先手も▲２三歩成と急ぎ、銀４八への当たりを残します。',
              1: '△２八とで飛車を取る手も合法です。この枝では後手がその飛車取りを選ばず、△４八とで銀を先に取る応手を比べます。',
              2: '▲３三とで先手も銀を取ります。',
              3: '△５八とで後手がさらに金を取ります。',
              4: '▲同金で後手と金を取り、△３三桂で先手と金も取られます。',
            },
            notesEn: {
              0: 'In this mistake example Sente races with ▲2三歩成, leaving the silver attacked.',
              1: '△2八と can legally capture the rook. This branch instead selects △4八と, capturing the silver first rather than taking that rook.',
              2: '▲3三と captures Gote’s silver.',
              3: '△5八と additionally captures a gold.',
              4: '▲同金 removes Gote’s tokin on 5h, then △3三桂 removes Sente’s tokin on 3c.',
            },
            comment:
              'と金は両方とも消えましたが、先手は金を一枚失っています。先手は角・銀と歩二枚、後手は角・金・銀と歩二枚を持ちます。自分の歩が成る速さだけを比べず、相手のと金が次に取る駒も数える必要があります。',
            commentEn:
              'Both tokins have been removed, but Sente has lost a gold. Sente holds a bishop, silver and two pawns; Gote holds a bishop, gold, silver and two pawns. Compare what the opposing tokin captures next, not only how quickly your own pawn promotes.',
          },
        ],
      },
    ],
  },
}
