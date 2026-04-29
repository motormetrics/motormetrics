"use client";

import { CardBody, Card as HeroCard } from "@heroui/card";
import { Chip } from "@heroui/chip";
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
    <HeroCard
      isPressable
      as={Link}
      href={`/blog/${post.slug}`}
      className="h-full overflow-hidden"
    >
      <CardBody className="flex flex-col gap-0 p-0">
        {post.heroImage ? (
          <div className="relative aspect-2/1 overflow-hidden">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-br from-primary/40 to-primary/20" />
          </div>
        ) : (
          <Cover category={post.dataType ?? "default"} className="aspect-2/1" />
        )}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-default-400 text-xs">
            <span>{formatDate(publishedDate)}</span>
            <span className="size-1 rounded-full bg-default-300" />
            <span>{readingTime} min read</span>
            {isNew && (
              <Chip color="warning" variant="flat" size="sm">
                NEW
              </Chip>
            )}
          </div>
          <h3 className="line-clamp-2 font-bold text-lg leading-tight">
            {post.title}
          </h3>
          {excerpt && (
            <p className="line-clamp-2 text-default-500 text-sm">{excerpt}</p>
          )}
        </div>
      </CardBody>
    </HeroCard>
  );
}
