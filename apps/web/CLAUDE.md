@AGENTS.md

# CLAUDE.md - Web Application

## Architecture Overview

### Component Co-location Strategy

Route-specific components, actions, queries and utils live in plainly-named folders alongside their consuming route
(`components/`, `actions/`, `queries/`, `utils/` — no underscore prefix). Folders without a `page.tsx` are not treated
as routes by the App Router.

Blog actions are **mutations only** (view incrementing, tag updates); blog reads live in `lib/data/posts.ts`.

**Keep centralised when:**

- Component used by 3+ different routes
- Part of the design system (HeroUI components, tokens in `src/app/globals.css`)
- Shared business logic (`queries/`, `lib/`) or actions used across multiple routes
- Generic utilities (`components/shared/`)

**Co-locate when:** the component, action or utility is used by a single route or feature area.

**Imports**: always use the `@web/*` path alias, never relative paths, including for co-located code.

### Data Architecture

**Cache Components** (Next.js 16): data-fetching queries use `"use cache"` with `cacheLife("max")` and granular cache
tags (e.g. `cars:month:2024-01`, `coe:period:12m`). The custom "max" profile is defined in `next.config.ts`.
See the `cache-components` skill for implementation patterns.

**Why "max" (30-day stale/revalidate, 1-year expire)**: data updates monthly, so this yields ~2 regenerations/month
(1 automatic + 1 on-demand) versus ~30 with daily checks — roughly **15x less** Vercel Fluid Compute. Do not shorten
these without a reason; the cost is CPU, not staleness.

**Revalidation gotcha**: in Next.js 16 `revalidateTag()` requires a second argument naming the cache profile. Omitting
it does not give stale-while-revalidate semantics.

```typescript
import {revalidateTag} from "next/cache";

revalidateTag("cars:month:2024-01", "max");
```

Trigger this when new monthly data arrives, so only affected caches regenerate.

### Component Patterns

- **UI**: HeroUI v3 from `@heroui/react`, using compound component patterns
- **Charts**: HeroUI Pro charts from `@heroui-pro/react` directly — do not add local chart wrappers
- **Customisation**: HeroUI v3 CSS variables and local web tokens, to match Singapore car market branding

### Component Naming Conventions

Domain + role, in PascalCase (`TrendChart`, `HeroPost`, `MetricCard`); `.` notation for subparts
(`HeroPost.Image`). No `Container`/`Wrapper`/`Component` suffixes and no layout-describing names (`LeftSidebar`).
Files are kebab-case matching the component (`TrendChart` → `trend-chart.tsx`).

See the `component-naming` skill for the full checklist.

### Animation Patterns

> **Note**: Import from `framer-motion`, not `motion/react`. HeroUI v3 does not require Framer Motion; this app keeps
> it as a direct dependency for custom page and chart animations.

Shared variants live in `src/config/animations.ts`.

**Guidelines**:

- ✅ Use shared variants from `@web/config/animations` (centralised)
- ✅ Use `initial="hidden"` / `animate="visible"` for page entrance animations
- ✅ Use `whileInView="visible"` with `viewport={{ once: true }}` for scroll-triggered animations
- ❌ Avoid inline animation definitions

**When to use CSS vs Motion**:

| Use Case | Recommendation |
|----------|----------------|
| Scroll-triggered reveals | Motion (`whileInView`) |
| Entrance animations | Motion (`initial`/`animate`) |
| Staggered lists | Motion (`staggerChildren`) |
| Hover states | CSS (Tailwind `transition-*`) |
| Infinite loops | CSS keyframes |

### Typography System

**Enforcement Rules**:

- ✅ Always use `Typography.H4` for `Card.Header` titles (not raw `<h3>`)
- ✅ Always use `Typography.TextSm` for `Card.Header` descriptions (not raw `<p>`)
- ✅ Use `Typography.H2` for section headings in blog components
- ✅ Use `Typography.H3` for card titles and subsections
- ❌ Avoid raw heading tags (`<h1>`–`<h4>`) outside of MDX content
- ⚠️ Exception: raw tags allowed only for MDX blog content and image overlay text

**Card Header Pattern** (standard for all cards):

```tsx
import { Card } from "@heroui/react";
import Typography from "@web/components/typography";

<Card.Header className="flex flex-col items-start gap-2">
  <Typography.H4>Card Title</Typography.H4>
  <Typography.TextSm>Card description text</Typography.TextSm>
</Card.Header>
```

### Page Title Conventions

Dashboard pages use professional, SEO-aligned H1 titles that match the `<title>` tag. The `<title>` is generated from
the Next.js metadata template in `src/app/layout.tsx`:

- **Template** (inner pages): `%s - MotorMetrics` — the short brand suffix keeps titles
  within Google's ~60-character display limit. Do **not** add "(formerly SG Cars Trends)"
  to per-page titles; it gets truncated and pushes keywords out of the snippet.
- **Full brand** `MotorMetrics (formerly SG Cars Trends)` appears only where it has value:
    - Homepage `/` and `/about` — via `title.absolute` (bypasses the template).
    - All `openGraph.title` / `twitter.title` (social cards have no length penalty).
