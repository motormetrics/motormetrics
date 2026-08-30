import { GuideCard } from "@web/app/(main)/(site)/learn/components/guide-card";
import { GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";
import Typography from "@web/components/typography";

/**
 * The comp's "All guides" grid.
 *
 * The comp heads it with topic tabs (COE, Costs, Electric, Data). The guides
 * carry no topic, and all five sit under one heading anyway, so a filter would
 * be a control with nothing to do — the count stands in its place.
 */
export function GuidesSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-7" id="guides">
      <div className="flex flex-wrap items-baseline gap-5">
        <Typography.H2 className="font-bold text-[2.125rem] tracking-[-0.02em]">
          All guides
        </Typography.H2>
        <span className="font-semibold text-base text-muted">
          {GUIDES.length} {GUIDES.length === 1 ? "guide" : "guides"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => (
          <GuideCard guide={guide} key={guide.slug} />
        ))}
      </div>
    </section>
  );
}
