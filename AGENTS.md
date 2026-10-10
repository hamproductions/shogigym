# Active user testing

When the user is actively testing the app, implement requested changes directly and limit checks to essential source validation. Do not launch independent browser sessions, screenshots, viewport sweeps or device verification unless the user explicitly requests them. Preserve the running development servers and let the user verify the visible result.

# Variant presentation

Taikyoku uses the main game's traditional room, physical square and koma dimensions, piece renderer and baked 2D pipeline. Preserve material, finish and font settings. Variant rules govern captures and victory; show royal targets and remaining royals explicitly. Do not replace shared presentation with simplified independent drawing or scale characters and pieces to fit the board.

# Instanced presentation

Instancing is a rendering optimization only. Preserve existing piece geometry, physical dimensions, glyphs, textures, grain, material and finish settings, transforms and shadows in both normal and Taikyoku boards. Use ordinary rendering when a material or custom render hook is incompatible; never simplify appearance to enable batching.

# Learning content and copyright

All lessons and courses are original work for this app. Copyrighted sites, books, blogs and studies are reference material only: never copy, translate or closely paraphrase their text, never reproduce their composed positions (tsume, constructed tesuji or teaching diagrams), and never mirror an article's structure or a site's collection of lines. Facts and ideas (rules, castle shapes, strategy names and plans, opening move sequences, game records) may be used; Wikipedia/Wikibooks (CC BY-SA) may be adapted with attribution in `references`. The project being non-commercial is not an exemption. `docs/lessons.md` holds the full rules.

Lessons are authored units in `data/lessons/units/<id>.json`; `bun run lessons` builds `src/data/lessons/` (never edit the output). Every unit must pass `bun scripts/lessons/check-unit.ts <id>` (add `--engine` for opening chapters) and every course `bun scripts/lessons/check-course.ts <id> --engine`; `bun scripts/lessons/check-originality.ts` checks everything against the reference corpus in `.cache/`. Opening lines come from standard theory checked with the Peta book (MIT) and the engine. Chapters are standard courses (`RawCourse`) with explanations as node comments and marks/illustrations on `node.figures`; the catalog, library, guide, quiz, progress and report links treat lessons exactly like the joseki courses. Never add a parallel lesson model or viewer. Joseki is one category where the learner picks a strategy.

Content work is sized to the request: openings are taught by the joseki courses, not duplicated as lessons. Write units one at a time (at most one writer subagent, sequential); never fan out parallel writers.
