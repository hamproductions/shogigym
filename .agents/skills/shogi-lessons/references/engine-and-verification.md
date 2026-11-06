# Engine and verification

## Match the evidence to the claim

| Claim                                    | Required check                                                                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A move or line is legal                  | Replay from exact SFEN with the existing rules library, including every affected variation and child position                                                                                       |
| A piece controls or can capture a square | Inspect occupancy, blockers, ownership, promotion, pins, and the legal capture; geometric reach alone may not permit a move                                                                         |
| Material is gained/lost                  | Count board and hand material before/after the actual capture sequence, including promotion/capture ownership                                                                                       |
| A response is forced                     | Examine all legal alternatives, including king moves, captures, interpositions, drops, and counterchecks as applicable                                                                              |
| Checkmate                                | Confirm check and no legal replies at the claimed endpoint; replay a multi-move proof through every defensive reply, with the applicable mating rules                                               |
| Tsume-ro / hisshi                        | State the concrete mating threat, whether the defender is currently checked, and analyze defensive replies under the project's definition; a single cooperative line cannot establish inevitability |
| An opening recommendation                | Compare standard book evidence and bounded engine analysis of the exact alternatives, then qualify the teaching statement to the evidence                                                           |
| An annotation is shown correctly         | Inspect the real lesson/quiz at the affected move when browser verification is authorized                                                                                                           |

Separate an immediate check, a future mating threat, defense of one's own king, and a fork with a mating threat. Judge the mechanism from the actual board and replies, not its label.

## Existing joseki-practice commands

Run from the selected repository root. Inspect current script interfaces before reuse. Run commands sequentially with `DO_NOT_TRACK=1`, `RAYON_NUM_THREADS=1` and `UV_THREADPOOL_SIZE=1`; the engine wrapper currently fixes Threads=1 and USI_Hash=32 MiB. Use one CLI engine process and one owner across agents. Check disk space before generation/builds or broad validation. Use explicit IDs to bound audits.

```sh
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun scripts/lessons/check-unit.ts UNIT_ID
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun scripts/lessons/check-unit.ts UNIT_ID --engine --branches
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun scripts/lessons/check-course.ts COURSE_SOURCE_STEM --engine --branches
```

Substitute actual IDs. `check-course` takes the filename stem in `scripts/courses`, which can differ from the generated course ID. Calling it without a stem currently checks no courses. Calling `check-unit` without IDs currently checks every unit.

`check-unit` builds/replays the unit in memory and checks bilingual content, chapter structure, source fields, some historical source-position matches, and corpus overlap. Book/engine checks apply only to chapters starting at a standard/recognized handicap position; `--engine` does not evaluate independently composed position chapters. Without `--branches`, its engine scan follows only the main line. With `--branches`, it evaluates every compiled edge and reports mover role and verdict kind.

`check-course` parses the segment tree for legality and collects an explicit main line for book/engine diagnostics. `--engine --branches` evaluates every source edge and resolves its verdict kind by the full played path using the builder's merge precedence. A warning about a merged deviation requires inspecting the generated edge: split the common prefix before the actual mistaken move. Neither mode establishes annotation semantics or proves every alternative. Independently evaluate a claimed endpoint/variation from its exact SFEN rather than assuming the reported final evaluation covers that node.

Both checkers currently use 400 ms per evaluated position and share an in-process SFEN score cache. Losses above 300 cp, legal captures of major pieces without an immediate board recapture, and book misses are printed as `NOTE`, not failing errors. Review every relevant note against its exact source hash, position, actual mover and merged verdict. Major-piece diagnostics do not detect silver, gold, knight or lance losses. Enumerate the relevant legal captures, complete recapture chains and forcing checks; inspect existing material advantages before claiming an uncompensated loss. A score loss alone is not a semantic finding. Explicit suboptimal setup comparisons need accurate alternatives and consequences; an avoidable material loss cannot silently remain a recommended learner move. A book miss means the book contains the position but not that move; absence of a position is different. Neither is automatically a refutation.

Legal pawn captures of non-pawn pieces also produce notes even when the pawn can be recaptured. Protection alone does not justify advancing a bishop or silver into a pawn's attack: count the complete exchange. This diagnostic does not prove a forced loss or account for compensation elsewhere.

## Direct position analysis

`scripts/lessons/engine-eval.mjs` reads one SFEN per stdin line. Its first argument is movetime in milliseconds; default 400. It uses `@mizarjp/yaneuraou.k-p` with its own book disabled and emits one row per input:

