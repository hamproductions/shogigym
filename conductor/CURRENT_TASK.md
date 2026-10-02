# CURRENT TASK

## Goal (standing /goal)
ShogiLab (四間飛車 trainer, three.js board, single-screen workshop). Dogfood as a new/weak player and keep fixing until UX is smooth; use subagent dogfood runs continuously; no "still open" lists as a stopping point.

## Constraints
- No push/deploy unless the user says so in the same turn (last push cdba2d9; everything after is local).
- No Artifact publishing; no code comments; agent-browser with mock keychain + mute-audio, one named session, close it; never click mailto:/tel:.
- Dev server: user asked for it on 5317 (background task, 2 h limit); kill what you start otherwise.
- Test pages must not ship: dev-only via `import.meta.env.DEV` lazy import (verified absent from `vite build`).
- Disk ~13 GiB free (98%); run df -h before builds/sweeps.

## Live request ledger (what-did-i-say 2026-10-02 evening)
Pending, in order:
1. [subagent running; switched to i18next + react-i18next per user] Full en/ja localization of all static UI strings (language setting; no mixed labels); dynamic content out of scope.
2. Beginner gaps from desktop/phone dogfood: onboarding emphasis on "New to shogi"; tsume side/orientation unclear; Analyze import lands at move 0, cryptic legend, no sample game; phone tap leaves stray square readout/red square; cramped phone header. (Japanese-only coach text partly covered by 1.)
3. ⌘K typing "7g7f" finds no Play command.
4. Lesson map wheel scroll.
5. Tablet usability sweep (768/820/1024/800px) — after 1 lands.
6. Continue dogfood rounds (subagents desktop + phone) after each batch.
Done (verified before i18n crash): stand zones — desktop side layout uses space under gote's stand (move list + ⏮◀▶⏭) and over sente's stand (Take back / Resign in Play AI, Flip board); hidden in tilt/portrait/flat-svg views. Recheck flipped + tilt after i18n lands.
Done (verified): Settings dialog tabbed + fixed height (desktop 720x620, phone full height); full-screen rail toggle (headless browser can't confirm fullscreenElement — needs a real-browser check); broadcast board tan, kaisho pieces, centered hand counts; 3D hand count digits centered.
Done: simple board views 平面 2D (3D set top-down, same finish), 図面 diagram, 大盤 broadcast (f4ae4a3).
Done this session (browser-verified, committed locally): spec koma (大振り駒 table, 81°/146°, taper), 本寸 rectangular board + 6-sun legs, coords in margin with hide setting, softer light/satin lacquer, tatami room + zabuton/shoji, Casual table set (table, chairs, 2-sun board, block stands), komadai per etiquette (edge-to-edge fan → straight rows → shingled same-type overlap with counts; 12 cm fixed; big/small separated), dev #komadai test page (1–19), game clocks (切れ負け/秒読み/Fischer), lift selected piece, drag drop-target highlight, no replay on in-place drop, dogfood fixes (dialogs fit phone, Settings ×, off-book retry, phone Play their move, English promotion labels, Coach on/off).
Not requested but noted: 振り駒 / 大橋流 from the etiquette article (not implemented; ask before adding).
