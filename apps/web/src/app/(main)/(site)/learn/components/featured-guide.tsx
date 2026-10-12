import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import {
  GUIDES,
  getGuideBySlug,
  getReadingMinutes,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { Text } from "@web/components/shared/text";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

/**
 * The comp's "Start here" panel: the one guide a reader should open first,
 * on a bordered surface with the guide's onward links to the live figures in
 * a ruled list beside it — beneath it below lg.
 */
export function FeaturedGuide() {
  const guide = getGuideBySlug("coe") ?? GUIDES[0];

  if (!guide) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-5 rounded-lg border border-separator bg-surface px-4 py-5 md:p-7 lg:grid-cols-4 lg:gap-10">
      <div className="flex min-w-0 flex-col gap-2.5 lg:col-span-3">
        <Text.Paragraph
          className="text-accent-strong"
          eyebrow
          size="xs"
          weight="semibold"
        >
          Start here · {guide.term}
        </Text.Paragraph>
        <Typography.Heading className="text-2xl leading-tight" level={2}>
          {guide.title}
        </Typography.Heading>
        <Text.Paragraph className="max-w-2xl" tone="strong">
          {guide.excerpt}
        </Text.Paragraph>
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <Link
            className={buttonVariants({ variant: "primary" })}
            href={`/learn/${guide.slug}`}
          >
            Read the guide
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Typography.Paragraph color="muted" size="sm">
            {getReadingMinutes(guide.content)} min read
          </Typography.Paragraph>
        </div>
      </div>

      <div className="flex flex-col border-separator max-lg:border-t max-lg:pt-1 lg:border-l lg:pl-7">
        <span className="border-border border-b pb-2 font-semibold text-muted text-xs">
          The figures behind it
        </span>
        {guide.relatedLinks.map(({ href, label }) => (
          <Link
            className="border-separator border-b py-2.5 font-semibold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
            href={href as Route}
            key={href}
          >
            {label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
