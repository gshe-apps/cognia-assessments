# Motion

All transitions use `duration-200`. No other duration is permitted.

- Always use `transition-all duration-200` for any state change involving shadow, colour, or visibility.
- Do not use custom durations, delays, or easing values.
- Do not animate layout properties like `width`, `height`, or `position` — use opacity and transform only for show/hide transitions.

```tsx
<Card className="shadow-none hover:shadow-md transition-all duration-200 cursor-pointer">
<Button className="transition-all duration-200">Save changes</Button>
```
