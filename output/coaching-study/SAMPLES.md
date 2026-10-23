# 局面別コーチ発話サンプル

固定した開始列によるパイロット。追加のランダム開始・SkillLevel対局とは別の資料。

発話はセッション内モデルによる候補を局面と照合したもの。小型モデルや外部APIの測定結果ではない。根拠の棋譜・解析は同じディレクトリの games.json / facts.json に保存。

| 対局                  | 先手SkillLevel | 後手SkillLevel | 手数 | 終了                      |
| --------------------- | -------------: | -------------: | ---: | ------------------------- |
| stable                |         未指定 |         未指定 |  100 | 100手で打切り・勝敗未判定 |
| open-exchange         |         未指定 |         未指定 |  100 | 100手で打切り・勝敗未判定 |
| candidate-exploration |         未指定 |         未指定 |   52 | 詰み                      |
| legal-errors          |         未指定 |         未指定 |   77 | 詰み                      |

## stable-12

着手：☖２二飛

型：飛車の利きと合法な応手

**短い発話**：後手の２二の飛車は２四まで利いていますが、先手には２四の歩を飛車で取る手があります。

**詳しい説明**：後手の飛車は８二から２二へ移り、２筋に利きを通しました。先手の２八の飛車で２四の歩を取る手も合法なので、後手がその歩を確実に守れたとは言えません。

表示条件：短文: 検討用（合法な応手を明示） / 詳細: 検討用（合法な応手・参考手順を含む）

根拠：sfenBefore、sfenAfter、usi、movedSliderControl.beforeSquares、movedSliderControl.afterSquares、legalCapturesAfterForSideToMove[usi=2h2d]

控えた解釈：２四の歩を安全に守れたという断定、先手の飛車取りが駒得になるという断定

着手前SFEN：

```text
lnsgkgsnl/1r7/p1pppp2p/6pp1/1p7/2P6/PP1PPPP1P/1SG4R1/LN2KGSNL w Bbp 1
```

実着手USI：`8b2b`

## stable-19

着手：☗７三桂不成

型：歩の獲得と取り返し

**短い発話**：先手は７三の歩を取りましたが、その桂は後手の金でも桂でも取れます。

**詳しい説明**：先手は６五の桂で７三の歩を取り、歩を一枚持駒にしました。後手には６二の金で取る手と８一の桂で取る手があるため、歩を取れたことだけで駒得とは判断できません。

表示条件：短文: 検討用（合法な応手を明示） / 詳細: 検討用（合法な応手・参考手順を含む）

根拠：usi、captured、before.sides.black.hands.pawn、after.sides.black.hands.pawn、legalCapturesAfterForSideToMove[usi=6b7c]、legalCapturesAfterForSideToMove[usi=8a7c]

控えた解釈：桂を安全に残せるという断定、成らなかったことの優劣、取り返しが強制という断定

着手前SFEN：

```text
lns1kgsnl/3g3r1/p1pppp2p/9/1p1N2pp1/2P1B4/PP1PPPP1P/1SG4R1/L3KGSNL b bp 1
```

実着手USI：`6e7c`

## stable-21

着手：☗２三歩

型：歩打ちと相手の取り方

**短い発話**：先手は持駒の歩を２三に使いましたが、後手は２二の飛車でその歩を取れます。

**詳しい説明**：先手の持ち歩は一枚から零枚になりました。後手の２三飛は合法な応手ですが、飛車が必ずその歩を取るとは限りません。

表示条件：短文: 検討用（合法な応手を明示） / 詳細: 検討用（合法な応手・参考手順を含む）

根拠：usi、drop、before.sides.black.hands.pawn、after.sides.black.hands.pawn、legalCapturesAfterForSideToMove[usi=2b2c]

控えた解釈：飛車が逃げるしかないという断定、歩打ちが必ず成功するという断定、飛車取りによる最終的な損得

着手前SFEN：

