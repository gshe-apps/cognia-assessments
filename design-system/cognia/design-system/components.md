# Components

## Hover states

- **On white surfaces** (`--card`, `--popover`, `--sidebar`): use `hover:bg-accent`
- **On off-white surfaces** (`--background`, `--muted`): use `hover:bg-secondary`
- **Ghost buttons**: always use `hover:bg-secondary` regardless of surface — they appear on both and secondary is visible on both

`--accent` and `--background` resolve to the same colour, so `hover:bg-accent` on an off-white surface is invisible. Always check the actual rendered background before choosing.

---

## How to implement

### Adding a shadcn component

```bash
npx shadcn@latest add [component-name]
```

This copies the component into `src/components/ui/`. Import from `@/components/ui/[component-name]` and apply only the classes and variants documented in this file.

- Always import from `@/components/ui/` — never from anywhere else.

---

### Adding a component variant

Open the component in `src/components/ui/[component-name].tsx` and add to the `variants` object inside the `cva` call. Always use CSS variables — never hardcode colours.

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium",
  {
    variants: {
      variant: {
        // existing variants...
        "theme-solid": "bg-[var(--accent-300)] text-[var(--primary-foreground)]",
        "theme-light": "bg-[var(--accent-100)] text-[var(--secondary-foreground)]",
      }
    }
  }
)
```

Only implement variants documented in this file. If a new variant is needed, ask the designer to add the spec here first.

---

### Creating a new page

```tsx
// src/app/assessments/layout.tsx — apply theme here
export default function AssessmentsLayout({ children }) {
  return (
    <div className="theme-assessments">
      {children}
    </div>
  )
}

// src/app/assessments/page.tsx
export default function AssessmentsPage() {
  return (
    <main className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-title-page font-bold">Assessments</h1>
        <p className="text-body-base text-muted-foreground">
          Overview of all assessments.
        </p>
      </div>
    </main>
  )
}
```

Every page that fetches data must have a loading state using `Skeleton`:

```tsx
// src/app/assessments/loading.tsx
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

Every page that displays a list or table must handle the empty case:

```tsx
{data.length === 0 && (
  <div className="flex flex-col items-center gap-4 py-16">
    <p className="text-body-base text-muted-foreground">No results found.</p>
    <Button>Add record</Button>
  </div>
)}
```

**Rules**
- Always apply the product theme in `layout.tsx`, never in `page.tsx`.
- Every page sits inside the standard shell: the top navigation header, `bg-background` for the page, and the footer. See Navigation shell and Footer below.
- Never apply theme classes to individual components.
- Graph cards must always use the ghost card variant.

---

### Plain HTML prototypes

HTML prototypes have no React, so they use `assets/components.css`: one class per documented variant, mapped 1:1 to shadcn so a prototype doubles as a dev spec. See `assets/components-reference.html` for every component live.

