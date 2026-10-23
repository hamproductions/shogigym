# 局面別コーチ発話サンプル

実際のYaneuraOu対局。開始12手は合法な候補から乱択し、各側のSkillLevelを指定した。全4対局が詰みで終了した。

発話はセッション内モデルによる候補を局面と照合したもの。小型モデルや外部APIの測定結果ではない。根拠の棋譜・解析は同じディレクトリの games.json / facts.json に保存。

| 対局     | 先手SkillLevel | 後手SkillLevel | 手数 | 終了 |
| -------- | -------------: | -------------: | ---: | ---- |
| random-1 |              2 |             17 |   68 | 詰み |
| random-2 |              7 |             12 |  114 | 詰み |
| random-3 |             12 |              8 |  157 | 詰み |
| random-4 |             17 |              3 |  105 | 詰み |

## random-1-12

着手：☖６四歩

型：歩の前進と残る角の利き

**短い発話**：後手は６四へ歩を進めましたが、先手の７七の角は３三の歩まで利いています。

**詳しい説明**：後手の６三の歩が６四へ移りました。先手には７七の角で３三の歩を取り、成る手もあります。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（次の手・参考手順を含む）

根拠：usi、sfenBefore、sfenAfter、legalCapturesAfterForSideToMove[usi=7g3c+]

控えた解釈：角の斜線がこの歩突きで初めて開いたという因果、角で歩を取る手が安全・最善という断定

着手前SFEN：

```text
ln2k1snl/1r1sg1gb1/p1pppppp1/1p6p/9/2P3PP1/PPBPPP2P/1S3S1R1/LN1GKG1NL w - 1
```

実着手USI：`6c6d`

## random-1-28

着手：☖４四歩

型：歩突きと角の取り方

**短い発話**：後手が４四へ進めた歩は、先手の５五の角で取れます。

**詳しい説明**：先手には５五の角で４四の歩を取る手と、６四の歩を取る手があります。どちらも持駒の歩を得る着手ですが、その後の応手も比べたいところです。

表示条件：短文: 検討用（次の手の情報を含む） / 詳細: 検討用（次の手・参考手順を含む）

根拠：usi、legalCapturesAfterForSideToMove[usi=5e4d]、legalCapturesAfterForSideToMove[usi=5e6d]

控えた解釈：歩を取る手の優劣、角で歩を取れば最終的に駒得という断定、短時間解析による評価差を歩突きだけの原因とする断定

着手前SFEN：

```text
ln2k1snl/1r5b1/p1pgpp1g1/1p1p2ppp/3sB4/2P2SP2/PP1PPP2P/1S1K3R1/LN1G1G1NL w p 1
```

実着手USI：`4c4d`

## random-1-32

着手：☖７六銀

型：銀による歩の獲得

**短い発話**：後手は銀で７六の歩を取り、持ち歩が二枚になりました。

**詳しい説明**：後手の銀は６五から７六へ進みました。取った歩は持駒に加わり、後手の持ち歩は一枚から二枚へ増えています。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、captured、before.sides.white.hands.pawn、after.sides.white.hands.pawn

控えた解釈：銀の進出が安全という断定、一歩の獲得だけによる形勢判断

着手前SFEN：

```text
ln2k1snl/1r5b1/p1p1p2g1/1p1pgpppp/3sB4/2P1PSP2/PP1P1P2P/1S1KR4/LN1G1G1NL w p 1
```

実着手USI：`6e7f`

## random-1-40

着手：☖３四歩

型：歩打ちによる銀への利き

**短い発話**：後手が３四に打った歩は、先手の３五の銀に当たっています。

**詳しい説明**：後手の持ち歩は三枚から二枚になりました。先手の３五の銀で３四の歩を取る手もあるので、銀の移動先には取る手も含めて考えられます。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（次の手・参考手順を含む）

根拠：usi、drop、before.sides.white.hands.pawn、after.sides.white.hands.pawn、geometricallyAttackedUndefendedAfter[square=3e]、legalCapturesAfterForSideToMove[usi=3e3d]

控えた解釈：銀が逃げるしかないという断定、歩で銀を必ず取れるという断定、銀で歩を取る手が安全という断定

着手前SFEN：

```text
ln2k1snl/1r5b1/p1p1p2g1/1p1p3pp/4PpS2/2s6/PP1P1P2P/1S1KRG3/LN1G3NL w GPb3p 1
```

実着手USI：`P*3d`

## random-1-48

着手：☖８八角成

型：銀取りと角の成り

**短い発話**：後手は８八の銀を取りながら角を成り、持駒に銀も加えました。

