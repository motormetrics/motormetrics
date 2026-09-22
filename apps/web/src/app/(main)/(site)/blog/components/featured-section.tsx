import { FeaturedPost } from "@web/app/(main)/(site)/blog/components/featured-post";
import { PopularPostsSection } from "@web/app/(main)/(site)/blog/components/popular-posts-section";
import { SkeletonBentoCard } from "@web/components/shared/skeleton";
import { blogPopularPosts } from "@web/flags";
import { getAllPosts } from "@web/queries/posts";
import { Suspense } from "react";

/**
 * The comp's two-up opening: the featured post on the left, a white card on
 * the right. The right card is flag-gated, so the grid is decided here — with
 * the flag off the featured panel takes the full width rather than leaving an
 * empty column beside it.
 */
async function FeaturedContent() {
  const [posts, showPopular] = await Promise.all([
    getAllPosts(),
    blogPopularPosts(),
  ]);
  const featured = posts[0];

  if (!featured) {
    return null;
  }

  if (!showPopular) {
    return <FeaturedPost post={featured} />;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
      <FeaturedPost post={featured} />
      <PopularPostsSection />
    </div>
  );
}

export function FeaturedSection() {
  return (
    <Suspense fallback={<SkeletonBentoCard className="min-h-80" />}>
      <FeaturedContent />
    </Suspense>
  );
}
