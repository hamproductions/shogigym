# Lesson curriculum rebuild — full handoff and methodology, 2026-10-28

Everything required to resume this task without rediscovery. This is not a summary.

# PART I — TASK CONTRACT AND LIVE STATE

## 1. Exact task contract

- Latest raw user request: finish the current set of agent work, hand off, push.
- Original goal (session start, /goal): the lessons were unusable after audit rounds (no introduction for 右四間飛車, incoherent UX, nonsensical fragment lessons, joseki drills disconnected). Start over and build a lesson plan from beginner to professional. antislop and antislop-copywriting apply.
- Corrections during the session, in order:
  1. Read the owner's supplied references; the lessons must teach what they teach (shogi-joutatsu.com articles, cached in `.cache/curriculum-source/`).
  2. Use Sonnet for subagents.
  3. Also use https://github.com/yuki-keio/shogi (技図鑑).
  4. A tutorial for every single strategy.
  5. Finish the current set, hand off, push.
- Required completion still open: rebuild the remaining non-strategy units (tactics, castle attacks, endgame, basics, rules) with the same method; a full click-through of every stage; an independent critic pass.
- Explicit non-actions: no PR (not asked); no merge; no release; do not commit the untracked `docs/HANDOFF_2026-10-22_*.md` or `output/art/`.
- Current-turn authority: push the branch (done).
- Source-of-truth precedence: (1) article diagram images, (2) article text, (3) yuki-keio entries (reference only, GPL-3.0-only), (4) unit JSON in `data/lessons/units/`, (5) generated `src/data/lessons/` (never edit by hand).

## 2. Ground truth: repository and working tree

| Field                    | Current value                                                                                                                                 | Evidence                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Working directory        | `/Users/vittayapalotai.tanyawat/code/joseki-practice`                                                                                         | `pwd`                                                                |
| Repository and branch    | `hamproductions/shogigym`, `feat/lesson-curriculum` (created from `origin/main` 3684221)                                                      | `git status -sb`                                                     |
| HEAD                     | `8b5e019` equals `origin/feat/lesson-curriculum`                                                                                              | `git rev-parse HEAD origin/feat/lesson-curriculum` after `git fetch` |
| Base/PR state            | 0 behind `origin/main`, 1 ahead; no PR                                                                                                        | `git rev-list --left-right --count origin/main...HEAD` → `0 1`       |
| Pre-existing dirty state | untracked `docs/HANDOFF_2026-10-22_LESSON_AUDIT_REMAINDER.md`, `docs/HANDOFF_2026-10-22_LINGERING_WORK.md`, `output/art/` (previous sessions) | `git status --short` at session start                                |
| Task changes             | all committed in 8b5e019 (241 files)                                                                                                          | `git show --stat 8b5e019`                                            |
| Untracked artifacts      | the three pre-existing paths above and this file                                                                                              | `git status --short`                                                 |
| Ownership uncertainty    | none                                                                                                                                          |                                                                      |

## 3. Environment and operational rules

- The disk is nearly full: about 1.3 GiB free on `/System/Volumes/Data`, with swap holding about 7.5 GB. At 11 concurrent agents, writes failed with ENOSPC and three agents stopped. Keep at most about 7 agents running. Run `df -h /System/Volumes/Data` and `sysctl vm.swapusage` before launching any.
- `.cache/taikyoku-emsdk` was deleted with the owner's approval to free 1.3 GB.
- Prefix thread-heavy commands with `RAYON_NUM_THREADS=1`. The shell is zsh, so unquoted `$var` does not word-split; use `bash -c` for loops.
- Browser: `.cache/curriculum/ab.sh` wraps agent-browser with `AGENT_BROWSER_ARGS="--use-mock-keychain,--password-store=basic"` and session `curriculum`. Closed at the end. A foreign `jobcan-dev` session exists; it is not ours, so do not touch it.
- Dev server: `DO_NOT_TRACK=1 bun run dev --port 5173 --host 127.0.0.1`. Stopped at the end to free memory.
- Push: SSH is denied; push over HTTPS with gh credentials (command in §12). Fetching needs the sandbox disabled.
- agent-browser `click @ref` on the strategy-page cards did not navigate during testing. Clicking the same button with JS `element.click()` worked. Use a coordinate or JS click when verifying.

# PART II — COMPLETE EXECUTION RECORD

## 4. Chronological command and action ledger

