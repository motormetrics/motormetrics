---
name: tailwind-config
description: Update Tailwind CSS configuration, custom themes, and design tokens across packages. Use when adding new colors, spacing scales, or customizing the design system.
allowed-tools: Read, Edit, Grep, Glob
---

# Tailwind CSS Configuration Skill

## Configuration Structure

```
packages/theme/
├── src/light.css            # Light design tokens
└── src/dark.css             # Dark design tokens

apps/web/
└── src/app/globals.css      # Tailwind, HeroUI, and theme imports
```

## CSS Variables

Defined in `packages/theme/src/light.css` and `packages/theme/src/dark.css`, then mapped in `apps/web/src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --muted: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    --danger: 0 84.2% 60.2%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode values */
  }
}
```

## Adding Custom Colors

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0070F3",
          secondary: "#7928CA",
        },
      },
    },
  },
};
```

## Adding Animations

```typescript
theme: {
  extend: {
    keyframes: {
      shimmer: {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
    },
    animation: {
      shimmer: "shimmer 2s linear infinite",
    },
  },
}
```

## Custom Utilities

```css
/* globals.css */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  .scrollbar-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

## Plugins

```typescript
plugins: [
  require("@tailwindcss/typography"),  // prose classes
  require("@tailwindcss/forms"),        // form resets
]
```

## Size Utility Convention

Use `size-*` instead of `h-* w-*` for equal dimensions:

```tsx
// ✅ Good
<div className="size-4">Icon</div>
<div className="size-8">Avatar</div>

// ❌ Avoid
<div className="h-4 w-4">Icon</div>
```

## Dark Mode

**Tailwind v4** uses a CSS custom variant instead of config-based `darkMode`:

```css
/* globals.css */
@custom-variant dark (&:is(.dark *));
```

This is configured in `apps/web/src/app/globals.css`. Dark CSS variables are defined in `packages/theme/src/dark.css`.

**Theme switching** uses `next-themes` with `attribute="class"` to toggle `.dark` on `<html>`:

```tsx
import { useTheme } from "next-themes";
const { resolvedTheme, setTheme } = useTheme();
```

**Status**: Dark mode CSS infrastructure is ready via shared theme tokens.

## Debugging

```bash
# Check resolved config
npx tailwindcss config

# Watch for generated classes
TAILWIND_MODE=watch npx tailwindcss -i ./src/styles/globals.css -o ./dist/output.css --watch
```

**Common issues:**
- Classes not applying → Check content paths
- Dark mode not working → Verify `darkMode: ["class"]` and ThemeProvider
- Classes purged → Add to safelist or use complete class names

## Best Practices

1. **Mobile-first** - Default styles for mobile, add breakpoints up
2. **CSS Variables** - Use for theming (enables dark mode)
3. **Content paths** - Include all component paths
4. **Semantic names** - Use `brand`, `accent` not `blue-500`
5. **Size utility** - Use `size-*` for equal dimensions

## References

- Tailwind CSS: https://tailwindcss.com
- Design tokens: See `design-language-system` skill
