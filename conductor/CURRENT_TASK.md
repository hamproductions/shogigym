# Current task

## Scope
Fix inconsistent Japanese sidebar typography and provide clear AI engine loading/error recovery. User reports deployed engine recovered itself; preserve working initialization. Workspace main at ebb9230 includes prior pushed spectator/refactor changes. Current request authorizes committing and pushing these fixes to main for deployment. No server/system/audio changes or new tests authorized.

## Evidence
- Failing URL supplied: https://hamproductions.github.io/shogilab/view . Deployed navigation redirects to /view/ and returns no COOP/COEP headers; isolation depends on existing service worker.
- Supplied sidebar screenshot shows larger heavy Mincho mode/settings labels mixed with small sans tool labels. rail.css applies app-ja typography separately.
- Existing engine has startup/handshake/search timeouts and error status. AI panel previously displayed analysis pending even after failure; isolation errors had no reload action.

## Changes
- Sidebar labels use shared sans font, compact size and bold weight; Japanese mode labels no longer use display Mincho or seal spacing.
- Engine status explicitly tracks loading; startup completion/failure clears it. Header and AI panel expose loading state.
- Failed engine panel displays real error with Retry; unsupported isolation shows Reload page.
- View retry clears error state without accidentally pausing playback; successful engine reboot clears stale View errors.
- Root/service worker initialization unchanged after user reported recovery.

## Verification
Agent-browser SKILL.md 1–EOF (52 lines) and CLI core guide read fully. One isolated muted session used. Production navigation succeeded but subsequent eval context was about:blank; no app-runtime proof claimed. TypeScript, lint, data validation and production build with /shogilab/ base passed. Diff whitespace checks passed. Owned browser closed; no active sessions remain.

## Next action
Commit and push verified source changes to main. Browser visual/recovery behavior remains unverified against this source.
