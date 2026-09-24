import type { SelectPost } from "@motormetrics/database/schema";
import readingTime from "reading-time";

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
    articleSection: "Singapore Car Market Monthly Update",
  },
  cars: {
    label: "Cars",
    articleSection: "Car Registrations",
  },
  coe: {
    label: "COE",
    articleSection: "COE Bidding",
  },
  pqp: {
    label: "PQP",
    articleSection: "COE Renewal",
  },
  deregistrations: {
    label: "Deregistrations",
    articleSection: "Vehicle Deregistrations",
  },
  // Legacy: the EV post workflow is retired, but published posts carry it.
  "electric-vehicles": {
    label: "Electric",
    articleSection: "Electric Vehicles",
  },
} as const satisfies Record<
  string,
  {
    label: string;
    articleSection: string;
  }
>;

export type PostCategoryKey = keyof typeof POST_CATEGORIES;

/** Widened view of POST_CATEGORIES, so an unknown dataType can be looked up. */
const categoryConfig: Record<string, { label: string }> = POST_CATEGORIES;

// Get category configuration for a post
/**
 * Fallback for a post whose dataType is missing or not in POST_CATEGORIES.
 * Reaching this is a signal a dataType was added without registering it above.
 */
const defaultCategory = {
  label: "Insights",
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

/**
 * Minutes to read, counted from the body — the same figure the post head
 * shows, so a card and the post it opens never disagree.
 */
export const getReadingTime = (post: SelectPost): number =>
  Math.max(1, Math.ceil(readingTime(post.content).minutes));

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
