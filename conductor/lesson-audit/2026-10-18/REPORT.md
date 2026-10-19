# Lesson audit, 2026-10-18

Read-only audit of the authored lesson units in `data/lessons/units/`. No lesson source or generated output was changed. Every finding below needs a source fix followed by `bun run lessons`.

## Status

- **Read line by line with board replay: 92 of 150 units** (rules-game through taifuri-millennium, in curriculum order). The audit was stopped there; **58 units were not read** (list below).
- **All 150 units** went through the automated gates and engine screens described below, so the unread units have machine coverage only.
- Findings: 54 items — A (misteaches): 20, B (misleading): 15, C (style, minor): 19.

## Automated results (all 150 units)

- Generated output equals source for 150/150 units (`tools/eq.ts`).
- `validate-curriculum`: 150 lessons, 540 chapters, 2052 figures, 2579 moves, 0 errors.
- `check-unit --engine`: all 150 units ok (`data/check-unit-all.txt`). Notes: gokigen-vs-choukyusen ch2 ply 17 is an intentionally labelled mistake; ibisha-basics has benign book misses.
- Engine screens at 1000 ms per node, YaneuraOu k-p (wasm), 2997 nodes (`data/node-evals-run*.jsonl.gz`): move-loss screen (`data/screen.tsv`), mate screen (`data/mates.tsv`), exhaustive mate-in-1 scan (`data/m1scan.tsv`), notation, side-mark, promotion and ja/en consistency checks (`data/sem.tsv`).
- The engine scores partial composed positions noisily. Only falsifiable claims count as findings: a mate or a free capture the lesson skips, a "defence" that does not defend, a hanging piece.

## Limitations

- Text originality against the reference sources was **not checked**: the session network returned 403 for every reference host, so the reference corpus was empty.
- No browser verification of lesson content.
- Engine budgets are short (0.8–2 s); evaluations quoted in findings are indicative, the mate and capture claims were replayed exactly with `tools/pos.ts`.
- 58 units unread by hand: taifuri-45hayashikake, taifuri-ponpon, taifuri-vs-hayaishida, taifuri-bougin-ishida, taifuri-chousoku, taifuri-vs-kakukoukan, mukai-build, mukai-attack, sanken-basics, sanken-vs-bougin, sanken-tomahawk, ishida-basics, ishida-honkumi, ishida-attack, hayaishida, ishida-43, shiken-basics, shiken-castles, shiken-patterns, shiken-vs-igyoku-bougin, shiken-vs-funa-bougin, shiken-vs-yagura, shiken-vs-migishiken, shiken-vs-anaguma, shiken-tateishi, fujii-build, fujii-vs-anaguma, fujii-vs-hidarimino, fujii-vs-kyusen, gokigen-basics, nakabisha-sente, gokigen-castles, gokigen-attack, gokigen-vs-choukyusen, gokigen-vs-chousoku, gokigen-vs-anaguma, kakukoukan-shiken, kakukoukan-gyakubougin, direct-mukai, legspe, aifuri-basics, aifuri-ishida-vs-naka, aifuri-vs-ishida, aifuri-hidari-anaguma, kishu-onigoroshi, kishu-sujichigai, kishu-pacman, kishu-ahiru, kishu-migishiken-hidarimino, ureshino-basics, ureshino-new, ureshino-vs-bougin, ureshino-vs-shiken, ureshino-counter, handicap-8, handicap-6, handicap-4, handicap-2.

## Findings

Format: `unit#chapter.step` (0-based) · finding · evidence. Severity A = wrong fact or position (misteaches); B = text/board mismatch or misleading; C = style, translation or minor.

### A — misteaches