- **Evergreen titles for "latest data" pages**: pages backed by a stable URL that renders
  the latest month (`/cars/registrations`, `/cars/fuel-types`, `/cars/vehicle-types`,
  `/cars/deregistrations`) use a fixed, keyword-focused `<title>` with **no month prefix**.
  The month lives in the H1 and meta description instead. Their `alternates.canonical` and
  `openGraph.url` must point to the **clean path** (no `?month=`) so all query-param
  variants consolidate to one indexed page.
- **Path segments** (`[make]`, `[type]`) get their own distinct title + canonical; **query
  params** (`?month`, `?compareA`, `?category`) never create indexable variants.
- Keep every indexed `<title>` ≤ 60 characters; content titles (`/blog/[slug]`,
  `/learn/[slug]`) are left full rather than truncated.

### Layout & Spacing Conventions

- ✅ Use `flex flex-col gap-*` for vertical spacing in containers
- ✅ Use `gap-*` for both horizontal and vertical spacing in flex/grid layouts
- ✅ Use `padding` for internal component spacing
- ✅ Prefer even gap values: `gap-2`, `gap-4`, `gap-6`, `gap-8`
- ❌ Avoid `space-y-*` utilities
- ❌ Avoid `mt-*`/`margin-top` for spacing between sibling elements
- ⚠️ Exception: `mt-*` acceptable only for icon alignment with text (e.g. `mt-1` for small icons)

**Rationale**: `gap-*` is predictable in flex/grid layouts and avoids the margin-collapsing issues that `space-y-*`
and `margin-top` introduce.

### Colour System

See the `design-language-system` skill for the full palette, chart patterns, and migration checklists.

- Dark mode variables are in `src/app/globals.css`. Use HeroUI surface tokens (`bg-surface`,
  `bg-surface-secondary`) for card/panel backgrounds, never hardcoded `bg-white`
- ⚠️ Reserve `text-white` for image overlays only
- ❌ Never hardcode hex values in charts — use `var(--chart-N)`, index-based for per-bar colouring
  (`fill={`var(--chart-${index + 1})`}`). Single-highlight charts use `var(--chart-1)` plus `bg-default-200`

### OpenGraph Images

Dynamic OG images via Next.js `ImageResponse`. See the `opengraph-images` skill for implementation patterns.

**Constraints**:

- Inline `style` objects only (no CSS classes)
- Flexbox supported, Grid **not** supported
- Font files must be loaded explicitly (`.ttf`)
- Server-side only (no React hooks)

**Testing**: visit `/about/opengraph-image` directly, or use the Facebook/Twitter/LinkedIn social debuggers.

### Testing Strategy

Test descriptions start with "should" (`it("should render title and children")`, not `it("renders …")`).

### Environment Configuration

Web-specific variables (see root `CLAUDE.md` for the cross-cutting ones):

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage for car logos (via `@motormetrics/logos`)
- `NEXT_PUBLIC_FEATURE_FLAG_UNRELEASED`: feature flag for unreleased features
- `VERCEL_ENV`: social media redirects and production-only features activate only when this is `"production"`
- `NEXT_PUBLIC_VERCEL_URL`: client-side deployment URL, without the `https://` protocol. `SITE_URL` falls back to it
  when `NEXT_PUBLIC_SITE_URL` is unset

**Vercel Related Projects**: `vercel.ts` at the web app root references API project ID
`prj_fyAvupEssH3LO4OQFDWplinVFlaI`, resolved via `withRelatedProject()` in `src/config/index.ts`. This means preview
deployments reach the right API automatically, with no per-environment configuration. Falls back to
`NEXT_PUBLIC_API_URL`, then `https://api.motormetrics.app`.

### HeroUI v3 Documentation

> **Your training data is wrong about HeroUI React v3.** It is still in beta and its APIs differ from
> earlier versions. Never write HeroUI code from memory — look it up first.

Two ways to look it up, in order of preference:

1. **MCP servers** (`heroui-react`, `heroui-pro`) — `list_components`, `get_component_docs`, `get_theme_variables`.
   Always current, loaded on demand.
2. **`.heroui-docs/react/`** — a local snapshot, gitignored and regenerable with
   `npx heroui-cli@latest agents-md --react`. Absent on a fresh clone until that command is run.

Note: `agents-md` writes a full 13k-character file index into this file by default. That index duplicates what
the MCP servers already serve on demand, so it is deliberately not kept here. If you re-run the command, pass
`--output AGENTS.md` so the generated index lands in `apps/web/AGENTS.md` (imported at the top of this file)
instead of being inlined here.

