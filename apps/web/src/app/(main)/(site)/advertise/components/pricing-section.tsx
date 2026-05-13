import { Button, Card, Chip, Link, Separator, Text } from "@heroui/react";
import { Check } from "lucide-react";
import { cacheLife } from "next/cache";

const plans = [
  {
    name: "Starter",
    price: "$400",
    description: "Great for testing the waters",
    features: ["Floating banner", "30-day placement", "Basic analytics"],
    featured: false,
  },
  {
    name: "Growth",
    price: "$700",
    description: "Best value for most advertisers",
    features: [
      "Floating banner",
      "Pinned cards",
      "30-day placement",
      "Detailed analytics",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Premium",
    price: "$1,000",
    description: "Maximum visibility across the platform",
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
  },
];

export async function PricingSection() {
  "use cache";
  cacheLife("days");

  return (
    <section id="pricing" className="scroll-mt-20 py-20 lg:py-28">
      <div className="flex flex-col gap-12">
        {/* Section header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Text type="body-sm" weight="medium">
            Simple Pricing
          </Text>
          <Text type="h2">Monthly plans that fit your budget</Text>
          <Text type="body">
            Billed monthly. Cancel anytime. No long-term commitments.
          </Text>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative h-full shadow-sm transition-all duration-500 ${
                plan.featured
                  ? "border-accent shadow-accent/10 shadow-lg"
                  : "border-border hover:border-accent/30 hover:shadow-accent/5 hover:shadow-lg"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-4 right-4">
                  <Chip
                    size="sm"
                    color="accent"
                    variant="primary"
                    className="font-semibold text-xs"
                  >
                    Recommended
                  </Chip>
                </div>
              )}
              <Card.Header className="flex flex-col items-start gap-2">
                <Text type="h3">{plan.name}</Text>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-4xl text-foreground tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-muted text-sm">/month</span>
                </div>
                <Text type="body-sm" color="muted">
                  {plan.description}
                </Text>
              </Card.Header>
              <Separator />
              <Card.Content className="gap-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-accent" />
                    <Text type="body-sm" color="muted">
                      {feature}
                    </Text>
                  </div>
                ))}
              </Card.Content>
              <Card.Footer>
                <Link href="#contact" className="w-full no-underline">
                  <Button
                    variant={plan.featured ? "primary" : "outline"}
                    fullWidth
                    className={
                      plan.featured
                        ? "rounded-full"
                        : "rounded-full text-foreground"
                    }
                  >
                    Get Started
                  </Button>
                </Link>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