| shadcn | Plain HTML class |
|---|---|
| `<Button>` / `variant="outline"` / `"ghost"` / `"destructive"` | `.btn` / `.btn-outline` / `.btn-ghost` / `.btn-destructive`; destructive state `.is-destructive` |
| `size="lg"` / `"sm"` / `"xs"` / `"icon"` | `.btn-lg` / `.btn-sm` / `.btn-xs` / `.btn-icon` |
| `<Card>`, ghost, themed, clickable | `.card`, `.card-ghost`, `.card-themed`, `a.card-link > .card` |
| `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `.card-header`, `.card-title`, `.card-description`, `.card-content`, `.card-footer` |
| `<Badge variant="...">` | `.badge` + `.badge-secondary`, `-outline`, `-success`, `-warning`, `-destructive`, `-info`, `-theme-solid`, `-theme-light` |
| `<Input>`, `<Textarea>`, `<Select>` | `.input`, `.textarea`, `.select` inside `.select-wrap` |
| Search input | `.search[role=search]` > `.search-icon`, `input.search-input[type=search]`, `.tooltip-wrap.search-clear`; clear button and Escape from `assets/components.js` |
| `<Label>`, field, error | `.label`, `.field`, `.field-error`; forms use `.form` and `.form-grid` |
| `<Checkbox>`, `<RadioGroupItem>`, `<Switch>` | `.checkbox`, `.radio` inside `label.check`; `button.switch[role=switch]` |
| `<TabsList>`, `<TabsTrigger>` | `.tabs-list`, `.tab[role=tab][aria-selected]` |
| `<Table>` | `.table-wrap > table.table` (or `div.table[role=table]` in templates); numeric cells `.num`, clickable rows `.row-link`, sortable headers `.table-sort` |
| `<Alert variant="...">` | `.alert` + `.alert-info`, `-success`, `-warning`, `-destructive` |
| `<Dialog>`, `<Sheet>` | `dialog.dialog`, `dialog.dialog.sheet` |
| `<DropdownMenu>` | `.dropdown` (`.dropdown-end` to align right) > trigger + `.menu`, `.menu-item`, `.menu-separator`; behaviour from `assets/components.js` |
| `<Tooltip>` | `.tooltip-wrap` > `.tooltip[role=tooltip]` |
| `<Avatar>` | `.avatar`, `.avatar-sm`, `.avatar-lg` |
| `<Progress>`, `<Skeleton>`, `<Separator>`, `<Accordion>` | `.progress`, `.skeleton`, `.separator`, `details.accordion-item` |
| Navigation shell, Footer | `body.shell`, `.shell-header`, `.shell-main`, `.shell-footer` |

**Rules**
- Never add CSS for these components in a project, and never edit the project's copy of `components.css`. The check fails if the copy differs from the plugin.
- If a screen needs something not in this table, ask the designer to add it here and in `components.css` first.

---

### Button

Buttons trigger actions. Use them for form submissions, confirmations, and decisions. Never use a button where a link is more appropriate.

**Variants**

| Variant | shadcn variant | When to use |
|---|---|---|
| Solid | `default` | The single most important action on a page or section |
| Outline | `outline` | Supporting actions alongside a primary button |
| Ghost | `ghost` | Low emphasis actions, inline controls, icon-only buttons |
| Destructive | `destructive` | Delete, remove, or irreversible actions only |

**Sizes**

| Size | Prop | Use for |
|---|---|---|
| Large | `size="lg"` | Hero sections, empty states, prominent CTAs |
| Medium | `size="default"` | Default for most UI contexts |
| Small | `size="sm"` | Compact UI, table rows, inline actions |
| Extra small | `size="xs"` | Tight spaces, toolbars, tag actions |

**Rules**
- Always use `size="lg"` as the default button size. The `lg` size is 48px (`h-12`) and provides the correct touch target for most contexts. Reserve `sm`, `xs`, and icon sizes for compact UI only.
- All text buttons (non-icon) have a minimum width of 64px (`min-w-16`) and horizontal padding of 16px (`px-4`). These are baked into the size variants — never override them.
- Only one solid button per page section. Never two side by side.
- Buttons use `--primary` across all product themes — they do not re-skin per theme.
- Destructive is a state applied to any variant, not a separate button type. On a ghost or outline button the label and icon are red: use `--destructive` mixed 80% with `--foreground` (`text-[color-mix(in_srgb,var(--destructive)_80%,var(--foreground))]`) so a 16px label meets 4.5:1 on both the page and card surfaces. The hover stays the variant's usual hover.
- Labels are always sentence case. Maximum two words.
- Never show a hover state on a disabled button.
- Icons can appear on the left, right, or both sides of the label.
- Primary (solid) CTAs must always be active — never disable them preemptively. Show inline validation errors on click for missing required fields instead of disabling the button.
- Solid (default) buttons hover to `--primary-hover`, which is `color-mix(in srgb, var(--primary) 78%, var(--card))`: the fill lightens slightly and the label stays `--primary-foreground` (white in light mode). Use `hover:bg-[var(--primary-hover)]`; never darken, change the label colour, add a border or a shadow. The same hover applies to anything drawn as a solid primary fill, such as the profile (avatar) button in the header.
- Ghost buttons use `hover:bg-secondary` for a visible hover state. This is set globally in `button.tsx` — do not add it to individual ghost buttons.
- Outline buttons use `border-primary` for their border — never `border-border` or any other border token.
- Buttons never have a shadow, in any variant or state (resting, hover, active, focus) and including FABs. Use `shadow-none`. Hover feedback comes from the background change only. The focus ring (`--ring`) is a focus state, not a shadow, and stays.

```tsx
<Button>Save changes</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Learn more</Button>
<Button variant="destructive">Delete record</Button>
<Button><PlusIcon />Add item</Button>
<Button disabled><Spinner />Loading...</Button>
<Button disabled>Save changes</Button>
```

**Responsive width**

Buttons are full-width on mobile and shrink to fit their content on tablet and desktop. Alignment is controlled by the container, never the button itself.

| Context | Mobile | Tablet+ |
|---|---|---|
| Forms and modals | `w-full` | `w-auto`, container uses `md:flex-row md:justify-end` |
| Centred / hero (empty states, confirmation screens) | `w-full` | `w-auto`, container uses `md:items-center` |
| Inline / body content | natural width | natural width |

```tsx
{/* Form — right-aligned on tablet+ */}
<div className="flex flex-col md:flex-row md:justify-end gap-2">
  <Button variant="ghost" className="w-full md:w-auto">Cancel</Button>
  <Button className="w-full md:w-auto">Save changes</Button>
