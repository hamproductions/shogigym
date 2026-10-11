# Copyright rebuild inventory

Snapshot: `origin/audit/lesson-copyright` at `a425721f48143f241aad8c218fc993103537ca98`; inventory derived from `conductor/lesson-rebuild/plan.json`, the refreshed handoff, and the target worktree file tree. Study text is stored in the original checkout cache and available to this worktree through `.cache/curriculum-source`; no external pages were fetched.

## Scope and current state

- Planned lesson units: 146; all 146 authored sources and generated outputs are present. All units have complete original authorship and passed per-unit review and engine checks.
- Unique study article IDs: 159; all planned text files are checked below. The worktree cache symlinks to the original checkout corpus; the scanner loads 200 nonempty reference documents.
- Removed-course replacement rows: 30; one baseline replacement and all 29 new replacement specs are accepted. All replacement outputs are rebuilt and reconciled to their source IDs. Both additional section-E coverage courses are accepted and wired. All seven retained source-derived courses have complete original replacements accepted. All 41 current source scripts have rebuilt outputs.
- The baseline target had 10 course scripts and 10 generated outputs. Current replacement statuses are listed below.
- Target branch lesson schema is `data/lessons/units/*.json` → `src/data/lessons/*.json` per this branch’s `AGENTS.md` and `docs/lessons.md`. Separate `data/lessons/figures/` and `data/lessons/topics/` directories are absent in this target snapshot.
- Composed positions from online lesson material are not to be reused. Each rewritten unit gets newly authored explanations and positions; standard opening move sequences may be used as facts and checked against the Peta book and engine.

## Planned lesson units

| Order | Unit | Topic | Study IDs | Authored source path/status | Generated output path/status | Authored chapters |
|---:|---|---|---|---|---|---|
| 10 | `rules-game` | 将棋の目的と対局の流れ | 656 | `data/lessons/units/rules-game.json` (present) | `src/data/lessons/rules-game.json` (present) | 4; opening:1, position:3; 2 refs |
| 20 | `rules-moves` | 駒の動き | 615 | `data/lessons/units/rules-moves.json` (present) | `src/data/lessons/rules-moves.json` (present) | 5; position:5; 2 refs |
| 30 | `rules-promotion` | 成り | 722 | `data/lessons/units/rules-promotion.json` (present) | `src/data/lessons/rules-promotion.json` (present) | 4; position:4; 2 refs |
| 40 | `rules-drops` | 持ち駒を打つ | 738 | `data/lessons/units/rules-drops.json` (present) | `src/data/lessons/rules-drops.json` (present) | 4; position:4; 2 refs |
| 50 | `rules-checkmate` | 王手と詰み、勝ち負け | 746 | `data/lessons/units/rules-checkmate.json` (present) | `src/data/lessons/rules-checkmate.json` (present) | 3; position:3; 3 refs |
| 60 | `rules-fouls` | 反則 | 813 | `data/lessons/units/rules-fouls.json` (present) | `src/data/lessons/rules-fouls.json` (present) | 5; position:5; 3 refs |
| 70 | `rules-draws` | 千日手と持将棋（入玉） | 758, 932 | `data/lessons/units/rules-draws.json` (present) | `src/data/lessons/rules-draws.json` (present) | 4; position:4; 4 refs |
| 80 | `rules-setup` | 駒の並べ方・先手後手の決め方・持ち時間・マナー | 1137, 1106, 8083, 1127 | `data/lessons/units/rules-setup.json` (present) | `src/data/lessons/rules-setup.json` (present) | 4; opening:1, position:3; 5 refs |
| 90 | `rules-tsume` | 詰将棋のルール | 5361 | `data/lessons/units/rules-tsume.json` (present) | `src/data/lessons/rules-tsume.json` (present) | 3; position:3; 1 refs |
| 100 | `basics-value` | 駒の価値と駒得 | 1512, 1021 | `data/lessons/units/basics-value.json` (present) | `src/data/lessons/basics-value.json` (present) | 4; position:4; 2 refs |
| 110 | `basics-attack-defense` | 攻めと受けの基本 | 3271 | `data/lessons/units/basics-attack-defense.json` (present) | `src/data/lessons/basics-attack-defense.json` (present) | 4; position:4; 1 refs |
| 120 | `basics-mate-words` | 詰み・詰めろ・必至 | 1821 | `data/lessons/units/basics-mate-words.json` (present) | `src/data/lessons/basics-mate-words.json` (present) | 5; position:5; 1 refs |
| 130 | `basics-plan` | 指し方の基本方針 | 2911 | `data/lessons/units/basics-plan.json` (present) | `src/data/lessons/basics-plan.json` (present) | 5; position:5; 1 refs |
| 140 | `basics-opening` | 序盤の考え方 | 3156 | `data/lessons/units/basics-opening.json` (present) | `src/data/lessons/basics-opening.json` (present) | 4; position:4; 1 refs |
| 150 | `basics-middlegame` | 中盤の考え方 | 3198 | `data/lessons/units/basics-middlegame.json` (present) | `src/data/lessons/basics-middlegame.json` (present) | 4; position:4; 1 refs |
| 160 | `basics-endgame` | 終盤の考え方 | 3239, 580 | `data/lessons/units/basics-endgame.json` (present) | `src/data/lessons/basics-endgame.json` (present) | 3; position:3; 2 refs |
| 170 | `basics-bishop-trade` | 角交換のあとの注意 | 2590 | `data/lessons/units/basics-bishop-trade.json` (present) | `src/data/lessons/basics-bishop-trade.json` (present) | 3; position:3; 1 refs |
| 180 | `basics-forks` | 両取り | 1067 | `data/lessons/units/basics-forks.json` (present) | `src/data/lessons/basics-forks.json` (present) | 3; position:3; 1 refs |
| 190 | `tesuji-pawn` | 歩の手筋 | 1629 | `data/lessons/units/tesuji-pawn.json` (present) | `src/data/lessons/tesuji-pawn.json` (present) | 5; position:5; 1 refs |
| 200 | `tesuji-lance` | 香の手筋 | 1486 | `data/lessons/units/tesuji-lance.json` (present) | `src/data/lessons/tesuji-lance.json` (present) | 4; position:4; 1 refs |
| 210 | `tesuji-knight` | 桂の手筋 | 1331 | `data/lessons/units/tesuji-knight.json` (present) | `src/data/lessons/tesuji-knight.json` (present) | 4; position:4; 1 refs |
| 220 | `tesuji-silver` | 銀の手筋 | 1313 | `data/lessons/units/tesuji-silver.json` (present) | `src/data/lessons/tesuji-silver.json` (present) | 3; position:3; 1 refs |
| 230 | `tesuji-gold` | 金の手筋 | 1516 | `data/lessons/units/tesuji-gold.json` (present) | `src/data/lessons/tesuji-gold.json` (present) | 3; position:3; 1 refs |
| 240 | `tesuji-bishop` | 角の手筋 | 1586 | `data/lessons/units/tesuji-bishop.json` (present) | `src/data/lessons/tesuji-bishop.json` (present) | 3; position:3; 1 refs |
| 250 | `tesuji-rook` | 飛車の手筋 | 1541 | `data/lessons/units/tesuji-rook.json` (present) | `src/data/lessons/tesuji-rook.json` (present) | 3; position:3; 1 refs |
| 260 | `proverb-three-pawns` | 格言：三歩持ったら継ぎ歩と垂れ歩 | 8322 | `data/lessons/units/proverb-three-pawns.json` (present) | `src/data/lessons/proverb-three-pawns.json` (present) | 4; position:4; 1 refs |
| 270 | `proverb-gold-last` | 格言：金はとどめに残せ | 1783 | `data/lessons/units/proverb-gold-last.json` (present) | `src/data/lessons/proverb-gold-last.json` (present) | 3; position:3; 1 refs |
| 280 | `castles-first` | はじめに覚える囲い | 6068 | `data/lessons/units/castles-first.json` (present) | `src/data/lessons/castles-first.json` (present) | 5; position:5; 1 refs |
| 290 | `castles-yagura` | 矢倉の仲間 | 5958 | `data/lessons/units/castles-yagura.json` (present) | `src/data/lessons/castles-yagura.json` (present) | 4; position:4; 1 refs |
| 300 | `castles-nakazumai` | 中住まいの仲間 | 6062 | `data/lessons/units/castles-nakazumai.json` (present) | `src/data/lessons/castles-nakazumai.json` (present) | 4; position:4; 1 refs |
| 310 | `castles-funa` | 舟囲いの仲間 | 6044 | `data/lessons/units/castles-funa.json` (present) | `src/data/lessons/castles-funa.json` (present) | 4; position:4; 1 refs |
| 320 | `castles-hidarimino` | 左美濃の仲間 | 6007 | `data/lessons/units/castles-hidarimino.json` (present) | `src/data/lessons/castles-hidarimino.json` (present) | 4; position:4; 1 refs |
| 330 | `castles-anaguma` | 穴熊の仲間 | 6021 | `data/lessons/units/castles-anaguma.json` (present) | `src/data/lessons/castles-anaguma.json` (present) | 4; position:4; 1 refs |
| 340 | `castles-mino` | 美濃囲いの仲間 | 5985 | `data/lessons/units/castles-mino.json` (present) | `src/data/lessons/castles-mino.json` (present) | 4; position:4; 1 refs |
| 350 | `castles-aifuri` | 相振り飛車の囲い | 6053 | `data/lessons/units/castles-aifuri.json` (present) | `src/data/lessons/castles-aifuri.json` (present) | 4; position:4; 1 refs |
| 360 | `castles-other` | そのほかの囲い | 6076 | `data/lessons/units/castles-other.json` (present) | `src/data/lessons/castles-other.json` (present) | 4; position:4; 1 refs |
| 370 | `attack-mino-side` | 美濃囲いを横から崩す | 2646 | `data/lessons/units/attack-mino-side.json` (present) | `src/data/lessons/attack-mino-side.json` (present) | 4; position:4; 1 refs |
| 380 | `attack-mino-kobin` | 美濃囲いをコビンから崩す | 2615 | `data/lessons/units/attack-mino-kobin.json` (present) | `src/data/lessons/attack-mino-kobin.json` (present) | 3; position:3; 1 refs |
| 390 | `attack-mino-aifuri` | 相振り飛車での美濃崩し | 1070 | `data/lessons/units/attack-mino-aifuri.json` (present) | `src/data/lessons/attack-mino-aifuri.json` (present) | 3; position:3; 1 refs |
| 400 | `attack-yagura-side` | 矢倉を横から崩す | 2276 | `data/lessons/units/attack-yagura-side.json` (present) | `src/data/lessons/attack-yagura-side.json` (present) | 3; position:3; 1 refs |
| 410 | `attack-yagura-head` | 矢倉の玉頭と端を攻める | 2313 | `data/lessons/units/attack-yagura-head.json` (present) | `src/data/lessons/attack-yagura-head.json` (present) | 3; position:3; 1 refs |
| 420 | `attack-anaguma` | 穴熊を崩す | 3014 | `data/lessons/units/attack-anaguma.json` (present) | `src/data/lessons/attack-anaguma.json` (present) | 3; position:3; 1 refs |
| 430 | `attack-funa` | 舟囲いを崩す | 3048 | `data/lessons/units/attack-funa.json` (present) | `src/data/lessons/attack-funa.json` (present) | 3; position:3; 1 refs |
| 440 | `attack-kinmusou` | 金無双を崩す | 875 | `data/lessons/units/attack-kinmusou.json` (present) | `src/data/lessons/attack-kinmusou.json` (present) | 3; position:3; 1 refs |
| 450 | `endgame-yose` | 寄せの考え方 | 2375 | `data/lessons/units/endgame-yose.json` (present) | `src/data/lessons/endgame-yose.json` (present) | 4; position:4; 1 refs |
| 460 | `endgame-tsumero` | 詰めろと必至のかけ方 | 7368 | `data/lessons/units/endgame-tsumero.json` (present) | `src/data/lessons/endgame-tsumero.json` (present) | 4; position:4; 1 refs |
| 470 | `endgame-mate1` | 1手詰の見つけ方 | 1854 | `data/lessons/units/endgame-mate1.json` (present) | `src/data/lessons/endgame-mate1.json` (present) | 14; position:14; 1 refs |
| 480 | `endgame-mate3` | 3手詰の考え方 | 4633, 19, 386 | `data/lessons/units/endgame-mate3.json` (present) | `src/data/lessons/endgame-mate3.json` (present) | 5; position:5; 3 refs |
| 490 | `endgame-mate-tesuji` | 詰みに使う手筋 | 109, 5325 | `data/lessons/units/endgame-mate-tesuji.json` (present) | `src/data/lessons/endgame-mate-tesuji.json` (present) | 5; position:5; 2 refs |
| 500 | `endgame-tsume-study` | 詰将棋の解き方と練習法 | 2418 | `data/lessons/units/endgame-tsume-study.json` (present) | `src/data/lessons/endgame-tsume-study.json` (present) | 4; position:4; 1 refs |
| 510 | `ibisha-basics` | 居飛車の基本 | 4717, 7230 | `data/lessons/units/ibisha-basics.json` (present) | `src/data/lessons/ibisha-basics.json` (present) | 4; opening:4; 2 refs |
| 520 | `bougin-basics` | 棒銀の基本 | 2676 | `data/lessons/units/bougin-basics.json` (present) | `src/data/lessons/bougin-basics.json` (present) | 5; opening:3, position:2; 1 refs |
| 530 | `bougin-middlegame` | 棒銀の中盤 | 2695 | `data/lessons/units/bougin-middlegame.json` (present) | `src/data/lessons/bougin-middlegame.json` (present) | 4; position:4; 1 refs |
| 540 | `bougin-vs-furibisha` | 棒銀で振り飛車と戦う | 6549 | `data/lessons/units/bougin-vs-furibisha.json` (present) | `src/data/lessons/bougin-vs-furibisha.json` (present) | 3; position:3; 1 refs |
| 550 | `bougin-castles` | 棒銀と合わせる囲い | 6540 | `data/lessons/units/bougin-castles.json` (present) | `src/data/lessons/bougin-castles.json` (present) | 3; position:3; 1 refs |
| 560 | `yagura-build` | 矢倉の組み方 | 1852 | `data/lessons/units/yagura-build.json` (present) | `src/data/lessons/yagura-build.json` (present) | 3; position:3; 1 refs |
| 570 | `yagura-bougin` | 矢倉棒銀 | 3457 | `data/lessons/units/yagura-bougin.json` (present) | `src/data/lessons/yagura-bougin.json` (present) | 3; position:3; 1 refs |
| 580 | `yagura-aiyagura` | 相矢倉の駒組み | 7747 | `data/lessons/units/yagura-aiyagura.json` (present) | `src/data/lessons/yagura-aiyagura.json` (present) | 3; position:3; 1 refs |
| 590 | `yagura-37gin` | 相矢倉の3七銀戦法 | 2105 | `data/lessons/units/yagura-37gin.json` (present) | `src/data/lessons/yagura-37gin.json` (present) | 4; position:4; 1 refs |
| 600 | `yagura-waki` | 脇システム | 7819 | `data/lessons/units/yagura-waki.json` (present) | `src/data/lessons/yagura-waki.json` (present) | 3; position:3; 1 refs |
| 610 | `yagura-suzume` | 雀刺し | 5928 | `data/lessons/units/yagura-suzume.json` (present) | `src/data/lessons/yagura-suzume.json` (present) | 3; position:3; 1 refs |
| 620 | `yagura-vs-bougin` | 矢倉で一直線棒銀を迎え撃つ | 2947 | `data/lessons/units/yagura-vs-bougin.json` (present) | `src/data/lessons/yagura-vs-bougin.json` (present) | 3; position:3; 1 refs |
| 630 | `yagura-vs-migishiken` | 矢倉で右四間飛車を迎え撃つ | 4917 | `data/lessons/units/yagura-vs-migishiken.json` (present) | `src/data/lessons/yagura-vs-migishiken.json` (present) | 3; position:3; 1 refs |
| 640 | `yagura-vs-hidarimino` | 矢倉で居角左美濃急戦を迎え撃つ | 4848 | `data/lessons/units/yagura-vs-hidarimino.json` (present) | `src/data/lessons/yagura-vs-hidarimino.json` (present) | 4; position:4; 1 refs |
| 650 | `gangi` | 雁木 | 5845, 5896 | `data/lessons/units/gangi.json` (present) | `src/data/lessons/gangi.json` (present) | 4; position:4; 2 refs |
| 660 | `kakugawari-basics` | 角換わりの基本 | 2865 | `data/lessons/units/kakugawari-basics.json` (present) | `src/data/lessons/kakugawari-basics.json` (present) | 4; position:4; 1 refs |
| 670 | `kakugawari-bougin` | 角換わり棒銀 | 3497 | `data/lessons/units/kakugawari-bougin.json` (present) | `src/data/lessons/kakugawari-bougin.json` (present) | 3; position:3; 1 refs |
| 680 | `kakugawari-hayakuri` | 角換わり早繰り銀 | 6645 | `data/lessons/units/kakugawari-hayakuri.json` (present) | `src/data/lessons/kakugawari-hayakuri.json` (present) | 4; position:4; 1 refs |
| 690 | `kakugawari-koshikake` | 角換わり腰掛け銀 | 6677, 6736 | `data/lessons/units/kakugawari-koshikake.json` (present) | `src/data/lessons/kakugawari-koshikake.json` (present) | 4; position:4; 2 refs |
| 700 | `kakugawari-45kei` | 角換わり▲4五桂の速攻 | 6704 | `data/lessons/units/kakugawari-45kei.json` (present) | `src/data/lessons/kakugawari-45kei.json` (present) | 4; position:4; 1 refs |
| 710 | `kakugawari-ittezon` | 一手損角換わり | 6765 | `data/lessons/units/kakugawari-ittezon.json` (present) | `src/data/lessons/kakugawari-ittezon.json` (present) | 4; position:4; 1 refs |
| 720 | `aigakari-basics` | 相掛かりの基本 | 5873 | `data/lessons/units/aigakari-basics.json` (present) | `src/data/lessons/aigakari-basics.json` (present) | 4; position:4; 1 refs |
| 730 | `aigakari-bougin` | 相掛かり棒銀 | 7182 | `data/lessons/units/aigakari-bougin.json` (present) | `src/data/lessons/aigakari-bougin.json` (present) | 3; position:3; 1 refs |
| 740 | `hineribisha` | ひねり飛車 | 7205 | `data/lessons/units/hineribisha.json` (present) | `src/data/lessons/hineribisha.json` (present) | 4; position:4; 1 refs |
| 750 | `yokofu-basics` | 横歩取りの基本 | 3783 | `data/lessons/units/yokofu-basics.json` (present) | `src/data/lessons/yokofu-basics.json` (present) | 4; position:4; 1 refs |
| 760 | `yokofu-23fu` | 横歩取り△2三歩 | 7031 | `data/lessons/units/yokofu-23fu.json` (present) | `src/data/lessons/yokofu-23fu.json` (present) | 4; position:4; 1 refs |
| 770 | `yokofu-45kaku` | 横歩取り△4五角 | 3826 | `data/lessons/units/yokofu-45kaku.json` (present) | `src/data/lessons/yokofu-45kaku.json` (present) | 4; position:4; 1 refs |
| 780 | `aiyokofu` | 相横歩取り | 7071 | `data/lessons/units/aiyokofu.json` (present) | `src/data/lessons/aiyokofu.json` (present) | 3; position:3; 1 refs |
| 790 | `yokofu-85hisha` | 横歩取り△3三角型 | 7105 | `data/lessons/units/yokofu-85hisha.json` (present) | `src/data/lessons/yokofu-85hisha.json` (present) | 3; position:3; 1 refs |
| 800 | `yokofu-aono` | 青野流 | 4314 | `data/lessons/units/yokofu-aono.json` (present) | `src/data/lessons/yokofu-aono.json` (present) | 3; position:3; 1 refs |
| 810 | `yokofu-yuuki` | 勇気流 | 7137 | `data/lessons/units/yokofu-yuuki.json` (present) | `src/data/lessons/yokofu-yuuki.json` (present) | 3; position:3; 1 refs |
| 820 | `yokofu-avoid` | 横歩取りを避ける指し方 | 6496 | `data/lessons/units/yokofu-avoid.json` (present) | `src/data/lessons/yokofu-avoid.json` (present) | 3; position:3; 1 refs |
| 830 | `taifuri-basics` | 対振り飛車の基本 | 7238 | `data/lessons/units/taifuri-basics.json` (present) | `src/data/lessons/taifuri-basics.json` (present) | 4; position:4; 1 refs |
| 840 | `taifuri-bougin` | 対振り棒銀 | 7254 | `data/lessons/units/taifuri-bougin.json` (present) | `src/data/lessons/taifuri-bougin.json` (present) | 3; position:3; 1 refs |
| 850 | `taifuri-46gin` | 4六銀左急戦 | 7282 | `data/lessons/units/taifuri-46gin.json` (present) | `src/data/lessons/taifuri-46gin.json` (present) | 3; position:3; 1 refs |
| 860 | `taifuri-elmo` | elmo囲い急戦 | 7936 | `data/lessons/units/taifuri-elmo.json` (present) | `src/data/lessons/taifuri-elmo.json` (present) | 3; position:3; 1 refs |
| 870 | `taifuri-anaguma` | 居飛車穴熊 | 7339 | `data/lessons/units/taifuri-anaguma.json` (present) | `src/data/lessons/taifuri-anaguma.json` (present) | 3; position:3; 1 refs |
| 880 | `taifuri-millennium` | ミレニアム | 7988 | `data/lessons/units/taifuri-millennium.json` (present) | `src/data/lessons/taifuri-millennium.json` (present) | 3; position:3; 1 refs |
| 890 | `taifuri-45hayashikake` | 4五歩早仕掛け | 974 | `data/lessons/units/taifuri-45hayashikake.json` (present) | `src/data/lessons/taifuri-45hayashikake.json` (present) | 4; position:4; 1 refs |
| 900 | `taifuri-ponpon` | ポンポン桂 | 8008 | `data/lessons/units/taifuri-ponpon.json` (present) | `src/data/lessons/taifuri-ponpon.json` (present) | 3; position:3; 1 refs |
| 910 | `taifuri-vs-hayaishida` | 早石田の△4五角に備える | 7962 | `data/lessons/units/taifuri-vs-hayaishida.json` (present) | `src/data/lessons/taifuri-vs-hayaishida.json` (present) | 3; position:3; 1 refs |
| 920 | `taifuri-bougin-ishida` | 石田流に棒金 | 4502 | `data/lessons/units/taifuri-bougin-ishida.json` (present) | `src/data/lessons/taifuri-bougin-ishida.json` (present) | 3; position:3; 1 refs |
| 930 | `taifuri-chousoku` | ゴキゲン中飛車に超速 | 7863 | `data/lessons/units/taifuri-chousoku.json` (present) | `src/data/lessons/taifuri-chousoku.json` (present) | 3; position:3; 1 refs |
| 940 | `taifuri-vs-kakukoukan` | 角交換四間飛車に4七銀型 | 2204 | `data/lessons/units/taifuri-vs-kakukoukan.json` (present) | `src/data/lessons/taifuri-vs-kakukoukan.json` (present) | 3; position:3; 1 refs |
| 950 | `mukai-build` | 向かい飛車の組み方 | 8037 | `data/lessons/units/mukai-build.json` (present) | `src/data/lessons/mukai-build.json` (present) | 3; position:3; 1 refs |
| 960 | `mukai-attack` | 向かい飛車の攻め方 | 8048 | `data/lessons/units/mukai-attack.json` (present) | `src/data/lessons/mukai-attack.json` (present) | 3; position:3; 1 refs |
| 970 | `sanken-basics` | 三間飛車の基本 | 6896 | `data/lessons/units/sanken-basics.json` (present) | `src/data/lessons/sanken-basics.json` (present) | 4; position:4; 1 refs |
| 980 | `sanken-vs-bougin` | 三間飛車で棒銀を受ける | 6934 | `data/lessons/units/sanken-vs-bougin.json` (present) | `src/data/lessons/sanken-vs-bougin.json` (present) | 4; position:4; 1 refs |
| 990 | `sanken-tomahawk` | トマホーク | 6970 | `data/lessons/units/sanken-tomahawk.json` (present) | `src/data/lessons/sanken-tomahawk.json` (present) | 4; position:4; 1 refs |
| 1000 | `ishida-basics` | 石田流の基本 | 6200 | `data/lessons/units/ishida-basics.json` (present) | `src/data/lessons/ishida-basics.json` (present) | 4; position:4; 1 refs |
| 1010 | `ishida-honkumi` | 石田流本組み | 6436 | `data/lessons/units/ishida-honkumi.json` (present) | `src/data/lessons/ishida-honkumi.json` (present) | 3; position:3; 1 refs |
| 1020 | `ishida-attack` | 石田流本組みからの仕掛け | 6460 | `data/lessons/units/ishida-attack.json` (present) | `src/data/lessons/ishida-attack.json` (present) | 3; position:3; 1 refs |
| 1030 | `hayaishida` | 早石田（升田式） | 5256 | `data/lessons/units/hayaishida.json` (present) | `src/data/lessons/hayaishida.json` (present) | 3; position:3; 1 refs |
| 1040 | `ishida-43` | 4→3戦法 | 6814 | `data/lessons/units/ishida-43.json` (present) | `src/data/lessons/ishida-43.json` (present) | 3; position:3; 1 refs |
| 1050 | `shiken-basics` | 四間飛車の基本 | 2426 | `data/lessons/units/shiken-basics.json` (present) | `src/data/lessons/shiken-basics.json` (present) | 3; position:3; 1 refs |
| 1060 | `shiken-castles` | 四間飛車の囲い | 2472 | `data/lessons/units/shiken-castles.json` (present) | `src/data/lessons/shiken-castles.json` (present) | 3; position:3; 1 refs |
| 1070 | `shiken-patterns` | 四間飛車の駒組みの型 | 2491 | `data/lessons/units/shiken-patterns.json` (present) | `src/data/lessons/shiken-patterns.json` (present) | 3; position:3; 1 refs |
| 1080 | `shiken-vs-igyoku-bougin` | 居玉棒銀を受ける | 2519 | `data/lessons/units/shiken-vs-igyoku-bougin.json` (present) | `src/data/lessons/shiken-vs-igyoku-bougin.json` (present) | 3; position:3; 1 refs |
| 1090 | `shiken-vs-funa-bougin` | 舟囲い棒銀を受ける | 2556 | `data/lessons/units/shiken-vs-funa-bougin.json` (present) | `src/data/lessons/shiken-vs-funa-bougin.json` (present) | 3; position:3; 1 refs |
| 1100 | `shiken-vs-yagura` | 四間飛車対矢倉 | 1741 | `data/lessons/units/shiken-vs-yagura.json` (present) | `src/data/lessons/shiken-vs-yagura.json` (present) | 3; position:3; 1 refs |
| 1110 | `shiken-vs-migishiken` | 四間飛車対右四間飛車 | 1699 | `data/lessons/units/shiken-vs-migishiken.json` (present) | `src/data/lessons/shiken-vs-migishiken.json` (present) | 3; position:3; 1 refs |
| 1120 | `shiken-vs-anaguma` | 四間飛車対居飛車穴熊 | 2744 | `data/lessons/units/shiken-vs-anaguma.json` (present) | `src/data/lessons/shiken-vs-anaguma.json` (present) | 3; position:3; 1 refs |
| 1130 | `shiken-tateishi` | 立石流 | 1001 | `data/lessons/units/shiken-tateishi.json` (present) | `src/data/lessons/shiken-tateishi.json` (present) | 3; position:3; 1 refs |
| 1140 | `fujii-build` | 藤井システムの組み方 | 7420 | `data/lessons/units/fujii-build.json` (present) | `src/data/lessons/fujii-build.json` (present) | 3; position:3; 1 refs |
| 1150 | `fujii-vs-anaguma` | 藤井システム対居飛車穴熊 | 7418 | `data/lessons/units/fujii-vs-anaguma.json` (present) | `src/data/lessons/fujii-vs-anaguma.json` (present) | 3; position:3; 1 refs |
| 1160 | `fujii-vs-hidarimino` | 藤井システム対左美濃 | 7495 | `data/lessons/units/fujii-vs-hidarimino.json` (present) | `src/data/lessons/fujii-vs-hidarimino.json` (present) | 4; position:4; 1 refs |
| 1170 | `fujii-vs-kyusen` | 藤井システム対急戦 | 7513 | `data/lessons/units/fujii-vs-kyusen.json` (present) | `src/data/lessons/fujii-vs-kyusen.json` (present) | 3; position:3; 1 refs |
| 1180 | `gokigen-basics` | ゴキゲン中飛車の基本 | 5040 | `data/lessons/units/gokigen-basics.json` (present) | `src/data/lessons/gokigen-basics.json` (present) | 3; position:3; 1 refs |
| 1190 | `nakabisha-sente` | 先手中飛車 | 6593 | `data/lessons/units/nakabisha-sente.json` (present) | `src/data/lessons/nakabisha-sente.json` (present) | 3; position:3; 1 refs |
| 1200 | `gokigen-castles` | 中飛車の囲い | 6566 | `data/lessons/units/gokigen-castles.json` (present) | `src/data/lessons/gokigen-castles.json` (present) | 3; position:3; 1 refs |
| 1210 | `gokigen-attack` | ゴキゲン中飛車の攻め筋 | 5619 | `data/lessons/units/gokigen-attack.json` (present) | `src/data/lessons/gokigen-attack.json` (present) | 3; position:3; 1 refs |
| 1220 | `gokigen-vs-choukyusen` | 超急戦に備える | 5461 | `data/lessons/units/gokigen-vs-choukyusen.json` (present) | `src/data/lessons/gokigen-vs-choukyusen.json` (present) | 3; position:3; 1 refs |
| 1230 | `gokigen-vs-chousoku` | 超速3七銀を受ける | 6514 | `data/lessons/units/gokigen-vs-chousoku.json` (present) | `src/data/lessons/gokigen-vs-chousoku.json` (present) | 3; position:3; 1 refs |
| 1240 | `gokigen-vs-anaguma` | 一直線穴熊と戦う | 6174 | `data/lessons/units/gokigen-vs-anaguma.json` (present) | `src/data/lessons/gokigen-vs-anaguma.json` (present) | 3; position:3; 1 refs |
| 1250 | `kakukoukan-shiken` | 角交換四間飛車 | 1247 | `data/lessons/units/kakukoukan-shiken.json` (present) | `src/data/lessons/kakukoukan-shiken.json` (present) | 3; position:3; 1 refs |
| 1260 | `kakukoukan-gyakubougin` | 逆棒銀 | 7605 | `data/lessons/units/kakukoukan-gyakubougin.json` (present) | `src/data/lessons/kakukoukan-gyakubougin.json` (present) | 3; position:3; 1 refs |
| 1270 | `direct-mukai` | ダイレクト向かい飛車 | 7645 | `data/lessons/units/direct-mukai.json` (present) | `src/data/lessons/direct-mukai.json` (present) | 3; position:3; 1 refs |
| 1280 | `legspe` | レグスペ | 7700 | `data/lessons/units/legspe.json` (present) | `src/data/lessons/legspe.json` (present) | 3; position:3; 1 refs |
| 1290 | `aifuri-basics` | 相振り飛車の基本 | 829 | `data/lessons/units/aifuri-basics.json` (present) | `src/data/lessons/aifuri-basics.json` (present) | 3; position:3; 1 refs |
| 1300 | `aifuri-ishida-vs-naka` | 石田流対中飛車 | 777 | `data/lessons/units/aifuri-ishida-vs-naka.json` (present) | `src/data/lessons/aifuri-ishida-vs-naka.json` (present) | 3; position:3; 1 refs |
| 1310 | `aifuri-vs-ishida` | 角交換四間飛車で石田流と戦う | 362 | `data/lessons/units/aifuri-vs-ishida.json` (present) | `src/data/lessons/aifuri-vs-ishida.json` (present) | 3; position:3; 1 refs |
| 1320 | `aifuri-hidari-anaguma` | 中飛車左穴熊 | 6154 | `data/lessons/units/aifuri-hidari-anaguma.json` (present) | `src/data/lessons/aifuri-hidari-anaguma.json` (present) | 3; position:3; 1 refs |
| 1330 | `kishu-onigoroshi` | 鬼殺しと対策 | 2807 | `data/lessons/units/kishu-onigoroshi.json` (present) | `src/data/lessons/kishu-onigoroshi.json` (present) | 3; position:3; 1 refs |
| 1340 | `kishu-sujichigai` | 筋違い角と対策 | 5001 | `data/lessons/units/kishu-sujichigai.json` (present) | `src/data/lessons/kishu-sujichigai.json` (present) | 3; position:3; 1 refs |
| 1350 | `kishu-pacman` | パックマン | 2840 | `data/lessons/units/kishu-pacman.json` (present) | `src/data/lessons/kishu-pacman.json` (present) | 3; position:3; 1 refs |
| 1360 | `kishu-ahiru` | アヒル戦法と対策 | 5283 | `data/lessons/units/kishu-ahiru.json` (present) | `src/data/lessons/kishu-ahiru.json` (present) | 3; position:3; 1 refs |
| 1370 | `kishu-migishiken-hidarimino` | 右四間飛車左美濃 | 4961 | `data/lessons/units/kishu-migishiken-hidarimino.json` (present) | `src/data/lessons/kishu-migishiken-hidarimino.json` (present) | 3; position:3; 1 refs |
| 1380 | `ureshino-basics` | 嬉野流の基本 | 5608, 5519 | `data/lessons/units/ureshino-basics.json` (present) | `src/data/lessons/ureshino-basics.json` (present) | 3; position:3; 2 refs |
| 1390 | `ureshino-new` | 新嬉野流 | 5571 | `data/lessons/units/ureshino-new.json` (present) | `src/data/lessons/ureshino-new.json` (present) | 3; position:3; 1 refs |
| 1400 | `ureshino-vs-bougin` | 嬉野流対棒銀 | 5546 | `data/lessons/units/ureshino-vs-bougin.json` (present) | `src/data/lessons/ureshino-vs-bougin.json` (present) | 3; position:3; 1 refs |
| 1410 | `ureshino-vs-shiken` | 嬉野流対四間飛車 | 5584 | `data/lessons/units/ureshino-vs-shiken.json` (present) | `src/data/lessons/ureshino-vs-shiken.json` (present) | 3; position:3; 1 refs |
| 1420 | `ureshino-counter` | 嬉野流を三間飛車で迎え撃つ | 5499 | `data/lessons/units/ureshino-counter.json` (present) | `src/data/lessons/ureshino-counter.json` (present) | 3; position:3; 1 refs |
| 1430 | `handicap-8` | 八枚落ち | 4747 | `data/lessons/units/handicap-8.json` (present) | `src/data/lessons/handicap-8.json` (present) | 3; position:3; 1 refs |
| 1440 | `handicap-6` | 六枚落ち | 4779 | `data/lessons/units/handicap-6.json` (present) | `src/data/lessons/handicap-6.json` (present) | 3; position:3; 1 refs |
| 1450 | `handicap-4` | 四枚落ち | 4815 | `data/lessons/units/handicap-4.json` (present) | `src/data/lessons/handicap-4.json` (present) | 3; position:3; 1 refs |
| 1460 | `handicap-2` | 二枚落ち | 4878 | `data/lessons/units/handicap-2.json` (present) | `src/data/lessons/handicap-2.json` (present) | 3; position:3; 1 refs |
## Planned source article texts

