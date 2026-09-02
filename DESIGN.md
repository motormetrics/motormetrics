---
version: "alpha"
name: MotorMetrics
description: >-
  Singapore vehicle data platform. Warm-cream canvas with a slate-blue accent,
  built on hex tokens and HeroUI v3 (Tailwind CSS v4). Minimal, high-contrast,
  data-first.
colors:
  background: "#f7f5ef"
  foreground: "#232a2e"
  surface: "#ffffff"
  overlay: "#ffffff"
  muted: "#505a5d"
  default: "#f0f3f4"
  accent: "#4e7c9b"
  accent-foreground: "#ffffff"
  success: "#57b45f"
  success-foreground: "#232a2e"
  warning: "#e9a63c"
  warning-foreground: "#232a2e"
  danger: "#e96e6e"
  danger-foreground: "#232a2e"
  border: "#e5e1d5"
  separator: "#e5e1d5"
  focus: "#4e7c9b"
  chart-1: "#33586f"
  chart-2: "#c9803f"
  chart-3: "#5f8ba8"
  chart-4: "#7a9e63"
  chart-5: "#9cc4da"
  chart-6: "#b0728f"
  chart-grid: "{colors.border}"
typography:
  h1:
    fontFamily: "Urbanist"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.025em
  h2:
    fontFamily: "Urbanist"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 36px
    letterSpacing: -0.025em
  h3:
    fontFamily: "Urbanist"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 32px
    letterSpacing: -0.025em
  h4:
    fontFamily: "Urbanist"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: -0.025em
  body-lg:
    fontFamily: "Urbanist"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Urbanist"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 28px
  body-sm:
    fontFamily: "Urbanist"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 24px
  label:
    fontFamily: "Urbanist"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
  caption:
    fontFamily: "Urbanist"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.25
  caption-mono:
    fontFamily: "Urbanist"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
rounded:
  base: "1.375rem"
  field: "1.375rem"
  pill: "9999px"
spacing:
  base: "0.25rem"
components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: 40px
    padding: "0 20px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.danger-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: 40px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.base}"
  chip:
    rounded: "{rounded.pill}"
  chip-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success-foreground}"
    rounded: "{rounded.pill}"
  chip-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.warning-foreground}"
    rounded: "{rounded.pill}"
  chip-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.danger-foreground}"
    rounded: "{rounded.pill}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    height: 40px
  modal:
    backgroundColor: "{colors.overlay}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.base}"
---

# MotorMetrics Design System

> **Source of truth.** The canonical token values are defined in
> `apps/web/src/app/globals.css` (`:root` for light, `.dark` for dark). This
> document transcribes those shipped values; if the two ever diverge,
> `globals.css` wins and this file should be updated to match.
>
> This file is now the only prose description of the palette. The skills that used
> to carry competing colour tables (`design-language-system`, `ui-design-system`,
> with their "Navy Blue" `#191970` / Cyan `#00FFFF` values) have been deleted
> rather than reconciled — there is no second source to keep in sync.

## Overview

MotorMetrics is minimal, high-contrast and data-first — lineage from Geist
(Vercel), Linear and Stripe. Hierarchy comes from **size and spacing** on a fixed
scale, not from decoration or per-page tuning. Restrained colour: a single
slate-blue accent on a warm cream canvas, and status colours reserved for meaning.

Light and dark themes share identical token *names* with different *values*
(`:root` vs `.dark` / `[data-theme="dark"]`). Components consume tokens through
HeroUI v3 semantic classes, never raw hex.

## Colors

Colour is referenced through semantic roles, surfaced as both CSS variables
(`var(--accent)`) and HeroUI/Tailwind utilities (`bg-surface`, `text-foreground`,
`text-muted`, `border-default`). Tokens are plain hex, authored from the Claude
Design token set.

> **Brand colour is `--accent`, not `primary`.** HeroUI v3 defines no `--primary`
> token; its `primary`-named variants (e.g. `Button` `color="primary"`) resolve to
> `--accent` internally. This project standardises on `accent` directly
> (`bg-accent`, `text-accent`, `color="accent"`) — there is intentionally no
> `primary` token to declare.