</div>

{/* Hero / confirmation — centred on tablet+ */}
<div className="flex flex-col items-stretch md:items-center gap-3">
  <Button className="w-full md:w-auto">Start now</Button>
</div>
```

**Floating action buttons (FABs)**

FABs are `rounded-full` pill buttons fixed to the bottom-right corner of the screen. Position them with `fixed bottom-6 right-6`. Like every button, a FAB has no shadow. FABs always contain a leading icon and a short label.

```tsx
<div className="fixed bottom-6 right-6">
  <Button className="rounded-full px-4 py-3 h-auto shadow-none gap-2">
    <PlusIcon className="size-4" />
    New
  </Button>
</div>
```

---

### Card

Cards group related content and actions into a single container.

**Variants**

| Variant | className | When to use |
|---|---|---|
| Default | `rounded-xl` | Standard content grouping |
| Ghost | `bg-transparent py-0 rounded-none` + `px-0` on CardHeader and CardContent | Always used for graph cards, subtle grouping |
| Themed | `rounded-xl` + `style={{ backgroundColor: 'var(--accent-100)' }}` | Product-accented surfaces, highlighted or selected sections |

**Rules**
- Cards use a 12px corner radius (`rounded-xl`, or `var(--radius-xl)` in plain CSS). Tables share it (see Table). Every other component keeps 8px (`rounded-lg`).
- Cards never have a border, in any variant or state, including selected and highlighted. All cards have `border-0 ring-0 shadow-none` by default. Do not add a border or ring. To mark a card as selected or highlighted, use the themed variant.
- One primary action per card maximum.
- Cards stretch to fill their container — never set a fixed width.
- Clickable cards must apply `shadow-none hover:shadow-md transition-all duration-200 cursor-pointer`. The resting state is no shadow; hover lifts it to `shadow-md`. Do not add a background colour change on hover.
- If the entire card is clickable, wrap it in a link — do not attach onClick to the card div.
- Cards containing a graph must always use the ghost variant. No exceptions.
- The themed variant re-skins automatically when the product theme class changes.

```tsx
// Default
<Card className="rounded-xl">
  <CardHeader>
    <CardTitle>Report title</CardTitle>
    <CardDescription>Supporting description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter><Button>View report</Button></CardFooter>
</Card>

// Ghost — always use for graph cards
<Card className="bg-transparent py-0 rounded-none">
  <CardHeader className="px-0"><CardTitle>Survey overview</CardTitle></CardHeader>
  <CardContent className="px-0">{/* chart here */}</CardContent>
</Card>

// Themed — use inline style not Tailwind class
<Card className="rounded-xl" style={{ backgroundColor: 'var(--accent-100)' }}>
  <CardHeader><CardTitle>Featured section</CardTitle></CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// Clickable
<Link href="/report/1">
  <Card className="rounded-xl shadow-none hover:shadow-md transition-all duration-200 cursor-pointer">
    <CardContent>Content here</CardContent>
  </Card>
</Link>
```

---

### Icon

Icons use Lucide only (Lucide React in code, Lucide's SVG markup from lucide.dev in HTML prototypes). The default icon colour is `--muted-foreground` (charcoal).

**Standard usage**

```tsx
import { BarChart } from 'lucide-react'

<BarChart className="text-muted-foreground" />
```

**Accent variant**

```tsx
<div className="bg-white rounded-lg p-2">
  <BarChart className="text-[var(--accent-300)]" />