- **basics-plan#3 (s2–s5)** — Chapter claims taking the gold (▲４四飛) lets the king escape. False: after ▲４四飛 Gote's ONLY legal move is △８一玉, and then ▲８二金打, ▲４一飛成 and ▲４一飛不成 all mate. Step 3 "先手が次に金を打っても、玉の周囲には逃げ道が残ります" is wrong; the shown ▲９二金打 is a missed mate in 1. _Evidence:_ pos.ts: sfen k8/9/1G7/5g3/9/9/9/9/5R2K b G 1, 4i4d → legal 1: 9a8a; then mating moves 4d4a+ 4d4a G*8b
- **basics-mate-words#3 (s2–s4)** — "△２一玉と先に逃げれば…詰めろは受けで消え" is false. After ▲２三金 the king move △２一玉 walks into ▲２二金打 mate; Gote's ONLY non-losing reply is the counter-check △８八歩成. The chapter teaches a defense that does not defend, and the shown ▲１二金打 misses mate in 1 (▲２二金打). _Evidence:_ m1all.ts 8k/9/9/7G1/9/9/1p7/9/K8 b G 1 + 2d2c: 2b2a→mate ☗２二金打; 8g8h+ CHECK→none; 8g8h→mate
- **basics-mate-words#4** — Hisshi demo starts from a position with mate in 1: ▲８二飛成, ▲８二金 (7c8b) and ▲８二金打 all mate immediately; the lesson's "quiet" ▲８二飛不成 is the same rook move without promotion. In quiz mode the mating ▲８二飛成 would be graded wrong. _Evidence:_ pos.ts k8/9/1RG5p/9/9/9/9/9/8K b G 1 --mates
- **proverb-gold-last#0** — "金はトドメに残せ" demo: the start already has four mates in 1 (▲８二銀成, ▲８二飛成, ▲８二金打, ▲９二金打). The lesson's ▲８二銀不成→△９二玉→▲９三金 is a 3-move route past an immediate mate, and its premise "the silver leaves the side open, so save the gold" fails because ▲８二銀成 already covers ９二. Quiz would reject the immediate mates. _Evidence:_ pos.ts k8/3R5/2S6/9/9/9/9/9/8K b G 1 --mates
- **endgame-mate5#2.s2** — 5-move tsume main line is not a solution path: after ▲３一角 △４四玉, ▲４五金 (and ▲４五飛) mate at once, but the lesson plays ▲３四と △５五玉 ▲５六金 and labels △４四玉 the main 5-move defense. The longest defense is actually the △４二香 variation; the "main line" teaches a non-shortest continuation and quiz mode would grade the immediate mate wrong. _Evidence:_ m1scan: after 2a... 5c4d → mate-in-1 ☗４五飛 ☗４五金
- **bougin-vs-furibisha#1.s2–s3** — After ▲５四歩 △同金 ▲同銀 the silver on ５四 attacks the undefended bishop on ５三. △６四飛 ignores that, and ▲５三銀成 simply wins the bishop (k-p 1.5 s: winning, forced mate found). The lesson instead calls △６四飛 a threat Sente must not overlook and teaches the retreat ▲４五銀 as the way to "keep the gold". _Evidence:_ screen: 5d4e loss 30342 vs best 5d5c+; pos after 6b6d
- **bougin-vs-furibisha#2.s2** — After ▲５四歩 △６五歩 the bishop on ５三 is unprotected and attacked by the pawn; ▲５三歩成 wins it (engine: forced win, mate 12 at 1.5 s). The lesson plays the defensive ▲６八金 and frames it as balancing attack vs king safety. _Evidence:_ replies.ts 4k4/3r5/4b4/3p5/4PS3/9/9/1BK4R1/3G5 b - 1 + 5e5d 6d6e → 5d5c+ mate 12
- **gangi#3.s2–s3** — ▲８七金 (learner move) "attacks the rook on ８六" but the gold on ８七 is undefended (king ７九, bishop ８八 don't cover it): △８七飛成 simply wins it (+1356 for Gote at 1.5 s). The lesson instead shows the cooperative △８二飛 retreat and only calls the gold move a "defensive cost". _Evidence:_ replies.ts after 6i7i 8e8f 8g8f 8b8f 7h8g: 8f8g+ +1356, 8f8b −374
- **kakugawari-hayakuri#2.s2** — The "checking fork" △３五角 is answered in the lesson (learner move, quiz-graded) by ▲５九玉, which loses the rook to △１七角成. ▲５七飛 interposes, stays defended by the king and keeps the rook (k-p 1 s: ▲５七飛 +458; ▲５九玉 not in top 5, screen −3893). The text concedes other replies exist, but the quiz rewards the losing one and the chapter's premise (king and rook on two open diagonals = lost rook) is not shown. _Evidence:_ replies.ts 1000 after B*3e; legal list includes 1g5g, B*4f, B*5g
- **yokofu-basics#1 (s0–s2, v0)** — The bishop on ８八 already attacks the undefended gold on ３三 through the empty ７七–４四 diagonal: ▲３三角成 wins the gold with check (Gote's only replies are four king moves; mate-screen finds forced mate 11). The lesson instead retreats ▲２六飛 (quiz answer), and step 2 claims ▲７七角 "now opens the diagonal to ３三" — it was open from the start. (yokofu-23fu#1.s2 already carries the corrected wording for its own diagram.) _Evidence:_ pos.ts 4k4/9/6g2/6pR1/9/9/9/1B7/4K4 b: 8h3c+ legal → Gote legal 4 king moves; mates.tsv mate 11
- **yokofu-45kaku#2.s2** — After △５四角 the learner's ▲３四飛 is graded correct, but ▲５五飛 pins the undefended bishop on ５四 against the king on ５一 and wins it (Gote's only legal moves are five king moves and △２四歩; engine best 3e5e, loss 3197 for 3e3d). Text calls the bishop retreat simply "both pieces remain on the board". _Evidence:_ pos.ts after 3d3e 4e5d 3e5e: legal 6, no bishop move
- **aiyokofu#1.s1** — The learner's ▲２二角成 (bishop trade) is graded correct, but the gold on ３二 is undefended: ▲３二飛成 wins it outright (no Gote piece can capture on ３二; engine +3071 vs +78). The chapter's premise that the bishop trade is the move to study skips a free gold. _Evidence:_ pos.ts after 3d3b+: no Gote move to 3b
- **yokofu-aono#1.s1** — Against △２三銀 the learner's ▲３五飛 is graded correct, but ▲９四飛 escapes the silver and takes the undefended gold on ９四 (rook ８三 does not cover ９四; no Gote move can recapture). Engine best 3d9d (loss 1786 for 3d3e). _Evidence:_ pos.ts after 2b2c 3d9d: no Gote move to 9d
- **yokofu-yuuki#0.s1 (and v0)** — The chapter asks which king square defends the gold on ７八 against the silver on ８七, but ▲８七金 simply captures that silver: nothing of Gote's covers ８七 (bishop ３三's diagonal runs ７七–８八). The quiz answers ▲６八玉/▲５八玉 lose the free silver (engine best 7h8g, losses 1075/1451). _Evidence:_ pos.ts after 7h8g: no Gote move to 8g
- **yokofu-avoid#2.s1–s3** — "Choose a rook retreat over the neighboring pawn": ▲２二角成 wins material — △同金 is the only recapture, and then ▲同飛成 takes the gold with nothing able to recapture on ２二. The lesson's v1 only examines rook-first ▲２二飛成 (correctly refuted) and grades ▲２六飛 / ▲６八玉 / ▲２五飛 correct (engine best 8h2b+ at every step, losses 3258–3665). _Evidence:_ pos.ts after 8h2b+: only 3b2b; after 3b2b 2d2b+: no recapture
- **taifuri-bougin#2.s3** — ▲４七金 (learner move, "attacks the pawn on ４六") steps onto the square Gote's pawn on ４六 attacks: △４七歩成 wins the gold and no Sente piece can recapture on ４七. The text warns only about a later gold capture on ４六 being met by the rook. Engine loss 1871. _Evidence:_ pos.ts after 4d4e 4g4f 4e4f 5h4g: 4f4g+ legal; then no Sente move to 4g
- **taifuri-basics#2.s2–s3** — △３四銀 hangs the silver: ▲３四同銀 (straight forward from ３五) captures it and nothing of Gote's covers ３四. The lesson treats △３四銀 as a threat and has the learner play ▲２四銀 (graded correct) "escaping" it. Engine: △３四銀 loss 1947, ▲２四銀 loss 1789, best 3e3d. _Evidence:_ pos.ts after 2e2d 2c2d 4f3e 4c3d 3e3d: no Gote recapture
- **taifuri-46gin#1 (all learner moves, v0)** — With Gote's silver on ３二 blocking the rook's rank, the bishop on ２二 is undefended and the second file is completely open (no pawns on ２筋): ▲２二飛成 wins the bishop for free at every learner move (no Gote piece can recapture; engine best 2h2b+, losses 2120–2791). The lesson's premise ("the 3b silver delays the defence") holds, but the diagram simply hangs the bishop. (Matches the open conductor/CURRENT_TASK.md candidate.) _Evidence:_ pos.ts start 2h2b+: no Gote move to 2b
- **taifuri-46gin#0.s3** — Same pattern as taifuri-basics#2: △３四銀 hangs the silver; ▲３四同銀 captures it with no Gote recapture, but the lesson retreats ▲４六銀 (graded correct). Engine best 3e3d, loss 1371. _Evidence:_ pos.ts after 5g4f 9c9d 3f3e 3d3e 4f3e 4c3d 3e3d: no recapture
- **taifuri-anaguma#1 (s1, s2, v0)** — Gote's rook on ４二 hangs from the first diagram: ▲８六角 sees ４二 through ７五–６四–５三 and ▲４二角成 wins the rook outright (no Gote piece can recapture on ４二; engine best 8f4b+, loss 3435 for the learner's ▲４八飛). The lesson builds a fourth-file rook-exchange story on a rook that is simply lost, and Gote's △４五歩 ignores the threat. _Evidence:_ pos.ts after 4d4e 8f4b+: legal, no Gote move to 4b

