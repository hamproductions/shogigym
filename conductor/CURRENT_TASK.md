# Current task

## Objective
One unified learning system: every lesson (existing joseki/tesuji/kuzushi courses and the converted shogi-joutatsu lessons) stored in the same course format, listed in one catalog by category, with joseki chosen by strategy. Goal: extraction complete + learning flow intuitive.

## Request ledger (current session, ordered; latest correction wins)
1. /goal: read handoff, finish extraction/conversion of lessons, flawless intuitive learning — extraction DONE (2242 figures, 1254 replayable lines, 0 validator errors); UX IN PROGRESS.
2. Lesson navigation, one-by-one + random quiz — done, browser-verified.
3. Panel must not block board; quiz prompt clear; no empty block — done, browser-verified.
4. Lesson must flow like the source lesson (order, text) — done.
5. Game analysis overview from the other branch, obvious place, full report — done (分析 tab, ⤢ full screen).
6. Systematic UX improvement as new user; seamless practice loop; real hints; 両取り → fork drills — done, browser-verified.
7. No jargon (従来の定跡練習) — superseded by 9–12.
8. No browsers right now; do what the user asks, decide without asking.
9. One joseki section; organize by category; user selects strategy; never hide the existing 定跡 feature.
10. Unify properly: no parallel lesson system; lessons saved in the universal course format and embedded in the same catalog/player/progress.
11. "Article lesson" is not a concept: a lesson is a lesson (no 記事レッスン wording anywhere).
12. /ask-matt answered; /what-did-i-say, /get-your-shit-together, /unfuck-yourself invoked → ledger + audit + repair (this section), then execute 10–11.
- Non-actions: no commit/push/PR; no browser unless needed for final verification and user allows; no questions where the user said decide.

## Audit (2026-10-10)
- Failure: converted lessons built as a parallel model (diagrams JSON + separate reader, quiz, progress, catalog). Every later request (two joseki sections, conflicting entries, hidden 定跡, "article lesson") was patched in navigation instead of fixing the data model.
- Stage: planning/architecture at conversion time; repeated at each correction (UI-layer patches).
- Escape: no check that new content uses existing course format; corrections answered by menu reshuffles; then blocked on A/B question despite the user having said to decide.
- Repair: AGENTS.md rule (unified lesson format); execute conversion below; no blocking questions.

## Plan (decided)
- Lesson = Setup (catalog entry: title, intro, category). Chapter = Course in RawCourse JSON (universal format).
- Builder emits `src/data/lessons/<topic>.json` = { lesson setup meta, courses: RawCourse[] }: consecutive figures joined by their move lists form one chapter tree; node comments = figure title + explanation; a figure not reachable from the previous one starts a new chapter.
- Catalog/model load these like every other course; hub lists Setups by category (はじめての将棋 / 上達 / 定跡→strategy). One player, one progress, one quiz/drill. Remove the separate reader/series/random paths after parity.
- Done 2026-10-10 (typecheck/lint/validator only; no browser — user stopped browser use; disk 808 MiB free blocks vite build):
  - `scripts/build-lessons.ts` → `src/data/lessons/*.json`: 171 lessons (incl. 15 text-only), 1378 chapters (1273 figure chapters + 105 examples), 5235 legal moves, 2475 figure nodes; validator 0 errors.
  - Catalog loads lessons as Setups (`path`, `check`); `node.figures` drive marks/illustration in the normal player (`figureMarks.ts`, useLesson effect).
  - Library = `OpeningPicker.tsx`: home → はじめての将棋 / 上達のためのテクニック / 定跡; lesson page = overview, 最初から学ぶ, ランダム出題, chapter cards, 理解度チェック, source; 定跡 = strategy chooser + that strategy's lessons + matchups + other joseki groups. Technique courses sit under 手筋/囲い崩し.
  - Chapter bar (prev/next, random tally, back to contents, next lesson) works for every lesson set (LessonPane seriesOf by setup).
  - Removed: Curriculum.tsx reader, curriculum-index.json, diagrams in src, line-course/series/random-by-article code, openTopic. Report lesson links + welcome rules open lesson setups.
- Not done: browser verification of the unified library and player; 24 one-sided setup move lists exist only as text in comments; tsume-related practice from old topics not carried over.
- Next action: user-approved browser check (library → lesson → chapter study/quiz → random → back; report link; crop illustration lesson 1629).

## Extraction pipeline (replaces per-image hand transcription)

- Work dir `.cache/extract/` (ignored). Scripts: grid.py (line detection), cells.py/run_cells.py (cell glyphs), cluster.py (leader clustering), margins.py (hand/coordinate glyphs), recognize.py (board+hands+orientation+flags), render.py (source-vs-recognized sheets).
- Labels: `cluster_labels.json` (248 board-glyph clusters), `hand_labels.json` (hand-text clusters), `top_labels.json` (file digits → flipped-board detection). Every cluster verified visually with 5 members incl. farthest-from-mean (vlab_*/vhand_*). Fixed: 207=inverted 金, 83=gote と, 130=+S, 146=+N, 200=+P; hand 243=五, 285=三, 300=arabic 2, 189=桂香 composite.
- Overrides `overrides.json`: arrow-obscured castle-building cells, komadai-style superscript hands, 8 wood-piece boards transcribed manually (932 boards cross-checked against prose point totals 28/26 and 10-piece declaration example).
- Result `recognized.json`: 2023 standard 9×9 boards, 0 unresolved cells. Seeds 39/39 exact; all 175 flagged boards reviewed side by side; random audit 36/36 correct. Three boards faithfully show impossible piece counts (source illustrations) → display only.
- Not yet handled: 372 non-standard images (crops, multi-board, rule illustrations, photos/covers). Next: classify and represent (crop-relative format; non-boards excluded with reason).

