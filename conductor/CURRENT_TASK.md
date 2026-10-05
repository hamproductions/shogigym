# Current task

## Scope and authorization
- Add localized PWA installation action to existing rail/space-dependent Others overflow. Native install prompt when supported; manual Home Screen/Dock instructions otherwise; hide action in installed app. Minor release and push authorized; use existing release workflow.
- Finish detector integration using original upstream fixtures, and generate recorded speech for all emitted Bioshogi definitions; missing voice coverage is implementation work, not a completed integration.
- Correction gate: prior status understated unfinished voice coverage. Detector parity must use upstream assertions; voice coverage must reconcile generated manifest with detector names.
- Correct latest screenshot regression: captured pieces float beside empty stands and the drop arrow originates from the displaced hand piece; trace responsive stand layout/piece synchronization before editing.
- Automatically persist compact book shards in IndexedDB when fetched; no separate compact download button. Full Peta remains an optional download with progress, cancellation and recovery.
- Complete the Bioshogi analyzer port, including custom detection; do not claim the existing declarative adapter is complete.
- Implement larger evaluated joseki coverage using the supplied Peta 233 release; keep initial loading small.
- Default AI strategy is random, resolved once per game. Explicit No strategy uses engine search exclusively.
- Use Bioshogi declarative rules for strategy/castle tagging; suppress formation announcements after opening combat while retaining check and tesuji speech.
- Preserve the released v1.2.0 UI/camera/audio behavior. Original upstream fixture verification explicitly requested. Minor bump, commit and push authorized. No screenshots, server launches or device/system changes authorized.
- User-provided source set: akicho8/bioshogi, shogidb2/joseki, shogi-joseki.com/kisyo.html, YaneuraOu new_petabook233 release and fgfan7 2017-02-09 article.

## Implementation
- scripts/build-opening-book.ts indexes the extracted native Peta file in temporary SQLite, seeds existing lesson positions and traverses stored branches. Generated subset: 24,000 positions, 359,722 evaluated moves, 64 shards, about 7 MB.
- src/utils/bookPosition.ts shares position normalization, 180-degree position/move rotation and shard hashing between builder and runtime.
- src/utils/openingBook.ts reads compact shards from IndexedDB before a four-second network request, retains at most eight decoded shards and validates moves. Invalid cached JSON is removed; failed requests remain retryable.
- Compact shards persist automatically in IndexedDB when fetched; separate compact download button removed. src/utils/bookDownload.ts and EngineSettings offer optional full download, progress and cancel. Full download caches verified compressed chunks in IndexedDB for resume, decompresses with native DecompressionStream, installs a Blob database and removes temporary chunks after successful installation.
- scripts/build-full-book.mjs packages the entire original Peta database as 59 gzip chunks: 98,988,484 download bytes, 493,157,464 installed bytes. Full assets are optional, same-origin and excluded from the service-worker cache to prevent duplicate retained storage.
- MovesPane displays history-derived formation/tactical tags. Announcements distinguish techniques from castles and retain the opening-only formation speech gate.
- src/utils/book.ts ranks strategy-compatible lesson alternatives by Peta evaluation, extends coverage on lesson misses and falls back to the engine when no usable book move exists. Compact-book lookup stops after 48 played plies.
- Play/View await book selection with cancellation checks; No strategy bypasses book lookup. Engine search cache separates book-enabled playing searches from analysis/search-only results.
- Settings optionally imports an extracted YaneuraOu .db into IndexedDB; full file loads into the native engine only on book-enabled search. Rotated native searches preserve move history and rotate PV/bestmove back. Removal/restart provides recovery.
- Shared binaryStore handles eval/book persistence, stores new files as Blobs, supports old stored Uint8Array evaluation files and waits for transaction completion before reporting success.
- Bioshogi detection now includes shape, custom, motion/history and finalization adapters. Pinned upstream fixture harness is scripts/check-bioshogi.ts; final parity checks remain active. Import/save/load retains declared handicap metadata. Finished-game tags require known outcome.
- Voice build includes all Bioshogi definition names plus existing phrases. All 573 required phrases have manifest entries and nonempty files; every manifest audio file decoded through ffmpeg successfully. No speaker playback or device audio changes performed.
- Formation history uses a bounded active-game cache; labels survive later shape changes, outlines require current shape. Announcement opening gate tolerates pawn/bishop exchanges and stops after other captures.
- README documents behavior, reproduction, imports and licenses. Bioshogi AGPL license/adaptation notice retained in vendor/bioshogi; Peta subset carries MIT notice/source metadata.

