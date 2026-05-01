"use client";

import { Card } from "@heroui/react";

import type { SelectPost } from "@motormetrics/database";
import Image from "next/image";
import Link from "next/link";
import { Cover } from "./cover";
import { formatDate, getExcerpt, getReadingTime } from "./utils";

interface HeroProps {
  post: SelectPost;
}

/**
 * Featured blog post — horizontal layout wrapped in HeroUI Card.
 * Cover image on the left, text on the right.
 */
export function Hero({ post }: HeroProps) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const readingTime = getReadingTime(post);
  const excerpt = getExcerpt(post);

  return (
    <Link href={`/blog/${post.slug}`} className="block no-underline">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <Card.Content className="grid grid-cols-1 gap-0 p-0 md:grid-cols-5">
          {post.heroImage ? (
            <div className="relative aspect-2/1 overflow-hidden md:col-span-2 md:aspect-4/3">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-br from-accent/40 to-accent/20" />
            </div>
          ) : (
            <Cover
              category={post.dataType ?? "default"}
              className="aspect-2/1 md:col-span-2 md:aspect-4/3"
            />
          )}
          <div className="flex flex-col justify-center gap-4 p-6 md:col-span-3">
            <div className="flex items-center gap-2 text-muted text-sm">
              <span>{formatDate(publishedDate)}</span>
              <span className="size-1 rounded-full bg-default" />
              <span>{readingTime} min read</span>
            </div>
            <h2 className="line-clamp-3 font-bold text-2xl leading-tight md:text-3xl">
              {post.title}
            </h2>
            {excerpt && (
              <p className="line-clamp-3 text-base text-muted leading-relaxed">
                {excerpt}
              </p>
            )}
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
