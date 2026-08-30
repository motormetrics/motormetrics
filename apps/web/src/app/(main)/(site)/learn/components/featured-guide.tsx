import {
  GUIDES,
  getGuideBySlug,
  getReadingMinutes,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { InkPanel } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

/**
 * The comp's "Start here" panel: the one guide a reader should open first,
 * given the width of a whole block.
 *
 * The comp fills the right-hand column with a priced breakdown of a new car.
 * Those figures are drawn from nothing in this codebase, so the column carries
 * the guide's own onward links to the live figures instead.
 */
export function FeaturedGuide() {
  const guide = getGuideBySlug("coe") ?? GUIDES[0];

  if (!guide) {
    return null;
  }

  return (
    <InkPanel className="gap-10 p-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-11 lg:p-12">
      <div className="flex flex-col gap-4">
        <span className="self-start rounded-full bg-accent-on-dark/20 px-4 py-2 font-bold text-[0.84375rem] text-accent-on-dark">
          Start here
        </span>
        <Typography.H2 className="font-bold text-[2.25rem] text-accent-foreground leading-[1.14] tracking-[-0.02em]">
          {guide.title}
        </Typography.H2>
        <Typography.Text className="max-w-[35rem] text-accent-foreground/70 leading-[1.6]">
          {guide.excerpt}
        </Typography.Text>
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <Link
            className="inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 font-bold text-accent-foreground text-base no-underline transition-[filter] hover:brightness-105"
            href={`/learn/${guide.slug}`}
          >
            Read the guide
            <ArrowUpRight aria-hidden className="size-[1.125rem]" />
          </Link>
          <span className="font-semibold text-accent-foreground/50 text-sm">
            {getReadingMinutes(guide.content)} min read
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-semibold text-accent-foreground/50 text-sm">
          The figures behind it
        </span>
        {guide.relatedLinks.map(({ href, label }) => (
          <Link
            className="font-bold text-accent-on-dark text-base no-underline transition-colors hover:text-accent-foreground"
            href={href as Route}
            key={href}
          >
            {label} →
          </Link>
        ))}
      </div>
    </InkPanel>
  );
}
