export default {
  id: 'yagura--36gin37kei',
  title: '矢倉の３六銀・３七桂：歩を使う前の準備',
  titleEn: 'Yagura Silver 3f and Knight 3g: Prepare Before Spending Pawns',
  myStrategy: 'yagura',
  opponentStrategy: 'yagura',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '矢倉の３筋交換、３六銀・３七桂という標準的な構想を新ペタショック定跡（MIT）の候補手と照合。２筋の歩の再投入、６筋での角交換と打ち直し、守備の金によると金の除去を独立した比較として新しく構成。',
  goalFormation:
    '矢倉から３筋の歩を角で取り返して持ち歩を得る。角４六が玉の道を空け、相手飛車への斜線は相手の桂７三で遮られる。玉８八・銀３六・桂３七を整え、２筋の継ぎ歩、角交換後の活用、反撃のと金への対応を比べる。',
  goalLabel: '歩の補充・駒の配置・反撃への対応',
  goalSfen: 'l6nl/1r3bgk1/2ns1gspp/pppppp3/9/P1PPPBSP1/1PSG1PN1P/1KG4R1/LN6L w Pp 1',
  rootComment:
    '矢倉から銀と桂を右側へ進めます。攻めの前に持ち歩を得る段階と、２筋でその歩を使う段階を分けます。相手にも手番があるため、角の当たりや７筋の接触をその都度確認します。',
  rootCommentEn:
    'Develop the silver and knight on Yagura’s right side. Separate obtaining a pawn in hand from spending it on the second file. Recheck bishop attacks and seventh-file contact whenever the opponent gets a turn.',
  line: {
    moves:
      '7g7f 8c8d 6g6f 3c3d 7i6h 7a6b 5g5f 5c5d 6i7h 3a4b 3i4h 4a3b 4i5h 5a4a 5h6g 7c7d 6h7g 6a5b 8h7i 4b3c 5i6i 2b3a 3g3f 4c4d 4h3g 5b4c 3f3e 3d3e 7i3e 9c9d 3e4f 8a7c 6i7i 3a4b 7i8h 4a3a 2g2f 3a2b 3g3f 6c6d 2i3g 6b6c 9g9f',
    notes: {
      23: '24手の骨組みで、玉は６九・角は７九です。',
      28: '▲同角で３筋の歩を取り返し、双方が歩を一枚持ちます。',
      30: '▲４六角。７九を空け、５五・６四・７三を通して飛車８二へ当たります。',
      31: '△７三桂がその角道を遮りました。ここからは角４六が直接飛車を狙うとは数えません。',
      34: '▲８八玉で金銀の後ろへ入ります。',
      38: '▲３六銀。次に桂が入る３七を空けます。',
      40: '▲３七桂。銀３六と桂３七は別々の升です。',
    },
    notesEn: {
      23: 'At the 24-ply framework, the king is on 6i and bishop on 7i.',
      28: '▲同角 recaptures the third-file pawn. Each side holds one pawn.',
      30: '▲4六角 clears 7i and attacks rook 8b through 5e, 6d and 7c.',
      31: '△7三桂 blocks that diagonal. Bishop 4f no longer directly attacks the rook.',
      34: '▲8八玉 brings the king behind the generals.',
      38: '▲3六銀 clears 3g for the knight.',
      40: '▲3七桂. The silver and knight occupy different squares, 3f and 3g.',
    },
    comment:
      '玉８八・銀３六・桂３七を確認します。先手は歩一枚、後手も歩一枚を持ちます。後手は３筋へ歩を戻さず端歩と駒組みを選んだ例です。次は歩を使う２筋の比較と、６筋を開く別の比較を分けて読みます。',
    commentEn:
      'Locate king 8h, silver 3f and knight 3g. Each side holds one pawn. Here Gote selected an edge-pawn move and development instead of replacing the third-file pawn. Compare spending the pawn on the second file separately from opening the sixth file.',
    branches: [
      {
        kind: 'alt',
        moves: '8d8e 2f2e 7d7e 2e2d',
        comment:
          '後手が８筋・７筋の歩を進める間に、先手が２四へ接触する比較です。７五の歩も７六を狙っているため、相手の攻めが止まったわけではありません。次に後手が２四を取るかを分けます。',
        commentEn:
          'Compare Sente making contact on 2d while Gote advances on the eighth and seventh files. Pawn 7e also attacks 7f; the opponent’s attack has not stopped. Next distinguish accepting the pawn from declining it.',
        branches: [
          {
            kind: 'alt',
            moves: '2c2d P*2e',
            comment: '△同歩で先手の２筋の歩が消えたので、▲２五歩打は二歩ではありません。３筋で取った持ち歩をここで使います。後手の持ち歩は二枚になりました。',
            commentEn:
              '△同歩 removes Sente’s original second-file pawn, so ▲2五歩打 is not nifu. Spend the pawn obtained on the third file. Gote now holds two pawns.',
            branches: [
              {
                kind: 'alt',
                moves: '2d2e 3g2e 3c2d P*3c P*2c 3c3b+ 2b3b',
                comment:
                  '△同歩▲同桂で桂を２五へ進めます。△２四銀と守備銀が３三を離れる応手には、桂２五に守られた▲３三歩打を比較します。△２三歩打を選ぶ順では▲３二歩成で金を取り、△同玉まで数えます。先手は金一枚を得て、と金は残りません。後手は２三歩打以外の受けも選べます。７五歩による反撃も残っています。',
                commentEn:
                  '△同歩 ▲同桂 develops the knight to 2e. If △2四銀 vacates 3c, compare ▲3三歩打, guarded by knight 2e. In the selected △2三歩打 line, ▲3二歩成 captures the gold and △同玉 recaptures. Sente has gained a gold; no tokin remains. Gote can choose another defense instead of the pawn drop, and the seventh-file counterattack still exists.',
              },
              {
                kind: 'alt',
                moves: '8b8a 2e2d',
                comment:
                  '後手が△８一飛と歩を取らない例です。▲２四歩で相手歩を取り、先手に歩一枚が戻ります。取らない応手でも同じ継ぎ歩の図にはならず、後手銀３三はまだ動いていません。',
                commentEn:
                  'If Gote selects △8一飛 instead of taking the dropped pawn, ▲2四歩 captures the opposing pawn and returns one pawn to Sente’s hand. This differs from the knight-recapture line: silver 3c has not moved.',
              },
            ],
          },
          {
            kind: 'alt',
            moves: '4b5c 2d2c+ 3b2c',
            comment:
              '△５三角と歩を取らない応手には▲２三歩成で歩を取り、と金を作る比較です。△同金でそのと金を取ると、後手金は３二から２三へ動きます。金で取ることは強制ではなく、と金が必ず残るわけでもありません。',
            commentEn:
              'Against the selected △5三角 declining the pawn, ▲2三歩成 captures a pawn and promotes. If △同金 takes the tokin, the gold moves from 3b to 2c. The gold capture is not forced, and retaining the tokin is not guaranteed.',
          },
        ],
      },
      {
        kind: 'alt',
        moves: '1c1d 6f6e 4b5c 6e6d 5c6d 4f6d 6c6d B*4a 1d1e 4a6c+ 6d6e 6c7c 8b9b 6g6h P*6f 7c8d',
        notes: {
          1: '▲６五歩で反対側の歩を進めます。',
          2: '△５三角は６四への取り返しを用意します。',
          3: '▲６四歩で相手歩を取ります。',
          6: '△同角▲同角△同銀まで数え、双方が角を持ちます。',
          7: '▲４一角打。玉が通って空いた升です。',
          8: '△１五歩はこの比較で選んだ応手です。',
          9: '▲６三角成。馬の追加の縦横一升の利きで銀６四と桂７三へ当たります。桂は今は銀６四に守られています。',
          10: '△６五銀を選ぶと、銀が桂７三の守りを外します。△５三金など別の応手もあるため、この銀引きを強制とはしません。',
          11: '▲７三馬で桂を取ります。',
          12: '馬７三が飛車８二へ当たるため、△９二飛と香９一に守られる升へ逃げる応手を選びます。',
          13: '▲６八金と引き、６七への取り返しを準備します。 この局面では▲６六歩打と銀６五へ当てる別案もあります。この枝は金を引いて６七を守る配置の比較です。',
          14: '△６六歩打は元の６筋の歩が消えているため二歩ではありません。',
          15: '▲８四馬で歩を取り、馬を動かします。後手飛車９二はこの８四の馬を取れません。 ▲３四歩打と銀３三へ当てる別案もあります。後手の△６四角打は桂３七を狙うため、馬を動かしても相手の反撃が消えたとは数えません。',
        },
        notesEn: {
          1: '▲6五歩 advances on the other wing.',
          2: '△5三角 prepares a recapture on 6d.',
          3: '▲6四歩 captures the opposing pawn.',
          6: 'Count △同角 ▲同角 △同銀; each side holds a bishop.',
          7: '▲4一角打 uses the king’s earlier vacated square.',
          8: '△1五歩 is the selected reply in this comparison.',
          9: '▲6三角成 adds one-square orthogonal attacks on silver 6d and knight 7c. The silver currently guards that knight.',
          10: 'The selected △6五銀 removes the knight’s guard. Gote also has alternatives such as △5三金; this silver retreat is not forced.',
          11: '▲7三馬 captures the knight.',
          12: 'Horse 7c attacks rook 8b. This selects △9二飛, escaping to a square guarded by lance 9a.',
          13: '▲6八金 prepares a recapture on 6g. Another option here is ▲6六歩打, attacking silver 6e. This branch instead compares retreating the gold to guard 6g.',
          14: '△6六歩打 is not nifu because the original sixth-file pawn has disappeared.',
          15: '▲8四馬 captures a pawn and moves the horse. Rook 9b cannot capture the horse on 8d. Another option is ▲3四歩打 against silver 3c. Gote can counter with △6四角打 against knight 3g; moving the horse does not eliminate that counterplay.',
        },
        comment:
          '６筋を開く角交換、角の打ち直しと成り、守りを外した銀に対する桂取り、飛車の退避、歩打ちへの備えを順に比べました。馬８四と金６八が残ります。相手が銀を引く応手は一例で、金を使う別の守りも調べる必要があります。',
        commentEn:
          'Compare the sixth-file bishop exchange, redeployment and promotion, the knight capture after its silver guard leaves, the rook’s escape and preparation against a pawn drop. The horse remains on 8d and gold on 6h. The silver retreat is one selected reply; defenses using the gold must also be considered.',
        branches: [
          {
            kind: 'deviation',
            moves: '6f6g+ 6h6g',
            comment:
              '△６七歩成は金６八の利きへ進む弱い応手です。▲同金でと金を取り除きます。先手の持ち駒は桂一枚と歩四枚で、馬８四と金６七が残ります。相手の歩成を必ず許す必要はなく、守る升と取り返しを比較する例です。',
            commentEn:
              '△6七歩成 advances onto gold 6h’s control and is weak. ▲同金 removes the tokin. Sente holds a knight and four pawns, retaining horse 8d and gold 6g. This compares a guarded square and recapture; allowing promotion is not asserted to be necessary.',
          },
        ],
      },
    ],
  },
}