## Skills
- handing-off-pro-max SKILL.md read 1–EOF for requested wrap-up. Canonical record retained as compact continuation authority; no separate expanded documentation requested.
- look-at-the-screen SKILL.md read 1–EOF; latest supplied screenshot inspected at original resolution. Visible mismatch recorded above; no visual completion claim until matching runtime inspection.
- get-your-shit-together SKILL.md read 1–EOF. Correction gate: module-owned DOM synchronization and shared singleton handlers were inappropriate for SSR/HMR; synchronization now belongs to a client effect with cleanup, and i18n owns a fresh instance.
- lean-build SKILL.md read 1–EOF; bounded integration uses existing Play/View, Settings and engine seams.

## Evidence
- Executed actual shipped YaneuraOu WASM through Node: native book options available; FlippedBook absent.
- Native engine loaded an actual subset-derived .db with one thread and 16 MB hash; BookEvalDiff=0 reduced the start-position alternatives to the two tied best moves and returned 7g7f.
- bun run check passed with lint and current Node-version warnings. No new test files created.
- localhost:5173 unavailable. Browser UI, IndexedDB import and physical iPad performance remain unverified; no server/browser launched.
- All 359,722 subset moves passed legality for both original and rotated sides; shard hashing and rotation round trips passed. Largest shard is 173,734 bytes. Bioshogi fixture matched 四間飛車 ply 9, 美濃囲い ply 19, 腰掛け銀 ply 12 and 箱入り娘 ply 26; rewind/replay did not leak or lose future tags.
- Production build passed before the boot correction. Development SSR i18n import and language changes pass without document; real React Router development requests for /play, /view and /analyze return HTTP 200. Middleware-only Vite harnesses closed cleanly; no listening server or file watcher started.
- Deferred native import sequence and rotated White history produced an actual book hit after preserving the original White evaluation threshold: 28 stored moves filtered to the two best choices, returning 2g2f in rotated coordinates.
- Owned Peta archives, expanded native files and SQLite index removed after verification; generated compact/full assets and source/license metadata remain.
- Full gzip assets independently reconstructed through native DecompressionStream: all compressed hashes, chunk sizes and concatenated original SHA256 match. Browser download/IndexedDB UI remains unverified because localhost:5173 is unavailable and server launches are not authorized.

## State and immediate next action
- Release scope: all current implementation and PWA install action, from v1.2.0 to v1.3.0 on main. Latest origin/main fetched with zero divergence before release.
- Renderer fixes: responsive hand relayout cancels obsolete hand targets; capture clone keeps grain; preview bake avoids global live-texture invalidation; promoted face resources prewarm and mesh remains visible during avatar reach. Source/diff and TypeScript verified; browser/iPad visuals unverified.
- Existing localhost:5173 unavailable; no server launch authorized. No browser runtime claim.
- Completed local verification: `UV_THREADPOOL_SIZE=2 GOMAXPROCS=2 bun scripts/check-bioshogi.ts` passed 129,482 assertions with zero failures across 535 original fixtures and 535 actual Ruby mirrored outputs. Includes accumulated player tags, exact move annotations, finalization, voice-name coverage and original position equality. Log: /tmp/shogigym-bioshogi-final.log. Mirrored expectations use Ruby output because MagicSquare is color asymmetric; no symmetry exception or skipped fixture.
- `UV_THREADPOOL_SIZE=2 GOMAXPROCS=2 bun run check` passed lint, Prettier, route type generation and TypeScript; existing lint/Node-version warnings remain. Log: /tmp/shogigym-check.log. `UV_THREADPOOL_SIZE=2 GOMAXPROCS=2 bun run build` passed production compilation and prerender; log: /tmp/shogigym-build-final.log. `git diff --check` passed. Owned foreground checks exited; no listener/browser launched.
- Production importer verified through closed middleware-only Vite SSR: held-king metadata retained and White-start winner correct. No listening server or watcher retained.
- Temporary upstream Ruby checkout/dependencies live under ignored external/bioshogi-oracle; original fixtures/oracle/build scripts remain project-owned reproducible artifacts. External checkout excluded from Git/lint/format to avoid processing upstream dependencies.
- Local implementation wrapped up. Remaining runtime verification: actual UI IndexedDB download/recovery, full 493 MB native engine load, renderer promotion/stand layout on browser/iPad, and audible pronunciation/playback. Requires a usable authorized runtime; current localhost unavailable. Next action when runtime is available: verify Settings full-book download/recovery and Play/View book hits, then promotion/capture portrait layout. v1.3.0 released through capped release:minor; implementation and release commits plus tag pushed. Mobile panel follow-up included in the same authorized delivery.

- PWA install action follows existing rail overflow, hides in installed app, opens native prompt or localized browser instructions. Targeted TypeScript, oxlint, Prettier and diff checks passed; actual native browser prompt remains unverified.

- Mobile panel follow-up: move grid columns allow shrinking, notation/rating symbols do not wrap, annotations occupy bounded separate lines, mobile advantage block uses compact typography/grid, shared SVG icons cannot shrink. TypeScript, targeted lint and diff checks passed; no runtime visual claim.
