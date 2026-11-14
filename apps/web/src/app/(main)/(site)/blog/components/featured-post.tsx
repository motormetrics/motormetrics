import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import type { SelectPost } from "@motormetrics/database/schema";
import type { Highlight } from "@web/app/(main)/(site)/blog/components/key-highlights";
import {
  getCategoryConfig,
  getReadingTime,
} from "@web/app/(main)/(site)/blog/components/post/utils";
import { formatDate } from "@web/utils/dates/format-date";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/** The side column holds three figures. */
const FIGURE_COUNT = 3;

/**
 * The lead post, with the first of its own key figures beside it once the
 * page is wide and under it before then.
 *
 * The design leads with up to three picked posts under "Featured". Posts have
 * no field to pick them by, so the index passes the fallback: the newest
 * post, labelled "Latest".
 */
export function FeaturedPost({ post }: { post: SelectPost }) {
  const figures = ((post.highlights as Highlight[] | null) ?? []).slice(
    0,
    FIGURE_COUNT,
  );

  return (
    <div className="@container">
      <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            Latest · {getCategoryConfig(post).label}
          </Typography.Paragraph>
          <Typography.Heading
            className="max-w-2xl text-balance text-2xl leading-tight md:text-3xl"
            level={2}
          >
            {post.title}
          </Typography.Heading>
          {post.excerpt ? (
            <Typography.Paragraph className="max-w-prose">
              {post.excerpt}
            </Typography.Paragraph>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 pt-1.5">
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
              {formatDate(post.publishedAt ?? post.createdAt)} ·{" "}
              {getReadingTime(post)} min read
            </Typography.Paragraph>
          </div>
        </div>

        {figures.length > 0 ? (
          <div className="flex flex-col self-start border-separator border-t">
            <span className="py-2.5 font-semibold text-muted text-xs">
              From this post
              {post.month ? ` · ${formatMonthLabel(post.month)}` : null}
            </span>
            <dl className="flex flex-col">
              {figures.map((figure) => (
                <div
                  className="flex flex-col gap-1 border-separator border-t py-3.5"
                  key={`${figure.label}-${figure.value}`}
                >
                  <dd className="font-extrabold text-3xl tabular-nums leading-none tracking-tight">
                    {figure.value}
                  </dd>
                  <dt className="font-semibold text-sm">{figure.label}</dt>
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
    </div>
  );
}
