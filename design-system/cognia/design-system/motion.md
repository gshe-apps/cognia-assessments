# Motion

All transitions use `duration-200`. No other duration is permitted.

- Always use `transition-all duration-200` for any state change involving shadow, colour, or visibility.
- Do not use custom durations, delays, or easing values.
- Do not animate layout properties like `width`, `height`, or `position` — use opacity and transform only for show/hide transitions.

```tsx
<Card className="shadow-none hover:shadow-md transition-all duration-200 cursor-pointer">
<Button className="transition-all duration-200">Save changes</Button>
```

**Exception: Spinner.** The loading spinner rotates continuously at one turn per second (`animate-spin`). This is the only animation that is not a 200ms state change. In plain CSS it uses `--spin-duration` from `assets/components.css`.

**Exception: Ambient loops.** A purely decorative animation that repeats forever (`animation: ... infinite`), such as a gentle wave inside a gauge or scenery drifting in a background illustration, may use its own duration and easing, because 200ms would make it flicker. Keep it slow and subtle, hide the animated element from screen readers (`aria-hidden="true"`), and stop it under `@media (prefers-reduced-motion: reduce)`. It never carries information and never replaces a state change, which still uses 200ms. Write the loop in one `animation` shorthand, or in the same rule as `animation-iteration-count: infinite`, so the check can see it is a loop.
