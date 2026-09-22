import { PopularPosts } from "@web/app/(main)/(site)/blog/components/popular-posts";
import { SkeletonBentoCard } from "@web/components/shared/skeleton";
import { getPopularPostsWithData } from "@web/lib/data/posts";
import { Suspense } from "react";

async function PopularPostsContent() {
  const posts = await getPopularPostsWithData(5);

  return <PopularPosts posts={posts} />;
}

export function PopularPostsSection() {
  return (
    <Suspense fallback={<SkeletonBentoCard className="h-full" />}>
      <PopularPostsContent />
    </Suspense>
  );
}
