export default {
  id: 'nakabisha-vs-ibisha--sente',
  title: '先手中飛車：６筋へ銀と飛車を使う',
  titleEn: 'Sente Central Rook: Using a Silver and Rook on the Sixth File',
  myStrategy: 'nakabisha',
  opponentStrategy: 'ibisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '角道を止めた先手中飛車と、居飛車穴熊に対する６筋の歩・銀・飛車の連携から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手飛車５八・玉２八・銀３八の美濃に、左銀６六と歩６五を用意する。後手は玉１一の穴熊。比較枝で銀７五から６四へ進み、飛車を６八へ移して同じ筋を使う。',
  goalLabel: '銀を動かしたあとの飛車の道を読む',
  goalSfen: 'ln4gnk/1r4gsl/p1pp1pbpp/4psp2/1p1P5/P1PSPPP1P/1PB4P1/2G1R1SK1/LN3G1NL b - 1',
  rootComment:
    '先手の中飛車で角道を閉じ、玉を２八へ運びます。後手が穴熊を作る間、左銀は６六へ進めます。中飛車でも飛車を５筋へ固定する必要はなく、接触する筋と、自分の駒が通り道をふさいでいないかを見て移動先を選びます。',
  rootCommentEn:
    'Play Sente’s closed-diagonal Central Rook and bring the king to 2h. Develop the left silver to 6f while Gote builds Anaguma. Central Rook does not require the rook to remain on the fifth file forever: choose a transfer from the contact squares and actual blockers.',
  line: {
    moves:
      '5g5f 8c8d 7g7f 8d8e 8h7g 3c3d 6g6f 7a6b 2h5h 5c5d 7i6h 5a4b 5i4h 4b3b 4h3h 2b3c 3h2h 1a1b 3i3h 3b2b 6h6g 2b1a 6i7h 3a2b 1g1f 4a3a 9g9f 6a5b 4g4f 5b4b 3g3f 4b3b 6f6e 6b5c 6g6f 5c4d',
    notes: {
      8: '▲５八飛。中央へ飛車を置きます。',
      16: '▲２八玉。右銀は次に３八へ寄せます。',
      18: '▲３八銀で玉の隣に銀を置きます。',
      22: '▲７八金は飛車を動かした左側に残る金です。玉２八の隣の銀とは役割が違います。',
      32: '▲６五歩で６六を空けました。角７七の斜めの道も一時的に開きます。',
      34: '▲６六銀がその升へ進みます。自分の銀が再び角７七の斜め前に立ちます。',
    },
    notesEn: {
      8: '▲5八飛 places the rook centrally.',
      16: '▲2八玉 reaches the king’s square. The right silver follows to 3h.',
      18: '▲3八銀 places a silver beside the king.',
      22: '▲7八金 stays on the wing vacated by the rook, with a different role from the silver beside king 2h.',
      32: '▲6五歩 clears 6f and temporarily opens the bishop diagonal from 7g.',
      34: '▲6六銀 enters that square, blocking the bishop diagonal with Sente’s own piece again.',
    },
    comment:
      '先手は銀６六・歩６五、後手は銀４四・歩５四を置いています。銀６六が７五へ動くと６筋の後ろが空きます。比較枝では歩交換に銀を合わせ、飛車の横移動で支えるところまで見ます。',
    commentEn:
      'Sente has a silver on 6f and pawn on 6e; Gote has a silver on 4d and pawn on 5d. Moving the silver to 7e clears squares behind the sixth-file contact. The comparison coordinates a silver recapture with a rook transfer.',
    branches: [
      {
        kind: 'alt',
        moves: '1f1e 9c9d 5f5e 7c7d 5e5d',
        notes: {
          0: '▲１五歩で右端の歩をもう一つ進めます。穴熊の玉１一へすぐ王手になる手ではなく、１六を空けて端の空間を広げる準備です。',
          1: 'この比較では後手が反対側の△９四歩を選びます。',
          2: '▲５五歩で中央の歩５四へ接触します。６筋の銀を使った枝とは違う攻め口です。',
          3: '後手が中央の接触を見送る△７四歩を選んだ場合です。',
          4: '▲５四歩で歩を取りました。５七・５六・５五が空き、飛車５八がこの歩を支えます。',
        },
        notesEn: {
          0: '▲1五歩 gains more edge space and clears 1f. This prepares space on the wing; it does not immediately check the Anaguma king on 1a.',
          1: 'This comparison selects △9四歩 on the opposite edge.',
          2: '▲5五歩 contacts pawn 5d, using a different entry point from the sixth-file silver branch.',
          3: 'Gote selects △7四歩, leaving the central contact unanswered.',
          4: '▲5四歩 captures the pawn. The cleared squares 5g, 5f and 5e let rook 5h support it.',
        },
        comment:
          '中央へ進んだ歩５四と、右端の歩１五を分けて確認します。先手は歩を一枚持ちます。中央で取らずに別の手を選んだ後手の例なので、５四への進出がどの応手にも成立するとはしません。',
        commentEn:
          'Locate the advanced central pawn on 5d separately from the edge pawn on 1e. Sente holds one pawn. Gote selected a reply elsewhere instead of capturing centrally, so the advance is not presented as available against every response.',
      },
      {
        kind: 'alt',
        moves: '6f7e 7c7d 6e6d 6c6d 7e6d 8b6b 5h6h',
        notes: {
          0: '▲７五銀で６四へ利かせます。ここでは後手が７四歩と応じる例を選びます。',
          2: '▲６四歩で接触し、後手が歩で取る応手を続けます。',
          4: '▲同銀で６四へ進みました。６筋の自分の歩は盤上から消えています。',
          5: '△６二飛で後手も６筋へ寄せる比較です。銀６四へ縦に利きます。',
          6: '▲６八飛で銀６四を支えます。６七・６六・６五が空いていることを確認します。',
        },
        notesEn: {
          0: '▲7五銀 controls 6d. This example selects Gote’s reply △7四歩.',
          2: '▲6四歩 creates contact, followed here by Gote’s pawn capture.',
          4: '▲同銀 reaches 6d. Sente’s original sixth-file pawn has left the board.',
          5: 'The comparison brings Gote’s rook to 6b, controlling the silver on 6d along the file.',
          6: '▲6八飛 supports the silver on 6d. Check that 6g, 6f and 6e are empty.',
        },
        comment:
          '銀６四の後ろに先手飛車６八、前に後手飛車６二があります。飛車に当たった銀を支える配置例です。双方に歩が一枚ずつあり、後手の角や銀も残るので、この形だけで突破が確定したとはしません。',
        commentEn:
          'Sente’s rook on 6h stands behind the silver on 6d, facing Gote’s rook on 6b. This illustrates supporting the attacked silver. Both sides hold one pawn, and Gote’s bishop and silver remain relevant; this arrangement alone does not guarantee a breakthrough.',
      },
    ],
  },
}