| Study ID | Planned unit(s) | Local source text | Availability |
|---:|---|---|---|
| `19` | `endgame-mate3` | `.cache/curriculum-source/19.txt` | 7377 bytes; original checkout |
| `109` | `endgame-mate-tesuji` | `.cache/curriculum-source/109.txt` | 9337 bytes; original checkout |
| `362` | `aifuri-vs-ishida` | `.cache/curriculum-source/362.txt` | 10256 bytes; original checkout |
| `386` | `endgame-mate3` | `.cache/curriculum-source/386.txt` | 6279 bytes; original checkout |
| `580` | `basics-endgame` | `.cache/curriculum-source/580.txt` | 13383 bytes; original checkout |
| `615` | `rules-moves` | `.cache/curriculum-source/615.txt` | 10173 bytes; original checkout |
| `656` | `rules-game` | `.cache/curriculum-source/656.txt` | 6311 bytes; original checkout |
| `722` | `rules-promotion` | `.cache/curriculum-source/722.txt` | 10174 bytes; original checkout |
| `738` | `rules-drops` | `.cache/curriculum-source/738.txt` | 8574 bytes; original checkout |
| `746` | `rules-checkmate` | `.cache/curriculum-source/746.txt` | 7098 bytes; original checkout |
| `758` | `rules-draws` | `.cache/curriculum-source/758.txt` | 7767 bytes; original checkout |
| `777` | `aifuri-ishida-vs-naka` | `.cache/curriculum-source/777.txt` | 14002 bytes; original checkout |
| `813` | `rules-fouls` | `.cache/curriculum-source/813.txt` | 8686 bytes; original checkout |
| `829` | `aifuri-basics` | `.cache/curriculum-source/829.txt` | 12718 bytes; original checkout |
| `875` | `attack-kinmusou` | `.cache/curriculum-source/875.txt` | 12994 bytes; original checkout |
| `932` | `rules-draws` | `.cache/curriculum-source/932.txt` | 12470 bytes; original checkout |
| `974` | `taifuri-45hayashikake` | `.cache/curriculum-source/974.txt` | 7989 bytes; original checkout |
| `1001` | `shiken-tateishi` | `.cache/curriculum-source/1001.txt` | 10377 bytes; original checkout |
| `1021` | `basics-value` | `.cache/curriculum-source/1021.txt` | 7393 bytes; original checkout |
| `1067` | `basics-forks` | `.cache/curriculum-source/1067.txt` | 4461 bytes; original checkout |
| `1070` | `attack-mino-aifuri` | `.cache/curriculum-source/1070.txt` | 11955 bytes; original checkout |
| `1106` | `rules-setup` | `.cache/curriculum-source/1106.txt` | 5018 bytes; original checkout |
| `1127` | `rules-setup` | `.cache/curriculum-source/1127.txt` | 7661 bytes; original checkout |
| `1137` | `rules-setup` | `.cache/curriculum-source/1137.txt` | 8934 bytes; original checkout |
| `1247` | `kakukoukan-shiken` | `.cache/curriculum-source/1247.txt` | 8354 bytes; original checkout |
| `1313` | `tesuji-silver` | `.cache/curriculum-source/1313.txt` | 7921 bytes; original checkout |
| `1331` | `tesuji-knight` | `.cache/curriculum-source/1331.txt` | 10768 bytes; original checkout |
| `1486` | `tesuji-lance` | `.cache/curriculum-source/1486.txt` | 9381 bytes; original checkout |
| `1512` | `basics-value` | `.cache/curriculum-source/1512.txt` | 10530 bytes; original checkout |
| `1516` | `tesuji-gold` | `.cache/curriculum-source/1516.txt` | 8933 bytes; original checkout |
| `1541` | `tesuji-rook` | `.cache/curriculum-source/1541.txt` | 9198 bytes; original checkout |
| `1586` | `tesuji-bishop` | `.cache/curriculum-source/1586.txt` | 10263 bytes; original checkout |
| `1629` | `tesuji-pawn` | `.cache/curriculum-source/1629.txt` | 13607 bytes; original checkout |
| `1699` | `shiken-vs-migishiken` | `.cache/curriculum-source/1699.txt` | 14606 bytes; original checkout |
| `1741` | `shiken-vs-yagura` | `.cache/curriculum-source/1741.txt` | 12951 bytes; original checkout |
| `1783` | `proverb-gold-last` | `.cache/curriculum-source/1783.txt` | 10142 bytes; original checkout |
| `1821` | `basics-mate-words` | `.cache/curriculum-source/1821.txt` | 10680 bytes; original checkout |
| `1852` | `yagura-build` | `.cache/curriculum-source/1852.txt` | 14348 bytes; original checkout |
| `1854` | `endgame-mate1` | `.cache/curriculum-source/1854.txt` | 11204 bytes; original checkout |
| `2105` | `yagura-37gin` | `.cache/curriculum-source/2105.txt` | 14987 bytes; original checkout |
| `2204` | `taifuri-vs-kakukoukan` | `.cache/curriculum-source/2204.txt` | 11627 bytes; original checkout |
| `2276` | `attack-yagura-side` | `.cache/curriculum-source/2276.txt` | 11034 bytes; original checkout |
| `2313` | `attack-yagura-head` | `.cache/curriculum-source/2313.txt` | 11363 bytes; original checkout |
| `2375` | `endgame-yose` | `.cache/curriculum-source/2375.txt` | 11507 bytes; original checkout |
| `2418` | `endgame-tsume-study` | `.cache/curriculum-source/2418.txt` | 14961 bytes; original checkout |
| `2426` | `shiken-basics` | `.cache/curriculum-source/2426.txt` | 9944 bytes; original checkout |
| `2472` | `shiken-castles` | `.cache/curriculum-source/2472.txt` | 7254 bytes; original checkout |
| `2491` | `shiken-patterns` | `.cache/curriculum-source/2491.txt` | 11591 bytes; original checkout |
| `2519` | `shiken-vs-igyoku-bougin` | `.cache/curriculum-source/2519.txt` | 9517 bytes; original checkout |
| `2556` | `shiken-vs-funa-bougin` | `.cache/curriculum-source/2556.txt` | 13867 bytes; original checkout |
| `2590` | `basics-bishop-trade` | `.cache/curriculum-source/2590.txt` | 7282 bytes; original checkout |
| `2615` | `attack-mino-kobin` | `.cache/curriculum-source/2615.txt` | 9212 bytes; original checkout |
| `2646` | `attack-mino-side` | `.cache/curriculum-source/2646.txt` | 11154 bytes; original checkout |
| `2676` | `bougin-basics` | `.cache/curriculum-source/2676.txt` | 12346 bytes; original checkout |
| `2695` | `bougin-middlegame` | `.cache/curriculum-source/2695.txt` | 10043 bytes; original checkout |
| `2744` | `shiken-vs-anaguma` | `.cache/curriculum-source/2744.txt` | 12961 bytes; original checkout |
| `2807` | `kishu-onigoroshi` | `.cache/curriculum-source/2807.txt` | 10419 bytes; original checkout |
| `2840` | `kishu-pacman` | `.cache/curriculum-source/2840.txt` | 8136 bytes; original checkout |
| `2865` | `kakugawari-basics` | `.cache/curriculum-source/2865.txt` | 12143 bytes; original checkout |
| `2911` | `basics-plan` | `.cache/curriculum-source/2911.txt` | 13721 bytes; original checkout |
| `2947` | `yagura-vs-bougin` | `.cache/curriculum-source/2947.txt` | 17503 bytes; original checkout |
| `3014` | `attack-anaguma` | `.cache/curriculum-source/3014.txt` | 9130 bytes; original checkout |
| `3048` | `attack-funa` | `.cache/curriculum-source/3048.txt` | 10042 bytes; original checkout |
| `3156` | `basics-opening` | `.cache/curriculum-source/3156.txt` | 14082 bytes; original checkout |
| `3198` | `basics-middlegame` | `.cache/curriculum-source/3198.txt` | 11889 bytes; original checkout |
| `3239` | `basics-endgame` | `.cache/curriculum-source/3239.txt` | 8228 bytes; original checkout |
| `3271` | `basics-attack-defense` | `.cache/curriculum-source/3271.txt` | 6512 bytes; original checkout |
| `3457` | `yagura-bougin` | `.cache/curriculum-source/3457.txt` | 4310 bytes; original checkout |
| `3497` | `kakugawari-bougin` | `.cache/curriculum-source/3497.txt` | 11613 bytes; original checkout |
| `3783` | `yokofu-basics` | `.cache/curriculum-source/3783.txt` | 7488 bytes; original checkout |
| `3826` | `yokofu-45kaku` | `.cache/curriculum-source/3826.txt` | 11613 bytes; original checkout |
| `4314` | `yokofu-aono` | `.cache/curriculum-source/4314.txt` | 11400 bytes; original checkout |
| `4502` | `taifuri-bougin-ishida` | `.cache/curriculum-source/4502.txt` | 13471 bytes; original checkout |
| `4633` | `endgame-mate3` | `.cache/curriculum-source/4633.txt` | 8816 bytes; original checkout |
| `4717` | `ibisha-basics` | `.cache/curriculum-source/4717.txt` | 15137 bytes; original checkout |
| `4747` | `handicap-8` | `.cache/curriculum-source/4747.txt` | 13962 bytes; original checkout |
| `4779` | `handicap-6` | `.cache/curriculum-source/4779.txt` | 11054 bytes; original checkout |
| `4815` | `handicap-4` | `.cache/curriculum-source/4815.txt` | 13107 bytes; original checkout |
| `4848` | `yagura-vs-hidarimino` | `.cache/curriculum-source/4848.txt` | 10877 bytes; original checkout |
| `4878` | `handicap-2` | `.cache/curriculum-source/4878.txt` | 6373 bytes; original checkout |
| `4917` | `yagura-vs-migishiken` | `.cache/curriculum-source/4917.txt` | 10559 bytes; original checkout |
| `4961` | `kishu-migishiken-hidarimino` | `.cache/curriculum-source/4961.txt` | 12089 bytes; original checkout |
| `5001` | `kishu-sujichigai` | `.cache/curriculum-source/5001.txt` | 9259 bytes; original checkout |
| `5040` | `gokigen-basics` | `.cache/curriculum-source/5040.txt` | 8269 bytes; original checkout |
| `5256` | `hayaishida` | `.cache/curriculum-source/5256.txt` | 8435 bytes; original checkout |
| `5283` | `kishu-ahiru` | `.cache/curriculum-source/5283.txt` | 7444 bytes; original checkout |
| `5325` | `endgame-mate-tesuji` | `.cache/curriculum-source/5325.txt` | 8406 bytes; original checkout |
| `5361` | `rules-tsume` | `.cache/curriculum-source/5361.txt` | 10771 bytes; original checkout |
| `5461` | `gokigen-vs-choukyusen` | `.cache/curriculum-source/5461.txt` | 8475 bytes; original checkout |
| `5499` | `ureshino-counter` | `.cache/curriculum-source/5499.txt` | 5762 bytes; original checkout |
| `5519` | `ureshino-basics` | `.cache/curriculum-source/5519.txt` | 6457 bytes; original checkout |
| `5546` | `ureshino-vs-bougin` | `.cache/curriculum-source/5546.txt` | 8315 bytes; original checkout |
| `5571` | `ureshino-new` | `.cache/curriculum-source/5571.txt` | 4659 bytes; original checkout |
| `5584` | `ureshino-vs-shiken` | `.cache/curriculum-source/5584.txt` | 8576 bytes; original checkout |
| `5608` | `ureshino-basics` | `.cache/curriculum-source/5608.txt` | 5016 bytes; original checkout |
| `5619` | `gokigen-attack` | `.cache/curriculum-source/5619.txt` | 6657 bytes; original checkout |
| `5845` | `gangi` | `.cache/curriculum-source/5845.txt` | 9977 bytes; original checkout |
| `5873` | `aigakari-basics` | `.cache/curriculum-source/5873.txt` | 5545 bytes; original checkout |
| `5896` | `gangi` | `.cache/curriculum-source/5896.txt` | 8994 bytes; original checkout |
| `5928` | `yagura-suzume` | `.cache/curriculum-source/5928.txt` | 9978 bytes; original checkout |
| `5958` | `castles-yagura` | `.cache/curriculum-source/5958.txt` | 9067 bytes; original checkout |
| `5985` | `castles-mino` | `.cache/curriculum-source/5985.txt` | 8183 bytes; original checkout |
| `6007` | `castles-hidarimino` | `.cache/curriculum-source/6007.txt` | 7318 bytes; original checkout |
| `6021` | `castles-anaguma` | `.cache/curriculum-source/6021.txt` | 6700 bytes; original checkout |
| `6044` | `castles-funa` | `.cache/curriculum-source/6044.txt` | 6831 bytes; original checkout |
| `6053` | `castles-aifuri` | `.cache/curriculum-source/6053.txt` | 4246 bytes; original checkout |
| `6062` | `castles-nakazumai` | `.cache/curriculum-source/6062.txt` | 3400 bytes; original checkout |
| `6068` | `castles-first` | `.cache/curriculum-source/6068.txt` | 7235 bytes; original checkout |
| `6076` | `castles-other` | `.cache/curriculum-source/6076.txt` | 3493 bytes; original checkout |
| `6154` | `aifuri-hidari-anaguma` | `.cache/curriculum-source/6154.txt` | 6711 bytes; original checkout |
| `6174` | `gokigen-vs-anaguma` | `.cache/curriculum-source/6174.txt` | 8127 bytes; original checkout |
| `6200` | `ishida-basics` | `.cache/curriculum-source/6200.txt` | 9443 bytes; original checkout |
| `6436` | `ishida-honkumi` | `.cache/curriculum-source/6436.txt` | 7482 bytes; original checkout |
| `6460` | `ishida-attack` | `.cache/curriculum-source/6460.txt` | 7855 bytes; original checkout |
| `6496` | `yokofu-avoid` | `.cache/curriculum-source/6496.txt` | 6901 bytes; original checkout |
| `6514` | `gokigen-vs-chousoku` | `.cache/curriculum-source/6514.txt` | 10657 bytes; original checkout |
| `6540` | `bougin-castles` | `.cache/curriculum-source/6540.txt` | 4223 bytes; original checkout |
| `6549` | `bougin-vs-furibisha` | `.cache/curriculum-source/6549.txt` | 6618 bytes; original checkout |
| `6566` | `gokigen-castles` | `.cache/curriculum-source/6566.txt` | 4667 bytes; original checkout |
| `6593` | `nakabisha-sente` | `.cache/curriculum-source/6593.txt` | 6577 bytes; original checkout |
| `6645` | `kakugawari-hayakuri` | `.cache/curriculum-source/6645.txt` | 9333 bytes; original checkout |
| `6677` | `kakugawari-koshikake` | `.cache/curriculum-source/6677.txt` | 12426 bytes; original checkout |
| `6704` | `kakugawari-45kei` | `.cache/curriculum-source/6704.txt` | 9968 bytes; original checkout |
| `6736` | `kakugawari-koshikake` | `.cache/curriculum-source/6736.txt` | 7982 bytes; original checkout |
| `6765` | `kakugawari-ittezon` | `.cache/curriculum-source/6765.txt` | 8213 bytes; original checkout |
| `6814` | `ishida-43` | `.cache/curriculum-source/6814.txt` | 10477 bytes; original checkout |
| `6896` | `sanken-basics` | `.cache/curriculum-source/6896.txt` | 7310 bytes; original checkout |
| `6934` | `sanken-vs-bougin` | `.cache/curriculum-source/6934.txt` | 8157 bytes; original checkout |
| `6970` | `sanken-tomahawk` | `.cache/curriculum-source/6970.txt` | 7805 bytes; original checkout |
| `7031` | `yokofu-23fu` | `.cache/curriculum-source/7031.txt` | 10175 bytes; original checkout |
| `7071` | `aiyokofu` | `.cache/curriculum-source/7071.txt` | 9376 bytes; original checkout |
| `7105` | `yokofu-85hisha` | `.cache/curriculum-source/7105.txt` | 10429 bytes; original checkout |
| `7137` | `yokofu-yuuki` | `.cache/curriculum-source/7137.txt` | 8220 bytes; original checkout |
| `7182` | `aigakari-bougin` | `.cache/curriculum-source/7182.txt` | 7188 bytes; original checkout |
| `7205` | `hineribisha` | `.cache/curriculum-source/7205.txt` | 9154 bytes; original checkout |
| `7230` | `ibisha-basics` | `.cache/curriculum-source/7230.txt` | 8137 bytes; original checkout |
| `7238` | `taifuri-basics` | `.cache/curriculum-source/7238.txt` | 8581 bytes; original checkout |
| `7254` | `taifuri-bougin` | `.cache/curriculum-source/7254.txt` | 8315 bytes; original checkout |
| `7282` | `taifuri-46gin` | `.cache/curriculum-source/7282.txt` | 11831 bytes; original checkout |
| `7339` | `taifuri-anaguma` | `.cache/curriculum-source/7339.txt` | 11226 bytes; original checkout |
| `7368` | `endgame-tsumero` | `.cache/curriculum-source/7368.txt` | 7295 bytes; original checkout |
| `7418` | `fujii-vs-anaguma` | `.cache/curriculum-source/7418.txt` | 10016 bytes; original checkout |
| `7420` | `fujii-build` | `.cache/curriculum-source/7420.txt` | 10223 bytes; original checkout |
| `7495` | `fujii-vs-hidarimino` | `.cache/curriculum-source/7495.txt` | 10062 bytes; original checkout |
| `7513` | `fujii-vs-kyusen` | `.cache/curriculum-source/7513.txt` | 6732 bytes; original checkout |
| `7605` | `kakukoukan-gyakubougin` | `.cache/curriculum-source/7605.txt` | 11858 bytes; original checkout |
| `7645` | `direct-mukai` | `.cache/curriculum-source/7645.txt` | 12159 bytes; original checkout |
| `7700` | `legspe` | `.cache/curriculum-source/7700.txt` | 6277 bytes; original checkout |
| `7747` | `yagura-aiyagura` | `.cache/curriculum-source/7747.txt` | 10756 bytes; original checkout |
| `7819` | `yagura-waki` | `.cache/curriculum-source/7819.txt` | 9389 bytes; original checkout |
| `7863` | `taifuri-chousoku` | `.cache/curriculum-source/7863.txt` | 13362 bytes; original checkout |
| `7936` | `taifuri-elmo` | `.cache/curriculum-source/7936.txt` | 8335 bytes; original checkout |
| `7962` | `taifuri-vs-hayaishida` | `.cache/curriculum-source/7962.txt` | 7577 bytes; original checkout |
| `7988` | `taifuri-millennium` | `.cache/curriculum-source/7988.txt` | 6099 bytes; original checkout |
| `8008` | `taifuri-ponpon` | `.cache/curriculum-source/8008.txt` | 7063 bytes; original checkout |
| `8037` | `mukai-build` | `.cache/curriculum-source/8037.txt` | 3828 bytes; original checkout |
| `8048` | `mukai-attack` | `.cache/curriculum-source/8048.txt` | 6858 bytes; original checkout |
| `8083` | `rules-setup` | `.cache/curriculum-source/8083.txt` | 18627 bytes; original checkout |
| `8322` | `proverb-three-pawns` | `.cache/curriculum-source/8322.txt` | 7115 bytes; original checkout |

