import { PostCard } from "@web/app/(main)/(site)/blog/components/post-card";
import { Hairline, SectionHead } from "@web/components/shared/overview";
import { getRelatedPosts } from "@web/queries/posts/popularity";

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

  // The rule above belongs to the section, so a post with no neighbours
  // leaves no stray line.
  return (
    <>
      <Hairline />
      <section className="flex flex-col gap-4">
        <SectionHead
          eyebrow="Keep reading"
          link={{ href: "/blog", label: "All posts" }}
          title="Read next"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.map((post) => (
            <PostCard key={post.id} post={post} showExcerpt={false} />
          ))}
        </div>
      </section>
    </>
  );
}