```text
l1s1kgsnl/3g3r1/p1nppp2p/9/1p4pp1/2P1B4/PP1PPPP1P/1SG4R1/L3KGSNL b Pbnp 1
```

実着手USI：`P*2c`

## stable-41

着手：☗４九玉

型：玉の移動と残る脅威

**短い発話**：先手玉は４九へ移りましたが、９九の香を狙う後手の８八の成桂は残っています。

**詳しい説明**：先手は王手を受けていない局面で玉を５九から４九へ動かしました。９九の香への成桂の利きは着手前からあり、着手後も後手の９九成桂は合法です。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（合法な応手・参考手順を含む）

根拠：usi、before.checked、sfenBefore、geometricallyAttackedUndefendedBefore[square=9i]、geometricallyAttackedUndefendedAfter[square=9i]、legalCapturesAfterForSideToMove[usi=8h9i]

控えた解釈：玉移動によって香取りが生じたという因果、玉が安全になったという断定、香取りが強制という断定

着手前SFEN：

```text
l1s1k1s1l/3gr1g2/p2pppnPp/7R1/1p4p2/9/PPGPPPP1P/1+n2G4/L3K1SNL b BNPbs2p 1
```

実着手USI：`5i4i`

## stable-71

着手：☗６六桂

型：桂打ちと取りへの注意

**短い発話**：先手が６六に打った桂は７四へ利いていますが、後手の７七の馬に取られる手もあります。

**詳しい説明**：先手は持駒の桂を６六へ打ち、７四の後手の香に利きを届かせました。後手の７七の馬で６六の桂を取る手も合法なので、香を取れることまでは確定していません。

表示条件：短文: 検討用（合法な応手を明示） / 詳細: 検討用（合法な応手・参考手順を含む）

根拠：usi、drop、before.sides.black.hands.knight、after.sides.black.hands.knight、geometricallyAttackedUndefendedAfter[square=7d]、legalCapturesAfterForSideToMove[usi=7g6f]

控えた解釈：桂で香を必ず取れるという断定、桂打ちの意図や優劣、終盤という断定

着手前SFEN：

```text
l3k1s1l/2sgr1g2/p2ppp1P1/1pl5p/5n+R2/5P3/PP+bPP1P1P/4GK1S1/+n2s3NL b BN2Pg2p 1
```

実着手USI：`N*6f`

## open-exchange-12

着手：☖５二金右

型：静かな駒組みと持駒

**短い発話**：後手は金を５二へ上がり、角はまだ双方の持駒に残っています。

**詳しい説明**：後手は６一の金を５二へ動かし、この手では駒を取っていません。先手にも後手にも持駒の角が一枚ずつあります。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、captured、after.sides.black.hands.bishop、after.sides.white.hands.bishop

控えた解釈：囲いの名称、玉の安全度が上がったという断定、角打ちの狙いの創作

着手前SFEN：

```text
ln1g1g1nl/1r1s1k1s1/p1pppp1pp/1p4p2/9/2P2P1P1/PP1PP1P1P/1S3S1R1/LN1GKG1NL w Bb 1
```

実着手USI：`6a5b`

## open-exchange-40

着手：☖６四角

型：角打ちの斜線と参考手順

**短い発話**：後手が６四に打った角は、５五を通って４六まで利いています。

**詳しい説明**：後手は持駒の角を６四へ打ち、４六の先手の歩へ斜めの利きを通しました。参考手順には先手８六歩、後手８六角、先手７三角打という進行もありますが、これは応手の一例です。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 検討用（合法な応手・参考手順を含む）

根拠：usi、drop、sfenAfter、movedSliderControl.afterSquares、review.after.candidates[rank=1].pv[0:3]、review.after.pvLegallyReplayed

控えた解釈：４六の歩を安全に取れるという断定、参考手順が強制という断定、角打ちで優勢になったという断定

着手前SFEN：

```text
l5knl/1r2g1g2/4p1sp1/ppp1spp1p/1n1p3P1/P1P2PP1P/1P1PPSN2/1SG1G2R1/LNK5L w Bb 1
```

