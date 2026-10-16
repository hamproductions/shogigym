# Park UI / Panda v2 CSS migration spec

Status: complete. Every hand-written stylesheet has been converted; this spec remains the reference for writing new styles.

Rules for converting an area's hand-written CSS to Panda. The project rules in `CLAUDE.md` ("Styling system" and every layout rule above it) still apply in full; a conversion changes how styles are written, never what the user sees.

## Outcome per area

- Every rule in the area's CSS files is reproduced with Panda, then the CSS file and its `import` are deleted.
- Rendered output matches before/after at desktop (1400×900), phone (390×844) and tablet portrait (820×1180), light and dark, including hover, focus, disabled, open/closed and every state class the CSS styled.
- `bun run check` passes (prefix `RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1`).

## How to write styles

- Prefer Panda JSX from `styled-system/jsx` with style props (`jsxStyleProps: 'all'`): `Box`, `Flex`, `HStack`, `VStack`, `Stack`, `Grid`, `Wrap`, `Center`, `styled.button`, etc. Use `css({...})` from `styled-system/css` when an existing element or third-party component only accepts `className`.
- A style object reused in three or more places in the area becomes a `cva`/`sva` in the area's own file (`*.styles.ts` beside the component). Do not edit `src/theme` or `panda.config.ts`; if a token or recipe is genuinely missing, report it instead.
- Use components from `@/components/ui` and `@/app/ui` instead of rebuilding them: `Text` (tone/size/font), `Kbd`, `Input`, `Field`, `Checkbox`, `Switch`, `Select`, `Slider`, `Badge`, `Button`, `Dialog`, `Tabs`, `SegmentGroup`, `FilePicker`.
- Styles must be static for extraction: literal values or ternaries between literals. Never build style keys or values at runtime. Dynamic numbers go through CSS variables set in `style={{ '--x': value }}` and read as `'var(--x)'`.
- Selectors for state use conditions: `_hover`, `_focusVisible`, `_disabled`, `_open`, `_selected`, `_checked`, `_on` (aria-pressed), `_dark`, `_light`, plus custom ones below. Descendant selectors need `&`: `'& svg': {...}`.
- Keep accessible names, roles, `aria-*`, `data-*` hooks used by tests or JS, and every `className` that JavaScript queries (`querySelector`, `closest`). Grep before removing a class.
- Do not name props of app components after CSS properties (`appearance`, `position`, `color`, `content`, `order`), because Panda extracts them as style props.

## Breakpoint conditions

| Legacy query | Condition |
|---|---|
| `(max-width: 820px), (max-width: 1024px) and (orientation: portrait)` | `_compact` |
| `(max-width: 820px)` | `_narrow` |
| `(max-width: 820px), (max-height: 660px)` | `_tight` |
| `(max-height: 520px) and (min-width: 821px)` | `_short` |
| `(max-width: 560px)` | `_phone` |
| `(pointer: coarse)` | `_coarse` |
| `(prefers-reduced-motion: reduce)` | `_motionReduce` |
| any other `@media`/`@container` | literal key, e.g. `'@media (max-width: 360px)': {...}`, `'@container (max-width: 420px)': {...}` |

## Token mapping (legacy custom property → Panda token)

- Surfaces: `--surface-0..3` → `surface.0..3`, `--panel` → `panel`, `--card` → `card`, `--card-hover` → `card.hover`, `--field` → `field`, `--overlay` → `overlay`, `--scrim` → `scrim`, `--pattern-ink` → `pattern.ink`, `--stage-glow` → `stage.glow`.
- Text: `--text` → `fg.default`, `--text-muted` → `fg.muted`, `--text-faint` → `fg.subtle`, `--text-inverse` → `fg.inverse`.
- Lines: `--border` → `border`, `--border-strong` → `border.strong`; in shorthands write `'1px solid {colors.border}'`.
- Accent/status: `--accent[-hover|-text|-contrast|-soft]` → `accent[.hover|.text|.contrast|.soft]`; `--success[-soft|-fill|-strong]`, `--warning[-soft]`, `--danger[-soft|-fill|-strong]`, `--info[-soft|-fill]` → same names with dots; `--highlight` → `highlight`; `--focus` → `focus`; `--meter-fill/track` → `meter.fill/track`.
- Modes and fills: `--mode-*` → `mode.*`, `--on-fill` → `onFill`, `--on-fill-soft` → `onFill.soft`.
- Pieces/board: `--koma-light/dark/ink/red` → `koma.*`, `--kaya-light/dark` → `kaya.*`; primitives `--sumi-*`, `--hai-*`, `--washi-*`, `--kin-*`, `--rokusho-*`, `--ai-*`, `--murasaki-600`, `--bengara-600` → `sumi.*`, `hai.*`, `washi.*`, `kin.*`, `rokusho.*`, `ai.*`, `murasaki.600`, `bengara.600`; `--shu-600/500` → `accent`, `--shu-700` → `accent.hover`, `--shu-300` → `accent.text` in dark (or the raw hex inside `[]` only if a fixed colour is required); `--kinari` → `kinari`, `--gofun` → `gofun`.
- Shadows: `--shadow-sm/md/lg` → `sm/md/lg`, `--shadow-sheet` → `sheet`, `--shadow-koma` → `koma`, `--wood-sheen` → `wood`.
- Type: `--font-sans/mincho` → `sans/mincho`; `--text-2xs..2xl` → fontSize `2xs..2xl`; `--glyph-sm/md/lg` → `18px/24px/30px`; `--leading-tight/snug/normal/mincho` → lineHeight same names; `--weight-regular/medium/bold/heavy` → fontWeight same names; `--tracking-seal` → letterSpacing `seal`.
- Space: `--space-N` → spacing `N` (`half` → `0.5`, `1-5` → `1.5`, `2-5` → `2.5`, `3-5` → `3.5`).
- Radii: `--radius-xs/sm/md/lg/xl` → `xs/sm/md/lg/xl`, `--radius-pill` → `full`.
- Sizes: `--control-sm/md/lg` → `control.sm/md/lg`, `--rail-w` → `rail`.
- Layers: `--z-plate/hud/banner/announce/floating-panel/promote/sheet` → zIndex `plate/hud/banner/announce/floatingPanel/promote/sheet`, `--z-dialog` → `modal`, `--z-menu` → `dropdown`.
- Motion: `--dur-fast/base/slow` → durations `fast/normal/slowest`, `--ease-out` → easing `out`.
- Area-local custom properties (`--tone`, `--label`, `--panel-w`, …) stay as CSS variables set inline or in the style object.

## Shared legacy utilities

These live in `src/styles/base.css` and `src/styles/controls.css` and are removed centrally once unused. Replace usages in the files you own:

- `.app-muted` → `<Text tone="muted" size="sm">` (or `color="fg.muted" fontSize="sm"` on an existing Panda element).
- `.app-actions` → `<Wrap gap="2" align="center">`.
- `.app-nowrap` → `whiteSpace="nowrap"`.
- `.app-short` / `.app-phone-only` / `.app-wide` → `display` with `_compact`.
- `.app-key` → `<Kbd>`. `.app-count` → small `Badge`.
- `.app-field` / `.app-search` → `<Input>`; `select.app-field` → `Select`; `.app-toggle` / `.app-check-row` with checkboxes → `Checkbox` or `Switch`; native `input[type=range]` → `Slider`.
- `.app-setting` rows → `SettingRow` from `@/app/ui/Segmented`.

## Ownership

Each area owns its CSS files and converts the classes they define wherever those classes are used. Do not touch another area's CSS files. Commit per area on your branch with a conventional message and no tool attribution; author is the repo owner configured in git.
