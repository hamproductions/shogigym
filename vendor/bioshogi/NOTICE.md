# Bioshogi formation adapter

Source: https://github.com/akicho8/bioshogi
Revision: 6af8674c32d80af755d9aeffd0621d3b9f615b5e
License: GNU Affero General Public License version 3; see LICENSE.

Modified on 2026-10-05: declarative strategy/castle shapes and restrictions extracted to src/data/formations.json, with TypeScript detection adapters in src/utils/formationTags.ts, src/utils/bioshogiCustom.ts and src/utils/bioshogiMotion.ts, and extraction script scripts/build-formations.mjs. The port includes custom, motion/history and finalization detection. Pinned upstream detection fixtures are retained for regression verification. The Ruby runtime and unrelated notation/export APIs are not included. Corresponding source is available at https://github.com/hamproductions/shogigym.
