import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { InkPanel } from "@web/components/shared/bento";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatDate, getCategoryConfig, getReadingTime } from "./post/utils";

/**
 * The comp's dark featured panel — the latest post, given the width of a
 * whole block. The whole panel is the link; the accent disc is its affordance.
 */
export function FeaturedPost({ post }: { post: SelectPost }) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const excerpt = post.excerpt;

  return (
    <Link
      className="group flex h-full text-accent-foreground no-underline"
      href={`/blog/${post.slug}`}
    >
      <InkPanel className="h-full w-full gap-4.5 p-8 transition-[filter] group-hover:brightness-110 lg:p-11">
        <span className="self-start rounded-full bg-accent-on-dark/20 px-4 py-2 font-bold text-accent-on-dark text-sm">
          Featured · {getCategoryConfig(post).label}
        </span>
        <Typography.Heading
          level={2}
          className="text-balance text-accent-foreground leading-tight"
        >
          {post.title}
        </Typography.Heading>
        {excerpt ? (
          <Typography.Paragraph className="line-clamp-4 max-w-prose text-accent-foreground/70">
            {excerpt}
          </Typography.Paragraph>
        ) : null}
        <div className="mt-auto flex items-center gap-3.5 pt-6">
          <span className="font-semibold text-accent-foreground/50 text-sm">
            {formatDate(publishedDate)}
          </span>
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-accent-foreground/30"
          />
          <span className="font-semibold text-accent-foreground/50 text-sm">
            {getReadingTime(post)} min read
          </span>
          <span className="ml-auto flex size-11.5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ArrowUpRight aria-hidden className="size-[1.125rem]" />
          </span>
        </div>
      </InkPanel>
    </Link>
  );
}