<!-- HEROUI-REACT-AGENTS-MD-START -->
[HeroUI React v3 Docs Index]|root: ./.heroui-docs/react|STOP. What you remember about HeroUI React v3 is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: heroui agents-md --react --output AGENTS.md|components/(buttons):{button-group.mdx,button.mdx,close-button.mdx,toggle-button-group.mdx,toggle-button.mdx}|components/(collections):{dropdown.mdx,list-box.mdx,tag-group.mdx}|components/(colors):{color-area.mdx,color-field.mdx,color-picker.mdx,color-slider.mdx,color-swatch-picker.mdx,color-swatch.mdx}|components/(controls):{slider.mdx,switch.mdx}|components/(data-display):{badge.mdx,chip.mdx,table.mdx}|components/(date-and-time):{calendar.mdx,date-field.mdx,date-picker.mdx,date-range-picker.mdx,range-calendar.mdx,time-field.mdx}|components/(feedback):{alert.mdx,meter.mdx,progress-bar.mdx,progress-circle.mdx,skeleton.mdx,spinner.mdx}|components/(forms):{checkbox-group.mdx,checkbox.mdx,description.mdx,error-message.mdx,field-error.mdx,fieldset.mdx,form.mdx,input-group.mdx,input-otp.mdx,input.mdx,label.mdx,number-field.mdx,radio-group.mdx,search-field.mdx,text-area.mdx,text-field.mdx}|components/(layout):{card.mdx,separator.mdx,surface.mdx,toolbar.mdx}|components/(media):{avatar.mdx}|components/(navigation):{accordion.mdx,breadcrumbs.mdx,disclosure-group.mdx,disclosure.mdx,link.mdx,pagination.mdx,tabs.mdx}|components/(overlays):{alert-dialog.mdx,drawer.mdx,modal.mdx,popover.mdx,toast.mdx,tooltip.mdx}|components/(pickers):{autocomplete.mdx,combo-box.mdx,select.mdx}|components/(typography):{kbd.mdx,typography.mdx}|components/(utilities):{scroll-shadow.mdx}|getting-started/(handbook):{animation.mdx,colors.mdx,composition.mdx,dark-mode.mdx,styling.mdx,theming.mdx}|getting-started/(overview):{cli.mdx,design-principles.mdx,frameworks.mdx,quick-start.mdx}|getting-started/(ui-for-agents):{agent-skills.mdx,agents-md.mdx,llms-txt.mdx,mcp-server.mdx}|releases:{v3-0-0-alpha-32.mdx,v3-0-0-alpha-33.mdx,v3-0-0-alpha-34.mdx,v3-0-0-alpha-35.mdx,v3-0-0-beta-1.mdx,v3-0-0-beta-2.mdx,v3-0-0-beta-3.mdx,v3-0-0-beta-4.mdx,v3-0-0-beta-6.mdx,v3-0-0-beta-7.mdx,v3-0-0-beta-8.mdx,v3-0-0-rc-1.mdx,v3-0-0.mdx,v3-0-2.mdx,v3-0-3.mdx,v3-0-4.mdx,v3-0-5.mdx,v3-1-0.mdx,v3-2-0.mdx,v3-2-1.mdx,v3-2-2.mdx,v3-2-3.mdx,v3-2-4.mdx}|demos/cn/accordion:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,disabled.tsx,faq.tsx,multiple.tsx,render-function.tsx,surface.tsx,without-separator.tsx}|demos/cn/alert-dialog:{backdrop-variants.tsx,close-methods.tsx,controlled.tsx,custom-animations.tsx,custom-backdrop.tsx,custom-icon.tsx,custom-portal.tsx,custom-styles.tsx,custom-trigger.tsx,default.tsx,dismiss-behavior.tsx,placements.tsx,sizes.tsx,statuses.tsx}|demos/cn/alert:{basic.tsx,custom-styles.tsx}|demos/cn/autocomplete:{allows-empty-collection.tsx,asynchronous-filtering.tsx,controlled-multiple.tsx,controlled-open-state.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,custom-value.tsx,default.tsx,disabled.tsx,email-recipients.tsx,full-width.tsx,location-search.tsx,multiple-select.tsx,on-surface.tsx,required.tsx,tag-group-selection.tsx,user-selection-multiple.tsx,user-selection.tsx,variants.tsx,virtualization.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/cn/avatar:{basic.tsx,colors.tsx,custom-image-component.tsx,custom-styles.tsx,fallback.tsx,group.tsx,sizes.tsx,variants.tsx}|demos/cn/badge:{basic.tsx,colors.tsx,custom-styles.tsx,dot.tsx,placements.tsx,sizes.tsx,variants.tsx,with-content.tsx}|demos/cn/breadcrumbs:{basic.tsx,custom-separator.tsx,custom-styles.tsx,disabled.tsx,level-2.tsx,level-3.tsx,render-function.tsx}|demos/cn/button-group:{basic.tsx,custom-styles.tsx,disabled.tsx,full-width.tsx,orientation.tsx,sizes.tsx,variants.tsx,with-icons.tsx,without-separator.tsx}|demos/cn/button:{basic.tsx,custom-styles.tsx,custom-variants.tsx,disabled.tsx,full-width.tsx,icon-only.tsx,loading-state.tsx,loading.tsx,release-outline-variant.tsx,render-function.tsx,ripple-effect.tsx,sizes.tsx,social.tsx,variants.tsx,with-icons.tsx}|demos/cn/calendar:{basic.tsx,booking-calendar.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,day-view.tsx,default-value.tsx,disabled.tsx,focused-value.tsx,international-calendar.tsx,min-max-dates.tsx,multiple-months.tsx,multiple-selection.tsx,read-only.tsx,unavailable-dates.tsx,week-view.tsx,weeks-in-month.tsx,with-indicators.tsx,year-picker.tsx}|demos/cn/card:{custom-styles.tsx,default.tsx,horizontal.tsx,variants.tsx,with-avatar.tsx,with-form.tsx,with-images.tsx}|demos/cn/checkbox-group:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,features-and-addons.tsx,indeterminate.tsx,on-surface.tsx,render-function.tsx,validation.tsx,with-custom-indicator.tsx}|demos/cn/checkbox:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,default-selected.tsx,disabled.tsx,external-label.tsx,form.tsx,full-rounded.tsx,indeterminate.tsx,invalid.tsx,render-function.tsx,render-props.tsx,variants.tsx,with-description.tsx}|demos/cn/chip:{basic.tsx,custom-styles.tsx,release-vibrant-palette.tsx,statuses.tsx,variants.tsx,with-icon.tsx}|demos/cn/close-button:{custom-styles.tsx,default.tsx,interactive.tsx,variants.tsx,with-custom-icon.tsx}|demos/cn/color-area:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,render-function.tsx,space-and-channels.tsx,with-dots.tsx}|demos/cn/color-field:{basic.tsx,channel-editing.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,render-function.tsx,required.tsx,variants.tsx,with-description.tsx}|demos/cn/color-picker:{basic.tsx,controlled.tsx,custom-styles.tsx,with-fields.tsx,with-sliders.tsx,with-swatches.tsx}|demos/cn/color-slider:{alpha-channel.tsx,basic.tsx,channels.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,render-function.tsx,rgb-channels.tsx,vertical.tsx}|demos/cn/color-swatch-picker:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,default-value.tsx,disabled.tsx,render-function.tsx,sizes.tsx,stack-layout.tsx,variants.tsx}|demos/cn/color-swatch:{accessibility.tsx,basic.tsx,custom-styles.tsx,render-function.tsx,shapes.tsx,sizes.tsx,transparency.tsx}|demos/cn/combo-box:{allows-custom-value.tsx,asynchronous-loading.tsx,controlled-input-value.tsx,controlled.tsx,custom-filtering.tsx,custom-indicator.tsx,custom-styles.tsx,custom-value.tsx,default-selected-key.tsx,default.tsx,disabled.tsx,full-width.tsx,menu-trigger.tsx,multiple-selection.tsx,on-surface.tsx,render-function.tsx,required.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/cn/date-field:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,granularity.tsx,invalid.tsx,on-surface.tsx,render-function.tsx,required.tsx,variants.tsx,with-description.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-validation.tsx}|demos/cn/date-picker:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,format-options-no-ssr.tsx,format-options.tsx,international-calendar.tsx,render-function.tsx,with-custom-indicator.tsx,with-validation.tsx}|demos/cn/date-range-picker:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,format-options-no-ssr.tsx,format-options.tsx,international-calendar.tsx,release-input-container.tsx,render-function.tsx,with-custom-indicator.tsx,with-validation.tsx}|demos/cn/description:{basic.tsx,custom-styles.tsx}|demos/cn/disclosure-group:{basic.tsx,controlled.tsx,custom-styles.tsx}|demos/cn/disclosure:{basic.tsx,custom-styles.tsx,render-function.tsx}|demos/cn/drawer:{backdrop-variants.tsx,basic.tsx,controlled.tsx,custom-styles.tsx,navigation.tsx,non-dismissable.tsx,placements.tsx,scrollable-content.tsx,with-form.tsx}|demos/cn/dropdown:{controlled-open-state.tsx,controlled.tsx,custom-styles.tsx,custom-trigger.tsx,default.tsx,long-press-trigger.tsx,single-with-custom-indicator.tsx,with-custom-submenu-indicator.tsx,with-descriptions.tsx,with-disabled-items.tsx,with-icons.tsx,with-keyboard-shortcuts.tsx,with-multiple-selection.tsx,with-section-level-selection.tsx,with-sections.tsx,with-single-selection.tsx,with-submenus.tsx}|demos/cn/error-message:{basic.tsx,custom-styles.tsx}|demos/cn/field-error:{basic.tsx,custom-styles.tsx}|demos/cn/fieldset:{basic.tsx,custom-styles.tsx,on-surface.tsx}|demos/cn/form:{basic.tsx,custom-styles.tsx,render-function.tsx}|demos/cn/input-group:{custom-styles.tsx,default.tsx,disabled.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,password-with-toggle.tsx,required.tsx,variants.tsx,with-badge-suffix.tsx,with-copy-suffix.tsx,with-icon-prefix-and-copy-suffix.tsx,with-icon-prefix-and-text-suffix.tsx,with-keyboard-shortcut.tsx,with-loading-suffix.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-text-prefix.tsx,with-text-suffix.tsx,with-textarea.tsx}|demos/cn/input-otp:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,four-digits.tsx,on-complete.tsx,on-surface.tsx,variants.tsx,with-pattern.tsx,with-validation.tsx}|demos/cn/input:{basic.tsx,controlled.tsx,custom-styles.tsx,full-width.tsx,on-surface.tsx,types.tsx,variants.tsx}|demos/cn/kbd:{basic.tsx,custom-styles.tsx,inline.tsx,instructional.tsx,navigation.tsx,special.tsx,variants.tsx}|demos/cn/label:{basic.tsx,custom-styles.tsx}|demos/cn/link:{basic.tsx,custom-icon.tsx,custom-styles.tsx,icon-placement.tsx,render-function.tsx,underline-and-offset.tsx,underline-offset.tsx,underline-variants.tsx}|demos/cn/list-box:{controlled.tsx,custom-check-icon.tsx,custom-styles.tsx,default.tsx,multi-select.tsx,release-scrollbar-modes.tsx,render-function.tsx,virtualization.tsx,with-disabled-items.tsx,with-sections.tsx}|demos/cn/meter:{basic.tsx,colors.tsx,custom-styles.tsx,custom-value.tsx,sizes.tsx,without-label.tsx}|demos/cn/modal:{backdrop-variants.tsx,close-methods.tsx,controlled.tsx,custom-animations.tsx,custom-backdrop.tsx,custom-portal.tsx,custom-styles.tsx,custom-trigger.tsx,default.tsx,dismiss-behavior.tsx,placements.tsx,scroll-comparison.tsx,sizes.tsx,with-form.tsx}|demos/cn/number-field:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,on-surface.tsx,render-function.tsx,required.tsx,validation.tsx,variants.tsx,with-chevrons.tsx,with-description.tsx,with-format-options.tsx,with-step.tsx,with-validation.tsx}|demos/cn/pagination:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,disabled.tsx,simple-prev-next.tsx,sizes.tsx,with-ellipsis.tsx,with-summary.tsx}|demos/cn/popover:{basic.tsx,custom-styles.tsx,interactive.tsx,placement.tsx,render-function.tsx,with-arrow.tsx}|demos/cn/progress-bar:{basic.tsx,colors.tsx,custom-styles.tsx,custom-value.tsx,indeterminate.tsx,sizes.tsx,without-label.tsx}|demos/cn/progress-circle:{basic.tsx,colors.tsx,custom-styles.tsx,custom-svg.tsx,indeterminate.tsx,sizes.tsx,with-label.tsx}|demos/cn/radio-group:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,delivery-and-payment.tsx,disabled.tsx,horizontal.tsx,on-surface.tsx,render-function.tsx,uncontrolled.tsx,validation.tsx,variants.tsx}|demos/cn/range-calendar:{allows-non-contiguous-ranges.tsx,anchor-unavailable-dates.tsx,basic.tsx,booking-calendar.tsx,controlled.tsx,custom-styles.tsx,day-view.tsx,default-value.tsx,disabled.tsx,focused-value.tsx,international-calendar.tsx,invalid.tsx,min-max-dates.tsx,multiple-months.tsx,read-only.tsx,unavailable-dates.tsx,week-view.tsx,weeks-in-month.tsx,with-indicators.tsx,year-picker.tsx}|demos/cn/scroll-shadow:{custom-styles.tsx,default.tsx,hide-scroll-bar.tsx,orientation.tsx,size.tsx,visibility-change.tsx,with-card.tsx}|demos/cn/search-field:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,on-surface.tsx,render-function.tsx,required.tsx,validation.tsx,variants.tsx,with-description.tsx,with-keyboard-shortcut.tsx,with-validation.tsx}|demos/cn/select:{asynchronous-loading.tsx,controlled-multiple.tsx,controlled-open-state.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,custom-value.tsx,default.tsx,disabled.tsx,full-width.tsx,multiple-select.tsx,on-surface.tsx,render-function.tsx,required.tsx,variants.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/cn/separator:{basic.tsx,custom-styles.tsx,render-function.tsx,variants.tsx,vertical.tsx,with-content.tsx,with-surface.tsx}|demos/cn/skeleton:{animation-types.tsx,basic.tsx,card.tsx,custom-styles.tsx,grid.tsx,list.tsx,single-shimmer.tsx,text-content.tsx,user-profile.tsx}|demos/cn/slider:{custom-styles.tsx,default.tsx,disabled.tsx,range.tsx,render-function.tsx,vertical.tsx}|demos/cn/spinner:{basic.tsx,colors.tsx,custom-styles.tsx,sizes.tsx,speed.tsx}|demos/cn/surface:{basic.tsx,custom-styles.tsx,variants.tsx,with-form-components.tsx}|demos/cn/switch:{basic.tsx,controlled.tsx,custom-styles.tsx,default-selected.tsx,disabled.tsx,form.tsx,group-horizontal.tsx,group.tsx,label-position.tsx,render-function.tsx,render-props.tsx,sizes.tsx,with-description.tsx,with-icons.tsx,without-label.tsx}|demos/cn/table:{async-loading.tsx,basic.tsx,column-resizing.tsx,custom-cells.tsx,custom-styles.tsx,empty-state.tsx,expandable-rows.tsx,pagination.tsx,secondary-variant.tsx,selection.tsx,sorting.tsx,tanstack-table.tsx,virtualization.tsx}|demos/cn/tabs:{basic.tsx,custom-styles.tsx,disabled.tsx,overflow.tsx,render-function.tsx,secondary-vertical.tsx,secondary.tsx,vertical.tsx,with-separator.tsx}|demos/cn/tag-group:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,render-function.tsx,selection-modes.tsx,sizes.tsx,variants.tsx,with-error-message.tsx,with-list-data.tsx,with-prefix.tsx,with-remove-button.tsx}|demos/cn/textarea:{basic.tsx,controlled.tsx,custom-styles.tsx,full-width.tsx,on-surface.tsx,rows.tsx,variants.tsx}|demos/cn/textfield:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,full-width.tsx,input-types.tsx,on-surface.tsx,render-function.tsx,required.tsx,textarea.tsx,validation.tsx,with-description.tsx,with-error.tsx}|demos/cn/time-field:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,render-function.tsx,required.tsx,with-description.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-validation.tsx}|demos/cn/toast:{callbacks.tsx,custom-indicator.tsx,custom-queue.tsx,custom-styles.tsx,custom-toast.tsx,default.tsx,placements.tsx,promise.tsx,simple.tsx,variants.tsx}|demos/cn/toggle-button-group:{attached.tsx,basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,full-width.tsx,orientation.tsx,selection-mode.tsx,sizes.tsx,without-separator.tsx}|demos/cn/toggle-button:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,icon-only.tsx,sizes.tsx,variants.tsx}|demos/cn/toolbar:{attached.tsx,basic.tsx,custom-styles.tsx,vertical.tsx,with-button-group.tsx}|demos/cn/tooltip:{basic.tsx,custom-styles.tsx,custom-trigger.tsx,placement.tsx,render-function.tsx,with-arrow.tsx}|demos/cn/typography:{custom-styles.tsx,default.tsx,primitives.tsx,prose.tsx,render-props.tsx,typography-scale.tsx}|demos/en/accordion:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,disabled.tsx,faq.tsx,multiple.tsx,render-function.tsx,surface.tsx,without-separator.tsx}|demos/en/alert-dialog:{backdrop-variants.tsx,close-methods.tsx,controlled.tsx,custom-animations.tsx,custom-backdrop.tsx,custom-icon.tsx,custom-portal.tsx,custom-styles.tsx,custom-trigger.tsx,default.tsx,dismiss-behavior.tsx,placements.tsx,sizes.tsx,statuses.tsx}|demos/en/alert:{basic.tsx,custom-styles.tsx}|demos/en/autocomplete:{allows-empty-collection.tsx,asynchronous-filtering.tsx,controlled-multiple.tsx,controlled-open-state.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,custom-value.tsx,default.tsx,disabled.tsx,email-recipients.tsx,full-width.tsx,location-search.tsx,multiple-select.tsx,on-surface.tsx,required.tsx,tag-group-selection.tsx,user-selection-multiple.tsx,user-selection.tsx,variants.tsx,virtualization.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/en/avatar:{basic.tsx,colors.tsx,custom-image-component.tsx,custom-styles.tsx,fallback.tsx,group.tsx,sizes.tsx,variants.tsx}|demos/en/badge:{basic.tsx,colors.tsx,custom-styles.tsx,dot.tsx,placements.tsx,sizes.tsx,variants.tsx,with-content.tsx}|demos/en/breadcrumbs:{basic.tsx,custom-separator.tsx,custom-styles.tsx,disabled.tsx,level-2.tsx,level-3.tsx,render-function.tsx}|demos/en/button-group:{basic.tsx,custom-styles.tsx,disabled.tsx,full-width.tsx,orientation.tsx,sizes.tsx,variants.tsx,with-icons.tsx,without-separator.tsx}|demos/en/button:{basic.tsx,custom-styles.tsx,custom-variants.tsx,disabled.tsx,full-width.tsx,icon-only.tsx,loading-state.tsx,loading.tsx,release-outline-variant.tsx,render-function.tsx,ripple-effect.tsx,sizes.tsx,social.tsx,variants.tsx,with-icons.tsx}|demos/en/calendar:{basic.tsx,booking-calendar.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,day-view.tsx,default-value.tsx,disabled.tsx,focused-value.tsx,international-calendar.tsx,min-max-dates.tsx,multiple-months.tsx,multiple-selection.tsx,read-only.tsx,unavailable-dates.tsx,week-view.tsx,weeks-in-month.tsx,with-indicators.tsx,year-picker.tsx}|demos/en/card:{custom-styles.tsx,default.tsx,horizontal.tsx,variants.tsx,with-avatar.tsx,with-form.tsx,with-images.tsx}|demos/en/checkbox-group:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,features-and-addons.tsx,indeterminate.tsx,on-surface.tsx,render-function.tsx,validation.tsx,with-custom-indicator.tsx}|demos/en/checkbox:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,default-selected.tsx,disabled.tsx,external-label.tsx,form.tsx,full-rounded.tsx,indeterminate.tsx,invalid.tsx,render-function.tsx,render-props.tsx,variants.tsx,with-description.tsx}|demos/en/chip:{basic.tsx,custom-styles.tsx,release-vibrant-palette.tsx,statuses.tsx,variants.tsx,with-icon.tsx}|demos/en/close-button:{custom-styles.tsx,default.tsx,interactive.tsx,with-custom-icon.tsx}|demos/en/color-area:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,render-function.tsx,space-and-channels.tsx,with-dots.tsx}|demos/en/color-field:{basic.tsx,channel-editing.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,render-function.tsx,required.tsx,variants.tsx,with-description.tsx}|demos/en/color-picker:{basic.tsx,controlled.tsx,custom-styles.tsx,with-fields.tsx,with-sliders.tsx,with-swatches.tsx}|demos/en/color-slider:{alpha-channel.tsx,basic.tsx,channels.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,render-function.tsx,rgb-channels.tsx,vertical.tsx}|demos/en/color-swatch-picker:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,default-value.tsx,disabled.tsx,render-function.tsx,sizes.tsx,stack-layout.tsx,variants.tsx}|demos/en/color-swatch:{accessibility.tsx,basic.tsx,custom-styles.tsx,render-function.tsx,shapes.tsx,sizes.tsx,transparency.tsx}|demos/en/combo-box:{allows-custom-value.tsx,asynchronous-loading.tsx,controlled-input-value.tsx,controlled.tsx,custom-filtering.tsx,custom-indicator.tsx,custom-styles.tsx,custom-value.tsx,default-selected-key.tsx,default.tsx,disabled.tsx,full-width.tsx,menu-trigger.tsx,multiple-selection.tsx,on-surface.tsx,render-function.tsx,required.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/en/date-field:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,granularity.tsx,invalid.tsx,on-surface.tsx,render-function.tsx,required.tsx,variants.tsx,with-description.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-validation.tsx}|demos/en/date-picker:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,format-options-no-ssr.tsx,format-options.tsx,international-calendar.tsx,render-function.tsx,with-custom-indicator.tsx,with-validation.tsx}|demos/en/date-range-picker:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,format-options-no-ssr.tsx,format-options.tsx,international-calendar.tsx,release-input-container.tsx,render-function.tsx,with-custom-indicator.tsx,with-validation.tsx}|demos/en/description:{basic.tsx,custom-styles.tsx}|demos/en/disclosure-group:{basic.tsx,controlled.tsx,custom-styles.tsx}|demos/en/disclosure:{basic.tsx,custom-styles.tsx,render-function.tsx}|demos/en/drawer:{backdrop-variants.tsx,basic.tsx,controlled.tsx,custom-styles.tsx,navigation.tsx,non-dismissable.tsx,placements.tsx,scrollable-content.tsx,with-form.tsx}|demos/en/dropdown:{controlled-open-state.tsx,controlled.tsx,custom-styles.tsx,custom-trigger.tsx,default.tsx,long-press-trigger.tsx,single-with-custom-indicator.tsx,with-custom-submenu-indicator.tsx,with-descriptions.tsx,with-disabled-items.tsx,with-icons.tsx,with-keyboard-shortcuts.tsx,with-multiple-selection.tsx,with-section-level-selection.tsx,with-sections.tsx,with-single-selection.tsx,with-submenus.tsx}|demos/en/error-message:{basic.tsx,custom-styles.tsx}|demos/en/field-error:{basic.tsx,custom-styles.tsx}|demos/en/fieldset:{basic.tsx,custom-styles.tsx,on-surface.tsx}|demos/en/form:{basic.tsx,custom-styles.tsx,render-function.tsx}|demos/en/input-group:{custom-styles.tsx,default.tsx,disabled.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,password-with-toggle.tsx,required.tsx,variants.tsx,with-badge-suffix.tsx,with-copy-suffix.tsx,with-icon-prefix-and-copy-suffix.tsx,with-icon-prefix-and-text-suffix.tsx,with-keyboard-shortcut.tsx,with-loading-suffix.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-text-prefix.tsx,with-text-suffix.tsx,with-textarea.tsx}|demos/en/input-otp:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,four-digits.tsx,on-complete.tsx,on-surface.tsx,variants.tsx,with-pattern.tsx,with-validation.tsx}|demos/en/input:{basic.tsx,controlled.tsx,custom-styles.tsx,full-width.tsx,on-surface.tsx,types.tsx,variants.tsx}|demos/en/kbd:{basic.tsx,custom-styles.tsx,inline.tsx,instructional.tsx,navigation.tsx,special.tsx,variants.tsx}|demos/en/label:{basic.tsx,custom-styles.tsx}|demos/en/link:{basic.tsx,custom-icon.tsx,custom-styles.tsx,icon-placement.tsx,render-function.tsx,underline-and-offset.tsx}|demos/en/list-box:{controlled.tsx,custom-check-icon.tsx,custom-styles.tsx,default.tsx,multi-select.tsx,release-scrollbar-modes.tsx,render-function.tsx,virtualization.tsx,with-disabled-items.tsx,with-sections.tsx}|demos/en/meter:{basic.tsx,colors.tsx,custom-styles.tsx,custom-value.tsx,sizes.tsx,without-label.tsx}|demos/en/modal:{backdrop-variants.tsx,close-methods.tsx,controlled.tsx,custom-animations.tsx,custom-backdrop.tsx,custom-portal.tsx,custom-styles.tsx,custom-trigger.tsx,default.tsx,dismiss-behavior.tsx,placements.tsx,scroll-comparison.tsx,sizes.tsx,with-form.tsx}|demos/en/number-field:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,on-surface.tsx,render-function.tsx,required.tsx,validation.tsx,variants.tsx,with-chevrons.tsx,with-description.tsx,with-format-options.tsx,with-step.tsx,with-validation.tsx}|demos/en/pagination:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,disabled.tsx,simple-prev-next.tsx,sizes.tsx,with-ellipsis.tsx,with-summary.tsx}|demos/en/popover:{basic.tsx,custom-styles.tsx,interactive.tsx,placement.tsx,render-function.tsx,with-arrow.tsx}|demos/en/progress-bar:{basic.tsx,colors.tsx,custom-styles.tsx,custom-value.tsx,indeterminate.tsx,sizes.tsx,without-label.tsx}|demos/en/progress-circle:{basic.tsx,colors.tsx,custom-styles.tsx,custom-svg.tsx,indeterminate.tsx,sizes.tsx,with-label.tsx}|demos/en/radio-group:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,delivery-and-payment.tsx,disabled.tsx,horizontal.tsx,on-surface.tsx,render-function.tsx,uncontrolled.tsx,validation.tsx,variants.tsx}|demos/en/range-calendar:{allows-non-contiguous-ranges.tsx,anchor-unavailable-dates.tsx,basic.tsx,booking-calendar.tsx,controlled.tsx,custom-styles.tsx,day-view.tsx,default-value.tsx,disabled.tsx,focused-value.tsx,international-calendar.tsx,invalid.tsx,min-max-dates.tsx,multiple-months.tsx,read-only.tsx,unavailable-dates.tsx,week-view.tsx,weeks-in-month.tsx,with-indicators.tsx,year-picker.tsx}|demos/en/scroll-shadow:{custom-styles.tsx,default.tsx,hide-scroll-bar.tsx,orientation.tsx,size.tsx,visibility-change.tsx,with-card.tsx}|demos/en/search-field:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,on-surface.tsx,render-function.tsx,required.tsx,validation.tsx,variants.tsx,with-description.tsx,with-keyboard-shortcut.tsx,with-validation.tsx}|demos/en/select:{asynchronous-loading.tsx,controlled-multiple.tsx,controlled-open-state.tsx,controlled.tsx,custom-indicator.tsx,custom-styles.tsx,custom-value.tsx,default.tsx,disabled.tsx,full-width.tsx,multiple-select.tsx,on-surface.tsx,render-function.tsx,required.tsx,variants.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/en/separator:{basic.tsx,custom-styles.tsx,render-function.tsx,variants.tsx,vertical.tsx,with-content.tsx,with-surface.tsx}|demos/en/skeleton:{animation-types.tsx,basic.tsx,custom-styles.tsx,grid.tsx,list.tsx,single-shimmer.tsx,text-content.tsx,user-profile.tsx}|demos/en/slider:{custom-styles.tsx,default.tsx,disabled.tsx,range.tsx,render-function.tsx,vertical.tsx}|demos/en/spinner:{basic.tsx,colors.tsx,custom-styles.tsx,sizes.tsx,speed.tsx}|demos/en/surface:{basic.tsx,custom-styles.tsx,variants.tsx,with-form-components.tsx}|demos/en/switch:{basic.tsx,controlled.tsx,custom-styles.tsx,default-selected.tsx,disabled.tsx,form.tsx,group-horizontal.tsx,group.tsx,label-position.tsx,render-function.tsx,render-props.tsx,sizes.tsx,with-description.tsx,with-icons.tsx,without-label.tsx}|demos/en/table:{async-loading.tsx,basic.tsx,column-resizing.tsx,custom-cells.tsx,custom-styles.tsx,empty-state.tsx,expandable-rows.tsx,pagination.tsx,secondary-variant.tsx,selection.tsx,sorting.tsx,tanstack-table.tsx,virtualization.tsx}|demos/en/tabs:{basic.tsx,custom-styles.tsx,disabled.tsx,overflow.tsx,render-function.tsx,secondary-vertical.tsx,secondary.tsx,vertical.tsx,with-separator.tsx}|demos/en/tag-group:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,render-function.tsx,selection-modes.tsx,sizes.tsx,variants.tsx,with-error-message.tsx,with-list-data.tsx,with-prefix.tsx,with-remove-button.tsx}|demos/en/textarea:{basic.tsx,controlled.tsx,custom-styles.tsx,full-width.tsx,on-surface.tsx,rows.tsx,variants.tsx}|demos/en/textfield:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,full-width.tsx,input-types.tsx,on-surface.tsx,render-function.tsx,required.tsx,textarea.tsx,validation.tsx,with-description.tsx,with-error.tsx}|demos/en/time-field:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,form-example.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,render-function.tsx,required.tsx,with-description.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-validation.tsx}|demos/en/toast:{callbacks.tsx,custom-indicator.tsx,custom-queue.tsx,custom-styles.tsx,custom-toast.tsx,default.tsx,placements.tsx,promise.tsx,simple.tsx,variants.tsx}|demos/en/toggle-button-group:{attached.tsx,basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,full-width.tsx,orientation.tsx,selection-mode.tsx,sizes.tsx,without-separator.tsx}|demos/en/toggle-button:{basic.tsx,controlled.tsx,custom-styles.tsx,disabled.tsx,icon-only.tsx,sizes.tsx,variants.tsx}|demos/en/toolbar:{attached.tsx,basic.tsx,custom-styles.tsx,vertical.tsx,with-button-group.tsx}|demos/en/tooltip:{basic.tsx,custom-styles.tsx,custom-trigger.tsx,placement.tsx,render-function.tsx,with-arrow.tsx}|demos/en/typography:{custom-styles.tsx,default.tsx,primitives.tsx,prose.tsx,render-props.tsx,typography-scale.tsx}
<!-- HEROUI-REACT-AGENTS-MD-END -->
