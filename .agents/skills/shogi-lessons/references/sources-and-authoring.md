# Sources and original authoring

## Source evidence

Read the project's source/authoring policy before selecting content. In joseki-practice, `AGENTS.md` and `docs/lessons.md` require original explanations, structure, and independently composed teaching examples. This is a project acceptance rule; attribution or a permissive source license does not waive it.

Work within the declared reference set. Search the project's cache/index for a previously obtained copy before declaring a source unavailable. For an available source, read the relevant article completely and inspect its teaching assets at useful resolution. A text extraction is not evidence that images, PDF contents, linked books, videos, or dynamic KIF variations were reviewed.

Use a focused evidence record for the requested content:

| Field          | Record                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Source         | Exact declared URL, title, revision/commit when applicable, retrieval date                       |
| Local copy     | Project-owned path and current content hash                                                      |
| Reading        | Total lines/range for text; asset paths and inspected views for visuals/data                     |
| Interpretation | Rule, mechanism, standard opening fact, or claim actually established                            |
| Application    | Existing unit/chapter/course; original addition, clarification, or explicit exclusion            |
| Gaps           | Missing text/image, inaccessible variation, unread linked material, or unresolved interpretation |

For large audit notes, query the relevant lesson/source IDs first. An old `read: true` entry is historical evidence: compare its hash with the file being used now. Independently verify reader/subagent interpretations against the decisive raw artifact before incorporating them.

## Diagram and game interpretation

Distinguish actual pieces from arrows, highlighted squares, ghost pieces, inset boards, and text labels. Read ownership/orientation, promotion marks, side to move, hands, and whether the diagram represents a position before or after a move.

A cropped or multi-frame diagram may not specify absolute board coordinates. Preserve that uncertainty in research evidence; an arbitrary full-board SFEN does not establish source fidelity. Extract a standard rule or mechanism only after the source can support it.

Replay KIF/USI data and each relevant variation from its actual start. Check legality and reached positions, not merely that a file parses. Source graphics and game data are different evidence layers.

In joseki-practice, source teaching diagrams and composed tsume/tesuji positions are consultation material, not publishable lesson assets. Source-fidelity research does not grant permission to ship them. Use standard opening/game facts or compose a new example that teaches the same principle without reproducing the source's position or presentation.

## Lesson construction

Choose one concrete learning objective. Explain the mechanism, show an original position or standard sequence that demonstrates it, include the relevant response or counterexample, and ensure the learner can explain why the result follows. Add material to an existing chapter when the mechanism is already represented; source-by-source duplication makes a weak curriculum.

Use the source to understand the idea, then draft independently in the app's teaching structure. Compare the finished text, position, line selection, and organization with consulted material. Translation, sentence-by-sentence paraphrase, rearranged copied diagrams, or a mirrored article/collection do not satisfy original authorship.

Distinguish rule-driven organization from a source's distinctive teaching choices. Shared rule facts or the canonical order of a standard line alone do not establish copied expression or structure; ground a finding in the specific text, examples, or selection being compared.

For joseki-practice, record consulted references with `adapted: false` and their actual title/URL/license status. Wikipedia/Wikibooks are factual consultation sources under the same original-authoring rule. Use standard opening facts and the project's permitted book/game data for opening courses. Do not infer reuse rights for images/problems/dependencies from a repository's root license.

Japanese explanations are authored here; English follows their actual meaning. Keep rule, example, comparison response, and recommendation distinct. A legal cooperative response can illustrate a mechanism without being compulsory or best play; label it accordingly.

## Unit semantics

Recheck `scripts/lessons/unit.ts` and a nearby current unit before editing. Its important semantics are:

- `id` matches the source filename; bilingual title/intro, category `path`, and numeric `order` drive library presentation.
- A chapter identifies the learner's `side`, `start`, and `kind`. Opening chapters start from the standard or a supported handicap start; independently composed rule/tactical examples use position chapters.
- Each step plays its USI `moves` from the preceding position and attaches `text` and marks to the resulting node. A text-only step explains the current node.
- `variation.from` is the zero-based index of a step in the parent chapter. Branch from that step's reached position; then play the variation and its own continuation steps.
- Marks use real board squares/USI moves. Check annotation timing, actual origin/destination, and current piece locations. A positional mention highlights a square; a move explanation should identify the actual move.
- Generated chapters are ordinary courses with node comments and figures. The existing quiz hides future-answer annotations; preserve that behavior when accepting the rendered lesson.

Opening course specs have their own segment tree and notes. Read a current spec and the builder before using `kind`, `notes`, `comment`, `aim`, or `punishNote`. Their generated verdicts must agree with the annotation: a mistake label needs a reason for that move itself, not a loss caused only by a later voluntary move.
