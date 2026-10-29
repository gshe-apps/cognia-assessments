# Z-index

Use Tailwind's default z-index scale. Do not use arbitrary z-index values.

| Class | Value | Use for |
|---|---|---|
| `z-0` | 0 | Default, static elements |
| `z-10` | 10 | Sticky headers, floating labels |
| `z-20` | 20 | Dropdowns, popovers |
| `z-30` | 30 | Tooltips |
| `z-40` | 40 | Sheets, drawers |
| `z-50` | 50 | Modals, dialogs |

Toasts are managed by the toast library and sit above all other layers automatically — do not set z-index on them manually.

If a stacking conflict arises, ask in the terminal before inventing a custom value.
