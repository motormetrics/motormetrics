import { Tooltip, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import type { SelectPost } from "@motormetrics/database";
import { Post } from "@web/app/(main)/(site)/blog/components/post";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface RecentPostsProps {
  posts: SelectPost[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
  if (!posts || posts.length === 0) {
    return (
      <section className="flex h-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <Typography.Heading level={3}>Recent Posts</Typography.Heading>
          <Tooltip delay={300}>
            <Link
              aria-label="View all blog posts"
              className={buttonVariants({
                className: "size-10",
                isIconOnly: true,
                variant: "tertiary",
              })}
              href="/blog"
            >
              <ArrowUpRight className="size-6" />
            </Link>
            <Tooltip.Content>View all blog posts</Tooltip.Content>
          </Tooltip>
        </div>
        <p className="rounded-xl bg-surface py-10 text-center text-muted shadow-surface">
          No recent posts available.
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography.Heading level={3}>Recent Posts</Typography.Heading>
        <Tooltip delay={300}>
          <Link
            aria-label="View all blog posts"
            className={buttonVariants({
              className: "size-10",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href="/blog"
          >
            <ArrowUpRight className="size-6" />
          </Link>
          <Tooltip.Content>View all blog posts</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 2xl:grid-cols-1">
        {posts.slice(0, 3).map((post) => (
          <Post.Card key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
