import { Button, Card, Chip, cn, Typography } from "@heroui/react";
import { Check } from "lucide-react";
import { cacheLife } from "next/cache";
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

export async function PricingSection() {
  "use cache";
  cacheLife("days");

  return (
    <section className="flex scroll-mt-24 flex-col gap-7" id="pricing">
      <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr] lg:gap-14">
        <Typography.Heading level={2}>Packages</Typography.Heading>
        <Typography.Paragraph className="max-w-prose text-lg">
          Booked by the month. No long-term commitment.
        </Typography.Paragraph>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map(({ cta, features, featured, name, note, price }) => (
          <Card
            className={cn("h-full", featured && "border-2 border-accent")}
            key={name}
          >
            <Card.Content className="flex h-full flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <Typography.Heading level={3}>{name}</Typography.Heading>
                {featured ? (
                  <Chip
                    className="ml-auto font-bold"
                    color="accent"
                    size="sm"
                    variant="primary"
                  >
                    Most booked
                  </Chip>
                ) : null}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
                  {price}
                </span>
                <span className="font-semibold text-muted text-sm">
                  per month
                </span>
              </div>
              <Typography.Paragraph className="leading-normal">
                {note}
              </Typography.Paragraph>
              <div className="flex flex-col gap-2.5 pt-1">
                {features.map((feature) => (
                  <div className="flex items-start gap-2.5" key={feature}>
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span className="font-semibold text-muted-strong text-sm leading-normal">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                className="mt-auto w-full pt-3 no-underline"
                href="#contact"
              >
                <Button
                  className="rounded-full"
                  fullWidth
                  variant={featured ? "primary" : "secondary"}
                >
                  {cta}
                </Button>
              </Link>
            </Card.Content>
          </Card>
        ))}
      </div>
      <Typography.Paragraph color="muted" size="xs" className="text-subtle">
        Rates are in Singapore dollars. Creative must be static — no autoplay,
        no interstitials.
      </Typography.Paragraph>
    </section>
  );
}