| Role | Token | Light | Dark |
|------|-------|-------|------|
| Background | `--background` | `#f7f5ef` (warm cream) | `#1a2024` |
| Foreground | `--foreground` | `#232a2e` (`--eclipse`) | `#f1f0ea` |
| Surface (cards) | `--surface` | `#ffffff` | `#232a2e` |
| Surface secondary (rails, wells) | `--surface-secondary` | `#efece3` (warm sand) | `#2a3237` |
| Overlay (popovers/modals) | `--overlay` | `#ffffff` | `#2a3237` |
| Muted (secondary body text) | `--muted` | `#505a5d` (6.00:1) | `#9aa6ab` (5.23:1) |
| Subtle (meta labels) | `--subtle` | `#5f6b71` (4.64:1) | `#939da1` (4.71:1) |
| Default (neutral fill) | `--default` | `#f0f3f4` | `#2e373c` |
| Accent | `--accent` | `#4e7c9b` (slate blue) | `#6fa0c0` |
| Accent strong (text/links) | `--accent-strong` | `#33586f` | `#4e7c9b` |
| Success | `--success` | `#57b45f` | same |
| Warning | `--warning` | `#e9a63c` | same |
| Danger | `--danger` | `#e96e6e` | same |
| Border / Separator | `--border` / `--separator` | `#e5e1d5` | `#333c41` |
| Focus | `--focus` | = `--accent` | = `--accent` |

**Chart palette** — six **categorical** hues for distinguishing series (not a
ranked ramp), plus `--chart-grid` (= `--border`):

| Token | Value | Hue |
|-------|-------|-----|
| `--chart-1` | `#33586f` | slate |
| `--chart-2` | `#c9803f` | ochre |
| `--chart-3` | `#5f8ba8` | blue |
| `--chart-4` | `#7a9e63` | green |
| `--chart-5` | `#9cc4da` | pale blue |
| `--chart-6` | `#b0728f` | mauve |

Charts are capped at **six series** to match the palette; single-highlight charts
use `--chart-1` for the emphasised element and `bg-default` for the rest.

**Rules.** Never hardcode hex in components. Use semantic classes
(`text-foreground`, `text-muted`, `bg-surface`, `border-default`) or
`var(--chart-N)` for series colours. Reserve `text-white` for image overlays.

## Typography

One family: **Urbanist** (`--font-urbanist`, mapped onto `--font-sans`), loaded in
`apps/web/src/app/layout.tsx` and used for UI, prose and tabular data alike.
Hierarchy is driven by size and weight restraint:

- **Bold (700)** — headings (`H1`, `H2`, `H3`) and data emphasis (metric numbers)
- **Semibold (600)** — nested headings (`H4`)
- **Medium (500)** — UI labels (`Label`)
- **Normal (400)** — body text (`Text*`, `Caption`)

The weight ramp is flat by design: separation between levels comes from the size
step, not from stacking weights on top of it.

The front-matter `typography` tokens carry concrete `fontFamily`, `fontSize`,
`fontWeight`, `lineHeight`, and `letterSpacing` for each level. The components come
from HeroUI (`import { Typography } from "@heroui/react"`) — there is no local
Typography module; the one that lived at `apps/web/src/components/typography.tsx`
was deleted. Only three subcomponents are in use:

| Component | Token | Element | Notes |
|-----------|-------|---------|-------|
| `Typography.Heading level={1}` | `h1` | `<h1>` | Page title, one per page |
| `Typography.Heading level={2}` | `h2` | `<h2>` | Section title |
| `Typography.Heading level={3}` | `h3` | `<h3>` | Card title / subsection |
| `Typography.Heading level={4}` | `h4` | `<h4>` | Nested heading, `Card.Header` titles |
| `Typography.Paragraph size="lg"` | `body-lg` | `<p>` | Lead paragraph |
| `Typography.Paragraph` | `body` | `<p>` | Body |
| `Typography.Paragraph color="muted" size="sm"` | `body-sm` | `<p>` | Helper / description text |
| `Typography.Paragraph color="muted" size="xs"` | `caption` | `<p>` | Metadata, timestamps |
| `Typography.Code` | `caption-mono` | `<code>` | Inline code |

There is no `Typography.H1`–`H4`, `TextLg`, `Text`, `TextSm`, `Label` or `Caption` —
those were the local module's API and are gone.

`caption-mono` applies the caption metrics to inline code (`Typography.Code`) and
to tabular figures where numbers must align. There is no separate mono family —
Urbanist is the single typeface; use `tabular-nums` for figure alignment.

Use `Typography.*` rather than raw heading tags everywhere except MDX blog
content and image-overlay text.

**Stay on the scale.** Do not pass an arbitrary type value at the call site —
`text-[2.125rem]`, `tracking-[-0.02em]`, `leading-[1.65]` and friends. Snap to
the nearest stock Tailwind step and accept the small difference; comps are a
reference, not a specification to the pixel. If a whole level wants a different
value, change the default in `typography.tsx` so every page moves together.
Colour and layout classes (`text-muted`, `max-w-prose`, `truncate`) are fine to
pass; size, weight, tracking and leading are the scale's business.

## Layout

A 4px base scale (`--spacing: 0.25rem`). Use **even** `gap-*` values and
flex/grid gaps rather than margin-based spacing:

- `gap-2` (8px) — compact groups · `gap-4` (16px) — default · `gap-6` (24px) —
  section groups · `gap-8` (32px) — major sections.
