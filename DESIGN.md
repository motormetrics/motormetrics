---
version: "alpha"
name: MotorMetrics
description: >-
  Singapore vehicle data platform. Geist-derived visual identity built on OKLCH
  tokens and HeroUI v3 (Tailwind CSS v4). Minimal, high-contrast, data-first.
colors:
  background: "oklch(0.9592 0.0072 253.27)"
  foreground: "oklch(0.3103 0.0197 264.23)"
  surface: "oklch(100% 0 0)"
  overlay: "oklch(100% 0 0)"
  muted: "oklch(0.5564 0.0398 256.82)"
  default: "oklch(0.9258 0.0132 255.03)"
  accent: "oklch(0.2894 0.1433 272.9)"
  accent-foreground: "oklch(100% 0 0)"
  success: "oklch(0.7205 0.192 149.49)"
  success-foreground: "oklch(0.3103 0.0197 264.23)"
  warning: "oklch(0.7697 0.1645 70.61)"
  warning-foreground: "oklch(0.3103 0.0197 264.23)"
  danger: "oklch(0.5786 0.2137 27.17)"
  danger-foreground: "oklch(100% 0 0)"
  border: "oklch(0.9258 0.0132 255.03)"
  separator: "oklch(0.9258 0.0132 255.03)"
  focus: "oklch(0.2894 0.1433 272.9)"
  chart-1: "oklch(0.2894 0.1433 272.9)"
  chart-2: "oklch(0.4018 0.1119 263.29)"
  chart-3: "oklch(0.5138 0.102 263.13)"
  chart-4: "oklch(0.5872 0.0334 248.17)"
  chart-5: "oklch(0.7159 0.0358 256.79)"
  chart-6: "oklch(0.8064 0.0226 251.2)"
  chart-grid: "{colors.border}"
typography:
  h1:
    fontFamily: "Geist Sans"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.025em
  h2:
    fontFamily: "Geist Sans"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 36px
    letterSpacing: -0.025em
  h3:
    fontFamily: "Geist Sans"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 32px
    letterSpacing: -0.025em
  h4:
    fontFamily: "Geist Sans"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: -0.025em
  body-lg:
    fontFamily: "Geist Sans"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Geist Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 28px
  body-sm:
    fontFamily: "Geist Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 24px
  label:
    fontFamily: "Geist Sans"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
  caption:
    fontFamily: "Geist Sans"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.25
  caption-mono:
    fontFamily: "Geist Mono"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
rounded:
  base: "0.5rem"
  field: "0.75rem"
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
> **Known stale docs (do not trust for colour):** the colour tables in
> `.claude/skills/design-language-system/SKILL.md` (HSL "Navy Blue" `#191970`)
> and `apps/web/CLAUDE.md` (Cyan accent `#00FFFF`) predate the current OKLCH
> palette. The shipped accent is a violet, `oklch(0.2894 0.1433 272.9)`.
> Reconciling those files is tracked separately and out of scope for this doc.

## Overview

MotorMetrics is minimal, high-contrast and data-first — lineage from Geist
(Vercel), Linear and Stripe. Hierarchy comes from **size and spacing**, not heavy
weights or decoration. Restrained colour: a single violet accent, neutral
surfaces, and status colours reserved for meaning.

Light and dark themes share identical token *names* with different *values*
(`:root` vs `.dark` / `[data-theme="dark"]`). Components consume tokens through
HeroUI v3 semantic classes, never raw hex.

## Colors

Colour is referenced through semantic roles, surfaced as both CSS variables
(`var(--accent)`) and HeroUI/Tailwind utilities (`bg-surface`, `text-foreground`,
`text-muted`, `border-default`). Tokens are OKLCH for perceptual uniformity and
wide-gamut accuracy.

> **Brand colour is `--accent`, not `primary`.** HeroUI v3 defines no `--primary`
> token; its `primary`-named variants (e.g. `Button` `color="primary"`) resolve to
> `--accent` internally. This project standardises on `accent` directly
> (`bg-accent`, `text-accent`, `color="accent"`) — there is intentionally no
> `primary` token to declare.