実着手USI：`B*6d`

## open-exchange-41

着手：☗２九飛

型：飛車の移動前後の利き

**短い発話**：先手は飛車を２九へ引き、九段目は６九まで利きが通りました。

**詳しい説明**：２八の飛車は着手前には横へ５八まで利いていましたが、２九へ移った後は横へ６九まで利いています。２筋の２六・２七への利きも残っており、縦の利きをすべて失ったわけではありません。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、movedSliderControl.beforeFrom、movedSliderControl.beforeSquares、movedSliderControl.afterFrom、movedSliderControl.afterSquares

控えた解釈：飛車を引いた意図、玉の守りが強くなったという評価、新たな駒得の発生

着手前SFEN：

```text
l5knl/1r2g1g2/4p1sp1/pppbspp1p/1n1p3P1/P1P2PP1P/1P1PPSN2/1SG1G2R1/LNK5L b B 1
```

実着手USI：`2h2i`

## open-exchange-47

着手：☗８四角

型：角による歩の獲得

**短い発話**：先手は角で８四の歩を取り、持駒に歩が一枚加わりました。

**詳しい説明**：先手の角は５七から８四へ移り、成らずに歩を取りました。先手の持ち歩は零枚から一枚へ増えていますが、その歩の使い道や最終的な損得はまだ別の問題です。

表示条件：短文: 実着手後（実着手までの情報） / 詳細: 実着手後（実着手までの情報）

根拠：usi、captured、promotion、before.sides.black.hands.pawn、after.sides.black.hands.pawn

控えた解釈：一歩得が最後まで確定という断定、角が安全という断定、持ち歩の具体的な使い道

着手前SFEN：

```text
l1r1g1knl/6g2/4p1sp1/pppbspp1p/1n1p3P1/P1P1PPP1P/1P1PBSN2/1SG1G4/LNK4RL b - 1
```

実着手USI：`5g8d`

## open-exchange-71

着手：☗４五歩

型：歩交換と持ち歩の再利用

**短い発話**：先手は４五の歩を取りましたが、後手は５四の銀でその歩を取り返せます。

**詳しい説明**：先手は４六の歩で４五の歩を取り、持ち歩を一枚得ました。参考手順の４五銀、４六歩打なら、その持ち歩を使って４五の銀に歩の利きを当てる形になりますが、この順が強制されるわけではありません。

表示条件：短文: 検討用（合法な応手を明示） / 詳細: 検討用（合法な応手・参考手順を含む）

根拠：usi、captured、before.sides.black.hands.pawn、after.sides.black.hands.pawn、legalCapturesAfterForSideToMove[usi=5d4e]、review.after.candidates[rank=1].pv[0:2]、review.after.pvLegallyReplayed

控えた解釈：後手が必ず取り返すという断定、歩打ちで必ず銀が逃げるという断定、この歩交換だけを形勢の原因とする断定

着手前SFEN：

```text
l6nl/1r4gk1/4pgsp1/p1pbs1p1p/1n1p1p1P1/PPP1PPP1P/1S1PBSN2/1GK2G2L/LN6R b p 1
```

実着手USI：`4f4e`

## candidate-exploration-12

着手：☖８六飛

型：駒取り後の飛車の利き

**短い発話**：後手は８六の歩を飛車で取り、７六歩と８九桂に飛車の利きが届く配置にしました。

**詳しい説明**：この着手後は、先手・後手とも角と歩を一枚ずつ持っています。３００ミリ秒解析の参考順には▲７七角打△８二飛があり、先手が角を打った場合に後手飛車を引く一例として読めます。

表示条件：検討用（実着手後の局面と未着手の候補手を含む）

根拠：usi=8b8f、captured=pawn、after.sides.black.hands、after.sides.white.hands、movedSliderControl.beforeSquares、movedSliderControl.afterSquares、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：７六歩や８九桂を無償で取れるという断定、▲７七角打や△８二飛の強制性、人間の対局や棋力についての解釈

