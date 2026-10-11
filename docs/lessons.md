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
- **Original authorship required:** Wikipedia and Wikibooks may be consulted for facts, but their wording, structure and teaching positions must not be adapted. Every lesson and replacement course uses original explanations and independently composed examples. Consulted references use `adapted: false`.
- **Reference only:** shogi-joutatsu.com, shogi-rule.com (its 利用規約 forbids 転載・複製・翻訳 and imitation of its structure), hibitonshi.com, shogilounge.com, shogijam.com, thirdfilerook.jp, blogs, lishogi studies and Reddit posts (their authors keep all rights). They may be cited as `参考` (consulted), never adapted.
- **Mate problems:** use positions from the app's own computer-generated tsume set (`src/data/tsume.json`, from YaneuraOu's generated mate positions) or compose new ones and verify them with the engine.

`check-unit.ts` enforces what can be checked mechanically: no Japanese run of 16+ characters (move notation removed) and no more than 25% n-gram coverage shared with the reference corpus, no reduced-material position equal to a figure of the removed source lessons, and free licenses for adapted references. The corpus lives in the ignored `.cache/`: `python3 scripts/lessons/fetch-references.py` downloads the pages listed in `scripts/lessons/reference-urls.txt` into `.cache/reference/`, and `.cache/old/` holds the removed lesson figures and courses for the position check (`mkdir -p .cache/old && git archive 4ed7ce0 data/lessons/figures src/data/joseki | tar -x -C .cache/old`, then move `data/lessons` to `.cache/old/lessons` and `src/data/joseki` to `.cache/old/joseki`). Passing the check does not replace writing originally.

## yuki-keio/shogi の参照・再利用方針

2026年10月12日確認。対象は [yuki-keio/shogi](https://github.com/yuki-keio/shogi)、確認時のコミットは `9b417d696fd114f91073790c6440941892717b2d`。この調査による素材の取り込みは行っていない。

- [README](https://github.com/yuki-keio/shogi/blob/9b417d696fd114f91073790c6440941892717b2d/README.md) と [LICENSE](https://github.com/yuki-keio/shogi/blob/9b417d696fd114f91073790c6440941892717b2d/LICENSE) は GPLv3 を示す。
- 技図鑑の本文・解説図を定義する [pages/waza-content.mjs](https://github.com/yuki-keio/shogi/blob/9b417d696fd114f91073790c6440941892717b2d/pages/waza-content.mjs) は、ファイル先頭で `SPDX-License-Identifier: GPL-3.0-only` と Yuki Lab の著作権表示を明記する。[src/waza/castle.ts](https://github.com/yuki-keio/shogi/blob/9b417d696fd114f91073790c6440941892717b2d/src/waza/castle.ts) も GPL-3.0-only。
- README は高難度 AI の YaneuraOu 系実装と、詰将棋検証用の KomoringHeights を記載する。第三者由来の素材は、それぞれの権利・ライセンスを確認する。

| 対象                                         | 利用可能な範囲                                       | このプロジェクトでの扱い                                                           |
| -------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 将棋のルール、標準的な囲い・戦法・手筋の原理 | 事実・アイデアとして参照し、独立した文章と教材を作る | 原創作の教材を維持し、実際に参照した場合だけ参考資料として記録する                 |
| GPL が明示された本文・解説図の定義           | ライセンス条件を満たして複製・翻訳・改変する         | 現行の原創作要件では取り込まない。将来、翻案が明示的に許可された場合に限り検討する |
| GPL が明示された実装コード                   | GPL 条件に従って再利用する                           | 対象ファイル、依存関係、結合した配布物のライセンス適合性を確認する                 |
| 詰将棋データ、画像、音声、同梱依存物         | 個別の出所と権利表示による                           | ルートの LICENSE だけで全素材の再利用権限を断定しない。取り込み前に個別確認する    |

GPLv3 は商用利用も認める。対象著作物を配布する場合は、著作権・ライセンス・無保証の表示を保持し、ライセンスを提供する。改変時は変更内容・日付を明示し、対象の派生著作物全体に GPL を適用する。オブジェクトコード等の配布では、GPL 第6条の方法で対応するソースと必要なビルド用資料を提供する。ブラウザへ JavaScript や WASM を送る場合もコピーの配布に当たる。独立した著作物の単なる集合は区別されるため、適用範囲は実際の結合・配布形態で判断する。

本アプリの自作部分は GPL-3.0-or-later であり、GPLv3 の条件での結合を検討できる。ただし上流の GPL-3.0-only を勝手に「or later」へ変更しない。既存の AGPL 依存物など、配布物全体の義務も維持する。

**再利用許諾と原創作は別の判断である。** 許可を得てコピーした教材でも、このアプリで書き下ろした教材とは表示できない。翻案が将来許可された場合は、上流著作者・固定コミット・対象ファイル・改変内容を記録し、適切な翻案表示と `adapted: true` を用いる。事実だけを参照した独立教材は `adapted: false` とする。出典表記だけで許諾や独立創作が成立するわけではない。

この記録は確認したファイルのライセンス調査であり、全素材の権利保証や原創作の認定ではない。実際に取り込む時点で対象ファイルとその出所を再確認する。

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
  "references": [{ "title": "…", "url": "https://…", "license": "CC BY-SA 4.0", "adapted": false }],
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
