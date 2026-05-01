---
name: component-docs
description: Generate or update component documentation with usage examples, props tables, and Storybook stories. Use when documenting new components, creating usage examples, or setting up Storybook stories.
allowed-tools: Read, Edit, Write, Grep, Glob
---

# Component Documentation Skill

Component documentation lives next to local components in `apps/web/src/components` or the relevant route segment. For HeroUI components, link to the official HeroUI v3 docs instead of documenting third-party internals.

## Component Documentation Template

```markdown
# Button

A reusable local component or wrapper used by MotorMetrics.

## Usage

\`\`\`tsx
import { Button } from "@heroui/react";

<Button variant="primary">Click me</Button>
\`\`\`

## Variants

\`\`\`tsx
<Button variant="primary">Primary</Button>
<Button variant="danger">Delete</Button>
<Button variant="outline">Outline</Button>
\`\`\`

## Sizes

\`\`\`tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `"primary" \| "danger" \| "outline"` | `"primary"` | Visual style |
| size | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| asChild | `boolean` | `false` | Render as child element |

## Accessibility

- Uses semantic `<button>` element
- Supports keyboard navigation (Enter, Space)
- Proper focus states
```

## JSDoc Comments

```typescript
/**
 * A customizable button component.
 *
 * @example
  * <Button variant="primary">Click me</Button>
 */
export interface ButtonProps {
  /** Visual style variant @default "primary" */
  variant?: "primary" | "danger" | "outline";
  /** Button size @default "default" */
  size?: "default" | "sm" | "lg" | "icon";
}
```

## Storybook Stories

```typescript
// apps/web/src/components/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "danger", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Button" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
```

## Documentation Checklist

- [ ] JSDoc comments on component and props
- [ ] Markdown documentation with usage examples
- [ ] Props table included
- [ ] Variants documented
- [ ] Accessibility notes
- [ ] Storybook stories (if using Storybook)

## Best Practices

1. **Clear Examples**: Provide complete, working code
2. **Props Documentation**: Document every prop with type and description
3. **Accessibility**: Include a11y notes
4. **Keep Updated**: Update docs when components change

## References

- HeroUI v3 docs: https://www.heroui.com/docs/react