- Prefer `flex flex-col gap-*` over `space-y-*`; avoid `margin-top` for sibling
  spacing (exception: `mt-1` for icon/text optical alignment).

The reasoning: `gap-*` is predictable under flexbox/grid and avoids margin
collapsing.

## Elevation & Depth

Depth comes from tonal surfaces and three shadow tiers, not heavy drop shadows:

| Token | Use | Light value |
|-------|-----|-------------|
| `--surface-shadow` | Cards, accordions | `0 2px 4px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.06), 0 0 1px rgba(0,0,0,.06)` |
| `--overlay-shadow` | Popovers, menus, modals | `0 4px 16px rgba(24,24,27,.08), 0 8px 24px rgba(24,24,27,.09)` |
| `--field-shadow` | Inputs | same as surface |

In dark mode all three flatten to `0 0 0 0 transparent inset` — hierarchy is
carried by surface tone (`--surface` / `--overlay`) instead.

## Motion

Custom page and chart animation uses Framer Motion via shared variants in
`apps/web/src/config/animations.ts`. HeroUI v3 itself needs no Framer Motion.

- Standard easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard-out).
- Durations: 0.4s (fade/scale/stagger items), 0.5s (`fadeInUpVariants`).
- Variants: `fadeInVariants`, `fadeInUpVariants` (opacity + `y:16`),
  `staggerContainerVariants` (0.08s stagger, 0.1s delay), `staggerItemVariants`,
  `scaleInVariants` (scale `0.95 → 1`).
- Use `initial`/`animate` for entrance, `whileInView` (`viewport once`) for
  scroll reveals. Keep hover states and infinite loops in CSS, not Motion.

## Shapes

Radius scale: `--radius: 0.5rem` (8px) for everyday controls; `--field-radius`
(= `radius × 1.5`, 12px) for inputs; `rounded-full` (9999px) for pills and
status chips; `rounded-2xl`/`rounded-3xl` for large dashboard cards. Don't mix
sharp and rounded corners within a single view.

## Components

Built on HeroUI v3 — OSS (`@heroui/react`) compound components plus HeroUI Pro
(`@heroui-pro/react`) for KPI/metrics and charts. Use HeroUI defaults for
radius/padding/shadow; override only to communicate hierarchy.

> **How tokens reach components.** The front-matter `components` map records each
> component's primary token bindings, but components don't read this file at
> runtime — they consume the tokens through HeroUI's global `@theme inline`
> mapping in `globals.css` and semantic classes/props (`bg-accent`,
> `text-foreground`, `color="accent"`). HeroUI Pro components inherit the same
> semantic token set as OSS (there is no separate Pro palette); charts use the
> `--chart-1…6` ramp. This is why several colour tokens here are not bound to a
> single component — they're consumed app-wide (e.g. `muted`, `default`,
> `border`, `separator`, `focus`, and the `--chart-*` ramp), not per-component.

- **Button** — `rounded-full` pill. `color="accent"` (filled brand; HeroUI's
  `primary` variant resolves to `--accent`), `variant="bordered"` (outline),
  `variant="light"` (ghost). `button-danger` binds the destructive variant
  (`--danger` fill, `--danger-foreground` label). Disabled at
  `--disabled-opacity: 0.5`.
- **Card** — HeroUI defaults (`--surface` background, `--foreground` text, base
  radius, `--surface-shadow`); `Card.Header` uses `Typography.Heading level={4}` +
  `Typography.Paragraph color="muted" size="sm"`.
- **Chip** — `rounded-full` status badge; `color="success|warning|danger"` with a
  leading dot. Never signal state by colour alone — pair with text/icon. The
  token map binds `chip-success` / `chip-warning` / `chip-danger` to the status
  pairs; the base `chip` is radius-only.
- **Field (Input/Select)** — `--field-radius` (12px), `--field-border-width: 0`,
  `--field-background` white (light) / `--default` (dark).
- **Modal/Popover** — `--overlay` background, `--foreground` text, base radius,
  `--overlay-shadow`. The token map binds `modal` to the overlay pair.
- **Focus** — every interactive element shows a focus ring: `--ring-offset-width: 2px`
  with `--focus` (= accent) colour.

## Do's and Don'ts

- **Do** maintain WCAG AA contrast — 4.5:1 normal text, 3:1 large text / focus indicators.
- **Do** show a focus ring on all interactive elements.
- **Do** use semantic tokens (`bg-surface`, `text-muted`, `var(--chart-N)`) — never raw hex.
- **Do** use `Typography.*` components instead of raw `<h1>`–`<h4>` (except MDX/overlays).
- **Do** use `flex … gap-*`; **don't** use `space-y-*` or sibling `margin-top`.
- **Don't** signal state by colour alone.
- **Don't** mix sharp and rounded corners in one view.
- **Don't** exceed six chart series (the ramp only defines `--chart-1`…`--chart-6`).
