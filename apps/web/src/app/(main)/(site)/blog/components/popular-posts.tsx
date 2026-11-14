import { Typography } from "@heroui/react";
import { getCategoryConfig } from "@web/app/(main)/(site)/blog/components/post/utils";
import { getPopularPostsWithData } from "@web/queries/posts/popularity";
import Link from "next/link";

/** How many posts the list ranks. */
const LIMIT = 5;

const views = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 1,
  notation: "compact",
});

/**
 * The posts readers open most, ranked beside the head once the page is wide
 * and under it before then. Reads cached view counts only, so it needs no
 * Suspense boundary.
 */
export async function MostRead() {
  const posts = await getPopularPostsWithData(LIMIT);

  if (posts.length === 0) {
    return null;
  }

  return (
    <aside aria-labelledby="most-read" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        id="most-read"
        size="xs"
        weight="semibold"
      >
        Most read
      </Typography.Paragraph>
      <ol className="flex flex-col border-separator border-t">
        {posts.map((post, index) => (
          <li className="border-separator border-b" key={post.id}>
            <Link
              className="group flex gap-2.5 py-3 text-foreground no-underline"
              href={`/blog/${post.slug}`}
            >
              <span className="w-5 shrink-0 font-semibold text-muted text-sm tabular-nums">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold text-sm leading-snug group-hover:underline">
                  {post.title}
                </span>
                <span className="text-muted text-xs tabular-nums">
                  {getCategoryConfig(post).label} ·{" "}
                  {views.format(post.viewCount)} views
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <Typography.Paragraph color="muted" size="xs">
        Page views on motormetrics.app/blog.
      </Typography.Paragraph>
    </aside>
  );
}
