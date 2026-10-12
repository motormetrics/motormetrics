import { GuideCard } from "@web/app/(main)/(site)/learn/components/guide-card";
import {
  GUIDES,
  getReadingMinutes,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

/**
 * The comp's "All guides" grid. The caption's reading time is the mean of the
 * guides' own estimates, so it follows the guides as they are edited.
 */
export function GuidesSection() {
  const averageMinutes = Math.round(
    GUIDES.reduce(
      (total, guide) => total + getReadingMinutes(guide.content),
      0,
    ) / Math.max(1, GUIDES.length),
  );

  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="guides">
      <SectionHead
        caption={`${GUIDES.length} ${GUIDES.length === 1 ? "guide" : "guides"} · each about a ${averageMinutes} minute read`}
        eyebrow="Guides"
        title="All guides"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => (
          <GuideCard guide={guide} key={guide.slug} />
        ))}
      </div>

      <SourceNote>
        Guides published on motormetrics.app/learn. Figures in each guide link
        back to the live data pages.
      </SourceNote>
    </section>
  );
}
