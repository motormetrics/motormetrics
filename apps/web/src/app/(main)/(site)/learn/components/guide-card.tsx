import { Typography } from "@heroui/react";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { getReadingMinutes } from "@web/app/(main)/(site)/learn/lib/guides";
import Link from "next/link";

/**
 * One guide in a grid: the index's topic groups and "Next in this series" at
 * the foot of a guide. A hairline box on the white ground, the term as an
 * eyebrow, and the reading estimate on a ruled footer.
 */
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      className="group flex h-full min-w-0 flex-col gap-2 rounded-lg border border-separator px-5 pt-4 pb-4 text-foreground no-underline transition-colors hover:border-border"
      href={`/learn/${guide.slug}`}
    >
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        {guide.term}
      </Typography.Paragraph>
      <Typography.Heading
        className="text-lg leading-snug group-hover:underline"
        level={3}
      >
        {guide.title}
      </Typography.Heading>
      <Typography.Paragraph className="text-muted-strong" size="sm">
        {guide.excerpt}
      </Typography.Paragraph>
      <div className="mt-auto flex flex-wrap justify-between gap-x-3 gap-y-1 border-separator border-t pt-2.5 text-muted text-xs tabular-nums">
        <span>{getReadingMinutes(guide.content)} min read</span>
        <span>Read →</span>
      </div>
    </Link>
  );
}
