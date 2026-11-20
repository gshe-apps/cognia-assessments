# CAP design authority

Use the [CAP Figma file](https://www.figma.com/design/F4dHxlPbkkc41wE2qbB0Db/Cognia-Assessments-Platform--CAP-) for design context and the [Cognia Design System](https://github.com/gshe-apps/cognia-design-plugin/tree/main/skills/cognia-design) for shared components, tokens, and rules in future CAP designs. The design system's interactive HTML reference is available at `/components/` when the local CAP preview is running.

Use the installed Cognia Design 1.2.0 skill for all CAP UI work. Its documented tokens, type scale, components, spacing, themes and logos take priority over legacy prototype appearance. Read the complete skill documentation before implementation.

The user authorized removing historical visual locks and bringing existing screens into the design system. Do not treat an earlier approval of colour, typography, card styling, header backgrounds or CSS as a reason to retain a conflicting visual rule. Preserve approved navigation destinations, step order, interactions, validation, data, persistence and permissions. Do not publish or push without explicit user approval.

## CSS ownership

- `project/ds/cognia/tokens.css` is the upstream Cognia token copy for the plain-HTML runtime, with only the Tailwind build import omitted. Refresh it from the plugin; do not tune its token values manually.
- `project/ds/cognia/cognia-components.css` is the plugin's shared component copy (see Shared components below).
- `project/admin.css`, `project/educator.css` and `project/stu2.css` are the one layout file per flow. Every screen links the tokens, the shared components and its flow's file, in that order, and nothing else.
- The flow files were merged from 66 older sheets on 6 November 2026, so they still hold legacy visual rules (colours, borders, font sizes). Those belong in the shared components; remove them from the flow file as screens move onto the shared classes, and never add new ones. The target is layout only: position, size, grid and spacing.
- A rule meant for one screen is scoped to it with a marker class, without raising specificity: `:where(:root:has(.marker)) .selector`. Current markers: `ws-frame` (wide educator workspace pages), `od-overview` and `od-assess` (educator Overview and Assessments), `home-previews` (District Home).
- All historical screen/module CSS belongs to the `cap-legacy` cascade layer. Normal semantic styles outside that layer win without needing extra specificity.
- Never reintroduce artificial ID selectors, visual `!important` declarations, inline font/colour locks or overrides of canonical tokens on individual screens.
- Existing `!important` declarations are restricted to functional visibility/pointer safeguards and reduced-motion accessibility. Keep those safeguards when restyling.
- New components should use semantic classes/tokens. Do not append another high-priority “fix” block to a flow file.
- Run the cognia-design plugin check (`node design-system/cognia/checks/check-project.cjs`, from the repo root) and `node scripts/check-design-system.cjs` before delivery.

## Admin type scale

District and School administrator screens (any screen that loads `admin.css`) use exactly three sizes from the plugin's type scale:

- 24px Heading (`--text-heading`, semibold): page titles, section headings, headline numbers
- 16px Body Base or Body Strong (`--text-body-base`): card and panel titles, body copy
- 14px Body Small (`--text-body-small`): everything else, including chart labels as they appear on screen

Rules:

- Load the cognia-design plugin skill before changing any screen, and follow it over legacy styling.
- Never use `--text-subheading` (20px) on admin screens.
- Never write inline font sizes (`style="font-size: ..."`). Make type changes in the flow's stylesheet or the shared components.
- Use tokens, not raw `px` sizes. Known legacy `px` sizes are recorded in `cognia-design.baseline.json`; replace a screen's ones whenever you touch it.
- Numbers inside scaled charts (bubbles, waves) must still appear at 24, 16 or 14px on screen. Where a 24px value does not fit the shape, use 16px semibold.
- If a screen seems to need a fourth size or weight, simplify the content or ask the designer. Report conflicts with interaction requirements separately; design rules are not permission to change flows or framework.

This cleanup does not certify that every legacy screen already meets every design-system rule. It removes the mechanisms that blocked ordinary design-system styles from applying.

## Cognia design plugin check

The rules and the checker live in the plugin (`gshe-apps/cognia-design-plugin`), not in this repo. This repo only holds:

- `cognia-design.config.json`: where the screens and styles are, the admin type profile, and the header and footer selectors.
- `cognia-design.baseline.json`: known legacy issues. The check fails on any new issue or any increase. When you fix issues, run the check with `--update-baseline` to lock the lower counts in. Never raise the baseline to make a change pass.
- `design-system/cognia/`: a read-only copy of the plugin (rules, assets and the checker). Never edit it, or `project/ds/cognia/`, by hand.

Keeping in step with the plugin:

- `node scripts/sync-design-system.cjs` copies the plugin into `design-system/cognia/` and `project/ds/cognia/` (components, script and tokens). It reads the local install in `.cognia-design-plugin/` (not committed) or a plugin folder passed as its argument. `--check` only reports what is out of date.
- After syncing, run the check. Fix anything new; when counts drop, run it with `--update-baseline` so they can't creep back.
- Each clone turns on the pre-commit check once with `git config core.hooksPath .githooks`. It runs the fast static check on any commit that touches the prototype.
- GitHub runs the full check (rendered contrast and layout included) on every push and pull request, and the deploy to GitHub Pages waits for it to pass. GitHub has no access to the private plugin repo, so keeping the copy current is the sync step above: run it whenever the plugin is updated.

## Shared components (6 November 2026)

Every screen builds its components from `project/ds/cognia/cognia-components.css`, a read-only copy of the cognia-design plugin's `assets/components.css`. The plugin's `assets/components-reference.html` shows every component and variant.

- Use the shared classes: `btn` (with `btn-outline`, `btn-ghost`, `btn-destructive`, `btn-lg`, `btn-sm`, `btn-icon`), `card` with `card-content` (or `card-ghost` for charts), `badge` variants, `input`, `textarea`, `label`, `field`, `tabs-list` and `tab` (toggle groups too, with `aria-pressed`), `dialog`, `menu`, `table` and the `shell-*` header and footer classes.
- Never restyle these classes in a screen or legacy stylesheet, and never edit the copy. The plugin check fails if the copy differs from the plugin.
- Do not create stylesheets. Each screen links only the tokens, the shared components and its flow's layout file (`admin.css`, `educator.css` or `stu2.css`). `node scripts/check-design-system.cjs` fails on a new stylesheet file or a screen that links a stylesheet it did not link before. `scripts/stylesheet-lock.json` may only shrink.
- If something is missing (a component, a variant, a toggle style), ask the designer to add it to the plugin. Patterns still waiting for a spec: test cards, answer options, number chips, fraction boxes, filter chips, day pickers, steppers, pagination, stat tiles, the hub window and the item editor dialogs.
- Legacy class names such as `solid`, `ghost` and `small` stay on some elements only as markers for scripts. They carry no styling of their own.
