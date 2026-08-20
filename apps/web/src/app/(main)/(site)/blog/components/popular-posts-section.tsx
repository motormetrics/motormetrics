import { PopularPosts } from "@web/app/(main)/(site)/blog/components/popular-posts";
import { BonesFallback } from "@web/components/shared/bones-fallback";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
import { UnreleasedFeature } from "@web/components/unreleased-feature";
import { getPopularPostsWithData } from "@web/lib/data/posts";
import { Suspense } from "react";

async function PopularPostsContent() {
  const posts = await getPopularPostsWithData(5);

  return (
    <BonesCapture name="popular-posts">
      <PopularPosts posts={posts} />
    </BonesCapture>
  );
}

export function PopularPostsSection() {
  return (
    <UnreleasedFeature>
      <Suspense fallback={<BonesFallback name="popular-posts" />}>
        <PopularPostsContent />
      </Suspense>
    </UnreleasedFeature>
  );
}
