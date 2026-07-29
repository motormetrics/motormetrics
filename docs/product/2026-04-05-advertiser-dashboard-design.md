# Advertiser Dashboard Design Spec

## Overview

A self-serve advertiser dashboard where businesses sign up, create ad campaigns, upload creatives, and view performance analytics. Accessible at `partners.motormetrics.app` as a subdomain of the main site. Includes admin oversight within the existing `/admin` interface and dynamic ad rendering on the public site.

## Architecture

### Routing & Deployment

- Lives within `apps/web` using a `(partners)` route group
- Subdomain `partners.motormetrics.app` routed via Next.js middleware (hostname detection)
- Single deployment — no separate app. Shared auth, database, and UI components
- Middleware checks hostname: `partners.*` serves partner layout, everything else unchanged

### Authentication

- **Provider**: better-auth with magic link (passwordless email login)
- **Email service**: Resend (also used for transactional emails)
- **Role**: `partner` role on the `users` table to distinguish from `admin` users
- **Flow**: enter email > receive magic link > click > authenticated session
- Partner users cannot access `/admin`; admin users cannot access `(partners)` routes

### Payments

- **Provider**: Stripe
- **Card subscriptions**: Stripe Checkout + Subscriptions API for automatic monthly recurring
- **PayNow**: Stripe Invoicing API — monthly invoice email with PayNow QR code for manual payment
- **Hybrid model**: advertiser chooses card (auto-renew) or PayNow (manual monthly invoice)
- **Plans**: Starter ($400/mo), Growth ($700/mo), Premium ($1,000/mo)

### Transactional Emails (Resend)

- Magic link authentication
- Campaign status notifications (activated, paused, ended)
- Payment receipts and invoice reminders
- Subscription renewal reminders

### Storage

- **Primary**: Vercel Blob for ad creative images (banners, card images)
- **Planned fallback**: Cloudflare R2 if Vercel Blob costs grow — zero egress fees make it the natural escape hatch
- Usage is minimal (dozens of images at most), well within Hobby/Pro limits

## Database Schema

Three new tables in `packages/database/src/schema/`:

### `advertisers`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom |
| userId | text | FK > users.id, NOT NULL, cascade delete |
| companyName | text | NOT NULL |
| contactName | text | NOT NULL |
| contactEmail | text | NOT NULL |
| website | text | optional |
| status | text | NOT NULL, default "active" (active, inactive) |
| createdAt | timestamp | NOT NULL, defaultNow |
| updatedAt | timestamp | NOT NULL, defaultNow, $onUpdate |

### `campaigns`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom |
| advertiserId | uuid | FK > advertisers.id, NOT NULL, cascade delete |
| name | text | NOT NULL |
| placementType | text | NOT NULL (floating_banner, pinned_card, in_feed_card) |
| imageUrl | text | NOT NULL (Vercel Blob URL) |
| destinationUrl | text | NOT NULL (click-through URL) |
| altText | text | optional (accessibility) |
| plan | text | NOT NULL (starter, growth, premium) |
| startDate | timestamp | NOT NULL |
| endDate | timestamp | NOT NULL |
| status | text | NOT NULL, default "draft" (draft, active, paused, ended) |
| impressions | integer | NOT NULL, default 0 (running total) |
| clicks | integer | NOT NULL, default 0 (running total) |
| createdAt | timestamp | NOT NULL, defaultNow |
| updatedAt | timestamp | NOT NULL, defaultNow, $onUpdate |

### `campaignEvents` (daily analytics)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom |
| campaignId | uuid | FK > campaigns.id, NOT NULL, cascade delete |
| date | timestamp | NOT NULL |
| impressions | integer | NOT NULL, default 0 |
| clicks | integer | NOT NULL, default 0 |

**Unique constraint**: `(campaignId, date)`

### Relations

- `advertisers` > one `users` (via userId)
- `campaigns` > one `advertisers` (via advertiserId)
- `campaignEvents` > one `campaigns` (via campaignId)
- `advertisers` has many `campaigns`
- `campaigns` has many `campaignEvents`

## Partner Dashboard Pages