### B — misleading

- **basics-opening#2** — "Keep a defended square on the rook's file": after ▲６六金 the silver guards only ７六 (and ７八); △７七飛成 / △７九飛成 invade safely and promote. The shown △７六飛 is a cooperative blunder presented as the natural invasion, and "無理な侵入を咎められます" overstates the defence. _Evidence:_ pos.ts after 7g6f: legal 7b7g+, 7b7i+ (no sente piece covers 7g/7i)
- **castles-nakazumai#3.s1** — After the pawn screen falls, Gote mates at once with △５七飛成 (dragon covers ４八/６八/５九; bishop ９三 guards it). The lesson plays △５七飛不成 without labelling it and shows ▲４八玉 escaping, understating the danger it is teaching. _Evidence:_ pos.ts k8/9/b3r4/9/9/9/4P4/4K4/3G1G3 w - 1 --mates → only ☖５七飛成
- **endgame-mate5#0,#2,#4.s1** — Intro says 別解を認め ("alternative solutions are allowed"), but quiz grading (useLesson.ts commit: goodMoves.includes(usi)) accepts only lesson branches. ch0 has ≥4 five-ply first moves (N*3d, N*2d, B*9h, B*9g; lesson 2b2a+), ch2 (N*4g, B*4b, 3c4c besides lesson B*3a), ch4 (P*3b, L*3b, G*4b, G*3b besides lesson G*2b). Correct mates graded wrong. ch1, ch3 first moves unique. _Evidence:_ replies.ts 1500ms bqqyqzm8y
- **yagura-vs-hidarimino#1.s3** — △４四角 is presented as a bishop line to weigh, but the bishop lands on a square Sente's silver ４五 attacks (straight forward) and nothing of Gote's covers ４四: ▲４四銀 wins the bishop for free. Text "角が出たことだけで歩や矢倉が失われるとは決めず" misses the blunder. _Evidence:_ pos.ts: after 2b4d, 4e4d legal; no Gote reply reaches 4d
- **yagura-vs-hidarimino#3.v0** — After △８七同飛成 the example plays ▲９九玉, into △８九金 mate in 1 (▲７九玉 has no mate in 1). Text calls it just "９九へ逃げる例" and "後手の攻めが必勝という意味ではなく" while the shown line ends one move from mate. _Evidence:_ m1all.ts: ☗９九玉 → mate ☖８九金; ☗７九玉 → none
- **gangi#2.s3** — Same pattern as yagura-vs-hidarimino#1: △４四角 lands in front of Sente's silver ４五 with no Gote cover on ４四, so ▲４四銀 wins the bishop; text treats it as an open question (engine loss 2637 for △４四角). _Evidence:_ screen; board
- **kakugawari-basics#0.s3** — After △４三角 the learner's ▲６六金 is graded correct, but ▲７三角 (check through ６二 + attack on ８二飛) wins the exchange: Gote's only non-king defence is △６二飛 interposing, and ▲同角成 takes the rook. ch1–3 were repaired with a gold on ７二 for exactly this B*7c fork; ch0 has no such gold. _Evidence:_ pos.ts after 3b6e 6f6e B*4c B*7c: legal = 4 king moves + 8b6b; engine best B*7c (loss 3110 for 6e6f)
- **kakugawari-hayakuri#3.s1–s2** — No gold on ７二 here (unlike ch0–1 and the other repaired kakugawari diagrams): at both learner moves (▲５九玉, ▲同歩) ▲７三角 checks and hits ８二飛; Gote can only interpose △６二飛/△６二角 and loses the exchange (engine loss 4733 / 3769). Also Gote's own △４六角 (check + ２八飛) is available at the start and the lesson's △８五歩 skips it. _Evidence:_ pos.ts after 8d8e B*7c: legal = king moves + 8b6b, B*6b
- **kakugawari-bougin#2.s2–s3** — Chapter warns that the rook on ２五 is exposed to a bishop drop and shows △５二角 (rook attack only). The stronger △４七角 checks ６九玉 and hits ２五飛 at once (engine: △５二角 loss 2775 vs best B*4g); the double attack the unit is about is not shown. _Evidence:_ screen
- **kakugawari-koshikake#1.s3** — Same as kakugawari-bougin#2: after ▲同飛 (２五) the lesson shows △５二角 (rook attack only) while △３四角 checks ７八玉 via ４五–５六–６七 and hits ２五飛 (engine: △５二角 loss 2430 vs best B*3d). _Evidence:_ screen; board after 2d2e 2i2e
- **kakugawari-koshikake#3.s1** — No gold on ７二 in this diagram: after △８五歩, ▲７三角 is decisive (k-p 0.8 s: winning score, pv B*7c 5a4b 2i2b+…), while the lesson's ▲６九玉 (and v0 ▲８六歩) are graded correct. Same unrepaired B*7c pattern as kakugawari-basics#0 and kakugawari-hayakuri#3. _Evidence:_ replies.ts 800 after 8d8e
- **kakugawari-ittezon#0–#2** — Gote is the learner, and at every Gote move (△７三桂, △８五桂, △８五歩, △８四歩) the bare composition allows △３七角: check on ５九玉 through ４八 plus attack on ２八飛, winning the exchange (engine best B*3g each time, losses 1192–2292). The quiz rewards the quiet move; nothing on rank 8 closes the diagonal. (Unit is about move-count bookkeeping, but the drop dominates every diagram.) _Evidence:_ screen; board
- **yokofu-85hisha#2.s2, yokofu-aono#2.s2** — Both chapters teach a two-target bishop drop after the trade (▲６六角 / ▲５五角) but miss ▲７三角, which checks ５一玉 through ６二 and hits ８四/８二飛 at once (Gote can only interpose a dropped bishop on ６二 and lose the rook); engine best B*7c in both, losses 2659 / 1187. yokofu-aono#2 explicitly asks the reader to "look for a bishop drop that uses both enemy pieces as targets". _Evidence:_ screen; board
- **yokofu-avoid#0.s1–s2** — ８七歩 is undefended against the rook on ８二 down an open file: △８七飛成 wins it and attacks ８八角 (engine's Gote best 8b8g+ / 8d8g+ at both Gote moves). The lesson plays △８四飛, △８五飛 and only notes that the pawn stops a direct capture of the bishop. _Evidence:_ screen; board
- **yokofu-avoid#1.s2–s3** — After the bishop trade the learner moves (▲４八銀, ▲２五飛) are graded correct while ▲７三角 checks ５一玉 and hits ８二飛 (engine best B*7c, losses 2420 / 729). _Evidence:_ screen

