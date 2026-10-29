# Brief: rebuild strategy lessons from the supplied references

Repo `/Users/vittayapalotai.tanyawat/code/joseki-practice`, branch `feat/lesson-curriculum`.

## Why

The owner rejected the current lessons. Each strategy unit was supposed to teach what its reference article teaches (shogi-joutatsu.com). Instead it became abstract "count / read" fragments on stripped boards with three or four pieces. Learners cannot tell how a position arose or how to play the strategy. Rebuild every assigned unit so it teaches the same strategy content as its article, on real positions reached from move one.

## Exemplar (read completely first)

`data/lessons/units/kishu-migishiken-hidarimino.json`, rebuilt from article 4961 (`.cache/curriculum-source/4961.txt`, diagrams in `.cache/curriculum/ref/4961/`). Match its depth, structure and tone:

- Chapter 1 builds the strategy's basic diagram (基本図) from `startpos`, a few moves per step, explaining what each group of moves is for. The last step lists the points to remember.
- Each later chapter covers one of the article's sections (for example vs 矢倉, vs 四間飛車). It replays the build in its first step, then follows the article's line move by move. The article's branches become `variations` anchored to the right step.
- Every position shown matches the article's diagram (図) exactly.

## Procedure for each assigned unit

1. Read the article text completely: `.cache/curriculum-source/<article>.txt`. The unit-to-article map is in `conductor/lesson-rebuild/inventory.md`, column "Study IDs".
2. Get the article's diagrams. The extracted text loses them, and they are the source of truth for positions.
   ```bash
   mkdir -p .cache/curriculum/ref/<article> && cd .cache/curriculum/ref/<article>
   curl -sL -A "Mozilla/5.0" https://shogi-joutatsu.com/archives/<article> -o page.html
   grep -o 'https://shogi-joutatsu.com/wp-content/uploads/[^" ]*\.png' page.html | grep -v -e eyecatch -e favicon -e logo_small -e covid19 -e kidleunlimited -e _iPhone | grep -v -E -- '-[0-9]+x[0-9]+\.png' | awk '!s[$0]++' > urls.txt
   while read u; do curl -sL -A "Mozilla/5.0" -o "$(basename "$u")" "$u"; done < urls.txt
   ```
   Network commands need the sandbox disabled. View every diagram with the Read tool. The image order in `urls.txt` follows the order of the figures in the article. Map each image to its 図 number using the text.
3. Reconstruct each diagram as a move sequence from the initial position. A handicap article uses its handicap start instead (`HANDICAPS` in `scripts/lessons/unit.ts`). Transcribe the diagram into SFEN board ranks (rank a = 一 at the top, files 9→1 left to right; Gote pieces lowercase). Then find a natural move order and verify it:
   ```bash
   bun scripts/lessons/play.ts --target="<board> <b|w> <hand or ->" <usi moves...>   # prints MATCH or DIFF
   ```
   Every diagram the lesson shows must print MATCH (board and side to move; compare hands by eye if needed). The engine and book can help with ordering: `bun scripts/lessons/book-walk.ts <moves>` and `printf '<sfen>\n' | node scripts/lessons/engine-eval.mjs 1000`.
4. When the article's text and its diagram disagree (OCR or typo), the diagram wins. Note it in your report.
5. Write the unit in place (keep `id`, `order` and the file name). Use `kind: "opening"` and `start: "startpos"` (or the handicap SFEN) for every chapter whose positions come from an opening. Use a `position` start only when the article's diagrams are genuinely not reachable as a game: castle catalogues that show only one side, or a deliberately composed tesuji diagram. Even then, the position must be a full, sensible board, not a fragment.
6. Title: `<戦法名>：<what the lesson teaches>`, plain and concrete, for example 「右四間飛車左美濃：組み方と攻め方」 / "Right Fourth File Rook with Left Mino: setup and attack". `path` stays `["戦法・定跡", "<group>"]`, with the group set to the strategy's name. `intro` says in two to four sentences what the strategy is and what the learner will be able to do. `check` asks the one key idea. `references` lists the article as `{ "title": <article title>, "url": "https://shogi-joutatsu.com/archives/<n>", "license": "All rights reserved", "adapted": false }`.
7. Check until clean: `bun scripts/lessons/check-unit.ts <id>`. ERROR lines must be zero. Book NOTE lines are informational.

