# Lessons: authoring, sources and build

Every lesson in 学ぶ (Learn) is written for this app. Do not edit `src/data/lessons/` by hand; edit the unit in `data/lessons/units/` and rebuild.

```sh
bun run lessons                                   # data/lessons/units/*.json -> src/data/lessons/*.json, then scripts/validate-curriculum.mjs
bun scripts/lessons/check-unit.ts <id> [--engine] # structure, legality, originality and opening-line checks for one unit
bun scripts/lessons/check-originality.ts         # originality check over every unit and course
```

## Copyright rules

The project is non-commercial, but that is not an exemption: Japanese copyright law has no fair use and no non-commercial exception for publishing. The rules below apply to every lesson and course.

- **Free to use:** facts and ideas. The rules of shogi, piece movements, the names and shapes of castles, the names and ideas of strategies and tesuji, proverbs (格言), and move sequences of openings and games (棋譜 are not copyrightable works).
- **Never copy:** explanatory text, captions, headings, annotations of games, and the selection, order and structure of someone else's article or collection. A sentence-by-sentence paraphrase or a translation of such text is still a derivative work. Read a source to understand the idea, close it, and write the lesson in your own words with your own structure.
- **Never reuse composed positions:** tsume problems, constructed tesuji/寄せ examples and teaching diagrams are creative works. Build your own positions. Positions of real games and of opening theory reached from the initial position are facts.
- **Collections:** do not reproduce a site's or book's set of lines or problems as a set. Opening lines are taken from free data (YaneuraOu Peta book, MIT; まふ定跡, GPL-3.0) or written from general knowledge, and verified with the engine.
- **Free text that may be adapted:** Wikipedia and Wikibooks (CC BY-SA). An adapted passage must be listed in `references` with `adapted: true` and its license; the lesson then carries that attribution.
- **Reference only:** shogi-joutatsu.com, shogi-rule.com (its 利用規約 forbids 転載・複製・翻訳 and imitation of its structure), hibitonshi.com, shogilounge.com, shogijam.com, thirdfilerook.jp, blogs, lishogi studies and Reddit posts (their authors keep all rights). They may be cited as `参考` (consulted), never adapted.
- **Mate problems:** use positions from the app's own computer-generated tsume set (`src/data/tsume.json`, from YaneuraOu's generated mate positions) or compose new ones and verify them with the engine.

`check-unit.ts` enforces what can be checked mechanically: no Japanese run of 16+ characters (move notation removed) and no more than 25% n-gram coverage shared with the reference corpus, no reduced-material position equal to a figure of the removed source lessons, and free licenses for adapted references. The corpus lives in the ignored `.cache/`: `python3 scripts/lessons/fetch-references.py` downloads the pages listed in `scripts/lessons/reference-urls.txt` into `.cache/reference/`, and `.cache/old/` holds the removed lesson figures and courses for the position check (`mkdir -p .cache/old && git archive 4ed7ce0 data/lessons/figures src/data/joseki | tar -x -C .cache/old`, then move `data/lessons` to `.cache/old/lessons` and `src/data/joseki` to `.cache/old/joseki`). Passing the check does not replace writing originally.

## Unit format

`data/lessons/units/<id>.json`:

```jsonc
{
  "id": "rules-promotion",                 // kebab-case, equals the file name
  "order": 130,                            // position in the library
  "path": ["はじめての将棋", "ルール"],     // library category path
  "title": { "ja": "…", "en": "…" },
  "intro": { "ja": "…", "en": "…" },       // what the lesson teaches and why it matters
  "check": { "question": { … }, "answer": { … } },
  "references": [{ "title": "…", "url": "https://…", "license": "CC BY-SA 4.0", "adapted": true }],
  "chapters": [
    {
      "title": { "ja": "…", "en": "…" },
      "side": "sente",                     // the learner's side
      "kind": "opening",                   // "opening" (starts from startpos or a handicap start) or "position"
      "start": "startpos",                 // or a SFEN
      "steps": [
        { "text": { … } },                 // comment on the start position
        { "moves": ["7g7f", "3c3d"], "text": { … }, "marks": { "arrows": ["2g2f"], "boxes": ["3d"] } }
      ],
      "variations": [{ "from": 1, "moves": ["…"], "text": { … }, "steps": [ … ] }]
    }
  ]
}
```

- Each step plays its `moves` (USI) from the previous step and then shows `text` on the resulting position; the guide pauses on every step. `marks` draw arrows (USI moves) and highlight squares (`last`, `boxes`, `dashed`, `ghosts`).
- A variation branches from step `from` (index into `steps`), plays its moves, shows its text and may continue with its own steps.
- Partial positions (rule illustrations) are allowed; the side not to move must not be in check.
- English is a translation of the Japanese written here.

## Build

`scripts/lessons/build.ts` turns each unit into one library entry (`src/data/lessons/<id>.json`) whose chapters are standard courses (`RawCourse`, the same format as the joseki courses). `scripts/validate-curriculum.mjs` replays every chapter and variation and rejects illegal moves and positions.
