import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { getCategoryConfig } from "@web/app/(main)/(site)/blog/components/post/utils";
import { ViewCounter } from "@web/app/(main)/(site)/blog/components/view-counter";
import { SharePill } from "@web/components/shared/share-pill";
import { Text } from "@web/components/shared/text";
import Link from "next/link";

/**
 * The post opening: breadcrumb, an eyebrow naming the topic, the title, then
 * the date, the reading estimate, the view count and the share control on one
 * ruled line.
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
    <div className="flex flex-col gap-2.5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-muted text-sm"
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

      <Text.Paragraph
        className="pt-1.5 text-accent-strong"
        eyebrow
        size="xs"
        weight="semibold"
      >
        {category.label}
      </Text.Paragraph>

      <Typography.Heading
        className="text-balance text-3xl md:text-4xl"
        level={1}
      >
        {post.title}
      </Typography.Heading>

      <div className="flex flex-wrap items-center gap-2.5 text-muted text-sm">
        <span className="font-semibold text-foreground">
          {publishedAt.toLocaleDateString("en-SG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span aria-hidden className="text-border">
          |
        </span>
        <span>{readingTimeText}</span>
        <span aria-hidden className="text-border">
          |
        </span>
        <ViewCounter initialCount={initialViewCount} postId={post.id} />
        <span className="ml-auto">
          <SharePill contentType="blog" title={post.title} />
        </span>
      </div>
    </div>
  );
}