```text
score bestmove mate-distance-or-dash
```

Scores are from the side to move. A mate score is mapped to ±30000, with mate distance in the third field. The optional `--pv` flag appends the last reported principal variation; the checker validates the prefix against the exact input position and reports up to six legal reply moves. Missing score or bestmove responses fail the wrapper instead of producing an initialized zero score. Retain the actual output. Depth, score bounds and a full search log are not retained.

Use a bounded foreground call; for example, this standard starting position is an interface smoke check, not a lesson-quality test:

```sh
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 node scripts/lessons/engine-eval.mjs 400 --pv <<'SFEN'
lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1
SFEN
```

For an actual claim, feed the exact relevant before/after positions and legal alternatives. Compare perspectives correctly: after the side-to-move flips, negate its score before comparing. The main-line diagnostics use `score(before) + score(after)` for that reason. Do not treat this formula across arbitrary same-turn positions as a mover loss.

Record engine/package identity, SFENs and move prefixes, Threads/Hash, search budget, output, and score perspective. If a short search leaves a material claim or recommendation uncertain, run a targeted larger bounded search or inspect raw USI output/PV with the existing engine integration. Replay a captured PV legally. Longer search or engine agreement still does not certify strategic optimality or a complete mate/hisshi proof.

Investigate the exact move responsible for a loss. A later mistaken recapture does not by itself prove that the initial move loses that material; compare the legal continuation that avoids it before retaining a mistake label.

## Build and aggregate checks

After the requested edits, regenerate through the normal project path:

```sh
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun run lessons
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 node scripts/build-courses.mjs
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 node scripts/validate.mjs
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun scripts/lessons/check-originality.ts
git diff --check
```

Run the course builder/validator for course changes; run unit checks for affected units, adding `--engine --branches` for opening chapters. For a collection overhaul, cover every in-scope opening unit/course rather than accepting a sampled main-line run. Run the project's required lint/type/format checks appropriate to the final scope. The course builder's `--vendor` option replaces imported content; ordinary lesson authoring uses it without that option. Do not regenerate/import a vendor corpus as an audit side effect.

`bun run lessons` replaces generated lesson output and validates chapter/variation replay. Course generation is separate. Keep source and generated differences together in review; generated files are not the authoring surface.

## Originality limitations

Read `scripts/lessons/originality.ts` and inspect available corpus paths before interpreting the check. It indexes cached `.txt` material in `.cache/curriculum-source` and `.cache/reference`. Missing, empty, incomplete, or outdated caches weaken the comparison. It does not fetch or verify coverage automatically.

The current scan normalizes Japanese, removes move notation, checks 10-character n-grams/long runs, and skips English and several metadata fields. Zero flags does not establish independent wording in English, structural originality, visual originality, semantic independence, or legal clearance. Compare those dimensions directly under the project policy.

The historical position comparison reads `.cache/old/lessons/figures` and `.cache/old/joseki`; missing directories currently yield an empty comparison map without failing the checker. Record whether that evidence exists. A successful unit check with absent historical positions does not establish position uniqueness.

Use relevant existing cached sources first. `fetch-references.py` restores historical comparison material and downloads the entire declared URL list, skipping existing files; it is not a refresh or a scoped single-source audit. Run it only when that broader corpus acquisition is actually in scope, after reading the script. Never invent unavailable source contents or silently weaken the policy to make a checker pass.

## Browser evidence

When authorized, use one isolated named browser session and the existing lesson viewer. Verify affected study steps, variations, quiz answer concealment, annotation timing, and relevant layout. Inspect screenshots/current rendering yourself; a validator cannot prove those states.

Study navigation keeps the course's root-based move history. Returning along an existing path moves the cursor without discarding its continuation. Show the shared branch position and explain the return instead of presenting an unexplained restart; provide direct access to explained positions. Independent chapter starts and explicit quiz restarts remain distinct boundaries. Checkpoint controls must not reveal quiz answers.

For agent-browser on this Mac, prefix every invocation with `DO_NOT_TRACK=1 AGENT_BROWSER_HEADED=1 AGENT_BROWSER_ARGS="--use-mock-keychain,--password-store=basic,--mute-audio"`. Keep the same named session for every command; omitting the headed flag can replace the headed browser. List sessions before/after; close only the session owned by this task. Preserve unrelated sessions and the user's development server. During testing, inspect non-http(s) link targets without clicking or navigating them. Honor the active-user-testing restriction in project instructions.
