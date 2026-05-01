import { Card, Chip } from "@heroui/react";
import Typography from "@web/components/typography";
import { Layout, Rows3, StickyNote } from "lucide-react";
import { cacheLife } from "next/cache";

const placements = [
  {
    icon: Layout,
    title: "Floating Banner",
    description:
      "A persistent banner in the bottom-right corner of every page. Always visible without being intrusive.",
    highlight: "Every page",
  },
  {
    icon: StickyNote,
    title: "Pinned Cards",
    description:
      "Dedicated sponsored sections on high-traffic pages like car makes and COE results.",
    highlight: "High visibility",
  },
  {
    icon: Rows3,
    title: "In-feed Cards",
    description:
      "Native-style cards within browsing feeds that blend naturally with the content experience.",
    highlight: "Native feel",
  },
];

export async function PlacementsSection() {
  "use cache";
  cacheLife("days");

  return (
    <section className="py-20 lg:py-28">
      <div className="flex flex-col gap-12">
        {/* Section header */}
        <div className="flex flex-col gap-4">
          <Typography.Label className="text-accent uppercase tracking-widest">
            Ad Placements
          </Typography.Label>
          <Typography.H2 className="max-w-lg lg:text-4xl">
            Placements on every listing page
          </Typography.H2>
          <Typography.TextLg className="max-w-2xl text-muted">
            Choose from three placement types designed to reach users at
            different points in their browsing journey.
          </Typography.TextLg>
        </div>

        {/* Placement cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {placements.map(({ icon: Icon, title, description, highlight }) => (
            <Card
              key={title}
              className="group h-full border-border shadow-sm transition-all duration-500 hover:border-accent/30 hover:shadow-accent/5 hover:shadow-lg"
            >
              <Card.Header className="flex flex-col items-start gap-3 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent/10 p-2.5">
                    <Icon className="size-5 text-accent" />
                  </div>
                  <Chip
                    size="sm"
                    variant="primary"
                    color="accent"
                    className="font-medium text-xs"
                  >
                    {highlight}
                  </Chip>
                </div>
                <Typography.H3 className="text-xl">{title}</Typography.H3>
              </Card.Header>
              <Card.Content className="pt-0">
                <Typography.Text className="text-muted">
                  {description}
                </Typography.Text>
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