</div>
```

**Rules**
- Use Lucide icons only, in every product and prototype. Never draw your own SVG icon, use another icon set, or use emoji or text symbols (such as →, ▲, ▼, ✓, ×) as icons. If Lucide has no fitting icon, ask the designer.
- In HTML prototypes, paste the Lucide SVG unchanged: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, round caps and joins, and `aria-hidden="true"` unless it is the only label.
- Default icon colour is always `--muted-foreground`. Use `text-muted-foreground` on all icons unless a specific variant applies.
- Only use `--accent-300` when the icon is on a white background and the accent adds meaningful context.
- Never hardcode a colour value for icons — always use a CSS variable.
- Always pair icon-only controls with a tooltip.
- Do not add a coloured background container to icons. The only permitted container background is `bg-white`, and only for the accent variant.

---

### Badge

Badges communicate status, category, or metadata. They are read-only — never interactive.

**Variants**

| Variant | Background token | Text token | When to use |
|---|---|---|---|
| `default` | `--primary` | `--primary-foreground` | Neutral labels, categories |
| `secondary` | `--secondary` | `--secondary-foreground` | Low emphasis metadata |
| `outline` | transparent | `--foreground` | Subtle tags, filters |
| `success` | `--success-light` | `--success` | Completed, approved, active |
| `warning` | `--warning-light` | `--warning` | Pending, in review, expiring |
| `destructive` | `--destructive-light` | `--destructive` | Failed, cancelled, error |
| `info` | `--info-light` | `--info` | In progress, processing |
| `theme-solid` | `--accent-300` | `--primary` | High emphasis product-accented label |
| `theme-light` | `--accent-100` | `--secondary-foreground` | Low emphasis product-accented label |

**Rules**
- Badges are labels — never use them as buttons or links.
- Maximum two words per badge label.
- Use sentence case for badge labels.
- Use only one status badge per row or card.
- Do not use colour alone to communicate status — always pair with a label.

```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Cancelled</Badge>
<Badge variant="info">Processing</Badge>
<Badge variant="theme-solid">Featured</Badge>
<Badge variant="theme-light">Featured</Badge>
```

---

### Input

Inputs collect single-line text from the user.

**Rules**
- Inputs must have a minimum height of 48px (`h-12`).
- Every input must have a visible label — never rely on placeholder text as a label.
- Placeholder text should give an example value, not repeat the label.
- Show validation errors inline below the input, not in a toast.
- Required fields must be marked with an asterisk (*) after the label.
- Input fields have no border (`border-0`). This applies to every input field: text inputs, textareas and select triggers. The fill shows where the field is instead:
  - On the `--background` surface, apply `bg-[var(--primary-foreground)]` to give it a white fill that lifts it from the off-white page surface.
  - On a white surface (`--card`, `--popover`), apply `bg-secondary` so the field stays visible against the white.
- Focus shows the standard 3px `--ring` focus ring. An error shows the inline error message below the field and the ring in `--destructive` (`aria-invalid` styling); never rely on colour alone.

```tsx
<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email address *</Label>
  <Input id="email" type="email" placeholder="name@company.com" className="border-0" />
  <p className="text-body-small text-destructive">Please enter a valid email.</p>
</div>
```

---

### Search input

Search inputs filter or find content on the current screen, for example the rows of a table or the items in a list. A search input is an input field, so every Input rule applies unless this section says otherwise.

**Anatomy**

1. Container: pill shaped, holds the icon, the field and the clear button.
2. Search icon: Lucide `Search`, 16px, on the left, decorative.
3. Field: `type="search"`, with placeholder text that names what is being searched.
4. Clear button: Lucide `X`, shown only when the field has a value.
5. Results count (optional): sits outside the container, for example "11 items".

**Rules**

- Corner radius is fully round: `rounded-full` (9999px, token `--rounded-full`). Search is the only input field that is pill shaped. Every other field keeps `rounded-lg`.
- Minimum height 48px (`h-12`).
- No border, on any surface:
  - Directly on the theme background (`--background`): white fill, `bg-[var(--primary-foreground)]`, no border.
  - On a white surface (`--card`, `--popover`, dialog): `bg-secondary`, no border.
- Focus: one 3px `--ring` outline on the pill container, following the pill shape. The inner `<input>` never draws its own ring, so there is never a double outline or a square ring inside a round field.
- The clear button is a ghost icon button (`btn-ghost btn-icon btn-sm`), fully round, with the tooltip "Clear search". When it is focused, it shows its own focus ring and the container does not.
- `Esc` clears the field. Clearing returns focus to the field. In plain HTML, `assets/components.js` does this.
- Placeholder names the scope in sentence case: "Search assessments", "Search wording or standard". Do not use a generic "Search items...", and do not end with an ellipsis.
- Labelling:
  - Search in a toolbar above the content it filters: the visible label may be left out. The field must have an `aria-label` that matches the placeholder, and the container uses `role="search"`.
  - A standalone search (the main task of the page, or a search field inside a form): use a visible label, as with any other input.
- Results: filter as the user types, after a 300ms pause (debounce, not an animation). Announce the updated count with `aria-live="polite"`.
- No results: show the empty state in place of the content, naming the term, with a way out: "No assessments match "biology"" plus a "Clear search" button.
- Keep the search term in the URL (`?q=`) so it survives Back and can be shared.
- A filter button beside the search is a separate ghost icon button with a tooltip. It never sits inside the pill.

```tsx
<div role="search" className="relative flex items-center w-full h-12 rounded-full border-0 bg-[var(--primary-foreground)] transition-all duration-200 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-[var(--ring)]">
  <Search className="absolute left-4 size-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
  <Input
    type="search"
    aria-label="Search assessments"
    placeholder="Search assessments"
    className="h-12 border-0 bg-transparent rounded-full pl-10 pr-12 shadow-none focus-visible:ring-0 focus-visible:outline-none"
  />
  {value && (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute right-2 size-8 rounded-full" aria-label="Clear search" onClick={clear}>
          <X className="size-4 text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Clear search</TooltipContent>
    </Tooltip>
  )}
