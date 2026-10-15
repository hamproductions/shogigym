---
name: shogi-lessons
description: Create, revise, or audit lessons and opening courses in joseki-practice (shogigym), using this project's declared sources, original examples, engine/book harness, generators, and continuation records.
---

# joseki-practice Lesson Workflow

This is a project-local skill for joseki-practice (shogigym) and its explicitly selected worktrees. All content and harness paths below are relative to that checkout. Keep this skill in `.agents/skills/shogi-lessons/` inside the project; it is not a global shogi workflow.

Produce teaching content whose explanations, positions, moves, annotations, and evidence agree. Renderer changes and releases remain separate tasks.

## Establish the task

Read the project's instructions and canonical current-task record first. Resolve the requested checkout or named lesson branch before following an older handoff. Preserve the current source schema, viewer, user testing, and unrelated changes.

Identify the requested lesson IDs, learning objective, declared references, and acceptance conditions. A correction is not permission to rebuild an entire curriculum. For a collection rewrite, inventory every requested unit and replacement course before authoring; a few repaired examples do not satisfy that rewrite.

Choose the mode from the request: author/revise changes source content; audit uses read-only inspection/checks and returns findings; handoff records the current state. An audit does not authorize source edits or regeneration.

Read [sources-and-authoring.md](references/sources-and-authoring.md) before consulting references or writing content. Read [engine-and-verification.md](references/engine-and-verification.md) before validating positions or interpreting engine results. Read each selected reference completely; load only project sources relevant to the requested content.

## Execute

1. Read the complete authored unit/course and its relevant declared sources, including diagrams, tables, and game data needed to understand the claim. Record unavailable evidence explicitly.
2. Define the mechanism the learner should understand. Reuse the appropriate existing chapter or opening course when it already teaches that mechanism.
3. For authorized authoring/revision, write original explanations and independently composed teaching positions. Author one unit at a time; use at most one sequential content writer if delegation is authorized.
4. Replay every affected main line and variation. Check the exact before/after positions, hands, promotions, move order, learner side, comments, and marks.
5. Verify substantive claims with the appropriate evidence: rules/legality, opening book, bounded engine search, or complete reply analysis. Investigate warnings and counterexamples before accepting the wording.
6. After source changes, rebuild through the project's generators and run the applicable existing checks. For a read-only audit, verify existing outputs and report required rebuilds without executing them. Validate generated behavior separately from source reading.
7. Inspect the affected rendered lesson when browser verification is authorized. During active user testing, honor the project's restriction on independent browser sessions; report visible acceptance as pending rather than substituting source checks.

## joseki-practice integration

Resolve this project's root from the selected checkout. Read its `AGENTS.md`, `conductor/CURRENT_TASK.md`, and `docs/lessons.md`; do not route to another repository or substitute a global copy.

| Content                             | Authoritative source                                                                    | Generated output / harness                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| General lesson                      | `data/lessons/units/<id>.json`                                                          | `bun run lessons` → `src/data/lessons/`                             |
| Opening course                      | `scripts/courses/<stem>.mjs`                                                            | `node scripts/build-courses.mjs` → `src/data/joseki/`               |
| Unit/course contract                | `docs/lessons.md`, `scripts/lessons/unit.ts`, existing course specs                     | Standard `RawCourse` chapters, existing library/guide/quiz/progress |
| Validation                          | `scripts/lessons/check-unit.ts`, `check-course.ts`, `engine-eval.mjs`, `originality.ts` | Interfaces and limitations in the verification reference            |
| Prior audit evidence, if applicable | `conductor/lesson-audit/{coverage,findings,incorporation}.json`                         | Query the relevant IDs; recheck current hashes and positions        |

Edit source files and regenerate outputs. Keep openings in their opening courses rather than adding duplicate general lessons. Preserve node comments/figures and the existing lesson viewer. Do not introduce a parallel lesson model.

## Acceptance and continuation

Completion requires all requested content to be accounted for, each substantive claim to have evidence appropriate to its strength, generated outputs to match source, and relevant check failures/warnings to be resolved or explicitly limited. Counts, legal replay, a book match, and engine exit status each prove different things.

Update the single project-owned current-task record in place. Keep it compact; put detailed evidence in focused project notes. For each finding record the source path/claim, exact SFEN and move prefix, evidence command/settings/output, interpretation, correction, and verification state. Keep source-read, legal-replay, engine-diagnostic, browser-proven, unavailable, and not-run states distinct.

When handing off or explicitly stopping, preserve:

- The requested scope, source-authoring policy, checkout/HEAD, relevant dirty-file ownership, and current permissions.
- The actual harness commands and source/generated paths; reference existing evidence rather than copying reports.
- Source access/read coverage and hashes, unresolved warnings/counterexamples, and the exact position/move where work stopped.
- Engine identity, Threads/Hash/search budget, score perspective, principal variation if captured, and what the result does and does not establish.
- Browser evidence or its absence, owned process state, and one concrete next command with its success/failure branch.

Use an existing project handoff route; when a full operational handoff is requested, use `handing-off-pro-max` if installed. Redact secrets and record neutral technical requirements rather than raw chat. Follow fresh user scope and authorization on resume. This skill does not authorize source-set expansion, publication, pushing, deployment, or changes to system/audio settings.
