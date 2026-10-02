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
1. Re-architect src/workshop/Workshop.tsx (3.3k lines) — after background agents finish; user to run /ask-matt (cannot be model-invoked).
2. Critic findings still open: AI vs lesson contradiction (#5), panel scroll reset (#6), tsume retry triplication (#9), resigned game revives (#13), flip re-layout (#14), tilt fit (#15), New game dialog polish (#32), Settings size (#31), phone sheet sizing (#36/#37), English untranslated data (#4), beginner path first (#39), arrow colours (#40).
3. Table flip (explosive) animation; image export (PNG of board).
4. Room furnishing (subagent running): traditional + home, good from all angles.
5. Fairy-Stockfish + YaneuraOu NNUE engine choice (subagent running, ShogiHome-style).
6. Joseki database research (subagent running).
7. PWA verify on production preview (manifest/SW/offline) — check stalled.
8. Every UI change: real click-through + critic subagent before reporting.
Done this session (browser-verified, committed locally): spec koma (大振り駒 table, 81°/146°, taper), 本寸 rectangular board + 6-sun legs, coords in margin with hide setting, softer light/satin lacquer, tatami room + zabuton/shoji, Casual table set (table, chairs, 2-sun board, block stands), komadai per etiquette (edge-to-edge fan → straight rows → shingled same-type overlap with counts; 12 cm fixed; big/small separated), dev #komadai test page (1–19), game clocks (切れ負け/秒読み/Fischer), lift selected piece, drag drop-target highlight, no replay on in-place drop, dogfood fixes (dialogs fit phone, Settings ×, off-book retry, phone Play their move, English promotion labels, Coach on/off).
Not requested but noted: 振り駒 / 大橋流 from the etiquette article (not implemented; ask before adding).