</div>
```

On a card or dialog, swap `bg-[var(--primary-foreground)]` for `bg-secondary`.

---

### Select

Selects let users choose one option from a dropdown list.

**Rules**
- Use a select when there are 5 or more options. For 4 or fewer, consider radio buttons.
- The select trigger is an input field, so it follows the Input field rules: no border, filled to suit its surface.
- Always include a default placeholder: "Select an option".
- If the list exceeds 20 items, use a searchable combobox instead.

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a product area" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="assessments">Assessments</SelectItem>
    <SelectItem value="learning">Learning</SelectItem>
    <SelectItem value="surveys">Observations & Surveys</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox

Checkboxes let users select one or more options.

**Rules**
- Use checkboxes for multi-select. Use a switch for a single on/off toggle.
- Always pair a checkbox with a visible label to its right.

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">I agree to the terms and conditions</Label>
</div>
```

---

### Switch

A switch toggles a single setting on or off immediately.

**Rules**
- Use a switch only for settings that take effect immediately.
- If the action requires a save or confirmation step, use a checkbox instead.
- Place the label to the left of the switch.

```tsx
<div className="flex items-center gap-2">
  <Label htmlFor="notifications">Email notifications</Label>
  <Switch id="notifications" />
</div>
```

---

### Dialog

Dialogs interrupt the user to focus on a critical task or confirmation.

**Rules**
- Every dialog must have a title, a description, and a clear way to dismiss it.
- Destructive dialogs must always have a cancel option.
- Do not open a dialog from inside another dialog.
- If the content needs scrolling, use a sheet instead.

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete record</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete this record?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete record</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Sheet

Sheets slide in from the edge of the screen for secondary tasks or filters.

**Rules**
- Use `side="right"` for detail panels and filters. Use `side="bottom"` on mobile.
- Do not use a sheet for simple confirmations — use a dialog.

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open filters</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow down your results.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

---

### Tabs

Tabs organise content into parallel sections.

**Rules**
- Keep tab labels to one or two words maximum, sentence case.
- Never use more than 6 tabs in one set.
- Do not use tabs for sequential workflows.
- When the `TabsList` sits on a `--background` surface, apply `bg-card` to the `TabsList` so the container reads as white rather than the default muted gray.

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="results">Results</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="results">Results content</TabsContent>
  <TabsContent value="history">History content</TabsContent>
