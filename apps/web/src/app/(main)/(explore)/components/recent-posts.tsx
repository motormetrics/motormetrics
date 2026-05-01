import { Button, Card, Link } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database";
import { Post } from "@web/app/(main)/(site)/blog/components/post";
import Typography from "@web/components/typography";
import { ArrowUpRight } from "lucide-react";

interface RecentPostsProps {
  posts: SelectPost[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
  if (!posts || posts.length === 0) {
    return (
      <Card>
        <Card.Content>
          <div className="mb-5 flex items-center justify-between">
            <Typography.H3>Recent Posts</Typography.H3>
            <Link href="/blog" aria-label="View all blog posts">
              <Button isIconOnly variant="tertiary">
                <ArrowUpRight className="size-6" />
              </Button>
            </Link>
          </div>
          <p className="py-8 text-center text-muted">
            No recent posts available.
          </p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Content>
        <div className="mb-5 flex items-center justify-between">
          <Typography.H3>Recent Posts</Typography.H3>
          <Link href="/blog" aria-label="View all blog posts">
            <Button isIconOnly variant="tertiary">
              <ArrowUpRight className="size-6" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Post.Card key={post.id} post={post} />
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
