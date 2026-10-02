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
- Disk: hit 100% full on 2026-10-01 (external cause; own footprint ~41 MB screenshots); dev server died ENOSPC. 18 GiB free after recovery. Run df -h before heavy work
- Leftover agent-browser sessions from other work (default, flasta-capture-audit, mreel, courta-306-sep30): not ours
- Dev server: background task on port 5317, must be killed at end; close session `joseki` at end
- No push/deploy/external writes; no Artifact publishing

- Mobile 390px (no horizontal scroll, even board rows), light + dark mode, production build (264 KB gz)
- Book moves reviewed by engine (4五歩早仕掛け △同歩 shows -4%, AI prefers △同角 = matches source)
- Patterns page (9 failure / 8 win patterns) + deep link #/course/<id>/<nodeId>
- Console clean on all pages

## Commits (local only, not pushed)
- 6adc853 initial app; 03b40ab engine review of book moves + patterns page; 93d898c 左美濃 line (ja.wikipedia) + start-position support + per-line progress; 角交換四間飛車 (hibitonshi) course
- Uncommitted: src/pages/Analyze.tsx — "Followed X" names all matching courses (<=2) else "the opening shared by N book lines"; verified in browser (startpos 7g7f 3c3d -> 15 lines; 7-move 角交換 line -> single title), console clean

## Done (uncommitted, 2026-10-01): sourced ミレニアム + 相振り飛車 lines
- scripts/courses/millennium-65fu.mjs: shogijam.com 四間飛車対ミレニアム③.kif (53 moves, legal, "まだ定跡" to ▲6八銀); prose from hibitonshi 2018-07-25 (its move list unusable: omits △3三角 and ▲2五歩, ambiguous 金 moves)
- scripts/courses/aifuri-84fu.mjs + aifuri-nishikawa.mjs: thirdfilerook.jp 第4→5図, 第2→3図; start SFENs parsed from page SVG; end boards+hands match source diagrams; text "▲6六飛" vs diagram/caption ▲6八飛 -> used ▲6八飛
- SETUPS millennium/aifuri wired; footer credits; build 839 moves 0 errors; browser-verified (desktop + 390px), console clean
- Known inconsistency: millennium SETUP intro says "less solid than Anaguma" vs hibitonshi "穴熊と同等の固さ" (not changed)

