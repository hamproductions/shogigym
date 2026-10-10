# Writer brief: original joseki courses

Repo `/Users/hamp/fun/shogigym`, branch `audit/lesson-copyright`. Some joseki courses were copied from copyrighted sites and are being replaced by courses written independently for this app.

## Read first (completely)
1. `docs/lessons.md` (copyright rules section applies to courses too).
2. `scripts/build-courses.mjs` (course spec format: `line` = { moves, notes{index: text}, comment, branches[] }, `kind` main/alt/deviation, `punishNote`, `aim`).
3. `scripts/courses/kuzushi-mino-36kei.mjs` and `vendor/shiryu-joseki/src/data/joseki/ibisha-vs-shikenbisha--bougin.json` for tone and structure.

## Clean-room rules (strict)
- For replacement courses you must NOT open the old course files you replace (`scripts/courses/shogirule-*.mjs`, `src/data/joseki/shogirule--*.json`) and must NOT open `.cache/reference/` or any shogi-rule.com page. Build the line independently.
- Opening move sequences are facts. Build the line from the opening's defining moves (from your knowledge of standard theory) and extend it with the YaneuraOu Peta book and the engine:
  - `bun scripts/lessons/book-walk.ts <usi moves...> [--plies=N]` shows the book's candidate moves (with evals) at every ply and can extend along the book's top move.
  - `printf '<sfen>\n' | node scripts/lessons/engine-eval.mjs 1000` prints `<score for side to move> <bestmove> <mate or ->`.
  - Prefer natural, instructive book moves that show the strategy's typical plan; it does not have to be the single top book move every ply. 25–50 plies of main line is a good length; add 1–3 branches for the important alternatives (a typical mistake as `kind: 'deviation'` with `punishNote`, or the opponent's other main reply as `kind: 'alt'`).
- Write every note and comment yourself in natural Japanese: what the move does and why, what the plan is. No sentence may follow a source's wording. `goalFormation` = one or two sentences describing the final position and the plan. `rootComment` = what this course teaches.
- `source` field: state honestly how the line was made, e.g. 「手順は定跡の基本形をもとに、やねうら王の新ペタショック定跡(MIT)の候補手とエンジン検証で構成。解説はこのアプリのために書き下ろし。」 Do not name or cite shogi-rule.com.
- Titles must not name any website.

## Check until it passes
`bun scripts/lessons/check-course.ts <spec-file-name-without-.mjs> --engine`
ERROR lines must be zero. Engine-loss NOTE lines (> 300) must be fixed unless the move is a deliberate `deviation` whose note explains the mistake. Book NOTE lines are informational.

## Rules
- Write only the files assigned to you in `scripts/courses/`. Do not run `node scripts/build-courses.mjs`, do not edit `src/data/strategies.ts` or anything else. No git. No websites except ja/en Wikipedia. Commands one at a time; no background processes.

## Report back (short)
Per course: file, id, title (ja), mySide/myStrategy/opponentStrategy, main-line length, final engine eval, remaining NOTE lines and why, and a one-sentence matchup note in ja and en (the plan the learner should remember) for `strategies.ts`.
