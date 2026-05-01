"use client";

import { Chip, Card as HeroCard } from "@heroui/react";

import type { SelectPost } from "@motormetrics/database";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cover } from "./cover";
import { formatDate, getExcerpt, getReadingTime, isNewPost } from "./utils";

interface CardProps {
  post: SelectPost;
}

/**
 * Blog post card — vertical layout wrapped in HeroUI Card.
 * Cover image on top, text below.
 */
export function Card({ post }: CardProps) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const readingTime = getReadingTime(post);
  const excerpt = getExcerpt(post);

  // Check if post is new only on client to avoid prerender issues with new Date()
  const [isNew, setIsNew] = useState(false);
  useEffect(() => {
    setIsNew(isNewPost(post));
  }, [post]);

  return (
    <Link href={`/blog/${post.slug}`} className="block h-full no-underline">
      <HeroCard className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <HeroCard.Content className="gap-0 p-0">
          {post.heroImage ? (
            <div className="relative aspect-2/1 overflow-hidden">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-br from-accent/40 to-accent/20" />
            </div>
          ) : (
            <Cover
              category={post.dataType ?? "default"}
              className="aspect-2/1"
            />
          )}
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2 text-muted text-xs">
              <span>{formatDate(publishedDate)}</span>
              <span className="size-1 rounded-full bg-default" />
              <span>{readingTime} min read</span>
              {isNew && (
                <Chip color="warning" variant="soft" size="sm">
                  NEW
                </Chip>
              )}
            </div>
            <h3 className="line-clamp-2 font-bold text-lg leading-tight">
              {post.title}
            </h3>
            {excerpt && (
              <p className="line-clamp-2 text-muted text-sm">{excerpt}</p>
            )}
          </div>
        </HeroCard.Content>
      </HeroCard>
    </Link>
  );
}
