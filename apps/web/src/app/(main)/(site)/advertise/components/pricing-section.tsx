import { Chip, cn, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    cta: "Check availability",
    features: ["Floating banner", "30-day placement", "Basic analytics"],
    featured: false,
    name: "Starter",
    note: "A single static unit, to test the waters.",
    price: "$400",
  },
  {
    cta: "Enquire about this",
    features: [
      "Floating banner",
      "Pinned cards",
      "30-day placement",
      "Detailed analytics",
      "Priority support",
    ],
    featured: true,
    name: "Growth",
    note: "The banner plus a pinned card on the pages that carry the most traffic.",
    price: "$700",
  },
  {
    cta: "Check availability",
    features: [
      "Floating banner",
      "Pinned cards",
      "In-feed cards",
      "30-day placement",
      "Detailed analytics",
      "Priority support",
      "Custom creative review",
    ],
    featured: false,
    name: "Premium",
    note: "Every placement type, across the whole platform.",
    price: "$1,000",
  },
];

/**
 * The packages on bordered surfaces, three across from lg, two at md and
 * stacked on phones. The featured package takes the accent border.
 */
export function PricingSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="pricing">
      <SectionHead
        caption="Booked by the month. No long-term commitment."
        eyebrow="Rates"
        title="Packages"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(({ cta, features, featured, name, note, price }) => (
          <div
            className={cn(
              "flex min-w-0 flex-col gap-3 rounded-lg border bg-surface p-5",
              featured ? "border-accent" : "border-separator",
            )}
            key={name}
          >
            <div className="flex items-center gap-3">
              <Typography.Heading className="text-xl" level={3} weight="bold">
                {name}
              </Typography.Heading>
              {featured ? (
                <Chip
                  className="ml-auto"
                  color="accent"
                  size="sm"
                  variant="primary"
                >
                  Most booked
                </Chip>
              ) : null}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-3xl tabular-nums leading-none tracking-tight">
                {price}
              </span>
              <span className="text-muted text-sm">per month</span>
            </div>
            <Text.Paragraph className="leading-normal" size="sm" tone="strong">
              {note}
            </Text.Paragraph>
            <div className="flex flex-col">
              {features.map((feature) => (
                <div
                  className="flex items-start gap-2.5 border-separator border-t py-2 text-muted-strong text-sm leading-normal"
                  key={feature}
                >
                  <Check
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-accent-strong"
                    strokeWidth={2.5}
                  />
                  {feature}
                </div>
              ))}
            </div>
            <Link
              className={buttonVariants({
                className: "mt-auto",
                fullWidth: true,
                variant: featured ? "primary" : "outline",
              })}
              href="#contact"
            >
              {cta}
            </Link>
          </div>
        ))}
      </div>
      <SourceNote>
        Rates are in Singapore dollars. Creative must be static — no autoplay,
        no interstitials.
      </SourceNote>
    </section>
  );
}
