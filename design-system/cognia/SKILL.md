---
name: cognia-design
description: Use when designing, mocking up, building or reviewing any Cognia screen, page, component or HTML mockup, so it follows the Cognia design system (tokens, type, spacing, themes, components, logos).
---

# Cognia design system

This plugin is the source of truth for the Cognia design system. Everything you need is in this skill folder:

- `design-system/` — the rules, starting with `DESIGN.md`
- `assets/globals.css` — every colour, radius and theme token
- `assets/components.css`, the components for HTML prototypes (plain-CSS equivalents of the documented shadcn variants), shown live in `assets/components-reference.html`
- `assets/logos/` — `logo.svg` (wordmark) and `C.svg` (icon mark)
- `checks/`, the automated check projects run against these rules

Paths below are relative to this skill folder.

## Before building anything

1. Read these files in full, in this order: `design-system/DESIGN.md`, `typography.md`, `spacing.md`, `accessibility.md`, `themes.md`, `motion.md`, `z-index.md`, `forms.md`, `components.md`. If any is missing, stop and say so.
2. Use `assets/globals.css` for exact token values.
3. If something is not documented (a variant, spacing value, colour, pattern), stop and ask. Do not invent or approximate.

## Pick the output

**HTML prototype with several screens.** Link a copy of `assets/globals.css` (without `@import "tailwindcss"`), then a copy of `assets/components.css`, then at most one layout file per flow. Build every component from the classes in `components.css` (see `components-reference.html`); never write CSS for a button, card, field, badge, tab, table, alert, dialog, menu, tooltip, avatar, header or footer. The layout file may only position and size things: no colour, font, border, shadow or radius. Never edit either copy. If a component or variant is missing, stop and ask the designer to add it to `components.md` and `components.css` in this plugin. Set `componentsCopy` in the project's `cognia-design.config.json` so the check fails if the copy is edited.

**HTML mockup or quick prototype.** One self-contained HTML file. Inline the `:root`, `.dark` and `theme-*` blocks from `assets/globals.css` in a `<style>` tag (leave out `@import "tailwindcss"`), inline `assets/components.css` after it, load Open Sans from Google Fonts, and use only those CSS variables and component classes. Never hardcode hex values. Inline the logo SVG from `assets/logos/` rather than redrawing it.

**Code (Next.js + Tailwind + shadcn).** Before writing code, check the project and ask before fixing anything that fails:

- `next.config.js` or `next.config.ts` exists (otherwise offer to convert to Next.js).
- `tailwind.config.ts` or `.js` exists.
- `components.json` exists (otherwise offer to run `npx shadcn@latest init`).
- `globals.css` matches `assets/globals.css`. If it is missing, still the shadcn default, or has its own `:root {}` / `.dark {}` blocks, offer to replace it with the plugin copy.
- Logos are in `public/logos/`. If not, offer to copy them from `assets/logos/`.

## Non-negotiables (summary, the docs win if they differ)

- Components: only shadcn components from `components/ui/`, and only variants documented in `components.md`.
- Colour: CSS variables only. Text uses `text-foreground`, `text-muted-foreground`, or the `-foreground` pair of its surface.
- Type and spacing: only the classes and values in `typography.md` and `spacing.md`.
- Shell: every screen uses the standard top navigation header (no background colour, red underline on the selected item), `bg-background` for the page, and the standard footer. See Navigation shell and Footer in `components.md`.
- Themes: product theme class (`theme-assessments`, `theme-learn`, `theme-performance`, `theme-observations-surveys`) in `layout.tsx` only. Dark mode via `.dark` on `<html>`, never `dark:` variants.
- Logos: never redraw, recolour or add hover states.
- Never edit a project's `globals.css` by hand. Changes to tokens belong in this plugin.

## After building

Check the work against the docs: no hardcoded colours, no off-scale spacing, no undocumented variants, contrast at WCAG AA. List anywhere you had to ask or deviate.

If the project has a `cognia-design.config.json`, run the automated check from the project root and fix anything it reports as new:

```bash
node <this skill folder>/checks/check-project.cjs
```

It reads every rule from this plugin, so it always matches the current docs. Never raise the project's baseline to make a change pass. See `checks/README.md` to set it up in a new project.