### C — style and minor

- **rules-moves#4.s4** — ja appends two plain-form (である調) sentences after です/ます text, with a stray double space and a fragment ("動きは同じ金の六方向。") _Evidence:_ source text
- **rules-draws#3.v0** — text writes ▲３三角 / ▲４四角 where the bishop could promote (enters/leaves zone); formal notation needs 不成 _Evidence:_ dump v0
- **basics-bishop-trade#2.s3** — "△６六金と金が斜線から退きました" — 7五→6六 is a forward (toward Sente) diagonal step for Gote, not a retreat _Evidence:_ board
- **tesuji-pawn#3.s1** — ja ends with an appended plain-form fragment after a stray space ("… 相手の駒の前へ歩を打って応手を問う、叩きの歩の例。"), register break vs です/ます _Evidence:_ source text
- **tesuji-lance#2.s0** — en "a gold retreat to ５四": ４三→５四 is a forward diagonal step for Gote (ja just says 逃げる) _Evidence:_ board
- **tesuji-silver#2.v0** — variation text switches to plain form (である調) in ja and to western square names (6d, 5c) in en, unlike the rest of the unit _Evidence:_ source text
- **tesuji-bishop#3** — whole chapter ja in plain form (である調) and en in western squares (2h, 9a, N*8c, K9b) while ch0–2 use です/ます and ２八-style notation _Evidence:_ source text
- **endgame-yose#3.s1** — quoted evaluation "約+4200から+300前後" not reproducible: k-p 2 s gives root ≈ +3100 (engine best ▲９八玉), after ▲３三金 △１三玉 ≈ +540; the qualitative drop holds _Evidence:_ replies.ts 2000/1500 ms
- **attack-yagura-side#0.v0** — rook-first comparison: in this bare-king composition Gote can then mate with the rook in hand (R*8i … mate in 3), which the text reduces to "高価な駒を失います" _Evidence:_ engine ev (1 s) mate 3 for Gote
- **endgame-tsumero#3.s1** — after ▲８四桂 △９二歩 Sente still has a forced mate in 3 (▲７二桂成 … ▲８一金); text correctly limits itself to "the planned one-move mate disappears" but presents the drop as a working defense _Evidence:_ engine ev (1 s) mate 3 pv 8d7b+ 6c5d G*8a
- **endgame-mate-tesuji#1** — ja mixes plain form ("…入手できる。…確認する。", "…１枚へ増える。") into です/ます text; en uses western squares (6c, 2c, 8c, 4e) _Evidence:_ source text
- **yagura-vs-migishiken#0.s0** — says Gote's bishop 4b 'is blocked by its own pawn on 6d' from recapturing on 6f; 6f is not on any 4b diagonal, so the stated reason is wrong (conclusion holds) _Evidence:_ board
- **yagura-vs-hidarimino#0.s3** — "銀３五が次に４四の歩などから狙われるか" — Gote's pawn on ４四 attacks only ４五, not ３五 _Evidence:_ board
- **hineribisha#3.s1** — bare-king composition: at the learner's ▲７七桂 Sente has a forced mate in 11 starting ▲７一飛成 (Gote has only rook and silver); harmless for the point being taught but the quiz move is not the strongest by far _Evidence:_ mates.tsv
- **yokofu-basics#3.s2–s3** — bare-king endgame artefact: after △４二玉 the engine finds a long forced mate for Sente; ignore unless the diagram gains material |
- **yokofu-23fu#3.s2** — "この局面では評価値でもこの退路が最もよい" — not reproducible: k-p 0.8 s ranks ▲６四飛 (+195) and ▲８四飛 (+154) above ▲１四飛 (+133). The retreat is fine; the claim of engine-best is not. Avoid quoting engine rank in text. _Evidence:_ replies.ts 800 after B*6g
- **taifuri-anaguma#2.s1, v0** — bare composition: forced mate in 13 for Sente (▲９三角成 …) exists at the learner's move; lesson plays the quiet ▲５八金 / ▲２五歩 _Evidence:_ mates.tsv
- **taifuri-millennium#2.v0** — after the shown ▲２二飛成, Sente also has ▲９三角成 forcing mate in 6 from the position before it (engine 1 s); harmless to the recapture claim _Evidence:_ replies.ts
- **taifuri-millennium#1** — v0 ▲５七角 is graded as a lesson move though the engine's best is ▲９三角成; the chapter's claim ("５七 is a retreat that invites a pawn chase") is true _Evidence:_ screen

