import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import {
  getCategoryConfig,
  getReadingTime,
} from "@web/app/(main)/(site)/blog/components/post/utils";
import { formatDate } from "@web/utils/dates/format-date";
import Link from "next/link";

/**
 * One post in a grid: the index's archive and the rows at the foot of a post.
 * A hairline box on the white ground, the topic as an eyebrow, and the date
 * and reading estimate on a ruled footer.
 */
export function PostCard({
  hidden,
  post,
  showExcerpt = true,
}: {
  /** Kept in the HTML but not shown, for rows past the archive's first page. */
  hidden?: boolean;
  post: SelectPost;
  /** The rows at the foot of a post run without excerpts. */
  showExcerpt?: boolean;
}) {
  const publishedDate = post.publishedAt ?? post.createdAt;

  return (
    <Link
      className="group flex h-full min-w-0 flex-col gap-2 rounded-lg border border-separator px-5 pt-4 pb-4 text-foreground no-underline transition-colors hover:border-border"
      hidden={hidden}
      href={`/blog/${post.slug}`}
    >
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        {getCategoryConfig(post).label}
      </Typography.Paragraph>
      <Typography.Heading
        className="text-balance text-lg leading-snug group-hover:underline"
        level={3}
      >
        {post.title}
      </Typography.Heading>
      {showExcerpt && post.excerpt ? (
        <Typography.Paragraph
          className="line-clamp-4 text-muted-strong"
          size="sm"
        >
          {post.excerpt}
        </Typography.Paragraph>
      ) : null}
      <div className="mt-auto flex flex-wrap justify-between gap-x-3 gap-y-1 border-separator border-t pt-2.5 text-muted text-xs tabular-nums">
        <span>{formatDate(publishedDate)}</span>
        <span>{getReadingTime(post)} min read</span>
      </div>
    </Link>
  );
}
