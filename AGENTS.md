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
- Run `node scripts/check-design-system.cjs` before delivery. Report conflicts with interaction requirements separately; design rules are not permission to change flows or framework.

This cleanup does not certify that every legacy screen already meets every design-system rule. It removes the mechanisms that blocked ordinary design-system styles from applying.
