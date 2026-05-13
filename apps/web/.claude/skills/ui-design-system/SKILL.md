---
name: ui-design-system
description: Enforce modern dashboard UI patterns with pill-shaped design, professional colour scheme, and typography standards. Use when building or reviewing UI components for the web application.
---

# UI Design System Skill

This skill enforces consistent UI patterns across the MotorMetrics web application, ensuring a modern, professional dashboard design.

## When to Activate

- Building new dashboard components or pages
- Reviewing existing UI for consistency
- Implementing navigation, cards, buttons, or metrics displays
- Applying colour scheme or typography
- Creating new features that require UI components
- Migrating or refactoring existing components

## Design Principles

1. **No sidebar** - Horizontal pill navigation only
2. **Pill-shaped elements** - Use `rounded-full` for interactive elements
3. **Large rounded cards** - Use `rounded-2xl` or `rounded-3xl`
4. **Professional automotive aesthetic** - Navy Blue primary, clean typography
5. **Generous whitespace** - Grid-based layouts with `gap-6` or `gap-8`

## Colour Palette (GitHub Issue #406)

| Role | Colour | Hex | Tailwind Class |
|------|--------|-----|----------------|
| Primary | Navy Blue | `#191970` | `bg-primary`, `text-primary` |
| Secondary | Slate Gray | `#708090` | `bg-secondary`, `text-secondary` |
| Accent | Cyan | `#00FFFF` | `bg-accent`, `text-accent` |
| Background | Powder Blue | `#B0E0E6` | `bg-background` |
| Text | Dark Slate Gray | `#2F4F4F` | `text-foreground` |

### Semantic Colour Usage

- `text-primary` / `bg-primary` - Brand elements, primary buttons
- `text-foreground` - Body text (Dark Slate Gray)
- `text-default-900` - Strong emphasis (H4 headings)
- `text-default-600` - Secondary text (TextSm)
- `text-default-500` - Captions, metadata

### Opacity Scale

- `text-foreground/60` - Secondary text
- `text-foreground/40` - Muted text
- `text-white` - Only for image overlays

## Component Patterns

### Navigation (Horizontal Pill Tabs)

```tsx
<div className="flex items-center gap-2 rounded-full border p-1">
  <Button className="rounded-full" color="primary">Dashboard</Button>
  <Button className="rounded-full" variant="light">Calendar</Button>
  <Button className="rounded-full" variant="light">Projects</Button>
</div>
```

### Cards

```tsx
import { Card, Text } from "@heroui/react";

<Card>
  <Card.Header className="flex flex-col items-start gap-2">
    <Text type="h4">Card Title</Text>
    <Text type="body-sm" color="muted">Description text</Text>
  </Card.Header>
  <Card.Content>{/* Content */}</Card.Content>
</Card>
```

### Buttons

- Primary: `<Button className="rounded-full" color="primary">Action</Button>`
- Secondary: `<Button className="rounded-full" variant="bordered">Cancel</Button>`
- Icon: `<Button className="rounded-full" isIconOnly><Icon /></Button>`

### Status Badges

```tsx
<Chip className="rounded-full" color="success" size="sm">
  <span className="mr-1">●</span> Done
</Chip>
<Chip className="rounded-full" color="warning" size="sm">
  <span className="mr-1">●</span> Waiting
</Chip>
<Chip className="rounded-full" color="danger" size="sm">
  <span className="mr-1">●</span> Failed
</Chip>
```

### Metrics Display

```tsx
import { Chip, Text } from "@heroui/react";

<div className="flex flex-col gap-1">
  <Text type="body-xs" color="muted">Total Registrations</Text>
  <div className="flex items-baseline gap-2">
    <span className="font-bold text-3xl">46,500</span>
    <Chip className="rounded-full" color="success" size="sm">+2.5%</Chip>
  </div>
</div>
```

## Typography Rules

Use HeroUI `Text` directly from `@heroui/react`:

| Need | Component |
|------|-----------|
| Page titles | `<Text type="h1">` |
| Section titles | `<Text type="h2">` |
| Subsection/card titles | `<Text type="h3">` or `<Text type="h4">` |
| Body text | `<Text type="body">` |
| Secondary text | `<Text type="body-sm" color="muted">` |
| Metadata | `<Text type="body-xs" color="muted">` |
| Inline code | `<Text.Code>` |

### Enforcement Rules

- ✅ Use `<Text type="h4">` for `Card.Header` titles
- ✅ Use `<Text type="body-sm" color="muted">` for `Card.Header` descriptions
- ✅ Use `<Text type="h2">` for section headings
- ❌ Avoid raw `<h1>`, `<h2>`, `<h3>`, `<h4>` tags outside MDX content
- ⚠️ Exception: Raw tags allowed for MDX blog content and image overlays

## Layout Guidelines

### Spacing

- Use `flex flex-col gap-*` for vertical spacing (not `space-y-*`)
- Standard gaps: `gap-2`, `gap-4`, `gap-6`, `gap-8`
- Avoid `margin-top` for sibling spacing

### Grid Layouts

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>{/* ... */}</Card>
  <Card>{/* ... */}</Card>
  <Card>{/* ... */}</Card>
</div>
```

## Anti-Patterns (What NOT to Do)

### Navigation
- ❌ Vertical sidebar navigation
- ❌ Square/rectangular tabs
- ❌ Dropdown-only navigation

### Cards
- ❌ Sharp corners (`rounded-none`, `rounded-sm`)
- ❌ Heavy shadows (`shadow-lg`, `shadow-xl`)
- ❌ Raw `<h3>` tags in `Card.Header`

### Buttons
- ❌ Square buttons (`rounded-none`, `rounded-md`)
- ❌ Hardcoded colours (`bg-blue-500`)
- ❌ Missing hover states

### Colours
- ❌ Hardcoded hex values in components
- ❌ `text-white` outside image overlays
- ❌ Inconsistent opacity values

### Spacing
- ❌ `space-y-*` utilities
- ❌ `mt-*` for sibling spacing
- ❌ Odd gap values (`gap-3`, `gap-5`, `gap-7`)

## Tools Used

- **Read**: Examine existing component implementations
- **Grep**: Find similar patterns in codebase
- **Context7 MCP**: Fetch latest HeroUI documentation
  - `mcp__context7__resolve-library-id` - Find library ID
  - `mcp__context7__get-library-docs` - Get component docs

## Accessibility Requirements (WCAG AA)

- Normal text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio
- Interactive elements: Minimum 3:1 for focus indicators
- Information must not be conveyed by colour alone
- All interactive elements must be keyboard accessible

## Related Documentation

- `apps/web/CLAUDE.md` - Full UI guidelines
- GitHub Issue #406 - Colour scheme specification
- HeroUI documentation - Component API reference
