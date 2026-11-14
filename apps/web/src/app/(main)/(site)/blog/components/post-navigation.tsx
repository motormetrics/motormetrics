import type { SelectPost } from "@motormetrics/database/schema";
import { FollowLinks } from "@web/app/(main)/(site)/blog/components/follow-links";
import { PostCard } from "@web/app/(main)/(site)/blog/components/post-card";
import { SectionHead } from "@web/components/shared/overview";

interface PostNavigationProps {
  next?: SelectPost;
  post: SelectPost;
  previous?: SelectPost;
}

/**
 * "Keep reading": the previous post, and the next where there is one, then
 * the live pages behind this post's figures.
 */
export function PostNavigation({ next, post, previous }: PostNavigationProps) {
  const neighbours = [previous, next].filter(
    (entry): entry is SelectPost => entry !== undefined,
  );

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Keep reading"
        title={
          previous && !next
            ? "Previous post"
            : next && !previous
              ? "Next post"
              : "Previous and next"
        }
      />
      {neighbours.length > 0 ? (
        <div className="@container">
          <div className="grid @3xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-3.5">
            {neighbours.map((entry) => (
              <PostCard key={entry.id} post={entry} showExcerpt={false} />
            ))}
          </div>
        </div>
      ) : null}
      <FollowLinks post={post} />
    </section>
  );
}
