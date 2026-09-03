import { Typography } from "@heroui/react";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { getReadingMinutes } from "@web/app/(main)/(site)/learn/lib/guides";
import { SharePill } from "@web/components/shared/share-pill";

/**
 * The comp's guide opening: term pill, title, lede, then the reading
 * estimate, the revision date and the share control on one line.
 *
 * Capped at the comp's 860px so the title breaks over a reading measure rather
 * than the full 1180px page.
 */
export function GuideHead({ guide }: { guide: Guide }) {
  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <span className="self-start rounded-full bg-accent-soft-2 px-4 py-2 font-bold text-accent-strong text-sm">
        {guide.term}
      </span>

      <Typography.Heading level={1} className="text-5xl leading-none">
        {guide.title}
      </Typography.Heading>

      <Typography.Paragraph
        color="muted"
        className="max-w-prose leading-normal"
      >
        {guide.excerpt}
      </Typography.Paragraph>

      <div className="flex flex-wrap items-center gap-3.5">
        <span className="font-semibold text-base text-muted">
          {getReadingMinutes(guide.content)} min read
        </span>
        <span aria-hidden className="size-1.5 rounded-full bg-border" />
        <span className="font-semibold text-base text-muted">
          Updated{" "}
          {new Date(guide.lastUpdated).toLocaleDateString("en-SG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <SharePill title={guide.title} />
      </div>
    </div>
  );
}
