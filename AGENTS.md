# Active user testing

When the user is actively testing the app, implement requested changes directly and limit checks to essential source validation. Do not launch independent browser sessions, screenshots, viewport sweeps or device verification unless the user explicitly requests them. Preserve the running development servers and let the user verify the visible result.

# Variant presentation

Taikyoku uses the main game's traditional room, physical square and koma dimensions, piece renderer and baked 2D pipeline. Preserve material, finish and font settings. Variant rules govern captures and victory; show royal targets and remaining royals explicitly. Do not replace shared presentation with simplified independent drawing or scale characters and pieces to fit the board.

# Instanced presentation

Instancing is a rendering optimization only. Preserve existing piece geometry, physical dimensions, glyphs, textures, grain, material and finish settings, transforms and shadows in both normal and Taikyoku boards. Use ordinary rendering when a material or custom render hook is incompatible; never simplify appearance to enable batching.

# Learning content and copyright

レッスンの盤面注釈は、開始局面の解説だけでなく、画面に表示している次の手・直前の手の解説にも同期させる。座標や駒の現在位置はマスを強調し、着手の説明は教材の実際の手順から移動元と移動先を特定して矢印で示す。解答を隠しているクイズでは次の手の説明を注釈へ含めない。外部教材の任意の解説欄には null があり得るため、表示用テキストへの変換時に欠落値として扱う。

For a named lesson branch, read its handoff and inspect its lesson changes before consulting generic handoffs or resuming another branch's task. Apply that branch's content schema and authoring workflow.

All lessons and courses are original work for this app. Copyrighted sites, books, blogs and studies are reference material only: never copy, translate or closely paraphrase their text, never reproduce their composed positions (tsume, constructed tesuji or teaching diagrams), and never mirror an article's structure or a site's collection of lines. Facts and ideas (rules, castle shapes, strategy names and plans, opening move sequences, game records) may be used; Wikipedia/Wikibooks may be consulted for facts only; do not adapt their wording, structure or teaching positions, regardless of license. Retained source-derived courses also require original replacements. References record consultation with `adapted: false`. The project being non-commercial is not an exemption. `docs/lessons.md` holds the full rules.

For a collection rebuild, inventory every planned lesson, source, existing or missing output, and replacement course before authoring. Then complete each full rewrite in plan order; isolated edits and checks do not satisfy the rewrite.

Lessons are authored units in `data/lessons/units/<id>.json`; `bun run lessons` builds `src/data/lessons/` (never edit the output). Every unit must pass `bun scripts/lessons/check-unit.ts <id>` (add `--engine` for opening chapters) and every course `bun scripts/lessons/check-course.ts <id> --engine`; `bun scripts/lessons/check-originality.ts` checks everything against the reference corpus in `.cache/`. Opening lines come from standard theory checked with the Peta book (MIT) and the engine. Chapters are standard courses (`RawCourse`) with explanations as node comments and marks/illustrations on `node.figures`; the catalog, library, guide, quiz, progress and report links treat lessons exactly like the joseki courses. Never add a parallel lesson model or viewer. Joseki is one category where the learner picks a strategy.

Content work is sized to the request: openings are taught by the joseki courses, not duplicated as lessons. Write units one at a time (at most one writer subagent, sequential); never fan out parallel writers.

Mating drills must state whether they use the displayed hands or the composed-tsume convention of giving all remaining pieces to the defender. Verify every legal defense to the selected checks and checkmate at every endpoint; do not infer these from a single PV or `check-unit --engine`, which does not evaluate position chapters. A five-move label requires excluding shorter forced mates from the start while allowing shorter branches against weaker defenses. Check partial positions for nifu, stranded pieces and physical piece inventory separately from legal move replay.

For a preparatory move, compare the actual control before and after it; do not claim that it creates protection or pressure already present. Before accepting a teaching position, check immediate captures and forcing counterchecks, and retain the blockers and defenders needed for the illustrated line. Label cooperative replies and deliberate mistakes explicitly.

# Project lesson skill

For lesson authoring, revision, or audit in this project, use `.agents/skills/shogi-lessons/SKILL.md` and its relevant references. Project-specific skills stay in this repository and use its source schema, declared references, engine harness, and canonical task record. Registering them globally requires an explicit request.

# Coaching annotations

Live coaching uses the existing SquareText and figureMarks pipeline. Keep coordinate text, tile colors and legal move arrows synchronized with the displayed position; suppress stale-position annotations and hidden assistance. PR screenshots use native `gh pr edit --attach`.

# Flat board layers and promotion input

Render board and stand surfaces before arrows, then board and hand pieces; arrows must remain beneath physical piece tiles. Promotion choices require a fresh press inside the picker or keyboard activation, never the release/click from the gesture that opened it.
