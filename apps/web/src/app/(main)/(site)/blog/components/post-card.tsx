import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate, getCategoryConfig, getReadingTime } from "./post/utils";

/**
 * One post in a grid — the comps use the same card under "All posts" on the
 * index and under "Read next" at the foot of a post, so it lives here rather
 * than in either.
 */
export function PostCard({
  post,
  showExcerpt = true,
}: {
  post: SelectPost;
  /** The "Read next" row runs without excerpts; the index grid carries them. */
  showExcerpt?: boolean;
}) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const excerpt = post.excerpt;

  return (
    <Link
      className="group flex h-full flex-col gap-3.5 rounded-2xl bg-surface p-7 text-foreground no-underline shadow-surface transition-shadow hover:shadow-hover"
      href={`/blog/${post.slug}`}
    >
      <span className="self-start rounded-full bg-surface-secondary px-3.5 py-1.5 font-bold text-muted text-sm">
        {getCategoryConfig(post).label}
      </span>
      <Typography.Heading level={3} className="text-balance leading-tight">
        {post.title}
      </Typography.Heading>
      {showExcerpt && excerpt ? (
        <Typography.Paragraph className="line-clamp-3 text-muted leading-normal">
          {excerpt}
        </Typography.Paragraph>
      ) : null}
      <div className="mt-auto flex items-center gap-2.5 pt-3.5">
        <span className="font-semibold text-muted text-sm">
          {formatDate(publishedDate)}
        </span>
        <span aria-hidden className="size-1 rounded-full bg-border" />
        <span className="font-semibold text-muted text-sm">
          {getReadingTime(post)} min read
        </span>
        <ChevronRight
          aria-hidden
          className="ml-auto size-[1.125rem] text-accent-strong transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
