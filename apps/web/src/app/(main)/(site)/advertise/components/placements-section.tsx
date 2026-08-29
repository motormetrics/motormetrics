import Typography from "@web/components/typography";
import { Layout, Rows3, StickyNote } from "lucide-react";
import { cacheLife } from "next/cache";

const placements = [
  {
    description:
      "A persistent unit in the bottom-right corner of every page. Always visible, never covering a chart.",
    icon: Layout,
    title: "Floating banner",
    where: "Every page",
  },
  {
    description:
      "A dedicated sponsored block on high-traffic pages such as car makes and COE results.",
    icon: StickyNote,
    title: "Pinned cards",
    where: "High-traffic pages",
  },
  {
    description:
      "Cards within browsing feeds, in the site's own card shape and always labelled as sponsored.",
    icon: Rows3,
    title: "In-feed cards",
    where: "Listing feeds",
  },
];

export async function PlacementsSection() {
  "use cache";
  cacheLife("days");

  return (
    <section className="flex scroll-mt-24 flex-col gap-7" id="placements">
      <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr] lg:gap-14">
        <Typography.H2 className="font-bold text-[2.125rem] tracking-[-0.02em]">
          Placements
        </Typography.H2>
        <Typography.Text className="max-w-[38rem] text-[1.1875rem] leading-[1.65]">
          Three units, all static, all outside the charts.
        </Typography.Text>
      </div>
      <div className="flex flex-col">
        {placements.map(({ description, icon: Icon, title, where }) => (
          <div
            className="flex flex-col gap-3 border-border border-t py-6 sm:flex-row sm:items-baseline sm:gap-10"
            key={title}
          >
            <div className="flex min-w-[15rem] items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-strong">
                <Icon className="size-5" />
              </span>
              <span className="font-bold text-[1.1875rem] tracking-[-0.01em]">
                {title}
              </span>
            </div>
            <Typography.Text className="max-w-[34rem] text-base leading-[1.55]">
              {description}
            </Typography.Text>
            <span className="shrink-0 font-bold text-[0.8125rem] text-muted uppercase tracking-[0.08em] sm:ml-auto">
              {where}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
