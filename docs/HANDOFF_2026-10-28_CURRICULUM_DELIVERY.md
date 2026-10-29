# Curriculum delivery — handoff and methodology, 2026-10-28

# PART I — TASK CONTRACT AND LIVE STATE

## 1. Exact task contract

The latest request is an operational handoff; implementation and external writes stop. Earlier work requested a beginner-to-pro curriculum, tutorials for every strategy, usable complete positions, and improved learning navigation. The user subsequently requested delivery to main. The push was performed; it does not establish that all curriculum requirements are complete. No new push, deployment, merge, PR, or browser session is authorized by this handoff request.

Project instructions and `docs/lessons.md` govern original authorship: external reference positions and prose must not be copied or closely paraphrased. User-owned files and untracked artifacts must be preserved. The user also requested no independent browser sessions while actively testing unless explicitly requested.

## 2. Ground truth: repository and working tree

| Field             | Current value                                                                                                                                                                                                                                                                     | Evidence                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Working directory | `/Users/vittayapalotai.tanyawat/code/joseki-practice`                                                                                                                                                                                                                             | task environment                                      |
| Branch and HEAD   | `feat/lesson-curriculum`, `f6ec3a2b60c52abd2a8d96832c4ad700b1a8cd69`                                                                                                                                                                                                              | `git status --short --branch`, `git rev-parse HEAD`   |
| Remote main       | same SHA                                                                                                                                                                                                                                                                          | `git ls-remote origin refs/heads/main`                |
| Earlier UI PR     | #27 merged; https://github.com/hamproductions/shogigym/pull/27                                                                                                                                                                                                                    | `gh pr view 27 --json state,mergedAt,url,headRefName` |
| Modified          | `conductor/CURRENT_TASK.md`; `conductor/lesson-rebuild/reference-rebuild-brief.md`                                                                                                                                                                                                | `git status --short --branch`                         |
| Untracked         | `conductor/lesson-rebuild/curriculum-plan.md`, `conductor/lesson-rebuild/remaining-inventory.json`, `docs/HANDOFF_2026-10-22_LESSON_AUDIT_REMAINDER.md`, `docs/HANDOFF_2026-10-22_LINGERING_WORK.md`, `docs/HANDOFF_2026-10-28_LESSON_CURRICULUM.md`, `output/art/`; this handoff | git status before this handoff; preserve all          |
| Ownership         | Reference brief and old handoffs/art were pre-existing; plan and inventory created during curriculum work. Exact ownership of all pre-existing contents is unknown.                                                                                                               | Prior task record and status                          |

## 3. Environment and operational rules

Disk at handoff check: 2.5 GiB available, 100% capacity (`df -h .`). Do not run builds, full tests or screenshot sweeps on a full volume. The user explicitly authorized `mo clean` previously; it completed without sudo and transiently restored 5.2 GiB, but free space later fell. Do not delete user files or run additional cleanup without applicable authorization. Cap test concurrency with `RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1`; set `DO_NOT_TRACK=1`. Do not touch audio, invoke sudo, or use macOS automation. Browser launch arguments, if a fresh browser session is later authorized: `AGENT_BROWSER_ARGS="--use-mock-keychain,--password-store=basic"`; do not navigate non-http(s) links. The previous task-owned browser and dev server were stopped according to the task record; current process, port, browser-session and swap state are not independently checked in this handoff.

# PART II — COMPLETE EXECUTION RECORD

## 4. Chronological command and action ledger

The available current-session tool results support the following ledger. Pre-compaction raw commands are unavailable here; the earlier handoff is historical evidence, not a complete verified command transcript. All commands below ran in the working directory above.

