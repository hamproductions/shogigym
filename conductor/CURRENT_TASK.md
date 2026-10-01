# CURRENT TASK

## Goal (/goal, 2026-10-01)
Shogi trainer app, Shiken-bisha (四間飛車) focus:
- Learn / practice / memorize joseki; win + failure patterns; explanation/reasoning/ideas per move
- Shiken-bisha vs every major setup + brief intro per setup
- Engine ("AI") optimal move in any position
- Flowchart "what do I do next"
- Reuse existing libs/data; research GitHub + web first; adapt close prior art (Shiryu181/shogi-joseki)
- Proven learning methods (spaced repetition, retrieval, punish-deviation drills, sparring)
- UX: stupid easy, free, uncramped; play anything anytime, app reacts
- Tsume / tesuji / endgame trainer
- Correct user's moves; explain WHY in human terms from engine output
- chess.com-style labels (Brilliant ... Blunder)
- Kifu import + full-game analysis
- Must be very fast; test heavily by using it; keep iterating

## Decisions
- Stack: Vite 8 + React 19 + TS (bun), tsshogi (MIT), @mizarjp/yaneuraou.k-p (GPL-3) in public/engine (postinstall copy), COOP/COEP in vite.config.ts
- Joseki JSON imported with `?raw` + JSON.parse (Vite JSON plugin recursion limit on deep trees)
- Data: vendor/shiryu-joseki (GPL-3.0) + scripts/courses/*.mjs -> src/data/joseki (node scripts/build-courses.mjs); legality: node scripts/validate.mjs (765 moves, 0 errors)
- Tsume: data/tsume-raw (streamed sample of YaneuraOu 5M set) -> node scripts/solve-tsume.mjs N -> src/data/tsume.json; strict check: node scripts/verify-tsume.mjs [--prune] (1148 problems, 0 failed)
- SRS: Chessable ladder 4h,1d,3d,1w,2w,1mo,3mo,6mo; wrong -> L1; difficult = >=3 mistakes & level<4; cards keyed by position SFEN (srs v2)
- Labels: win% = 1/(1+exp(-cp/600)); chess.com expected-points cutoffs (0/.02/.05/.10/.20); accuracy = lichess formula
- Speed: engine preloaded, threads=min(4,hc-1), review 2x300ms, cache per position, prefetch on user's turn, skip 2nd search when move in MultiPV

## Verified in browser (agent-browser session `joseki`, http://localhost:5317)
- Home, course page (flipped gote board), book moves stamped 本, off-book rated (Excellent etc.)
- Blunder flow: ▲7八銀 -> Blunder ??, hanging 角 explanation, red refutation arrow; ~320ms
- Quiz + book opponent; opponent-mistake jump via flowchart with punish note
- Tsume 3手 solve via drop + auto defender; mate detection
- Analyze: sample (47 book moves), KIF file upload, blunder/great labels, save mistakes -> Review puzzle solved
- Review learn-new + Show me arrow

## Constraints
- Disk tight (~0.5–1.5 GiB free)
- Leftover agent-browser sessions from other work (default, flasta-capture-audit, mreel, courta-306-sep30): not ours
- Dev server: background task on port 5317, must be killed at end; close session `joseki` at end
- No push/deploy/external writes; no Artifact publishing

- Mobile 390px (no horizontal scroll, even board rows), light + dark mode, production build (264 KB gz)
- Book moves reviewed by engine (4五歩早仕掛け △同歩 shows -4%, AI prefers △同角 = matches source)
- Patterns page (9 failure / 8 win patterns) + deep link #/course/<id>/<nodeId>
- Console clean on all pages

## Commits (local only, not pushed)
- 6adc853 initial app; 03b40ab engine review of book moves + patterns page

## Next action (user said continue working, 2026-10-01)
1. Code review subagent on 6adc853..03b40ab; verify findings myself, fix confirmed ones
2. Sourced lines for 左美濃 / ミレニアム / 相振り飛車 (verify sources directly; no invented moves)
3. Per-line progress on home