## Export (done)

- `.cache/extract/sequences.py` → ordered per-article occurrences (boards + crops.json crops/pieces/manual boards). `crops.json` = hand transcription of 85 non-standard rule illustrations (crop-relative panels), verified side-by-side (review/crops_*.png); non-boards excluded with reason.
- `scripts/build-source-lessons.ts` (bun) → `src/data/curriculum/diagrams/<article>.json` (156 files, 2242 diagrams). Lines = prose move lists (図X からの指し手 … （図Y）) parsed with tsshogi parseMoves, replayed from source figure, accepted only when result placement == target figure (1101 lines; 156 rejected, logged .cache/extract/line-failures.json). Hidden hands: only drop-required pieces added for practice.
- Captions en via 2 sonnet agents (.cache/extract/i18n/en_*.json, 2169 keys, spot-checked 25).
- Old seed rule17 was wrong (rook 6八 not 5八); old curriculum-diagrams.json superseded.

## App (done, verified in headed browser)

- `src/utils/curriculum.ts`: lazy per-article diagrams (import.meta.glob), `lineCourse`/`curriculumLineCourse` (learner = side making the final move), `series` (all playable sequences in article). `src/data/curriculum-index.json` counts for list subtitles.
- Reader (`Curriculum.tsx`): position stepper (‹ select ›, `[`/`]`), board loads `{start, verified moves}` so ← → / move chips replay source moves; source marks (last-move highlight, arrows, boxes) via `session.sourceMarks`; crop/piece illustrations overlay the board (`SourceIllustration.tsx`, `source-reader.css`); honest notes (partial, hidden hands, gote view).
- Practice: "Study them in order" (series), "Random quiz"; LessonPane series bar (back to article, ‹ n/m ›, random), done-card next sequence/next question. Study-mode forward/last step through the line (NavFooter).
- Welcome: "Learn the rules first" opens article 656.
- Validator re-replays all 1101 lines: 0 errors. tsc/oxlint clean. Old seed file deleted (rule17 seed was wrong).
- User feedback (this session): lesson navigation weak when moving forward; wants one-by-one progression and random quizzes → addressed above.

## Critic pass (done)

- 12 findings from independent critic; fixed: arrow keys after button clicks (useShortcuts guard), stale illustration/marks after leaving, `[`/`]` only (no PageUp/Down, modifier/dialog guard), random-mode ‹ disabled, running random tally (sessionStorage), load error + retry, back-to-article restores topic+figure (also after reload), next-article at series end, quiz prompt wording, a11y labels/aria-live/aria-current, storage message misuse. Shared `useLineAhead` for footer and keys. Not done: random flag not persisted across full reload (resumes as ordered sequence).

## Article flow + fixes (2026-10-10)

- Per-figure article explanation: `.cache/extract/segments.py` extracts the text after each caption (+ TOC section heading); paraphrased ja/en by subagents (`i18n/step_*.json`, 2182 keys; spot-checked), headings `headings_en.json`. Export adds `explain`/`section`; 2168/2242 figures have explanations.
- Reader = article order: section → moves into figure → figure title → explanation → Back/Next; summary collapsed. Line lessons show from-figure explanation at start, target explanation on completion.
- Quiz: prompt "記事の手順を再現します。ねらい：…。次の手を指してください。"; reserved feedback space moved below prompt.
- Panel: reader panel no longer stretches past its free zone over komadai/board; docks when free zone < 320×520.
- Engine: `engineReady` (both kings, full 40-piece set) gates analysis/review/rating; fixes WASM crashes on partial source figures.
- Rejected lines (146) checked: suspicious targets match sources; rejections are article text/figure discrepancies, left unreplayable rather than invented.
- Full-app sweep: 156 articles / 2242 figures render correctly, 0 mismatches.

## Completion pass (2026-10-10)

- Explanations: 2242/2242 figures (after-text paraphrase 2168; before-text paraphrase `step_before.json`; worksheet hints and 30 hand-written from source sentences/captions in `step_manual.json`). Validator now requires an explanation per figure.
- Move lists: 1111 replayable + 141 figures carrying the article's stated moves (`statedMoves`) marked as not replayable because they don't reach the drawn figure — every article move list reaches the learner.
- Random quiz verified with real moves on the 2D board: wrong move ✗1, correct drop ✓1, tally carried across questions (3問目 ✓1 ✗1), random mode survives reload, back-to-article lands on current figure.
- Full sweep: 156 articles / 2242 figures, 0 title mismatches, 0 missing explanations, 141 stated-move notes. Engine warnings only under <200ms burst switching (worker termination); 0 at human pace and 0 per figure in isolation.

## Move-list reconciliation + crash fixes (2026-10-10)

- Builder reconciles article move lists that don't replay: stage 1 substitutions (≤2), stage 2 insert/skip (≤2), stage 3 near substitutions (≤4, same square/piece), plus untouched-square figure adjustment; accepted only when the result is unique and reaches the drawn figure. Every change is disclosed per move (reader list + lesson notes; `correctionText`). Degenerate repairs (empty / self-referencing) rejected.
- Result: 1212 replayable lines; one-sided setup lines (article omits replies) replay move by move in the reader; 40 figures still stated-only (article text genuinely ambiguous or contradictory).
- Engine crash root cause: positions where the side not to move is in check (illegal) fed to YaneuraOu. `engineReady` rejects them; builder flips turn on such figures; validator rejects them.
- Validator: explanation per figure, legal turn, strict study-course replay, degenerate lines.
- Verified: full engine-active sweep 156 articles / 2242 figures, 0 mismatches, 0 missing explanations, 0 console errors; all 1212 lines replay via app semantics.

## State

- Dev server (bun) on 5173 started this session; nothing committed/pushed (no authorization).
