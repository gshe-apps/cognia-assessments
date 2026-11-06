# CAP design-system authority

Read and follow `AGENTS.md` and the Cognia rules in `design-system/cognia/SKILL.md`. The latest cognia-design plugin takes precedence over historical visual styling. The user authorized removing visual locks; preserve interaction behaviour and approved flows. Do not reinstate visual `!important` rules or artificial ID specificity. Do not push or deploy without explicit user approval.

Admin screens use only the plugin's 24 / 16 / 14px type scale: no `--text-subheading`, no inline font sizes, tokens over raw px (see `AGENTS.md`, Admin type scale). Before finishing any screen change, run the cognia-design plugin check from the repo root (`node <plugin>/skills/cognia-design/checks/check-project.cjs`) and `node scripts/check-design-system.cjs`. The rules live in the plugin; never raise `cognia-design.baseline.json` to make a change pass.

## Shared components (6 November 2026)

Every screen builds its components from `project/ds/cognia/cognia-components.css`, a read-only copy of the cognia-design plugin's `assets/components.css`. The plugin's `assets/components-reference.html` shows every component and variant.

- Use the shared classes: `btn` (with `btn-outline`, `btn-ghost`, `btn-destructive`, `btn-lg`, `btn-sm`, `btn-icon`), `card` with `card-content` (or `card-ghost` for charts), `badge` variants, `input`, `textarea`, `label`, `field`, `tabs-list` and `tab` (toggle groups too, with `aria-pressed`), `dialog`, `menu`, `table` and the `shell-*` header and footer classes.
- Never restyle these classes in a screen or legacy stylesheet, and never edit the copy. The plugin check fails if the copy differs from the plugin.
- Do not create stylesheets. `node scripts/check-design-system.cjs` fails on a new stylesheet file or a screen that links a stylesheet it did not link before. `scripts/stylesheet-lock.json` may only shrink.
- If something is missing (a component, a variant, a toggle style), ask the designer to add it to the plugin. Patterns still waiting for a spec: test cards, answer options, number chips, fraction boxes, filter chips, day pickers, steppers, pagination, stat tiles, the hub window and the item editor dialogs.
- Legacy class names such as `solid`, `ghost` and `small` stay on some elements only as markers for scripts. They carry no styling of their own.