**詳しい説明**：２二の角が８八の馬になり、８九の桂や９九の香にも利いています。後手の持駒には角一枚に加えて銀一枚があり、盤上の馬と持駒の角は別の駒です。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、captured、promotion、movedSliderControl.afterSquares、after.sides.white.hands.silver、after.sides.white.hands.bishop

控えた解釈：桂や香を安全に取れるという断定、駒取りを伴う強制手順、この手が唯一の好手という断定

着手前SFEN：

```text
ln2k2nl/1r4sb1/p1p1p2g1/1psGP1ppp/5pS2/9/PP1P1P2P/1S1KRG3/LN1G3NL w Pb3p 1
```

実着手USI：`2b8h+`

## random-1-68

着手：☖６六馬

型：歩を取って詰み

**短い発話**：後手の６六馬で先手の５七玉に王手がかかり、詰みになりました。

**詳しい説明**：７五の馬が６六の歩を取り、後手の持ち歩は四枚になりました。着手後は先手玉が王手を受けていて、合法な応手はありません。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、captured、sfenAfter、givesCheck、after.sides.white.hands.pawn、terminal.checked、terminal.legalReplyCount

控えた解釈：一つのエンジンPVだけを詰みの根拠とする説明、終局までの全手順が強制だったという断定

着手前SFEN：

```text
ln5nl/1rP1k1s2/pPp4g1/1ps3ppp/2+b1gpS2/1b1P5/P3KP2P/4R1G2/LN1G3NL w 2Ps3p 1
```

実着手USI：`7e6f`

## random-2-12

着手：☖２二銀

型：銀の移動と角の持駒

**短い発話**：後手は銀を２二へ上がり、角は双方とも持駒に残しています。

**詳しい説明**：後手の銀は３一から２二へ移りました。先手には７七の桂で８五の歩を取る手も残っています。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（次の手・参考手順を含む）

根拠：usi、after.sides.black.hands.bishop、after.sides.white.hands.bishop、legalCapturesAfterForSideToMove[usi=7g8e]

控えた解釈：囲いの名称、銀移動が８五の歩取りを新たに生んだという因果、桂で歩を取る手が安全という断定

着手前SFEN：

```text
lnsgkgsnl/1r7/p1pppp1p1/6p1p/1p7/2P4P1/PPNPPPP1P/2G2S1R1/L1S1KG1NL w Bb 1
```

実着手USI：`3a2b`

## random-2-30

着手：☖３五歩

型：歩の獲得と持駒

**短い発話**：後手は３五の歩を取り、持駒に歩を一枚得ました。

**詳しい説明**：後手の歩は３四から３五へ進み、先手の盤上の歩は九枚から八枚になりました。後手には角の持駒も一枚残っています。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、captured、before.sides.black.board.pawn、after.sides.black.board.pawn、after.sides.white.hands.pawn、after.sides.white.hands.bishop

控えた解釈：歩を取ったことだけによる勝敗・優勢の断定、取った歩を使う具体的な手の創作

着手前SFEN：

```text
ln3g1nl/1r1sg1k2/p3ppsp1/2pp2p2/1p4PPp/2PP1P3/PPN1PS2P/1SGKG2R1/L6NL w Bb 1
```

実着手USI：`3d3e`

## random-2-40

着手：☖７四歩

型：歩打ちと金の選択肢

**短い発話**：後手の７四歩打は、先手の７五の金に歩を当てる手です。

**詳しい説明**：先手の金には７四の歩を取る手に加え、６四や８五の歩を取る手もあります。金の移動先ごとに、その後に取られないかを比べたい局面です。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（次の手・参考手順を含む）

根拠：usi、drop、geometricallyAttackedUndefendedAfter[square=7e]、legalCapturesAfterForSideToMove[usi=7e7d]、legalCapturesAfterForSideToMove[usi=7e6d]、legalCapturesAfterForSideToMove[usi=7e8e]

控えた解釈：金が必ず取られるという断定、三つの駒取りがすべて安全という断定、金を引くしかないという断定

着手前SFEN：

```text
ln5nl/1r2ggk2/p2sppsp1/3p5/1pG3pPp/3P1P1R1/PPN1PSN1P/1S1KG4/L7L w BPb2p 1
```

実着手USI：`P*7d`

## random-2-46

着手：☖３四歩

型：歩の合駒で王手を受ける

**短い発話**：後手は３四へ歩を合駒し、３六の飛車からの王手を遮りました。

**詳しい説明**：後手の３二玉と先手の３六の飛車の間に、３四の歩が入りました。先手にはその歩を３四飛と取る手も残っています。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（次の手・参考手順を含む）

