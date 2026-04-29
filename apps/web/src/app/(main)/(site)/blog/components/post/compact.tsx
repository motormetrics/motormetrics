"use client";

import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import type { SelectPost } from "@motormetrics/database";
import { formatDate, getCategoryConfig, getReadingTime } from "./utils";

interface CompactProps {
  post: SelectPost;
}

export function Compact({ post }: CompactProps) {
  const publishedDate = post.publishedAt ?? post.createdAt;
  const category = getCategoryConfig(post);
  const readingTime = getReadingTime(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-center gap-4 p-4 transition-colors hover:bg-default-100"
    >
      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-1 font-medium text-sm transition-colors group-hover:text-primary">
          {post.title}
        </span>
        <span className="text-default-500 text-xs">
          {formatDate(publishedDate, "short")} · {readingTime} min read
        </span>
      </div>

      {/* Category Badge */}
      <Chip
        size="sm"
        color={category.color}
        variant="flat"
        classNames={{
          base: "h-5 shrink-0",
          content: "text-[10px] font-semibold px-1",
        }}
      >
        {category.label.split(" ")[0]}
      </Chip>
    </Link>
  );
}
