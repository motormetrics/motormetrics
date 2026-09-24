import { Typography } from "@heroui/react";
import { getRelatedPosts } from "@web/queries/posts/popularity";
import { PostCard } from "./post-card";

interface RelatedPostsProps {
  currentPostId: string;
  limit?: number;
}

/** The comp's "Read next" row — the posts nearest this one by embedding. */
export async function RelatedPosts({
  currentPostId,
  limit = 3,
}: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId, limit);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-7">
      <Typography.Heading level={2}>Read next</Typography.Heading>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <PostCard key={post.id} post={post} showExcerpt={false} />
        ))}
      </div>
    </section>
  );
}
