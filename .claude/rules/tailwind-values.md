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
- ✅ Tables with fixed columns: flex rows sharing preset-width cell classes (`w-5`, `w-28`, `min-w-0 flex-1`)
  rather than a px grid template
- ❌ Arbitrary values: `gap-[18px]`, `text-[1.75rem]`, `tracking-[-0.03em]`
- ❌ Custom breakpoints: `max-[720px]`, `min-[901px]`, including in `matchMedia` queries; write
  `(width < 48rem)` for `max-md`
- ❌ Off-scale steps, even though Tailwind v4 compiles any multiple of `--spacing`: `gap-4.5`, `w-22`, `h-50`
- ⚠️ Exception: a value with no preset at all, such as a column ratio (`grid-cols-[1.35fr_1fr]`) or a
  selector (`nth-[n+3]`), may stay arbitrary

**Rationale**: preset values keep spacing and type consistent across pages and follow theme changes. The Claude
Design comps follow the same rule, so a port should not need arbitrary values.
