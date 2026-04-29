# MotorMetrics - Shared UI Component Library

## Project Overview

This is the shared UI component library (v4.16.3) for the MotorMetrics monorepo, built with shadcn/ui components, Radix UI primitives, and Tailwind CSS. The package provides reusable UI components that can be consumed by any application in the monorepo, ensuring consistent design and reducing code duplication.

## Package Information

- **Package Name**: `@motormetrics/ui`
- **Version**: 4.16.3
- **Type**: ESM (ES Module)
- **License**: MIT

## Architecture

### Tech Stack

- **Component Library**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS v4.1.11 with PostCSS
- **Icons**: Lucide React v0.482.0
- **Utilities**:
  - class-variance-authority (CVA) for component variants
  - clsx and tailwind-merge for conditional class merging
  - tw-animate-css for Tailwind animations

### Package Structure

```
packages/ui/
├── src/
│   ├── components/     # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   └── tooltip.tsx
│   ├── hooks/         # Custom React hooks
│   │   └── use-mobile.ts
│   ├── lib/           # Utility functions
│   │   └── utils.ts
│   └── styles/        # Global styles
│       └── globals.css
├── biome.json         # Biome configuration
├── components.json    # shadcn/ui configuration
├── package.json       # Package manifest with exports
├── postcss.config.mjs # PostCSS configuration
└── tsconfig.json      # TypeScript configuration
```

## Package Exports

The package uses explicit exports to control what can be imported:

```json
{
  "./globals.css": "./src/styles/globals.css",
  "./postcss.config": "./postcss.config.mjs",
  "./lib/*": "./src/lib/*.ts",
  "./components/*": "./src/components/*.tsx",
  "./hooks/*": "./src/hooks/*.ts"
}
```

### Usage in Consuming Applications

```typescript
// Import components
import { Button } from "@motormetrics/ui/components/button";
import { Card, CardHeader, CardContent } from "@motormetrics/ui/components/card";

// Import utilities
import { cn } from "@motormetrics/ui/lib/utils";

// Import hooks
import { useMobile } from "@motormetrics/ui/hooks/use-mobile";

// Import global styles (in root layout or _app)
import "@motormetrics/ui/globals.css";
```

## Available Components

### Core Components

- **badge**: Small status indicators with variants (default, secondary, destructive, outline)
- **button**: Primary interactive element with variants (default, destructive, outline, secondary, ghost, link)
- **card**: Container with header, content, footer sections
- **dialog**: Modal dialog with overlay
- **input**: Form input field
- **label**: Form label element
- **separator**: Visual divider
- **skeleton**: Loading placeholder
- **switch**: Toggle switch control

### Complex Components

- **dropdown-menu**: Contextual dropdown with items, checkboxes, radio groups, sub-menus
- **progress**: Progress bar indicator
- **sheet**: Slide-in panel from edges (top, right, bottom, left)
- **sidebar**: Collapsible navigation sidebar with menu structure
- **table**: Data table with header, body, footer, caption
- **tooltip**: Hover tooltips

### Available Hooks

- **use-mobile**: Detects mobile viewport (< 768px) using media query

### Available Utilities

- **cn()**: Combines clsx and tailwind-merge for conditional class merging

## Code Style and Conventions

- **TypeScript**: Strict mode enabled
- **Formatting**: Biome with 2-space indentation, double quotes
- **Component Pattern**: Functional components with forwardRef for proper ref forwarding
- **File Naming**: kebab-case for files (e.g., `dropdown-menu.tsx`), PascalCase for component exports
- **Styling**: Tailwind CSS classes with cn() utility for conditional styling

### Component Patterns

All shadcn/ui components follow these patterns:

1. **Ref Forwarding**: Use `React.forwardRef` for components that need ref support
2. **Type Safety**: Proper TypeScript interfaces extending HTML element props
3. **Variants**: Use `class-variance-authority` (cva) for component variants
4. **Composition**: Export compound components (e.g., Card, CardHeader, CardContent)

Example:

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@motormetrics/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        destructive: "bg-destructive text-destructive-foreground...",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## Dependencies

### Core Dependencies

- **@radix-ui/react-\***: Radix UI primitive components for accessibility and behaviour
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management
- **clsx**: Conditional class utilities
- **tailwind-merge**: Tailwind class merging without conflicts

### Build Dependencies

- **tailwindcss**: CSS framework
- **@tailwindcss/postcss**: PostCSS plugin for Tailwind v4
- **postcss**: CSS transformation tool
- **tw-animate-css**: Tailwind animation utilities

## Tailwind CSS Configuration

This package uses Tailwind CSS v4 with PostCSS:

```javascript
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

The global CSS file (`src/styles/globals.css`) contains Tailwind directives and CSS variable definitions for shadcn/ui theming.

## shadcn/ui Configuration

The `components.json` file configures shadcn/ui component generation:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@motormetrics/ui/components",
    "utils": "@motormetrics/ui/lib/utils",
    "ui": "@motormetrics/ui/components",
    "lib": "@motormetrics/ui/lib",
    "hooks": "@motormetrics/ui/hooks"
  }
}
```

## Adding New Components

See `shadcn-components` skill for adding new shadcn/ui components to this package.

## Workspace Dependencies

This package is consumed by:

- **apps/web**: Web application uses this package for shadcn/ui components including charts in the main app, and admin interface components at `/admin` path

## Version Management

This package follows the monorepo's unified versioning strategy using semantic-release:

- **Version**: Automatically updated via semantic-release
- **Changelog**: Auto-generated from conventional commits
- **Git Tags**: Unified "v" prefix (e.g., v4.16.3)

## Best Practices

### For Package Maintainers

1. **Keep components pure**: Components should not depend on application-specific logic
2. **Maintain accessibility**: All components use Radix UI primitives for WCAG compliance
3. **Document variants**: Clearly document all available component variants and props
4. **Test thoroughly**: Ensure components work across all consuming applications
5. **Follow shadcn patterns**: Maintain consistency with official shadcn/ui patterns

### For Component Consumers

1. **Import explicitly**: Use full import paths (e.g., `@motormetrics/ui/components/button`)
2. **Use cn() utility**: Always use `cn()` from `@motormetrics/ui/lib/utils` for class merging
3. **Follow composition patterns**: Use compound components as designed (e.g., Card with CardHeader)
4. **Respect variants**: Use component variants instead of overriding base styles
5. **Report issues**: If a component needs modification, discuss with the team first

## Future Considerations

- **Component Documentation**: See `component-docs` skill for Storybook integration
- **Theme Customisation**: Explore theme variants for different applications
- **Component Testing**: Add unit tests using Vitest and Testing Library
- **Bundle Optimisation**: Tree-shaking optimisations for better bundle sizes
- **Chart Components**: Maintain shadcn/ui chart components as the standard data visualization library for all apps