Route group: `(partners)/` with its own sidebar layout

### `/` — Dashboard Home

- Welcome message, account status
- Summary cards: active campaigns, total impressions, total clicks, CTR
- Quick action: "Create Campaign"

### `/campaigns` — Campaign List

- Table: campaign name, placement type, status, date range, impressions, clicks, CTR
- Actions: edit, pause/resume

### `/campaigns/create` — New Campaign

- Upload creative image (Vercel Blob)
- Set destination URL, alt text
- Choose placement type (floating banner / pinned card / in-feed card)
- Set start and end dates
- Select plan (starter / growth / premium)

### `/campaigns/[id]` — Campaign Detail

- Performance chart (daily impressions/clicks from campaignEvents)
- Campaign settings (edit creative, dates, pause/resume)

### `/billing` — Billing & Subscription

- Current plan and subscription status
- Payment method (card or PayNow)
- Invoice history
- Upgrade/downgrade plan

### `/settings` — Account Settings

- Company name, contact details, website
- Email preferences

## Admin Oversight

New "Advertising" group in the existing `/admin` sidebar:

### `/admin/advertising` — Overview

- Summary cards: total advertisers, active campaigns, total revenue (based on plans), impressions/clicks this month
- Recent sign-ups and campaign activity

### `/admin/advertising/advertisers` — All Advertisers

- Table: company name, contact email, status, number of campaigns, sign-up date
- Click through to view their campaigns

### `/admin/advertising/campaigns` — All Campaigns

- Table: campaign name, advertiser, placement type, plan, status, date range, impressions, clicks
- Ability to pause/end any campaign (admin override)

### `/admin/advertising/preview` — Ad Placement Preview

- Renders all three ad components (FloatingBanner, PinnedCard, InFeedCard) on a single page
- Shows active campaigns or falls back to placeholder/demo creatives
- No impression/click tracking on preview
- Protected behind admin auth — QA tool before launch

## Public Site Ad Rendering

Three reusable components that query active campaigns from the database:

### `<FloatingBanner />`

- Fixed position, bottom-right corner
- Rendered in root layout — visible on every page
- Shows one active floating_banner campaign

### `<PinnedCard />`

- Rendered in dedicated "Sponsored" sections on high-traffic pages (car makes, COE results)
- Placed manually in those page layouts

### `<InFeedCard />`

- Rendered within browsing feeds (car listings, etc.)
- Styled to match surrounding content (native feel)

### Behaviour

- Each component queries for active campaigns of its placement type (status = active, within date range)
- Uses `"use cache"` with short cache life for performance
- **Impressions**: incremented server-side on page render (one per page load)
- **Clicks**: client-side redirect via `/api/ads/click/[campaignId]` — logs click, redirects to destinationUrl
- All ads labelled "Sponsored" for transparency
- If no active campaign exists for a placement type, component renders nothing

### Scheduling

- Date-based: campaigns auto-activate on startDate and auto-end on endDate
- Manual override: advertiser can pause/resume campaigns mid-flight
- Status flow: draft > active > paused > ended

## Placement Types & Plans

### Placements (fixed locations, no page targeting)

| Type | Location | Visibility |
|------|----------|------------|
| Floating banner | Bottom-right corner, every page | Persistent, always visible |
| Pinned card | "Sponsored" sections on high-traffic pages | High visibility |
| In-feed card | Within browsing feeds | Native feel |

### Plans

| Plan | Price | Includes |
|------|-------|----------|
| Starter | $400/mo | Floating banner, 30-day placement, basic analytics |
| Growth | $700/mo | Floating banner + pinned cards, detailed analytics |
| Premium | $1,000/mo | All placements + custom creative review |

## Phase 2 (Future)

These are explicitly out of scope for the initial build but the architecture supports them:

- **Advertiser self-serve portal improvements**: richer analytics, A/B testing creatives
- **Page-level targeting**: assign campaigns to specific pages/sections
- **Storage migration**: Cloudflare R2 if Vercel Blob costs grow
- **Additional payment methods**: GrabPay if B2B adoption increases
- **Campaign approval workflow**: admin review before campaigns go live
