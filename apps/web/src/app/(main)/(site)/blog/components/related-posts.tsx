import { PostCard } from "@web/app/(main)/(site)/blog/components/post-card";
import { Hairline, SectionHead } from "@web/components/shared/overview";
import { getRelatedPosts } from "@web/queries/posts/popularity";

interface RelatedPostsProps {
  currentPostId: string;
  limit?: number;
}

/** "Read next": the posts nearest this one by embedding. */
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
        <div className="@container">
          <div className="grid @3xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-3.5">
            {relatedPosts.map((post) => (
              <PostCard key={post.id} post={post} showExcerpt={false} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
