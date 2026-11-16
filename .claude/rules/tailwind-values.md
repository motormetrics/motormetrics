---
paths:
  - "**/*.tsx"
---

# Tailwind Values

Use Tailwind's predefined values only. When a design comp asks for a size the scale does not have, round
to the nearest step and accept the few pixels of drift.

This applies to new and changed code. Do not refactor existing arbitrary values elsewhere to match.

- ✅ Spacing and sizing from the classic scale: `0`–`4` in `0.5` steps, then `5`–`12`, `14`, `16`, `20`,
  `24`, `28`, `32`, `36`, `40`, `44`, `48`, `52`, `56`, `60`, `64`, `72`, `80`, `96`
- ✅ Type and tracking from the presets: `text-xs` … `text-6xl`, `tracking-tight`
- ✅ Breakpoints from the presets: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, and their `max-*` forms
- ✅ Grid columns from the presets: `grid-cols-1` … `grid-cols-12` with `col-span-*`. Express an uneven split
  as spans of a wider grid, e.g. `1.35fr 1fr` becomes `grid-cols-7` with spans of 4 and 3; where the children
  are not yours to class, set the spans from the parent with `*:col-span-3 *:first:col-span-4`
- ✅ Child position from the presets: `first:`, `last:`, `odd:`, `even:`, `nth-3:` rather than `nth-[n+3]:`
- ✅ Tables with fixed columns: flex rows sharing preset-width cell classes (`w-5`, `w-28`, `min-w-0 flex-1`)
  rather than a px grid template
- ❌ Arbitrary values: `gap-[18px]`, `text-[1.75rem]`, `tracking-[-0.03em]`
- ❌ Custom breakpoints: `max-[720px]`, `min-[901px]`, including in `matchMedia` queries; write
  `(width < 48rem)` for `max-md`
- ❌ Off-scale steps, even though Tailwind v4 compiles any multiple of `--spacing`: `gap-4.5`, `w-22`, `h-50`
- ❌ Arbitrary grid templates: `grid-cols-[1.35fr_1fr]`, `grid-cols-[20px_150px_minmax(0,1fr)]`
- ⚠️ Exception: only when no combination of presets can express the layout may a value stay arbitrary, with a
  comment saying why

## 8px Spacing Grid

Gaps, padding and margins sit on an 8px grid: even steps only (`2`, `4`, `6`, `8`, `12`, `16` = 8, 16, 24, 32,
48, 64px). `1` (4px) is the one half step, for spacing inside a single element (icon to label, value to its
change). Sizing (`w-*`, `h-*`, `size-*`) is not bound by this.

| Level | Use | Classes |
|---|---|---|
| Inside an element | icon to label, value to its change | `gap-1` / `gap-2` |
| Inside a card or group | title, value, chart, footer | `gap-2` / `gap-4`; card padding `p-4` |
| Between cards in a row | tiles, key-number cells | `gap-4` (matches the card padding) |
| Between sections | one figure to the next | `gap-12` |
| Page edge | the inset main area | `p-4`, `md:p-6` |

- Most spacing needs three values: `2` (0.5rem) to tie closely related items, `4` (1rem) for padding and items in
  one group, `6` or `8` (1.5–2rem) to separate groups. Start a step too generous and tighten, never the reverse
- ✅ `gap-4`, `p-4`, `mt-6`, `gap-x-8`, `gap-12`
- ❌ Odd and half steps: `gap-3`, `p-5`, `gap-1.5`, `py-2.5`, `gap-14`
- Space between groups is at least 1.5× the space inside them; a container's padding is never smaller than the
  gap between its children

**Rationale**: preset values keep spacing and type consistent across pages and follow theme changes. The Claude
Design comps follow the same rule, so a port should not need arbitrary values.
