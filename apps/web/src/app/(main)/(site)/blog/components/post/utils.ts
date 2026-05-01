import type { SelectPost } from "@motormetrics/database";
import { differenceInDays } from "date-fns";

type ChipColor = "default" | "warning" | "accent" | "danger" | "success";

// Unified category configuration supporting both text styling and HeroUI Chip
export const categoryConfig: Record<
  string,
  {
    label: string;
    className: string;
    color: ChipColor;
  }
> = {
  coe: {
    label: "COE",
    className: "text-primary",
    color: "accent",
  },
  cars: {
    label: "Cars",
    className: "text-success",
    color: "success",
  },
  default: {
    label: "Insights",
    className: "text-secondary",
    color: "default",
  },
};

// Default fallback for unknown categories
export const defaultCategory = {
  label: "INSIGHTS",
  className: "text-secondary",
  color: "default" as ChipColor,
};

// Get category configuration for a post
export const getCategoryConfig = (post: SelectPost) => {
  // Use top-level dataType field (flattened schema)
  return categoryConfig[post.dataType ?? "default"] || defaultCategory;
};

// Get reading time from post metadata with default fallback
export const getReadingTime = (post: SelectPost): number => {
  const metadata = post.metadata as Record<string, unknown>;
  return (metadata?.readingTime as number) || 5;
};

// Get excerpt from post (top-level field in flattened schema)
export const getExcerpt = (post: SelectPost): string | undefined => {
  return post.excerpt ?? undefined;
};

// Format date for display
export const formatDate = (
  date: Date,
  format: "short" | "full" = "full",
): string => {
  const options: Intl.DateTimeFormatOptions =
    format === "full"
      ? { year: "numeric", month: "short", day: "numeric" }
      : { month: "short", day: "numeric" };

  return new Date(date).toLocaleDateString("en-SG", options);
};

// Check if post is new (published within threshold days)
export const isNewPost = (post: SelectPost, daysThreshold = 14): boolean => {
  const publishedDate = post.publishedAt ?? post.createdAt;
  return differenceInDays(new Date(), publishedDate) <= daysThreshold;
};
