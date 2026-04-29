import { PopularPosts } from "@web/app/(main)/(site)/blog/components/popular-posts";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { UnreleasedFeature } from "@web/components/unreleased-feature";
import { getPopularPostsWithData } from "@web/lib/data/posts";
import { Suspense } from "react";

async function PopularPostsContent() {
  const posts = await getPopularPostsWithData(5);

  return <PopularPosts posts={posts} />;
}

function PopularPostsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function PopularPostsSection() {
  return (
    <UnreleasedFeature>
      <Suspense fallback={<PopularPostsSkeleton />}>
        <PopularPostsContent />
      </Suspense>
    </UnreleasedFeature>
  );
}
