import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
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
      <Card radius="lg">
        <CardBody className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <Typography.H3>Recent Posts</Typography.H3>
            <Link href="/blog" aria-label="View all blog posts">
              <Button isIconOnly variant="flat" radius="full" tabIndex={-1}>
                <ArrowUpRight className="size-6" />
              </Button>
            </Link>
          </div>
          <p className="py-8 text-center text-default-500">
            No recent posts available.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card radius="lg">
      <CardBody className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <Typography.H3>Recent Posts</Typography.H3>
          <Link href="/blog" aria-label="View all blog posts">
            <Button isIconOnly variant="flat" radius="full" tabIndex={-1}>
              <ArrowUpRight className="size-6" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Post.Card key={post.id} post={post} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
