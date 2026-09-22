import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { ViewCounter } from "@web/app/(main)/(site)/blog/components/view-counter";
import { SharePill } from "@web/components/shared/share-pill";
import Link from "next/link";
import { Suspense } from "react";
import { getCategoryConfig } from "./post/utils";

/**
 * The comp's post opening: breadcrumb, topic pill, title, then the date, the
 * reading estimate, the view count and the share control on one line.
 *
 * Runs the full page column, like the article beneath it.
 */
export function PostHead({
  initialViewCount,
  post,
  publishedAt,
  readingTimeText,
}: {
  initialViewCount: number;
  post: SelectPost;
  publishedAt: Date;
  readingTimeText: string;
}) {
  const category = getCategoryConfig(post);

  return (
    <div className="flex flex-col gap-5">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 font-semibold text-muted text-sm"
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
          href="/blog"
        >
          Blog
        </Link>
        <span aria-hidden className="text-border">
          /
        </span>
        <span aria-current="page" className="text-foreground">
          {category.label}
        </span>
      </nav>

      <span className="self-start rounded-full bg-accent-soft-2 px-4 py-2 font-bold text-accent-strong text-sm">
        {category.label}
      </span>

      <Typography.Heading
        level={1}
        className="text-balance text-5xl leading-none"
      >
        {post.title}
      </Typography.Heading>

      <div className="flex flex-wrap items-center gap-3.5">
        <span className="font-semibold text-base text-muted">
          {publishedAt.toLocaleDateString("en-SG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span aria-hidden className="size-1.5 rounded-full bg-border" />
        <span className="font-semibold text-base text-muted">
          {readingTimeText}
        </span>
        <span aria-hidden className="size-1.5 rounded-full bg-border" />
        <Suspense fallback={null}>
          <ViewCounter
            className="font-semibold text-base text-muted"
            initialCount={initialViewCount}
            postId={post.id}
          />
        </Suspense>
        <SharePill contentType="blog" title={post.title} />
      </div>
    </div>
  );
}