着手前SFEN：

```text
lnsgkg1nl/1r5s1/p1pppp1pp/6p2/7P1/1PP6/P2PPPP1P/2G4R1/LNS1KGSNL w BPb 1
```

実着手USI：`8b8f`

## candidate-exploration-18

着手：☖２四歩

型：歩の駒取りと飛車の取り返し

**短い発話**：後手は２四の先手歩を取りましたが、先手には２八飛でその歩を取り返す手があります。

**詳しい説明**：後手は２三の歩で２四の先手歩を取り、持ち歩は三枚になっています。３００ミリ秒解析には▲２四飛△２三歩打という参考順があり、歩を取り返したあとに後手が歩を打ち直す場合まで見られます。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=2c2d、captured=pawn、after.sides.white.hands.pawn=3、legalCapturesAfterForSideToMove[usi=2h2d]、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：▲２四飛が唯一の合法手という断定、歩交換全体の損得や形勢を駒取り一手だけで説明すること

着手前SFEN：

```text
lnsgkg1nl/1+r5s1/p1pppp1pp/6pP1/9/2P6/P1BPPPP1P/2G4R1/L1S1KGSNL w bn2p 1
```

実着手USI：`2c2d`

## candidate-exploration-20

着手：☖２三歩

型：歩打ちで飛車に当てる

**短い発話**：後手は２三に歩を打ち、２四の先手飛車に歩の利きを当てました。

**詳しい説明**：先手が飛車で３四歩を取る▲３四飛も合法手に含まれます。３００ミリ秒解析の参考順は▲３四飛△３三歩打▲３五飛であり、２三歩を打ったことだけで飛車を取れるとは断定できません。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=P*2c、drop=true、givesCheck=false、geometricallyAttackedUndefendedAfter[square=2d]、legalCapturesAfterForSideToMove[usi=2d3d]、review.after.finalBestmoveCandidate.pv[0:3]

控えた解釈：飛車を取ることが強制されたという断定、歩打ちだけを原因とする評価値変化の説明

着手前SFEN：

```text
lnsgkg1nl/1+r5s1/p1pppp2p/6pR1/9/2P6/P1BPPPP1P/2G6/L1S1KGSNL w Pbn3p 1
```

実着手USI：`P*2c`

## candidate-exploration-21

着手：☗８三歩

型：別の狙いを作っても残る取り手

**短い発話**：先手は８三に歩を打ちましたが、後手には２三歩で２四飛を取る合法手が残っています。

**詳しい説明**：８三の先手歩は、８二の後手龍へ進める位置に置かれました。３００ミリ秒解析の参考順は△３二龍▲２五飛で、飛車を取る手が存在することと、後手が実際にその手を選ぶことは区別します。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=P*8c、sfenAfter、legalCapturesAfterForSideToMove[usi=2c2d]、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：８三歩打ちが飛車への攻撃を解消したという解釈、龍を逃げることや飛車を取ることの強制性

着手前SFEN：

```text
lnsgkg1nl/1+r5s1/p1pppp1pp/6pR1/9/2P6/P1BPPPP1P/2G6/L1S1KGSNL b Pbn2p 1
```

実着手USI：`P*8c`

## candidate-exploration-37

着手：☗５八香

型：自分の歩に遮られる香打ち

**短い発話**：５八に打った先手の香は自分の５七歩に遮られ、後手８八飛から取られる位置です。

**詳しい説明**：後手の合法な駒取りには△５八飛成と△５八飛不成の両方があり、いずれも打った香を取ります。３００ミリ秒解析の参考順には、別の駒取りである△３二金▲同馬が示されており、香が取れることだけから後手の次の手は決まりません。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=L*5h、sfenAfter、movedSliderControl.afterSquares=[5g]、legalCapturesAfterForSideToMove[usi=8h5h+]、legalCapturesAfterForSideToMove[usi=8h5h]、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：香打ちが玉への脅威を防いだという断定、香の幾何学的な利きを５七より先まで延長すること、合法な香取りを安全な駒得とみなすこと

