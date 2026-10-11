# Current task

## Objective and scope
Fully inventory the named copyright-rework curriculum, then replace online-derived lesson content with complete original authorship, one unit or course at a time. Source pages are factual references only; explanations, chapter structure and composed teaching positions must be original. Standard opening facts and game records remain permissible. Isolated edits or checker-only work do not satisfy this task.

- Target worktree: `/Users/vittayapalotai.tanyawat/code/joseki-practice-lesson-copyright`, on `main`; release v1.4.4 incorporates the copyright branch and completed local authorship.
- Original checkout: `/Users/vittayapalotai.tanyawat/code/joseki-practice`, branch `feat/dojo-learning-hub`. Its prior named-branch instruction change is included in the released harness. This file is the only canonical live task record.
- Authority: named-branch handoff, `conductor/lesson-rebuild/plan.json`, writer/course briefs, branch `AGENTS.md`, `docs/lessons.md`, and the full original-authorship requirement.
- Local content edits, sequential writer delegation, builds and existing checks were authorized. Current request authorizes committing, pushing and publishing a patch release; v1.4.4 is published.

## Completion state
All authoring and required aggregate checks are complete. Final inventory reconciliation is complete. Goal status is complete; no implementation action remains.

- All 146 planned lesson units are fully authored, reviewed and built.
- All 29 pending table-D replacement courses are fully authored, reviewed and built; the original baseline table-D course is retained with its documented factual provenance.
- Both additional section-E matchup courses are fully authored, reviewed, registered and built: Reclining Silver/Bishop Exchange and Yagura/Gangi.
- All seven retained source-derived courses have complete original replacements: Fujii System, Left Mino, Boat Castle, Kimura Mino, Mino knight, two-pawn Aifuri and Nishikawa Aifuri.
- All 41 current course scripts have generated outputs. Three baseline opening/game-record courses retain documented factual provenance; all 38 declared goal SFENs match their generated main ends.
- Catalog side/source/title registrations are complete. No matchup row is empty. Aifuri and castle-breaking plan descriptions match the new lessons. README no longer claims adapted Wikipedia diagrams or article-derived Aifuri teaching lines.
- Target `AGENTS.md` and `docs/lessons.md` enforce original-only authorship and inventory-before-rewrite. The latest named-branch handoff/diff precedence rule is persisted in target `AGENTS.md`.

## Source and read coverage
- Named branch fetched and confirmed at the recorded commit. Handoff fully reread, lines 1–732; plan fully read, lines 1–1766. Writer brief, course brief, target `AGENTS.md`, `docs/lessons.md`, build scripts and affected catalog modules were read through EOF.
- Inventory fully read and independently reconciled against the plan, source trees, figure metadata, references and generated artifacts. Current final inventory: `conductor/lesson-rebuild/inventory.md` in the target worktree.
- Inventory covers 146 units, 159 planned study IDs, 2,242 extracted figures, all replacement slots, both extra courses, retained course provenance, and source/output paths.
- All 159 planned cached study texts exist. The original extraction includes 155 planned figure JSONs plus excluded study-method asset 6808. Missing historical figure JSONs 386/1127/1512/8083 are explicitly recorded; original authoring does not depend on copying those diagrams.
- Every authored unit source and final output was read through EOF before acceptance. Parent independently replayed every chapter/branch and reviewed board, material, check and explanatory claims; individual engine checks passed before acceptance.
- Every replacement course was fully read and independently replayed, including its branches and exact goal. Sequential engine checks passed before acceptance. Subagent conclusions were checked against actual files and replay output.
- Final retained-course baseline/current comparisons confirm removal of old article teaching boards, sequences and structure. The two Aifuri replacements start from the initial position with original 25/27-ply development. Nishikawa includes the conditional quiet-opponent rook-choice branch.
- Removed `shogirule-*` course content and `.cache/old`/`.cache/reference` were not opened. No remote sites were fetched. The worktree's `.cache/curriculum-source` symlinks to the original checkout corpus; scanner independently loaded 200 nonempty documents.

