import { Card, Skeleton } from "@heroui/react";
import { PopularPosts } from "@web/app/(main)/(site)/blog/components/popular-posts";
import { getPopularPostsWithData } from "@web/queries/posts/popularity";
import { Suspense } from "react";

async function PopularPostsContent() {
  const posts = await getPopularPostsWithData(5);

  return <PopularPosts posts={posts} />;
}

export function PopularPostsSection() {
  return (
    <Suspense
      fallback={
        <Card className="h-full">
          <Card.Header className="items-start gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
          </Card.Header>
          <Card.Content className="gap-4">
            <Skeleton className="h-24 w-full" />
          </Card.Content>
        </Card>
      }
    >
      <PopularPostsContent />
    </Suspense>
  );
}
