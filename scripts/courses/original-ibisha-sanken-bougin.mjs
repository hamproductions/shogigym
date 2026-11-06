export default {
  id: 'ibisha-vs-sankenbisha--bougin',
  title: '三間飛車への棒銀：２六の銀と３筋の飛車',
  titleEn: 'Climbing Silver against Third File Rook: Silver 2f and Rook on the Third File',
  myStrategy: 'ibisha',
  opponentStrategy: 'sankenbisha',
  mySide: 'sente',
  userSide: 'sente',
  source:
    '三間飛車に対する３七銀・２六銀と３筋への飛車移動の標準的な考え方から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '先手右銀が４八・３七・２六へ進み、飛車は３八へ回る。３筋の歩交換で後手銀が３四へ出たあと、４五歩の接触と３筋の飛車の道を調べる。左銀５七は中央に残る。',
  goalLabel: '銀が動くと飛車の道がどう変わるかを読む',
  goalSfen: 'ln5nl/1ksg1br2/pppg3pp/3ppps2/5P1P1/2P1P2S1/PP1PS3P/1BK1G1R2/LN1G3NL w Pp 1',
  rootComment:
    '右銀を３七から２六へ進め、２五の歩と２八の飛車に重ねる棒銀です。相手の三間飛車には３筋の歩も使い、飛車を３八へ回す例を練習します。駒を取れないと言い切る前に、合法な捕獲とその後の損得を区別してください。',
  rootCommentEn:
    'Develop the right silver through 3g to 2f, behind the pawn on 2e and ahead of the rook on 2h. Against Third File Rook, also use the third-file pawn and practice shifting the rook to 3h. Distinguish an illegal capture from a legal capture that opens an unfavorable exchange.',
  line: {
    moves:
      '2g2f 3c3d 7g7f 4c4d 2f2e 2b3c 3i4h 8b3b 5i6h 3a4b 6h7h 5a6b 5g5f 6b7b 3g3f 4a5b 4i5h 7b8b 4h3g 7a7b 3g2f 4b4c 7i6h 6c6d 6h5g 5c5d 4g4f 6a6b 3f3e 3c4b 2h3h 5b6c 3e3d 4c3d 4f4e',
    notes: {
      18: '▲３七銀で右銀を出します。３六歩で空けた３七へ入る手です。',
      20: '▲２六銀。２五歩・２六銀・２八飛が２筋に並びました。',
      24: '左銀は５七へ置きます。前に出る右銀２六とは別の駒です。',
      28: '▲３五歩で３四の歩に接触します。',
      29: '後手が角を４二へ引く例です。３三が空き、飛車３二の前の配置も変わります。',
      30: '▲３八飛で飛車を３筋へ回します。',
      32: '▲３四歩で歩を取る例を進めます。',
      33: '△同銀で後手銀が４三から３四へ来ました。３筋の飛車同士の間に、この銀がいます。',
      34: '▲４五歩で銀３四の斜め前に接触を作ります。後手銀が４五へ取ると、３四が空く点を確認しましょう。',
    },
    notesEn: {
      18: '▲3七銀 develops the right silver onto the square cleared by ▲3六歩.',
      20: '▲2六銀 lines up the pawn on 2e, silver on 2f and rook on 2h.',
      24: 'The left silver stays on 5g, separate from the advanced right silver.',
      28: '▲3五歩 creates contact with the pawn on 3d.',
      29: 'Gote chooses to retreat the bishop to 4b. This clears 3c in front of the rook on 3b.',
      30: '▲3八飛 shifts Sente’s rook to the third file.',
      32: 'This example continues with ▲3四歩 capturing the pawn.',
      33: '△同銀 brings Gote’s silver from 4c to 3d, between the two rooks on the third file.',
      34: '▲4五歩 creates contact diagonally in front of the silver. If the silver captures on 4e, it clears 3d.',
    },
    comment:
      '飛車３八と飛車３二の間に、後手銀３四がいます。４五の歩を銀で取る手は合法ですが、銀が３筋を離れると飛車同士の道が開きます。次の枝で、実際に飛車を取れるか確認します。',
    commentEn:
      'Gote’s silver on 3d stands between the rooks on 3h and 3b. Capturing the pawn on 4e with that silver is legal, but it opens the third file. The branch checks the resulting rook capture on the board.',
    branches: [
      {
        kind: 'deviation',
        moves: '3d4e 3h3b+',
        notes: {
          0: '△４五銀で歩を取る比較例です。銀３四が動き、３三・３四・３五・３六・３七が空いています。',
          1: '▲３二飛成で後手飛車を取ります。これは玉への王手ではなく、大駒の捕獲です。',
        },
        notesEn: {
          0: 'For comparison, △4五銀 captures the pawn and clears 3d. Squares 3c through 3g are now empty.',
          1: '▲3二飛成 captures Gote’s rook. This is a major-piece capture, not check against the king.',
        },
        comment:
          '銀で歩を取ったことで、飛車３二への道が開きました。先手の龍３二と後手角４二は横に並び、角は横へ動けないためその龍をすぐ取れません。相手が別の受けを選べば、この枝と同じ結果になるとは限りません。',
        commentEn:
          'The silver’s pawn capture opened the rook route. Sente’s dragon on 3b stands beside Gote’s bishop on 4b; a bishop cannot move sideways to recapture it. Other defensive choices need their own reading.',
      },
      {
        kind: 'alt',
        moves: '4b3a 2f1e 9c9d 2e2d 2c2d 3h2h 8c8d 2h2d',
        notes: {
          0: '後手角が３一へ引き、２四への斜めの守りを外す応手を比べます。',
          1: '▲１五銀で２六を空け、２四を銀で守ります。',
          2: '後手の端歩は比較用に選んだ待ち手です。',
          3: '▲２四歩に△同歩。角３一は２四へ取り返せません。',
          5: '▲２八飛で２筋へ戻します。２六が空いていることを確認します。',
          6: 'ここでも後手が別の筋を動かす応手を選びます。',
          7: '▲２四飛で歩を取り返します。銀１五が２四の飛車を守っています。',
        },
        notesEn: {
          0: 'Compare Gote retreating the bishop to 3a, removing its diagonal defense of 2d.',
          1: '▲1五銀 clears 2f and guards 2d.',
          2: 'Gote’s edge-pawn move is a selected waiting reply for comparison.',
          3: '▲2四歩 and △同歩 exchange pawns. The bishop on 3a cannot recapture on 2d.',
          5: '▲2八飛 returns to the second file. Check that 2f is empty.',
          6: 'This example again selects a reply on another file.',
          7: '▲2四飛 recaptures the pawn, supported by the silver on 1e.',
        },
        comment:
          '後手が２四を守る角を移し、先手が銀のいた２六を空けた結果、飛車が２四へ出ました。双方に歩二枚があります。後手の選んだ応手を利用する比較なので、三間飛車なら必ず飛車先を交換できるとはしません。',
        commentEn:
          'Gote removed the bishop defender of 2d, while Sente cleared the silver’s former square on 2f, allowing the rook to reach 2d. Both sides hold two pawns. This uses the selected replies rather than claiming the exchange always works against Third File Rook.',
      },
    ],
  },
}
