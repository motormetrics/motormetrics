import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { getCategoryConfig } from "@web/app/(main)/(site)/blog/components/post/utils";
import Link from "next/link";

interface PostWithViews extends SelectPost {
  viewCount: number;
}

const views = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 1,
  notation: "compact",
});

/**
 * The posts readers open most, as a ruled list under the featured card — the
 * one signal the blog owns that the comp has no slot for.
 */
export function PopularPosts({ posts }: { posts: PostWithViews[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    // Pulled out by the rows' padding, so the hover fill has room while the
    // text stays on the section's edge.
    <section className="-mx-3 flex flex-col">
      <Typography.Heading
        className="border-border border-b px-3 pb-2 font-semibold text-muted text-xs"
        level={2}
      >
        Most read
      </Typography.Heading>
      <ol className="flex flex-col">
        {posts.map((post, index) => (
          <li className="border-separator border-b" key={post.id}>
            <Link
              className="group flex items-baseline gap-4 px-3 py-2.5 text-foreground no-underline transition-colors hover:bg-surface-secondary"
              href={`/blog/${post.slug}`}
            >
              <span className="w-5 shrink-0 text-muted text-sm tabular-nums">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="min-w-0 flex-1 font-semibold text-sm transition-colors group-hover:text-accent-strong">
                  {post.title}
                </span>
                <span className="shrink-0 text-muted text-xs tabular-nums">
                  {getCategoryConfig(post).label} ·{" "}
                  {views.format(post.viewCount)} views
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
