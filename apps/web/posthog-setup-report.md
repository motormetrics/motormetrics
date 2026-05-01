# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the MotorMetrics web application. Client-side tracking is initialised via `instrumentation-client.ts` (Next.js 15.3+ pattern) with a reverse proxy through `/ingest` to avoid tracking blockers. Server-side events are captured via `posthog-node` in the API routes. User identification is wired up on admin login so that frontend and backend events are correlated against the same distinct ID.

## Events instrumented

| Event | Description | File |
|-------|-------------|------|
| `admin_login_submitted` | Admin signs in with email/password; calls `posthog.identify` on success | `src/app/admin/components/login-form.client.tsx` |
| `admin_login_google_clicked` | Admin clicks the Google sign-in button | `src/app/admin/components/login-form.client.tsx` |
| `admin_blog_post_created` | Admin successfully creates a new blog post | `src/app/admin/components/blog-post-form.tsx` |
| `admin_blog_post_updated` | Admin successfully updates an existing blog post | `src/app/admin/components/blog-post-form.tsx` |
| `admin_blog_post_regenerated` | Admin triggers AI regeneration of a blog post | `src/app/admin/components/blog-post-form.tsx` |
| `car_make_searched` | User selects a car make from the search autocomplete on the makes page | `src/app/(main)/(dashboard)/cars/components/makes/make-search.tsx` |
| `car_make_selected` | User selects a car make in the registrations page autocomplete | `src/app/(main)/(dashboard)/cars/registrations/components/make-selector.tsx` |
| `blog_category_tab_changed` | User switches between blog category tabs (All, COE, Cars) | `src/app/(main)/(site)/blog/components/blog-list/client.tsx` |
| `annual_view_tab_changed` | User switches between annual view tabs (By Fuel Type, By Make) | `src/app/(main)/(dashboard)/cars/annual/components/annual-view-tabs.tsx` |
| `api_post_created` | Blog post created successfully via the REST API (server-side) | `src/app/api/v1/posts/route.ts` |
| `api_post_deleted` | Blog post deleted successfully via the REST API (server-side) | `src/app/api/v1/posts/[id]/route.ts` |

## Other files created/modified

| File | Change |
|------|--------|
| `instrumentation-client.ts` | PostHog client-side initialisation with EU host, reverse proxy, and exception capture |
| `src/lib/posthog-server.ts` | Server-side PostHog client factory (`posthog-node`) |
| `next.config.ts` | Added `/ingest` reverse proxy rewrites for EU PostHog endpoints |
| `.env.local` | Added `NEXT_PUBLIC_POSTHOG_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behaviour, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/100514/dashboard/603695
- **Admin Logins** (trend): https://eu.posthog.com/project/100514/insights/xhFqYmzJ
- **Admin Login to Blog Post Creation Funnel**: https://eu.posthog.com/project/100514/insights/UyFqIOGn
- **Car Make Searches** (trend): https://eu.posthog.com/project/100514/insights/IO4ZnH2h
- **Blog Category Tab Engagement** (breakdown by category): https://eu.posthog.com/project/100514/insights/UbXQhsfP
- **Blog Post Actions** (create / update / regenerate): https://eu.posthog.com/project/100514/insights/gbSDdfu9

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
