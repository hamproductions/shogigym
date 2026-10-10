# Active user testing

When the user is actively testing the app, implement requested changes directly and limit checks to essential source validation. Do not launch independent browser sessions, screenshots, viewport sweeps or device verification unless the user explicitly requests them. Preserve the running development servers and let the user verify the visible result.

# Variant presentation

Taikyoku uses the main game's traditional room, physical square and koma dimensions, piece renderer and baked 2D pipeline. Preserve material, finish and font settings. Variant rules govern captures and victory; show royal targets and remaining royals explicitly. Do not replace shared presentation with simplified independent drawing or scale characters and pieces to fit the board.

# Instanced presentation

Instancing is a rendering optimization only. Preserve existing piece geometry, physical dimensions, glyphs, textures, grain, material and finish settings, transforms and shadows in both normal and Taikyoku boards. Use ordinary rendering when a material or custom render hook is incompatible; never simplify appearance to enable batching.

# Learning source fidelity

Source-board lessons must reproduce every supplied article diagram from visual inspection, including pieces, promotion, orientation and hands. Preserve cropped or incomplete positions explicitly; never invent missing pieces or substitute simplified exercise positions. Legal-move validation and topic counts do not establish source fidelity. Software directories and column articles are reference material, not lessons. Selecting a board lesson must show its source position immediately. Group lesson discovery before showing topic lists.

All lessons share one format and one system; `docs/lessons.md` documents every source and the build. Lesson content is generated, never hand-edited: `bun run lessons` runs `scripts/lessons/build.ts` over the committed source (`data/lessons/figures/<topic>.json` = extracted figures, captions, explanations and stated move lists; `data/lessons/topics/` = catalog, overviews, check questions, examples) and writes `src/data/lessons/<topic>.json`, then validates it. Fix lesson problems in the converter or the source data and rebuild in one run; never patch the output. Each lesson uses one side (the side its figures are drawn from). Figures are joined only by moves the source states (move lists, or prose matched move by move, including 成/不成); 「図Xから…」 figures become variation branches at 図X; a chapter that resumes where another ended is joined onto it. Chapters are standard courses (`RawCourse`) with explanations as node comments and marks/illustrations on `node.figures`. `scripts/lessons/extract-figures.ts` (image recognition from the ignored `.cache/extract` workbench) and `fetch-sources.py` produced the figure source and are kept for provenance. The catalog, library, guide, quiz, progress and report links treat lessons exactly like the joseki courses; never add a parallel lesson model or viewer, and never label lessons by their source. Joseki is one category where the learner picks a strategy. `scripts/validate-curriculum.mjs` replays every chapter and requires an explanation and source on every figure.