| Phase             | Exact action                                                                                                                                    | Result                                                                                    | Rerun                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| Resource recovery | `DO_NOT_TRACK=1 mo clean`                                                                                                                       | Exit 0; sudo-only caches skipped with Space; reported +684.6 MB and 5.59 GB free          | Only with fresh applicable authorization |
| Generation        | `DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun run lessons`                                                                       | Exit 0; 162 lessons, 652 chapters, 12,556 moves; 0 validation errors                      | After disk check                         |
| Type check        | `DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bunx tsc -b`                                                                           | Exit 0, before later text-only intro change                                               | After disk check                         |
| Originality       | `DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun scripts/lessons/check-originality.ts`                                              | Initially one flagged rook intro; after revision, 18,702 strings checked, 0 flagged       | Yes, after disk check                    |
| Regeneration      | `DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun run lessons`                                                                       | Exit 0; same validator counts after intro change                                          | After disk check                         |
| Prepare           | `git fetch origin`; `git diff --cached --check`                                                                                                 | Exit 0                                                                                    | Read-only fetch/check okay               |
| Stage             | `git add data/lessons/units src/data/lessons src/data/curriculum.ts src/app/modes/lesson/LessonPane.tsx src/app/modes/lesson/OpeningPicker.tsx` | Staged intended curriculum content, including mixed pre-existing changes in OpeningPicker | Do not blindly repeat                    |
| Commit            | `git commit -m 'feat(lessons): expand tactics and improve curriculum navigation'`                                                               | `f6ec3a2`, 45 files                                                                       | No                                       |
| Delivery          | `git push origin HEAD:refs/heads/main`                                                                                                          | Exit 0; `3684221..f6ec3a2`                                                                | No; requires fresh authority             |
| Remote readback   | `git ls-remote origin refs/heads/main`                                                                                                          | `f6ec3a2b60c52abd2a8d96832c4ad700b1a8cd69`                                                | Yes                                      |

## 5. Methodology and decision record

Lessons are authored in `data/lessons/units/`; `bun run lessons` generates `src/data/lessons/` and validates legal replay. `src/data/curriculum.ts` models stages and navigation; `OpeningPicker.tsx` and `LessonPane.tsx` use that data. The user explicitly directed the push to main. The generated catalog was synchronized before commit. Existing OpeningPicker modifications included pre-existing navigation changes and task changes; both were committed under the explicit delivery instruction. Legal replay and string similarity checks are insufficient to prove tactical correctness or original authorship of composed boards.

## 6. Files and artifacts

| Path or URL                                                                                                     | Role and state                                                                              | Verification and resume instruction                                                             |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `data/lessons/units/`                                                                                           | 21 modified lesson sources committed in `f6ec3a2`; exact list via `git show --stat f6ec3a2` | Review semantics, tactics and position provenance individually                                  |
| `src/data/lessons/`                                                                                             | Matching generated outputs committed                                                        | Rebuild from authored units; never edit generated output manually                               |
| `src/data/curriculum.ts`, `src/app/modes/lesson/OpeningPicker.tsx`, `src/app/modes/lesson/LessonPane.tsx`       | Curriculum flow/navigation committed                                                        | Current-head runtime and mobile UX unverified                                                   |
| `conductor/lesson-rebuild/curriculum-plan.md`, `remaining-inventory.json`                                       | Untracked planning/inventory from work                                                      | Preserve; check current relevance before relying on status                                      |
| `conductor/lesson-rebuild/reference-rebuild-brief.md`                                                           | Pre-existing modified brief                                                                 | Preserve; any instruction to reproduce source diagrams conflicts with project originality rules |
| `docs/HANDOFF_2026-10-28_LESSON_CURRICULUM.md`                                                                  | Earlier untracked handoff                                                                   | Historical; its branch, generation and verification status may be stale                         |
| `docs/HANDOFF_2026-10-22_LESSON_AUDIT_REMAINDER.md`, `docs/HANDOFF_2026-10-22_LINGERING_WORK.md`, `output/art/` | Pre-existing untracked artifacts                                                            | Preserve                                                                                        |
| PR #27                                                                                                          | Earlier orientation/assistance UI work merged                                               | Not current-head proof of curriculum UI                                                         |

# PART III — EVIDENCE, FAILURES, AND HONESTY

## 7. Verification matrix

