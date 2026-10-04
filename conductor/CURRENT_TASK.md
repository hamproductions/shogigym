# Current task

## Scope
Add View mode: two bots play automatically while the user watches with free camera control. Reuse real engine, board rendering and existing settings. View games are temporary: no kifu persistence, autosave or saved-game controls. Preserve pending module/CSS/asset refactor. Previous changes committed and pushed as d0d3b8c. Rewind correction passed TypeScript and is authorized for commit/push. Pawn-drop report withdrawn; no interaction changes retained. No subagents, system/audio changes or new test files authorized.

## Work
- View Play from rewind advances recorded history without jumping to latest or calling engine. At live edge, unfinished games continue bots; finished games stop. Pause/resume works during replay.
- Hidden tabs stop all active/scheduled app audio and reject new effects or speech. Returning does not replay stopped speech. Game progression remains unchanged.
- Live Play/View games have no review border. Historical navigation pauses View automation; border appears only in historical positions or explicit preview. Review border fills viewport when evaluation bar is absent.
- New-game setup offers Furigoma, 上手 Sente or 下手 Sente; explicit sides start directly. Difficulty and strategy dropdowns appear only in setup, removed from top bar.
- Add mode navigation, route, translations, pause/resume and new-game controls.
- Automate both sides with existing strength settings; discard stale results when paused, navigating, restarting or leaving.
- Disable spectator piece moves; keep camera control independent of bot turns.
- Retain animations, promotions and landing sounds. Handle terminal outcomes and engine errors.
- Run aggregate existing TypeScript/build verification. Browser verification requires a reachable existing server; localhost:5173 refused connection. Do not start a server against standing instructions.
- Place View after Tesuji in mode navigation. Remove remaining Workshop UI namespace and CSS prefixes consistently, retaining persistent setting keys.
- Include usual per-move coach review, evaluation, graph and arrows. Wait for each review before continuing. Separate difficulty controls for 上手 and 下手.
- Show each bot's assigned Sente/Gote beside its controls after furigoma; leave sides unassigned before the toss.
- Separate setup bot rows with vertical spacing. End-game thanks on user victory or decisive Bot-vs-Bot result; cancel queued or playing victory speech when restarting or opening new-game setup.
- Show setup dialog on View entry and restart. Start button initiates furigoma; never toss on entry. Assign 上手's side from the result, then start automatically 2.5 seconds after settling. Keep the finished game paused until restart.
- Extend avatar shader occlusion so leaning heads cannot cover the board, including free-camera mode; retain moving arms/hands.

- Bot furigoma includes baked Zundamon intro and pawn/tokin count with 上手 side announcement in 2D and 3D. Preserve contact sounds.

- Participant names are 上手/下手 throughout controls, board labels and furigoma speech; Sente/Gote remains separately assigned. Victory speech requires a live transition and never runs on restored finished games.

## Skill coverage
Brainstorming SKILL.md read 1–EOF, bounded path. Explicit feature request and existing flow settle design; user authorization controls execution without another approval gate.

## State
Implemented separate spectator automation, navigation and controls. Renamed source UI classes to app- and root app-shell, merged Workshop translations into app namespace. Existing game/settings storage keys retained. View skips session persistence and mode snapshot storage; saved-game/rating-save controls excluded. Removed board-shaped ray cutout. Free-camera proximity fade uses actual animated head position, preserves moving hand, and restores avatar when zoomed out. Aggregate TypeScript and production build passed. No browser proof because existing local server is unavailable.

## Next action
No further implementation requested. Rewind replay is implemented and TypeScript passed; current changes are being synchronized to upstream. Browser visual/audio behavior remains unverified because existing server is unavailable.

## Correction
- Source: supplied near-avatar screenshot and explicit manual Start workflow.
- Mistake: board-footprint clipping substituted for existing proximity fade; mode entry initiated toss.
- Rule: fade obstructing near avatar smoothly and restore at distance; keep setup separate from furigoma.
- Action: restored proximity-driven free-camera fade, added shared bot setup dialog, gated initial playback.
- Coverage: get-your-shit-together SKILL.md read 1–EOF (27 lines).
- Verification: aggregate TypeScript passed. localhost:5173 connection refused; browser behavior unverified.
