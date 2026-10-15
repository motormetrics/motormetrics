import { Typography } from "@heroui/react";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { getReadingMinutes } from "@web/app/(main)/(site)/learn/lib/guides";
import { SharePill } from "@web/components/shared/share-pill";
import Link from "next/link";

/**
 * The guide opening: breadcrumb, an eyebrow naming the term, the title, the
 * lede, then the reading estimate, the revision date and the share control on
 * one line.
 *
 * Held to a reading measure so the title breaks over the article's width
 * rather than the full page.
 */
export function GuideHead({ guide }: { guide: Guide }) {
  return (
    <div className="flex max-w-3xl flex-col gap-2.5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-muted text-sm"
      >
        <Link
          className="text-muted no-underline transition-colors hover:text-accent-strong"
          href="/"
        >
          Home
        </Link>
        <span aria-hidden className="text-border">
          /
        </span>
        <Link
          className="text-muted no-underline transition-colors hover:text-accent-strong"
          href="/learn"
        >
          Learn
        </Link>
        <span aria-hidden className="text-border">
          /
        </span>
        <span aria-current="page" className="text-foreground">
          {guide.term}
        </span>
      </nav>

      <Typography.Paragraph
        className="pt-1.5 uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Guide · {guide.term}
      </Typography.Paragraph>

      <Typography.Heading className="text-3xl md:text-4xl" level={1}>
        {guide.title}
      </Typography.Heading>

      <Typography.Paragraph className="max-w-2xl text-muted-strong">
        {guide.excerpt}
      </Typography.Paragraph>

      <div className="flex flex-wrap items-center gap-2.5 text-muted text-sm">
        <span>{getReadingMinutes(guide.content)} min read</span>
        <span aria-hidden className="text-border">
          |
        </span>
        <span>
          Updated{" "}
          <span className="font-semibold text-foreground">
            {new Date(guide.lastUpdated).toLocaleDateString("en-SG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </span>
        <span className="ml-auto">
          <SharePill contentType="guide" title={guide.title} />
        </span>
      </div>
    </div>
  );
}
