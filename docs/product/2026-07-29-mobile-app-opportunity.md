# Mobile App Opportunity

> Status: Opportunity thesis, not an approved implementation roadmap  
> Recorded: 29 July 2026

## Executive Recommendation

MotorMetrics has a credible mobile-app opportunity if it becomes a personalised
vehicle decision and ownership companion. A native copy of the current
dashboard would not be compelling enough on its own.

The strongest proposition is:

> Add your vehicle once. MotorMetrics watches COE, PQP, PARF, and ownership
> deadlines and tells you when something important changes.

The web application should remain the primary discovery, research, and
long-form analysis surface. Consumer accounts, saved vehicle profiles, and a
complete web-push service should validate repeated demand before MotorMetrics
commits to native iOS or Android development.

## Why Mobile Could Be Valuable

### Timely, High-Value Decisions

Singapore vehicle ownership produces recurring decisions with material
financial consequences. LTA conducts two COE bidding exercises each month, PQP
changes affect renewal decisions, and PARF value decreases as a vehicle ages.
These events are better suited to personalised alerts than pages users must
remember to revisit.

A mobile relationship could notify a user when:

- a relevant COE result or PQP rate is published;
- a selected category crosses a saved price threshold;
- a COE renewal window is approaching;
- the vehicle is nearing a PARF rebate step-down; or
- a user-recorded road-tax, insurance, or inspection deadline is due.

### Existing Platform Foundation

MotorMetrics already operates the difficult domain and data-processing layer:
automated LTA data workflows, public API routes, historical analysis, cost
information, PARF and PQP calculators, and an initial browser-notification
permission prompt.

This foundation can serve web and mobile clients, reducing duplicate data work.
It does not yet provide the consumer identity, vehicle-profile, notification
subscription, delivery, and preference-management capabilities required for a
mobile product.

### Meaningful, Focused Audience

LTA reported approximately 1.01 million motor vehicles in Singapore in June
2026, including about 558,000 cars, 98,000 private-hire cars, and 154,000
motorcycles. This is a bounded market, but one in which users make unusually
high-value purchasing, renewal, financing, insurance, and maintenance
decisions.

That makes the audience commercially relevant to insurers, dealers, workshops,
lenders, charging providers, and other vehicle services. Monetisation should
remain secondary to independent, trustworthy decision support.

### Proven Mobile Demand, With Room to Differentiate

Established products such as Sgcarmart and Motorist already provide mobile
access to vehicle listings, COE information, vehicle details, and ownership
reminders. Their adoption indicates that Singapore drivers will use mobile
tools for these jobs.

MotorMetrics should not compete by becoming another marketplace or broad
vehicle "super app." Its differentiation is independent, evidence-led market
intelligence translated into concise, personally relevant actions.

### Stronger Retention Than an Anonymous Dashboard

The current web experience answers:

> What is happening in Singapore's vehicle market?

A personalised mobile experience can additionally answer:

> What does this change mean for my vehicle, and when should I act?

That shift from general information to saved context creates a reason to return
across COE exercises, monthly data releases, and ownership milestones.

## Why Native Development Is Not Yet Justified

- Much of the underlying data changes monthly or twice monthly, which is not
  enough by itself to create a frequent app habit.
- Historical charts, detailed tables, educational guides, and search
  acquisition remain naturally web-first.
- Current authentication is primarily an administrative capability rather than
  a public consumer account system.
- The existing notification prompt requests browser permission, but a complete
  push subscription, delivery, and preference-management pipeline is not yet
  evident.
- Native applications would add release, review, testing, privacy, and
  maintenance obligations across additional platforms.

Without personalisation and reliable alerts, a native application would risk
becoming an infrequently opened, smaller version of the website.

## Proposed Product Wedge

### My Garage

Users save the minimum information needed to personalise MotorMetrics:

- vehicle type and relevant COE category;
- registration or COE expiry date;
- ARF and other inputs needed for saved calculations; and
- optional user-entered road-tax, insurance, and inspection dates.

