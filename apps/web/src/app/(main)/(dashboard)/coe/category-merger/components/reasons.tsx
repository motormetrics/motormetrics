import { Card, Chip, Typography } from "@heroui/react";
import {
  type FeebateBand,
  FIVE_BANDS,
  formatAdjustment,
  THREE_BANDS,
} from "@web/app/(main)/(dashboard)/coe/category-merger/utils/proposal";
import {
  ArrowLeftRight,
  ArrowRight,
  Gauge,
  type LucideIcon,
  Route,
  Zap,
} from "lucide-react";

const REASONS: { detail: string; icon: LucideIcon; title: string }[] = [
  {
    icon: Gauge,
    title: "Engine size no longer sorts cars",
    detail:
      "Capacity and power separate mass-market cars from higher-value ones less well than when the split was set in 1999.",
  },
  {
    icon: Zap,
    title: "Electric cars can be tuned to fit",
    detail:
      "EVs are software-driven, so makers can set power to land in Category A.",
  },
  {
    icon: ArrowLeftRight,
    title: "Both kinds of buyer chase Cat A",
    detail:
      "Between February and June 2026, Category A closed above Category B three times.",
  },
  {
    icon: Route,
    title: "Same road space either way",
    detail:
      "LTA notes a mass-market and a luxury car have broadly the same impact on congestion.",
  },
];

/** LTA's example model, which it says can fall into either category today. */
const EXAMPLE_MODEL = "Tesla Model Y RWD";

const bandFor = (bands: FeebateBand[]) =>
  bands.find(({ models }) => models.includes(EXAMPLE_MODEL));

/** LTA's four reasons as icon cards, then its Model Y example drawn out. */
export function Reasons() {
  const options = [
    { label: "Option A", band: bandFor(THREE_BANDS) },
    { label: "Option B", band: bandFor(FIVE_BANDS) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REASONS.map(({ detail, icon: Icon, title }) => (
          <Card key={title}>
            <Card.Content className="flex flex-row gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                <Icon aria-hidden className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <Typography.Paragraph weight="semibold">
                  {title}
                </Typography.Paragraph>
                <Typography.Paragraph color="muted" size="sm">
                  {detail}
                </Typography.Paragraph>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Card>
        <Card.Header>
          <Card.Title>One car, two categories</Card.Title>
          <Card.Description>
            LTA&apos;s example: the same Tesla Model Y
          </Card.Description>
        </Card.Header>
        <Card.Content className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-2">
            <Typography.Paragraph color="muted" size="sm">
              Today, by power rating
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Chip size="lg" variant="soft">
                <Chip.Label>Up to 110kW → Category A</Chip.Label>
              </Chip>
              <Chip size="lg" variant="soft">
                <Chip.Label>Above 110kW → Category B</Chip.Label>
              </Chip>
            </div>
          </div>
          <ArrowRight
            aria-hidden
            className="hidden size-6 text-muted md:block"
          />
          <div className="flex flex-col gap-2">
            <Typography.Paragraph color="muted" size="sm">
              Proposed, by value ({EXAMPLE_MODEL})
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              {options.map(({ band, label }) =>
                band ? (
                  <Chip
                    color={
                      band.adjustment > 0
                        ? "danger"
                        : band.adjustment < 0
                          ? "success"
                          : "default"
                    }
                    key={label}
                    size="lg"
                    variant="soft"
                  >
                    <Chip.Label>
                      {label}: Band {band.band},{" "}
                      {formatAdjustment(band.adjustment)}
                    </Chip.Label>
                  </Chip>
                ) : null,
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