着手前SFEN：

```text
lnsgkg1+B1/6S2/p1pppp2p/6pp1/9/2P6/P2PPPP1P/1r3K3/L1+r2GSNL b BNLgsn3p 1
```

実着手USI：`L*5h`

## legal-errors-12

着手：☖４二金

型：駒取りのない配置変更

**短い発話**：後手は４一金を４二へ動かし、双方とも持ち駒のない局面が続いています。

**詳しい説明**：この実着手は駒取りでも王手でもありません。３００ミリ秒解析の参考順は▲２四歩△同歩▲同飛で、先手が２筋から歩交換を始める場合の一例です。

表示条件：検討用（実着手後の局面と未着手の候補手を含む）

根拠：usi=4a4b、piece=gold、captured=null、givesCheck=false、before.sides.black.hands、before.sides.white.hands、after.sides.black.hands、after.sides.white.hands、review.after.finalBestmoveCandidate.pv[0:3]

控えた解釈：特定の囲いや戦型が完成したという断定、金の移動を攻守の成功とみなすこと

着手前SFEN：

```text
ln1gkgsnl/1r1s3b1/p2ppp1p1/1pp3p1p/7P1/2PPP4/PP3PP1P/1B3S1R1/LNSGKG1NL w - 1
```

実着手USI：`4a4b`

## legal-errors-20

着手：☖７五歩

型：実際の駒取りと別の候補を分ける

**短い発話**：後手は７五の先手歩を取り、持ち歩を二枚にしました。

**詳しい説明**：実着手後の先手２四飛には、１四歩・３四歩・２二角を取る合法手があります。３００ミリ秒解析の参考順では▲２五飛△７二飛と進んでおり、駒取りが合法であることだけから先手の次の手や交換の損得は決まりません。

表示条件：検討用（実着手後の局面と未着手の候補手を含む）

根拠：usi=7d7e、captured=pawn、after.sides.white.hands.pawn=2、legalCapturesAfterForSideToMove[usi=2d1d]、legalCapturesAfterForSideToMove[usi=2d3d]、legalCapturesAfterForSideToMove[usi=2d2b+]、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：２二角を無償で取れるという断定、歩を取ったことだけを根拠とする後手有利の判断

着手前SFEN：

```text
l2gk1snl/1r1s2gb1/p1nppp3/1pp3pRp/2P6/3PP1P2/PP3P2P/1B3S3/LNSGKG1NL w Pp 1
```

実着手USI：`7d7e`

## legal-errors-21

着手：☗７四歩

型：桂の前へ歩を打つ

**短い発話**：先手は７四に歩を打ち、７三の後手桂へ歩の利きを向けました。

**詳しい説明**：実着手後も、後手２二角から６六の先手歩を取る合法手があります。３００ミリ秒解析の参考順は△８五桂▲２二飛成△同銀で、桂を動かした場合に飛車と角の交換まで進む一例です。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=P*7d、drop=true、sfenAfter、legalCapturesAfterForSideToMove[usi=2b6f]、review.after.finalBestmoveCandidate.pv[0:3]

控えた解釈：桂を取れることが確定したという断定、桂を逃げる手が唯一の応手という断定、歩打ちの意図や心理の推定

着手前SFEN：

```text
l2gk1snl/1r1s2gb1/p1nppp3/1p4pRp/2p6/3PP1P2/PP3P2P/1B3S3/LNSGKG1NL b P2p 1
```

実着手USI：`P*7d`

## legal-errors-31

着手：☗８二角成

型：成って取った後の取り返し

**短い発話**：先手は８二の飛車を取って角を成りましたが、後手７二金でその馬を取り返せます。

