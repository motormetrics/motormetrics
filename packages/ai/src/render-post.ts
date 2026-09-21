import type { GeneratedPost, Highlight, PostSection } from "./schemas";

/**
 * C0 controls and DEL carry no meaning in a heading or a chart label, and a
 * raw one is what demoted a live chart to a code block: JSON.parse rejects
 * control characters inside strings. Strip at the boundary so nothing
 * downstream has to cope with them.
 */
const clean = (value: string): string => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: matching them is the point
  const withoutControls = value.replace(/[\u0000-\u001f\u007f]/g, " ");
  return withoutControls.replace(/\s+/g, " ").trim();
};

/**
 * Turn a generated post into the markdown stored in `posts.content`.
 *
 * Sections are structured output now, but the blog renders markdown, so the
 * structure is serialised here rather than at render time. Charts become
 * ```chart fences — the same contract mdx-components already parses — built
 * from validated objects instead of model-authored JSON.
 */
export function renderPostContent(post: GeneratedPost): string {
  const parts: string[] = [clean(post.lead)];

  for (const section of post.sections) {
    parts.push(`## ${clean(section.heading)}`);
    parts.push(section.body.trim());

    for (const chart of section.charts) {
      parts.push(
        ["```chart", JSON.stringify(sanitiseChart(chart)), "```"].join("\n"),
      );
    }
  }

  return parts.join("\n\n");
}

function sanitiseChart(
  chart: GeneratedPost["sections"][number]["charts"][number],
) {
  return {
    ...chart,
    title: clean(chart.title),
    ...(chart.subtitle ? { subtitle: clean(chart.subtitle) } : {}),
    ...(chart.valueLabel ? { valueLabel: clean(chart.valueLabel) } : {}),
    data: chart.data.map((point) => ({
      label: clean(point.label),
      value: point.value,
    })),
  };
}

/**
 * Highlights live per section so the model attributes them, but the page
 * renders one strip across the top. Flatten in section order.
 */
export function collectHighlights(post: GeneratedPost): Highlight[] {
  return post.sections.flatMap((section) => section.highlights);
}

/** Every data type the post actually drew on, in first-use order. */
export function collectCategories(sections: PostSection[]): string[] {
  const seen = new Set<string>();
  for (const section of sections) {
    for (const category of section.categories) {
      seen.add(category);
    }
  }
  return [...seen];
}
