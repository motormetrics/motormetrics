import { BonesFallback } from "@web/components/shared/bones-fallback";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
import { getRecentPosts } from "@web/queries/posts";
import { Suspense } from "react";
import { RecentPosts } from "./recent-posts";

async function PostsSectionContent() {
  const posts = await getRecentPosts(3);
  return (
    <BonesCapture name="posts-section">
      <RecentPosts posts={posts} />
    </BonesCapture>
  );
}

export function PostsSection() {
  return (
    <Suspense fallback={<BonesFallback name="posts-section" />}>
      <PostsSectionContent />
    </Suspense>
  );
}
