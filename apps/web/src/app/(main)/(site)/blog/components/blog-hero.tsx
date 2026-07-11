import { Chip } from "@heroui/react";
import { ViewCounter } from "@web/app/(main)/(site)/blog/components/view-counter";
import Image from "next/image";
import { Suspense } from "react";

interface BlogHeroProps {
  title: string;
  slug: string;
  publishedAt: Date;
  readingTimeText: string;
  tags: string[] | null;
  postId: string;
  initialViewCount: number;
  heroImage: string | null;
}

export function BlogHero({
  title,
  publishedAt,
  readingTimeText,
  tags,
  postId,
  initialViewCount,
  heroImage,
}: BlogHeroProps) {
  const categoryLabel = tags && tags.length > 0 ? tags[0] : "Market Analysis";

  return (
    <div className="relative mb-10 w-full overflow-hidden rounded-xl bg-accent py-12 md:py-16">
      {heroImage && (
        <>
          <Image
            src={heroImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-accent/80" />
        </>
      )}
      <div className="relative flex max-w-5xl flex-col justify-end px-6 md:px-10">
        <Chip
          size="sm"
          variant="soft"
          className="mb-4 w-fit bg-white/15 font-medium text-white"
        >
          {categoryLabel}
        </Chip>
        <h1 className="mb-4 max-w-4xl text-balance font-semibold text-3xl text-white leading-tight tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 font-medium text-sm text-white/80 sm:gap-4">
          <span>
            {publishedAt.toLocaleDateString("en-SG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <span>{readingTimeText}</span>
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <Suspense fallback={null}>
            <ViewCounter
              postId={postId}
              initialCount={initialViewCount}
              className="text-inherit"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
