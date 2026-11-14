import { GuideCard } from "@web/app/(main)/(site)/learn/components/guide-card";
import { groupGuidesByTopic } from "@web/app/(main)/(site)/learn/lib/guides";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

/**
 * The guides, one section per topic. The eyebrow counts the guides under it,
 * so it follows the topics as guides are added.
 */
export function GuidesSection() {
  const groups = groupGuidesByTopic();

  return (
    <div className="flex flex-col gap-12">
      {groups.map(({ guides, topic }, index) => (
        <section
          className="flex scroll-mt-24 flex-col gap-4"
          id={topic.id}
          key={topic.id}
        >
          <SectionHead
            caption={topic.caption}
            eyebrow={`Topic · ${guides.length} ${guides.length === 1 ? "guide" : "guides"}`}
            title={topic.title}
          />
          <div className="@container">
            <div className="grid @3xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-3.5">
              {guides.map((guide) => (
                <GuideCard guide={guide} key={guide.slug} />
              ))}
            </div>
          </div>
          {index === groups.length - 1 ? (
            <SourceNote>
              Guides published on motormetrics.app/learn. Figures in each guide
              link back to the live data pages.
            </SourceNote>
          ) : null}
        </section>
      ))}
    </div>
  );
}