### Cross-cutting (C)

- About 20 ja steps end with a plain-form sentence spliced onto です/ます text after "。 " (attack-funa, castles-funa, castles-yagura, rules-moves, taifuri-45hayashikake, taifuri-46gin, taifuri-basics, taifuri-millennium, taifuri-ponpon, taifuri-vs-kakukoukan, tesuji-pawn, yokofu-85hisha, yokofu-aono, yokofu-avoid, yokofu-yuuki).
- Several units are written entirely in plain form (taifuri-*, yokofu-*, hineribisha, aiyokofu and others), unlike the です/ます units.
- 18 move texts omit 不成 where promotion was available (`data/sem.tsv`, NO-FUNARI).
- Recurring pattern in the older strategy units: a bishop drop or capture that the position allows (▲７三角 check-fork, ▲４二角成, a free rook or gold) is skipped while the lesson move is graded correct. Fix by repairing the diagram (add the guarding piece) rather than the text.

### Read, no findings

rules-game, rules-promotion, rules-drops, rules-checkmate, rules-fouls, rules-setup, rules-tsume, basics-value, basics-attack-defense, basics-middlegame, basics-endgame, basics-forks, judgment-four-factors, tesuji-knight, tesuji-gold, tesuji-rook, proverb-three-pawns, castles-first, castles-yagura, castles-funa, castles-hidarimino, castles-anaguma, castles-mino, castles-aifuri, castles-other, attack-mino-side, attack-mino-kobin, attack-mino-aifuri, attack-yagura-head, attack-anaguma, attack-funa, attack-kinmusou, attack-edge, endgame-defense, endgame-mate1, endgame-mate3, endgame-tsume-study, ibisha-basics, bougin-basics, bougin-middlegame, bougin-castles, yagura-build, yagura-bougin, yagura-aiyagura, yagura-37gin, yagura-waki, yagura-vs-bougin, taifuri-elmo.