## Active (user correction 2026-10-01 22:50): new-user UX overhaul + dogfood until smooth
Done + browser-verified (fresh storage, desktop + 390px):
1. AI always on (toggle + A key removed)
2. Rail = 定跡 Openings / 復習 Review / 詰将棋 Tsume / 対局 Play AI / 検討 Analyze; colored mode header (seal + title + what to do now); Library tab removed
3. Lesson: 研究 Study (green arrow + reason, their move waits: panel card / Space) and 試験 Quiz (no hints, opponent auto-replies, ✓/✗ tally, SRS recorded); Line complete card (Quiz this line / Start again / Other lessons)
4. Wrong lesson move: not committed; board plays deviation punish line (book) or AI continuation; honest label (known mistake / mistake −x% / 本筋外 playable but not lesson move); Go back and try again
5. Opening picker: "What does your opponent play?" setups -> lessons with Study / Quiz buttons + progress; search
6. Komadai fanned (every copy, rotated overlap; big pieces row, pawns row)
- Also: Play AI hides AI arrow + book list, coach rates YOUR move; plates hide empty pills, strategy found at any rank; phone sheet opens tall for picker
- Lint: warnings only (react-compiler patterns in src/workshop + scripts)
Goal (user /goal, re-issued x3): use SUBAGENT dogfood runs repeatedly; fix all findings; never stop/report with open items.
Rounds 6-28 (2026-10-02): dogfood loop with 2 testers per round (desktop + phone), every finding fixed and browser-verified; details live in git diff. Key additions: variation tree, formation banner, resign, auto-saved game mistakes, lesson progress, tsume stable layout, KIF import notes, legends, phone layout.
- crash on wrong Study move at ply 0 (bookLast used sfens[cursor-1]) -> preview-aware prevSfen; lesson notes from own course (fixes opponent-perspective 'Last move' note)
- review: first-try miss decides schedule (retry flag), no 'green arrow' text during playback, Learn new shows real count, queue-specific empty states, board reset when no card, banner go-back hidden in review, 本筋外 seal -> ✗
- moves tab follows preview; tsume: no solution on wrong, 2-step hint (piece clue, then arrow; arrow-assisted not counted), check-progress message, wrong move plays defender escape line, side plates
- board: file/rank coordinates (flip-aware); hand pieces stacked+tilted with count badge; picker board locked, plates hidden
- new asks: tap any piece -> squares it covers (no turn change); 逃げ道 toggle (K) shows enemy king escape squares; lesson resumes after reload; basics sente lesson first; copy fixes
Added (verified): app renamed ShogiLab 将棋ラボ; 1手詰 set (399, derived from 3手詰 after 2 plies); wrong lesson moves graded by AI (label, reasons, lesson move named only in Study); fan direction fixed (outer tops lean outward); 16 shogi-rule.com 四間飛車 lessons from their .kif files (GPSfish-annotated lines, page summary as end comment) in bougin/hayashikake/anaguma/migishiken/hidarimino + new groups kyusen, tateishi; 1532 moves 0 errors.
Komadai redone (verified): square stands (STAND=3.0), each row an arc fan (radius from spacing, outer pieces lower + tilted outward), crowded hands scale down. Restore validates saved games; App error boundary with 'Reset the open game' (verified invalid session no longer crashes).
Rounds 2-5: sessions persist on reload; tsume go-back fixed; promotion dialog fixed; autoplay limited to Analyze/Play AI/previews; Esc closes dialogs; settled-analysis cache; off-book card; revealed answers not counted; quiz score persisted.
Fixed (verified): game-end crash (arrow parse of resign/none guarded, no AI arrows at game over) + 詰み game-over panel (Review this game / New game); 王手 chip + red king square + sound; branching in Play AI/Analyze (変化 banner, Back to the main game, Keep this branch); inline AI controls (AI tab: think time + lines; Play AI coach: strength); single capture knock; 同 notation in Moves; honest map-jump end text.
Variation tree (src/workshop/tree.ts) in Play AI + Analyze (verified): moves never delete, existing move follows branch, Moves list shows 変化 chips (switch / × delete / +N), Variation banner (Back to the main line / Make this the main line), tree persisted per mode + reload. Logo: koma + 究 (rail seal + favicon.svg, replaced Vite default).
Latest user asks (2026-10-02, all verified in browser): KIF export via Copy KIF; save SLOTS not files (棋譜 tab GamesBox: Save game / Saved games open+delete / Load a game / Copy KIF; src/workshop/games.ts); branching for both players in Play AI history; branch hint banner; King escape moved into Tsume panel; spacing fixes; frame clear of eval bar.
Dev server: bash task b7glz9xn2 (2h limit; restart when killed). Testers: dogfood-o (desktop) / dogfood-p (phone) subagents, resumed each round.
User: AI strategy selectable -> Play AI header 'AI plays' select (settings.aiStrategy; setups with courses for your side); AI follows that setup's book lines (strategyMove) then engine (verified: 居飛車穴熊 replies 3四歩, 4二玉). User komadai reference photos (2026-10-02): pieces upright, same-type copies edge to edge in a gentle fan converging toward the far side, groups 飛角金銀 / 桂香 / 歩 rows; pieces tapered (thick base, thin tip). Correction: pieces must OVERLAP like shingles (photo 3) with tips converging; earlier rotation sign was wrong (tips diverged) and spacing left gaps. Now: per-piece widths, 34% overlap, pivot 3.2, rot=+theta, earlier piece lifted 0.02, hand pieces cast no shadow, rows 1.75x piece height apart (user: add space, rows were colliding). Verified by side-by-side screenshots. User: 待った -> Play AI '待った Take back' removes your last move + AI reply (and that branch from the tree) (verified). User: arrow chips distracting + clicking near them committed moves -> arrow-label click-to-play REMOVED; dashed candidate arrows have no chips; only a small 'best' tag; AI tab legend updated (verified). User 2026-10-02 komadai/board: overlap 20% (characters readable), rows ≤6 with gentle per-row radius (span ≤0.5 rad) and sag in fit (everything fits, incl. 38-piece hand); koma shape per reference (shoulders at 88% height, 0.66 base width, shallow peak); shadow: lamp near-overhead + soft shadows; tilt: no zoom-out (fit ×1.06), angle 0.8, camera pans right 0.6×tilt so both stands visible (verified). User (real 駒台 photo): hand pieces same size as board pieces; STAND 4.2 (≈4 squares), centered at ±(5.25+STAND/2), k starts 1 (shrinks only on overflow), camera fit width 2*(5.35+STAND) (verified). User 2026-10-02 (verified): hand pieces full size + STAND 4.2; portrait strips clear of board (narrow phone d0.95/k0.84, tall desktop d1.3), small corner count badges; phone plates in flow; coords centred (4.75); variation banner short ('Variation' / Main line / Make it main); side panel resizable (drag left edge, 280-720px) + toggle ('Board only' rail button, P key; prefs persisted joseki-practice:panel:v1); board-only shows mini ◀ ▶ + restore in header; formation banner moved to top plate row (never over pieces). User: maximise board space everywhere (verified sweep 360→2560): eval bar is an absolute thin overlay (desktop left 10px, phone top 4px); ≤820px panel is a closed-by-default overlay drawer (48vh, × close) and never shrinks the board; panel × close in tab row; 3D uses strips above/below unless canvas aspect ≥1.4 (side stands only on wide screens). Desktop stands: STAND 3.4 hugging board (x=±(5.12+STAND/2)), side layout whenever board ≥540px tall, else strips (verified 1280 strips, 1440/1600/1920 stands). SHIPPED 2026-10-02: commit cdba2d9 pushed to github.com/hamproductions/shogilab (public, user-chosen org; remote git@gh-personal:...), Pages via Actions (.github/workflows/deploy.yml) live at https://hamproductions.github.io/shogilab/ — verified crossOriginIsolated via coi-sw.js, engine best move, lessons load. Bundle: compact joseki ?raw plugin, vendor chunks, woff2-only (JS 3.3→1.6 MB). Open from desktop sweep: 1920 tilt+panel clips sente stand; panel at 720px wastes space; narrow panel move list wraps; 変化 bar shows after take-back in plain game; 待った/Resign unreachable in board-only; ⌘K '7g7f' no match; lesson map wheel scroll. Next: usability sweep of every feature at every size (3 testers: phone / tablet / desktop) -> fix -> repeat. Next: round 29 dogfood on GamesBox + both-side branching, fix, repeat. Not committed; user has not asked for a commit.
Goal (x2): NO 'still open' items allowed — finish castle-breaking + sabaki drills (sourced kif), phone new-user pass, keep dogfooding+fixing until smooth; only then report.
Goal (earlier): dogfood as a shogi NOOB who wants to learn; same demands (AI on, simple picker, Study/Quiz, wrong-move playback + go back, clear modes, fanned stands); never stop until smooth.
Correction: target user KNOWS rules + notation, just weak. Add a knowledge-level setting: default 'I know the rules' (no basics); 'New to shogi' shows piece guide + move gloss. Dogfood focus = weak player learning to play better
- Done (verified 2026-10-01): castle-breaking (3 Wikipedia-diagram drills: 美濃△3六桂, 木村美濃△3六歩, 舟囲い端攻め; start SFENs parsed from wiki shogiboard tables) + sabaki (2 drills cut from sourced lessons: 久保流 moves 38-48, 鳥刺し 20-23) under picker 'Techniques'; quiz-solved by clicks incl. drops/promotion; per-lesson Source + Credits; phone pass (stands stay portrait, action card first, header compact)
- Done (verified): level switch in picker (default I know the rules; New to shogi = piece guide with move diagram + promotion/drop rules, English move gloss); Start here badge on basics; Line complete -> Next lesson (verified 2歩 -> 西川流)
Previous goal: test, gather feedback, iterate continuously; do not stop at a report.
Iteration log (2026-10-01, browser-verified):
- Full 4五歩早仕掛け quiz by clicks incl. drop: 23/23; Line complete now states where it ends (you better/worse, win %)
- Strategy plate: rook counted only in own camp (view ranks 4-9)
- Review: empty state shows schedule + next due + Learn new button; new cards show move+reason; card context (lesson, last move); wrong answers use shared playback (showMistake) + go back
- AI review/stamp/graph only in Play AI + Analyze; eval bar only Analyze/Play AI/Study
- Castle-breaking/sabaki sources: JSA column 404; shogijugem / shogi-joutatsu use image diagrams (mostly partial, no kings) -> not transcribed (no invented moves). Candidate: shogijam study articles with .kif files
Next: castle-breaking + sabaki drills from kif-backed sources; more dogfood