## Writing rules

- Teach the article's content faithfully: the same strategy, basic diagram, plans, move sequences, branches and key points. Moves and positions reached from the initial position are facts.
- Every sentence is written by you in natural Japanese, and the English is a translation of it. Never copy or closely paraphrase the article's sentences, dialogue or headings. `check-unit` rejects runs of 16 or more shared Japanese characters. Do not include the site's characters (歩美, 香介), book advertising, apps or video plugs.
- Explain why each move or group of moves is played, and what the opponent threatens. Name squares with ▲/△ notation like ▲２五桂 and full-width digits as in the exemplar.
- Never write the em dash character. No filler, no "let's dive in", no hype words.
- Marks: `last` for the moved square, `arrows` (USI from-to) for the idea, `boxes` for key squares. Every arrow must be correct on that position.
- Chapters are usually 2 to 5. Steps hold 1 to 12 moves each. Whole build sequences can sit in one step when the build was taught in an earlier chapter.

## Constraints

- Edit only the unit files assigned to you in `data/lessons/units/`. Never run `bun run lessons`, `bun run check`, git, or any formatter except `npx prettier --write <your unit file>`.
- Run commands one at a time. No background processes and no sleeps.
- Scratch files go in `.cache/curriculum/ref/<article>/` only.
- Commands that use threads: prefix with `RAYON_NUM_THREADS=1`.

## Report (short, per unit)

Unit id, article(s), new title (ja), chapters with move counts, every diagram number with MATCH confirmed, text-and-diagram disagreements, and anything left unverified. Also keep `.cache/curriculum/progress-<your group>.md`, updated after each unit, so the work can resume if you are interrupted.

## Second reference: yuki-keio/shogi 技図鑑

The owner also supplied https://github.com/yuki-keio/shogi. A clone is at `.cache/yuki-shogi` (commit f0740fb). Its file `pages/waza-content.mjs` builds each strategy, castle and tesuji from the initial position and explains every single move for beginners. Each entry also has `pros`, `weak`, `counter` and `sections`. Read the entry that matches your unit before writing:

| waza id | units |
| --- | --- |
| bogin | bougin-basics |
| migi_shiken_bisha | kishu-migishiken-hidarimino |
| naka_bisha | gokigen-basics, nakabisha-sente |
| shiken_bisha | shiken-basics |
| sanken_bisha | sanken-basics |
| mukai_bisha | mukai-build |
| kakugawari | kakugawari-basics |
| ishida_ryu | ishida-basics, ishida-honkumi |
| ureshino_ryu | ureshino-basics |
| gangi | gangi |
| furibisha, ibisha | ibisha-basics, taifuri-basics |
| kata_mino, hon_mino, taka_mino, gin_kanmuri, fune_gakoi, yagura, kani_gakoi, kin_muso, ibisha_anaguma, furibisha_anaguma, hidari_mino | castle units |
| tarefu … keito_no_gin | tesuji units |

What to take from it:

- In the first chapter of a strategy or castle unit, explain every move of the learner's side in its own step, in plain beginner language: what the move does and why now. Put the opponent's reply in the same step as the learner's next move.
- Add a final step to chapter 1, or a short last chapter, covering the strategy's strengths, its weak points and how opponents usually meet it, shown on the board where possible.
- The licence is GPL-3.0-only, so the text is a reference, not a source to copy. Write your own sentences. Add it to `references` as `{ "title": "将棋の技図鑑 (yuki-keio/shogi)", "url": "https://github.com/yuki-keio/shogi", "license": "GPL-3.0-only", "adapted": false }` when you used it.

## Resuming

An earlier run of these writers was stopped part-way. Before starting, read `.cache/curriculum/progress-<group>.md` if it exists, and run `git diff --stat -- data/lessons/units/<id>.json` for each of your units. A modified unit may be half done: finish it, re-verify every diagram MATCH, and run check-unit. Never revert another writer's file.

## Tutorials for strategies without a lesson

Every strategy in `src/data/strategies.ts` must have a tutorial taught from its own side. Some have no reference article, so you create a new unit file `data/lessons/units/tutorial-<strategy id>.json`. Use `path` `["戦法・定跡", "<family>"]`, the `order` given in your assignment, and a title `<戦法名>入門：<what the learner can do afterwards>`.

