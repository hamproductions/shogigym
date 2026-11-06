export default {
  id: 'ibisha-vs-shikenbisha--gote',
  title: '後手居飛車：四間飛車を見て舟囲いへ',
  titleEn: 'Gote Static Rook: A Boat Castle against Fourth File Rook',
  myStrategy: 'ibisha',
  opponentStrategy: 'shikenbisha',
  mySide: 'gote',
  userSide: 'gote',
  source:
    '先手四間飛車に対する後手居飛車の舟囲いと中央銀の標準配置から独立して構成。新ペタショック定跡（MIT）の候補手を照合し、説明はこのアプリ用に新しく執筆。',
  goalFormation: '後手は玉３二、金４二・５二、銀５三・６二、飛車８二。先手の飛車６八と銀６七を見て、舟囲いの駒を置く。先手角７七は後手の飛車先８六を守る。',
  goalLabel: '舟囲いと相手の６筋を確認する',
  goalSfen: 'ln5nl/1r1sggkb1/p3sp1p1/2ppp1p1p/1p7/2PPPP2P/PPBS2PP1/3RG1SK1/LN3G1NL b - 1',
  rootComment:
    '先手が飛車を６八へ動かす四間飛車です。後手は飛車８二を残して玉を３二へ運びます。舟囲いを急戦の出発点として扱い、囲っただけで玉の安全が保証されるとは考えず、先手の歩６六と銀６七にも目を向けてください。',
  rootCommentEn:
    'Sente chooses Fourth File Rook on 6h. Keep Gote’s rook on 8b and bring the king to 3b. Use the Boat Castle as a starting formation for further play. The castle’s name does not guarantee safety; also inspect Sente’s pawn on 6f and silver on 6g.',
  line: {
    moves: '7g7f 8c8d 6g6f 8d8e 8h7g 3c3d 2h6h 7a6b 5i4h 5c5d 4h3h 5a4b 3h2h 4b3b 3i3h 6a5b 7i7h 3a4b 5g5f 7c7d 6i5h 4b5c 1g1f 1c1d 7h6g 4a4b 4g4f 6c6d',
    notes: {
      6: '▲６八飛。先手の攻めに使う筋を確認しました。',
      13: '△３二玉。飛車８二と玉の間を離します。',
      15: '△５二金。６一の金を玉側へ寄せます。',
      21: '△５三銀。３一から４二を経由した銀です。銀６二とは別の銀を中央へ使います。',
      24: '▲６七銀で、先手は飛車６八の前へ銀を出します。６六歩が残る間、飛車は６五まで通りません。',
      25: '△４二金で二枚の金を並べます。５三の銀は金４二・５二の両方に守られています。',
      27: '△６四歩。先手の６五歩との接触候補を作ります。まだ歩交換は起きていません。',
    },
    notesEn: {
      6: '▲6八飛 identifies the file Sente may use for play.',
      13: '△3二玉 separates the king from the rook on 8b.',
      15: '△5二金 brings the gold from 6a toward the king.',
      21: '△5三銀 develops the silver from 3a through 4b. The other silver remains on 6b.',
      24: '▲6七銀 stands in front of Sente’s rook on 6h. While the pawn remains on 6f, the rook has no open path to 6e.',
      25: '△4二金 places the golds together. Both golds on 4b and 5b protect the silver on 5c.',
      27: '△6四歩 prepares possible contact with ▲6五歩. No pawn exchange has occurred yet.',
    },
    comment:
      '飛車８二・歩８五と、玉３二・金４二・５二を確認します。先手角７七は８六へ利いているため、飛車先を伸ばしただけで交換できるわけではありません。仕掛ける前に、相手の守り駒と取り返す手を数えます。',
    commentEn:
      'Locate the rook on 8b and pawn on 8e, alongside the king on 3b and golds on 4b and 5b. Sente’s bishop on 7g controls 8f, so advancing the rook pawn does not by itself secure an exchange. Count defenders and recaptures before initiating contact.',
    branches: [
      {
        kind: 'alt',
        moves: '6f6e 6d6e',
        comment: '先手の歩６五を後手の歩が取りました。次に銀で歩へ当たる手と、その銀を歩で取れるかを比べます。',
        commentEn: 'Gote’s pawn captures on 6e. Compare an attack on that pawn with whether the pawn can capture the attacking silver.',
        branches: [
          {
            kind: 'deviation',
            moves: '6g6f',
            comment: '▲６六銀は歩６五に当たりますが、△６六歩で銀を取られます。飛車６八の支えは、銀を失わないことを意味しません。',
            commentEn: '▲6六銀 attacks the pawn on 6e, but △6六歩 captures the silver. Support from the rook on 6h does not prevent that loss.',
            branches: [
              {
                kind: 'alt',
                moves: '6e6f 6h6f',
                comment:
                  '後手は歩で銀を取り、先手飛車がその歩を取り返しました。後手は銀を得て、先手が得たのは歩です。飛車の縦の支えと、銀を安全に進められるかは別に確認します。',
                commentEn:
                  'Gote’s pawn takes the silver, and Sente’s rook recaptures the pawn. Gote gains a silver while Sente gains a pawn. Check both the rook’s support along the file and whether the silver can advance safely.',
              },
            ],
          },
        ],
      },
    ],
  },
}
