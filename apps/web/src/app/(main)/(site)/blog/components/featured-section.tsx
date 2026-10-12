import { FeaturedPost } from "@web/app/(main)/(site)/blog/components/featured-post";
import { PopularPostsSection } from "@web/app/(main)/(site)/blog/components/popular-posts-section";
import { SourceNote } from "@web/components/shared/overview";
import { SkeletonBentoCard } from "@web/components/shared/skeleton";
import { getAllPosts } from "@web/queries/posts";
import { Suspense } from "react";

/**
 * The featured card, with its source line when it quotes figures. The comp
 * has no place for the "Most read" list, so it follows the card as its own
 * ruled block.
 */
async function FeaturedContent() {
  const posts = await getAllPosts();
  const featured = posts[0];

  if (!featured) {
    return null;
  }

  const hasFigures =
    Array.isArray(featured.highlights) && featured.highlights.length > 0;

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <FeaturedPost post={featured} />
        {hasFigures ? (
          <SourceNote>
            Figures quoted in the featured post. Source: LTA via DataMall.
          </SourceNote>
        ) : null}
      </div>
      <PopularPostsSection />
    </>
  );
}

export function FeaturedSection() {
  return (
    <Suspense fallback={<SkeletonBentoCard className="min-h-72" />}>
      <FeaturedContent />
    </Suspense>
  );
}
