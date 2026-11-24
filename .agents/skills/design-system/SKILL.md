---
name: design-system
description: Apply the current Cognia design system to any Cognia screen, page, modal, flow, component, visual refinement, or implementation. Invoke explicitly with $design-system before designing, building, or reviewing UI in cognia-assessments.
---

# Cognia design system

Apply this guardrail to the user's requested UI work. It is not a separate design system. The source of truth is `gshe-apps/cognia-design-plugin`, with a synced local reference in `design-system/cognia/`.

## 1. Read the authority before touching UI

- Read `AGENTS.md` and `design-system/cognia/SKILL.md`. Follow all design documents that the latter requires, especially `design-system/cognia/design-system/components.md`, the typography, spacing and forms rules, and its reference gallery.
- Check `cognia-design.config.json` and the existing screen or flow for the exact shell, components, CSS ownership, states and interaction patterns.
- Treat current plugin rules as higher priority than legacy screen styling or prior visual conventions. Preserve approved flow, navigation, validation, functionality and content unless the user requests a change.

## 2. Check upstream freshness

- The canonical evolving source is `https://github.com/gshe-apps/cognia-design-plugin/tree/main/skills/cognia-design`. A copy committed in this project is a snapshot, not an automatically updating live link.
- If a readable source checkout exists at `$COGNIA_PLUGIN_PATH` or `~/cognia-design-plugin`, fetch the source's latest `origin/main` and compare with the local checkout. Update only by a safe fast-forward on a clean checkout; never discard local edits.
- Run `node scripts/sync-design-system.cjs --check`. If an updated source checkout is available and the copy is stale, use `node scripts/sync-design-system.cjs` to synchronize the plugin assets and rules, never copy or edit the files manually.
- If the upstream source is unavailable or cannot safely be updated, use the latest checked-in `design-system/cognia/` reference and explicitly say that upstream freshness could not be verified. Never claim it is up to date without checking.

## 3. Design and implement strictly within the system

- Reuse documented tokens, variants, iconography, navigation shell and shared component classes from the plugin. For HTML use `project/ds/cognia/cognia-components.css` and `.js`, never reimplement a shared component locally.
- Use only the existing flow stylesheet for layout: `project/educator.css`, `project/admin.css`, or `project/stu2.css`. Do not create any new `.css` file. Do not hand-edit the synced token or component CSS.
- No invented colours, typography scales, spacing values, borders, radii, shadows, custom button/card/input styles, new component variants, ad hoc inline style overrides or competing design patterns.
- Do not create a new component when a documented one serves the same purpose. If the required pattern or variant truly does not exist, identify the gap and request its addition in the canonical plugin before implementing it.
- Use the established top navigation for CAP screens, not an invented sidebar. Keep work minimal and scoped to the screen and interactions requested.

## 4. Verify before delivery

- Run `node design-system/cognia/checks/check-project.cjs`, `node scripts/check-design-system.cjs`, and `node verify-homepages.cjs` from the repository root. Also inspect the affected screen visually and check relevant interactions when available.
- Resolve new design-rule violations. Do not increase `cognia-design.baseline.json` to hide problems, change a read-only plugin copy by hand, or add specificity hacks.
- Summarize which shared components were reused, whether plugin freshness was verified, what changed, and which checks passed or could not run.
- Do not push, merge, or deploy unless the user expressly asks.
