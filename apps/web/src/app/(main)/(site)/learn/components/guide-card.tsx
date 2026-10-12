import { Typography } from "@heroui/react";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { getReadingMinutes } from "@web/app/(main)/(site)/learn/lib/guides";
import Link from "next/link";

/**
 * One guide in a grid — the comps use the same card in the index's "All guides"
 * block and at the foot of a guide under "Next in this series", so it lives
 * here rather than in either.
 *
 * A bordered surface with the term as an eyebrow, and the reading estimate on
 * a hairline-topped footer.
 */
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      className="flex h-full min-w-0 flex-col gap-2.5 rounded-lg border border-separator bg-surface p-5 text-foreground no-underline transition-colors hover:border-accent-border"
      href={`/learn/${guide.slug}`}
    >
      <Typography.Paragraph
        className="text-accent-strong uppercase"
        size="xs"
        weight="semibold"
      >
        {guide.term}
      </Typography.Paragraph>
      <Typography.Heading className="text-lg leading-tight" level={3}>
        {guide.title}
      </Typography.Heading>
      <Typography.Paragraph className="leading-normal" color="muted" size="sm">
        {guide.excerpt}
      </Typography.Paragraph>
      <div className="mt-auto flex items-center border-separator border-t pt-2.5 text-muted text-xs">
        {getReadingMinutes(guide.content)} min read
        <span className="ml-auto font-semibold text-accent-strong">Read →</span>
      </div>
    </Link>
  );
}