根拠：usi、drop、sfenBefore、sfenAfter、before.checked、legalCapturesAfterForSideToMove[usi=3f3d]

控えた解釈：王手を受けたことで将来の詰みもなくなったという断定、合駒の歩を取る手が最善・安全という断定

着手前SFEN：

```text
ln5nl/1r2ggk2/p2spp1p1/2pp3s1/1p6p/2GP1PR2/PPN1PSN1P/1S1KG4/L7L w B2Pb2p 1
```

実着手USI：`P*3d`

## random-2-80

着手：☖４七角成

型：金取りと馬の利き

**短い発話**：後手は４七の金を取って角を成り、馬の斜線が先手の２九の飛車まで通りました。

**詳しい説明**：取った金は後手の持駒に加わっています。例えば先手２四飛で別の角を取れば、後手２四歩でその飛車を取り返す進行があります。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（次の手・参考手順を含む）

根拠：usi、captured、promotion、movedSliderControl.beforeSquares、movedSliderControl.afterSquares、after.sides.white.hands.gold、legalCapturesAfterForSideToMove[usi=2i2d]、review.after.finalBestmoveCandidate.pv[0:2]、review.after.pvLegallyReplayed

控えた解釈：馬による飛車取りが確定という断定、参考手順が強制という断定、角を取れば駒得という断定

着手前SFEN：

```text
1n6l/1r2gg1k1/l2s3pn/2pp1ppb1/4pP3/PG1Pn1P1P/1PKsPG3/4b4/L1S4RL w S2Pn3p 1
```

実着手USI：`5h4g+`

## random-2-114

着手：☖５六龍

型：龍の横利きで詰み

**短い発話**：後手の５六龍で先手の６六玉に王手がかかり、詰みになりました。

**詳しい説明**：５九の龍が５六の歩を取って玉の隣へ入り、後手の持ち歩は四枚になりました。先手には王手を解く合法な応手がありません。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、captured、givesCheck、sfenAfter、after.sides.white.hands.pawn、terminal.checked、terminal.legalReplyCount

控えた解釈：エンジンの投了表示だけによる詰みの判定、過去の手順まで含めた強制性の断定

着手前SFEN：

```text
1n6l/1r2gg3/l2s3kn/2pp1ppp1/3PpP3/PG1KP1P1P/pP7/3+b5/L3+r3L w BG3SNPn3p 1
```

実着手USI：`5i5f`

## random-3-12

着手：☖２二飛

型：馬の取り返しと飛車の守り

**短い発話**：後手は２二の馬を飛車で取り、双方が角を一枚ずつ持つ形になりました。

**詳しい説明**：先手は８七歩で８六の後手歩を取れる一方、２四の後手歩には２二飛の縦の利きが届いています。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=8b2b、captured=horse、after.sides.black.hands.bishop=1、after.sides.white.hands.bishop=1、legalCapturesAfterForSideToMove[usi=8g8f]、movedSliderControl.beforeSquares、movedSliderControl.afterSquares includes2d

控えた解釈：馬を取ったので一方的な角得だという解釈、飛車の利きを安全な駒取りと同一視すること、人間の対局や棋力についての解釈

着手前SFEN：

```text
lnsgkgsnl/1r5+B1/p1pppp2p/6pp1/9/1pP6/PP1PPPP1P/2G4R1/LNS1KGSNL w Bp 1
```

実着手USI：`8b2b`

## random-3-19

着手：☗２七歩

型：飛車の前を埋める歩打ち

**短い発話**：先手は２七に歩を打ち、２八飛の前を歩で埋めました。

**詳しい説明**：飛車から２五の後手歩への道は２七歩で止まります。例えば△７七角成▲同桂なら、先手８九桂が馬を取り返して双方が角を持ちます。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=P*2g、drop=true、sfenBefore、sfenAfter、legalCapturesBeforeForSideToMove[usi=2h2e]、legalCapturesAfterForSideToMove[usi=4d7g+]、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：歩打ちで全ての攻めが止まったという断定、参考PVの強制性、順位１のPVを無条件に最終候補と扱うこと

着手前SFEN：

```text
lnsgkg1nl/6sr1/p1pppp2p/5bp2/7p1/1PP6/P1BPPPP1P/2G1K2R1/LNS2GSNL b Pp 1
```

実着手USI：`P*2g`

## random-3-30

着手：☖７七角成

型：三つの取り返しを比べる

**短い発話**：後手は７七角成と角を取りましたが、先手は銀・金・桂のいずれでも馬を取り返せます。

