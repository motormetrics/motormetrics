import * as z from "zod";

export const highlightSchema = z.object({
  value: z.string().describe("The number, formatted"),
  label: z.string().describe("What the number is"),
  detail: z.string().describe("One line of context"),
});

/**
 * The data types a post can draw on.
 *
 * A section names every one it uses, so "More cars left the roads than
 * arrived" is ["cars", "deregistrations"] rather than being forced into a
 * single bucket. That keeps the post one argument while still letting the
 * site group, filter and attribute by data type.
 */
export const POST_SECTION_CATEGORIES = [
  "cars",
  "coe",
  "pqp",
  "deregistrations",
] as const;

/**
 * A chart, as structured output rather than JSON inside a markdown fence.
 *
 * Fences were parsed at render time, so a single stray character in a title
 * silently demoted a chart to a code block on a live post. Here the shape is
 * validated at generation.
 */
export const chartSchema = z.object({
  type: z
    .enum(["bar", "hbar", "line"])
    .describe("bar, hbar (ranking) or line (trend over months)"),
  title: z
    .string()
    .describe("Sentence case (not Title Case), max 60 characters"),
  // OpenAI strict structured outputs require every property to be in
  // `required`, so an optional field is rejected outright. Nullable is the
  // supported way to say "may be absent".
  subtitle: z
    .string()
    .nullable()
    .describe("Denominator or period. null if not needed"),
  unit: z
    .enum(["count", "percent", "currency"])
    .describe("count, percent or currency (SGD)"),
  valueLabel: z
    .string()
    .nullable()
    .describe('e.g. "Registrations". null if unneeded'),
  data: z
    .array(
      z.object({
        label: z.string(),
        value: z.number(),
      }),
    )
    .describe("2-15 points, one series"),
});

export const sectionSchema = z.object({
  categories: z
    .array(z.enum(POST_SECTION_CATEGORIES))
    .describe("Every data type this section uses"),
  heading: z.string().describe("A claim in words, not a label"),
  body: z.string().describe("Prose, no bullet lists"),
  charts: z.array(chartSchema).describe("Charts evidencing the claim"),
  highlights: z.array(highlightSchema).describe("Stat cards from this section"),
});

export const postSchema = z.object({
  title: z
    .string()
    .describe("A claim in words, under 60 chars, at most one number"),
  excerpt: z.string().describe("2-3 sentences, under 300 chars"),
  lead: z
    .string()
    .describe(
      "2-3 sentences opening the post, an observation not a restated number",
    ),
  sections: z.array(sectionSchema).describe("Two or three sections"),
  tags: z.array(z.string()).describe("Title Case, 4-6 tags"),
});

export type GeneratedPost = z.infer<typeof postSchema>;
export type Highlight = z.infer<typeof highlightSchema>;
export type PostChart = z.infer<typeof chartSchema>;
export type PostSection = z.infer<typeof sectionSchema>;
export type PostSectionCategory = (typeof POST_SECTION_CATEGORIES)[number];