## Triage candidates in the unread units

Engine screen hits, not verified by hand. Long engine mates in composed partial positions are usually artefacts of missing material; short ones are the likeliest real defects.

- `ureshino-counter#1.s2` LEARNER has mate 17 (7e7a+ 4a5b 7a8b 5b6c R*6a 6c5d 6a3a+ 5d6c 3a3e P*7b) but lesson plays ☗７八飛(7e7h) after=-1763
- `kishu-pacman#0.s1` [end] OPP to move has mate 57 (4d3c+ 5a6b 3c2d 6b5c 5i6h 5c5d 2d4f 5d6e R*8e 6e7f); text silent on 詰
- `kishu-pacman#0.s2` OPP has mate 57 (4d3c+ 5a6b 3c2d 6b5c 5i6h 5c5d 2d4f 5d6e R*8e 6e7f) but lesson plays ☗３三角成(4d3c+) after=-4358
- `ishida-43#0.s3` LEARNER has mate 23 (3c1e 5i6i 1e2f P*8c 7b8c 8h7i 4b4i+ 6i7h 4i4h 7h6g) but lesson plays ☖３二飛(4b3b) after=-554
- `ishida-43#2.s2` [end] LEARNER to move has mate 11 (2b7g+ 5i5h 3f2f P*8c 8b8c 5h4h 2f2g+ 2e2d R*1h 4h3i); text silent on 詰
- `ishida-43#2.s3` LEARNER has mate 11 (2b7g+ 5i5h 3f2f P*8c 8b8c 5h4h 2f2g+ 2e2d R*1h 4h3i) but lesson plays ☖３四飛(3f3d) after=-2010
- `kishu-sujichigai#1.s2` LEARNER has mate 13 (5c5d 5i5h 5b6b 5h5g B*6h 5g5h 6h3e+ 5h4h 6b6h+ 4h4g) but lesson plays ☖５四歩(5c5d) after=mate -16
- `kishu-sujichigai#2.s1` LEARNER has mate 13 (8c8h+ 4e2c+ B*7g 5i4i 7g6f+ 2c2d 5a6a 2d1e 6f5g 1e5i) but lesson plays ☖６二金(5b6b) after=-2526
- `gokigen-castles#0.s1` LEARNER has mate 39 (7g3c+ 8b4b 5h7h 4c5b 7h7a+ 5b6a 7a7c 6a5b 7c7b 8d8e) but lesson plays ☗３八銀(3i3h) after=-4391
- `gokigen-castles#1.s1` [end] LEARNER to move has mate 17 (7g3c+ 4c5b 5f2f 5b5c 2f2a+ 4a5b 2a3b 5c4b 3b4b 5b6c); text silent on 詰
- `gokigen-castles#1.s2` LEARNER has mate 17 (7g3c+ 4c5b 5f2f 5b5c 2f2a+ 4a5b 2a3b 5c4b 3b4b 5b6c) but lesson plays ☗３六歩(3g3f) after=-4101
- `gokigen-castles#1.s2` LEARNER has mate 13 (7g3c+ 8b5b 5f4f 5b2b 3c2b 4a5b 4f6f 4c5d R*3b 5b5c) but lesson plays ☗４六金(4g4f) after=-4465
- `gokigen-castles#2.s1` LEARNER has mate 23 (7g4d 8b5b 4d5c+ 5b2b 2h3g 2b3b 3g2f 3b8b 5c4c 8b2b) but lesson plays ☗１九玉(2h1i) after=-3880
- `gokigen-castles#2.s1` [end] LEARNER to move has mate 15 (7g4d 8b5b 5f5b+ 4a5b R*5c 5b6b 5c8c+ 6b5a 4d5c+ R*7a); text silent on 詰
- `gokigen-castles#2.s2` LEARNER has mate 15 (7g4d 8b5b 5f5b+ 4a5b R*5c 5b6b 5c8c+ 6b5a 4d5c+ R*7a) but lesson plays ☗３七銀(3h3g) after=-3603
- `gokigen-castles#2.s2` [end] LEARNER to move has mate 11 (7g4d 8e8f 5f5c+ 8f8g+ 4d3c+ 3b3a P*4b 8b8a 5c4c P*3b); text silent on 詰
- `gokigen-castles#2.s3` LEARNER has mate 11 (7g4d 8e8f 5f5c+ 8f8g+ 4d3c+ 3b3a P*4b 8b8a 5c4c P*3b) but lesson plays ☗２八銀(3g2h) after=-3355
- `gokigen-castles#2.s3` LEARNER has mate 13 (5f5c+ 3b4a 5c4c 4a3a 7g4d 8d4d 4c4d B*5a 4d4c 3a2b) but lesson plays ☗３八金(4i3h) after=-2865
- `gokigen-castles#2.v0.0` LEARNER has mate 15 (7g4d 8b5b 5f5b+ 4a5b R*5c 5b6b 5c8c+ 6b5a 4d5c+ R*7a) but lesson plays ☗３七銀(3h3g) after=-3603
- `gokigen-castles#2.v0.0` [end] LEARNER to move has mate 21 (7g4d 8b3b 5f5c+ 8f8g+ 4d3c+ 3b3c 5c3c 4a5a 3c5c P*5b); text silent on 詰
- `ishida-basics#3.v0.0` LEARNER has mate 11 (8f8d 5a4b 8d8b+ 4b4c 8b2b 4d4e R*6d 4e4f 5h2e 4c5c) but lesson plays ☗７六飛(8f7f) after=-1367
- `shiken-tateishi#2.s1` LEARNER has mate 17 (8h5e 6b7c 7e9e 7b2b 5e2b+ 8b7b 2b5e 7b6c R*2c 6c5b) but lesson plays ☗７二飛成(7e7b+) after=-1612
- `shiken-tateishi#2.s1` [end] LEARNER to move has mate 11 (8h5e 7b7c R*9b 8b8a 5e7c+ R*2d 2h3i 2d2h+ 7c2h 7a8b); text silent on 詰
- `shiken-tateishi#2.s2` LEARNER has mate 11 (8h5e 7b7c R*9b 8b8a 5e7c+ R*2d 2h3i 2d2h+ 7c2h 7a8b) but lesson plays ☗５八金左(6i5h) after=-1687
- `shiken-tateishi#2.s2` [end] LEARNER to move has mate 7 (8h5e 7b7c R*9b 8b8a 5e7c+ 6i4i+ G*9a); text silent on 詰
- `shiken-tateishi#2.v0.0` LEARNER has mate 11 (8h5e 7b7c R*9b 8b8a 5e7c+ R*2d 2h3i 2d2h+ 7c2h 7a8b) but lesson plays ☗６八金(6i6h) after=-1518
- `shiken-tateishi#2.v0.0` LEARNER has mate 7 (8h5e 7b7c R*9b 8b8a 5e7c+ 6i6h+ G*9a) but lesson plays ☗６九金(6h6i) after=mate -12
- `aifuri-vs-ishida#2.s1` LEARNER has mate 19 (B*4i 3h3g 4i7f+ B*2e R*2i 2e3f 2i3i+ 3g2f 3i2h 3f2g) but lesson plays ☖４二飛(4d4b) after=-256

Also open from `conductor/CURRENT_TASK.md`: nakabisha-sente ch1 and taifuri-46gin ch2 (baseline engine prefers R2h×2b+).

## Reproducing

`tools/` holds the scripts (they use absolute paths to the checkout and to a scratch directory; adjust the constants at the top). `dump.ts` renders every unit with boards after each step; `screen.ts`, `mates.ts` and `m1scan.ts` produce the screens; `pos.ts "<sfen>" <usi…> [--legal|--mates]` replays a line and lists legal replies or mating moves; `replies.ts <ms> "<sfen>" <usi…>` evaluates every reply with the engine; `m1all.ts` lists check and mate-in-1 for every reply.