| Requirement                  | Evidence                                                          | Result                          | Gap                                                                          |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| Push to main                 | Remote ref readback                                               | Matches `f6ec3a2`               | Later remote movement unknown                                                |
| Lesson replay and generation | `bun run lessons`                                                 | 12,556 legal moves, zero errors | Does not evaluate tactical quality or prove visual correctness               |
| Text originality             | `check-originality.ts`                                            | 18,702 strings, zero flagged    | Does not establish independent authorship of positions or teaching structure |
| Type safety                  | `bunx tsc -b`                                                     | Exit 0                          | Prior to text-only revision; no browser proof                                |
| Tactical/semantic accuracy   | Individual prior checks reported in earlier task record           | Partial only                    | Independent review of all changed chapters and defenses needed               |
| UX and mobile                | Earlier limited browser inspection reported in historical handoff | Stale, not current head         | Current-head stage, strategy, kifu and mobile flows unverified               |
| CI/deployment                | None inspected after push                                         | Unknown                         | Check if user later requests delivery verification                           |

## 8. Failures, traps, and rejected approaches

Disk exhaustion blocked generation; assistant prematurely marked work blocked rather than pursue available cleanup. User requested `mo clean`, after which build passed; free space has since declined. Do not repeatedly declare a blocker without assessing authorized recovery. An initial rook intro was flagged as sharing source wording; revised and rechecked, but the string check does not prove originality of positions. The position-chapter checker does not engine-score those chapters. A pawn scratch-base provenance is unresolved. Earlier global GitHub account selection resulted in a wrong-account PR; verify command-scoped actor before future GitHub mutations. `origin` belongs to an organization; the user gave an explicit override for the already-completed push, not a standing exemption for future writes.

## 9. Known limitations and blockers

Disk at 100% blocks heavy validation under project rules until capacity recovers. No current permission to launch independent browser sessions while the user is actively testing, or to push again. External outcome and CI after push were not inspected. Originality of some composed positions and tactical soundness remain unproven; they require manual source/provenance and legal-defense review, not another generic replay check.

# PART IV — RESUME WITHOUT REDISCOVERY

## 10. Immediate next action

After an explicit request to resume, from `/Users/vittayapalotai.tanyawat/code/joseki-practice` run `df -h .` and `git status --short --branch` as separate commands. If full, avoid builds and browser sweeps; use an authorized cleanup path. Preserve all dirty/untracked paths. If capacity is adequate, read `docs/lessons.md` and the project lesson skill before reviewing the changed units.

## 11. Remaining ordered work

1. Confirm current source and generated output parity; inspect `git show --stat f6ec3a2` and rebuild only with sufficient space. Stop on generation errors.
2. Audit every changed unit's tactics and explanation against actual board positions, legal replies and displayed hands. Verify all defenses for mating claims; do not infer quality from replay alone.
3. Check independent origin of pawn/lance and other composed positions and structure against reference materials. Replace source-derived composed diagrams under project copyright rules; rerun originality checks, recognizing their limits.
4. Reconcile the remaining 45-unit inventory and per-strategy tutorials with the actual curriculum and the original learning contract. Complete missing work only when resumed and authorized.
5. If browser work is authorized, inspect current head through real UI, especially mobile layout, first-strategy navigation, lesson progression, KIF and study/play coordinate behavior. Record actual runtime evidence and clean up owned sessions.
6. Check CI and remote parity if delivery verification is requested. Obtain fresh authorization for any subsequent external write.

## 12. Command cookbook

Run separately from repository root; no tests or builds while disk reports full:

```sh
df -h .
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/main
git show --stat f6ec3a2
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun run lessons
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun scripts/lessons/check-originality.ts
DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bunx tsc -b
```

Do not run generation and typecheck concurrently on a resource-constrained machine. Push, cleanup and independent browser work require applicable current authorization.

## 13. Handoff receipt

- Authored: 2026-10-28 20:27 JST; live disk, branch, HEAD and remote checked during authoring.
- Sources: current task record, skill file 1–EOF, current-session tool output, `git status`, `git show --stat`, remote ref and disk state.
- Logs/history: no cross-session history read; unavailable pre-compaction raw command stream prevents a complete chronological ledger.
- Durable notes: this file and `conductor/CURRENT_TASK.md`.
- Verification artifact: this handoff read back after writing; current Git status and remote head rechecked.
- Unverified: current processes/ports/browser sessions, swap, current-head browser behavior, CI, deployment, comprehensive lesson originality and tactical review.
