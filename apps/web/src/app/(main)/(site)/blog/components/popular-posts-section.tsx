import { PopularPosts } from "@web/app/(main)/(site)/blog/components/popular-posts";
import { Flagged } from "@web/components/flagged";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { blogPopularPosts } from "@web/flags";
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

export async function PopularPostsSection() {
  return (
    <Flagged enabled={await blogPopularPosts()}>
      <Suspense fallback={<PopularPostsSkeleton />}>
        <PopularPostsContent />
      </Suspense>
    </Flagged>
  );
}
