// Guide page data for pSEO
// Each guide is 800-1200 words with Singapore-specific context

export interface Guide {
  slug: string;
  term: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  relatedTerms: string[];
  relatedLinks: { label: string; href: string }[];
  lastUpdated: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "coe",
    term: "COE",
    title: "Certificate of Entitlement (COE) - Complete Guide",
    description:
      "Everything you need to know about Singapore's COE system: how bidding works, the 5 categories, current premiums, and tips for timing your purchase.",
    excerpt:
      "The Certificate of Entitlement is Singapore's unique vehicle quota system that controls the number of vehicles on the road. Understanding how COE works is essential for anyone planning to buy a car in Singapore.",
    content: `## What is COE?

The **Certificate of Entitlement (COE)** is a quota licence required to register, own, and use a vehicle in Singapore. Introduced in 1990 under the Vehicle Quota System (VQS), it gives the holder the right to register, own, and use a vehicle for 10 years.

Singapore is one of the few countries in the world that requires a separate licence to own a car, in addition to a driving licence. This system helps the government control the vehicle population growth to manage traffic congestion and land use.

## How the COE Bidding System Works

COE prices are determined through an open bidding process conducted by the Land Transport Authority (LTA). Here's how it works:

### Bidding Schedule
- **Frequency**: Twice a month (1st and 3rd Monday)
- **Duration**: Each exercise runs for 3 working days
- **Results**: Announced on Wednesday afternoon

### The Bidding Process
1. You submit your bid through an authorised dealer or directly via OneMotoring
2. Bids can be revised upward during the exercise
3. At close, the lowest successful bid in each category becomes the Quota Premium (QP)
4. All successful bidders pay the QP, not their actual bid amount

This is a **uniform-price auction**: everyone pays the same price regardless of how much they bid.

## The 5 COE Categories

| Category | Vehicle Type | Power/Engine Limit |
|----------|-------------|-------------------|
| **A** | Cars | Up to 1,600cc and 130bhp, or EVs up to 110kW |
| **B** | Cars | Above 1,600cc or 130bhp, or EVs above 110kW |
| **C** | Goods vehicles and buses | No limit |
| **D** | Motorcycles | No limit |
| **E** | Open (any vehicle) | No limit |

**Category E** is an open category that can be used for any vehicle type. It typically attracts the highest premiums because of its flexibility.

### Which Category Should You Choose?

For most car buyers, it comes down to Category A vs B:
- **Category A**: Smaller, more fuel-efficient cars: Toyota Corolla, Honda Civic base models, most EVs
- **Category B**: Larger, more powerful cars: BMW 3 Series, Mercedes C-Class, Tesla Model 3 Performance

If both categories have similar premiums, some buyers choose Category E for flexibility in case they want to transfer the COE to a different vehicle type later.

## Current COE Landscape

COE premiums fluctuate based on supply and demand. Key factors affecting prices:

- **Quota supply**: Determined by deregistrations + new quota allocation
- **Economic conditions**: During recessions, demand typically drops
- **New model launches**: Popular models can spike demand in specific categories
- **Speculation**: Some buyers time purchases based on expected price movements

Check our [COE Premiums](/coe/premiums) page for the latest prices and trends.

## COE Renewal (PQP)

When your 10-year COE expires, you have two options:
1. **Deregister** the vehicle and claim any remaining PARF rebate
2. **Renew** the COE for another 5 or 10 years

Renewal costs are based on the **Prevailing Quota Premium (PQP)**: a moving average of recent COE prices in your category. See our [PQP Rates](/coe/pqp) page for current rates.

### Renewal Terms
- **10-year renewal**: Pay 100% of PQP
- **5-year renewal**: Pay 50% of PQP

Note: Renewed COEs do not qualify for PARF rebates.

## Tips for COE Bidding

1. **Monitor trends**: Track prices over several months before deciding
2. **Consider timing**: Prices often dip slightly in January and during economic uncertainty
3. **Factor in all costs**: COE is just one component: remember ARF, OMV, and other fees
4. **Paper bids**: Let your dealer handle bidding through a "paper bid" for convenience

## Frequently Asked Questions

### How long is a COE valid?
A COE is valid for 10 years from the date of registration. After that, you can renew it for another 5 or 10 years.

### Can I transfer my COE to another vehicle?
No, COEs are tied to the specific vehicle. However, Category E COEs offer flexibility during initial registration.

### What happens if my bid fails?
Your deposit is returned, and you can bid again in the next exercise.

## Related Terms

- [ARF](/learn/arf): Additional Registration Fee
- [PARF](/learn/parf): Preferential Additional Registration Fee
- [OMV](/learn/omv): Open Market Value
- [PQP](/learn/pqp): Prevailing Quota Premium`,
    relatedTerms: ["ARF", "PARF", "OMV", "PQP"],
    relatedLinks: [
      { label: "Current COE Premiums", href: "/coe/premiums" },
      { label: "COE Bidding Results", href: "/coe/results" },
      { label: "PQP Rates", href: "/coe/pqp" },
    ],
    lastUpdated: "2026-04-11",
  },
  {
    slug: "parf",
    term: "PARF",
    title: "PARF Rebate - How It Works and When to Deregister",
    description:
      "Understand Singapore's PARF rebate system: how it's calculated, the declining rebate schedule, and when it makes financial sense to deregister your car.",
    excerpt:
      "The Preferential Additional Registration Fee (PARF) rebate is money you get back when you deregister your car before the COE expires. Understanding PARF can save you thousands when deciding when to sell or scrap your vehicle.",
    content: `## What is PARF?

The **Preferential Additional Registration Fee (PARF)** is a rebate you receive when deregistering a vehicle before its COE expires. It returns a portion of the Additional Registration Fee (ARF) you paid when you first registered the car.

PARF was introduced to encourage vehicle owners to deregister their cars earlier, helping to maintain a younger and cleaner vehicle fleet in Singapore.

## How PARF is Calculated

PARF rebates are calculated as a percentage of the ARF paid at registration, decreasing each year. **Budget 2026** introduced significant changes to the rebate schedule.

### New PARF Rates (February 2026 onwards)

For cars registered with COEs from the second February 2026 bidding exercise:

| Vehicle Age | PARF Rebate | Cap |
|-------------|-------------|-----|
| Within 5 years | 30% of ARF | $30,000 |
| 6th year | 25% of ARF | $30,000 |
| 7th year | 20% of ARF | $30,000 |
| 8th year | 15% of ARF | $30,000 |
| 9th year | 10% of ARF | $30,000 |
| 10th year | 5% of ARF | $30,000 |

### Legacy PARF Rates (pre-February 2026)

For cars registered before February 2026, the original rates still apply:

| Vehicle Age | PARF Rebate | Cap |
|-------------|-------------|-----|
| Within 5 years | 75% of ARF | $60,000 |
| 6th year | 70% of ARF | $60,000 |
| 7th year | 65% of ARF | $60,000 |
| 8th year | 60% of ARF | $60,000 |
| 9th year | 55% of ARF | $60,000 |
| 10th year | 50% of ARF | $60,000 |

After 10 years (when the original COE expires), **no PARF rebate is available**.

### Example: Legacy vs New Rates

For a car with **$100,000 ARF** deregistered at Year 5:

**Legacy (pre-Feb 2026)**: $100,000 × 75% = $75,000 → capped at **$60,000**

**New (Feb 2026+)**: $100,000 × 30% = $30,000 → **$30,000** (within cap)

The new structure significantly reduces PARF benefits, especially for high-ARF vehicles where the cap previously provided substantial rebates.

## PARF vs COE Rebate

When deregistering, you may receive two types of rebates:

| Rebate Type | Based On | Condition |
|-------------|----------|-----------|
| **PARF** | ARF paid | Only for first COE cycle (10 years) |
| **COE Rebate** | Remaining COE value | Pro-rated based on months remaining |

**Important**: If you renew your COE (pay PQP), you lose all PARF eligibility. The car becomes "PARF-ineligible" and will only qualify for COE rebates.

## When Should You Deregister?

The financial decision depends on several factors:

### Deregister Early (Year 5-7) When:
- Car has high depreciation (luxury/performance vehicles)
- You want to maximise PARF rebate
- Maintenance costs are rising
- You're upgrading to a newer model

### Keep Until Year 10 When:
- Car is reliable with low running costs
- COE prices are high (renewal is expensive)
- PARF rebate difference isn't significant
- You're happy with the vehicle

### The Break-Even Calculation

To decide, calculate:
1. **Annual PARF loss**: How much PARF you lose each year
2. **Annual ownership cost**: Insurance, road tax, maintenance, parking
3. **Alternative cost**: What would a new/replacement car cost?

If annual PARF loss + ownership costs exceed replacement value, consider deregistering.

## The Deregistration Process

1. **Book appointment** via OneMotoring or an authorised scrapyard
2. **Remove belongings** and cancel insurance/road tax
3. **Surrender vehicle** at designated centre
4. **Receive rebates** within 2-4 weeks (PARF + remaining COE)

You can also export the vehicle instead of scrapping, which may yield additional value in certain markets.

## PARF for Electric Vehicles

EVs follow the same PARF structure. However, since EVs tend to have higher OMV (and thus higher ARF), the PARF rebates are typically larger in absolute terms.

This is one reason why the total cost of ownership for EVs can be competitive despite higher upfront prices: the higher PARF rebate offsets some depreciation.

## Check Your PARF Value

Use our [PARF Calculator](/cars/parf) to estimate your vehicle's current PARF rebate based on registration date and ARF paid.

## Frequently Asked Questions

### Can I get PARF if I renew my COE?
No. Once you renew (pay PQP), the vehicle becomes PARF-ineligible. Only COE rebates apply for renewed vehicles.

### Is PARF taxable?
No, PARF rebates are not considered taxable income in Singapore.

### How is PARF different from scrap value?
PARF is a government rebate. Scrap value is what scrapyards pay for the vehicle's materials. You receive both when scrapping a PARF-eligible car.

## Related Terms

- [ARF](/learn/arf): The fee PARF is calculated from
- [COE](/learn/coe): Certificate of Entitlement
- [OMV](/learn/omv): Determines your ARF
- [PQP](/learn/pqp): COE renewal cost`,
    relatedTerms: ["ARF", "COE", "OMV", "PQP"],
    relatedLinks: [
      { label: "PARF Calculator", href: "/cars/parf" },
      { label: "Deregistration Statistics", href: "/cars/deregistrations" },
    ],
    lastUpdated: "2026-04-11",
  },
  {
    slug: "arf",
    term: "ARF",
    title: "Additional Registration Fee (ARF) - Tiers and Calculation",
    description:
      "Complete guide to Singapore's ARF: the tiered tax structure, how it's calculated from OMV, and its impact on car prices and PARF rebates.",
    excerpt:
      "The Additional Registration Fee is a major component of car prices in Singapore. This tiered tax on vehicle value can add tens of thousands to your purchase:here's how it works.",
    content: `## What is ARF?

The **Additional Registration Fee (ARF)** is a tax levied when you first register a vehicle in Singapore. It's calculated based on the vehicle's Open Market Value (OMV) and uses a tiered rate structure designed to make luxury vehicles proportionally more expensive.

ARF is one of the largest cost components when buying a car in Singapore, often exceeding the COE premium for higher-value vehicles.

## ARF Tiers and Rates

The ARF uses a progressive 5-tier system (revised February 2023):

| OMV Range | ARF Rate |
|-----------|----------|
| First $20,000 | 100% |
| $20,001 – $40,000 | 140% |
| $40,001 – $60,000 | 190% |
| $60,001 – $80,000 | 250% |
| Above $80,000 | 320% |

The steeper rates at higher tiers mean luxury vehicles pay significantly more ARF relative to their OMV.

## ARF Calculation Examples

### Example 1: Budget Car (OMV $18,000)
- First $18,000 × 100% = **$18,000 ARF**
- Total ARF: **$18,000**

### Example 2: Mid-Range Car (OMV $35,000)
- First $20,000 × 100% = $20,000
- Next $15,000 × 140% = $21,000
- Total ARF: **$41,000**

### Example 3: Premium Car (OMV $55,000)
- First $20,000 × 100% = $20,000
- Next $20,000 × 140% = $28,000
- Next $15,000 × 190% = $28,500
- Total ARF: **$76,500**

### Example 4: Luxury Car (OMV $100,000)
- First $20,000 × 100% = $20,000
- Next $20,000 × 140% = $28,000
- Next $20,000 × 190% = $38,000
- Next $20,000 × 250% = $50,000
- Remaining $20,000 × 320% = $64,000
- Total ARF: **$200,000**

Notice how the ARF for the luxury car ($200,000) is double the OMV itself, due to the steep 320% top tier.

## Why ARF Matters

### 1. Major Cost Component
For a mid-range car, ARF often represents 30-40% of the total purchase price (excluding COE).

### 2. Affects PARF Rebate
When you deregister, your [PARF rebate](/learn/parf) is calculated as a percentage of the ARF paid. Higher ARF = higher potential PARF rebate.

### 3. Depreciation Calculation
Your car's depreciation is heavily influenced by ARF:
- **High OMV car**: Steeper depreciation due to higher ARF loss
- **Low OMV car**: Flatter depreciation curve

### 4. Resale Value
Since PARF decreases each year, ARF indirectly affects your car's resale value.

## ARF for Different Vehicle Types

### Electric Vehicles (EVs)
EVs follow the same ARF structure. However, EVs often have higher OMV due to battery costs, resulting in higher ARF. Government rebates (like the EV Early Adoption Incentive) help offset this.

### Motorcycles
Motorcycles also pay ARF, but the rates are much lower:
- First $5,000: 15%
- Above $5,000: 50%

### Commercial Vehicles
Goods vehicles and buses have different ARF structures aligned with their vehicle categories.

## Historical Context

The tiered ARF system has evolved significantly:

| Year | Change |
|------|--------|
| 2013 | Introduced tiered structure (previously 100% flat rate) |
| 2018 | Rates increased for higher tiers |
| 2022 | New 220% tier for OMV above $80,000 |
| 2023 | Major revision: 5-tier structure with rates up to 320% |

The February 2023 revision introduced steeper tiers to moderate demand for luxury vehicles while keeping entry-level cars more accessible.

## ARF vs COE: What's the Difference?

| Aspect | ARF | COE |
|--------|-----|-----|
| **Based on** | Vehicle value (OMV) | Market bidding |
| **Paid to** | Government (tax) | LTA (quota licence) |
| **Refundable** | Yes, via PARF rebate | Yes, pro-rated on deregistration |
| **Affects** | Vehicle depreciation | Right to own vehicle |

Both are one-time fees paid at registration, but they serve different purposes.

## Minimising ARF Impact

1. **Choose lower-OMV models**: The tiered structure punishes high OMV exponentially
2. **Consider parallel imports**: Sometimes have lower OMV assessments
3. **Factor PARF into TCO**: Higher ARF means higher potential rebate
4. **Time your deregistration**: Maximise PARF recovery

## Checking Your Vehicle's ARF

The ARF is shown on your vehicle registration documents. You can also:
- Check via OneMotoring with your vehicle number
- Ask the dealer during purchase
- Calculate from OMV using the tiers above

## Frequently Asked Questions

### Is ARF refundable?
Yes, partially. When you deregister within 10 years, you receive a PARF rebate (50-75% of ARF depending on vehicle age).

### Why does Singapore have ARF?
ARF serves multiple purposes: revenue generation, controlling vehicle population, and ensuring car ownership costs reflect usage of limited road space.

### Can I avoid paying ARF?
No, ARF is mandatory for all new vehicle registrations in Singapore. There are no exemptions for private vehicles.

## Related Terms

- [OMV](/learn/omv): The value ARF is calculated from
- [PARF](/learn/parf): Rebate based on ARF
- [COE](/learn/coe): The other major registration cost`,
    relatedTerms: ["OMV", "PARF", "COE"],
    relatedLinks: [
      { label: "PARF Calculator", href: "/cars/parf" },
      { label: "Car Registrations", href: "/cars/registrations" },
    ],
    lastUpdated: "2026-04-11",
  },
  {
    slug: "omv",
    term: "OMV",
    title: "Open Market Value (OMV) - How Singapore Customs Assesses Your Car",
    description:
      "Understand how OMV is determined by Singapore Customs, what's included in the valuation, and how it affects your ARF, PARF, and total car cost.",
    excerpt:
      "The Open Market Value is the foundation of Singapore's car tax system. This Customs-assessed value determines your ARF, PARF potential, and significantly impacts the total price you pay for a car.",
    content: `## What is OMV?

The **Open Market Value (OMV)** is the price of a vehicle before any Singapore-specific taxes are applied. It's assessed by Singapore Customs and represents what the car would cost in a free market without duties or taxes.

OMV is crucial because it determines your [ARF (Additional Registration Fee)](/learn/arf), which in turn affects your [PARF rebate](/learn/parf) when you eventually deregister.

## What's Included in OMV?

Singapore Customs includes the following in the OMV assessment:

### Included in OMV
- Purchase price of the vehicle
- Freight and insurance costs (CIF)
- All accessories and modifications
- Commission paid to buying agents
- Royalties and licence fees

### Not Included in OMV
- Singapore duties and taxes (ARF, COE, GST)
- Registration fees
- Dealer markup and profit margin
- Extended warranties (if optional)

## How is OMV Determined?

Singapore Customs uses several methods:

### 1. Transaction Value Method
The actual price paid for the vehicle, adjusted for:
- Currency exchange rates
- Transport costs to Singapore
- Insurance

This is the most common method for new cars imported by authorised dealers.

### 2. Comparable Sales Method
For parallel imports or used vehicles, Customs may reference similar transactions:
- Same make and model
- Similar specifications
- Recent import records

### 3. Residual Method
When other methods aren't applicable, Customs determines value based on:
- Manufacturing costs
- Typical profit margins
- Market research

## OMV for Different Import Types

### Authorised Dealer (AD) Cars
- OMV is typically well-documented
- Based on official invoices from manufacturers
- Generally consistent across same models

### Parallel Import (PI) Cars
- OMV may vary between importers
- Can sometimes be lower due to sourcing from different markets
- Subject to more scrutiny from Customs

### Used/Second-hand Imports
- OMV assessed based on current market value
- Depreciation factors may apply
- Can vary significantly based on condition and mileage

## OMV Impact on Total Car Cost

Let's see how OMV cascades through the cost structure:

### Example: Car with $30,000 OMV

| Component | Calculation | Amount |
|-----------|-------------|--------|
| OMV | Base value | $30,000 |
| ARF | 100% of first $20k + 140% of $10k | $34,000 |
| Excise Duty | 20% of OMV | $6,000 |
| GST | 9% of (OMV + Excise) | $3,240 |
| **Subtotal (before COE)** | | **$73,240** |
| COE (Category A, example) | Market rate | ~$100,000 |
| **Total** | | **~$173,240** |

A $30,000 car becomes over $170,000 after taxes and COE. The OMV is just the starting point!

## Strategies for Lower OMV

### 1. Choose Base Models
Higher trim levels with more features have higher OMV:
- Navigation systems
- Premium audio
- Larger wheels
- Performance packages

Each adds to the OMV and thus to your ARF.

### 2. Consider Different Variants
The same car from different markets may have different OMV:
- Japan-spec vs Europe-spec
- Regional variants with different equipment

### 3. Understand What's "Optional"
Factory options increase OMV. Dealer-installed accessories (fitted in Singapore) typically don't.

## OMV Trends

OMV has been affected by several factors:

| Factor | Impact on OMV |
|--------|---------------|
| Electric vehicles | Higher due to battery costs |
| Supply chain issues | Increased during chip shortage |
| Currency fluctuations | EUR/USD rates affect European cars |
| Advanced tech | More ADAS features = higher OMV |

## Checking a Car's OMV

### Before Purchase
- Ask the dealer for the OMV
- Compare with similar models
- Check if it seems reasonable for the variant

### For Registered Vehicles
- Check vehicle registration documents
- Query via OneMotoring
- Request from LTA if needed

## OMV for EVs

Electric vehicles typically have higher OMV than comparable ICE cars because:
- Battery packs are expensive
- EV-specific components add cost
- Advanced power electronics

However, government incentives (ARF rebates, road tax exemptions) help offset the higher OMV.

## Frequently Asked Questions

### Can I dispute the OMV?
Yes, you can appeal to Singapore Customs if you believe the assessment is incorrect. You'll need supporting documentation.

### Does OMV include shipping costs?
Yes, OMV is based on CIF (Cost, Insurance, Freight) value: the landed cost before Singapore taxes.

### Why is OMV different for same model?
Variants, options, import source, and assessment timing can all cause OMV differences for the same model.

### Is OMV the same as the "paper value"?
Not exactly. Paper value for loans/insurance may differ from OMV as it includes other factors.

## Related Terms

- [ARF](/learn/arf): Calculated from OMV
- [PARF](/learn/parf): Indirectly based on OMV via ARF
- [COE](/learn/coe): Separate from OMV-based taxes`,
    relatedTerms: ["ARF", "PARF", "COE"],
    relatedLinks: [
      { label: "PARF Calculator", href: "/cars/parf" },
      { label: "Car Registrations", href: "/cars/registrations" },
    ],
    lastUpdated: "2026-04-11",
  },
  {
    slug: "pqp",
    term: "PQP",
    title: "Prevailing Quota Premium (PQP) - COE Renewal Costs Explained",
    description:
      "Complete guide to Singapore's PQP: how it's calculated, when to renew vs deregister, and current PQP rates across all vehicle categories.",
    excerpt:
      "The Prevailing Quota Premium determines how much you pay to renew your COE after 10 years. Understanding PQP helps you decide whether to extend your car's lifespan or deregister for rebates.",
    content: `## What is PQP?

The **Prevailing Quota Premium (PQP)** is the moving average of COE prices used to calculate the cost of renewing your Certificate of Entitlement after the initial 10-year period expires.

When your COE expires, you have two choices:
1. **Deregister** and receive any remaining PARF/COE rebates
2. **Renew** by paying the PQP for another 5 or 10 years

## How PQP is Calculated

PQP is the **3-month moving average** of Quota Premiums in your vehicle's COE category. It's updated after each COE bidding exercise (twice monthly).

For example, if the last 6 COE results for Category A were:
- $95,000, $98,000, $97,000, $100,000, $99,000, $96,000

The PQP would be based on the average of the most recent results, smoothing out short-term fluctuations.

## Renewal Options and Costs

| Renewal Term | Cost | Notes |
|--------------|------|-------|
| **10-year renewal** | 100% of PQP | Full decade of usage |
| **5-year renewal** | 50% of PQP | Shorter commitment |

### Example

If Category A PQP is **$100,000**:
- **10-year renewal**: Pay $100,000
- **5-year renewal**: Pay $50,000

**Note**: After a 5-year renewal, you cannot renew again: the car must be deregistered when the renewed COE expires.

## PQP vs COE Bidding

| Aspect | PQP (Renewal) | COE (New Registration) |
|--------|---------------|------------------------|
| **Price** | Fixed (moving average) | Variable (auction) |
| **Timing** | Pay when your COE expires | Bid during exercises |
| **Flexibility** | Choose 5 or 10 years | Always 10 years |
| **Competition** | None (guaranteed) | Bid against others |

**Key advantage of PQP**: You're guaranteed renewal at the published rate: no bidding competition.

## When to Renew vs Deregister

### Consider Renewal When:
- Your car is well-maintained and reliable
- Current PQP is lower than prevailing COE prices
- You want to avoid the hassle of buying a new car
- The car has low mileage and good condition

### Consider Deregistration When:
- Car requires expensive repairs
- You want a newer model with better features
- PARF rebate is still substantial (pre-Feb 2026 cars)
- Running costs are high (road tax, fuel, maintenance)

## Important: No PARF After Renewal

Once you renew your COE, the car becomes **PARF-ineligible**. You will only receive a pro-rated COE rebate if you deregister later: no PARF rebate.

This is a key consideration: if your car has significant PARF value remaining, deregistering might yield more than the car's resale value with a renewed COE.

## PQP by Category

PQP rates vary by COE category:

| Category | Vehicles | Typical PQP Range |
|----------|----------|-------------------|
| **A** | Cars ≤1,600cc/130bhp | Moderate |
| **B** | Cars >1,600cc/130bhp | Higher |
| **C** | Goods vehicles, buses | Lower |
| **D** | Motorcycles | Lowest |
| **E** | Open (any vehicle) | Highest |

Check our [PQP Rates](/coe/pqp) page for current rates across all categories.

## The Renewal Process

1. **Check eligibility**: Your COE must be expiring within 3 months
2. **Decide term**: Choose 5-year or 10-year renewal
3. **Apply online**: Submit via OneMotoring
4. **Pay PQP**: Complete payment before COE expiry
5. **Receive new COE**: Valid from the day after original expiry

**Important**: If you miss the deadline, your car becomes illegal to drive and may be deregistered automatically.

## PQP Trends

PQP follows COE market trends with a lag due to the moving average calculation:
- When COE prices rise, PQP increases gradually
- When COE prices fall, PQP decreases gradually
- The smoothing effect protects against extreme spikes

## Frequently Asked Questions

### Can I renew before my COE expires?
You can apply for renewal up to 3 months before expiry, but the new COE period only starts after the current one ends.

### Can I renew again after a 5-year renewal?
No. A 5-year renewal is final: when it expires, the car must be deregistered. Only a 10-year renewal allows for a subsequent renewal.

### Is the PQP refundable if I deregister early?
Yes, you receive a pro-rated refund based on remaining months. However, no PARF rebate applies to renewed COEs.

### Why is PQP sometimes higher than current COE prices?
PQP is a moving average, so it can lag behind recent price drops. Conversely, it may be lower than current prices if COE has recently spiked.

## Related Terms

- [COE](/learn/coe): The licence PQP renews
- [PARF](/learn/parf): Lost eligibility after renewal
- [ARF](/learn/arf): Not affected by renewal`,
    relatedTerms: ["COE", "PARF", "ARF"],
    relatedLinks: [
      { label: "Current PQP Rates", href: "/coe/pqp" },
      { label: "COE Results", href: "/coe/results" },
    ],
    lastUpdated: "2026-04-11",
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((guide) => guide.slug);
}