## Active: workshop is THE app (user approved layout 2026-10-01; other pages deleted)
- URL: http://localhost:5317/ (App.tsx renders only src/workshop/Workshop.tsx); old src/pages/*, Board/Coach/EvalBar/MistakePuzzle/Trainer removed (git rm, uncommitted)
- Modes (rail, 和 labels): 研究 Study (book waits: Their move card, Space/→), 復習 Review (SRS due/new/difficult + saved game mistakes), 詰将棋 Tsume (judge + auto defender), 対局 Spar (AI replies), 検討 Free; AI switch (A), default OFF
- Tabs: 形勢 AI (plain-language: who is better, win %, best move + why + likely answer, others as −x% win chance), 指導 Coach (verdict/book note; Lesson map button in lessons), この先 What next (lanes from the board position: book, AI, known mistakes; click = preview), 棋譜 Moves (rate every move, save mistakes as review cards), 定跡 Library (review/tsume entry, kifu import KIF/KI2/CSA/USI/SFEN, lessons with intro + progress)
- Board: three.js kaya board, two-kanji pieces, stands, castle box + label, move badge (本/??), arrows, tilt T, flip F; plates (strategy/castle) per side; preview mode (朱 frame, 検討 banner, play/pause, keep, exit); eval graph when AI on
- Later fixes (browser-verified): drop arrows start at the hand piece on the stand; hand pieces one per type, packed, ×N tag; selection = warm fill + shu frame (no lift/shadow smear); Library rebuilt (quick 復習/詰将棋/棋譜, search, folded setup groups, compact lesson rows with role + progress, About toggle); 4五歩早仕掛け subtitle fixed
- Verified in browser earlier: tsume solved by board clicks, review card answered + recorded, kifu import + rating (▲4五銀 ??), What-next lane preview, lesson map jump, phone 390 no overflow; console clean
- Lint: 7 react-compiler warnings in src/workshop (refs/impure/setState-in-effect); 2 in scripts/build-courses.mjs
- Open: setup-matt-pocock-skills (S1 local .scratch, S2 CLAUDE.md) unconfirmed; castle-breaking + sabaki drills content pending; book-move accuracy question
- Dev server running for user: http://localhost:5317 (background task; kill at end)
- Open question (user): book ▲7六歩 rated 96.1% accuracy — should book moves count 100%?

