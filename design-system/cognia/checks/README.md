# Cognia design check

`check-project.cjs` checks a project's screens against this plugin. It has no rules of its own: it reads them from `design-system/*.md`, `assets/globals.css` and `assets/logos/` every time it runs. Change a rule in the plugin and every project that runs the check follows it on its next push.

## What it checks

**In the source (CSS files, `<style>` blocks and inline styles)**

| Rule | From |
|---|---|
| No hardcoded colours. Text uses foreground tokens, never accent or surface tokens. Status colours only in badges, alerts, data values (named value, rate, metric, score or delta) and destructive buttons. No opacity on readable text. | `typography.md`, `themes.md`, `accessibility.md` |
| Font sizes use `--text-*` tokens on the type scale. Only the scale's weights. Open Sans only. | `typography.md` |
| Padding, margin and gap on the 8 point scale | `spacing.md` |
| Border radius 8px or full | `spacing.md` |
| Shadows only from the shadow tokens | `spacing.md` |
| Bold (700) only with a title size, in CSS and in `font-bold` classes in screens and scripts (`scripts` in the config) | `typography.md`, Type scale |
| No shadow on inputs, selects, textareas or buttons (focus rings from `--ring` excepted) | `components.md`, Input field, Button |
| No border on input fields, search fields or select triggers | `components.md`, Input field |
| No border on a selector that styles a card (`.card`, `.*-card`) | `components.md`, Card |
| Transitions 200ms, no custom delays or easing, no animating layout properties (decorative infinite loops are exempt) | `motion.md` |
| z-index on the documented scale | `z-index.md` |
| Logos are the plugin's files, unchanged, and never restyled | `components.md`, Logo |
| No inline font or colour styles | `DESIGN.md`, global rules |
| The project's token copy matches `assets/globals.css` | `DESIGN.md` |
| The project's copy of `assets/components.css` is identical to the plugin's (set `componentsCopy`) | `components.md`, Plain HTML prototypes |
| The project's copy of `assets/components.js` is identical to the plugin's (set `componentsScriptCopy`) | `components.md`, Dropdown Menu |

**On each rendered screen (needs Playwright)**

| Rule | From |
|---|---|
| Text sizes on the type scale (or the project's profile), at most 3 sizes and 3 weights | `typography.md`, Limits per screen |
| Each weight only at the sizes the type scale gives it: 700 only on titles, 600 only on Heading and the Strong rows (the header shell follows its own spec) | `typography.md`, Type scale |
| No shadow on any field, select trigger or button, and no border on any field, including the wrapper that draws a search field or input group | `components.md`, Input field, Button |
| Open Sans | `typography.md` |
| WCAG AA contrast: 4.5:1, or 3:1 for 18px+ or 14px+ bold | `accessibility.md` |
| Header with no background, border or shadow, and a 2px `--brand-coral` underline on the selected item | `components.md`, Navigation shell |
| Footer with no background, a top border and the standard items | `components.md`, Footer |
| Page on `--background` | `components.md`, Navigation shell |
| Cards have no border or outline (selected cards use the `--accent-100` fill). This includes anything that looks like a card whatever its class: a rounded box (not a pill) at least 120 by 56px with a border on all four sides | `components.md`, Card |
| No grey lines between content: no separator, `<hr>` or one-sided border outside a list, the shell and form controls (exempt things like a timeline's "now" line with `lineExempt`) | `DESIGN.md`, Global rules |
| No dot, bullet or pipe between pieces of content on one line | `DESIGN.md`, Global rules |

## Using it in a project

1. Add `cognia-design.config.json` at the project root:

```json
{
  "screens": ["project/*.dc.html"],
  "styles": ["project/**/*.css"],
  "exclude": ["project/ds/cognia/tokens.css"],
  "tokenCopy": "project/ds/cognia/tokens.css",
  "componentsCopy": "project/ds/cognia/components.css",
  "componentsScriptCopy": "project/ds/cognia/components.js",
  "logos": { "project/assets/cognia-logo.svg": "logo.svg", "project/assets/cognia-emblem.svg": "C.svg" },
  "logoSelectors": [".logo"],
  "chartSelectors": [".chart-label"],
  "iconSelectors": [".stat-ic"],
  "ignoreTextIn": [".visually-hidden"],
  "lineExempt": [".timeline-now"],
  "profiles": [
    { "name": "Admin screens", "whenContains": "admin-type.css", "typeSizes": [24, 16, 14], "forbidTokens": ["--text-subheading"] }
  ],
  "shellExempt": ["screens/student-*.html"],
  "shell": {
    "header": "header",
    "footer": "footer",
    "page": "main",
    "footerText": ["Cognia, Inc. All rights reserved.", "English", "Help & Support", "cognia.org"]
  },
  "baseline": "cognia-design.baseline.json"
}
```

A profile narrows the plugin's rules for a group of screens (it can never widen them). `iconSelectors` names icon classes that are not `svg`, `.icon` or `*-icon`, so they may take the accent or a status colour (components.md, Icon). `shellExempt` lists learner full-screen flows that skip the header and footer (components.md, Navigation shell). The contrast check reads what is painted under the text, so text inside an svg shape such as a gauge circle is measured against the shape. `chartSelectors` marks text inside scaled charts, whose source sizes are in chart units; their on-screen size is still checked.

2. Record the project's existing issues once, from the project root:

```bash
npm i --no-save playwright && npx playwright install chromium
node <plugin>/skills/cognia-design/checks/check-project.cjs --update-baseline
```

3. Run the check before every push, and in CI before anything reaches `main`:

```bash
node <plugin>/skills/cognia-design/checks/check-project.cjs
```

It fails on any new issue, or any increase in a known one. When issues are fixed it says so: run `--update-baseline` to lock the lower count in. Never raise the baseline to make a change pass; fix the change instead.

`--static-only` skips the rendered checks when Playwright is not available. It misses anything only visible on the rendered page, such as a border on a tile with its own class name or a shadow on a search field's wrapper, so run the full check before sharing a screen.
