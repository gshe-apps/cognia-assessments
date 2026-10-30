# CAP design authority

Use the installed Cognia Design 1.2.0 skill for all CAP UI work. Its documented tokens, type scale, components, spacing, themes and logos take priority over legacy prototype appearance. Read the complete skill documentation before implementation.

The user authorized removing historical visual locks and bringing existing screens into the design system. Do not treat an earlier approval of colour, typography, card styling, header backgrounds or CSS as a reason to retain a conflicting visual rule. Preserve approved navigation destinations, step order, interactions, validation, data, persistence and permissions. Do not publish or push without explicit user approval.

## CSS ownership

- `project/ds/cognia/tokens.css` is the upstream Cognia token copy for the plain-HTML runtime, with only the Tailwind build import omitted. Refresh it from the plugin; do not tune its token values manually.
- `project/ds/cognia/colors_and_type.css` exposes the existing HTML typography/spacing aliases and documented semantic classes.
- `project/ds/cognia/components.css` supplies documented semantic helpers and low-specificity shell defaults.
- All historical screen/module CSS belongs to the `cap-legacy` cascade layer. Normal semantic styles outside that layer win without needing extra specificity.
- Never reintroduce artificial ID selectors, visual `!important` declarations, inline font/colour locks or overrides of canonical tokens on individual screens.
- Existing `!important` declarations are restricted to functional visibility/pointer safeguards and reduced-motion accessibility. Keep those safeguards when restyling.
- New components should use semantic classes/tokens. Do not append another high-priority “fix” layer to `cognia-approved-ui.css`.
- Run the cognia-design plugin check (`node <plugin>/skills/cognia-design/checks/check-project.cjs`, from the repo root) and `node scripts/check-design-system.cjs` before delivery.

## Admin type scale

District and School administrator screens (any screen that loads `admin-type.css`) use exactly three sizes from the plugin's type scale:

- 24px Heading (`--text-heading`, semibold): page titles, section headings, headline numbers
- 16px Body Base or Body Strong (`--text-body-base`): card and panel titles, body copy
- 14px Body Small (`--text-body-small`): everything else, including chart labels as they appear on screen

Rules:

- Load the cognia-design plugin skill before changing any screen, and follow it over legacy styling.
- Never use `--text-subheading` (20px) on admin screens.
- Never write inline font sizes (`style="font-size: ..."`). The canvas properties panel adds these when text is resized there, so make type changes in code, not in the panel.
- Use tokens, not raw `px` sizes. Known legacy `px` sizes are recorded in `cognia-design.baseline.json`; replace a screen's ones whenever you touch it.
- Numbers inside scaled charts (bubbles, waves) must still appear at 24, 16 or 14px on screen. Where a 24px value does not fit the shape, use 16px semibold.
- If a screen seems to need a fourth size or weight, simplify the content or ask the designer. Report conflicts with interaction requirements separately; design rules are not permission to change flows or framework.

This cleanup does not certify that every legacy screen already meets every design-system rule. It removes the mechanisms that blocked ordinary design-system styles from applying.

## Cognia design plugin check

The rules and the checker live in the plugin (`gshe-apps/cognia-design-plugin`), not in this repo. This repo only holds:

- `cognia-design.config.json`: where the screens and styles are, the admin type profile, and the header and footer selectors.
- `cognia-design.baseline.json`: known legacy issues. The check fails on any new issue or any increase. When you fix issues, run the check with `--update-baseline` to lock the lower counts in. Never raise the baseline to make a change pass.
- `design-system/cognia/`: a read-only copy of the plugin's rules for reference. CI fails if it differs from the plugin, so update it by copying from the plugin, never by editing it here.

GitHub runs the check against the latest plugin on every push and pull request, and the deploy to GitHub Pages waits for it to pass.
