# Cognia Design 1.2.0 — CSS authority

Source: installed `cognia-design` 1.2.0 plugin, matching upstream commit `259b8f5c98dbc9f26d2591b617d6d53a8f037761`.

`tokens.css` copies the plugin's `assets/globals.css` with its build-only Tailwind import removed, as required by the plugin's plain-HTML instructions. Token values are otherwise unchanged. `colors_and_type.css` imports those tokens and retains the existing HTML aliases and semantic typography classes; `components.css` contains documented semantic helpers and low-specificity shell defaults.

All historical CSS is now in `@layer cap-legacy`. Semantic classes outside that layer have priority independent of selector specificity or stylesheet load order. Do not use visual `!important`, fake `:not(#id)` selectors, inline typography/colour styling or per-screen canonical token overrides. Keep functional hidden-state and reduced-motion protections.

Typography still requires a deliberate choice of at most three documented sizes and three weights on each screen, including visible overlays. A plugin supplies rules, not a runtime compiler; newly generated markup must use those roles. This cleanup removes blockers and does not claim that every old screen has been fully redesigned.
