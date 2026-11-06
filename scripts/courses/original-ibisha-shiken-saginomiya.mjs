export default {
  id: 'ibisha-vs-shikenbisha--saginomiya',
  title: '鷺宮の構想：３八飛と左銀の連携',
  titleEn: 'The Saginomiya Plan: Rook on 3h and the Left Silver',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source: '鷺宮定跡の３八飛・３五歩と左銀の進出という標準的な構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手飛車３八と左銀３五で３筋に向かう。３五歩の交換後の角交換に加え、３四歩と３三角の支え、取った桂を４四へ打つ飛車・金の両取りを、独立した比較枝で読む。',
  goalLabel: '飛車の筋と左銀の移動を合わせる',
  goalSfen: 'ln1g4l/1ks1gr3/ppp2snpp/3pp4/5pSP1/2P1P4/PP1P1P2P/2KGGSR2/LN5NL w BPbp 1',
  rootComment:
    '飛車を３八へ寄せ、３五歩の接触に左銀を合わせる鷺宮の構想です。右銀４八を突進させる棒銀とは、使う銀が違います。相手の４筋の歩が動くと角道も変わるので、銀の進路と角交換を一緒に読んでください。',
  rootCommentEn:
    'The Saginomiya plan pairs a rook transfer to 3h with ▲3五歩 and development of the left silver. This uses a different silver from Climbing Silver’s right silver on 4h. Read the silver’s route together with the bishop diagonal when Gote moves the fourth-file pawn.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b4b 5g5f 3a3b 5i6h 5a6b 6h7h 6b7b 4i5h 7b8b 7i6h 7a7b 6h5g 4a5b 6i6h 6c6d 3g3f 5c5d 2h3h 3b4c 3f3e 3d3e 5g4f 4d4e 8h3c+ 2a3c 4f3e',
    notes: {
      18: '▲５七銀。７九から６八を経由した左銀です。',
      24: '▲３八飛で３筋へ移ります。３六の自分の歩がまだ飛車の道を止めています。',
      26: '▲３五歩で３四の後手歩と接触します。',
      28: 'この枝では△同歩に▲４六銀。後手歩３五に銀が利きます。',
      29: '△４五歩は銀４六への当たりです。同時に４四が空き、角８八から３三への道が開きます。',
      30: '▲３三角成で角を交換します。交換後も銀４六への当たりは残っています。',
      32: '▲３五銀で歩を取り、４五歩の正面の４六を空けます。',
    },
    notesEn: {
      18: '▲5七銀 develops the left silver from 7i through 6h.',
      24: '▲3八飛 changes files, though Sente’s pawn on 3f still blocks the rook.',
      26: '▲3五歩 challenges the pawn on 3d.',
      28: 'This line selects △同歩, followed by ▲4六銀 attacking the pawn on 3e.',
      29: '△4五歩 attacks the silver on 4f. It also clears 4d, opening the bishop diagonal from 8h to 3c.',
      30: '▲3三角成 exchanges bishops. The attack against the silver on 4f still remains after the exchange.',
      32: '▲3五銀 captures the pawn and clears 4f in front of Gote’s pawn on 4e.',
    },
    comment:
      '飛車３八・銀３五が同じ筋を使い、双方が角を持ちました。後手桂３三が３四を守る駒ではないこと、後手銀４三は３四に利くことを分けて見ます。角打ちや銀交換が残るので、銀の進出だけで勝ちとはしません。',
    commentEn:
      'The rook on 3h and silver on 3e share a file, and both sides hold a bishop. Gote’s knight on 3c does not guard 3d, while the silver on 4c does. Bishop drops and silver exchanges remain possible; the advance alone is not a winning conclusion.',
    branches: [
      {
        kind: 'alt',
        moves: 'B*4d 3e4d 4c4d',
        notes: {
          0: '後手が△４四角と打ち、銀３五に当てる比較例です。',
          1: 'この枝では▲同銀と角を取ります。銀が進んだ４四には、後手銀４三も利いています。',
          2: '△同銀で後手が取り返します。角を取る一手だけで損得を判定しない例です。',
        },
        notesEn: {
          0: 'For comparison, Gote drops △4四角, attacking the silver on 3e.',
          1: 'This branch selects ▲同銀. The destination on 4d is also controlled by Gote’s silver on 4c.',
          2: '△同銀 recaptures. Count the recapture before judging the initial bishop capture.',
        },
        comment:
          '先手は角二枚と歩、後手は銀と歩を持ち、後手銀が４四に残ります。飛車３八の前は空きましたが、３三の桂が残っています。持ち駒の増減と飛車の道は別々に確認してください。',
        commentEn:
          'Sente holds two bishops and a pawn; Gote holds a silver and pawn, with a silver on 4d. The square in front of Sente’s rook has cleared, but Gote’s knight remains on 3c. Recount both hands separately from the rook’s path.',
      },
      {
        kind: 'alt',
        moves: '3c2e P*3d 4b3b B*3c',
        notes: {
          0: '後手が桂で２五歩を取る比較です。',
          1: '▲３四歩打で３三を守る歩を置きます。自分の３筋の歩は交換済みなので二歩ではありません。',
          2: '後手が飛車を３二へ寄せる応手を選びます。',
          3: '▲３三角打。角３三は歩３四に守られています。',
        },
        notesEn: {
          0: 'Compare Gote capturing the pawn on 2e with the knight.',
          1: '▲3四歩打 guards 3c. Sente’s original third-file pawn was exchanged, so the drop is not nifu.',
          2: 'This example selects Gote’s rook transfer to 3b.',
          3: '▲3三角打 is protected by the pawn on 3d.',
        },
        comment:
          '歩３四と角３三を組み合わせました。△同飛で角を取るなら▲同歩で飛車を取り返せます。角は２二・１一の斜めにも利きますが、相手の角打ちも残る配置例です。',
        commentEn:
          'The pawn on 3d supports the bishop on 3c: △同飛 would allow ▲同歩. The bishop also controls the diagonal through 2b toward 1a. Gote still has bishop drops, so this is a coordination example rather than a forced conclusion.',
        branches: [
          {
            kind: 'alt',
            moves: '1a1b 3c1e+',
            notes: {
              0: '△１二香で角の斜線から香を逃がします。',
              1: 'この枝では▲１五角成。３三から出る手なので、移動先が敵陣の外でも成れます。',
            },
            notesEn: {
              0: '△1二香 moves the lance away from the bishop diagonal.',
              1: 'This branch selects ▲1五角成. Starting inside the promotion zone permits promotion even when the destination lies outside it.',
            },
            comment: '香は１二に残り、馬１五が桂２五へ横に利きます。香を逃がす手と馬を作る手を、一つずつ盤上で確認します。',
            commentEn:
              'The lance remains on 1b, while the horse on 1e attacks knight 2e with its additional sideways step. Locate the escaped lance and the promoted bishop separately.',
          },
          {
            kind: 'alt',
            moves: '7c7d 3c1a+',
            notes: {
              0: '比較のため、香を逃がさず△７四歩を選びます。',
              1: '▲１一角成で香を取り、馬を作ります。',
            },
            notesEn: {
              0: 'For comparison, Gote selects △7四歩 instead of moving the lance.',
              1: '▲1一角成 captures the lance and promotes.',
            },
            comment: '先手の持ち駒に香が入りました。これは後手が斜線への対応を見送った例で、香取りが強制されるという意味ではありません。',
            commentEn: 'Sente gains a lance in hand. This example selects a reply that leaves the diagonal unanswered; the lance capture is not forced.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: '3c2e 3e2f 4b3b P*3e 6d6e 2f2e 4c3d N*4d',
        notes: {
          0: '桂で２五歩を取る応手から、別の銀の使い方を比べます。',
          1: '▲２六銀で桂２五へ当てます。',
          2: '後手が飛車を３二へ寄せる例です。',
          3: '▲３五歩打で３筋の飛車の間に歩を置きます。飛車３八が歩３五を守り、後手飛車から３八をただで取られる道を止めました。',
          4: '後手は桂２五を逃がす代わりに△６五歩を選ぶ比較です。',
          5: '▲２五銀で桂を取り、桂の持ち駒ができました。',
          6: '後手が銀を３四へ出す応手を選びます。この銀は２五の先手銀へ利いています。',
          7: '▲４四桂打。桂は３二の飛車と５二の金の両方へ跳べます。',
        },
        notesEn: {
          0: 'Compare a different silver route after Gote’s knight captures on 2e.',
          1: '▲2六銀 attacks the knight on 2e.',
          2: 'Gote chooses the rook transfer to 3b.',
          3: '▲3五歩打 blocks the file between the rooks. Rook 3h guards the pawn on 3e, preventing a free capture of the rook on 3h.',
          4: 'This comparison selects △6五歩 instead of escaping with the knight on 2e.',
          5: '▲2五銀 captures the knight, adding a knight to hand.',
          6: 'This example develops Gote’s silver to 3d, where it controls Sente’s silver on 2e.',
          7: '▲4四桂打 can jump to both the rook on 3b and gold on 5b.',
        },
        comment:
          '桂の両取りと、銀２五への当たりが同時にあります。後手銀３四が２五へ動くと３筋の飛車の道も変わります。両取りという名前だけで駒得を断定せず、相手の駒取りも合わせて読みます。',
        commentEn:
          'The knight fork coexists with the attack on silver 2e. If Gote’s silver leaves 3d for 2e, the third-file rook line changes too. Read countercaptures alongside the fork rather than claiming material gain from its name alone.',
      },
    ],
  },
}
