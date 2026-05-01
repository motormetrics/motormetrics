import { Card, Chip, Link } from "@heroui/react";
import { getRelatedPosts } from "@web/lib/data/posts";
import readingTime from "reading-time";
import { getCategoryConfig } from "./post/utils";

interface RelatedPostsProps {
  currentPostId: string;
  limit?: number;
}

export async function RelatedPosts({
  currentPostId,
  limit = 3,
}: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId, limit);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="border-foreground border-t-2 pt-8">
      {/* Section header - matches KeyHighlights style */}
      <h2 className="mb-6 font-bold text-foreground/60 text-xs uppercase tracking-[0.3em]">
        Related Posts
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => {
          const category = getCategoryConfig(post);
          const publishedDate = post.publishedAt ?? post.createdAt;
          const readTime = readingTime(post.content).minutes;

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block h-full"
            >
              <Card className="h-full border-default-200 transition-colors hover:border-default-400">
                <Card.Content className="flex flex-col gap-4 p-4">
                  {/* Category Label */}
                  <Chip
                    size="sm"
                    color={category.color}
                    variant="soft"
                    className="h-5 px-1 font-bold text-[10px]"
                  >
                    {category.label}
                  </Chip>

                  {/* Title */}
                  <h3 className="line-clamp-2 font-bold text-lg leading-tight">
                    {post.title}
                  </h3>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-default-400 text-xs">
                    <span>
                      {publishedDate.toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="size-1 rounded-full bg-default-300" />
                    <span>{Math.ceil(readTime)} min read</span>
                  </div>
                </Card.Content>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