## Correction and process receipt
- Initial failure narrowed full curriculum authorship to a small defect pass and displaced inventory. The source handoff/plan proved the full 146-unit/29-course requirement. Inventory-before-authorship and original-only retained-course replacement rules were persisted in the project harness.
- Status-only turn endings interrupted execution before whole-task closure. Corrected by completing remaining authoring, aggregate gates and final reconciliation in the active continuation.
- Board/prose corrections were made before acceptance, including castle geometry, pawn-ledger timing, move chronology, silver blockers, legal check/evasion, promotion and material exchange claims.
- Castle exercises use independently composed 40-piece positions. No forced-mate claim is inferred from a material exchange. Viable Aifuri choices are labeled variations rather than mistakes.
- The course checker's nested-main final-position limitation was covered by separate parent engine evaluation of every actual main state for affected final courses. Kimura losses -112/-12/-10; Mino -116/0/20/13; two-pawn Aifuri max 274; Nishikawa max 249. None exceed 300.
- Invoked skills read 1–EOF and executed: `unfuck-yourself` 60 lines, `get-your-shit-together` 27 lines, `what-did-i-say` 98 lines, `systematic-debugging` 283 lines, required `root-cause-tracing.md` 169 lines, and `verification-before-completion` 120 lines (no required linked references). No prior-session or unrelated-project history was read.

## Verified final evidence
- `bun run lessons`: 146 lessons, 513 chapters, 1,872 figures, 2,230 legal moves, zero errors.
- `node scripts/build-courses.mjs`: all 41 current specs rebuilt.
- `node scripts/validate.mjs`: 3,245 course moves checked, zero errors; strategy validation passed.
- `bun scripts/strategy-check.ts`: 85 matchups, 83 side mappings, zero errors.
- `bun scripts/mine-tesuji.ts`: 934 drills regenerated.
- `bun scripts/lessons/check-originality.ts`: 15,880 strings, zero flags against the nonempty reference corpus. This checks textual overlap, not absolute originality across all external sources.
- Independent lesson-position comparison: 2,385 authored positions against 1,946 planned source positions; 31 exact matches, all factual standard initial/full-material opening positions; no composed-position match.
- Independent castle-position comparison: 34 authored states against 1,959 unique cached source positions; zero matches, no oversized source file skipped.
- Independent final source/output crosswalk: all 146 units match generated metadata, references and chapter counts; every planned study ID has a consultation reference; all 41 specs match generated metadata/root; all 38 declared goals match generated main ends; unique source/output IDs, zero mismatches. Final inventory-row audit found all 41 unique scripts across 42 rows, matching output IDs and no pending course status.
- Independent registration audit: all 30 table-D IDs and both extra IDs have matchup membership, source URLs and correctly oriented Sente/Gote mappings; no duplicate matchup or repeated course ID within a matchup. Generic raw ibisha metadata maps to specific catalog castle strategies where appropriate.
- Scoped Prettier formatting completed. `RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun run check` exited 0: lint, formatting, React Router type generation and TypeScript passed. Existing lint warnings remain outside the content changes. Latest instruction-only `AGENTS.md` addition independently passed Prettier; final full app check and originality scan were rerun after it and exited 0.
- `git diff --check` passed. Credential-pattern scan of 375 changed text files found zero hits; no oversized changed file skipped.
- Machine space checked before builds: 4.1 GiB available. All owned engine/check processes exited; no temporary server or browser session was launched.

## Release delivery
- Current authorization: commit, push and publish patch v1.4.4 with the completed curriculum, UI corrections, PR 12 rendering patch and reference licensing documentation.
- Target worktree contains the release scope; original checkout's instruction change is preserved and already included in the target harness.
- Remote fetched this turn. Target is three commits ahead of origin/main with no remote-only commits.
- Prior browser verification and bounded originality audit remain the evidence above; no whole-curriculum legal certification is claimed.
- Latest changes: normalize lesson picker groups; separate reference links and lines; restore strategy-heading gap; integrate PR 12 arrow layering; allow shared node_modules in local Vite serving; document yuki-keio/shogi reuse without importing material.
- Owned browser and preview server were closed; original development server remains untouched.
- Release v1.4.4 published: main and tag pushed, GitHub release created. Normal release validation, lint, full formatting and production build passed. Deployment run 38165973026 is being verified separately; no deployed-browser claim.
- Immediate next action: synchronize the original checkout and verify Pages completion.
