# Writer brief: original shogi lessons

You write lessons for Shogi Gym (repo `/Users/hamp/fun/shogigym`, branch `audit/lesson-copyright`). The previous lessons were copied from a copyrighted website and are being replaced. Your lessons must be genuinely original: understand the topic, then teach it in your own words, with your own structure and your own positions.

## Read first (completely)
1. `docs/lessons.md` — copyright rules, unit format, commands. Follow it exactly.
2. `data/lessons/units/rules-promotion.json` — a finished example unit (format and tone).

## For each unit assigned to you
1. **Study** the topic. Read the article text `.cache/curriculum-source/<study-id>.txt` completely and look at its figure data `.cache/old/lessons/figures/<study-id>.json` (positions as SFEN, stated move lines). These are copyrighted and are for understanding only. Work out what the ideas are: the rule, the plan, why each move is played, what the typical mistakes are. You may also use your own shogi knowledge and Wikipedia/Wikibooks.
2. **Close the source and design your own lesson.** Choose your own chapter structure and order, your own chapter titles and step texts. Do not mirror the article's sections, headings, figure sequence or captions. Do not translate or paraphrase its sentences; explain the idea the way you would explain it to a student sitting next to you.
3. **Positions.**
   - Opening/joseki chapters: `"kind": "opening"`, `"start": "startpos"` (or the handicap start positions listed in `scripts/lessons/unit.ts` `HANDICAPS`, with gote = 上手 to move). Opening move sequences are facts and may follow standard theory; prefer moves that the Peta book contains (check-unit prints NOTE lines for moves outside the book). Run `--engine` and fix any move flagged with engine loss > 300, unless the chapter deliberately shows a mistake and the text says so.
   - All other chapters (rules, tesuji, castles shown as positions, castle attacks, endgame, mates): `"kind": "position"` with positions YOU compose. Never reuse a figure position from the source data; the checker rejects copies. Keep positions legal and sensible (both kings present unless it is a rule illustration of a few pieces). Verify tactical claims with the engine: `printf '<sfen>\n' | node scripts/lessons/engine-eval.mjs 1000` prints `<score for side to move> <bestmove> <mate distance or ->`. A mate claim must be confirmed by the engine (mate distance). For 3+ move mate examples you may also use positions from `src/data/tsume.json` (computer-generated, free to use; `mate` = length, `pv` = solution).
   - Castles: show how to build them with moves from the initial position where possible (`kind: opening`), or as a composed position.
4. **Text.** Japanese first, natural and accurate, beginner-friendly but not childish; English is your translation of your Japanese. Each step text explains the position after its moves: what happened, why, what to look for. Mention squares in Japanese notation (７六歩, ▲２四歩) so the board highlights them. Intro: 2–4 sentences on what the lesson teaches. Check question: one question with a clear answer.
5. **Size.** 3–6 chapters per unit, typically 3–10 steps per chapter. Use `marks` (arrows/boxes) where they help. Use variations for important alternatives (wrong move and its punishment, or the opponent's other main reply).
6. **References.** List Wikipedia/Wikibooks pages you actually used (`license` "CC BY-SA 4.0"; `adapted: true` only if you adapted their text). You may list the studied article as `{"title": "...", "url": "https://shogi-joutatsu.com/archives/<id>", "license": "All rights reserved", "adapted": false}` (consulted only).
7. **Check** until it passes: `bun scripts/lessons/check-unit.ts <id> --engine` (use `--engine` when the unit has opening chapters; position chapters do not need it). ERROR lines must be zero. If the originality check flags a phrase, rewrite the sentence in a different way (do not just swap a word).

## Rules
- Write only `data/lessons/units/<id>.json` for your assigned ids. Touch no other file. No git commands. Do not run `bun run lessons`.
- Do not fetch any website other than ja/en.wikipedia.org and wikibooks.org. Never open browsers.
- Run commands one at a time; never leave background processes.
- Accuracy matters more than volume: a wrong shogi claim is worse than a shorter chapter. If unsure about a line, verify with the engine or leave it out.

## Report back (short)
For each unit: chapters, steps, check-unit result, remaining NOTE lines and why they are acceptable, which positions you composed vs. took from tsume.json, and anything you were unsure about.
