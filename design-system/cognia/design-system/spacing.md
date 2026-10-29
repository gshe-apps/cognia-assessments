# Spacing

## 8 point scale

8 point scale only. All other Tailwind spacing values are restricted in `tailwind.config.ts` and will not work.

| Tailwind class | Value |
|---|---|
| `p-0` / `m-0` | 0px |
| `p-px` / `m-px` | 1px |
| `p-1` / `m-1` | 4px |
| `p-2` / `m-2` | 8px |
| `p-3` / `m-3` | 12px |
| `p-4` / `m-4` | 16px |
| `p-6` / `m-6` | 24px |
| `p-8` / `m-8` | 32px |
| `p-10` / `m-10` | 40px |
| `p-12` / `m-12` | 48px |
| `p-16` / `m-16` | 64px |
| `p-20` / `m-20` | 80px |
| `p-24` / `m-24` | 96px |

If you need a value not in this list, ask the designer before adding it.

---

## Responsive layout

Responsive padding and spacing are handled automatically via CSS variables. Use these instead of hardcoded values or Tailwind responsive prefixes for page-level layout.

| Variable | Mobile | Tablet | Web |
|---|---|---|---|
| `--horizontal-padding` | 16px | 24px | 32px |
| `--vertical-padding` | 32px | 64px | 96px |
| `--section-spacing` | 48px | 64px | 96px |

```tsx
<main style={{
  padding: 'var(--vertical-padding) var(--horizontal-padding)'
}}>
  {children}
</main>
```

Or via Tailwind arbitrary values:

```tsx
<main className="px-[var(--horizontal-padding)] py-[var(--vertical-padding)]">
  {children}
</main>
```

These values update automatically at each breakpoint. Do not override them.

---

## Shadows

| Class | Use for |
|---|---|
| `shadow-sm` | Cards, subtle containers |
| `shadow-md` | Dropdowns, tooltips, popovers |
| `shadow-lg` | Modals, dialogs, drawers |
| `shadow-xl` | Toasts, FABs |

Light and dark mode shadow colours switch automatically via CSS variables.

---

## Border radius

Only two values are used across the entire system:

| Class | Value | Use for |
|---|---|---|
| `rounded-lg` | 8px | All components |
| `rounded-full` | 9999px | Badges, pills, avatars |
