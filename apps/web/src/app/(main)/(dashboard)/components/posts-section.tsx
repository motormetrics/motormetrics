import { Skeleton } from "@heroui/react";
import { getRecentPosts } from "@web/queries/posts";
import { Suspense } from "react";
import { RecentPosts } from "./recent-posts";

async function PostsSectionContent() {
  const posts = await getRecentPosts(3);
  return <RecentPosts posts={posts} />;
}

function PostsSectionSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-28 rounded-lg" />
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item}>
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PostsSection() {
  return (
    <Suspense fallback={<PostsSectionSkeleton />}>
      <PostsSectionContent />
    </Suspense>
  );
}
