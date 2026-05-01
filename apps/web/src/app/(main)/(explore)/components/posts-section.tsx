import { Card, Skeleton } from "@heroui/react";
import { getRecentPosts } from "@web/queries/posts";
import { Suspense } from "react";
import { RecentPosts } from "./recent-posts";

async function PostsSectionContent() {
  const posts = await getRecentPosts(3);
  return <RecentPosts posts={posts} />;
}

function PostsSectionSkeleton() {
  return (
    <Card>
      <Card.Content className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <Skeleton className="h-6 w-28 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Featured Post Skeleton */}
          <div className="lg:row-span-2">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
          </div>
          {/* Stacked Posts Skeleton */}
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

export function PostsSection() {
  return (
    <Suspense fallback={<PostsSectionSkeleton />}>
      <PostsSectionContent />
    </Suspense>
  );
}