**詳しい説明**：６八銀・７八金・８九桂が７七への取り手です。例えば▲同銀なら銀が７七へ出て、先手も角を一枚持つ形になります。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=4d7g+、captured=bishop、promotion=true、legalCapturesAfterForSideToMove[usi=6h7g]、legalCapturesAfterForSideToMove[usi=7h7g]、legalCapturesAfterForSideToMove[usi=8i7g]、review.after.finalBestmoveCandidate.pv[0]、after.sides.white.hands.bishop=1

控えた解釈：三種類の取り返しが同じ評価だという断定、銀で取る手が強制という断定

着手前SFEN：

```text
lns1kg1nl/2g3sr1/2p1pp3/p2p1bp2/7pp/PPP2P3/2BPP1PPP/2GSKSGR1/LN5NL w p 1
```

実着手USI：`4d7g+`

## random-3-63

着手：☗７六銀

型：馬を取った銀への歩の取り返し

**短い発話**：先手は７六の馬を銀で取りましたが、後手７五歩がその銀を取れる位置です。

**詳しい説明**：馬を取ったことで、先手の持ち角は二枚になりました。△同歩には▲６五桂と７七の桂を使う続きがあります。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=6e7f、captured=horse、after.sides.black.hands.bishop=2、legalCapturesAfterForSideToMove[usi=7e7f]、sfenAfter、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：銀が取られずに残るという断定、馬と銀の交換だけによる最終的な損得判断、PVを強制手順と扱うこと

着手前SFEN：

```text
1n2k3l/2g2gsr1/+Lp2s1n2/4ppp2/2pS3pp/1P+bp1PP2/2N1PSNPP/2G1K1G2/P6RL b BLP2p 1
```

実着手USI：`6e7f`

## random-3-110

着手：☖５三角

型：馬を取った角の斜線

**短い発話**：後手は５三の馬を角で取り、角の利きが８六の先手歩まで届く位置へ進みました。

**詳しい説明**：角の斜線は５三から６四・７五を通って８六へ続きます。先手には、６八の後手と金を５七銀か６九歩で取る手も残っています。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=4b5c、captured=horse、sfenAfter、movedSliderControl.beforeSquares、movedSliderControl.afterSquares includes8f、legalCapturesAfterForSideToMove[usi=5g6h]、legalCapturesAfterForSideToMove[usi=6i6h]

控えた解釈：８六歩を無償で取れるという断定、角の移動だけを原因とした形勢判断、と金を取る手が唯一の応手という断定

着手前SFEN：

```text
1n1p1kr1l/5b1L1/1g2+B1ns1/4p1p2/1N5pp/1P1G1PP2/4S1NPP/3+p2G2/P2P2KRL w GSL3Ps2p 1
```

実着手USI：`4b5c`

## random-3-157

着手：☗６六金

型：金打ちで確定した詰み

**短い発話**：先手の６六金打ちで、５五の後手玉は詰みです。

**詳しい説明**：王手の駒は６六金で、５五玉へ斜め前に利いています。

表示条件：実着手後の終局説明

根拠：usi=G*6f、drop=true、piece=gold、givesCheck=true、sfenAfter、terminal.checked=true、terminal.legalReplyCount=0、terminal.isGameEndpoint=true

控えた解釈：金打ち以前の手順が全て強制だったという解釈、エンジンの投了出力だけを根拠にした詰み判定、人間の対局の勝敗として扱うこと

着手前SFEN：

```text
1n1p1+R2l/5sS1+L/1g3+Bn1S/4p4/1NG1k1ppp/1P3PP2/4S1NPP/4+p1GK1/P2P3RL b GL3Pb2p 1
```

実着手USI：`G*6f`

## random-4-12

着手：☖２四歩

型：歩の取り返しを角まで数える

**短い発話**：後手は２三の歩で２四の先手歩を取りましたが、先手の２八飛からも２四へ届きます。

**詳しい説明**：２四は１三の後手角も守るマスです。先手が飛車で歩を取る場合は、続く角の取り返しまで数えます。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=2c2d、captured=pawn、legalCapturesAfterForSideToMove[usi=2h2d]、legalCapturesBeforeForSideToMove[usi=1c2d]、sfenBefore、sfenAfter、semantic-verification.json.extraLegalWitness[usi=2h2d,1c2d]

控えた解釈：飛車で取り返す手が最善という断定、歩を取れることを無償の駒得とすること

着手前SFEN：

```text
lnsgk1snl/1r4g2/2ppppppb/pp5Pp/9/2P6/PPBPPPP1P/4G2R1/LNSGK1SNL w - 1
```

実着手USI：`2c2d`

## random-4-23

着手：☗１四歩

型：端の歩取りと銀の守り

**短い発話**：先手は１四の歩を取りましたが、後手は２三銀でその歩を取り返せます。