</Tabs>
```

---

### Table

Tables display structured data for comparison and reference. Always use the shadcn `Table` with the Cognia overrides below; never build a table from cards, lists or a custom grid.

**Rules**
- Always include a column header row. Header labels are in sentence case ("Last updated", not "Last Updated" or "LAST UPDATED").
- The header row is 48px (`h-12`), white (`bg-card`), and uses Body Small at regular weight (`text-body-small font-normal text-muted-foreground`).
- Body rows are 64px (`h-16`). Rows alternate from the top: the first row is 50% white (`bg-card/50`), the second white (`bg-card`), and so on.
- No lines between rows or around the table (`border-0`). The alternating rows separate them.
- The table has a 12px corner radius (`rounded-xl` on the table container, `var(--radius-xl)` in plain CSS), the same as a card. The corners clip the white header row and the last row, including its hover colour, so never round individual cells or rows.
- No container background. Do not put a table inside a white card; it sits straight on the page (or the card's surface) with its own white header row.
- Right-align numbers (counts, percentages, scores, dates written as numbers) and the last column. Left-align other text.
- Only rows that open something get a hover state (`hover:bg-secondary cursor-pointer`). A clickable row holds a link or button to the same place in its first cell, so it works with a keyboard. Rows that only show data have no hover.
- In a list and detail layout, the open row keeps the hover colour (`bg-secondary`, `aria-selected="true"`).
- Sortable columns use a plain header button with the Lucide `ChevronsUpDown` icon, which becomes `ChevronUp` or `ChevronDown` for the sorted column. The sorted header turns `text-foreground`.
- Paginate tables with more than 25 rows.
- Show an empty state when there is no data, never an empty table.
- Keep row actions in a `DropdownMenu` in the last column.
- Icons in tables follow the Icon rules: Lucide only.

```tsx
// components/ui/table.tsx, Cognia overrides on the shadcn defaults
Container:   "relative w-full overflow-x-auto rounded-xl"       // the div with data-slot="table-container"; 12px corners
Table:       "w-full caption-bottom text-body-small"           // no wrapper background
TableHeader: "[&_tr]:border-0"
TableBody:   "[&_tr:nth-child(odd)]:bg-card/50 [&_tr:nth-child(even)]:bg-card"
TableRow:    "border-0"                                        // no hover by default
TableHead:   "h-12 px-4 bg-card text-left align-middle font-normal text-muted-foreground whitespace-nowrap last:text-right"
TableCell:   "h-16 px-4 align-middle last:text-right"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead><span className="sr-only">Actions</span></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="cursor-pointer hover:bg-secondary">   {/* only when the row opens something */}
      <TableCell><Link href="/people/alice">Alice Johnson</Link></TableCell>
      <TableCell><Badge variant="success">Completed</Badge></TableCell>
      <TableCell className="text-right tabular-nums">$320.00</TableCell>
      <TableCell>
        <DropdownMenu>{/* actions */}</DropdownMenu>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Plain HTML** (`assets/components.css`): `div.table-wrap > table.table` (the wrapper gives the 12px corners, so never leave it out), numeric cells `.num`, the actions cell `.actions`, a sortable header button `.table-sort` (sort direction from the header's `aria-sort`), clickable rows `tr.row-link` (open row `aria-selected="true"`) (`assets/components.js` makes the whole row follow its first link). Where a template engine cannot render `<table>`, use `div.table[role=table]` with `[role=row]`, `[role=columnheader]` and `[role=cell]`; the flow's layout file sets only the column widths through `--table-columns`.

---

### Alert

Alerts communicate important information inline within the page.

**Rules**
- Keep alert text to one or two sentences maximum.
- Place alerts at the top of the relevant section.
- Do not stack more than two alerts on the same page.

```tsx
<Alert>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>This report has not been reviewed yet.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
</Alert>
```

---

### Dropdown Menu

Dropdown menus reveal a list of actions related to a trigger element.

**Rules**
- Use a dropdown for 3 or more related actions, or for different ways to start one task (for example Create assessment: from scratch or from the library). Otherwise, for fewer than 3, use buttons directly.
- A trigger that opens a menu shows a chevron and does nothing else. If the button also needs a default action of its own, that is a split button, which is not documented yet: ask the designer.
- Items may lead with a 16px icon. Items that go to another page are links (`<a>`); items that act on the page are buttons.
- Place destructive actions at the bottom, separated from other actions.
- Keep labels in verb + noun format: "Edit record", "Delete record".

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm"><MoreHorizontal /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit record</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">Delete record</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Plain HTML (load a copy of `assets/components.js`, which adds opening, keyboard, Escape and click-outside behaviour):

```html
<div class="dropdown dropdown-end">
  <button type="button" class="btn btn-lg" id="create-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="create-menu">
    Create assessment <svg aria-hidden="true"><!-- chevron-down --></svg>
  </button>
  <div class="menu" role="menu" id="create-menu" aria-labelledby="create-trigger" hidden>
    <a class="menu-item" role="menuitem" tabindex="-1" href="create.html"><svg aria-hidden="true"></svg>Create from scratch</a>
    <a class="menu-item" role="menuitem" tabindex="-1" href="library.html"><svg aria-hidden="true"></svg>Use assessment library</a>
  </div>
</div>
```

---

### Tooltip

Tooltips reveal additional context on hover or focus.

**Rules**
- Always pair icon-only buttons with a tooltip.
- Keep tooltip text to one short sentence.
- Never put interactive content inside a tooltip.
- Tooltips must appear on keyboard focus, not just hover.

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="sm"><SettingsIcon /></Button>
  </TooltipTrigger>
  <TooltipContent>Settings</TooltipContent>
</Tooltip>
```

---

### Avatar

Avatars represent a user or entity visually.

**Rules**
- Always provide a fallback using first and last name initials.
- Always use `rounded-full`.
- Do not show more than 5 stacked avatars without a count indicator.
- Fallback background must use `bg-secondary` with `text-secondary-foreground` — never accent or status colours.
- Fallback text must be regular font weight — never bold or semibold.

| Size | className | Use for |
|---|---|---|
| Small | `h-6 w-6` | Table rows, compact lists |
| Medium | `h-8 w-8` | Comments, mentions |
| Large | `h-10 w-10` | Profile headers, cards |

```tsx
<Avatar>
  <AvatarImage src="/user.jpg" alt="Alice Johnson" />
  <AvatarFallback className="bg-secondary text-secondary-foreground font-normal">AJ</AvatarFallback>
</Avatar>
```

---

### Skeleton

Skeletons show a placeholder while content is loading.

**Rules**
- Match the skeleton shape and size to the content it replaces.
- Do not use a spinner for page-level loading — use skeletons.
- Do not use skeletons for actions that complete in under 300ms.

```tsx
<div className="flex flex-col gap-2">
  <Skeleton className="h-4 w-48" />
  <Skeleton className="h-4 w-32" />
</div>
```

---

### Progress

**Rules**
- Use a progress bar for processes with a known completion percentage.
- Use a spinner for processes with an unknown duration.
- Always label the progress bar.

```tsx
<Progress value={65} />
```

---

### Separator

**Rules**
- Use separators to divide logically distinct sections — not for decorative spacing.
- Prefer spacing over separators for minor visual separation.

```tsx
<Separator />
<Separator orientation="vertical" />
```

---

### Logo

The Cognia logo assets are in this plugin under `assets/logos/`. In code projects, copy them to `public/logos/`.

| File | Use for |
|---|---|
| `logos/logo.svg` | Full wordmark — primary header use |
| `logos/C.svg` | Icon mark — compact / icon-only contexts |

**Rules**
- Always source logo files from the plugin's `assets/logos/`. Never create, redraw, or substitute a logo.
- The logo is always static — never add hover, focus, active, or any interactive state styling to it.
- Never alter the logo colour via CSS, `filter`, `opacity`, or any other mechanism.
- Never wrap the logo in an interactive element that applies visual effects to it.

```tsx
{/* Correct — static, no visual state on the logo */}
<button onClick={() => router.push('/dashboard')}>
  <img src="/cognia-logo.svg" alt="Cognia" className="h-7 w-auto" />
</button>

{/* Wrong — hover changes the logo appearance */}
<button className="hover:opacity-70">
  <img src="/cognia-logo.svg" alt="Cognia" className="h-7 w-auto" />
</button>
```

---

### Navigation shell

Every screen uses the same shell: the top navigation header, the page on the theme background, and the footer. There is no side navigation.

**Page background**
- The screen background is always `bg-background` (`--background`). Never use `bg-card`, `bg-secondary`, an accent or any other colour for the page itself.

**Top navigation header**

The header is full width, 52px tall, with `px-8` (32px) side padding and three areas laid out as `grid-cols-[1fr_auto_1fr]` with `gap-6`.

| Area | Contents |
|---|---|
| Left | The Cognia logo (`logos/logo.svg`, 28px tall), then the product name, for example "Interim Assessment", in `text-body-base font-bold text-foreground`, with `gap-3` between them. |
| Middle | The product's nav items, centred, `gap-1` between them. Each item is `text-body-small font-semibold text-foreground` with `px-3 py-1` and a 2px transparent bottom border. |
| Right | The grid icon button (40px, ghost, `rounded-lg`, `aria-label="Apps"`) that opens the hub window, then the profile button next to it (36px circle, `bg-primary text-primary-foreground`, the person's initials in `text-body-small font-bold`) that opens the account menu. `gap-2` between them. |

**Rules**
- The header has no background colour, no bottom border and no shadow. It sits directly on the page background.
- The selected nav item has a 2px bottom border in `--brand-coral` (the red underline) and `aria-current="page"`. Do not add a background or change the text colour for the selected item.
- Hover on a nav item uses `--hover-overlay` with `rounded-lg`, not a coloured background.
- Keep the order exactly as above: logo, product name, nav items, grid icon, profile. Do not add other controls to the header.
- On mobile the nav items move to a second row below the logo and icons, and scroll sideways if they do not fit.

```tsx
{/* Correct: transparent header, red underline on the selected item */}
<header className="grid h-[52px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-8">
  <div className="flex items-center gap-3">
    <img src="/logos/logo.svg" alt="Cognia" className="h-7 w-auto" />
    <span className="text-body-base font-bold text-foreground">Interim Assessment</span>
  </div>
  <nav aria-label="Interim" className="flex justify-center gap-1">
    <a href="/interim" aria-current="page" className="text-body-small font-semibold px-3 py-1 border-b-2 border-[var(--brand-coral)]">Overview</a>
    <a href="/interim/library" className="text-body-small font-semibold px-3 py-1 border-b-2 border-transparent hover:bg-[var(--hover-overlay)] rounded-lg">Library</a>
  </nav>
  <div className="flex items-center justify-end gap-2">
    <Button variant="ghost" size="icon" aria-label="Apps"><LayoutGrid /></Button>
    <button aria-label="Account: Jordan Ellis" className="h-9 w-9 rounded-full bg-primary text-primary-foreground text-body-small font-bold">JE</button>
  </div>
</header>

{/* Wrong: background colour or border on the header */}
<header className="bg-card border-b ...">...</header>
```

---

### Footer

Every screen ends with the same footer, exactly as shown here. It sits at the bottom of the screen even when the content is short (make the page a `min-h-screen flex flex-col` and give the footer `mt-auto`).

**Layout**
- Full width, `px-8 py-3` (32px by 12px), a 1px top border in `--border`, and no background colour.
- Inside, the content is spread with `justify-between` and wraps on small screens with `gap-4`.
- Left: "© 2026 Cognia, Inc. All rights reserved." in `text-body-small font-semibold text-muted-foreground`.
- Right, in this order with `gap-4`: the language selector ("English" with a chevron down icon), "Help & Support", and "cognia.org" (links to https://www.cognia.org).
- The links are `text-body-small text-muted-foreground` with no underline, and underline on hover.
- The language selector is `text-body-small text-muted-foreground` with a 2px `--brand-coral` bottom border and `gap-2` between the label and the icon.
- Focus on any footer control shows the standard 3px `--ring` focus ring.

**Rules**
- Do not add, remove or reorder footer items, and do not give the footer a background colour.
- Update the year when the copyright year changes; keep the rest of the wording as is.

```tsx
<footer className="mt-auto border-t px-8 py-3">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <p className="text-body-small font-semibold text-muted-foreground">© 2026 Cognia, Inc. All rights reserved.</p>
    <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
      <button aria-haspopup="listbox" aria-label="Language: English" className="flex items-center gap-2 border-b-2 border-[var(--brand-coral)] pt-2 pb-1 px-1 text-body-small text-muted-foreground">
        English <ChevronDown className="h-4 w-4" />
      </button>
      <a href="/help" className="text-body-small text-muted-foreground hover:underline">Help &amp; Support</a>
      <a href="https://www.cognia.org" className="text-body-small text-muted-foreground hover:underline">cognia.org</a>
    </nav>
  </div>
</footer>
```

---

### Accordion

**Rules**
- Use `type="single"` to allow only one open panel at a time in most cases.
- Keep accordion titles short and descriptive.
- Do not nest accordions inside accordions.

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section title</AccordionTrigger>
    <AccordionContent>Section content here.</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Sonner

Sonner is the shadcn-recommended replacement for the deprecated Toast component. The `Toaster` is mounted once in `app/layout.tsx` via `@/components/ui/sonner`. Always import helper functions from `@/lib/toast` — never call sonner directly.

| Function | Type | Duration |
|---|---|---|
| `toastSuccess(msg)` | Success | Auto-dismiss 5 s |
| `toastInfo(msg)` | Info | Auto-dismiss 5 s |
| `toastWarning(msg)` | Warning | Persists |
| `toastError(msg)` | Error | Persists |

**Rules**
- All toasts get a close button regardless of type (configured globally in `@/components/ui/sonner`).
- Errors and warnings persist until manually dismissed.
- Success and info auto-dismiss at 5 s but remain manually dismissable.
- Never auto-dismiss a toast that contains an interactive element — use `duration: Infinity`.
- One toast per user action. Messages are sentence case, one sentence, no trailing period.
