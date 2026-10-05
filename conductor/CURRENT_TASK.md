# Current task

## Scope
- Fix 2D hand selection lifting every copy of a piece type; lift only the picked tile.
- Influence inspection boxes must not intercept legal drop interaction.
- Audit every piece and detected-type pronunciation against authoritative readings; correct generated speech inputs/assets where possible.
- Remove tesuji speech; retain compact visual announcement.
- Commit, push and patch release authorized. Release target: main, version 1.3.3 using configured release-it workflow. No device or system audio changes authorized.

## Classification and gates
- Real-testing work: 2D interaction and speech/announcement behavior.
- get-your-shit-together SKILL.md read 1–EOF (27 lines); real-testing-evidence SKILL.md read 1–EOF (70 lines). No required linked references.
- Current-session instructions and latest four corrections reconciled.
- Source investigation in progress; working tree initially clean. Frontend edits and regenerated voice assets now dirty.

## Durable requirements
- 2D visual hand selection identifies a single physical tile, while legal move selection retains piece type.
- Decorative influence overlays never consume board/drop pointer events.
- Tesuji detection remains visible but does not enqueue speech.
- Voice coverage alone does not establish pronunciation correctness.

## Verification and next action
- Current priority: finish pronunciation verification. Additional UI investigation stopped after scope correction.
- Owned browser session `joseki-fixes` and dev process session 61098 closed after verification. Unrelated default browser and existing VOICEVOX engine untouched.
- Actual SFEN import with three pawns/two silvers: dragging dims exactly one hand tile; clicking selects exactly one physical tile; legal drop committed.
- Actual influence notice reports pointer-events none; picking a hand tile clears notice.
- Actual pawn drop on rank four produced silent compact tesuji banner, inspected screenshot; no voice resource request. Desktop banner 138 by 31 px.
- Mobile flat board inspected at 390 by 844; hand stacks fit. Mobile tesuji interaction unverified; further UI scenarios outside current pronunciation priority.
- Dictionary and JSA sources corrected 中座, 金沢, 英ちゃん流, 不成, 自陣飛車, 鳥刺し and compound readings. Preferred 三間 variant now さんげん; alternate さんけん is also source-supported.
- Root independently compared every exact match against the author-maintained shogi dictionary, decoding EUC-JP correctly. Remaining exact-match differences are source-supported variants.
- All 539 named reading entries inspected. Dictionary metadata distinguishes exact full terms, constituents and literal kana; composition evidence does not establish every coined compound's complete reading.
- Root independently inspected selected EDICT records for the remaining ordinary stems and the authored ビッグ4 reading source. No pending evidence classification remains.
- Final 565 enabled phrases passed VOICEVOX phoneme verification. Generation corrects engine substitutions and forces supplied kana where required. Final assets regenerated; manifest coverage verified. Pitch accent and every clip's audible naturalness are not certified.
- Unsourced names disabled: 金盾囲い, 大盾囲い, GAVA角, 楠本式石田流, 左山囲い, 鬼六流どっかん飛車, やばボーズ流, 双竜双馬陣. No guessed voice fallback.
- Typecheck passed; scoped lint passed with existing component/export/effect warnings. Diff whitespace and secret-pattern checks passed.
- Remaining limitation: eight names lack verified complete readings; compound entries sourced by constituents are explicitly not exact-term verification.
- Fixes committed as 8cb1b51. Configured release validation, lint, formatting and production build passed.
- Release API host now explicitly github.com, independent of the SSH alias. Installed release-it passes log:null to an incompatible Octokit logger, throwing before authentication. GitHub API authentication independently passed as hamzaabamboo.
- Patch release completed through release-it with its GitHub plugin disabled; gh published the actual GitHub release. No validation hooks skipped. Version 1.3.3, release commit a10f519, main and v1.3.3 pushed.
- Release URL: https://github.com/hamproductions/shogigym/releases/tag/v1.3.3
- Immediate next action: verify remote branch/tag/release and current GitHub Pages workflow. No additional implementation requested.

- Latest pronunciation requirement: every type must use dictionary-backed readings; primary dictionary, Japan Shogi Association and original named-term sources authorized. Unverified readings cannot count as correct.
- agent-browser SKILL.md read 1–EOF (52 lines); CLI core workflow read completely. frontend-design SKILL.md read 1–EOF (71 lines); look-at-the-screen SKILL.md read 1–EOF (60 lines). Narrow banner change preserves existing tokens, amber tesuji accent, small sans-serif type and top placement.
