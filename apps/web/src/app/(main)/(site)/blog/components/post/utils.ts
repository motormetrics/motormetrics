import type { SelectPost } from "@motormetrics/database/schema";
import { differenceInDays } from "date-fns";

type ChipColor = "default" | "warning" | "accent" | "danger" | "success";

/**
 * The single source of truth for how a post is categorised.
 *
 * Three places used to encode this separately — the category chip, the blog
 * list's tabs, and the JSON-LD articleSection — and all three had drifted:
 * deregistrations and electric-vehicles posts rendered as "Insights", appeared
 * under no tab, and were labelled "COE Bidding" in structured data. Add a
 * dataType here and all three pick it up.
 *
 * `articleSection` is what schema.org sees, so it is spelled for a reader
 * rather than reusing the internal dataType.
 */
export const POST_CATEGORIES = {
  "monthly-update": {
    label: "Monthly Update",
    className: "text-accent-strong",
    color: "accent",
    articleSection: "Singapore Car Market Monthly Update",
  },
  cars: {
    label: "Cars",
    className: "text-success",
    color: "success",
    articleSection: "Car Registrations",
  },
  coe: {
    label: "COE",
    className: "text-accent-strong",
    color: "accent",
    articleSection: "COE Bidding",
  },
  pqp: {
    label: "PQP",
    className: "text-warning",
    color: "warning",
    articleSection: "COE Renewal",
  },
  deregistrations: {
    label: "Deregistrations",
    className: "text-danger",
    color: "danger",
    articleSection: "Vehicle Deregistrations",
  },
  // Legacy: the EV post workflow is retired, but published posts carry it.
  "electric-vehicles": {
    label: "Electric",
    className: "text-accent-strong",
    color: "accent",
    articleSection: "Electric Vehicles",
  },
} as const satisfies Record<
  string,
  {
    label: string;
    className: string;
    color: ChipColor;
    articleSection: string;
  }
>;

export type PostCategoryKey = keyof typeof POST_CATEGORIES;

/** Widened view of POST_CATEGORIES, so an unknown dataType can be looked up. */
const categoryConfig: Record<
  string,
  {
    label: string;
    className: string;
    color: ChipColor;
  }
> = POST_CATEGORIES;

// Get category configuration for a post
/**
 * Fallback for a post whose dataType is missing or not in POST_CATEGORIES.
 * Reaching this is a signal a dataType was added without registering it above.
 */
export const defaultCategory = {
  label: "Insights",
  className: "text-muted",
  color: "default" as ChipColor,
};

/**
 * schema.org articleSection. Was a cars-or-COE ternary, which labelled every
 * deregistrations and electric-vehicles post "COE Bidding" for Google.
 */
export const getArticleSection = (post: SelectPost): string =>
  POST_CATEGORIES[post.dataType as PostCategoryKey]?.articleSection ??
  "Market Analysis";

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
