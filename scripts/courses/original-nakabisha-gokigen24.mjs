export default {
  id: 'nakabisha-vs-ibisha--gokigen24',
  title: 'ゴキゲン中飛車：早い２四歩と角３三の両狙い',
  titleEn: 'Gokigen Central Rook: Early ▲2四歩 and the Bishop Drop on 3c',
  myStrategy: 'nakabisha',
  opponentStrategy: 'ibisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    'ゴキゲン中飛車への早い２四歩に対する角交換・３三角打・２六歩打の標準的な構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手は５二飛・５四歩の中飛車。早い２四歩で歩を交換されたあと角を交換し、３三角を打って飛車２四と銀８八へ利かせる。飛車の後退には２六歩打という接触を比較する。',
  goalLabel: '角の二つの斜めと打ち歩を読む',
  goalSfen: 'lnsgkgsnl/4r4/pppp1pb1p/4p1p2/9/2P4p1/PP1PPPP1P/1S5R1/LN1GKGSNL b BP 1',
  rootComment:
    '先手が囲う前に２四歩と動く変化を、後手の中飛車から読みます。角道を開けたままなので、角交換後に角を３三へ打つ選択があります。飛車に当たる短い斜めと、銀８八へ伸びる長い斜めを分けて確認してください。',
  rootCommentEn:
    'Read an early ▲2四歩 from Gote’s Central Rook perspective. The open bishop diagonal permits a bishop exchange followed by a drop on 3c. Inspect the short diagonal toward the rook and the longer diagonal toward the silver on 8h separately.',
  line: {
    moves: '2g2f 3c3d 7g7f 5c5d 2f2e 8b5b 2e2d 2c2d 2h2d 2b8h+ 7i8h B*3c 2d2h P*2f',
    notes: {
      5: '△５二飛。後手の４三歩は動かしていないので角道が開いています。',
      6: '▲２四歩の早い接触です。この例では歩で取る応手を選びます。',
      9: '△８八角成で角を交換し始めます。▲同銀まで進めて双方の持ち駒を数えます。',
      11: '△３三角打。２四の飛車と８八の銀の両方へ斜めに利きます。',
      12: '先手が飛車を２八へ引く応手です。',
      13: '△２六歩打は次の２七への成りを候補にします。今の２六は、まだ後手の成れる範囲の外です。',
    },
    notesEn: {
      5: '△5二飛 leaves the pawn on 4c unmoved, so Gote’s bishop diagonal remains open.',
      6: '▲2四歩 creates early contact. This example selects the pawn capture.',
      9: '△8八角成 begins the bishop exchange. Continue through ▲同銀 before counting both hands.',
      11: '△3三角打 controls diagonals toward both the rook on 2d and silver on 8h.',
      12: 'This reply retreats Sente’s rook to 2h.',
      13: '△2六歩打 creates a candidate advance and promotion on 2g. The drop square on 2f is still outside Gote’s promotion zone.',
    },
    comment:
      '後手角３三は銀８八を狙い、２六歩は飛車２八の前にいます。先手は角と歩を持ち、後手の手持ちはありません。歩を飛車で取れるかは、その一手のあと銀がどうなるかまで読んで判断します。',
    commentEn:
      'Gote’s bishop on 3c attacks the silver on 8h, while the pawn on 2f stands in front of the rook on 2h. Sente holds a bishop and pawn; Gote holds nothing. Assess a rook capture of the pawn together with what happens to the silver afterward.',
    branches: [
      {
        kind: 'deviation',
        moves: '3i3h 3c8h+ 2h1h 5b2b 4i4h 2f2g+ 3h4i',
        notes: {
          0: '▲３八銀は飛車２八と銀８八の間を自分の銀で止め、銀８八への守りを外す誤りとして選びます。',
          1: '△８八角成で銀を取り、銀の持ち駒を得ます。',
          2: '先手が▲１八飛を選びます。３八の銀がまだ飛車と馬８八の間を止めています。',
          3: '△２二飛で、歩２六の後ろへ飛車を回します。',
          4: '▲４八金で金を前へ出す応手を選びます。銀３八が後で動いても、この金が飛車の横の道を止めます。',
          5: '△２七歩成で打った歩がと金になりました。',
          6: '▲４九銀でと金の当たりから逃げます。４九は金４八に守られています。',
        },
        notesEn: {
          0: '▲3八銀 is shown as an error: the silver blocks rook 2h’s support along the rank toward silver 8h.',
          1: '△8八角成 captures the silver and adds it to hand.',
          2: 'Sente selects ▲1八飛; silver 3h still blocks the rook’s line toward horse 8h.',
          3: '△2二飛 transfers behind the pawn on 2f.',
          4: 'Sente selects ▲4八金. This gold will continue to block the rook rank after silver 3h moves away.',
          5: '△2七歩成 promotes the dropped pawn.',
          6: '▲4九銀 escapes the tokin’s attack to a square guarded by gold 4h.',
        },
        comment:
          'と金２七は飛車１八を取れます。▲同香の取り返しは歩を得るだけなので、後手は飛車を得ます。次の枝では、この捕獲と３七歩を取る弱い比較を分けます。',
        commentEn:
          'Tokin 2g can capture rook 1h. Sente’s lance recapture gains only a pawn, leaving Gote with the rook. Compare that capture with the weaker pawn capture on 3g.',
        branches: [
          {
            kind: 'alt',
            moves: '2g1h 1i1h',
            comment: '△１八とで飛車を取り、▲同香でと金を取り返す例です。後手は飛車を得て、先手に戻るのは歩です。',
            commentEn: '△1八と captures the rook; ▲同香 recaptures the tokin. Gote gains a rook, while Sente gains a pawn.',
          },
          {
            kind: 'deviation',
            moves: '2g3g 5i6h 2b2i+ B*6e S*6d',
            comment:
              '△３七とは飛車１八を取る機会を見送る弱い比較です。この先では竜の利きと銀打ちを観察します。飛車の捕獲を最善でない歩取りに置き換えた手順です。',
            commentEn:
              '△3七と is a weaker comparison that passes up the rook on 1h. Continue to observe the dragon’s lines and a silver drop, while keeping that missed rook capture explicit.',
            branches: [
              {
                kind: 'alt',
                moves: '6e5f 2i2g 1g1f 5a6b 4h3g 2g3g',
                notes: {
                  0: '▲５六角で銀６四の当たりから逃げます。金４八はと金３七へ利いています。',
                  1: '△２七竜は竜を交換せず、と金３七を横から守る手として選びます。',
                  2: '先手が▲１六歩と静かな応手を選ぶ比較です。',
                  3: '△６二玉で、金６一の隣へ玉を移す静かな整備も比較します。王手ではない局面では守りを整える手も候補です。',
                  4: '▲３七金でと金を取る手を選びます。３七は竜２七が守っています。',
                  5: '△同竜で金を取ります。竜の横の利きが、守っていた駒を取られたあとの取り返しにつながりました。',
                },
                notesEn: {
                  0: '▲5六角 escapes the silver on 6d. Gold 4h controls the tokin on 3g.',
                  1: 'This example preserves the dragon with △2七竜, defending tokin 3g along the rank.',
                  2: 'Sente selects the quiet ▲1六歩 for this comparison.',
                  3: '△6二玉 quietly moves the king beside gold 6a. With no check to answer, compare consolidation as well as captures.',
                  4: 'Sente selects ▲3七金, capturing the tokin on a square defended by the dragon.',
                  5: '△同竜 captures the gold. The dragon’s defensive line supplies the recapture after its protected piece is taken.',
                },
                comment:
                  '竜は３七に残り、後手玉は６二です。竜を攻めだけで使うのではなく、と金を守る横の道と、玉を整える手を合わせた比較でした。先手には角５六と飛車１八が残り、ここで終局や強制勝ちを主張しません。',
                commentEn:
                  'The dragon remains on 3g and Gote’s king stands on 6b. This comparison combines a defensive rook line with king consolidation. Sente retains bishop 5f and rook 1h; the endpoint is not a terminal or forced-win claim.',
              },
            ],
          },
        ],
      },
      {
        kind: 'deviation',
        moves: '2h2f 3c8h+',
        notes: {
          0: '▲２六飛は歩を取れますが、銀８八への当たりを残す例です。',
          1: '△８八角成で銀を取り、馬になります。飛車を取った手ではありません。',
        },
        notesEn: {
          0: '▲2六飛 captures the pawn but leaves the attack against silver 8h unresolved.',
          1: '△8八角成 captures the silver and promotes to a horse. The captured piece is a silver, not the rook.',
        },
        comment:
          '先手飛車は２六に残り、後手馬は８八です。先手は角と歩二枚、後手は銀を持っています。歩一枚を取る手と銀を守る手を混同しないための比較です。この先も先手の角打ちなどを読む必要があります。',
        commentEn:
          'Sente’s rook remains on 2f and Gote’s horse stands on 8h. Sente holds a bishop and two pawns; Gote holds a silver. Capturing one pawn did not protect the silver. Sente’s bishop drops and other replies still require calculation.',
      },
    ],
  },
}