## 手筋 drills (in progress, paused for phone fixes)
Source shogi-rule.com/koma_hu/ etc; diagrams in scratchpad/tesuji. Plan: tesuji drill = position from diagram, find the sourced tesuji move; engine-free grading (partial boards have no kings). Read so far:
- 垂れ歩 (partial): gote 2一桂 1一香 3二金 2二角 3三歩 1三歩; sente 3七歩 1七歩 2八飛 2九桂 1九香, hand 歩; answer P*2d.
- 単打の歩: gote 9一香 8一桂 5一金 4一銀 1一香 8二玉 7二銀, pawns 9/8/7/6/4/3/1三; sente 2一龍, 7六歩, pawns 9/8/6/4/3/1七, 7八玉 5八金 4八銀, 9九香 8九桂 7九銀 6九金 2九桂 1九香, hand 歩; answer P*5b; source line △同金 ▲4一龍.
- たたきの歩: gote 9一香 8一桂 6一金 5一飛 2一桂 1一香 8二玉 7二銀 3二金 pawns 9/8/7/6/4/3/2/1三 5四銀; sente 7六歩 pawns 9/8/6/4/3/1七 7八玉 5八金 4八銀 2八飛 9九香 8九桂 7九銀 6九金 2九桂 1九香, hand 歩(+角 per text); answer P*5b; 金で取ると(5二金→6二? arrow 5二→6二→6一 shows gold escape) .
- 焦点の歩: gote 9一香 8一桂 7一銀 6一金 5一玉 4一金 2一桂 1一香 3二飛 2二角 pawns 9..4三,1三; sente 3五銀 2五飛, pawns 9..4七 1七, 8八角, 9九香 8九桂 7九銀 6九金 5九玉 4九金 3九銀 2九桂 1九香, hand 歩; answer P*3c.
