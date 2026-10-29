# Accessibility

## Contrast

- Body text: 4.5:1 minimum (WCAG AA)
- Large text (18px+ or 14px+ bold): 3:1 minimum
- UI components and boundaries: 3:1 minimum
- Focus states: 3:1 minimum against background
- Error states must meet 4.5:1 (never rely on color alone)
- Never use opacity to style text that needs to be readable
- Disabled elements are exempt but must still look intentionally inactive
- Target: AA compliance minimum, AAA where possible

---

## Colour usage

- Never use color as the only means of conveying information
- Always pair color with a secondary indicator: an icon, label, pattern, or text
- Examples: error states need an icon or text, not just red; text links need underlines, not just a different color; charts need labels or patterns, not just different colored segments
- This applies to all interactive states: hover, active, disabled, selected