Required shape, the same as the exemplar:

1. Chapter 1, from `startpos`: what the strategy is (first step text), then the build to its basic position, one step per learner move with the opponent's reply included, each move explained for a beginner. The last step gives the points to remember.
2. Chapter 2: the main attack or plan, move by move to a clear result. Add the opponent's most common alternative as a variation.
3. Chapter 3: the standard counter-strategy against it and how to respond, or the typical mistake that loses.
4. A final step on strengths and weaknesses.

Move sources, in order of preference:

- The existing joseki drill for that strategy, named in your assignment. Its JSON is in `vendor/shiryu-joseki/src/data/joseki/` or `src/data/joseki/`: follow `branches` with `kind: "main"` from `root`. These lines are already in the app (GPL-3.0). Take the moves; write your own explanations.
- The Peta book (`scripts/lessons/book-walk.ts`) and the engine for anything else.
- Any matching article in `.cache/curriculum-source/`, read for facts.

Check with `bun scripts/lessons/check-unit.ts tutorial-<id> --engine`. There must be no engine-loss NOTE above 300 on the learner's moves, unless the step text explains that the move is a deliberate mistake.

## Tutorial pass (units listed in `TUTORIALS`, `src/data/curriculum.ts`)

Each unit in `TUTORIALS` is the tutorial for its strategy. Its chapter 1 must be the per-move tutorial:

- Starts from `startpos` (or the handicap start), `kind: "opening"`.
- The first step, with no moves, says what the strategy is and what the learner will build.
- Every following step holds at most two moves: the opponent's reply and the learner's next move. The text explains the learner's move in beginner language (what it does, why now) and names the opponent's reply.
- It ends at the strategy's basic position with a step listing the points to remember, then a step on strengths and weaknesses.

If the unit's current chapter 1 already starts from `startpos`, split its grouped steps into per-move steps and write the missing explanations. Otherwise insert a new chapter 1 titled `入門：初手から<基本図の名前>まで` / `Tutorial: from move one to <basic position>`, built from the same moves the rest of the unit uses (the article's basic diagram, verified with play.ts MATCH), and keep the existing chapters after it. Do not shorten the later chapters.

Verify with `bun scripts/lessons/check-unit.ts <id>`, and check that every step in chapter 1 has at most two moves.

## Non-opening units (tactics, castle attacks, endgame, basics)

These units teach named techniques, not openings. The references (shogi-joutatsu article plus the matching yuki-keio 技図鑑 entry: tarefu, tataki_no_fu, tokin_zukuri, wariuchi_no_gin, fundoshi_no_kei, oute_bisha, juji_bisha, dengaku_zashi, atama_kin, hara_kin, sokofu, aki_oute, ryo_oute, keito_no_gin) define what to cover. Composed diagrams are creative works, so build your own positions; do not copy the article's piece layout.

- One chapter per named technique or idea the article covers, titled with its common name (for example 「垂れ歩」 / "Dangling pawn"). Unit title: `<topic>：<what the learner can do afterwards>`, plain and concrete. No abstract "count / read" titles.
- First step: what the technique is and when it appears in real games, in one or two sentences.
- Then show it on a position that looks like a real game: both kings present and protected, sensible castles or a believable middlegame, enough pieces that the learner recognises the situation. A focused board with fewer pieces is fine for mate problems and endgame drills, but never a board with unexplained floating pieces.
- Then play the technique move by move: the learner's move, the opponent's best reply (check it with `printf '<sfen>\n' | node scripts/lessons/engine-eval.mjs 1000`), and the result, with marks. Add the common wrong move as a variation that shows why it fails.
- End each chapter with one sentence on how to spot the technique in your own games.
- Mate units: every claimed mate must be a real mate. Verify the final position with `bun .cache/audit-2026-10-22/tools/pos.ts "<sfen>" --mates` or the engine (mate score).
- Use `kind: "position"` and a full SFEN start. Check with `bun scripts/lessons/check-unit.ts <id> --engine`: zero ERROR lines, and no engine-loss NOTE on the learner's moves unless the text explains it is a deliberate mistake.
