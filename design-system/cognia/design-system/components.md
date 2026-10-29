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
- Destructive is a state applied to any variant, not a separate button type.
- Labels are always sentence case. Maximum two words.
- Never show a hover state on a disabled button.
- Icons can appear on the left, right, or both sides of the label.
- Primary (solid) CTAs must always be active — never disable them preemptively. Show inline validation errors on click for missing required fields instead of disabling the button.
- Ghost buttons use `hover:bg-secondary` for a visible hover state. This is set globally in `button.tsx` — do not add it to individual ghost buttons.
- Outline buttons use `border-primary` for their border — never `border-border` or any other border token.

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

FABs are `rounded-full` pill buttons fixed to the bottom-right corner of the screen. Use `shadow-xl` and position with `fixed bottom-6 right-6`. FABs always contain a leading icon and a short label.

```tsx
<div className="fixed bottom-6 right-6">
  <Button className="rounded-full px-4 py-3 h-auto shadow-xl gap-2">
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
| Default | *(none)* | Standard content grouping |
| Ghost | `bg-transparent py-0 rounded-none` + `px-0` on CardHeader and CardContent | Always used for graph cards, subtle grouping |
| Outlined | `border-1 border-primary` | Highlighted or selected state |
| Themed | `style={{ backgroundColor: 'var(--accent-100)' }}` | Product-accented surfaces, highlighted sections |

**Rules**
- All cards have `border-transparent ring-0 shadow-none` applied by default — borders and rings are opt-in. Do not override this default.
- One primary action per card maximum.
- Cards stretch to fill their container — never set a fixed width.
- Clickable cards must apply `shadow-none hover:shadow-md transition-all duration-200 cursor-pointer`. The resting state is no shadow; hover lifts it to `shadow-md`. Do not add a background colour change on hover.
- If the entire card is clickable, wrap it in a link — do not attach onClick to the card div.
- Cards containing a graph must always use the ghost variant. No exceptions.
- The themed variant re-skins automatically when the product theme class changes.

```tsx
// Default
<Card>
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
<Card style={{ backgroundColor: 'var(--accent-100)' }}>
  <CardHeader><CardTitle>Featured section</CardTitle></CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// Clickable
<Link href="/report/1">
  <Card className="shadow-none hover:shadow-md transition-all duration-200 cursor-pointer">
    <CardContent>Content here</CardContent>
  </Card>
</Link>
```

---

### Icon

Icons use Lucide React. The default icon colour is `--muted-foreground` (charcoal).

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
- When an input sits on the `--background` surface, apply `bg-[var(--primary-foreground)]` to give it a white fill that lifts it from the off-white page surface.

```tsx
<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email address *</Label>
  <Input id="email" type="email" placeholder="name@company.com" />
  <p className="text-body-small text-destructive">Please enter a valid email.</p>
</div>
```

---

### Select

Selects let users choose one option from a dropdown list.

**Rules**
- Use a select when there are 5 or more options. For 4 or fewer, consider radio buttons.
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

Tables display structured data for comparison and reference.

**Rules**
- Always include a column header row.
- Right-align numeric columns. Left-align text columns.
- Paginate tables with more than 25 rows.
- Show an empty state when there is no data — never show an empty table.
- Keep row actions in a `DropdownMenu` in the last column.

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alice Johnson</TableCell>
      <TableCell><Badge variant="success">Completed</Badge></TableCell>
      <TableCell className="text-right">$320.00</TableCell>
      <TableCell>
        <DropdownMenu>{/* actions */}</DropdownMenu>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

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
- Use a dropdown for 3 or more related actions. For fewer, use buttons directly.
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