**詳しい説明**：この着手で先手の持ち歩は一枚になりました。後手には銀で取る手のほか、例えば△３一角と１三角を引く続きもあります。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=1e1d、captured=pawn、after.sides.black.hands.pawn=1、legalCapturesAfterForSideToMove[usi=2c1d]、review.after.finalBestmoveCandidate.pv[0]、sfenAfter

控えた解釈：端の突破が確定したという断定、銀の取り返しを強制と扱うこと、取れる歩を必ず取るべきという判断

着手前SFEN：

```text
lns1k2nl/1r2g1g2/2pp1ppsb/p3p2pp/1p6P/2P1P4/PPBP1PP2/1S2GS1R1/LN1GK2NL b p 1
```

実着手USI：`1e1d`

## random-4-30

着手：☖１七歩

型：打った歩を香で取る道

**短い発話**：後手の１七歩打ちには、先手が１九香でその歩を取れます。

**詳しい説明**：１八が空いているため、１九香から１七まで通っています。例えば▲１七香△８六角▲同角△同飛なら、角交換のあと後手飛車が８六へ出ます。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=P*1g、drop=true、sfenAfter、legalCapturesAfterForSideToMove[usi=1i1g]、review.after.finalBestmoveCandidate.pv[0:4]

控えた解釈：歩を捨てる目的や心理の推定、香が歩を取ったあとも安全だという断定、参考手順が強制という断定

着手前SFEN：

```text
ln2k1bnl/1r1sg1g2/2pp1pps1/p3p2pP/9/1PP1P1P2/P1BP1PN2/1S2GS1R1/LN1GK3L w 2Pp 1
```

実着手USI：`P*1g`

## random-4-43

着手：☗３六飛

型：角の利きから外して角へ当てる

**短い発話**：先手は飛車を３六へ移し、３五の後手角へ縦の利きを向けました。

**詳しい説明**：移動前の２六飛は３五角の斜めの利きに入っていました。例えば後手が△３四銀と上がれば、その銀が３五角を守る形に変わります。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=2f3f、captured=null、geometricallyAttackedUndefendedBefore[square=2f]、geometricallyAttackedUndefendedAfter[square=3e]、movedSliderControl.beforeSquares、movedSliderControl.afterSquares includes3e、sfenAfter、review.after.finalBestmoveCandidate.pv[0]

控えた解釈：角を必ず取れるという断定、銀を上がる手以外に応手がないという断定、幾何学的な利きをそのまま安全な駒得とみなすこと

着手前SFEN：

```text
l3k2n1/1r1sg1g2/n1pp1pps1/p3p3l/6b2/1PP1P2R1/PSBP1PN1p/2K1GS3/LN1G4L b 2P3p 1
```

実着手USI：`2f3f`

## random-4-74

着手：☖７四歩

型：進めた歩と桂への銀の取り手

**短い発話**：後手が７四へ進めた歩は、先手７五銀で取れる位置です。

**詳しい説明**：先手には８六の後手桂を銀で取る手もあります。例えば▲７四銀なら△７一飛と８一の後手飛車を回す続きが示されています。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=7c7d、captured=null、legalCapturesAfterForSideToMove[usi=7e7d]、legalCapturesAfterForSideToMove[usi=7e8f]、review.after.finalBestmoveCandidate.pv[0:2]、sfenAfter

控えた解釈：７四歩を無償で取れるという断定、銀が取れる二つの駒を両方取れるという断定、参考PVの強制性

着手前SFEN：

```text
lr2k3+B/3sg1g2/n1pp3s1/pP2p3l/1pS3p2/PnP1P4/3P1P2p/1K2G4/LN1GS2rL w BNP4p 1
```

実着手USI：`7c7d`

## random-4-105

着手：☗５三桂打

型：桂打ちで確定した詰み

**短い発話**：先手の５三桂打ちで、４一の後手玉は詰みです。

**詳しい説明**：５三の桂が４一玉へ王手をかけており、合法な応手は残っていません。

表示条件：実着手後の終局説明

根拠：usi=N*5c、drop=true、piece=knight、givesCheck=true、sfenAfter、terminal.checked=true、terminal.legalReplyCount=0、terminal.isGameEndpoint=true

控えた解釈：桂打ち以前の局面から手順が一本道だったという解釈、エンジンの投了出力だけによる詰み判定、手数だけを根拠とする終盤認定

着手前SFEN：

```text
lr1g1k3/3B3+B1/n+P1+S2Gs1/p3p3l/5Np2/PpP1P4/3P1P2p/2K1G4/LN2S2rL b GN3Ps4p 1
```

実着手USI：`N*5c`
