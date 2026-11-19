# Cognia Design System

This is the entry point for the Cognia design system. Read this file first, then read every file listed below before writing any code.

> `globals.css` lives in this plugin at `assets/globals.css`. Do not edit a project's copy by hand. If something needs to change, change it in the plugin and publish a new version.

---

## Design system files

Read all of these in full before writing any code:

| File | Contents |
|---|---|
| `design-system/typography.md` | Font, type scale, text colour rules |
| `design-system/spacing.md` | 8pt scale, shadows, border radius, responsive layout |
| `design-system/accessibility.md` | Contrast and colour usage rules |
| `design-system/themes.md` | Product themes, dark mode, custom CSS variables |
| `design-system/motion.md` | Transitions |
| `design-system/z-index.md` | Stacking order |
| `design-system/forms.md` | Form layout rules |
| `design-system/components.md` | All component specs |

---

## Global rules

- Use the default visual variant of each component. Use a themed or product-accented variant only when the user explicitly asks for it for that component or surface.
- Use 10% opacity black (`#000000`) over the resting surface for all hover feedback in every theme and mode. Use `--hover-overlay` and keep the foreground at its resting opacity.
- Never use grey lines to separate content. No Separator, `<hr>` or one-sided border (top, right, bottom or left) between sections, cards, rows, metrics, or a card's or popover's parts. Separate content with spacing from the 8 point scale, by grouping it on its own card or `bg-secondary` surface, or with a heading. Lists are the exception: the items of a list (menu items, command items, a settings list) may keep a separator between them. The Navigation shell and Footer keep their documented lines, and tables follow the Table rule (no lines).
- Never put a dot (`·`), bullet (`•`), pipe (`|`) or slash between pieces of content on one line, such as "Grade 5 · Mathematics" or "Formative | Scheduled". Strings of separators read as machine-made. Choose the layout by what the content means:
  - A status or a category: a badge.
  - A label and its value: the label on the left in `text-muted-foreground`, the value right aligned.
  - Context for a title (type, grade, subject, date): subtext above the title.
  - Two separate facts: each on its own line, or each with its own Lucide icon, spaced with the gap scale.

- Always use design system tokens, components, and patterns over hardcoded values. Never hardcode colors, spacing, typography, or UI elements if a system equivalent exists.
- If anything in the design system is unclear or a token/component does not obviously apply to the implementation at hand, stop and ask in the terminal before proceeding. Do not interpret or approximate — ask.

---

## AI instructions

If you are an AI assistant, read this file and all files listed above before writing any code. These rules apply to every task in this project without exception.

- Use only shadcn components from `src/components/ui/`
- Use only variants, typography classes, and spacing values documented in the design system files — if something is not documented, stop and ask in the terminal before proceeding
- Reference all colours via CSS variables — never hardcode hex values
- Apply product theme classes in `layout.tsx` only
- Never edit `globals.css`
- If a component variant, spacing value, or pattern is missing from the design system files, stop and ask in the terminal — do not interpret, approximate, or invent a solution

---

## Getting started

### Code projects (Next.js + Tailwind + shadcn)

1. Copy `assets/globals.css` from this plugin into the project as `src/app/globals.css` (or `app/globals.css`), replacing the shadcn default. Remove any other `:root {}` or `.dark {}` variable blocks.
2. Copy `assets/logos/` into `public/logos/`.
3. Configure Open Sans in `src/lib/fonts.ts` and apply the font and product theme class in `layout.tsx`.
4. Run `npm run dev`.

### HTML mockups

Inline the `:root`, `.dark` and `theme-*` blocks from `assets/globals.css` in a `<style>` tag (drop the `@import "tailwindcss"` line), load Open Sans from Google Fonts, and use only those CSS variables.

Build components with the classes in `assets/components.css`, the plain-HTML equivalents of the shadcn variants in `components.md`. `assets/components-reference.html` shows every one, and `assets/components.js` adds the behaviour dropdown menus need. Never restyle them in a project; changes belong in this plugin.

### When the design system updates

Update the plugin (`claude plugin update` or `codex plugin update`), then re-copy `assets/globals.css` into any project that uses it.

---

## File structure (code projects)

```
cognia-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx        ← apply font and theme class here
│   │   └── globals.css       ← copied from the plugin, do not edit
│   ├── components/
│   │   └── ui/               ← shadcn components live here
│   └── lib/
│       └── fonts.ts          ← Open Sans is configured here
├── public/logos/             ← copied from the plugin
├── tailwind.config.ts
└── components.json
```
