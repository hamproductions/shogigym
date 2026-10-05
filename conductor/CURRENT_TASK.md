# Current task

## Scope and authorization
- Add Settings About with package version, repository, changelog and credits links.
- Rename GitHub repository to shogigym and update README and Pages references.
- Repository rename completed; current request authorizes committing and pushing the source changes.
- Version remains 1.0.1. No servers, system changes, new tests or delegates.

## Completed
- Settings About replaces the small General footer; English and Japanese labels added.
- README refreshed: current About location, release workflow, source-cited features and new Pages URL.
- Canonical metadata and sitemap/robots generation use /shogigym.
- GitHub repository rename verified as hamproductions/shogigym; Pages API reports the new URL. Local origin updated with existing SSH alias.

## Verification
- Lint, formatting and TypeScript checks passed; existing warnings remain.
- Production build with BASE_PATH=/shogigym/ passed. Generated HTML, sitemap and robots checked for new URL.
- Diff whitespace clean. Browser verification unavailable; no server started.

## Delivery
Source changes verified and ready to commit and push to main. The push triggers the Pages workflow for the renamed base path; deployment completion remains separate from Git synchronization.
