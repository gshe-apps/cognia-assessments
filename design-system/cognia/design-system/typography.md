# Typography

## Font

Open Sans is loaded in `lib/fonts.ts` and applied to the `<html>` element in `app/layout.tsx`. No additional font configuration is needed.

---

## Type scale

Use these Tailwind classes for all text. Tailwind's default text size classes (`text-sm`, `text-xl` etc.) are restricted and will not work.

| Role | Class | Size | Weight |
|---|---|---|---|
| Title Hero | `text-title-hero font-bold` | 72px | 700 |
| Title Page | `text-title-page font-bold` | 48px | 700 |
| Subtitle | `text-subtitle` | 30px | 400 |
| Heading | `text-heading font-semibold` | 24px | 600 |
| Subheading | `text-subheading` | 20px | 400 |
| Body Strong | `text-body-base font-semibold` | 16px | 600 |
| Body Base | `text-body-base` | 16px | 400 |
| Body Link | `text-body-base underline` | 16px | 400 |
| Body Small Strong | `text-body-small font-semibold` | 14px | 600 |
| Body Small | `text-body-small` | 14px | 400 |

```tsx
<h1 className="text-title-hero font-bold">Page title</h1>
<h2 className="text-heading font-semibold">Section heading</h2>
<p className="text-body-base">Body text</p>
<span className="text-body-small">Small label</span>
```

---

## Limits per screen

Keep each screen's type simple so the hierarchy is easy to read.

- Use a maximum of **3 font sizes** per screen.
- Use a maximum of **3 font weights** per screen.
- Count everything visible on the screen, including headers, cards, tables, chart labels and tooltips. A modal or drawer counts as part of the screen it opens on.
- If a screen seems to need a fourth size or weight, simplify the content instead, for example by merging two heading levels. If that is not possible, stop and ask the designer.

```tsx
{/* Correct: 3 sizes (24, 16, 14) and 2 weights (600, 400) */}
<h1 className="text-heading font-semibold">Interim overview</h1>
<p className="text-body-base">Results for the winter window.</p>
<span className="text-body-small">Updated today</span>

{/* Wrong: 4 sizes (48, 24, 16, 14) on one screen */}
<h1 className="text-title-page font-bold">Interim overview</h1>
<h2 className="text-heading font-semibold">By school</h2>
<p className="text-body-base">Results for the winter window.</p>
<span className="text-body-small">Updated today</span>
```

---

## Text colour

Text must always use the neutral semantic tokens. Never apply accent, brand, or arbitrary colours to text.

| Token | Class | When to use |
|---|---|---|
| Foreground | `text-foreground` | Primary content — headings, labels, values |
| Muted foreground | `text-muted-foreground` | Secondary content — captions, metadata, placeholders |

**The only exceptions** are semantic status contexts where colour carries meaning:

| Context | Class |
|---|---|
| Success | `text-success` |
| Warning | `text-warning` |
| Error / destructive | `text-destructive` |
| Info | `text-info` |

These status colours are only permitted inside badge and alert components where the colour is paired with a label. Never use them for general body text or headings.

**Rules**
- Never use accent colours (`--accent-100` through `--accent-500`) for text.
- Never hardcode a colour value — always use a semantic token.
- Always use the foreground token that pairs with the surface you are on. On the page background use `text-foreground` or `text-muted-foreground`. On a primary-coloured surface (e.g. inside a filled button) use `text-primary-foreground`. On a card use `text-card-foreground`, and so on. Never reach for a surface token (`--primary`, `--secondary`, `--muted`) when you need a text colour — use its `-foreground` pair instead.
