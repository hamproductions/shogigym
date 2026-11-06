export default {
  id: 'kakugawari--gote',
  title: '後手の角換わり：角の持ち駒と中央の守り',
  titleEn: 'Gote Bishop Exchange: Bishops in Hand and Central Defenders',
  myStrategy: 'kakugawari',
  opponentStrategy: 'kakugawari',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '通常の角換わりで後手が銀４四・６三、桂７三、玉４二を配置する標準的な構想から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation:
    '後手玉４二、金３二・５二、銀４四・６三、桂７三。先手は腰掛け銀５六と桂３七を用意する。双方に角の持ち駒があるため、中央の利きと角打ちの升を確かめる。',
  goalLabel: '後手の二枚の銀と桂を確認する',
  goalSfen: 'l6nl/1r2gkg2/p1ns1p1pp/2pppsp2/1p5P1/2PPSPP2/PPS1P1N1P/2GKG2R1/LN6L b Bb 1',
  rootComment:
    '後手から角を交換する、通常の角換わりの駒組みです。角が盤上から消えても、持ち駒として打ち直せます。銀や金を進めるたびに、守る升だけでなく空けた升も見てください。',
  rootCommentEn:
    'Follow Gote’s development in a normal Bishop Exchange opening. The exchanged bishops can return as drops. Whenever a silver or gold develops, inspect the squares it vacates as well as those it controls.',
  line: {
    moves:
      '2g2f 8c8d 7g7f 4a3b 2f2e 8d8e 8h7g 3c3d 7i8h 2b7g+ 8h7g 3a2b 6i7h 2b3c 3i4h 7a6b 4g4f 6c6d 4h4g 6b6c 3g3f 5c5d 5i6h 5a4b 6g6f 3c4d 4g5f 7c7d 4i5h 8a7c 2i3g 6a5b',
    notes: {
      3: '△３二金で２三を守ります。後手玉はまだ５一です。',
      9: '△７七角成で先手角を取ります。▲同銀まで進めて双方の角交換を数えます。',
      13: '△３三銀で２四を守ります。角３三の代わりに銀を使う配置です。',
      19: '△６三銀。７一から６二を通って来た銀です。３三の銀とは別に中央へ使います。',
      23: '△４二玉。この教材の玉の位置であり、角換わりなら必ずここに置くという規則ではありません。',
      25: '△４四銀で３五と５五へ利かせます。６三銀は５四を守っています。',
      29: '△７三桂は６五と８五へ跳べます。８五には今は自分の歩がいます。',
      31: '△５二金。先手は銀５六と桂３七を出しており、次の接触も読む段階です。',
    },
    notesEn: {
      3: '△3二金 protects 2c while Gote’s king remains on 5a.',
      9: '△7七角成 captures Sente’s bishop. Continue through ▲同銀 before counting both exchanged bishops.',
      13: '△3三銀 guards 2d, using a silver instead of a bishop there.',
      19: '△6三銀 develops the silver from 7a through 6b, separately from the silver on 3c.',
      23: '△4二玉 chooses the king position for this course. Bishop Exchange does not require the king to remain here in every line.',
      25: '△4四銀 controls 3e and 5e. The silver on 6c guards 5d.',
      29: '△7三桂 can jump to 6e or 8e, though Gote’s own pawn currently occupies 8e.',
      31: '△5二金 develops the gold. Sente has a silver on 5f and knight on 3g, so examine possible contact next.',
    },
    comment:
      '後手銀４四・６三、桂７三、金３二・５二と玉４二を確認します。角は双方の持ち駒です。先手銀５六の位置だけで腰掛け銀への受けが完了したとは考えず、６五などの接触先を読みます。',
    commentEn:
      'Locate Gote’s silvers on 4d and 6c, knight on 7c, golds on 3b and 5b and king on 4b. Both sides hold a bishop. Sente’s reclining silver on 5f does not make development a finished defense; examine contact squares such as 6e.',
    branches: [
      {
        kind: 'alt',
        moves: '4f4e',
        comment: '先手が桂３七の守る４五へ歩を進めました。銀で取る前に、その桂の取り返しを確認します。',
        commentEn: 'Sente advances the pawn to 4e, guarded by knight 3g. Before capturing with the silver, inspect the knight’s recapture.',
        branches: [
          {
            kind: 'deviation',
            moves: '4d4e 3g4e',
            comment:
              '△同銀は▲同桂で銀を失います。先手は角と銀、後手は角と歩を持ち、先手桂が４五に残りました。歩を取った一手で計算を終えず、相手の取り返しまで数えます。',
            commentEn:
              '△同銀 loses the silver to ▲同桂. Sente holds a bishop and silver; Gote holds a bishop and pawn, with Sente’s knight on 4e. Count the opponent’s recapture rather than stopping at the initial pawn capture.',
          },
        ],
      },
    ],
  },
}
