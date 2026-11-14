import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import {
  type Highlight,
  KeyHighlights,
} from "@web/app/(main)/(site)/blog/components/key-highlights";
import { getCategoryConfig } from "@web/app/(main)/(site)/blog/components/post/utils";
import { ViewCounter } from "@web/app/(main)/(site)/blog/components/view-counter";
import { SharePill } from "@web/components/shared/share-pill";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import Link from "next/link";

/**
 * The post opening: breadcrumb, an eyebrow naming the topic and month, the
 * title, the lede, then the date, the reading estimate, the source, the view
 * count and the share control on one line. The post's key figures sit beside
 * it once the page is wide and under it before then.
 */
export function PostHead({
  initialViewCount,
  lede,
  post,
  publishedAt,
  readingTimeText,
}: {
  initialViewCount: number;
  /** The excerpt, unless the body already opens with it. */
  lede: string | null;
  post: SelectPost;
  publishedAt: Date;
  readingTimeText: string;
}) {
  const category = getCategoryConfig(post);
  const period = post.month ? formatMonthLabel(post.month) : null;

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
                  href="/blog"
                >
                  Blog
                </Link>
              </li>
              <li aria-hidden className="text-border">
                /
              </li>
              <li aria-current="page" className="font-semibold text-foreground">
                {category.label}
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
              {category.label}
              {period ? ` · ${period}` : null}
            </Typography.Paragraph>
            <Typography.Heading className="text-balance" level={1}>
              {post.title}
            </Typography.Heading>
          </div>

          {lede ? (
            <Typography.Paragraph className="max-w-prose">
              {lede}
            </Typography.Paragraph>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-muted text-sm">
            <span className="font-semibold text-foreground">
              {publishedAt.toLocaleDateString("en-SG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span aria-hidden>·</span>
            <span>{readingTimeText}</span>
            <span aria-hidden>·</span>
            <span>Source: LTA via DataMall</span>
            <span aria-hidden>·</span>
            <ViewCounter initialCount={initialViewCount} postId={post.id} />
            <span className="sm:ml-auto">
              <SharePill contentType="blog" title={post.title} />
            </span>
          </div>
        </div>

        <KeyHighlights
          highlights={post.highlights as Highlight[] | undefined}
          period={period}
        />
      </div>
    </div>
  );
}