## Original checkout figure/topic inputs and generated lesson outputs

Source snapshot: original checkout at base commit `4ed7ce0defec7f426ced8409f906b43ee81c5586`. These files are inventoried as source material that the refreshed audit branch reorganizes; they are not target-branch outputs. The original figure directory has 156 JSON files: 155 mapped to the plan, plus the unplanned `6808.json` extraction. Four planned IDs have no figure JSON: `386`, `1127`, `1512`, and `8083`.

| Study ID | Extracted figure source | Original generated lesson | Original practice output |
|---:|---|---|---|
| `19` | `data/lessons/figures/19.json` (14384 bytes; present) | `src/data/lessons/19.json` (32132 bytes; present) | `src/data/lessons/19-practice.json` (missing) |
| `109` | `data/lessons/figures/109.json` (17180 bytes; present) | `src/data/lessons/109.json` (32771 bytes; present) | `src/data/lessons/109-practice.json` (missing) |
| `362` | `data/lessons/figures/362.json` (15271 bytes; present) | `src/data/lessons/362.json` (25023 bytes; present) | `src/data/lessons/362-practice.json` (missing) |
| `386` | `data/lessons/figures/386.json` (missing) | `src/data/lessons/386.json` (2077 bytes; present) | `src/data/lessons/386-practice.json` (missing) |
| `580` | `data/lessons/figures/580.json` (8759 bytes; present) | `src/data/lessons/580.json` (17176 bytes; present) | `src/data/lessons/580-practice.json` (missing) |
| `615` | `data/lessons/figures/615.json` (14376 bytes; present) | `src/data/lessons/615.json` (19798 bytes; present) | `src/data/lessons/615-practice.json` (8376 bytes; present) |
| `656` | `data/lessons/figures/656.json` (7124 bytes; present) | `src/data/lessons/656.json` (14025 bytes; present) | `src/data/lessons/656-practice.json` (2161 bytes; present) |
| `722` | `data/lessons/figures/722.json` (11676 bytes; present) | `src/data/lessons/722.json` (17682 bytes; present) | `src/data/lessons/722-practice.json` (3919 bytes; present) |
| `738` | `data/lessons/figures/738.json` (7436 bytes; present) | `src/data/lessons/738.json` (12645 bytes; present) | `src/data/lessons/738-practice.json` (2621 bytes; present) |
| `746` | `data/lessons/figures/746.json` (6097 bytes; present) | `src/data/lessons/746.json` (10409 bytes; present) | `src/data/lessons/746-practice.json` (missing) |
| `758` | `data/lessons/figures/758.json` (3745 bytes; present) | `src/data/lessons/758.json` (7614 bytes; present) | `src/data/lessons/758-practice.json` (missing) |
| `777` | `data/lessons/figures/777.json` (21096 bytes; present) | `src/data/lessons/777.json` (28245 bytes; present) | `src/data/lessons/777-practice.json` (missing) |
| `813` | `data/lessons/figures/813.json` (6973 bytes; present) | `src/data/lessons/813.json` (11281 bytes; present) | `src/data/lessons/813-practice.json` (missing) |
| `829` | `data/lessons/figures/829.json` (20989 bytes; present) | `src/data/lessons/829.json` (36408 bytes; present) | `src/data/lessons/829-practice.json` (4087 bytes; present) |
| `875` | `data/lessons/figures/875.json` (23375 bytes; present) | `src/data/lessons/875.json` (44260 bytes; present) | `src/data/lessons/875-practice.json` (missing) |
| `932` | `data/lessons/figures/932.json` (10765 bytes; present) | `src/data/lessons/932.json` (20210 bytes; present) | `src/data/lessons/932-practice.json` (missing) |
| `974` | `data/lessons/figures/974.json` (15516 bytes; present) | `src/data/lessons/974.json` (26957 bytes; present) | `src/data/lessons/974-practice.json` (missing) |
| `1001` | `data/lessons/figures/1001.json` (18638 bytes; present) | `src/data/lessons/1001.json` (32027 bytes; present) | `src/data/lessons/1001-practice.json` (missing) |
| `1021` | `data/lessons/figures/1021.json` (11986 bytes; present) | `src/data/lessons/1021.json` (22979 bytes; present) | `src/data/lessons/1021-practice.json` (missing) |
| `1067` | `data/lessons/figures/1067.json` (6613 bytes; present) | `src/data/lessons/1067.json` (14675 bytes; present) | `src/data/lessons/1067-practice.json` (1205 bytes; present) |
| `1070` | `data/lessons/figures/1070.json` (20730 bytes; present) | `src/data/lessons/1070.json` (32568 bytes; present) | `src/data/lessons/1070-practice.json` (missing) |
| `1106` | `data/lessons/figures/1106.json` (1661 bytes; present) | `src/data/lessons/1106.json` (5257 bytes; present) | `src/data/lessons/1106-practice.json` (missing) |
| `1127` | `data/lessons/figures/1127.json` (missing) | `src/data/lessons/1127.json` (2306 bytes; present) | `src/data/lessons/1127-practice.json` (missing) |
| `1137` | `data/lessons/figures/1137.json` (5990 bytes; present) | `src/data/lessons/1137.json` (11091 bytes; present) | `src/data/lessons/1137-practice.json` (missing) |
| `1247` | `data/lessons/figures/1247.json` (14761 bytes; present) | `src/data/lessons/1247.json` (23360 bytes; present) | `src/data/lessons/1247-practice.json` (5720 bytes; present) |
| `1313` | `data/lessons/figures/1313.json` (15635 bytes; present) | `src/data/lessons/1313.json` (28984 bytes; present) | `src/data/lessons/1313-practice.json` (1744 bytes; present) |
| `1331` | `data/lessons/figures/1331.json` (18836 bytes; present) | `src/data/lessons/1331.json` (31791 bytes; present) | `src/data/lessons/1331-practice.json` (1226 bytes; present) |
| `1486` | `data/lessons/figures/1486.json` (14570 bytes; present) | `src/data/lessons/1486.json` (25485 bytes; present) | `src/data/lessons/1486-practice.json` (1908 bytes; present) |
| `1512` | `data/lessons/figures/1512.json` (missing) | `src/data/lessons/1512.json` (2190 bytes; present) | `src/data/lessons/1512-practice.json` (missing) |
| `1516` | `data/lessons/figures/1516.json` (15700 bytes; present) | `src/data/lessons/1516.json` (27722 bytes; present) | `src/data/lessons/1516-practice.json` (1270 bytes; present) |
| `1541` | `data/lessons/figures/1541.json` (16867 bytes; present) | `src/data/lessons/1541.json` (29548 bytes; present) | `src/data/lessons/1541-practice.json` (1839 bytes; present) |
| `1586` | `data/lessons/figures/1586.json` (18096 bytes; present) | `src/data/lessons/1586.json` (31718 bytes; present) | `src/data/lessons/1586-practice.json` (1742 bytes; present) |
| `1629` | `data/lessons/figures/1629.json` (25242 bytes; present) | `src/data/lessons/1629.json` (41846 bytes; present) | `src/data/lessons/1629-practice.json` (2691 bytes; present) |
| `1699` | `data/lessons/figures/1699.json` (26810 bytes; present) | `src/data/lessons/1699.json` (42048 bytes; present) | `src/data/lessons/1699-practice.json` (missing) |
| `1741` | `data/lessons/figures/1741.json` (19705 bytes; present) | `src/data/lessons/1741.json` (30551 bytes; present) | `src/data/lessons/1741-practice.json` (missing) |
| `1783` | `data/lessons/figures/1783.json` (19827 bytes; present) | `src/data/lessons/1783.json` (39870 bytes; present) | `src/data/lessons/1783-practice.json` (2719 bytes; present) |
| `1821` | `data/lessons/figures/1821.json` (18320 bytes; present) | `src/data/lessons/1821.json` (34333 bytes; present) | `src/data/lessons/1821-practice.json` (missing) |
| `1852` | `data/lessons/figures/1852.json` (24168 bytes; present) | `src/data/lessons/1852.json` (37489 bytes; present) | `src/data/lessons/1852-practice.json` (6271 bytes; present) |
| `1854` | `data/lessons/figures/1854.json` (28209 bytes; present) | `src/data/lessons/1854.json` (55079 bytes; present) | `src/data/lessons/1854-practice.json` (missing) |
| `2105` | `data/lessons/figures/2105.json` (27616 bytes; present) | `src/data/lessons/2105.json` (48855 bytes; present) | `src/data/lessons/2105-practice.json` (missing) |
| `2204` | `data/lessons/figures/2204.json` (20483 bytes; present) | `src/data/lessons/2204.json` (37768 bytes; present) | `src/data/lessons/2204-practice.json` (7057 bytes; present) |
| `2276` | `data/lessons/figures/2276.json` (19607 bytes; present) | `src/data/lessons/2276.json` (33182 bytes; present) | `src/data/lessons/2276-practice.json` (missing) |
| `2313` | `data/lessons/figures/2313.json` (21569 bytes; present) | `src/data/lessons/2313.json` (43303 bytes; present) | `src/data/lessons/2313-practice.json` (missing) |
| `2375` | `data/lessons/figures/2375.json` (16563 bytes; present) | `src/data/lessons/2375.json` (36147 bytes; present) | `src/data/lessons/2375-practice.json` (missing) |
| `2418` | `data/lessons/figures/2418.json` (6546 bytes; present) | `src/data/lessons/2418.json` (13654 bytes; present) | `src/data/lessons/2418-practice.json` (missing) |
| `2426` | `data/lessons/figures/2426.json` (15236 bytes; present) | `src/data/lessons/2426.json` (21627 bytes; present) | `src/data/lessons/2426-practice.json` (5673 bytes; present) |
| `2472` | `data/lessons/figures/2472.json` (9537 bytes; present) | `src/data/lessons/2472.json` (18892 bytes; present) | `src/data/lessons/2472-practice.json` (5550 bytes; present) |
| `2491` | `data/lessons/figures/2491.json` (13304 bytes; present) | `src/data/lessons/2491.json` (25973 bytes; present) | `src/data/lessons/2491-practice.json` (missing) |
| `2519` | `data/lessons/figures/2519.json` (13784 bytes; present) | `src/data/lessons/2519.json` (25454 bytes; present) | `src/data/lessons/2519-practice.json` (5234 bytes; present) |
| `2556` | `data/lessons/figures/2556.json` (22910 bytes; present) | `src/data/lessons/2556.json` (34223 bytes; present) | `src/data/lessons/2556-practice.json` (missing) |
| `2590` | `data/lessons/figures/2590.json` (12838 bytes; present) | `src/data/lessons/2590.json` (23433 bytes; present) | `src/data/lessons/2590-practice.json` (missing) |
| `2615` | `data/lessons/figures/2615.json` (15979 bytes; present) | `src/data/lessons/2615.json` (27113 bytes; present) | `src/data/lessons/2615-practice.json` (8776 bytes; present) |
| `2646` | `data/lessons/figures/2646.json` (18669 bytes; present) | `src/data/lessons/2646.json` (31527 bytes; present) | `src/data/lessons/2646-practice.json` (8910 bytes; present) |
| `2676` | `data/lessons/figures/2676.json` (17713 bytes; present) | `src/data/lessons/2676.json` (32624 bytes; present) | `src/data/lessons/2676-practice.json` (missing) |
| `2695` | `data/lessons/figures/2695.json` (15646 bytes; present) | `src/data/lessons/2695.json` (24025 bytes; present) | `src/data/lessons/2695-practice.json` (missing) |
| `2744` | `data/lessons/figures/2744.json` (22313 bytes; present) | `src/data/lessons/2744.json` (32398 bytes; present) | `src/data/lessons/2744-practice.json` (missing) |
| `2807` | `data/lessons/figures/2807.json` (17211 bytes; present) | `src/data/lessons/2807.json` (27494 bytes; present) | `src/data/lessons/2807-practice.json` (4010 bytes; present) |
| `2840` | `data/lessons/figures/2840.json` (11737 bytes; present) | `src/data/lessons/2840.json` (22870 bytes; present) | `src/data/lessons/2840-practice.json` (2979 bytes; present) |
| `2865` | `data/lessons/figures/2865.json` (21143 bytes; present) | `src/data/lessons/2865.json` (35881 bytes; present) | `src/data/lessons/2865-practice.json` (4228 bytes; present) |
| `2911` | `data/lessons/figures/2911.json` (12023 bytes; present) | `src/data/lessons/2911.json` (23676 bytes; present) | `src/data/lessons/2911-practice.json` (missing) |
| `2947` | `data/lessons/figures/2947.json` (29625 bytes; present) | `src/data/lessons/2947.json` (52685 bytes; present) | `src/data/lessons/2947-practice.json` (4390 bytes; present) |
| `3014` | `data/lessons/figures/3014.json` (17134 bytes; present) | `src/data/lessons/3014.json` (29147 bytes; present) | `src/data/lessons/3014-practice.json` (missing) |
| `3048` | `data/lessons/figures/3048.json` (19424 bytes; present) | `src/data/lessons/3048.json` (36216 bytes; present) | `src/data/lessons/3048-practice.json` (missing) |
| `3156` | `data/lessons/figures/3156.json` (18699 bytes; present) | `src/data/lessons/3156.json` (29568 bytes; present) | `src/data/lessons/3156-practice.json` (missing) |
| `3198` | `data/lessons/figures/3198.json` (18205 bytes; present) | `src/data/lessons/3198.json` (31689 bytes; present) | `src/data/lessons/3198-practice.json` (missing) |
| `3239` | `data/lessons/figures/3239.json` (10463 bytes; present) | `src/data/lessons/3239.json` (21316 bytes; present) | `src/data/lessons/3239-practice.json` (missing) |
| `3271` | `data/lessons/figures/3271.json` (10119 bytes; present) | `src/data/lessons/3271.json` (22860 bytes; present) | `src/data/lessons/3271-practice.json` (missing) |
| `3457` | `data/lessons/figures/3457.json` (4312 bytes; present) | `src/data/lessons/3457.json` (10174 bytes; present) | `src/data/lessons/3457-practice.json` (9072 bytes; present) |
| `3497` | `data/lessons/figures/3497.json` (19317 bytes; present) | `src/data/lessons/3497.json` (29299 bytes; present) | `src/data/lessons/3497-practice.json` (missing) |
| `3783` | `data/lessons/figures/3783.json` (11595 bytes; present) | `src/data/lessons/3783.json` (20120 bytes; present) | `src/data/lessons/3783-practice.json` (4474 bytes; present) |
| `3826` | `data/lessons/figures/3826.json` (18877 bytes; present) | `src/data/lessons/3826.json` (35039 bytes; present) | `src/data/lessons/3826-practice.json` (7373 bytes; present) |
| `4314` | `data/lessons/figures/4314.json` (17423 bytes; present) | `src/data/lessons/4314.json` (29529 bytes; present) | `src/data/lessons/4314-practice.json` (6867 bytes; present) |
| `4502` | `data/lessons/figures/4502.json` (23503 bytes; present) | `src/data/lessons/4502.json` (34892 bytes; present) | `src/data/lessons/4502-practice.json` (7606 bytes; present) |
| `4633` | `data/lessons/figures/4633.json` (17647 bytes; present) | `src/data/lessons/4633.json` (37955 bytes; present) | `src/data/lessons/4633-practice.json` (missing) |
| `4717` | `data/lessons/figures/4717.json` (20452 bytes; present) | `src/data/lessons/4717.json` (33163 bytes; present) | `src/data/lessons/4717-practice.json` (missing) |
| `4747` | `data/lessons/figures/4747.json` (21574 bytes; present) | `src/data/lessons/4747.json` (30613 bytes; present) | `src/data/lessons/4747-practice.json` (5941 bytes; present) |
| `4779` | `data/lessons/figures/4779.json` (18198 bytes; present) | `src/data/lessons/4779.json` (28745 bytes; present) | `src/data/lessons/4779-practice.json` (4159 bytes; present) |
| `4815` | `data/lessons/figures/4815.json` (21372 bytes; present) | `src/data/lessons/4815.json` (28326 bytes; present) | `src/data/lessons/4815-practice.json` (6785 bytes; present) |
| `4848` | `data/lessons/figures/4848.json` (16695 bytes; present) | `src/data/lessons/4848.json` (26734 bytes; present) | `src/data/lessons/4848-practice.json` (9612 bytes; present) |
| `4878` | `data/lessons/figures/4878.json` (9627 bytes; present) | `src/data/lessons/4878.json` (18607 bytes; present) | `src/data/lessons/4878-practice.json` (4408 bytes; present) |
| `4917` | `data/lessons/figures/4917.json` (16720 bytes; present) | `src/data/lessons/4917.json` (25604 bytes; present) | `src/data/lessons/4917-practice.json` (4428 bytes; present) |
| `4961` | `data/lessons/figures/4961.json` (20907 bytes; present) | `src/data/lessons/4961.json` (32988 bytes; present) | `src/data/lessons/4961-practice.json` (missing) |
| `5001` | `data/lessons/figures/5001.json` (14920 bytes; present) | `src/data/lessons/5001.json` (27331 bytes; present) | `src/data/lessons/5001-practice.json` (missing) |
| `5040` | `data/lessons/figures/5040.json` (14611 bytes; present) | `src/data/lessons/5040.json` (23878 bytes; present) | `src/data/lessons/5040-practice.json` (3548 bytes; present) |
| `5256` | `data/lessons/figures/5256.json` (13485 bytes; present) | `src/data/lessons/5256.json` (21243 bytes; present) | `src/data/lessons/5256-practice.json` (4424 bytes; present) |
| `5283` | `data/lessons/figures/5283.json` (14004 bytes; present) | `src/data/lessons/5283.json` (21334 bytes; present) | `src/data/lessons/5283-practice.json` (missing) |
| `5325` | `data/lessons/figures/5325.json` (16404 bytes; present) | `src/data/lessons/5325.json` (32008 bytes; present) | `src/data/lessons/5325-practice.json` (missing) |
| `5361` | `data/lessons/figures/5361.json` (16829 bytes; present) | `src/data/lessons/5361.json` (29344 bytes; present) | `src/data/lessons/5361-practice.json` (missing) |
| `5461` | `data/lessons/figures/5461.json` (13364 bytes; present) | `src/data/lessons/5461.json` (21213 bytes; present) | `src/data/lessons/5461-practice.json` (missing) |
| `5499` | `data/lessons/figures/5499.json` (10553 bytes; present) | `src/data/lessons/5499.json` (18883 bytes; present) | `src/data/lessons/5499-practice.json` (missing) |
| `5519` | `data/lessons/figures/5519.json` (10758 bytes; present) | `src/data/lessons/5519.json` (15733 bytes; present) | `src/data/lessons/5519-practice.json` (7214 bytes; present) |
| `5546` | `data/lessons/figures/5546.json` (14742 bytes; present) | `src/data/lessons/5546.json` (25004 bytes; present) | `src/data/lessons/5546-practice.json` (missing) |
| `5571` | `data/lessons/figures/5571.json` (9251 bytes; present) | `src/data/lessons/5571.json` (14885 bytes; present) | `src/data/lessons/5571-practice.json` (4167 bytes; present) |
| `5584` | `data/lessons/figures/5584.json` (16303 bytes; present) | `src/data/lessons/5584.json` (26071 bytes; present) | `src/data/lessons/5584-practice.json` (missing) |
| `5608` | `data/lessons/figures/5608.json` (5579 bytes; present) | `src/data/lessons/5608.json` (10457 bytes; present) | `src/data/lessons/5608-practice.json` (7167 bytes; present) |
| `5619` | `data/lessons/figures/5619.json` (10077 bytes; present) | `src/data/lessons/5619.json` (14469 bytes; present) | `src/data/lessons/5619-practice.json` (missing) |
| `5845` | `data/lessons/figures/5845.json` (12121 bytes; present) | `src/data/lessons/5845.json` (22429 bytes; present) | `src/data/lessons/5845-practice.json` (5609 bytes; present) |
| `5873` | `data/lessons/figures/5873.json` (11331 bytes; present) | `src/data/lessons/5873.json` (18780 bytes; present) | `src/data/lessons/5873-practice.json` (3525 bytes; present) |
| `5896` | `data/lessons/figures/5896.json` (13994 bytes; present) | `src/data/lessons/5896.json` (25387 bytes; present) | `src/data/lessons/5896-practice.json` (7442 bytes; present) |
| `5928` | `data/lessons/figures/5928.json` (16127 bytes; present) | `src/data/lessons/5928.json` (24280 bytes; present) | `src/data/lessons/5928-practice.json` (11142 bytes; present) |
| `5958` | `data/lessons/figures/5958.json` (15864 bytes; present) | `src/data/lessons/5958.json` (34136 bytes; present) | `src/data/lessons/5958-practice.json` (missing) |
| `5985` | `data/lessons/figures/5985.json` (12780 bytes; present) | `src/data/lessons/5985.json` (25600 bytes; present) | `src/data/lessons/5985-practice.json` (missing) |
| `6007` | `data/lessons/figures/6007.json` (12203 bytes; present) | `src/data/lessons/6007.json` (25049 bytes; present) | `src/data/lessons/6007-practice.json` (missing) |
| `6021` | `data/lessons/figures/6021.json` (11191 bytes; present) | `src/data/lessons/6021.json` (23155 bytes; present) | `src/data/lessons/6021-practice.json` (missing) |
| `6044` | `data/lessons/figures/6044.json` (7089 bytes; present) | `src/data/lessons/6044.json` (15453 bytes; present) | `src/data/lessons/6044-practice.json` (missing) |
| `6053` | `data/lessons/figures/6053.json` (5330 bytes; present) | `src/data/lessons/6053.json` (12829 bytes; present) | `src/data/lessons/6053-practice.json` (missing) |
| `6062` | `data/lessons/figures/6062.json` (4438 bytes; present) | `src/data/lessons/6062.json` (10537 bytes; present) | `src/data/lessons/6062-practice.json` (missing) |
| `6068` | `data/lessons/figures/6068.json` (10211 bytes; present) | `src/data/lessons/6068.json` (21138 bytes; present) | `src/data/lessons/6068-practice.json` (missing) |
| `6076` | `data/lessons/figures/6076.json` (5664 bytes; present) | `src/data/lessons/6076.json` (13587 bytes; present) | `src/data/lessons/6076-practice.json` (missing) |
| `6154` | `data/lessons/figures/6154.json` (11034 bytes; present) | `src/data/lessons/6154.json` (17000 bytes; present) | `src/data/lessons/6154-practice.json` (missing) |
| `6174` | `data/lessons/figures/6174.json` (13400 bytes; present) | `src/data/lessons/6174.json` (21364 bytes; present) | `src/data/lessons/6174-practice.json` (missing) |
| `6200` | `data/lessons/figures/6200.json` (15889 bytes; present) | `src/data/lessons/6200.json` (26199 bytes; present) | `src/data/lessons/6200-practice.json` (3151 bytes; present) |
| `6436` | `data/lessons/figures/6436.json` (12038 bytes; present) | `src/data/lessons/6436.json` (19165 bytes; present) | `src/data/lessons/6436-practice.json` (7767 bytes; present) |
| `6460` | `data/lessons/figures/6460.json` (14711 bytes; present) | `src/data/lessons/6460.json` (25656 bytes; present) | `src/data/lessons/6460-practice.json` (9949 bytes; present) |
| `6496` | `data/lessons/figures/6496.json` (12773 bytes; present) | `src/data/lessons/6496.json` (24409 bytes; present) | `src/data/lessons/6496-practice.json` (2755 bytes; present) |
| `6514` | `data/lessons/figures/6514.json` (19747 bytes; present) | `src/data/lessons/6514.json` (28439 bytes; present) | `src/data/lessons/6514-practice.json` (missing) |
| `6540` | `data/lessons/figures/6540.json` (4491 bytes; present) | `src/data/lessons/6540.json` (10908 bytes; present) | `src/data/lessons/6540-practice.json` (missing) |
| `6549` | `data/lessons/figures/6549.json` (10481 bytes; present) | `src/data/lessons/6549.json` (17717 bytes; present) | `src/data/lessons/6549-practice.json` (missing) |
| `6566` | `data/lessons/figures/6566.json` (6637 bytes; present) | `src/data/lessons/6566.json` (14049 bytes; present) | `src/data/lessons/6566-practice.json` (missing) |
| `6593` | `data/lessons/figures/6593.json` (11564 bytes; present) | `src/data/lessons/6593.json` (18761 bytes; present) | `src/data/lessons/6593-practice.json` (3219 bytes; present) |
| `6645` | `data/lessons/figures/6645.json` (15307 bytes; present) | `src/data/lessons/6645.json` (24739 bytes; present) | `src/data/lessons/6645-practice.json` (missing) |
| `6677` | `data/lessons/figures/6677.json` (21299 bytes; present) | `src/data/lessons/6677.json` (28996 bytes; present) | `src/data/lessons/6677-practice.json` (15262 bytes; present) |
| `6704` | `data/lessons/figures/6704.json` (16209 bytes; present) | `src/data/lessons/6704.json` (26187 bytes; present) | `src/data/lessons/6704-practice.json` (8753 bytes; present) |
| `6736` | `data/lessons/figures/6736.json` (12160 bytes; present) | `src/data/lessons/6736.json` (21274 bytes; present) | `src/data/lessons/6736-practice.json` (8743 bytes; present) |
| `6765` | `data/lessons/figures/6765.json` (15159 bytes; present) | `src/data/lessons/6765.json` (28302 bytes; present) | `src/data/lessons/6765-practice.json` (3762 bytes; present) |
| `6814` | `data/lessons/figures/6814.json` (19515 bytes; present) | `src/data/lessons/6814.json` (32964 bytes; present) | `src/data/lessons/6814-practice.json` (4490 bytes; present) |
| `6896` | `data/lessons/figures/6896.json` (12240 bytes; present) | `src/data/lessons/6896.json` (19526 bytes; present) | `src/data/lessons/6896-practice.json` (3165 bytes; present) |
| `6934` | `data/lessons/figures/6934.json` (14022 bytes; present) | `src/data/lessons/6934.json` (20979 bytes; present) | `src/data/lessons/6934-practice.json` (6118 bytes; present) |
| `6970` | `data/lessons/figures/6970.json` (11764 bytes; present) | `src/data/lessons/6970.json` (16899 bytes; present) | `src/data/lessons/6970-practice.json` (8290 bytes; present) |
| `7031` | `data/lessons/figures/7031.json` (18578 bytes; present) | `src/data/lessons/7031.json` (28569 bytes; present) | `src/data/lessons/7031-practice.json` (5761 bytes; present) |
| `7071` | `data/lessons/figures/7071.json` (16046 bytes; present) | `src/data/lessons/7071.json` (24940 bytes; present) | `src/data/lessons/7071-practice.json` (5919 bytes; present) |
| `7105` | `data/lessons/figures/7105.json` (16800 bytes; present) | `src/data/lessons/7105.json` (24993 bytes; present) | `src/data/lessons/7105-practice.json` (6965 bytes; present) |
| `7137` | `data/lessons/figures/7137.json` (12351 bytes; present) | `src/data/lessons/7137.json` (19909 bytes; present) | `src/data/lessons/7137-practice.json` (6438 bytes; present) |
| `7182` | `data/lessons/figures/7182.json` (11774 bytes; present) | `src/data/lessons/7182.json` (19414 bytes; present) | `src/data/lessons/7182-practice.json` (5593 bytes; present) |
| `7205` | `data/lessons/figures/7205.json` (16781 bytes; present) | `src/data/lessons/7205.json` (23990 bytes; present) | `src/data/lessons/7205-practice.json` (8986 bytes; present) |
| `7230` | `data/lessons/figures/7230.json` (2516 bytes; present) | `src/data/lessons/7230.json` (6778 bytes; present) | `src/data/lessons/7230-practice.json` (missing) |
| `7238` | `data/lessons/figures/7238.json` (16228 bytes; present) | `src/data/lessons/7238.json` (23667 bytes; present) | `src/data/lessons/7238-practice.json` (missing) |
| `7254` | `data/lessons/figures/7254.json` (14734 bytes; present) | `src/data/lessons/7254.json` (23364 bytes; present) | `src/data/lessons/7254-practice.json` (missing) |
| `7282` | `data/lessons/figures/7282.json` (21754 bytes; present) | `src/data/lessons/7282.json` (31206 bytes; present) | `src/data/lessons/7282-practice.json` (missing) |
| `7339` | `data/lessons/figures/7339.json` (18148 bytes; present) | `src/data/lessons/7339.json` (31039 bytes; present) | `src/data/lessons/7339-practice.json` (missing) |
| `7368` | `data/lessons/figures/7368.json` (11938 bytes; present) | `src/data/lessons/7368.json` (20205 bytes; present) | `src/data/lessons/7368-practice.json` (missing) |
| `7418` | `data/lessons/figures/7418.json` (19077 bytes; present) | `src/data/lessons/7418.json` (27174 bytes; present) | `src/data/lessons/7418-practice.json` (missing) |
| `7420` | `data/lessons/figures/7420.json` (11238 bytes; present) | `src/data/lessons/7420.json` (17960 bytes; present) | `src/data/lessons/7420-practice.json` (5011 bytes; present) |
| `7495` | `data/lessons/figures/7495.json` (20103 bytes; present) | `src/data/lessons/7495.json` (27364 bytes; present) | `src/data/lessons/7495-practice.json` (missing) |
| `7513` | `data/lessons/figures/7513.json` (10862 bytes; present) | `src/data/lessons/7513.json` (15476 bytes; present) | `src/data/lessons/7513-practice.json` (missing) |
| `7605` | `data/lessons/figures/7605.json` (23907 bytes; present) | `src/data/lessons/7605.json` (36736 bytes; present) | `src/data/lessons/7605-practice.json` (6690 bytes; present) |
| `7645` | `data/lessons/figures/7645.json` (22952 bytes; present) | `src/data/lessons/7645.json` (35146 bytes; present) | `src/data/lessons/7645-practice.json` (5235 bytes; present) |
| `7700` | `data/lessons/figures/7700.json` (12559 bytes; present) | `src/data/lessons/7700.json` (20251 bytes; present) | `src/data/lessons/7700-practice.json` (9860 bytes; present) |
| `7747` | `data/lessons/figures/7747.json` (18382 bytes; present) | `src/data/lessons/7747.json` (30732 bytes; present) | `src/data/lessons/7747-practice.json` (6324 bytes; present) |
| `7819` | `data/lessons/figures/7819.json` (16065 bytes; present) | `src/data/lessons/7819.json` (25543 bytes; present) | `src/data/lessons/7819-practice.json` (6850 bytes; present) |
| `7863` | `data/lessons/figures/7863.json` (24138 bytes; present) | `src/data/lessons/7863.json` (42009 bytes; present) | `src/data/lessons/7863-practice.json` (8406 bytes; present) |
| `7936` | `data/lessons/figures/7936.json` (11881 bytes; present) | `src/data/lessons/7936.json` (19716 bytes; present) | `src/data/lessons/7936-practice.json` (6442 bytes; present) |
| `7962` | `data/lessons/figures/7962.json` (14520 bytes; present) | `src/data/lessons/7962.json` (21347 bytes; present) | `src/data/lessons/7962-practice.json` (5355 bytes; present) |
| `7988` | `data/lessons/figures/7988.json` (10103 bytes; present) | `src/data/lessons/7988.json` (16430 bytes; present) | `src/data/lessons/7988-practice.json` (8451 bytes; present) |
| `8008` | `data/lessons/figures/8008.json` (11716 bytes; present) | `src/data/lessons/8008.json` (22444 bytes; present) | `src/data/lessons/8008-practice.json` (missing) |
| `8037` | `data/lessons/figures/8037.json` (6275 bytes; present) | `src/data/lessons/8037.json` (11388 bytes; present) | `src/data/lessons/8037-practice.json` (6097 bytes; present) |
| `8048` | `data/lessons/figures/8048.json` (13385 bytes; present) | `src/data/lessons/8048.json` (21700 bytes; present) | `src/data/lessons/8048-practice.json` (8252 bytes; present) |
| `8083` | `data/lessons/figures/8083.json` (missing) | `src/data/lessons/8083.json` (2535 bytes; present) | `src/data/lessons/8083-practice.json` (missing) |
| `8322` | `data/lessons/figures/8322.json` (12928 bytes; present) | `src/data/lessons/8322.json` (24271 bytes; present) | `src/data/lessons/8322-practice.json` (2379 bytes; present) |

