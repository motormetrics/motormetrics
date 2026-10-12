import { cn, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import type { SelectPost } from "@motormetrics/database/schema";
import type { Highlight } from "@web/app/(main)/(site)/blog/components/key-highlights";
import {
  getCategoryConfig,
  getReadingTime,
} from "@web/app/(main)/(site)/blog/components/post/utils";
import { Text } from "@web/components/shared/text";
import { formatDate } from "@web/utils/dates/format-date";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/** The comp gives the side column three figures. */
const FIGURE_COUNT = 3;

/**
 * The comp's featured card: the latest post on a bordered surface, with the
 * first of its own key figures in a ruled column beside it — beneath it below
 * lg. A post without figures takes the card's full width.
 */
export function FeaturedPost({ post }: { post: SelectPost }) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const figures = ((post.highlights as Highlight[] | null) ?? []).slice(
    0,
    FIGURE_COUNT,
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 rounded-lg border border-separator bg-surface px-4 py-5 md:p-7",
        figures.length > 0 && "lg:grid-cols-7 lg:gap-10",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3",
          figures.length > 0 && "lg:col-span-5",
        )}
      >
        <Text.Paragraph
          className="text-accent-strong"
          eyebrow
          size="xs"
          weight="semibold"
        >
          Featured · {getCategoryConfig(post).label}
        </Text.Paragraph>
        <Typography.Heading
          className="text-balance text-2xl leading-tight md:text-3xl"
          level={2}
        >
          {post.title}
        </Typography.Heading>
        {post.excerpt ? (
          <Text.Paragraph className="max-w-2xl" tone="strong">
            {post.excerpt}
          </Text.Paragraph>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-3.5 pt-2.5">
          <Link
            className={buttonVariants({ variant: "primary" })}
            href={`/blog/${post.slug}`}
          >
            Read the post
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            {formatDate(publishedDate)} · {getReadingTime(post)} min read
          </Typography.Paragraph>
        </div>
      </div>

      {figures.length > 0 ? (
        <div className="flex flex-col border-separator max-lg:border-t max-lg:pt-4 lg:col-span-2 lg:border-l lg:pl-7">
          <span className="pb-1 font-semibold text-muted text-xs">
            From this post
            {post.month ? ` · ${formatMonthLabel(post.month)}` : null}
          </span>
          <dl className="flex flex-col">
            {figures.map((figure) => (
              <div
                className="flex flex-col gap-1 border-separator border-b py-3.5 last:border-b-0 last:pb-0"
                key={`${figure.label}-${figure.value}`}
              >
                <dd className="font-extrabold text-3xl tabular-nums leading-none tracking-tight">
                  {figure.value}
                </dd>
                <dt className="font-medium text-sm">{figure.label}</dt>
                {figure.detail ? (
                  <dd className="text-muted text-xs tabular-nums">
                    {figure.detail}
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