**詳しい説明**：この着手直後は、先手・後手とも飛車を一枚ずつ持っています。３００ミリ秒解析にも△８二金▲７三歩成△同金という参考順があり、飛車を取れたことと、成った馬を残せることは別に確認します。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=5e8b+、captured=rook、promotion=true、after.sides.black.hands.rook=1、after.sides.white.hands.rook=1、legalCapturesAfterForSideToMove[usi=7b8b]、review.after.finalBestmoveCandidate.pv[0:3]

控えた解釈：飛車を取ったので一方的な飛車得だという解釈、馬が必ず残る、あるいは後手が必ず馬を取るという断定

着手前SFEN：

```text
l3k1s1l/1rgs2g2/p2pppn2/1pP3pbp/1npPB4/4P1P2/PP3P2P/4KS3/LNSG1G1NL b r2p 1
```

実着手USI：`5e8b+`

## legal-errors-54

着手：☖２三歩

型：歩打ちのあとに残る駒取り

**短い発話**：後手の２三歩打ちのあとも、先手には４六銀で４五桂を取る手があります。

**詳しい説明**：後手は２三へ歩を打ち、持ち歩を四枚から三枚へ減らしました。３００ミリ秒解析の参考順は▲２九香打△１三角であり、先手が４五桂を取ることを強制する局面ではありません。

表示条件：検討用（実着手後の局面と未着手の応手を含む）

根拠：usi=P*2c、drop=true、before.sides.white.hands.pawn=4、after.sides.white.hands.pawn=3、legalCapturesAfterForSideToMove[usi=4f4e]、review.after.bestmove=L*2i、review.after.finalBestmoveCandidate.pv[0:2]

控えた解釈：順位１のPVを最終候補とみなすこと、歩打ちだけが評価値変化の原因だという断定、合法な桂取りを無償の駒得とすること

着手前SFEN：

```text
+R5sRl/3sk1gb1/p1gppp3/1p5bp/1npPPn3/5S3/PP1K1P2P/2G6/LN3G2L w NLPs4p 1
```

実着手USI：`P*2c`

## candidate-exploration-52

着手：☖５九龍

型：駒取りによる詰みの確認

**短い発話**：後手は５九の金を龍で取り、４八玉を詰ませました。

**詳しい説明**：５九龍は斜め一マスの４八にいる先手玉へ王手をかけています。この自動対局の終局点では、王手であることと合法な応手が零であることを全応手の列挙で確認しています。

表示条件：実着手後の終局説明

根拠：usi=8i5i、piece=dragon、captured=gold、givesCheck=true、sfenAfter、movedSliderControl.afterSquares includes4h、terminal.checked=true、terminal.legalReplyCount=0、terminal.isGameEndpoint=true

控えた解釈：終局前の局面から手順がすべて強制だったという解釈、エンジンの投了出力だけを根拠とした詰み判定、人間の対局の勝敗としての説明

着手前SFEN：

```text
lnsg5/3k1G+B2/p1pppp2p/6pp1/B8/2P3P2/P2PPPNgP/3sLK3/L+r2G1S1L w RS2n3p 1
```

実着手USI：`8i5i`

## legal-errors-77

着手：☗５二金

型：金打ちによる詰みの確認

**短い発話**：先手の５二金打ちが６一玉への詰みになりました。

**詳しい説明**：５二に打った金が、斜め前の６一にいる後手玉へ王手をかけています。この自動対局の終局点は、駒取りや成りではなく金打ちによる王手で、全応手の列挙でも合法な応手が零と確認されています。

表示条件：実着手後の終局説明

根拠：usi=G*5b、piece=gold、drop=true、captured=null、promotion=false、givesCheck=true、sfenAfter、terminal.checked=true、terminal.legalReplyCount=0、terminal.isGameEndpoint=true

控えた解釈：金打ち以前の局面から詰みまで一本道だったという解釈、終局前の手数だけによる終盤判定、実在する人間の対局記録という説明

着手前SFEN：

```text
3k1S2l/1+R1s1l+R2/p1gppp1p1/1p6p/2pPP4/5P3/PPN1K2sP/2G6/L4G2L b 2BGS3NP3p 1
```

実着手USI：`G*5b`
