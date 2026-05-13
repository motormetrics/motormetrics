---
name: typography-spacing-enforcer
description: Enforce HeroUI Text usage and modern spacing conventions. Use when implementing new UI components to ensure design consistency with project standards.
---

# Typography & Spacing Enforcer Skill

This Skill ensures all UI components follow the project's HeroUI Text conventions and modern spacing conventions for consistent design.

## When to Activate

- After creating new UI components
- When refactoring existing components
- During code reviews before PR approval
- When migrating legacy code to new standards

## What to Check

### Typography Violations

**Raw HTML Headings**:
- ❌ `<h1>`, `<h2>`, `<h3>`, `<h4>`
- ✅ `<Text type="h1">`, `<Text type="h2">`, `<Text type="h3">`, `<Text type="h4">`

**Raw Paragraph Tags**:
- ❌ `<p className="text-lg">...</p>`
- ✅ `<Text type="body">`, `<Text type="body-sm" color="muted">`

**Incorrect Heading Hierarchy**:
- Multiple H1 elements on a page
- Skipping heading levels (H1 → H3)
- Using wrong semantic level for content

**Missing Semantic Colors**:
- Components should use HeroUI semantic colors:
  - `text-foreground` (primary text)
  - `text-default-900` (strong emphasis)
  - `text-default-600` (secondary text)
  - `text-default-500` (metadata)

### Spacing Violations

**Space-y Utilities** (Legacy Pattern):
- ❌ `<div className="space-y-4">`
- ✅ `<div className="flex flex-col gap-4">`

**Margin-Top on Siblings**:
- ❌ `<CardComponent className="mt-4" />`
- ✅ Parent uses `flex flex-col gap-4`

**Odd Gap Values**:
- ❌ `gap-1`, `gap-3`, `gap-5` (without justification)
- ✅ `gap-2`, `gap-4`, `gap-6`, `gap-8`

**Redundant Height/Width** (Tailwind v3.4+):
- ❌ `<div className="h-4 w-4">` (equal dimensions)
- ✅ `<div className="size-4">` (use size-* utility)
- ⚠️ Exception: Different dimensions still use `h-*` and `w-*` (e.g., `h-4 w-6`)

**Exception**: `mt-*` is acceptable ONLY for icon alignment with text (e.g., `<Icon className="mt-1" />`)

## Actions Performed

1. **Scan Component Files**: Use Grep to find violations
2. **Report Violations**: List each issue with file:line reference
3. **Provide Auto-Fix Suggestions**: Show before/after code examples
4. **Check Text Imports**: Ensure `Text` is imported from `@heroui/react`
5. **Check Size Utility Usage**: Detect `h-* w-*` patterns with equal values and suggest `size-*`

## Example Output

```
Typography & Spacing Violations Found:

src/app/(main)/(dashboard)/coe/components/category-card.tsx:15
❌ <h3 className="text-2xl">Category A</h3>
✅ <Text type="h3">Category A</Text>

src/components/charts/trend-chart.tsx:42
❌ <div className="space-y-4">
✅ <div className="flex flex-col gap-4">

src/app/blog/_components/post-list.tsx:28
❌ <PostCard className="mt-6" />
✅ Parent should use: <div className="flex flex-col gap-6">

src/components/icons/search-icon.tsx:8
❌ <svg className="h-4 w-4">
✅ <svg className="size-4">
```

## Spacing Scale Reference

- `gap-2` (0.5rem / 8px) - Small spacing, compact lists
- `gap-4` (1rem / 16px) - Standard spacing, most common
- `gap-6` (1.5rem / 24px) - Medium spacing, section groups
- `gap-8` (2rem / 32px) - Large spacing, major sections

## Typography Components Reference

**Headings**:
- `<Text type="h1">` - Page titles
- `<Text type="h2">` - Section titles
- `<Text type="h3">` - Card titles and subsections
- `<Text type="h4">` - Nested sections and compact card titles

**Body Text**:
- `<Text type="body">` - Standard body
- `<Text type="body-sm" color="muted">` - Secondary info

**UI Labels**:
- `<Text type="body-sm" weight="medium">` - Labels and tabs
- `<Text type="body-xs" color="muted">` - Metadata and timestamps

## Tools Used

- **Grep**: Search for violation patterns across component files
- **Read**: Examine specific files for detailed analysis
- **Glob**: Find all component files in specific directories

## Target Directories

- `src/app/**/_components/` (co-located components)
- `src/components/` (shared components)