The initial product should avoid requiring NRIC, Singpass integration, or
claims of direct government-record access. Collect only information that
creates a clear user benefit.

### Ownership Timeline

Present upcoming financial and administrative milestones in one calm,
chronological view:

- COE expiry and renewal windows;
- estimated PARF rebate changes;
- current PQP context;
- user-recorded recurring deadlines; and
- relevant market-data publication dates.

### Personalised Alerts

Allow users to choose alerts by vehicle and category, including:

- final COE results and movement from the previous exercise;
- saved COE or PQP thresholds;
- renewal and PARF milestones; and
- newly published analysis relevant to a saved vehicle or fuel type.

Notifications must be specific, explain why the alert matters, and deep-link to
the supporting data or calculation. Promotional notifications should be
separately controlled and never obscure the product's independent positioning.

### Saved Decision Scenarios

Extend the existing calculators so users can save and revisit:

- renew-versus-replace comparisons;
- five-year versus ten-year COE renewal scenarios;
- PARF outcomes at different deregistration dates; and
- selected models or vehicle categories for comparison.

## Web and Mobile Roles

| Web remains strongest for                   | Installed or native experience is strongest for   |
| ------------------------------------------- | ------------------------------------------------- |
| Search discovery and sharing                | Persistent identity and preferences               |
| Historical charts and dense tables          | Timely, personalised alerts                       |
| Guides, definitions, and editorial analysis | Ownership timelines                               |
| Broad market exploration                    | Saved vehicles and scenarios                      |
| Public, linkable evidence                   | Quick checks during purchase or renewal decisions |

The two surfaces should share data and domain logic rather than evolve into
separate products.

## Validation Path

### 1. Establish the Consumer Relationship on the Web

- Add public consumer accounts separately from admin access.
- Introduce My Garage and saved notification preferences.
- Complete web push with service-worker registration, subscription storage,
  delivery, revocation, and per-alert controls.
- Instrument the journey from account creation through vehicle setup, alert
  delivery, and meaningful follow-up actions.

### 2. Prove Repeated Value

Evaluate whether:

- users complete and retain a vehicle profile;
- opted-in users return across multiple COE or monthly-data cycles;
- alerts lead to relevant analysis or calculator use without excessive
  unsubscribes;
- My Garage users retain better than anonymous visitors; and
- users request platform-specific capabilities that the web cannot deliver
  well.

Targets should be set against MotorMetrics' actual traffic and retention
baseline rather than invented in this opportunity document.

### 3. Make a Native Go/No-Go Decision

Proceed to native development only when personalisation and alerts demonstrate
repeat engagement. At that point, select the implementation approach based on
the required platform capabilities, team capacity, and validated user
behaviour.

## Product Boundaries

The initial opportunity does not include:

- a new or used vehicle marketplace;
- COE bid submission or automated bidding;
- driver telemetry, navigation, or in-motion interaction;
- broad community or social-network features;
- direct government-account integration; or
- a commitment to a native framework, delivery date, or monetisation model.

MotorMetrics should remain an expert, calm, and precise source of independent
market intelligence.

## Supporting Evidence

- [LTA: Certificate of Entitlement](https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/upfront-vehicle-costs/certificate-of-entitlement--coe-.html)
  explains the twice-monthly bidding cycle, PQP, and renewal process.
- [LTA: Monthly Vehicle Statistics](https://www.lta.gov.sg/content/dam/ltagov/who_we_are/statistics_and_publications/statistics/pdf/M06-Vehs_by_Type.pdf)
  provides the current vehicle-population context.
- [data.gov.sg: COE Bidding Results and Prices](https://data.gov.sg/datasets/d_69b3380ad7e51aff3a7dcc84eba52b8a/view)
  demonstrates the reusable official data history available to the product.
- [Sgcarmart on the App Store](https://apps.apple.com/sg/app/sgcarmart/id962261200)
  and [Motorist on the App Store](https://apps.apple.com/sg/app/motorist-sg-vehicle-super-app/id1348164209)
  provide indicative evidence of established mobile demand for Singapore
  vehicle information and ownership utilities.