| Role | Token | Light | Dark |
|------|-------|-------|------|
| Background | `--background` | `oklch(0.9592 0.0072 253.27)` | `oklch(0.1371 0.036 258.53)` |
| Foreground | `--foreground` | `oklch(0.3103 0.0197 264.23)` (`--eclipse`) | `oklch(0.9838 0.0035 247.86)` |
| Surface (cards) | `--surface` | `oklch(100% 0 0)` | `oklch(0.28 0.0369 259.97)` |
| Overlay (popovers/modals) | `--overlay` | `oklch(100% 0 0)` | `oklch(0.3037 0.0413 259.96)` |
| Muted | `--muted` | `oklch(0.5564 0.0398 256.82)` | `oklch(0.7107 0.0351 256.79)` |
| Default (fills/borders) | `--default` | `oklch(0.9258 0.0132 255.03)` | `oklch(0.28 0.0369 259.97)` |
| Accent | `--accent` | `oklch(0.2894 0.1433 272.9)` | same |
| Success | `--success` | `oklch(0.7205 0.192 149.49)` | same |
| Warning | `--warning` | `oklch(0.7697 0.1645 70.61)` | same |
| Danger | `--danger` | `oklch(0.5786 0.2137 27.17)` | `oklch(0.3959 0.1331 25.72)` |
| Border / Separator | `--border` / `--separator` | `oklch(0.9258 0.0132 255.03)` | `oklch(0.28 0.0369 259.97)` |
| Focus | `--focus` | = `--accent` | = `--accent` |

**Chart palette** — a six-step accent→neutral ramp for ranked data
visualisation (`--chart-1` highest rank → `--chart-6` lowest), plus
`--chart-grid` (= `--border`):

| Token | Value |
|-------|-------|
| `--chart-1` | `oklch(0.2894 0.1433 272.9)` |
| `--chart-2` | `oklch(0.4018 0.1119 263.29)` |
| `--chart-3` | `oklch(0.5138 0.102 263.13)` |
| `--chart-4` | `oklch(0.5872 0.0334 248.17)` |
| `--chart-5` | `oklch(0.7159 0.0358 256.79)` |
| `--chart-6` | `oklch(0.8064 0.0226 251.2)` |

Charts are capped at **six series** to match the ramp; single-highlight charts
use `--chart-1` for the emphasised element and `bg-default` for the rest.

**Rules.** Never hardcode hex in components. Use semantic classes
(`text-foreground`, `text-muted`, `bg-surface`, `border-default`) or
`var(--chart-N)` for series colours. Reserve `text-white` for image overlays.

## Typography

Two families: **Geist Sans** (`--font-geist-sans`) for UI and prose, **Geist
Mono** (`--font-geist-mono`) for code and tabular data. Hierarchy is driven by
size and weight restraint:

- **Semibold (600)** — primary headings (`H1`, `H2`)
- **Medium (500)** — secondary headings and labels (`H3`, `H4`, `Label`)
- **Normal (400)** — body text (`Text*`, `Caption`)
- **Bold** — reserved for data emphasis (metric numbers)

The front-matter `typography` tokens carry concrete `fontFamily`, `fontSize`,
`fontWeight`, `lineHeight`, and `letterSpacing` for each level. The canonical
component scale lives in `apps/web/src/components/typography.tsx` (`Typography.*`):

| Component | Token | Element | Classes |
|-----------|-------|---------|---------|
| `H1` | `h1` | Page title (one per page) | `font-semibold text-4xl lg:text-5xl tracking-tight text-foreground` |
| `H2` | `h2` | Section title | `font-semibold text-3xl tracking-tight text-foreground` |
| `H3` | `h3` | Card title / subsection | `font-medium text-2xl tracking-tight text-foreground` |
| `H4` | `h4` | Nested heading | `font-medium text-xl tracking-tight text-foreground` |
| `TextLg` | `body-lg` | Lead paragraph | `text-lg leading-relaxed text-foreground` |
| `Text` | `body` | Body | `text-base leading-7 text-foreground` |
| `TextSm` | `body-sm` | Helper text | `text-sm leading-6 text-muted` |
| `Label` | `label` | Form / nav label | `font-medium text-sm leading-none text-foreground` |
| `Caption` | `caption` | Metadata / timestamps | `text-xs leading-tight text-muted` |

`caption-mono` pairs Geist Mono with the caption metrics for inline code
(`InlineCode`) and tabular figures where numbers must align.

Use `Typography.*` rather than raw heading tags everywhere except MDX blog
content and image-overlay text.

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
  radius, `--surface-shadow`); `Card.Header` uses `Typography.H4` +
  `Typography.TextSm`.
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
