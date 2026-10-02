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
1. [doing] Simple board styles "for the lols", asked twice: (a) 図面 diagram — white board, thin grid, plain kanji pieces, gote upside down, hands as text, coords outside; (b) 大盤 broadcast — orange board, flat cream pentagon pieces, bold kanji, big black coords, stand silhouettes. Settings option alongside 3D.
2. Beginner gaps from desktop/phone dogfood: coach/book notes Japanese-only in Play AI/Analyze for "New to shogi"; onboarding highlights "I know the rules" over "New to shogi"; tsume side/orientation unclear; tesuji chips Japanese-only; Analyze import lands at move 0 with cryptic legend + no sample game; phone tap leaves stray square readout/red square; cramped phone header.
3. ⌘K typing "7g7f" finds no Play command.
4. Lesson map wheel scroll.
5. Tablet usability sweep (768/820/1024/800px).
6. Continue dogfood rounds (subagents desktop + phone) after each batch.
Done this session (browser-verified, committed locally): spec koma (大振り駒 table, 81°/146°, taper), 本寸 rectangular board + 6-sun legs, coords in margin with hide setting, softer light/satin lacquer, tatami room + zabuton/shoji, Casual table set (table, chairs, 2-sun board, block stands), komadai per etiquette (edge-to-edge fan → straight rows → shingled same-type overlap with counts; 12 cm fixed; big/small separated), dev #komadai test page (1–19), game clocks (切れ負け/秒読み/Fischer), lift selected piece, drag drop-target highlight, no replay on in-place drop, dogfood fixes (dialogs fit phone, Settings ×, off-book retry, phone Play their move, English promotion labels, Coach on/off).
Not requested but noted: 振り駒 / 大橋流 from the etiquette article (not implemented; ask before adding).
