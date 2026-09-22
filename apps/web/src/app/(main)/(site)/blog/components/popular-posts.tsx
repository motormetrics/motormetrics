import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { SurfaceCard } from "@web/components/shared/bento";
import Link from "next/link";
import { getCategoryConfig } from "./post/utils";

interface PostWithViews extends SelectPost {
  viewCount: number;
}

const views = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 1,
  notation: "compact",
});

/**
 * The comp pairs the featured panel with a white "at a glance" card of
 * headline figures. Those figures belong to the dashboard, not the blog, so
 * the card carries the posts readers open most instead — the one signal the
 * blog owns.
 */
export function PopularPosts({ posts }: { posts: PostWithViews[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <SurfaceCard className="gap-5">
      <Typography.Paragraph className="font-semibold" color="muted">
        Most read
      </Typography.Paragraph>
      <ol className="flex flex-col gap-4">
        {posts.map((post, index) => (
          <li
            className="border-border border-t pt-4 first:border-t-0 first:pt-0"
            key={post.id}
          >
            <Link
              className="group flex items-baseline gap-4 text-foreground no-underline"
              href={`/blog/${post.slug}`}
            >
              <span className="w-6 shrink-0 font-extrabold text-2xl text-muted tabular-nums leading-none tracking-tight">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="line-clamp-2 font-bold text-base leading-snug transition-colors group-hover:text-accent-strong">
                  {post.title}
                </span>
                <span className="font-semibold text-muted text-sm">
                  {getCategoryConfig(post).label} ·{" "}
                  {views.format(post.viewCount)} views
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </SurfaceCard>
  );
}
