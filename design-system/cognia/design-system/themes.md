# Themes

## Product themes

Apply a theme class to the page layout wrapper. All shadcn components inside automatically adopt the product colour palette including the accent ramp (`--accent-100` through `--accent-500`).

| Class | Product area | Accent family |
|---|---|---|
| *(no class)* | Default / Data & Reporting | Red |
| `theme-assessments` | Assessments | Blue/purple |
| `theme-learn` | Learning | Green |
| `theme-performance` | Performance | Pink/magenta |
| `theme-observations-surveys` | Observations & Surveys | Amber/gold |

Always apply the theme class in `layout.tsx` — never in `page.tsx` or on individual components:

```tsx
// src/app/assessments/layout.tsx
export default function AssessmentsLayout({ children }) {
  return (
    <div className="theme-assessments">
      {children}
    </div>
  )
}
```

**Using accent colours in custom components**

Always reference accent colours via CSS variables — never hardcode colour values:

```tsx
// Correct — updates with theme
<div className="bg-[var(--accent-100)] text-[var(--accent-500)]">
  Label
</div>

// Wrong — hardcoded, does not update with theme
<div style={{ backgroundColor: '#D1D5EE' }}>
  Label
</div>
```

---

## Dark mode

Dark mode is applied by toggling the `dark` class on the `<html>` element. All colour tokens, shadows, and surfaces switch automatically — no manual dark mode variants are needed in component code.

- Never write `dark:` Tailwind variants in component or page code.
- Never hardcode colours for dark mode — always use CSS variables which handle both modes automatically.
- Theme and dark mode are independent and combine without any additional code.

```tsx
<html className="dark">
  <body>
    <div className="theme-assessments">
      {children}
    </div>
  </body>
</html>
```

---

## Custom CSS variables

| Variable | Use for |
|---|---|
| `--backdrop-overlay` | Modal and drawer backdrops |
| `--hover-overlay` | Hover state overlays |
| `--input-background` | Input field backgrounds |
| `--info-light` | Info alert and badge backgrounds |
| `--success-light` | Success alert and badge backgrounds |
| `--warning-light` | Warning alert and badge backgrounds |
| `--destructive-light` | Error alert and badge backgrounds |