### Unplanned extracted asset

| Study ID | Cached source text | Extracted figure JSON | Generated lesson | Practice output | Disposition |
|---:|---|---|---|---|---|
| `6808` | `.cache/curriculum-source/6808.txt` (3208 bytes; present) | `data/lessons/figures/6808.json` (2327 bytes; present; 4 figures) | `src/data/lessons/6808.json` (7704 bytes; present) | `src/data/lessons/6808-practice.json` (missing) | Excluded by handoff table B: study-method/printable material; not a lesson |

### Topic-level source files

| Source file | Bytes | Status |
|---|---:|---|
| `data/lessons/topics/catalog.json` | 41949 | present |
| `data/lessons/topics/foundations.json` | 201313 | present |
| `data/lessons/topics/openings-early.json` | 274552 | present |
| `data/lessons/topics/openings-late.json` | 143184 | present |
| `data/lessons/topics/resources.json` | 61837 | present |

### Per-study extracted-content inventory

Counts describe metadata in the old extracted figure source only. Caption and explanation text, board states, and move sequences are not copied here or reused in the clean-room lessons. `Move lists/moves` counts explicit `line.moves` records and their move entries.

| Study ID | Unit | Figure JSON | Diagram IDs | Titles JA/EN | Explanations JA/EN | SFEN positions | Move lists/moves | Crops/panels | Image locators | Partial diagrams | Marks | Piece inventories | Figure links |
|---:|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `19` | `endgame-mate3` | present (14384 bytes) | 3, 5, 7, 8, 9, 10, 11, 12, 19, 21, 24, 25, 26, 27, 28, 29, 30, 33, 34, 35, 37, 38, 39 | 23 both; 0 partial | 23 both; 0 partial | 23 | 0 lists/0 moves | 0 diagrams/0 panels | 23 | 23 | 13 | 0 | 0 |
| `109` | `endgame-mate-tesuji` | present (17180 bytes) | 3, 5, 6, 15, 17, 18, 19, 21, 22, 24, 25, 27, 28, 29, 31, 32, 35, 36, 38, 39 | 20 both; 0 partial | 20 both; 0 partial | 20 | 9 lists/18 moves | 0 diagrams/0 panels | 20 | 20 | 15 | 0 | 9 |
| `362` | `aifuri-vs-ishida` | present (15271 bytes) | 14, 16, 17, 20, 21, 24, 25, 26, 27, 30, 31, 32, 35, 38 | 14 both; 0 partial | 14 both; 0 partial | 14 | 0 lists/0 moves | 0 diagrams/0 panels | 14 | 0 | 12 | 0 | 0 |
| `386` | `endgame-mate3` | missing | — | 0 both; 0 partial | 0 both; 0 partial | 0 | 0 lists/0 moves | 0 diagrams/0 panels | 0 | 0 | 0 | 0 | 0 |
| `580` | `basics-endgame` | present (8759 bytes) | 6, 8, 9, 14, 15, 18, 24, 26, 27 | 9 both; 0 partial | 9 both; 0 partial | 9 | 0 lists/0 moves | 0 diagrams/0 panels | 9 | 9 | 6 | 0 | 0 |
| `615` | `rules-moves` | present (14376 bytes) | 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 33, 34, 38 | 15 both; 0 partial | 15 both; 0 partial | 0 | 0 lists/0 moves | 13 diagrams/25 panels | 15 | 0 | 0 | 2 | 0 |
| `656` | `rules-game` | present (7124 bytes) | 10, 11, 13, 20, 23, 27, 29 | 7 both; 0 partial | 7 both; 0 partial | 4 | 0 lists/0 moves | 2 diagrams/3 panels | 7 | 1 | 2 | 1 | 0 |
| `722` | `rules-promotion` | present (11676 bytes) | 2, 10, 13, 15, 17, 19, 28, 29 | 8 both; 0 partial | 8 both; 0 partial | 0 | 0 lists/0 moves | 7 diagrams/7 panels | 8 | 0 | 0 | 1 | 0 |
| `738` | `rules-drops` | present (7436 bytes) | 2, 5, 13, 15, 18 | 5 both; 0 partial | 5 both; 0 partial | 1 | 0 lists/0 moves | 4 diagrams/7 panels | 5 | 0 | 1 | 0 | 0 |
| `746` | `rules-checkmate` | present (6097 bytes) | 9, 12, 18, 21, 24 | 5 both; 0 partial | 5 both; 0 partial | 0 | 0 lists/0 moves | 5 diagrams/9 panels | 5 | 0 | 0 | 0 | 0 |
| `758` | `rules-draws` | present (3745 bytes) | 2, 13 | 2 both; 0 partial | 2 both; 0 partial | 0 | 0 lists/0 moves | 2 diagrams/8 panels | 2 | 0 | 0 | 0 | 0 |
| `777` | `aifuri-ishida-vs-naka` | present (21096 bytes) | 16, 20, 24, 27, 31, 32, 35, 36, 37, 38, 39, 42, 45, 46, 49, 50, 51 | 17 both; 0 partial | 17 both; 0 partial | 17 | 14 lists/43 moves | 0 diagrams/0 panels | 17 | 0 | 17 | 0 | 13 |
| `813` | `rules-fouls` | present (6973 bytes) | 13, 15, 16, 18, 19, 22 | 6 both; 0 partial | 6 both; 0 partial | 0 | 0 lists/0 moves | 6 diagrams/11 panels | 6 | 0 | 0 | 0 | 0 |
| `829` | `aifuri-basics` | present (20989 bytes) | 0, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25 | 20 both; 0 partial | 20 both; 0 partial | 20 | 0 lists/0 moves | 0 diagrams/0 panels | 20 | 0 | 0 | 0 | 0 |
| `875` | `attack-kinmusou` | present (23375 bytes) | 5, 7, 12, 14, 17, 20, 23, 24, 26, 28, 32, 35, 42, 43, 44, 46, 49, 50, 51, 54, 59, 60, 63, 64 | 24 both; 0 partial | 24 both; 0 partial | 24 | 16 lists/43 moves | 0 diagrams/0 panels | 24 | 24 | 19 | 0 | 16 |
| `932` | `rules-draws` | present (10765 bytes) | 2, 14, 15, 17, 18, 19, 23, 26, 27 | 9 both; 0 partial | 9 both; 0 partial | 9 | 0 lists/0 moves | 0 diagrams/0 panels | 9 | 3 | 2 | 0 | 0 |
| `974` | `taifuri-45hayashikake` | present (15516 bytes) | 0, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 | 16 both; 0 partial | 16 both; 0 partial | 16 | 0 lists/0 moves | 0 diagrams/0 panels | 16 | 0 | 7 | 0 | 0 |
| `1001` | `shiken-tateishi` | present (18638 bytes) | 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 | 20 both; 0 partial | 20 both; 0 partial | 20 | 0 lists/0 moves | 0 diagrams/0 panels | 20 | 9 | 17 | 0 | 0 |
| `1021` | `basics-value` | present (11986 bytes) | 0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20 | 15 both; 0 partial | 15 both; 0 partial | 14 | 0 lists/0 moves | 0 diagrams/0 panels | 15 | 1 | 10 | 1 | 0 |
| `1067` | `basics-forks` | present (6613 bytes) | 0, 8, 10, 12, 14, 16, 17 | 7 both; 0 partial | 7 both; 0 partial | 7 | 0 lists/0 moves | 0 diagrams/0 panels | 7 | 7 | 0 | 0 | 0 |
| `1070` | `attack-mino-aifuri` | present (20730 bytes) | 14, 15, 18, 19, 22, 24, 27, 30, 34, 35, 37, 38, 39, 41, 43, 45, 48, 49, 51, 53, 54 | 21 both; 0 partial | 21 both; 0 partial | 21 | 13 lists/38 moves | 0 diagrams/0 panels | 21 | 21 | 16 | 0 | 13 |
| `1106` | `rules-setup` | present (1661 bytes) | 6 | 1 both; 0 partial | 1 both; 0 partial | 1 | 0 lists/0 moves | 0 diagrams/0 panels | 1 | 0 | 0 | 0 | 0 |
| `1127` | `rules-setup` | missing | — | 0 both; 0 partial | 0 both; 0 partial | 0 | 0 lists/0 moves | 0 diagrams/0 panels | 0 | 0 | 0 | 0 | 0 |
| `1137` | `rules-setup` | present (5990 bytes) | 3, 14, 16, 21 | 4 both; 0 partial | 4 both; 0 partial | 1 | 0 lists/0 moves | 2 diagrams/2 panels | 4 | 0 | 0 | 1 | 0 |
| `1247` | `kakukoukan-shiken` | present (14761 bytes) | 12, 15, 16, 18, 20, 23, 25, 27, 29, 30, 31, 34 | 12 both; 0 partial | 12 both; 0 partial | 12 | 10 lists/30 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 10 |
| `1313` | `tesuji-silver` | present (15635 bytes) | 2, 3, 4, 6, 15, 16, 19, 20, 22, 24, 28, 30, 31, 34, 35, 36 | 16 both; 0 partial | 16 both; 0 partial | 10 | 4 lists/7 moves | 5 diagrams/5 panels | 16 | 10 | 6 | 1 | 4 |
| `1331` | `tesuji-knight` | present (18836 bytes) | 2, 3, 4, 6, 9, 16, 19, 20, 22, 27, 28, 32, 34, 35, 39, 40, 43, 44, 46, 48, 50 | 21 both; 0 partial | 21 both; 0 partial | 15 | 9 lists/15 moves | 5 diagrams/6 panels | 21 | 15 | 9 | 1 | 9 |
| `1486` | `tesuji-lance` | present (14570 bytes) | 2, 3, 5, 7, 20, 22, 25, 26, 29, 33, 34, 38, 40, 42, 43, 44 | 16 both; 0 partial | 16 both; 0 partial | 12 | 5 lists/11 moves | 3 diagrams/3 panels | 16 | 12 | 6 | 1 | 5 |
| `1512` | `basics-value` | missing | — | 0 both; 0 partial | 0 both; 0 partial | 0 | 0 lists/0 moves | 0 diagrams/0 panels | 0 | 0 | 0 | 0 | 0 |
| `1516` | `tesuji-gold` | present (15700 bytes) | 2, 3, 4, 6, 15, 16, 17, 18, 25, 27, 28, 31, 32, 34, 42, 44, 45, 48, 49 | 19 both; 0 partial | 19 both; 0 partial | 11 | 5 lists/15 moves | 7 diagrams/7 panels | 19 | 11 | 6 | 1 | 5 |
| `1541` | `tesuji-rook` | present (16867 bytes) | 2, 3, 4, 6, 15, 18, 19, 21, 23, 26, 28, 30, 31, 34, 36, 39, 40, 43, 44, 45 | 20 both; 0 partial | 20 both; 0 partial | 16 | 8 lists/12 moves | 3 diagrams/3 panels | 20 | 15 | 11 | 1 | 8 |
| `1586` | `tesuji-bishop` | present (18096 bytes) | 2, 3, 4, 6, 15, 16, 17, 20, 22, 26, 29, 31, 32, 35, 36, 39, 41, 43, 44, 47, 49 | 21 both; 0 partial | 21 both; 0 partial | 17 | 9 lists/17 moves | 3 diagrams/3 panels | 21 | 9 | 12 | 1 | 9 |
| `1629` | `tesuji-pawn` | present (25242 bytes) | 3, 4, 5, 7, 16, 17, 18, 20, 21, 23, 24, 25, 30, 32, 33, 34, 37, 39, 42, 44, 46, 47, 50, 51, 53, 54, 55, 57, 58 | 29 both; 0 partial | 29 both; 0 partial | 23 | 9 lists/22 moves | 5 diagrams/5 panels | 29 | 23 | 14 | 1 | 9 |
| `1699` | `shiken-vs-migishiken` | present (26810 bytes) | 15, 17, 19, 20, 23, 26, 27, 28, 29, 32, 33, 35, 40, 41, 42, 44, 45, 49, 50, 51, 54, 55 | 22 both; 0 partial | 22 both; 0 partial | 22 | 14 lists/42 moves | 0 diagrams/0 panels | 22 | 0 | 22 | 0 | 14 |
| `1741` | `shiken-vs-yagura` | present (19705 bytes) | 13, 15, 18, 22, 24, 26, 28, 29, 33, 35, 37, 41, 44, 46, 48, 51 | 16 both; 0 partial | 16 both; 0 partial | 16 | 0 lists/0 moves | 0 diagrams/0 panels | 16 | 3 | 14 | 0 | 0 |
| `1783` | `proverb-gold-last` | present (19827 bytes) | 11, 13, 14, 16, 21, 22, 25, 26, 27, 30, 31, 32, 35, 37, 38, 40, 41, 42, 46, 47, 48, 49, 52, 53, 54, 55, 58, 59, 60, 61 | 30 both; 0 partial | 30 both; 0 partial | 30 | 0 lists/0 moves | 0 diagrams/0 panels | 30 | 30 | 19 | 0 | 0 |
| `1821` | `basics-mate-words` | present (18320 bytes) | 2, 3, 5, 6, 14, 15, 17, 18, 21, 22, 23, 24, 26, 27, 31, 32, 33, 35, 36, 37, 38, 39 | 22 both; 0 partial | 22 both; 0 partial | 22 | 0 lists/0 moves | 0 diagrams/0 panels | 22 | 12 | 15 | 0 | 0 |
| `1852` | `yagura-build` | present (24168 bytes) | 13, 16, 19, 20, 22, 23, 24, 29, 30, 31, 33, 34, 36, 38, 39, 40, 42, 45, 48, 49, 51, 52, 54 | 23 both; 0 partial | 23 both; 0 partial | 23 | 17 lists/40 moves | 0 diagrams/0 panels | 23 | 7 | 16 | 0 | 13 |
| `1854` | `endgame-mate1` | present (28209 bytes) | 5, 6, 7, 9, 10, 11, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 36, 37, 38, 39, 40, 41, 44, 45, 46, 47, 48, 49, 52, 53, 54, 55, 56, 57, 60, 61, 62, 63, 64, 65 | 42 both; 0 partial | 42 both; 0 partial | 42 | 0 lists/0 moves | 0 diagrams/0 panels | 42 | 42 | 28 | 0 | 0 |
| `2105` | `yagura-37gin` | present (27616 bytes) | 13, 16, 18, 19, 20, 21, 23, 25, 27, 29, 30, 33, 34, 35, 37, 39, 42, 44, 45, 46, 48, 49, 50, 52, 53, 55 | 26 both; 0 partial | 26 both; 0 partial | 26 | 19 lists/79 moves | 0 diagrams/0 panels | 26 | 0 | 25 | 0 | 19 |
| `2204` | `taifuri-vs-kakukoukan` | present (20483 bytes) | 11, 12, 14, 17, 19, 20, 21, 22, 24, 26, 31, 33, 34, 35, 38, 39, 40 | 17 both; 0 partial | 17 both; 0 partial | 17 | 13 lists/74 moves | 0 diagrams/0 panels | 17 | 0 | 17 | 0 | 12 |
| `2276` | `attack-yagura-side` | present (19607 bytes) | 12, 14, 17, 18, 20, 21, 23, 26, 28, 29, 31, 33, 35, 36, 37, 40, 42, 44, 46, 47 | 20 both; 0 partial | 20 both; 0 partial | 20 | 14 lists/27 moves | 0 diagrams/0 panels | 20 | 20 | 17 | 0 | 14 |
| `2313` | `attack-yagura-head` | present (21569 bytes) | 12, 14, 17, 18, 22, 24, 25, 26, 28, 31, 32, 35, 37, 39, 41, 42, 44, 46, 47, 48, 50, 52 | 22 both; 0 partial | 22 both; 0 partial | 22 | 11 lists/29 moves | 0 diagrams/0 panels | 22 | 22 | 19 | 0 | 11 |
| `2375` | `endgame-yose` | present (16563 bytes) | 2, 6, 15, 17, 20, 23, 24, 27, 28, 31, 32, 36, 38, 39, 40 | 15 both; 0 partial | 15 both; 0 partial | 15 | 10 lists/21 moves | 0 diagrams/0 panels | 15 | 15 | 13 | 0 | 10 |
| `2418` | `endgame-tsume-study` | present (6546 bytes) | 12, 13, 17, 18, 21, 22 | 6 both; 0 partial | 6 both; 0 partial | 6 | 0 lists/0 moves | 0 diagrams/0 panels | 6 | 6 | 3 | 0 | 0 |
| `2426` | `shiken-basics` | present (15236 bytes) | 16, 17, 19, 24, 25, 27, 29, 32, 33, 35, 37, 39, 40, 43, 47 | 15 both; 0 partial | 15 both; 0 partial | 15 | 7 lists/9 moves | 0 diagrams/0 panels | 15 | 3 | 11 | 0 | 6 |
| `2472` | `shiken-castles` | present (9537 bytes) | 13, 16, 19, 20, 23, 24, 29, 30, 33, 34 | 10 both; 0 partial | 10 both; 0 partial | 10 | 3 lists/9 moves | 0 diagrams/0 panels | 10 | 10 | 0 | 0 | 3 |
| `2491` | `shiken-patterns` | present (13304 bytes) | 6, 7, 11, 12, 15, 31, 36, 41, 43, 47, 49 | 11 both; 0 partial | 11 both; 0 partial | 11 | 0 lists/0 moves | 0 diagrams/0 panels | 11 | 11 | 0 | 0 | 0 |
| `2519` | `shiken-vs-igyoku-bougin` | present (13784 bytes) | 16, 22, 25, 26, 27, 30, 32, 34, 35, 37, 41, 43 | 12 both; 0 partial | 12 both; 0 partial | 12 | 10 lists/29 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 9 |
| `2556` | `shiken-vs-funa-bougin` | present (22910 bytes) | 16, 20, 24, 27, 30, 34, 37, 40, 43, 44, 46, 49, 52, 54, 58, 60, 62 | 17 both; 0 partial | 17 both; 0 partial | 17 | 17 lists/49 moves | 0 diagrams/0 panels | 17 | 0 | 17 | 0 | 16 |
| `2590` | `basics-bishop-trade` | present (12838 bytes) | 3, 12, 13, 15, 16, 18, 19, 23, 24, 26, 27, 29, 30 | 13 both; 0 partial | 13 both; 0 partial | 13 | 4 lists/6 moves | 0 diagrams/0 panels | 13 | 8 | 8 | 0 | 4 |
| `2615` | `attack-mino-kobin` | present (15979 bytes) | 15, 16, 18, 20, 21, 22, 23, 25, 29, 30, 31, 33, 34, 36, 38, 40, 43, 44 | 18 both; 0 partial | 18 both; 0 partial | 18 | 8 lists/16 moves | 0 diagrams/0 panels | 18 | 18 | 13 | 0 | 8 |
| `2646` | `attack-mino-side` | present (18669 bytes) | 15, 17, 19, 21, 22, 23, 24, 26, 28, 30, 31, 36, 38, 39, 41, 42, 43, 46, 48, 50 | 20 both; 0 partial | 20 both; 0 partial | 20 | 11 lists/18 moves | 0 diagrams/0 panels | 20 | 20 | 14 | 0 | 11 |
| `2676` | `bougin-basics` | present (17713 bytes) | 14, 17, 20, 21, 23, 25, 28, 31, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52 | 18 both; 0 partial | 18 both; 0 partial | 18 | 5 lists/9 moves | 0 diagrams/0 panels | 18 | 12 | 12 | 0 | 5 |
| `2695` | `bougin-middlegame` | present (15646 bytes) | 15, 20, 22, 25, 28, 30, 32, 34, 38, 40, 42, 45, 47, 48, 49 | 15 both; 0 partial | 15 both; 0 partial | 15 | 9 lists/23 moves | 0 diagrams/0 panels | 15 | 15 | 12 | 0 | 9 |
| `2744` | `shiken-vs-anaguma` | present (22313 bytes) | 11, 13, 16, 18, 20, 22, 24, 28, 31, 33, 35, 36, 38, 42, 43, 45, 46, 47 | 18 both; 0 partial | 18 both; 0 partial | 18 | 16 lists/55 moves | 0 diagrams/0 panels | 18 | 1 | 16 | 0 | 15 |
| `2807` | `kishu-onigoroshi` | present (17211 bytes) | 13, 15, 18, 19, 23, 25, 26, 32, 34, 35, 37, 38, 41, 42 | 14 both; 0 partial | 14 both; 0 partial | 14 | 11 lists/26 moves | 0 diagrams/0 panels | 14 | 0 | 14 | 0 | 10 |
| `2840` | `kishu-pacman` | present (11737 bytes) | 13, 16, 17, 21, 22, 24, 25, 27, 30 | 9 both; 0 partial | 9 both; 0 partial | 9 | 9 lists/20 moves | 0 diagrams/0 panels | 9 | 0 | 9 | 0 | 8 |
| `2865` | `kakugawari-basics` | present (21143 bytes) | 12, 15, 17, 18, 20, 24, 25, 29, 32, 35, 42, 43, 46, 48, 49, 50, 51, 52, 54 | 19 both; 0 partial | 19 both; 0 partial | 19 | 13 lists/47 moves | 0 diagrams/0 panels | 19 | 3 | 16 | 0 | 12 |
| `2911` | `basics-plan` | present (12023 bytes) | 5, 22, 23, 24, 27, 28, 29, 33, 34, 35, 43 | 11 both; 0 partial | 11 both; 0 partial | 11 | 0 lists/0 moves | 0 diagrams/0 panels | 11 | 5 | 6 | 0 | 0 |
| `2947` | `yagura-vs-bougin` | present (29625 bytes) | 14, 17, 22, 23, 24, 28, 30, 31, 34, 35, 36, 38, 40, 42, 43, 44, 49, 52, 53, 55, 57, 58, 59, 63 | 24 both; 0 partial | 24 both; 0 partial | 24 | 21 lists/79 moves | 0 diagrams/0 panels | 24 | 1 | 23 | 0 | 20 |
| `3014` | `attack-anaguma` | present (17134 bytes) | 11, 12, 14, 15, 17, 18, 19, 21, 22, 27, 28, 29, 31, 32, 34, 35, 38, 39 | 18 both; 0 partial | 18 both; 0 partial | 18 | 9 lists/22 moves | 0 diagrams/0 panels | 18 | 18 | 12 | 0 | 9 |
| `3048` | `attack-funa` | present (19424 bytes) | 11, 12, 14, 15, 16, 17, 21, 23, 25, 27, 28, 30, 31, 32, 33, 34, 36, 37, 41, 42, 43, 44 | 22 both; 0 partial | 22 both; 0 partial | 22 | 12 lists/33 moves | 0 diagrams/0 panels | 22 | 22 | 17 | 0 | 12 |
| `3156` | `basics-opening` | present (18699 bytes) | 14, 15, 16, 19, 20, 22, 24, 27, 28, 31, 35, 39, 40, 42, 43, 46, 48 | 17 both; 0 partial | 17 both; 0 partial | 17 | 11 lists/31 moves | 0 diagrams/0 panels | 17 | 1 | 15 | 0 | 8 |
| `3198` | `basics-middlegame` | present (18205 bytes) | 13, 16, 17, 19, 20, 23, 24, 25, 27, 29, 30, 32, 33, 37, 38, 46, 47, 51, 52 | 19 both; 0 partial | 19 both; 0 partial | 19 | 10 lists/23 moves | 0 diagrams/0 panels | 19 | 15 | 13 | 0 | 10 |
| `3239` | `basics-endgame` | present (10463 bytes) | 14, 19, 20, 23, 24, 26, 29, 31, 32, 33, 34 | 11 both; 0 partial | 11 both; 0 partial | 11 | 8 lists/17 moves | 0 diagrams/0 panels | 11 | 11 | 8 | 0 | 8 |
| `3271` | `basics-attack-defense` | present (10119 bytes) | 3, 6, 7, 8, 9, 13, 14, 15, 23, 24, 25, 26 | 12 both; 0 partial | 12 both; 0 partial | 12 | 4 lists/4 moves | 0 diagrams/0 panels | 12 | 12 | 8 | 0 | 4 |
| `3457` | `yagura-bougin` | present (4312 bytes) | 3, 5, 8, 17, 19 | 5 both; 0 partial | 5 both; 0 partial | 5 | 0 lists/0 moves | 0 diagrams/0 panels | 5 | 4 | 2 | 0 | 0 |
| `3497` | `kakugawari-bougin` | present (19317 bytes) | 14, 17, 23, 24, 25, 28, 30, 31, 34, 35, 36, 39, 40, 42, 43, 45, 46 | 17 both; 0 partial | 17 both; 0 partial | 17 | 13 lists/44 moves | 0 diagrams/0 panels | 17 | 0 | 17 | 0 | 13 |
| `3783` | `yokofu-basics` | present (11595 bytes) | 14, 16, 17, 18, 20, 21, 22, 25, 27, 28, 29, 30 | 12 both; 0 partial | 12 both; 0 partial | 12 | 6 lists/12 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 6 |
| `3826` | `yokofu-45kaku` | present (18877 bytes) | 14, 17, 21, 22, 24, 25, 26, 28, 30, 31, 32, 34, 36, 38, 39, 40 | 16 both; 0 partial | 16 both; 0 partial | 16 | 14 lists/35 moves | 0 diagrams/0 panels | 16 | 0 | 16 | 0 | 14 |
| `4314` | `yokofu-aono` | present (17423 bytes) | 14, 17, 20, 23, 25, 26, 29, 30, 32, 33, 34, 38, 40, 42, 43, 46 | 16 both; 0 partial | 16 both; 0 partial | 16 | 15 lists/44 moves | 0 diagrams/0 panels | 16 | 0 | 16 | 0 | 15 |
| `4502` | `taifuri-bougin-ishida` | present (23503 bytes) | 13, 15, 16, 17, 18, 20, 21, 22, 24, 25, 28, 30, 33, 36, 37, 39, 42, 43, 44, 48 | 20 both; 0 partial | 20 both; 0 partial | 20 | 14 lists/51 moves | 0 diagrams/0 panels | 20 | 0 | 20 | 0 | 14 |
| `4633` | `endgame-mate3` | present (17647 bytes) | 4, 6, 7, 10, 11, 12, 13, 14, 15, 22, 24, 26, 27, 28, 29, 30, 31, 33, 35, 36, 38, 39, 40, 41, 42, 43 | 26 both; 0 partial | 26 both; 0 partial | 26 | 0 lists/0 moves | 0 diagrams/0 panels | 26 | 26 | 13 | 0 | 0 |
| `4717` | `ibisha-basics` | present (20452 bytes) | 6, 7, 8, 9, 11, 12, 16, 17, 27, 29, 32, 33, 39, 40, 42, 44, 46, 47, 50, 55 | 20 both; 0 partial | 20 both; 0 partial | 20 | 9 lists/17 moves | 0 diagrams/0 panels | 20 | 2 | 12 | 0 | 9 |
| `4747` | `handicap-8` | present (21574 bytes) | 12, 15, 17, 18, 22, 24, 26, 29, 31, 33, 34, 37, 38, 40, 44, 46, 47 | 17 both; 0 partial | 17 both; 0 partial | 17 | 16 lists/50 moves | 0 diagrams/0 panels | 17 | 0 | 16 | 0 | 16 |
| `4779` | `handicap-6` | present (18198 bytes) | 13, 15, 17, 19, 21, 22, 23, 24, 26, 29, 30, 31, 32, 34, 37, 38, 39 | 17 both; 0 partial | 17 both; 0 partial | 17 | 11 lists/33 moves | 0 diagrams/0 panels | 17 | 0 | 16 | 0 | 11 |
| `4815` | `handicap-4` | present (21372 bytes) | 14, 16, 18, 21, 22, 24, 26, 27, 31, 32, 33, 35, 36, 38, 41, 42, 43, 44, 45 | 19 both; 0 partial | 19 both; 0 partial | 19 | 15 lists/43 moves | 0 diagrams/0 panels | 19 | 0 | 18 | 0 | 15 |
| `4848` | `yagura-vs-hidarimino` | present (16695 bytes) | 15, 18, 19, 21, 23, 26, 27, 28, 29, 32, 33, 34, 36, 38, 40 | 15 both; 0 partial | 15 both; 0 partial | 15 | 15 lists/55 moves | 0 diagrams/0 panels | 15 | 0 | 15 | 0 | 14 |
| `4878` | `handicap-2` | present (9627 bytes) | 12, 14, 17, 18, 20, 21, 22, 23, 25 | 9 both; 0 partial | 9 both; 0 partial | 9 | 4 lists/16 moves | 0 diagrams/0 panels | 9 | 2 | 6 | 0 | 4 |
| `4917` | `yagura-vs-migishiken` | present (16720 bytes) | 16, 18, 20, 21, 22, 23, 24, 26, 27, 29, 30, 33, 35, 36, 37 | 15 both; 0 partial | 15 both; 0 partial | 15 | 13 lists/43 moves | 0 diagrams/0 panels | 15 | 0 | 15 | 0 | 12 |
| `4961` | `kishu-migishiken-hidarimino` | present (20907 bytes) | 14, 15, 19, 22, 24, 25, 26, 28, 29, 31, 33, 37, 38, 39, 41, 42, 43, 44 | 18 both; 0 partial | 18 both; 0 partial | 18 | 13 lists/36 moves | 0 diagrams/0 panels | 18 | 2 | 16 | 0 | 13 |
| `5001` | `kishu-sujichigai` | present (14920 bytes) | 14, 17, 18, 20, 21, 23, 25, 26, 27, 29, 31, 34 | 12 both; 0 partial | 12 both; 0 partial | 12 | 12 lists/62 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 11 |
| `5040` | `gokigen-basics` | present (14611 bytes) | 14, 16, 17, 19, 22, 23, 25, 26, 27, 29, 31, 32, 34 | 13 both; 0 partial | 13 both; 0 partial | 13 | 9 lists/20 moves | 0 diagrams/0 panels | 13 | 0 | 13 | 0 | 9 |
| `5256` | `hayaishida` | present (13485 bytes) | 12, 14, 16, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31 | 13 both; 0 partial | 13 both; 0 partial | 13 | 12 lists/32 moves | 0 diagrams/0 panels | 13 | 0 | 13 | 0 | 12 |
| `5283` | `kishu-ahiru` | present (14004 bytes) | 2, 4, 11, 13, 15, 16, 18, 19, 21, 23, 24, 25 | 12 both; 0 partial | 12 both; 0 partial | 12 | 10 lists/49 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 10 |
| `5325` | `endgame-mate-tesuji` | present (16404 bytes) | 3, 5, 6, 8, 16, 18, 19, 21, 22, 24, 25, 26, 28, 29, 31, 32, 33, 35, 36, 37 | 20 both; 0 partial | 20 both; 0 partial | 20 | 13 lists/23 moves | 0 diagrams/0 panels | 20 | 20 | 15 | 0 | 13 |
| `5361` | `rules-tsume` | present (16829 bytes) | 10, 12, 14, 15, 16, 17, 19, 21, 22, 23, 25, 26, 27, 29, 30, 32, 33 | 17 both; 0 partial | 17 both; 0 partial | 17 | 11 lists/36 moves | 0 diagrams/0 panels | 17 | 17 | 11 | 0 | 11 |
| `5461` | `gokigen-vs-choukyusen` | present (13364 bytes) | 14, 17, 19, 20, 21, 23, 24, 26, 27, 29, 31 | 11 both; 0 partial | 11 both; 0 partial | 11 | 8 lists/16 moves | 0 diagrams/0 panels | 11 | 0 | 11 | 0 | 8 |
| `5499` | `ureshino-counter` | present (10553 bytes) | 10, 12, 14, 15, 16, 18, 19, 20, 21 | 9 both; 0 partial | 9 both; 0 partial | 9 | 8 lists/32 moves | 0 diagrams/0 panels | 9 | 0 | 9 | 0 | 8 |
| `5519` | `ureshino-basics` | present (10758 bytes) | 12, 14, 15, 17, 18, 20, 21, 23, 24, 25 | 10 both; 0 partial | 10 both; 0 partial | 10 | 9 lists/36 moves | 0 diagrams/0 panels | 10 | 0 | 10 | 0 | 9 |
| `5546` | `ureshino-vs-bougin` | present (14742 bytes) | 12, 14, 15, 17, 20, 22, 23, 24, 26, 29, 31, 32, 33, 35 | 14 both; 0 partial | 14 both; 0 partial | 14 | 11 lists/44 moves | 0 diagrams/0 panels | 14 | 0 | 14 | 0 | 11 |
| `5571` | `ureshino-new` | present (9251 bytes) | 2, 3, 5, 13, 14, 15, 17, 20 | 8 both; 0 partial | 8 both; 0 partial | 8 | 5 lists/19 moves | 0 diagrams/0 panels | 8 | 0 | 8 | 0 | 5 |
| `5584` | `ureshino-vs-shiken` | present (16303 bytes) | 13, 15, 17, 19, 20, 21, 24, 25, 26, 28, 29, 31, 33, 34 | 14 both; 0 partial | 14 both; 0 partial | 14 | 12 lists/46 moves | 0 diagrams/0 panels | 14 | 0 | 14 | 0 | 12 |
| `5608` | `ureshino-basics` | present (5579 bytes) | 2, 14, 16, 18, 20 | 5 both; 0 partial | 5 both; 0 partial | 5 | 0 lists/0 moves | 0 diagrams/0 panels | 5 | 0 | 5 | 0 | 0 |
| `5619` | `gokigen-attack` | present (10077 bytes) | 14, 17, 19, 20, 21, 23, 25, 26, 28 | 9 both; 0 partial | 9 both; 0 partial | 9 | 8 lists/28 moves | 0 diagrams/0 panels | 9 | 0 | 9 | 0 | 8 |
| `5845` | `gangi` | present (12121 bytes) | 15, 17, 19, 24, 27, 28, 30, 33, 34, 36, 37, 38 | 12 both; 0 partial | 12 both; 0 partial | 12 | 5 lists/30 moves | 0 diagrams/0 panels | 12 | 3 | 9 | 0 | 5 |
| `5873` | `aigakari-basics` | present (11331 bytes) | 2, 10, 12, 13, 15, 17, 18, 19, 21, 22, 23 | 11 both; 0 partial | 11 both; 0 partial | 11 | 10 lists/29 moves | 0 diagrams/0 panels | 11 | 0 | 11 | 0 | 9 |
| `5896` | `gangi` | present (13994 bytes) | 14, 17, 18, 20, 22, 24, 25, 27, 30, 33, 34, 35 | 12 both; 0 partial | 12 both; 0 partial | 12 | 11 lists/56 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 11 |
| `5928` | `yagura-suzume` | present (16127 bytes) | 14, 15, 18, 19, 20, 21, 23, 25, 26, 28, 29, 31, 32, 34, 35, 37 | 16 both; 0 partial | 16 both; 0 partial | 16 | 13 lists/41 moves | 0 diagrams/0 panels | 16 | 0 | 16 | 0 | 13 |
| `5958` | `castles-yagura` | present (15864 bytes) | 3, 7, 8, 9, 10, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39 | 20 both; 0 partial | 20 both; 0 partial | 20 | 4 lists/12 moves | 0 diagrams/0 panels | 20 | 20 | 0 | 0 | 3 |
| `5985` | `castles-mino` | present (12780 bytes) | 2, 4, 5, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30 | 14 both; 0 partial | 14 both; 0 partial | 14 | 2 lists/6 moves | 0 diagrams/0 panels | 14 | 14 | 0 | 0 | 1 |
| `6007` | `castles-hidarimino` | present (12203 bytes) | 2, 5, 6, 7, 17, 19, 20, 22, 23, 24, 25, 27 | 12 both; 0 partial | 12 both; 0 partial | 12 | 3 lists/10 moves | 0 diagrams/0 panels | 12 | 12 | 0 | 0 | 2 |
| `6021` | `castles-anaguma` | present (11191 bytes) | 2, 4, 5, 6, 16, 17, 18, 19, 21, 23, 24, 25 | 12 both; 0 partial | 12 both; 0 partial | 12 | 3 lists/13 moves | 0 diagrams/0 panels | 12 | 12 | 0 | 0 | 2 |
| `6044` | `castles-funa` | present (7089 bytes) | 2, 6, 18, 19, 20, 21, 22 | 7 both; 0 partial | 7 both; 0 partial | 7 | 1 lists/4 moves | 0 diagrams/0 panels | 7 | 7 | 0 | 0 | 0 |
| `6053` | `castles-aifuri` | present (5330 bytes) | 2, 12, 13, 15, 16, 17 | 6 both; 0 partial | 6 both; 0 partial | 6 | 0 lists/0 moves | 0 diagrams/0 panels | 6 | 6 | 0 | 0 | 0 |
| `6062` | `castles-nakazumai` | present (4438 bytes) | 2, 5, 14, 15, 16 | 5 both; 0 partial | 5 both; 0 partial | 5 | 0 lists/0 moves | 0 diagrams/0 panels | 5 | 3 | 2 | 0 | 0 |
| `6068` | `castles-first` | present (10211 bytes) | 2, 5, 8, 15, 16, 19, 20, 23, 24, 27, 28 | 11 both; 0 partial | 11 both; 0 partial | 11 | 0 lists/0 moves | 0 diagrams/0 panels | 11 | 7 | 4 | 0 | 0 |
| `6076` | `castles-other` | present (5664 bytes) | 2, 9, 10, 12, 13, 14, 15 | 7 both; 0 partial | 7 both; 0 partial | 7 | 0 lists/0 moves | 0 diagrams/0 panels | 7 | 7 | 0 | 0 | 0 |
| `6154` | `aifuri-hidari-anaguma` | present (11034 bytes) | 12, 14, 17, 20, 21, 23, 24, 26, 27 | 9 both; 0 partial | 9 both; 0 partial | 9 | 7 lists/32 moves | 0 diagrams/0 panels | 9 | 1 | 8 | 0 | 7 |
| `6174` | `gokigen-vs-anaguma` | present (13400 bytes) | 14, 17, 18, 20, 21, 22, 24, 26, 27, 28, 29 | 11 both; 0 partial | 11 both; 0 partial | 11 | 10 lists/45 moves | 0 diagrams/0 panels | 11 | 0 | 11 | 0 | 10 |
| `6200` | `ishida-basics` | present (15889 bytes) | 13, 14, 16, 18, 19, 20, 21, 24, 25, 27, 28, 31, 32, 34 | 14 both; 0 partial | 14 both; 0 partial | 14 | 8 lists/14 moves | 0 diagrams/0 panels | 14 | 0 | 14 | 0 | 8 |
| `6436` | `ishida-honkumi` | present (12038 bytes) | 13, 15, 18, 19, 20, 22, 25, 26, 27, 28, 30 | 11 both; 0 partial | 11 both; 0 partial | 11 | 6 lists/22 moves | 0 diagrams/0 panels | 11 | 1 | 10 | 0 | 6 |
| `6460` | `ishida-attack` | present (14711 bytes) | 12, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 29, 30 | 13 both; 0 partial | 13 both; 0 partial | 13 | 11 lists/30 moves | 0 diagrams/0 panels | 13 | 0 | 13 | 0 | 11 |
| `6496` | `yokofu-avoid` | present (12773 bytes) | 2, 12, 14, 17, 21, 24, 25, 27, 30, 32, 33 | 11 both; 0 partial | 11 both; 0 partial | 11 | 10 lists/43 moves | 0 diagrams/0 panels | 11 | 0 | 11 | 0 | 4 |
| `6514` | `gokigen-vs-chousoku` | present (19747 bytes) | 14, 17, 18, 20, 22, 23, 24, 26, 27, 28, 31, 32, 33, 35, 36, 37, 39 | 17 both; 0 partial | 17 both; 0 partial | 17 | 16 lists/49 moves | 0 diagrams/0 panels | 17 | 0 | 17 | 0 | 16 |
| `6540` | `bougin-castles` | present (4491 bytes) | 2, 11, 14, 15, 16, 19 | 6 both; 0 partial | 6 both; 0 partial | 6 | 0 lists/0 moves | 0 diagrams/0 panels | 6 | 6 | 0 | 0 | 0 |
| `6549` | `bougin-vs-furibisha` | present (10481 bytes) | 12, 15, 16, 18, 19, 21, 23, 25, 26, 29 | 10 both; 0 partial | 10 both; 0 partial | 10 | 9 lists/12 moves | 0 diagrams/0 panels | 10 | 10 | 9 | 0 | 9 |
| `6566` | `gokigen-castles` | present (6637 bytes) | 10, 13, 16, 17, 18, 21, 23 | 7 both; 0 partial | 7 both; 0 partial | 7 | 0 lists/0 moves | 0 diagrams/0 panels | 7 | 6 | 1 | 0 | 0 |
| `6593` | `nakabisha-sente` | present (11564 bytes) | 12, 14, 15, 16, 18, 19, 21, 23, 24, 26, 29 | 11 both; 0 partial | 11 both; 0 partial | 11 | 7 lists/16 moves | 0 diagrams/0 panels | 11 | 0 | 11 | 0 | 7 |
| `6645` | `kakugawari-hayakuri` | present (15307 bytes) | 14, 17, 18, 19, 20, 24, 27, 29, 30, 32, 34, 37, 39, 40 | 14 both; 0 partial | 14 both; 0 partial | 14 | 13 lists/40 moves | 0 diagrams/0 panels | 14 | 0 | 14 | 0 | 13 |
| `6677` | `kakugawari-koshikake` | present (21299 bytes) | 14, 17, 20, 22, 24, 26, 27, 29, 30, 31, 33, 34, 36, 37, 38, 41, 42, 43, 44 | 19 both; 0 partial | 19 both; 0 partial | 19 | 17 lists/61 moves | 0 diagrams/0 panels | 19 | 0 | 19 | 0 | 17 |
| `6704` | `kakugawari-45kei` | present (16209 bytes) | 14, 17, 19, 21, 22, 23, 26, 27, 29, 31, 32, 33, 34, 35, 36 | 15 both; 0 partial | 15 both; 0 partial | 15 | 12 lists/37 moves | 0 diagrams/0 panels | 15 | 0 | 15 | 0 | 12 |
| `6736` | `kakugawari-koshikake` | present (12160 bytes) | 14, 17, 20, 22, 25, 26, 27, 29, 30, 32, 34, 35 | 12 both; 0 partial | 12 both; 0 partial | 12 | 9 lists/30 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 9 |
| `6765` | `kakugawari-ittezon` | present (15159 bytes) | 3, 4, 6, 8, 9, 11, 13, 20, 21, 24, 25, 27, 29 | 13 both; 0 partial | 13 both; 0 partial | 13 | 10 lists/53 moves | 0 diagrams/0 panels | 13 | 0 | 13 | 0 | 5 |
| `6814` | `ishida-43` | present (19515 bytes) | 12, 16, 17, 18, 23, 24, 26, 27, 29, 32, 33, 35, 36, 37, 38, 39, 40, 41 | 18 both; 0 partial | 18 both; 0 partial | 18 | 15 lists/39 moves | 0 diagrams/0 panels | 18 | 0 | 18 | 0 | 15 |
| `6896` | `sanken-basics` | present (12240 bytes) | 12, 14, 17, 18, 20, 21, 22, 23, 24, 26, 28, 31, 33 | 13 both; 0 partial | 13 both; 0 partial | 13 | 6 lists/9 moves | 0 diagrams/0 panels | 13 | 4 | 9 | 0 | 5 |
| `6934` | `sanken-vs-bougin` | present (14022 bytes) | 12, 15, 16, 19, 20, 22, 23, 25, 26, 28, 29, 31, 32, 33 | 14 both; 0 partial | 14 both; 0 partial | 14 | 9 lists/15 moves | 0 diagrams/0 panels | 14 | 0 | 14 | 0 | 9 |
| `6970` | `sanken-tomahawk` | present (11764 bytes) | 12, 15, 18, 20, 21, 23, 24, 26, 27, 28 | 10 both; 0 partial | 10 both; 0 partial | 10 | 8 lists/24 moves | 0 diagrams/0 panels | 10 | 0 | 10 | 0 | 8 |
| `7031` | `yokofu-23fu` | present (18578 bytes) | 10, 13, 15, 17, 19, 20, 22, 24, 25, 27, 29, 30, 32, 34, 35, 37, 38, 39 | 18 both; 0 partial | 18 both; 0 partial | 18 | 14 lists/32 moves | 0 diagrams/0 panels | 18 | 0 | 18 | 0 | 14 |
| `7071` | `aiyokofu` | present (16046 bytes) | 14, 17, 18, 20, 21, 22, 24, 25, 27, 28, 29, 30, 31, 33, 34, 36 | 16 both; 0 partial | 16 both; 0 partial | 16 | 12 lists/24 moves | 0 diagrams/0 panels | 16 | 0 | 16 | 0 | 12 |
| `7105` | `yokofu-85hisha` | present (16800 bytes) | 14, 17, 18, 22, 23, 25, 27, 30, 33, 34, 36, 37, 39, 41, 43 | 15 both; 0 partial | 15 both; 0 partial | 15 | 13 lists/28 moves | 0 diagrams/0 panels | 15 | 0 | 15 | 0 | 13 |
| `7137` | `yokofu-yuuki` | present (12351 bytes) | 14, 17, 20, 23, 24, 25, 26, 27, 30, 31, 33, 34 | 12 both; 0 partial | 12 both; 0 partial | 12 | 10 lists/24 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 10 |
| `7182` | `aigakari-bougin` | present (11774 bytes) | 12, 15, 17, 18, 20, 22, 23, 24, 27, 28, 30 | 11 both; 0 partial | 11 both; 0 partial | 11 | 10 lists/29 moves | 0 diagrams/0 panels | 11 | 0 | 11 | 0 | 10 |
| `7205` | `hineribisha` | present (16781 bytes) | 12, 14, 17, 18, 20, 23, 25, 26, 28, 30, 31, 34, 37, 38, 39, 40 | 16 both; 0 partial | 16 both; 0 partial | 16 | 14 lists/45 moves | 0 diagrams/0 panels | 16 | 0 | 16 | 0 | 14 |
| `7230` | `ibisha-basics` | present (2516 bytes) | 4, 7 | 2 both; 0 partial | 2 both; 0 partial | 2 | 0 lists/0 moves | 0 diagrams/0 panels | 2 | 2 | 0 | 0 | 0 |
| `7238` | `taifuri-basics` | present (16228 bytes) | 2, 3, 5, 14, 17, 19, 21, 23, 25, 27, 28, 31, 33, 35, 36 | 15 both; 0 partial | 15 both; 0 partial | 15 | 12 lists/29 moves | 0 diagrams/0 panels | 15 | 0 | 15 | 0 | 12 |
| `7254` | `taifuri-bougin` | present (14734 bytes) | 13, 18, 19, 22, 23, 26, 27, 29, 30, 31, 33, 34, 35, 37 | 14 both; 0 partial | 14 both; 0 partial | 14 | 11 lists/33 moves | 0 diagrams/0 panels | 14 | 0 | 14 | 0 | 11 |
| `7282` | `taifuri-46gin` | present (21754 bytes) | 12, 15, 16, 19, 20, 22, 23, 25, 27, 28, 29, 30, 31, 33, 34, 36, 37, 39, 40, 41, 43 | 21 both; 0 partial | 21 both; 0 partial | 21 | 15 lists/39 moves | 0 diagrams/0 panels | 21 | 0 | 21 | 0 | 15 |
| `7339` | `taifuri-anaguma` | present (18148 bytes) | 13, 16, 18, 19, 22, 23, 25, 26, 28, 29, 31, 32, 34, 35, 37, 38 | 16 both; 0 partial | 16 both; 0 partial | 16 | 15 lists/68 moves | 0 diagrams/0 panels | 16 | 0 | 16 | 0 | 15 |
| `7368` | `endgame-tsumero` | present (11938 bytes) | 3, 5, 6, 16, 17, 19, 21, 22, 24, 26, 27, 28, 30, 31 | 14 both; 0 partial | 14 both; 0 partial | 14 | 10 lists/16 moves | 0 diagrams/0 panels | 14 | 14 | 10 | 0 | 10 |
| `7418` | `fujii-vs-anaguma` | present (19077 bytes) | 13, 16, 18, 19, 20, 22, 23, 25, 26, 28, 30, 32, 33, 35, 36, 37, 39 | 17 both; 0 partial | 17 both; 0 partial | 17 | 16 lists/44 moves | 0 diagrams/0 panels | 17 | 0 | 17 | 0 | 16 |
| `7420` | `fujii-build` | present (11238 bytes) | 12, 14, 17, 19, 21, 24, 25, 27, 29 | 9 both; 0 partial | 9 both; 0 partial | 9 | 5 lists/17 moves | 0 diagrams/0 panels | 9 | 0 | 9 | 0 | 4 |
| `7495` | `fujii-vs-hidarimino` | present (20103 bytes) | 12, 15, 16, 19, 20, 23, 24, 25, 27, 28, 29, 31, 33, 34, 36, 37, 38, 39 | 18 both; 0 partial | 18 both; 0 partial | 18 | 16 lists/42 moves | 0 diagrams/0 panels | 18 | 0 | 18 | 0 | 16 |
| `7513` | `fujii-vs-kyusen` | present (10862 bytes) | 12, 15, 17, 20, 21, 23, 24, 26, 27 | 9 both; 0 partial | 9 both; 0 partial | 9 | 7 lists/22 moves | 0 diagrams/0 panels | 9 | 0 | 9 | 0 | 7 |
| `7605` | `kakukoukan-gyakubougin` | present (23907 bytes) | 12, 15, 16, 18, 20, 22, 23, 25, 26, 28, 30, 32, 34, 36, 37, 39, 40, 42, 44, 45, 46, 47 | 22 both; 0 partial | 22 both; 0 partial | 22 | 16 lists/46 moves | 0 diagrams/0 panels | 22 | 0 | 22 | 0 | 16 |
| `7645` | `direct-mukai` | present (22952 bytes) | 12, 14, 17, 20, 22, 23, 24, 26, 28, 30, 31, 32, 33, 35, 36, 37, 40, 41, 44, 45 | 20 both; 0 partial | 20 both; 0 partial | 20 | 17 lists/53 moves | 0 diagrams/0 panels | 20 | 0 | 20 | 0 | 15 |
| `7700` | `legspe` | present (12559 bytes) | 2, 5, 7, 15, 16, 17, 20, 22, 23, 25, 27, 28 | 12 both; 0 partial | 12 both; 0 partial | 12 | 11 lists/39 moves | 0 diagrams/0 panels | 12 | 0 | 12 | 0 | 11 |
| `7747` | `yagura-aiyagura` | present (18382 bytes) | 14, 17, 18, 20, 21, 22, 24, 25, 27, 30, 32, 34, 36, 37, 38, 40, 41 | 17 both; 0 partial | 17 both; 0 partial | 17 | 16 lists/56 moves | 0 diagrams/0 panels | 17 | 0 | 17 | 0 | 15 |
| `7819` | `yagura-waki` | present (16065 bytes) | 14, 17, 20, 22, 23, 25, 26, 28, 29, 30, 32, 34, 35, 36, 37, 38 | 16 both; 0 partial | 16 both; 0 partial | 16 | 12 lists/53 moves | 0 diagrams/0 panels | 16 | 0 | 16 | 0 | 12 |
| `7863` | `taifuri-chousoku` | present (24138 bytes) | 12, 15, 16, 17, 19, 21, 23, 25, 27, 28, 29, 31, 32, 34, 35, 36, 37, 38, 40, 41 | 20 both; 0 partial | 20 both; 0 partial | 20 | 16 lists/68 moves | 0 diagrams/0 panels | 20 | 0 | 20 | 0 | 16 |
| `7936` | `taifuri-elmo` | present (11881 bytes) | 13, 16, 19, 22, 23, 25, 26, 29, 30, 31, 34, 35 | 12 both; 0 partial | 12 both; 0 partial | 12 | 7 lists/27 moves | 0 diagrams/0 panels | 12 | 1 | 11 | 0 | 7 |
| `7962` | `taifuri-vs-hayaishida` | present (14520 bytes) | 3, 6, 7, 9, 16, 18, 20, 22, 23, 25, 26, 28, 30 | 13 both; 0 partial | 13 both; 0 partial | 13 | 11 lists/21 moves | 0 diagrams/0 panels | 13 | 0 | 13 | 0 | 11 |
| `7988` | `taifuri-millennium` | present (10103 bytes) | 3, 12, 15, 18, 19, 21, 22, 24, 25, 26 | 10 both; 0 partial | 10 both; 0 partial | 10 | 7 lists/28 moves | 0 diagrams/0 panels | 10 | 1 | 9 | 0 | 7 |
| `8008` | `taifuri-ponpon` | present (11716 bytes) | 2, 5, 7, 15, 17, 19, 20, 21, 23, 25, 27 | 11 both; 0 partial | 11 both; 0 partial | 11 | 9 lists/36 moves | 0 diagrams/0 panels | 11 | 0 | 11 | 0 | 9 |
| `8037` | `mukai-build` | present (6275 bytes) | 2, 10, 12, 13, 15, 18 | 6 both; 0 partial | 6 both; 0 partial | 6 | 5 lists/23 moves | 0 diagrams/0 panels | 6 | 0 | 6 | 0 | 4 |
| `8048` | `mukai-attack` | present (13385 bytes) | 3, 5, 6, 8, 16, 19, 21, 22, 24, 25, 26, 28, 29 | 13 both; 0 partial | 13 both; 0 partial | 13 | 11 lists/32 moves | 0 diagrams/0 panels | 13 | 0 | 13 | 0 | 11 |
| `8083` | `rules-setup` | missing | — | 0 both; 0 partial | 0 both; 0 partial | 0 | 0 lists/0 moves | 0 diagrams/0 panels | 0 | 0 | 0 | 0 | 0 |
| `8322` | `proverb-three-pawns` | present (12928 bytes) | 11, 12, 14, 16, 17, 19, 20, 23, 24, 26, 28, 29, 30, 32, 35 | 15 both; 0 partial | 15 both; 0 partial | 15 | 8 lists/17 moves | 0 diagrams/0 panels | 15 | 15 | 11 | 0 | 8 |

