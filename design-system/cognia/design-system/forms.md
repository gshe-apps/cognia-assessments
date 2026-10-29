# Form layout

Use a consistent structure for all forms.

## Field spacing

Always use `gap-2` (8px) between a label, input, and its error message. Always use `gap-6` (24px) between separate form fields.

```tsx
<form className="flex flex-col gap-6">
  <div className="flex flex-col gap-2">
    <Label htmlFor="name">Full name *</Label>
    <Input id="name" placeholder="Jane Smith" />
    <p className="text-body-small text-destructive">This field is required.</p>
  </div>
  <div className="flex flex-col gap-2">
    <Label htmlFor="email">Email address *</Label>
    <Input id="email" type="email" placeholder="name@company.com" />
  </div>
</form>
```

---

## Submit button position

Position depends on context — follow the design spec. The three standard positions are:

| Context | Position | Pattern |
|---|---|---|
| Modal or bottom of page form | Bottom right | `flex justify-end gap-2` |
| Settings or inline edit | Top right | `flex justify-between items-center` |
| Confirmation or hero screen | Centred | `flex flex-col items-center gap-3` |

```tsx
{/* Bottom right — modal or standard form */}
<div className="flex justify-end gap-2">
  <Button variant="outline" className="w-full md:w-auto">Cancel</Button>
  <Button className="w-full md:w-auto ">Save changes</Button>
</div>

{/* Top right — settings or inline edit */}
<div className="flex justify-between items-center">
  <h2 className="text-heading font-semibold">Section title</h2>
  <Button className="w-full md:w-auto ">Save changes</Button>
</div>

{/* Centred — confirmation screen */}
<div className="flex flex-col items-center gap-3">
  <Button className="w-full md:w-auto ">Continue</Button>
</div>
```

---

## Multi-column form layouts

On mobile, inputs must always stack in a single column. Two-column (or wider) grids are only permitted at the `sm` breakpoint and above.

```tsx
{/* Correct — stacks on mobile, two columns on sm+ */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="flex flex-col gap-2">
    <Label>Start time *</Label>
    <Input />
  </div>
  <div className="flex flex-col gap-2">
    <Label>End time</Label>
    <Input />
  </div>
</div>

{/* Wrong — side by side on all screen sizes */}
<div className="grid grid-cols-2 gap-4">
  ...
</div>
```

---

## Rules

- Never disable the submit button to indicate missing fields — keep it active and show inline validation errors on click.
- Always include a cancel or back option alongside a destructive or irreversible submit action.
- Never use a toast to show form validation errors — always show them inline below the relevant field.
- Never place inputs side by side on mobile — always use `grid-cols-1 sm:grid-cols-2` (or wider) so inputs stack on small screens.