| Order | Phase      | Action                                                                                                                                                                       | Result                                                                                                                                                  |
| ----- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | diagnose   | Dumped all 150 units with python (`order                                                                                                                                     | path                                                                                                                                                    | id  | title | chapter kinds | startpos count`) | nearly all chapters were `position` fragments; only 13 started from startpos; no 右四間 attacker unit |
| 2     | diagnose   | agent-browser at `/openings`: searched 右四間, opened `shiken-vs-migishiken`                                                                                                 | confirmed the fragment boards; screenshots in `~/.agent-browser/tmp/screenshots/`                                                                       |
| 3     | branch     | `git switch -c feat/lesson-curriculum origin/main`                                                                                                                           | created                                                                                                                                                 |
| 4     | references | `head -1 .cache/curriculum-source/*.txt`; read 4961 in full; fetched 4961 diagrams with curl (sandbox disabled) into `.cache/curriculum/ref/4961/`                           | diagrams viewed                                                                                                                                         |
| 5     | pilot      | `bun scripts/lessons/play.ts --target=...` for 4961 diagrams 2-1, 2-5, 2-9, 3-1, 3-6, a-1                                                                                    | all MATCH; 3-6 shows ▲7七角 (the text said 3三角)                                                                                                       |
| 6     | pilot      | Wrote `kishu-migishiken-hidarimino.json` (3 chapters; chapter 1 one move per step plus strengths and weaknesses)                                                             | check-unit ok                                                                                                                                           |
| 7     | UI         | Wrote `src/data/curriculum.ts` and rewrote `OpeningPicker.tsx`; deleted `library.ts`; LessonPane finished-chapter tracking and path order                                    | tsc ok; browser verified                                                                                                                                |
| 8     | fan-out    | Brief `conductor/lesson-rebuild/reference-rebuild-brief.md`; 8 writers g1–g8 (first on Opus, stopped and relaunched on Sonnet at the owner's request)                        | units rebuilt                                                                                                                                           |
| 9     | tutorials  | Added `TUTORIALS` (70); agents t1–t3 wrote 12 `tutorial-*` units                                                                                                             | check-unit ok                                                                                                                                           |
| 10    | disk       | ENOSPC stopped g1, g7 and g8; closed my browser and dev server, deleted emsdk (approved), resumed the agents                                                                 | recovered                                                                                                                                               |
| 11    | verify     | Several writers had compared diagrams by eye. Verifier and tutorial-pass agents ran on every group, with scripts `.cache/curriculum/ref/{g1,g2,g3,g4,g5,g6,g7,hc}-verify.sh` | each re-run by me: g1 180 MATCH with 1 known DIFF, g2 0 DIFF, g3 115 MATCH with 1 known DIFF, g4 0 DIFF, g5 177/177, g6 155/155, g7 ALL MATCH, hc 62/62 |
| 12    | castles    | Castles agent rebuilt 9 castle units (63 castles) move by move                                                                                                               | check-unit ok                                                                                                                                           |
| 13    | gate       | `npx prettier --write data/lessons/units/*.json`; `bun run lessons`; `bun scripts/lessons/check-unit.ts` (all); `bun run check`                                              | 162 lessons, 12282 legal moves, 0 errors; 0 FAIL; check exit 0                                                                                          |
| 14    | browser    | Opened the 鷺宮 tutorial from the 対振り飛車 page and stepped through it; phone-width 390×844 check                                                                          | per-move playback works; no horizontal overflow                                                                                                         |
| 15    | ship       | Commit 8b5e019; HTTPS push; fetch and parity check                                                                                                                           | equal heads                                                                                                                                             |

## 5. Methodology and decision record

- **Root cause.** The earlier copyright rebuild replaced each article's teaching (a basic diagram reached from move one, attack lines, branches) with abstract fragment boards. Fix: positions reached from the initial position and opening move sequences are facts, so each article diagram is reconstructed as a move sequence and verified exactly. All text is newly written; check-unit's originality check enforces this.
- **Method per unit.** Read the article, fetch its diagrams from the page HTML, transcribe each to SFEN, reconstruct the moves, run `play.ts --target` until it prints MATCH, then write the unit. When the article's text and its diagram disagree, the diagram wins; agents logged each case in `.cache/curriculum/progress-*.md`.
- **Tutorial standard.** For each unit in `TUTORIALS`, chapter 1 is `kind: "opening"` from startpos (or the handicap start). An intro step comes first, then steps of at most two moves (opponent reply plus learner move), each learner move explained, then a points step and a strengths/weaknesses step. Verified for 70/70 with the bun snippet in §12.
- **Navigation.** Stages are ordered for beginner to pro. Strategy pages replace the old "your main strategy" filter that hid every other strategy. Joseki drills appear on their strategy page, and drills for the opposing side under a separate heading.
- **Rejected:** keeping fragment units; asking the owner A/B design questions (the memory rule says decide); running more than 8 agents (disk/swap).

## 6. Files and artifacts

| Path                                                  | Role                                                                | Change    | Verification                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------- | --------- | ------------------------------------------------- |
| `src/data/curriculum.ts`                              | stages, strategy pages, `TUTORIALS`, finished-chapter storage       | new       | tsc; every unit placed exactly (bun check in §12) |
| `src/app/modes/lesson/OpeningPicker.tsx`              | Learn UI                                                            | rewritten | browser desktop and phone                         |
| `src/app/modes/lesson/LessonPane.tsx`                 | marks chapters finished; next article follows `PATH_UNITS`          | edited    | tsc                                               |
| `src/app/modes/lesson/library.ts`                     | old category grouping                                               | deleted   | no importers                                      |
| `scripts/lessons/play.ts`                             | replay a USI line, compare to a target SFEN                         | new       | used by every verify script                       |
| `data/lessons/units/*.json`                           | 162 units: ~95 rebuilt, 12 `tutorial-*` new, 9 castles rebuilt      | rewritten | check-unit 0 FAIL                                 |
| `src/data/lessons/*.json`                             | generated output                                                    | rebuilt   | validate-curriculum 0 errors                      |
| `conductor/lesson-rebuild/reference-rebuild-brief.md` | writer brief (method, yuki table, tutorial and tutorial-pass specs) | new       | —                                                 |
| `.cache/curriculum/ref/` (gitignored)                 | diagrams, generators, verify scripts                                | scratch   | re-run results in §4                              |
| `.cache/curriculum/progress-*.md`                     | per-group notes, including every text/diagram disagreement          | scratch   | —                                                 |
| `.cache/yuki-shogi`                                   | yuki-keio clone, commit f0740fb                                     | reference | —                                                 |

# PART III — EVIDENCE, FAILURES, AND HONESTY

## 7. Verification matrix

| Claim                                  | Evidence layer               | Artifact                                                 | Result                                                                    | Unverified                                                              |
| -------------------------------------- | ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Strategy units match article diagrams  | replay plus exact SFEN match | `ref/*-verify.sh`                                        | pass, apart from known impossible-diagram DIFFs (棒銀 2-5, 横歩 23fu a-1) | one-sided and crop diagrams are compared only on the shown area         |
| 70/70 tutorials per-move from move one | data check                   | bun snippet in §12                                       | pass                                                                      | text quality not reviewed by a native Japanese reader                   |
| Lessons legal and well-formed          | build                        | `bun run lessons`                                        | 0 errors                                                                  | —                                                                       |
| Repo checks                            | lint, format, types          | `bun run check`                                          | exit 0                                                                    | —                                                                       |
| UI works                               | real browser                 | 鷺宮 tutorial, 右四間 page, phone width                  | pass                                                                      | not every stage or strategy page clicked; no critic pass                |
| Castle units                           | builder plus check-unit      | `ref/castles-verify.sh` (regenerates the files when run) | check-unit pass                                                           | opponent replies are legal quiet moves, not book lines; no engine check |

## 8. Failures, traps, and rejected approaches

| Item                   | Symptom                                           | Root cause                                 | Do not repeat / recovery                                        |
| ---------------------- | ------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| Grouped-move tutorials | first rebuild packed up to 33 moves into one step | the brief allowed whole builds in one step | the tutorial-pass section of the brief requires at most 2       |
| Eye-checked diagrams   | writers g2–g7 reported "verified" without MATCH   | brief compliance drift                     | always demand the re-runnable verify script; re-run it yourself |
| ENOSPC                 | Bash unusable; agents stopped                     | swap plus 11 agents on a nearly full disk  | at most about 7 agents; check df and swap                       |
| Opus subagents         | owner objected                                    | default inherit                            | pass `model: sonnet`                                            |
| castles-verify.sh      | re-running it rewrites the unit files             | it calls the builders                      | do not run it after hand edits                                  |
| Stale generators       | `ref/*/gen.py` predate the tutorial passes        | the JSON was edited after generation       | never regenerate from gen.py; the JSON is the source            |

## 9. Known limitations and blockers

- These units are still the old fragment style: `tesuji-*` (7), `proverb-*` (2), `attack-*` (9), `endgame-*` (9), `basics-*` (9), `judgment-four-factors`, and the `rules-*` (9; rule illustrations can stay partial). No blocker; they need the same rebuild.
- Free disk is low, which limits parallelism.

# PART IV — RESUME WITHOUT REDISCOVERY

## 10. Immediate next action

From the repo root, run `git fetch origin && git status -sb`. Expect `feat/lesson-curriculum` at 8b5e019, level with its remote. Then start item 1 of §11.

## 11. Remaining ordered work

1. Rebuild the tactics units (`tesuji-*`, `proverb-*`) against articles 1629, 1486, 1331, 1313, 1516, 1586, 1541, 8322 and 1783 and the yuki tesuji entries. Teach each named tesuji (垂れ歩, 叩きの歩, 継ぎ歩, 底歩, 割り打ちの銀, ふんどしの桂, 王手飛車, 十字飛車, 田楽刺し, 頭金, 腹金…). Use original composed positions on sensible boards (composed diagrams are creative works; see docs/lessons.md). Stop when check-unit is clean and every tesuji the article lists is covered.
2. Rebuild the castle-attack units (`attack-*`) against articles 2646, 2615, 1070, 2276, 2313, 3014, 3048 and 875, starting from realistic castled positions.
3. Rebuild the endgame and basics units (articles 2375, 7368, 1854, 19, 4633, 386, 109, 5325, 2418, 1512, 1021, 3271, 1821, 2911, 3156, 3198, 3239, 2590, 1067).
4. Full browser click-through: every stage, every strategy page, one tutorial per page, desktop 1280×800 and phone 390×844. Then an independent critic pass (memory rule: UI changes need a critic and a usability test).
5. Open a PR only when the owner asks; attach screenshots.

## 12. Command cookbook

```bash
cd /Users/vittayapalotai.tanyawat/code/joseki-practice
df -h /System/Volumes/Data; sysctl vm.swapusage
RAYON_NUM_THREADS=1 bun run lessons                      # never while agents edit units
RAYON_NUM_THREADS=1 bun scripts/lessons/check-unit.ts <id> [--engine]
bun scripts/lessons/play.ts --target="<board> <b|w> <hands|->" <usi...>
bun scripts/lessons/book-walk.ts <usi...>
bash .cache/curriculum/ref/g5-verify.sh | grep -c DIFF   # likewise g1 g2 g3 g4 g6 g7 hc
bun -e "import {TUTORIALS} from './src/data/curriculum'; import {readFileSync} from 'fs'; let ok=0; for (const t of TUTORIALS){const c=JSON.parse(readFileSync('data/lessons/units/'+t.unit+'.json','utf8')).chapters[0]; if(c.kind==='opening'&&Math.max(...c.steps.map(s=>(s.moves||[]).length))<=2) ok++}; console.log(ok+'/'+TUTORIALS.length)"
RAYON_NUM_THREADS=1 bun run check
DO_NOT_TRACK=1 bun run dev --port 5173 --host 127.0.0.1
# push (needs owner authority in the current turn):
git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/hamproductions/shogigym.git feat/lesson-curriculum
```

## 13. Handoff receipt

- Handoff authoring time: 2026-10-28, after the push.
- Live state checked at: after the push, with `git fetch`; `git rev-parse HEAD origin/feat/lesson-curriculum` gave both 8b5e019. Browser closed, dev server stopped.
- Sources read: CURRENT_TASK.md, `docs/HANDOFF_2026-10-22_LESSON_AUDIT_REMAINDER.md`, `docs/lessons.md`, `conductor/lesson-rebuild/course-brief.md` and `inventory.md` (unit-to-article table), article 4961 and its diagrams, `.cache/yuki-shogi/pages/waza-content.mjs` (bogin, migi_shiken_bisha, naka_bisha, shiken_bisha), every agent report.
- Logs and history read: current session only.
- Durable notes written: `conductor/CURRENT_TASK.md`, `conductor/lesson-rebuild/reference-rebuild-brief.md`, this file.
- Verification artifact inspected after writing: `git rev-parse` parity output and the 70/70 tutorial count.
- Explicitly unverified: §9 units; full click-through; critic pass; native-speaker review of the text.
