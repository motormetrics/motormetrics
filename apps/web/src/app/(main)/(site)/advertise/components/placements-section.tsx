import { SectionHead } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { Layout, Rows3, StickyNote } from "lucide-react";

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

/** The three units as a ruled list: name, what it is, and where it runs. */
export function PlacementsSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="placements">
      <SectionHead
        caption="Three units, all static, all outside the charts."
        eyebrow="Placements"
        title="Three ways to appear"
      />
      <div className="flex flex-col border-border border-t">
        {placements.map(({ description, icon: Icon, title, where }) => (
          <div
            className="flex flex-col gap-2 border-separator border-b py-3.5 md:flex-row md:items-center md:gap-6"
            key={title}
          >
            <div className="flex items-center gap-3 md:w-60 md:shrink-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="font-semibold">{title}</span>
            </div>
            <Text.Paragraph
              className="min-w-0 flex-1 leading-normal"
              size="sm"
              tone="strong"
            >
              {description}
            </Text.Paragraph>
            <span className="shrink-0 font-semibold text-muted text-xs md:ml-auto">
              {where}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
