import { Typography } from "@heroui/react";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import {
  getGuideHeadings,
  getReadingMinutes,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { SharePill } from "@web/components/shared/share-pill";
import type { Route } from "next";
import Link from "next/link";

/**
 * The guide opening: breadcrumb, an eyebrow naming the term, the title, the
 * lede, then the reading estimate, the revision date and the share control on
 * one line. The contents sit beside it once the page is wide and under it
 * before then, read out of the guide's own markdown so the ids match the ones
 * `rehype-slug` gives the rendered headings.
 */
export function GuideHead({ guide }: { guide: Guide }) {
  const headings = getGuideHeadings(guide.content);

  return (
    <div className="@container">
      <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-10">
        <div className="flex min-w-0 flex-col gap-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-muted text-sm">
              <li>
                <Link
                  className="text-muted no-underline transition-colors hover:text-accent-strong"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-border">
                /
              </li>
              <li>
                <Link
                  className="text-muted no-underline transition-colors hover:text-accent-strong"
                  href="/learn"
                >
                  Learn
                </Link>
              </li>
              <li aria-hidden className="text-border">
                /
              </li>
              <li aria-current="page" className="font-semibold text-foreground">
                {guide.term}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-2">
            <Typography.Paragraph
              className="uppercase"
              color="muted"
              size="xs"
              weight="semibold"
            >
              Guide · {guide.term}
            </Typography.Paragraph>
            <Typography.Heading className="text-balance" level={1}>
              {guide.title}
            </Typography.Heading>
          </div>

          <Typography.Paragraph className="max-w-prose">
            {guide.excerpt}
          </Typography.Paragraph>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-muted text-sm">
            <span>{getReadingMinutes(guide.content)} min read</span>
            <span aria-hidden>·</span>
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
            <span className="sm:ml-auto">
              <SharePill contentType="guide" title={guide.title} />
            </span>
          </div>
        </div>

        {headings.length > 0 ? (
          <nav aria-label="In this guide" className="flex flex-col gap-3">
            <Typography.Paragraph
              className="uppercase"
              color="muted"
              size="xs"
              weight="semibold"
            >
              In this guide
            </Typography.Paragraph>
            <ol className="flex flex-wrap gap-x-4 gap-y-1.5 border-separator border-t pt-3 text-sm">
              {headings.map(({ id, title }) => (
                <li key={id}>
                  <Link
                    className="font-semibold text-accent-strong no-underline transition-colors hover:text-accent-deep"
                    href={`#${id}` as Route}
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
