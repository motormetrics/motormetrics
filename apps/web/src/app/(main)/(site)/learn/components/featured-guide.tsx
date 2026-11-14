import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import {
  GUIDES,
  getGuideBySlug,
  getReadingMinutes,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { SourceNote } from "@web/components/shared/overview";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

/**
 * "Start here": the one guide a reader should open first, with its onward
 * links to the live figures beside it once the page is wide, under it before
 * then. Ruled, not boxed: Direction D keeps the ground white.
 */
export function FeaturedGuide() {
  const guide = getGuideBySlug("coe") ?? GUIDES[0];

  if (!guide) {
    return null;
  }

  return (
    <section aria-labelledby="featured-guide" className="@container">
      <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            Start here · {guide.term}
          </Typography.Paragraph>
          <Typography.Heading
            className="max-w-2xl text-balance text-2xl leading-tight md:text-3xl"
            id="featured-guide"
            level={2}
          >
            {guide.title}
          </Typography.Heading>
          <Typography.Paragraph className="max-w-prose">
            {guide.excerpt}
          </Typography.Paragraph>
          <div className="flex flex-wrap items-center gap-4 pt-1.5">
            <Link
              className={buttonVariants({ variant: "primary" })}
              href={`/learn/${guide.slug}`}
            >
              Read the guide
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Typography.Paragraph
              className="tabular-nums"
              color="muted"
              size="sm"
            >
              {getReadingMinutes(guide.content)} min read
            </Typography.Paragraph>
          </div>
        </div>

        <nav
          aria-label="The figures behind it"
          className="flex flex-col self-start border-separator border-t"
        >
          <span className="py-2.5 font-semibold text-muted text-xs">
            The figures behind it
          </span>
          {guide.relatedLinks.map(({ href, label }) => (
            <Link
              className="border-separator border-t py-2.5 font-semibold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
              href={href as Route}
              key={href}
            >
              {label} →
            </Link>
          ))}
        </nav>
      </div>
      <SourceNote className="pt-5">
        COE is the topic most readers arrive for, so its guide leads.
      </SourceNote>
    </section>
  );
}
