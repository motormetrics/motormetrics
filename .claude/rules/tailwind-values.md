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

**Rationale**: preset values keep spacing and type consistent across pages and follow theme changes. The Claude
Design comps follow the same rule, so a port should not need arbitrary values.