### Per-figure metadata inventory

One row per extracted diagram across every JSON in the original figure directory, including the unplanned `6808` file. `Title` and `Explanation` report available locales only; no source prose is reproduced. `Line moves` is the count of the figure's explicit `line.moves` entries. `Fields` reports additional figure fields and exact boolean/enum values where applicable.

| Study ID | Planned unit | Figure ID | Title locales | Explanation locales | Image | Section locales | SFEN | Line moves | Line link | Crop panels | Mark fields | Piece items | Fields |
|---:|---|---:|---|---|---|---|---|---:|---|---:|---|---:|---|
| `19` | endgame-mate3 | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `19` | endgame-mate3 | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `19` | endgame-mate3 | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `109` | endgame-mate-tesuji | `5` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `6` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `109` | endgame-mate-tesuji | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `109` | endgame-mate-tesuji | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `109` | endgame-mate-tesuji | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `109` | endgame-mate-tesuji | `38` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `109` | endgame-mate-tesuji | `39` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `362` | aifuri-vs-ishida | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | view=gote |
| `362` | aifuri-vs-ishida | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | view=gote |
| `362` | aifuri-vs-ishida | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `362` | aifuri-vs-ishida | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `580` | basics-endgame | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `580` | basics-endgame | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `580` | basics-endgame | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `580` | basics-endgame | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `580` | basics-endgame | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `580` | basics-endgame | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `580` | basics-endgame | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `580` | basics-endgame | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `580` | basics-endgame | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `615` | rules-moves | `10` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 9 | — |
| `615` | rules-moves | `11` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `615` | rules-moves | `12` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `14` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `16` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `18` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `20` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `22` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `24` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `26` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `28` | ja+en | ja+en | yes | — | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `30` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `615` | rules-moves | `33` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `34` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `615` | rules-moves | `38` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `656` | rules-game | `10` | ja+en | ja+en | yes | — | yes | 0 | no | — | — | — | handsHidden=both; partial=True |
| `656` | rules-game | `11` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 9 | — |
| `656` | rules-game | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | handsHidden=both |
| `656` | rules-game | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | arrows,ghosts | — | handsHidden=both |
| `656` | rules-game | `23` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `656` | rules-game | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | arrows | — | — |
| `656` | rules-game | `29` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `722` | rules-promotion | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `722` | rules-promotion | `10` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `722` | rules-promotion | `13` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `722` | rules-promotion | `15` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `722` | rules-promotion | `17` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `722` | rules-promotion | `19` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `722` | rules-promotion | `28` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `722` | rules-promotion | `29` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `738` | rules-drops | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `738` | rules-drops | `5` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `738` | rules-drops | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | arrows | — | — |
| `738` | rules-drops | `15` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `738` | rules-drops | `18` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `746` | rules-checkmate | `9` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `746` | rules-checkmate | `12` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `746` | rules-checkmate | `18` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `746` | rules-checkmate | `21` | ja+en | ja+en | yes | ja+en | no | 0 | no | 4 | — | — | — |
| `746` | rules-checkmate | `24` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `758` | rules-draws | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | 4 | — | — | — |
| `758` | rules-draws | `13` | ja+en | ja+en | yes | ja+en | no | 0 | no | 4 | — | — | — |
| `777` | aifuri-ishida-vs-naka | `16` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `32` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `777` | aifuri-ishida-vs-naka | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `777` | aifuri-ishida-vs-naka | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `777` | aifuri-ishida-vs-naka | `38` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `39` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `42` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `45` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `46` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `49` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `50` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `777` | aifuri-ishida-vs-naka | `51` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `813` | rules-fouls | `13` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `813` | rules-fouls | `15` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `813` | rules-fouls | `16` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `813` | rules-fouls | `18` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `813` | rules-fouls | `19` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `813` | rules-fouls | `22` | ja+en | ja+en | yes | ja+en | no | 0 | no | 4 | — | — | — |
| `829` | aifuri-basics | `0` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `829` | aifuri-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `875` | attack-kinmusou | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `875` | attack-kinmusou | `7` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `12` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `14` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `20` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `875` | attack-kinmusou | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `28` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `875` | attack-kinmusou | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `875` | attack-kinmusou | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `875` | attack-kinmusou | `44` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `46` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `49` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `50` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `875` | attack-kinmusou | `51` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `54` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `875` | attack-kinmusou | `59` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `875` | attack-kinmusou | `60` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `63` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `875` | attack-kinmusou | `64` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `932` | rules-draws | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | handsHidden=both; partial=True |
| `932` | rules-draws | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `932` | rules-draws | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | boxes | — | — |
| `932` | rules-draws | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `932` | rules-draws | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `932` | rules-draws | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | boxes,dashed | — | — |
| `932` | rules-draws | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `932` | rules-draws | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | handsHidden=both; partial=True |
| `932` | rules-draws | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | handsHidden=both; partial=True |
| `974` | taifuri-45hayashikake | `0` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `974` | taifuri-45hayashikake | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `974` | taifuri-45hayashikake | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `974` | taifuri-45hayashikake | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `974` | taifuri-45hayashikake | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `974` | taifuri-45hayashikake | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `974` | taifuri-45hayashikake | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `974` | taifuri-45hayashikake | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `974` | taifuri-45hayashikake | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1001` | shiken-tateishi | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1001` | shiken-tateishi | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1001` | shiken-tateishi | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1001` | shiken-tateishi | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1001` | shiken-tateishi | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1001` | shiken-tateishi | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1001` | shiken-tateishi | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1001` | shiken-tateishi | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1001` | shiken-tateishi | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1001` | shiken-tateishi | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1001` | shiken-tateishi | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1021` | basics-value | `0` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1021` | basics-value | `1` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `4` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1021` | basics-value | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `15` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 7 | — |
| `1021` | basics-value | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1021` | basics-value | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1021` | basics-value | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1067` | basics-forks | `0` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1067` | basics-forks | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1067` | basics-forks | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1067` | basics-forks | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1067` | basics-forks | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1067` | basics-forks | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1067` | basics-forks | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1070` | attack-mino-aifuri | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1070` | attack-mino-aifuri | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1070` | attack-mino-aifuri | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `27` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1070` | attack-mino-aifuri | `35` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `38` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1070` | attack-mino-aifuri | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `43` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `45` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1070` | attack-mino-aifuri | `49` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `51` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `53` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1070` | attack-mino-aifuri | `54` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1106` | rules-setup | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | handsHidden=both |
| `1137` | rules-setup | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | handsHidden=both |
| `1137` | rules-setup | `14` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1137` | rules-setup | `16` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1137` | rules-setup | `21` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 5 | — |
| `1247` | kakukoukan-shiken | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1247` | kakukoukan-shiken | `15` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `18` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `20` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1247` | kakukoukan-shiken | `25` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `1247` | kakukoukan-shiken | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1313` | tesuji-silver | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `1313` | tesuji-silver | `3` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1313` | tesuji-silver | `4` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1313` | tesuji-silver | `6` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1313` | tesuji-silver | `15` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1313` | tesuji-silver | `16` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1313` | tesuji-silver | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1313` | tesuji-silver | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1313` | tesuji-silver | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1313` | tesuji-silver | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1313` | tesuji-silver | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1313` | tesuji-silver | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1313` | tesuji-silver | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1313` | tesuji-silver | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1313` | tesuji-silver | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1313` | tesuji-silver | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1331` | tesuji-knight | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `1331` | tesuji-knight | `3` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1331` | tesuji-knight | `4` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1331` | tesuji-knight | `6` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1331` | tesuji-knight | `9` | ja+en | ja+en | yes | ja+en | no | 0 | no | 2 | — | — | — |
| `1331` | tesuji-knight | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1331` | tesuji-knight | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `20` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `27` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1331` | tesuji-knight | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1331` | tesuji-knight | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1331` | tesuji-knight | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1331` | tesuji-knight | `40` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1331` | tesuji-knight | `44` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `46` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1331` | tesuji-knight | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1331` | tesuji-knight | `50` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1486` | tesuji-lance | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `1486` | tesuji-lance | `3` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1486` | tesuji-lance | `5` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1486` | tesuji-lance | `7` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1486` | tesuji-lance | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1486` | tesuji-lance | `22` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `1486` | tesuji-lance | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1486` | tesuji-lance | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1486` | tesuji-lance | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1486` | tesuji-lance | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1486` | tesuji-lance | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1486` | tesuji-lance | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1486` | tesuji-lance | `40` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1486` | tesuji-lance | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1486` | tesuji-lance | `43` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1486` | tesuji-lance | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1516` | tesuji-gold | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `1516` | tesuji-gold | `3` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1516` | tesuji-gold | `4` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1516` | tesuji-gold | `6` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1516` | tesuji-gold | `15` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1516` | tesuji-gold | `16` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1516` | tesuji-gold | `17` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1516` | tesuji-gold | `18` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1516` | tesuji-gold | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1516` | tesuji-gold | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1516` | tesuji-gold | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1516` | tesuji-gold | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1516` | tesuji-gold | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1516` | tesuji-gold | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1516` | tesuji-gold | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1516` | tesuji-gold | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1516` | tesuji-gold | `45` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1516` | tesuji-gold | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1516` | tesuji-gold | `49` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `1541` | tesuji-rook | `3` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1541` | tesuji-rook | `4` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1541` | tesuji-rook | `6` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1541` | tesuji-rook | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1541` | tesuji-rook | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1541` | tesuji-rook | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1541` | tesuji-rook | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1541` | tesuji-rook | `23` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1541` | tesuji-rook | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1541` | tesuji-rook | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1541` | tesuji-rook | `40` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1541` | tesuji-rook | `44` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1541` | tesuji-rook | `45` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1586` | tesuji-bishop | `2` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `1586` | tesuji-bishop | `3` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1586` | tesuji-bishop | `4` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1586` | tesuji-bishop | `6` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1586` | tesuji-bishop | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1586` | tesuji-bishop | `16` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1586` | tesuji-bishop | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1586` | tesuji-bishop | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1586` | tesuji-bishop | `22` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `1586` | tesuji-bishop | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1586` | tesuji-bishop | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1586` | tesuji-bishop | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1586` | tesuji-bishop | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1586` | tesuji-bishop | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1586` | tesuji-bishop | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `1586` | tesuji-bishop | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1586` | tesuji-bishop | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1586` | tesuji-bishop | `43` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1586` | tesuji-bishop | `44` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1586` | tesuji-bishop | `47` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1586` | tesuji-bishop | `49` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `1629` | tesuji-pawn | `3` | ja+en | ja+en | yes | ja+en | no | 0 | no | — | — | 2 | — |
| `1629` | tesuji-pawn | `4` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1629` | tesuji-pawn | `5` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1629` | tesuji-pawn | `7` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1629` | tesuji-pawn | `16` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1629` | tesuji-pawn | `17` | ja+en | ja+en | yes | ja+en | no | 0 | no | 1 | — | — | — |
| `1629` | tesuji-pawn | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1629` | tesuji-pawn | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1629` | tesuji-pawn | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1629` | tesuji-pawn | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `39` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `44` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `47` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `50` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `51` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1629` | tesuji-pawn | `53` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `54` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `1629` | tesuji-pawn | `55` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1629` | tesuji-pawn | `57` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1629` | tesuji-pawn | `58` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `1699` | shiken-vs-migishiken | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1699` | shiken-vs-migishiken | `17` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `23` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1699` | shiken-vs-migishiken | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1699` | shiken-vs-migishiken | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1699` | shiken-vs-migishiken | `29` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `35` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `40` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `42` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `44` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `45` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `49` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1699` | shiken-vs-migishiken | `50` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1699` | shiken-vs-migishiken | `51` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `1699` | shiken-vs-migishiken | `54` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1699` | shiken-vs-migishiken | `55` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1741` | shiken-vs-yagura | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1741` | shiken-vs-yagura | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1741` | shiken-vs-yagura | `51` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `47` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `49` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `52` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `53` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `54` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `55` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `58` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1783` | proverb-gold-last | `59` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `60` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1783` | proverb-gold-last | `61` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1821` | basics-mate-words | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1821` | basics-mate-words | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1821` | basics-mate-words | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1821` | basics-mate-words | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1821` | basics-mate-words | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1821` | basics-mate-words | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1821` | basics-mate-words | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1821` | basics-mate-words | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1821` | basics-mate-words | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1821` | basics-mate-words | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `1821` | basics-mate-words | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1821` | basics-mate-words | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1821` | basics-mate-words | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1821` | basics-mate-words | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1852` | yagura-build | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1852` | yagura-build | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1852` | yagura-build | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | no | — | — | — | partial=True |
| `1852` | yagura-build | `20` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | — | — | partial=True |
| `1852` | yagura-build | `22` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | — | — | partial=True |
| `1852` | yagura-build | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | — | — | partial=True |
| `1852` | yagura-build | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1852` | yagura-build | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | no | — | last | — | — |
| `1852` | yagura-build | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `1852` | yagura-build | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `1852` | yagura-build | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1852` | yagura-build | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | no | — | last | — | — |
| `1852` | yagura-build | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `1852` | yagura-build | `38` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `1852` | yagura-build | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `1852` | yagura-build | `40` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | view=gote |
| `1852` | yagura-build | `42` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `1852` | yagura-build | `45` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `1852` | yagura-build | `48` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `1852` | yagura-build | `49` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `1852` | yagura-build | `51` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `1852` | yagura-build | `52` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `1852` | yagura-build | `54` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `1854` | endgame-mate1 | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `45` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `47` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `49` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `52` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `53` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `54` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `55` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `56` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `57` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `60` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `61` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `62` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `63` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `1854` | endgame-mate1 | `64` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `1854` | endgame-mate1 | `65` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2105` | yagura-37gin | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2105` | yagura-37gin | `16` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2105` | yagura-37gin | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `2105` | yagura-37gin | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2105` | yagura-37gin | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2105` | yagura-37gin | `21` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2105` | yagura-37gin | `23` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `2105` | yagura-37gin | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2105` | yagura-37gin | `27` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `2105` | yagura-37gin | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2105` | yagura-37gin | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2105` | yagura-37gin | `33` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2105` | yagura-37gin | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2105` | yagura-37gin | `35` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2105` | yagura-37gin | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2105` | yagura-37gin | `39` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2105` | yagura-37gin | `42` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2105` | yagura-37gin | `44` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2105` | yagura-37gin | `45` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2105` | yagura-37gin | `46` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2105` | yagura-37gin | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2105` | yagura-37gin | `49` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2105` | yagura-37gin | `50` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2105` | yagura-37gin | `52` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2105` | yagura-37gin | `53` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2105` | yagura-37gin | `55` | ja+en | ja+en | yes | ja+en | yes | 9 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `11` | ja+en | ja+en | yes | ja+en | yes | 18 | no | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `12` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `14` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `22` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `26` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `31` | ja+en | ja+en | yes | ja+en | yes | 13 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `33` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `38` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `39` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2204` | taifuri-vs-kakukoukan | `40` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2276` | attack-yagura-side | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2276` | attack-yagura-side | `14` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `21` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2276` | attack-yagura-side | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2276` | attack-yagura-side | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2276` | attack-yagura-side | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `35` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `36` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `40` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2276` | attack-yagura-side | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2276` | attack-yagura-side | `46` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2276` | attack-yagura-side | `47` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2313` | attack-yagura-head | `14` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2313` | attack-yagura-head | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2313` | attack-yagura-head | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2313` | attack-yagura-head | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2313` | attack-yagura-head | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `35` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2313` | attack-yagura-head | `39` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2313` | attack-yagura-head | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2313` | attack-yagura-head | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2313` | attack-yagura-head | `46` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `47` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2313` | attack-yagura-head | `50` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `2313` | attack-yagura-head | `52` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2375` | endgame-yose | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2375` | endgame-yose | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2375` | endgame-yose | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2375` | endgame-yose | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `31` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `32` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `38` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2375` | endgame-yose | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2375` | endgame-yose | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2418` | endgame-tsume-study | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2418` | endgame-tsume-study | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2418` | endgame-tsume-study | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2418` | endgame-tsume-study | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2418` | endgame-tsume-study | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2418` | endgame-tsume-study | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2426` | shiken-basics | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2426` | shiken-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2426` | shiken-basics | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `2426` | shiken-basics | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | no | — | last | — | — |
| `2426` | shiken-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2426` | shiken-basics | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2426` | shiken-basics | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2426` | shiken-basics | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2426` | shiken-basics | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2426` | shiken-basics | `35` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2426` | shiken-basics | `37` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2426` | shiken-basics | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2426` | shiken-basics | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2426` | shiken-basics | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2426` | shiken-basics | `47` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2472` | shiken-castles | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2472` | shiken-castles | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2472` | shiken-castles | `19` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | — | — | partial=True |
| `2472` | shiken-castles | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2472` | shiken-castles | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | — | — | partial=True |
| `2472` | shiken-castles | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2472` | shiken-castles | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2472` | shiken-castles | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2472` | shiken-castles | `33` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | — | — | partial=True |
| `2472` | shiken-castles | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `47` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2491` | shiken-patterns | `49` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2519` | shiken-vs-igyoku-bougin | `16` | ja+en | ja+en | yes | ja+en | yes | 12 | no | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2519` | shiken-vs-igyoku-bougin | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `16` | ja+en | ja+en | yes | ja+en | yes | 13 | no | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `20` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `27` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `40` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `43` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `44` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `46` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `49` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `52` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `54` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `58` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `60` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2556` | shiken-vs-funa-bougin | `62` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2590` | basics-bishop-trade | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2590` | basics-bishop-trade | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2590` | basics-bishop-trade | `13` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `2590` | basics-bishop-trade | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2590` | basics-bishop-trade | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2590` | basics-bishop-trade | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2590` | basics-bishop-trade | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2590` | basics-bishop-trade | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2590` | basics-bishop-trade | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2590` | basics-bishop-trade | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2590` | basics-bishop-trade | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2590` | basics-bishop-trade | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2590` | basics-bishop-trade | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2615` | attack-mino-kobin | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2615` | attack-mino-kobin | `16` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2615` | attack-mino-kobin | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2615` | attack-mino-kobin | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2615` | attack-mino-kobin | `33` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `34` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2615` | attack-mino-kobin | `40` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2615` | attack-mino-kobin | `44` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2646` | attack-mino-side | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2646` | attack-mino-side | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2646` | attack-mino-side | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2646` | attack-mino-side | `30` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2646` | attack-mino-side | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2646` | attack-mino-side | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2646` | attack-mino-side | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2646` | attack-mino-side | `42` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2646` | attack-mino-side | `48` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2646` | attack-mino-side | `50` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2676` | bougin-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2676` | bougin-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2676` | bougin-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2676` | bougin-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2676` | bougin-basics | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2676` | bougin-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2676` | bougin-basics | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2676` | bougin-basics | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2676` | bougin-basics | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2676` | bougin-basics | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2676` | bougin-basics | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2676` | bougin-basics | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2676` | bougin-basics | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2676` | bougin-basics | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2676` | bougin-basics | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2676` | bougin-basics | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2676` | bougin-basics | `50` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2676` | bougin-basics | `52` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2695` | bougin-middlegame | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2695` | bougin-middlegame | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `25` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2695` | bougin-middlegame | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2695` | bougin-middlegame | `40` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `42` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `45` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `2695` | bougin-middlegame | `47` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2695` | bougin-middlegame | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2695` | bougin-middlegame | `49` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2744` | shiken-vs-anaguma | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2744` | shiken-vs-anaguma | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `2744` | shiken-vs-anaguma | `16` | ja+en | ja+en | yes | ja+en | yes | 8 | no | — | last | — | — |
| `2744` | shiken-vs-anaguma | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `22` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `35` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `36` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `38` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `42` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `45` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `46` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2744` | shiken-vs-anaguma | `47` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2807` | kishu-onigoroshi | `13` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `25` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `34` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `35` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `41` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `2807` | kishu-onigoroshi | `42` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `13` | ja+en | ja+en | yes | ja+en | yes | 2 | no | — | last | — | view=gote |
| `2840` | kishu-pacman | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `21` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `2840` | kishu-pacman | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `2865` | kakugawari-basics | `12` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | last | — | — |
| `2865` | kakugawari-basics | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2865` | kakugawari-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2865` | kakugawari-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2865` | kakugawari-basics | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2865` | kakugawari-basics | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2865` | kakugawari-basics | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2865` | kakugawari-basics | `42` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `46` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `48` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `49` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `50` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `51` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `52` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2865` | kakugawari-basics | `54` | ja+en | ja+en | yes | ja+en | yes | 9 | yes | — | last | — | — |
| `2911` | basics-plan | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2911` | basics-plan | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `2911` | basics-plan | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2911` | basics-plan | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2911` | basics-plan | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `2911` | basics-plan | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2911` | basics-plan | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2911` | basics-plan | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2911` | basics-plan | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2911` | basics-plan | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `2911` | basics-plan | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2947` | yagura-vs-bougin | `14` | ja+en | ja+en | yes | ja+en | yes | 12 | no | — | last | — | — |
| `2947` | yagura-vs-bougin | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `24` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2947` | yagura-vs-bougin | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `2947` | yagura-vs-bougin | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `35` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `36` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `38` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `40` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `42` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `43` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `2947` | yagura-vs-bougin | `49` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `52` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `53` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `55` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `57` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `58` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `59` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `2947` | yagura-vs-bougin | `63` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `3014` | attack-anaguma | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3014` | attack-anaguma | `12` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3014` | attack-anaguma | `15` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3014` | attack-anaguma | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3014` | attack-anaguma | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3014` | attack-anaguma | `21` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3014` | attack-anaguma | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3014` | attack-anaguma | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3014` | attack-anaguma | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3014` | attack-anaguma | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3014` | attack-anaguma | `39` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3048` | attack-funa | `12` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3048` | attack-funa | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3048` | attack-funa | `17` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3048` | attack-funa | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3048` | attack-funa | `28` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3048` | attack-funa | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3048` | attack-funa | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3048` | attack-funa | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3048` | attack-funa | `34` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3048` | attack-funa | `37` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `42` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `43` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `3048` | attack-funa | `44` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3156` | basics-opening | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `3156` | basics-opening | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3156` | basics-opening | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3156` | basics-opening | `19` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | — |
| `3156` | basics-opening | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3156` | basics-opening | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3156` | basics-opening | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3156` | basics-opening | `27` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | last | — | — |
| `3156` | basics-opening | `28` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `3156` | basics-opening | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3156` | basics-opening | `35` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `3156` | basics-opening | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3156` | basics-opening | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3156` | basics-opening | `42` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | — |
| `3156` | basics-opening | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3156` | basics-opening | `46` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3156` | basics-opening | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3198` | basics-middlegame | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3198` | basics-middlegame | `16` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3198` | basics-middlegame | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3198` | basics-middlegame | `23` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3198` | basics-middlegame | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3198` | basics-middlegame | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `32` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `33` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3198` | basics-middlegame | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `3198` | basics-middlegame | `38` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3198` | basics-middlegame | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3198` | basics-middlegame | `47` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3198` | basics-middlegame | `51` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3198` | basics-middlegame | `52` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3239` | basics-endgame | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3239` | basics-endgame | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3239` | basics-endgame | `20` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3239` | basics-endgame | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3239` | basics-endgame | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3239` | basics-endgame | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3239` | basics-endgame | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3239` | basics-endgame | `31` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3239` | basics-endgame | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3239` | basics-endgame | `33` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `3239` | basics-endgame | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `3271` | basics-attack-defense | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3271` | basics-attack-defense | `6` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3271` | basics-attack-defense | `7` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3271` | basics-attack-defense | `8` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3271` | basics-attack-defense | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3271` | basics-attack-defense | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3271` | basics-attack-defense | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3271` | basics-attack-defense | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3271` | basics-attack-defense | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3271` | basics-attack-defense | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `3271` | basics-attack-defense | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3271` | basics-attack-defense | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3457` | yagura-bougin | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3457` | yagura-bougin | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3457` | yagura-bougin | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `3457` | yagura-bougin | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3457` | yagura-bougin | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `3497` | kakugawari-bougin | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3497` | kakugawari-bougin | `17` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `23` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `24` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `31` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `35` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `39` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3497` | kakugawari-bougin | `42` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `43` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `3497` | kakugawari-bougin | `45` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3497` | kakugawari-bougin | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3783` | yokofu-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3783` | yokofu-basics | `16` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `3783` | yokofu-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `3783` | yokofu-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3783` | yokofu-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3783` | yokofu-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3783` | yokofu-basics | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3783` | yokofu-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3783` | yokofu-basics | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3783` | yokofu-basics | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3783` | yokofu-basics | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3783` | yokofu-basics | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3826` | yokofu-45kaku | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3826` | yokofu-45kaku | `17` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `21` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `3826` | yokofu-45kaku | `28` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `30` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `31` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `36` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `39` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `3826` | yokofu-45kaku | `40` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4314` | yokofu-aono | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4314` | yokofu-aono | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4314` | yokofu-aono | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4314` | yokofu-aono | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4314` | yokofu-aono | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4314` | yokofu-aono | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4314` | yokofu-aono | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4314` | yokofu-aono | `30` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4314` | yokofu-aono | `32` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4314` | yokofu-aono | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4314` | yokofu-aono | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4314` | yokofu-aono | `38` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4314` | yokofu-aono | `40` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4314` | yokofu-aono | `42` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `4314` | yokofu-aono | `43` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4314` | yokofu-aono | `46` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4502` | taifuri-bougin-ishida | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `20` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `24` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `25` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `28` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `30` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `33` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `36` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `37` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `39` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `42` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `44` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `4502` | taifuri-bougin-ishida | `48` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `4633` | endgame-mate3 | `4` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4633` | endgame-mate3 | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4633` | endgame-mate3 | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `4717` | ibisha-basics | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4717` | ibisha-basics | `7` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4717` | ibisha-basics | `8` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4717` | ibisha-basics | `9` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4717` | ibisha-basics | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4717` | ibisha-basics | `12` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4717` | ibisha-basics | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4717` | ibisha-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4717` | ibisha-basics | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4717` | ibisha-basics | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4717` | ibisha-basics | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4717` | ibisha-basics | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4717` | ibisha-basics | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `4717` | ibisha-basics | `40` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `4717` | ibisha-basics | `42` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `4717` | ibisha-basics | `44` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `4717` | ibisha-basics | `46` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `4717` | ibisha-basics | `47` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `4717` | ibisha-basics | `50` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4717` | ibisha-basics | `55` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4747` | handicap-8 | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4747` | handicap-8 | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4747` | handicap-8 | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4747` | handicap-8 | `18` | ja+en | ja+en | yes | ja+en | yes | 9 | yes | — | last | — | — |
| `4747` | handicap-8 | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4747` | handicap-8 | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4747` | handicap-8 | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4747` | handicap-8 | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4747` | handicap-8 | `31` | ja+en | ja+en | yes | ja+en | yes | 11 | yes | — | last | — | — |
| `4747` | handicap-8 | `33` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4747` | handicap-8 | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4747` | handicap-8 | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4747` | handicap-8 | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4747` | handicap-8 | `40` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4747` | handicap-8 | `44` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4747` | handicap-8 | `46` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4747` | handicap-8 | `47` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4779` | handicap-6 | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4779` | handicap-6 | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4779` | handicap-6 | `17` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `4779` | handicap-6 | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4779` | handicap-6 | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4779` | handicap-6 | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4779` | handicap-6 | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4779` | handicap-6 | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4779` | handicap-6 | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4779` | handicap-6 | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4779` | handicap-6 | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4779` | handicap-6 | `31` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4779` | handicap-6 | `32` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `4779` | handicap-6 | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4779` | handicap-6 | `37` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4779` | handicap-6 | `38` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4779` | handicap-6 | `39` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4815` | handicap-4 | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4815` | handicap-4 | `16` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `4815` | handicap-4 | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4815` | handicap-4 | `21` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `4815` | handicap-4 | `22` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4815` | handicap-4 | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4815` | handicap-4 | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4815` | handicap-4 | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4815` | handicap-4 | `31` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4815` | handicap-4 | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4815` | handicap-4 | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4815` | handicap-4 | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4815` | handicap-4 | `36` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4815` | handicap-4 | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4815` | handicap-4 | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4815` | handicap-4 | `42` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4815` | handicap-4 | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4815` | handicap-4 | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4815` | handicap-4 | `45` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `15` | ja+en | ja+en | yes | ja+en | yes | 8 | no | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `18` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `19` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `21` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `23` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `26` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `28` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `33` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `36` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4848` | yagura-vs-hidarimino | `40` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4878` | handicap-2 | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | — |
| `4878` | handicap-2 | `14` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `4878` | handicap-2 | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4878` | handicap-2 | `18` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `4878` | handicap-2 | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4878` | handicap-2 | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4878` | handicap-2 | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4878` | handicap-2 | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4878` | handicap-2 | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4917` | yagura-vs-migishiken | `16` | ja+en | ja+en | yes | ja+en | yes | 8 | no | — | last | — | — |
| `4917` | yagura-vs-migishiken | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `21` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4917` | yagura-vs-migishiken | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4917` | yagura-vs-migishiken | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `30` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `33` | ja+en | ja+en | yes | ja+en | yes | 12 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `35` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `36` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4917` | yagura-vs-migishiken | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4961` | kishu-migishiken-hidarimino | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `4961` | kishu-migishiken-hidarimino | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `29` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `31` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `33` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `39` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `41` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `42` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `4961` | kishu-migishiken-hidarimino | `44` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5001` | kishu-sujichigai | `14` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `17` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `18` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `20` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `21` | ja+en | ja+en | yes | ja+en | yes | 14 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `23` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `26` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `27` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `29` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `31` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `5001` | kishu-sujichigai | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5040` | gokigen-basics | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `22` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5040` | gokigen-basics | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5040` | gokigen-basics | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5040` | gokigen-basics | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5256` | hayaishida | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5256` | hayaishida | `14` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5256` | hayaishida | `16` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5256` | hayaishida | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5256` | hayaishida | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5256` | hayaishida | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5256` | hayaishida | `21` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5256` | hayaishida | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5256` | hayaishida | `25` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5256` | hayaishida | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5256` | hayaishida | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5256` | hayaishida | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5256` | hayaishida | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5283` | kishu-ahiru | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5283` | kishu-ahiru | `4` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `11` | ja+en | ja+en | yes | ja+en | yes | 15 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `13` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5283` | kishu-ahiru | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `19` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `21` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `5283` | kishu-ahiru | `25` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `5325` | endgame-mate-tesuji | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5325` | endgame-mate-tesuji | `5` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `6` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `8` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5325` | endgame-mate-tesuji | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `19` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5325` | endgame-mate-tesuji | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5325` | endgame-mate-tesuji | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5325` | endgame-mate-tesuji | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5325` | endgame-mate-tesuji | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5361` | rules-tsume | `12` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5361` | rules-tsume | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5361` | rules-tsume | `17` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5361` | rules-tsume | `21` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5361` | rules-tsume | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5361` | rules-tsume | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `5361` | rules-tsume | `33` | ja+en | ja+en | yes | ja+en | yes | 13 | yes | — | last | — | partial=True |
| `5461` | gokigen-vs-choukyusen | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `19` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `21` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `23` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5461` | gokigen-vs-choukyusen | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5499` | ureshino-counter | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5499` | ureshino-counter | `12` | ja+en | ja+en | yes | ja+en | yes | 9 | yes | — | last | — | — |
| `5499` | ureshino-counter | `14` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `5499` | ureshino-counter | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5499` | ureshino-counter | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5499` | ureshino-counter | `18` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5499` | ureshino-counter | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5499` | ureshino-counter | `20` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `5499` | ureshino-counter | `21` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5519` | ureshino-basics | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5519` | ureshino-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `5519` | ureshino-basics | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5519` | ureshino-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `5519` | ureshino-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5519` | ureshino-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `5519` | ureshino-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5519` | ureshino-basics | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5519` | ureshino-basics | `24` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `5519` | ureshino-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5546` | ureshino-vs-bougin | `14` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5546` | ureshino-vs-bougin | `20` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5546` | ureshino-vs-bougin | `29` | ja+en | ja+en | yes | ja+en | yes | 11 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5546` | ureshino-vs-bougin | `35` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5571` | ureshino-new | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5571` | ureshino-new | `3` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5571` | ureshino-new | `5` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `5571` | ureshino-new | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5571` | ureshino-new | `14` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5571` | ureshino-new | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5571` | ureshino-new | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5571` | ureshino-new | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5584` | ureshino-vs-shiken | `15` | ja+en | ja+en | yes | ja+en | yes | 11 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `17` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `20` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `21` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `28` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `33` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5584` | ureshino-vs-shiken | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5608` | ureshino-basics | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5608` | ureshino-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5608` | ureshino-basics | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5608` | ureshino-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5608` | ureshino-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5619` | gokigen-attack | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `5619` | gokigen-attack | `17` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | view=gote |
| `5619` | gokigen-attack | `19` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `5619` | gokigen-attack | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5619` | gokigen-attack | `21` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5619` | gokigen-attack | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5619` | gokigen-attack | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `5619` | gokigen-attack | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `5619` | gokigen-attack | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `5845` | gangi | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5845` | gangi | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5845` | gangi | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5845` | gangi | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5845` | gangi | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5845` | gangi | `28` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `5845` | gangi | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5845` | gangi | `33` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5845` | gangi | `34` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `5845` | gangi | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5845` | gangi | `37` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `5845` | gangi | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5873` | aigakari-basics | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5873` | aigakari-basics | `10` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | last | — | — |
| `5873` | aigakari-basics | `12` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5873` | aigakari-basics | `13` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5873` | aigakari-basics | `15` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5873` | aigakari-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5873` | aigakari-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5873` | aigakari-basics | `19` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5873` | aigakari-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5873` | aigakari-basics | `22` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5873` | aigakari-basics | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5896` | gangi | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5896` | gangi | `17` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5896` | gangi | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5896` | gangi | `20` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `5896` | gangi | `22` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `5896` | gangi | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5896` | gangi | `25` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `5896` | gangi | `27` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `5896` | gangi | `30` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `5896` | gangi | `33` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `5896` | gangi | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5896` | gangi | `35` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `5928` | yagura-suzume | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5928` | yagura-suzume | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5928` | yagura-suzume | `18` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `5928` | yagura-suzume | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5928` | yagura-suzume | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `5928` | yagura-suzume | `21` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `5928` | yagura-suzume | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5928` | yagura-suzume | `25` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `5928` | yagura-suzume | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5928` | yagura-suzume | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5928` | yagura-suzume | `29` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `5928` | yagura-suzume | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5928` | yagura-suzume | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5928` | yagura-suzume | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5928` | yagura-suzume | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `5928` | yagura-suzume | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `5958` | castles-yagura | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `7` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `8` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | — | — | partial=True |
| `5958` | castles-yagura | `9` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | — | — | partial=True |
| `5958` | castles-yagura | `10` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | — | — | partial=True |
| `5958` | castles-yagura | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5958` | castles-yagura | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `4` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | — | — | partial=True |
| `5985` | castles-mino | `5` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | — | — | partial=True |
| `5985` | castles-mino | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `5985` | castles-mino | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `5` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `6` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | — | — | partial=True |
| `6007` | castles-hidarimino | `7` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | — | — | partial=True |
| `6007` | castles-hidarimino | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6007` | castles-hidarimino | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `4` | ja+en | ja+en | yes | ja+en | yes | 6 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `5` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | — | — | partial=True |
| `6021` | castles-anaguma | `6` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | — | — | partial=True |
| `6021` | castles-anaguma | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6021` | castles-anaguma | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6044` | castles-funa | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6044` | castles-funa | `6` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | — | — | partial=True |
| `6044` | castles-funa | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6044` | castles-funa | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6044` | castles-funa | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6044` | castles-funa | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6044` | castles-funa | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6053` | castles-aifuri | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6053` | castles-aifuri | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6053` | castles-aifuri | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6053` | castles-aifuri | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6053` | castles-aifuri | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6053` | castles-aifuri | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6062` | castles-nakazumai | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6062` | castles-nakazumai | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6062` | castles-nakazumai | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6062` | castles-nakazumai | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6062` | castles-nakazumai | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `5` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `8` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6068` | castles-first | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6068` | castles-first | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6068` | castles-first | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6068` | castles-first | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6076` | castles-other | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6076` | castles-other | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6076` | castles-other | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6076` | castles-other | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6076` | castles-other | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6076` | castles-other | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6076` | castles-other | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6154` | aifuri-hidari-anaguma | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6154` | aifuri-hidari-anaguma | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6154` | aifuri-hidari-anaguma | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6154` | aifuri-hidari-anaguma | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6154` | aifuri-hidari-anaguma | `21` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `6154` | aifuri-hidari-anaguma | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6154` | aifuri-hidari-anaguma | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6154` | aifuri-hidari-anaguma | `26` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `6154` | aifuri-hidari-anaguma | `27` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6174` | gokigen-vs-anaguma | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `17` | ja+en | ja+en | yes | ja+en | yes | 9 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `18` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `20` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `21` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `22` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `24` | ja+en | ja+en | yes | ja+en | yes | 13 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6174` | gokigen-vs-anaguma | `29` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `6200` | ishida-basics | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6200` | ishida-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6200` | ishida-basics | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6200` | ishida-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6200` | ishida-basics | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6200` | ishida-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6200` | ishida-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6200` | ishida-basics | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6200` | ishida-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6200` | ishida-basics | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6200` | ishida-basics | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6200` | ishida-basics | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6200` | ishida-basics | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `6200` | ishida-basics | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6436` | ishida-honkumi | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6436` | ishida-honkumi | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6436` | ishida-honkumi | `18` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `6436` | ishida-honkumi | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6436` | ishida-honkumi | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6436` | ishida-honkumi | `22` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `6436` | ishida-honkumi | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6436` | ishida-honkumi | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6436` | ishida-honkumi | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6436` | ishida-honkumi | `28` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6436` | ishida-honkumi | `30` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6460` | ishida-attack | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6460` | ishida-attack | `15` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `6460` | ishida-attack | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6460` | ishida-attack | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6460` | ishida-attack | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6460` | ishida-attack | `21` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6460` | ishida-attack | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6460` | ishida-attack | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6460` | ishida-attack | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6460` | ishida-attack | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6460` | ishida-attack | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `6460` | ishida-attack | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6460` | ishida-attack | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6496` | yokofu-avoid | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6496` | yokofu-avoid | `12` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | last | — | — |
| `6496` | yokofu-avoid | `14` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6496` | yokofu-avoid | `17` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | last | — | — |
| `6496` | yokofu-avoid | `21` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6496` | yokofu-avoid | `24` | ja+en | ja+en | yes | ja+en | yes | 14 | no | — | last | — | — |
| `6496` | yokofu-avoid | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6496` | yokofu-avoid | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | — |
| `6496` | yokofu-avoid | `30` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | last | — | view=gote |
| `6496` | yokofu-avoid | `32` | ja+en | ja+en | yes | ja+en | yes | 7 | no | — | last | — | view=gote |
| `6496` | yokofu-avoid | `33` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `18` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `20` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `22` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `31` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `35` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `36` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `37` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6514` | gokigen-vs-chousoku | `39` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | view=gote |
| `6540` | bougin-castles | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6540` | bougin-castles | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6540` | bougin-castles | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6540` | bougin-castles | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6540` | bougin-castles | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6540` | bougin-castles | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6549` | bougin-vs-furibisha | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6549` | bougin-vs-furibisha | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `16` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `6549` | bougin-vs-furibisha | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `6566` | gokigen-castles | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `6566` | gokigen-castles | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6566` | gokigen-castles | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6566` | gokigen-castles | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6566` | gokigen-castles | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6566` | gokigen-castles | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6566` | gokigen-castles | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6593` | nakabisha-sente | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6593` | nakabisha-sente | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6593` | nakabisha-sente | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6593` | nakabisha-sente | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `6593` | nakabisha-sente | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6593` | nakabisha-sente | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6593` | nakabisha-sente | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6593` | nakabisha-sente | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6593` | nakabisha-sente | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6593` | nakabisha-sente | `26` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6593` | nakabisha-sente | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6645` | kakugawari-hayakuri | `17` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `24` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `29` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `39` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6645` | kakugawari-hayakuri | `40` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6677` | kakugawari-koshikake | `17` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `20` | ja+en | ja+en | yes | ja+en | yes | 22 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `29` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `31` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `36` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `37` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `41` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `42` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6677` | kakugawari-koshikake | `43` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6677` | kakugawari-koshikake | `44` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6704` | kakugawari-45kei | `17` | ja+en | ja+en | yes | ja+en | yes | 9 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6704` | kakugawari-45kei | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6704` | kakugawari-45kei | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `26` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `27` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `33` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `35` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `6704` | kakugawari-45kei | `36` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6736` | kakugawari-koshikake | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6736` | kakugawari-koshikake | `20` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `22` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6736` | kakugawari-koshikake | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `30` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6736` | kakugawari-koshikake | `35` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `6765` | kakugawari-ittezon | `3` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | last | — | — |
| `6765` | kakugawari-ittezon | `4` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `6765` | kakugawari-ittezon | `6` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6765` | kakugawari-ittezon | `8` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | last | — | — |
| `6765` | kakugawari-ittezon | `9` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `6765` | kakugawari-ittezon | `11` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6765` | kakugawari-ittezon | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6765` | kakugawari-ittezon | `20` | ja+en | ja+en | yes | ja+en | yes | 10 | no | — | last | — | — |
| `6765` | kakugawari-ittezon | `21` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6765` | kakugawari-ittezon | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | no | — | last | — | — |
| `6765` | kakugawari-ittezon | `25` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `6765` | kakugawari-ittezon | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6765` | kakugawari-ittezon | `29` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | last | — | — |
| `6808` | unplanned | `2-0` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6808` | unplanned | `2-1` | ja+en | ja+en | yes | — | yes | 0 | no | — | — | — | partial=True |
| `6808` | unplanned | `12-0` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6808` | unplanned | `12-1` | ja+en | ja+en | yes | — | yes | 0 | no | — | — | — | partial=True |
| `6814` | ishida-43 | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `6814` | ishida-43 | `16` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `6814` | ishida-43 | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `33` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `35` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `36` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `37` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `39` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `6814` | ishida-43 | `40` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `6814` | ishida-43 | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `6896` | sanken-basics | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6896` | sanken-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | — |
| `6896` | sanken-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6896` | sanken-basics | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6896` | sanken-basics | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6896` | sanken-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6896` | sanken-basics | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6896` | sanken-basics | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6896` | sanken-basics | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6896` | sanken-basics | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6896` | sanken-basics | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6896` | sanken-basics | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6896` | sanken-basics | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `6934` | sanken-vs-bougin | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6934` | sanken-vs-bougin | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6934` | sanken-vs-bougin | `26` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `29` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6934` | sanken-vs-bougin | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6934` | sanken-vs-bougin | `32` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6934` | sanken-vs-bougin | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6970` | sanken-tomahawk | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6970` | sanken-tomahawk | `15` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `6970` | sanken-tomahawk | `18` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `6970` | sanken-tomahawk | `20` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6970` | sanken-tomahawk | `21` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `6970` | sanken-tomahawk | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `6970` | sanken-tomahawk | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `6970` | sanken-tomahawk | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6970` | sanken-tomahawk | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `6970` | sanken-tomahawk | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `10` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7031` | yokofu-23fu | `13` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `17` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7031` | yokofu-23fu | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7031` | yokofu-23fu | `22` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `27` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `37` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `38` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7031` | yokofu-23fu | `39` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7071` | aiyokofu | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7071` | aiyokofu | `17` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7071` | aiyokofu | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7071` | aiyokofu | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7071` | aiyokofu | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7071` | aiyokofu | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7071` | aiyokofu | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7071` | aiyokofu | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7071` | aiyokofu | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7071` | aiyokofu | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7071` | aiyokofu | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7071` | aiyokofu | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7071` | aiyokofu | `31` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7071` | aiyokofu | `33` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7071` | aiyokofu | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7071` | aiyokofu | `36` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7105` | yokofu-85hisha | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `18` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `30` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `33` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `36` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `37` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `39` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7105` | yokofu-85hisha | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7137` | yokofu-yuuki | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7137` | yokofu-yuuki | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7137` | yokofu-yuuki | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `30` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `31` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7137` | yokofu-yuuki | `34` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7182` | aigakari-bougin | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `17` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `18` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `23` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7182` | aigakari-bougin | `30` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7205` | hineribisha | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7205` | hineribisha | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7205` | hineribisha | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7205` | hineribisha | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7205` | hineribisha | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7205` | hineribisha | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7205` | hineribisha | `25` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7205` | hineribisha | `26` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7205` | hineribisha | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7205` | hineribisha | `30` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7205` | hineribisha | `31` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7205` | hineribisha | `34` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7205` | hineribisha | `37` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `7205` | hineribisha | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7205` | hineribisha | `39` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7205` | hineribisha | `40` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7230` | ibisha-basics | `4` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7230` | ibisha-basics | `7` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7238` | taifuri-basics | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7238` | taifuri-basics | `3` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7238` | taifuri-basics | `5` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7238` | taifuri-basics | `14` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7238` | taifuri-basics | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7238` | taifuri-basics | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7238` | taifuri-basics | `21` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7238` | taifuri-basics | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7238` | taifuri-basics | `25` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7238` | taifuri-basics | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7238` | taifuri-basics | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7238` | taifuri-basics | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7238` | taifuri-basics | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7238` | taifuri-basics | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7238` | taifuri-basics | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7254` | taifuri-bougin | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7254` | taifuri-bougin | `18` | ja+en | ja+en | yes | ja+en | yes | 11 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `19` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7254` | taifuri-bougin | `30` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7254` | taifuri-bougin | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `33` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7254` | taifuri-bougin | `37` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7282` | taifuri-46gin | `15` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `16` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7282` | taifuri-46gin | `20` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7282` | taifuri-46gin | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `30` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `31` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7282` | taifuri-46gin | `33` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7282` | taifuri-46gin | `34` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `37` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `39` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `40` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `41` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7282` | taifuri-46gin | `43` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7339` | taifuri-anaguma | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7339` | taifuri-anaguma | `16` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `19` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `22` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `23` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `25` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `28` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `29` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `31` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `32` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `37` | ja+en | ja+en | yes | ja+en | yes | 11 | yes | — | last | — | — |
| `7339` | taifuri-anaguma | `38` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7368` | endgame-tsumero | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7368` | endgame-tsumero | `5` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `6` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7368` | endgame-tsumero | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7368` | endgame-tsumero | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `26` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7368` | endgame-tsumero | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `7368` | endgame-tsumero | `31` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `7418` | fujii-vs-anaguma | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7418` | fujii-vs-anaguma | `16` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `22` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `25` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `26` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `33` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `36` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `37` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7418` | fujii-vs-anaguma | `39` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7420` | fujii-build | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7420` | fujii-build | `14` | ja+en | ja+en | yes | ja+en | yes | 5 | no | — | last | — | — |
| `7420` | fujii-build | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7420` | fujii-build | `19` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7420` | fujii-build | `21` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7420` | fujii-build | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7420` | fujii-build | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7420` | fujii-build | `27` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7420` | fujii-build | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `16` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `24` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `25` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `27` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `31` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `33` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `34` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `37` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `38` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7495` | fujii-vs-hidarimino | `39` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7513` | fujii-vs-kyusen | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7513` | fujii-vs-kyusen | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7513` | fujii-vs-kyusen | `17` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7513` | fujii-vs-kyusen | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7513` | fujii-vs-kyusen | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7513` | fujii-vs-kyusen | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7513` | fujii-vs-kyusen | `24` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7513` | fujii-vs-kyusen | `26` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7513` | fujii-vs-kyusen | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `15` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `18` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `20` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `22` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `26` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `30` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `34` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `36` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `37` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `39` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `40` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `42` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `44` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `45` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `46` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7605` | kakukoukan-gyakubougin | `47` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7645` | direct-mukai | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `7645` | direct-mukai | `14` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `17` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `7645` | direct-mukai | `22` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `7645` | direct-mukai | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `26` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `31` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `33` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `35` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `36` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `37` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `7645` | direct-mukai | `40` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | — |
| `7645` | direct-mukai | `41` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7645` | direct-mukai | `44` | ja+en | ja+en | yes | ja+en | yes | 2 | no | — | last | — | — |
| `7645` | direct-mukai | `45` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7700` | legspe | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7700` | legspe | `5` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7700` | legspe | `7` | ja+en | ja+en | yes | ja+en | yes | 12 | yes | — | last | — | — |
| `7700` | legspe | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7700` | legspe | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7700` | legspe | `17` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7700` | legspe | `20` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7700` | legspe | `22` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7700` | legspe | `23` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7700` | legspe | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7700` | legspe | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7700` | legspe | `28` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7747` | yagura-aiyagura | `17` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | — |
| `7747` | yagura-aiyagura | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `20` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `21` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `22` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `25` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `27` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `32` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `34` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `36` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `37` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `38` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `40` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7747` | yagura-aiyagura | `41` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7819` | yagura-waki | `14` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7819` | yagura-waki | `17` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7819` | yagura-waki | `20` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7819` | yagura-waki | `22` | ja+en | ja+en | yes | ja+en | yes | 13 | yes | — | last | — | — |
| `7819` | yagura-waki | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7819` | yagura-waki | `25` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7819` | yagura-waki | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7819` | yagura-waki | `28` | ja+en | ja+en | yes | ja+en | yes | 9 | yes | — | last | — | — |
| `7819` | yagura-waki | `29` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7819` | yagura-waki | `30` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7819` | yagura-waki | `32` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7819` | yagura-waki | `34` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7819` | yagura-waki | `35` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7819` | yagura-waki | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7819` | yagura-waki | `37` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7819` | yagura-waki | `38` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7863` | taifuri-chousoku | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7863` | taifuri-chousoku | `15` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `16` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `17` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `19` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `21` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `23` | ja+en | ja+en | yes | ja+en | yes | 7 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `25` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `28` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `29` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `31` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `32` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7863` | taifuri-chousoku | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7863` | taifuri-chousoku | `36` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7863` | taifuri-chousoku | `37` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `38` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `40` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7863` | taifuri-chousoku | `41` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `7936` | taifuri-elmo | `13` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7936` | taifuri-elmo | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7936` | taifuri-elmo | `19` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `7936` | taifuri-elmo | `22` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `7936` | taifuri-elmo | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7936` | taifuri-elmo | `25` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7936` | taifuri-elmo | `26` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `7936` | taifuri-elmo | `29` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7936` | taifuri-elmo | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7936` | taifuri-elmo | `31` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7936` | taifuri-elmo | `34` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7936` | taifuri-elmo | `35` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `7962` | taifuri-vs-hayaishida | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `6` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `7` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `9` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `16` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `18` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `20` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `22` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `23` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `25` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7962` | taifuri-vs-hayaishida | `30` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | view=gote |
| `7988` | taifuri-millennium | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `7988` | taifuri-millennium | `12` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7988` | taifuri-millennium | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7988` | taifuri-millennium | `18` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7988` | taifuri-millennium | `19` | ja+en | ja+en | yes | ja+en | yes | 8 | yes | — | last | — | — |
| `7988` | taifuri-millennium | `21` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `7988` | taifuri-millennium | `22` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7988` | taifuri-millennium | `24` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `7988` | taifuri-millennium | `25` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `7988` | taifuri-millennium | `26` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `8008` | taifuri-ponpon | `5` | ja+en | ja+en | yes | ja+en | yes | 13 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `7` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `15` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `17` | ja+en | ja+en | yes | ja+en | yes | 6 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `19` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `20` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `21` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `8008` | taifuri-ponpon | `23` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `25` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `8008` | taifuri-ponpon | `27` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `8037` | mukai-build | `2` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `8037` | mukai-build | `10` | ja+en | ja+en | yes | ja+en | yes | 3 | no | — | last | — | — |
| `8037` | mukai-build | `12` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `8037` | mukai-build | `13` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `8037` | mukai-build | `15` | ja+en | ja+en | yes | ja+en | yes | 10 | yes | — | last | — | — |
| `8037` | mukai-build | `18` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `8048` | mukai-attack | `3` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `8048` | mukai-attack | `5` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `8048` | mukai-attack | `6` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `8048` | mukai-attack | `8` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `8048` | mukai-attack | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | — |
| `8048` | mukai-attack | `19` | ja+en | ja+en | yes | ja+en | yes | 4 | yes | — | last | — | — |
| `8048` | mukai-attack | `21` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `8048` | mukai-attack | `22` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `8048` | mukai-attack | `24` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `8048` | mukai-attack | `25` | ja+en | ja+en | yes | ja+en | yes | 5 | yes | — | last | — | — |
| `8048` | mukai-attack | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | — |
| `8048` | mukai-attack | `28` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | — |
| `8048` | mukai-attack | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | — |
| `8322` | proverb-three-pawns | `11` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `8322` | proverb-three-pawns | `12` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `14` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `16` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `8322` | proverb-three-pawns | `17` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `19` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `20` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `23` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `8322` | proverb-three-pawns | `24` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `26` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `28` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | — | — | partial=True |
| `8322` | proverb-three-pawns | `29` | ja+en | ja+en | yes | ja+en | yes | 3 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `30` | ja+en | ja+en | yes | ja+en | yes | 2 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `32` | ja+en | ja+en | yes | ja+en | yes | 1 | yes | — | last | — | partial=True |
| `8322` | proverb-three-pawns | `35` | ja+en | ja+en | yes | ja+en | yes | 0 | no | — | last | — | partial=True |

## Baseline unit reference declarations

| Unit | Reference title | URL | License | Adapted |
|---|---|---|---|---|
| `rules-game` | 将棋 (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/将棋 | CC BY-SA 4.0 | False |
| `rules-game` | 将棋の遊び方、対局の大まかな流れ | https://shogi-joutatsu.com/archives/656 | All rights reserved | False |
| `rules-moves` | 将棋の駒 (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/将棋の駒 | CC BY-SA 4.0 | False |
| `rules-moves` | 駒の動き | https://shogi-joutatsu.com/archives/615 | All rights reserved | False |
| `rules-promotion` | 将棋のルール (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/将棋のルール | CC BY-SA 4.0 | not present in source |
| `rules-drops` | 将棋のルール (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/将棋のルール | CC BY-SA 4.0 | False |
| `rules-drops` | 駒の取り方、持駒の使い方 | https://shogi-joutatsu.com/archives/738 | All rights reserved | False |
| `rules-checkmate` | 王手 (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/王手 | CC BY-SA 4.0 | False |
| `rules-checkmate` | 詰み (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/詰み | CC BY-SA 4.0 | False |
| `rules-checkmate` | 王手と詰み、勝敗の決め方 | https://shogi-joutatsu.com/archives/746 | All rights reserved | False |
| `rules-fouls` | 反則 (将棋) (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/反則_(将棋) | CC BY-SA 4.0 | False |
| `rules-fouls` | 将棋のルール (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/将棋のルール | CC BY-SA 4.0 | False |
| `rules-fouls` | 反則、禁じ手について | https://shogi-joutatsu.com/archives/813 | All rights reserved | False |
| `rules-draws` | 入玉・持将棋 (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/入玉 | CC BY-SA 4.0 | False |
| `rules-draws` | 千日手 (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/千日手 | CC BY-SA 4.0 | False |
| `rules-draws` | 千日手 | https://shogi-joutatsu.com/archives/758 | All rights reserved | False |
| `rules-draws` | 入玉の扱い、持将棋と宣言法およびトライルール | https://shogi-joutatsu.com/archives/932 | All rights reserved | False |
| `rules-setup` | 将棋 (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/将棋 | CC BY-SA 4.0 | False |
| `rules-setup` | 将棋駒の並べ方、伊藤流と大橋流 | https://shogi-joutatsu.com/archives/1137 | All rights reserved | False |
| `rules-setup` | 振り駒による先手と後手の決め方 | https://shogi-joutatsu.com/archives/1106 | All rights reserved | False |
| `rules-setup` | 持ち時間のルール | https://shogi-joutatsu.com/archives/8083 | All rights reserved | False |
| `rules-setup` | 対局時のマナー | https://shogi-joutatsu.com/archives/1127 | All rights reserved | False |
| `basics-mate-words` | 王手 (Wikipedia日本語版) | https://ja.wikipedia.org/wiki/王手 | CC BY-SA 4.0 | False |
| `basics-mate-words` | 王手、詰み、詰めろ、必至って？ | https://shogi-joutatsu.com/archives/1821 | All rights reserved | False |

## Removed courses and replacement slots

Old `shogirule--*` course content remains unopened. Replacement acceptance is tracked below; generated-output presence is reconciled against the completed aggregate build.

| Removed course ID | Replacement ID | Source script | Generated output | Current disposition |
|---|---|---|---|---|
| `shogirule--15-3` | `gokigen-vs-chousoku--56fu` | `scripts/courses/gokigen-vs-chousoku-56fu.mjs` (present) | `src/data/joseki/gokigen-vs-chousoku--56fu.json` (present) | DONE |
| `shogirule--20` | `gokigen-vs-maruyama` | `scripts/courses/gokigen-vs-maruyama.mjs` (present) | `src/data/joseki/gokigen-vs-maruyama.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--29` | `yagura-vs-akutsu-kyusen` | `scripts/courses/yagura-vs-akutsu-kyusen.mjs` (present) | `src/data/joseki/yagura-vs-akutsu-kyusen.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--32` | `yagura--waki-system` | `scripts/courses/yagura-waki-system.mjs` (present) | `src/data/joseki/yagura--waki-system.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--33-2` | `shikenbisha-vs-anaguma--mochigoma` | `scripts/courses/shikenbisha-vs-anaguma-mochigoma.mjs` (present) | `src/data/joseki/shikenbisha-vs-anaguma--mochigoma.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--33` | `shikenbisha-vs-anaguma--sabaki` | `scripts/courses/shikenbisha-vs-anaguma-sabaki.mjs` (authored) | `src/data/joseki/shikenbisha-vs-anaguma--sabaki.json` (present; rebuilt) | Original Sente replacement accepted; output rebuilt and validated |
| `shogirule--35-2` | `fujii-system--anaguma-2` | `scripts/courses/fujii-system-anaguma-2.mjs` (present) | `src/data/joseki/fujii-system--anaguma-2.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--35-3` | `fujii-system--anaguma-3` | `scripts/courses/fujii-system-anaguma-3.mjs` (present) | `src/data/joseki/fujii-system--anaguma-3.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--35` | `fujii-system--anaguma-1` | `scripts/courses/fujii-system-anaguma-1.mjs` (present) | `src/data/joseki/fujii-system--anaguma-1.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--37-2` | `shikenbisha-vs-funa-kyusen--2` | `scripts/courses/shikenbisha-vs-funa-kyusen-2.mjs` (authored) | `src/data/joseki/shikenbisha-vs-funa-kyusen--2.json` (present; rebuilt) | Original Sente replacement accepted; output rebuilt and validated |
| `shogirule--37` | `shikenbisha-vs-funa-kyusen--1` | `scripts/courses/shikenbisha-vs-funa-kyusen-1.mjs` (authored) | `src/data/joseki/shikenbisha-vs-funa-kyusen--1.json` (present; rebuilt) | Original Sente replacement accepted; output rebuilt and validated |
| `shogirule--39` | `shikenbisha-vs-bougin--sente` | `scripts/courses/shikenbisha-vs-bougin-sente.mjs` (present) | `src/data/joseki/shikenbisha-vs-bougin--sente.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--40` | `shikenbisha-vs-bougin--gote` | `scripts/courses/shikenbisha-vs-bougin-gote.mjs` (present) | `src/data/joseki/shikenbisha-vs-bougin--gote.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--41-2` | `shikenbisha-vs-hidarimino--2` | `scripts/courses/shikenbisha-vs-hidarimino-2.mjs` (present) | `src/data/joseki/shikenbisha-vs-hidarimino--2.json` (present; rebuilt) | Original clean-room replacement accepted; output rebuilt and validated |
| `shogirule--41` | `shikenbisha-vs-hidarimino--1` | `scripts/courses/shikenbisha-vs-hidarimino-1.mjs` (present) | `src/data/joseki/shikenbisha-vs-hidarimino--1.json` (present; rebuilt) | Original Sente-side replacement accepted; output rebuilt and validated |
| `shogirule--42` | `shikenbisha-vs-migishiken--sente` | `scripts/courses/shikenbisha-vs-migishiken-sente.mjs` (present) | `src/data/joseki/shikenbisha-vs-migishiken--sente.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--43` | `mukaibisha-vs-sankenbisha` | `scripts/courses/mukaibisha-vs-sankenbisha.mjs` (present) | `src/data/joseki/mukaibisha-vs-sankenbisha.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--44` | `aisanken` | `scripts/courses/aisanken.mjs` (present) | `src/data/joseki/aisanken.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--46` | `tateishi--gote` | `scripts/courses/tateishi-gote.mjs` (present) | `src/data/joseki/tateishi--gote.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--47-2` | `shikenbisha-vs-45hayashikake--gote-2` | `scripts/courses/shikenbisha-vs-45hayashikake-gote-2.mjs` (present) | `src/data/joseki/shikenbisha-vs-45hayashikake--gote-2.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--47` | `shikenbisha-vs-45hayashikake--gote-1` | `scripts/courses/shikenbisha-vs-45hayashikake-gote-1.mjs` (present) | `src/data/joseki/shikenbisha-vs-45hayashikake--gote-1.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--48` | `shikenbisha-vs-kakugawari-bougin--gote` | `scripts/courses/shikenbisha-vs-kakugawari-bougin-gote.mjs` (present) | `src/data/joseki/shikenbisha-vs-kakugawari-bougin--gote.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--50` | `yokofu-vs-45kaku` | `scripts/courses/yokofu-vs-45kaku.mjs` (present) | `src/data/joseki/yokofu-vs-45kaku.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--52` | `yokofu-vs-85hisha--58gyoku` | `scripts/courses/yokofu-vs-85hisha-58gyoku.mjs` (present) | `src/data/joseki/yokofu-vs-85hisha--58gyoku.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--53` | `yokofu-vs-85hisha--68gyoku` | `scripts/courses/yokofu-vs-85hisha-68gyoku.mjs` (present) | `src/data/joseki/yokofu-vs-85hisha--68gyoku.json` (present; rebuilt) | Original replacement accepted after full review and replay; output rebuilt and validated |
| `shogirule--59` | `ittezon-vs-hayakurigin` | `scripts/courses/ittezon-vs-hayakurigin.mjs` (authored) | `src/data/joseki/ittezon-vs-hayakurigin.json` (present; rebuilt) | Original replacement accepted; output rebuilt and validated |
| `shogirule--60` | `ittezon-vs-bougin` | `scripts/courses/ittezon-vs-bougin.mjs` (authored) | `src/data/joseki/ittezon-vs-bougin.json` (present; rebuilt) | Original replacement accepted; output rebuilt and validated |
| `shogirule--61` | `direct-mukaibisha--gote` | `scripts/courses/direct-mukaibisha-gote.mjs` (present) | `src/data/joseki/direct-mukaibisha--gote.json` (present; rebuilt) | Original Gote course accepted after full prose review, legal main/branch replay, exact goal SFEN and engine check; output rebuilt and validated |
| `shogirule--62-2` | `ishida-vs-62hisha` | `scripts/courses/ishida-vs-62hisha.mjs` (present) | `src/data/joseki/ishida-vs-62hisha.json` (present; rebuilt) | Original Sente course accepted after full read, main/branch replay, exact goal SFEN and engine check; output rebuilt and validated |
| `shogirule--62` | `ishida-vs-ibisha--honkumi` | `scripts/courses/ishida-vs-ibisha-honkumi.mjs` (present) | `src/data/joseki/ishida-vs-ibisha--honkumi.json` (present; rebuilt) | Original Sente replacement accepted after full prose/index correction, legal main/branch replay, exact goal and engine check; output rebuilt and validated |

## Remaining section-E coverage courses

These original courses close matchup rows that have no genuine existing course. A course is not accepted until its complete prose, main line, branches and final board are independently checked.

| Matchup rows | Course ID | Source script | Generated output | Current disposition |
|---|---|---|---|---|
| Reclining Silver → Bishop Exchange | `kakugawari--koshikakegin` | `scripts/courses/kakugawari-koshikakegin.mjs` | `src/data/joseki/kakugawari--koshikakegin.json` (present; rebuilt) | Original course accepted after full prose review, main/branch replay, exact goal and engine check; output rebuilt and validated |
| Yagura → Gangi; Gangi → Yagura | `yagura-vs-gangi` | `scripts/courses/yagura-vs-gangi.mjs` | `src/data/joseki/yagura-vs-gangi.json` (present; rebuilt) | Original course accepted after full prose review, legal main/branches, exact goal and engine check; output rebuilt and validated |

## Current authored course files and outputs

| Course ID | Source script path/status | Generated output path/status | Handoff provenance status |
|---|---|---|---|
| `shikenbisha-vs-aifuri--2fu` | `scripts/courses/aifuri-84fu.mjs` (original replacement accepted) | `src/data/joseki/shikenbisha-vs-aifuri--2fu.json` (present; rebuilt) | Original 25-ply development accepted after full prose correction, pawn/blocker review, main/two-variation replay, exact goal and independent main-state engine evaluation; no move-loss flags |
| `shikenbisha-vs-aifuri--nishikawa` | `scripts/courses/aifuri-nishikawa.mjs` (original replacement accepted) | `src/data/joseki/shikenbisha-vs-aifuri--nishikawa.json` (present) | Original 27-ply initial-position development accepted after full prose/board review, main/quiet-reply replay, exact goal and independent main-state engine evaluation; output rebuilt and validated |
| `shikenbisha-vs-anaguma--fujii` | `scripts/courses/fujii-system.mjs` (present) | `src/data/joseki/shikenbisha-vs-anaguma--fujii.json` (present) | Complete original replacement accepted after full prose/material-ledger review, main/branch replay, exact goal and engine check; output rebuilt and validated |
| `gokigen-vs-chousoku--56fu` | `scripts/courses/gokigen-vs-chousoku-56fu.mjs` (present) | `src/data/joseki/gokigen-vs-chousoku--56fu.json` (present) | NEW clean-room (Peta book + engine) |
| `shikenbisha-vs-hidarimino--24fu` | `scripts/courses/hidarimino-fujii.mjs` (present) | `src/data/joseki/shikenbisha-vs-hidarimino--24fu.json` (present; rebuilt) | Complete original Gote replacement accepted after full prose review, legal main/branches, exact goal and engine check |
| `shikenbisha-vs-ibisha--kakukoukan` | `scripts/courses/kakukoukan-shikenbisha.mjs` (present) | `src/data/joseki/shikenbisha-vs-ibisha--kakukoukan.json` (present) | rewritten from scratch |
| `kuzushi--funa-hashi` | `scripts/courses/kuzushi-funa-hashi.mjs` (present) | `src/data/joseki/kuzushi--funa-hashi.json` (present; rebuilt) | Original 40-piece composition accepted after full prose, fork/check/evasion/material review, main/branch replay, exact goal and engine check |
| `kuzushi--kimura-mino` | `scripts/courses/kuzushi-kimura-mino.mjs` (original replacement accepted) | `src/data/joseki/kuzushi--kimura-mino.json` (present; rebuilt) | Original 40-piece composition accepted after full prose, fork/check/material review, all branches, exact goal and independent main-state engine evaluation; no move-loss flags |
| `kuzushi--mino-36kei` | `scripts/courses/kuzushi-mino-36kei.mjs` (original replacement accepted) | `src/data/joseki/kuzushi--mino-36kei.json` (present; rebuilt) | Original 40-piece composition accepted after full prose, fork/check/material review, main/two-branch replay, exact goal and independent main-state engine evaluation; no move-loss flags |
| `shikenbisha-vs-millennium--65fu` | `scripts/courses/millennium-65fu.mjs` (present) | `src/data/joseki/shikenbisha-vs-millennium--65fu.json` (present) | rewritten from scratch (plies 37–38 engine-dubious, stated) |
## Inventory limits

- All 146 units have been authored and accepted after complete selected-source reads and independent source/output review; article material is consulted only for facts.
- Removed `shogirule-*` course content and `.cache/old`/`.cache/reference` were not opened. Cached study text and inventoried figure metadata were used for factual review and independent position comparison. No remote websites were fetched.
- Course closure is complete: all 29 planned replacements, both extra matchup courses and all seven retained source-derived courses have original replacements. The baseline opening-fact courses retain their documented provenance.
- Final gates: lesson build 146 lessons/513 chapters/1,872 figures/2,230 legal moves, zero errors; 41 course specs rebuilt; course replay 3,245 moves, zero errors; strategy validation 85 matchups/83 side mappings, zero errors; 934 mined drills; originality 15,880 strings, zero flags; lint/format/type generation/TypeScript check exited 0 (existing lint warnings remain).
- Independent final crosswalk: every planned unit matches its generated metadata/references/chapter count, every course spec matches generated metadata/root, all 38 declared goal SFENs match generated main ends, and all 41 script/output IDs are unique and present. Every planned study ID has a consultation reference.
- No browser validation, commit, push, merge, deployment or external write was performed. Changes remain in the lesson-copyright worktree.
