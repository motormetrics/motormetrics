import { Separator, Typography } from "@heroui/react";
import {
  PostChart,
  type PostChartSpec,
  type PostChartType,
  type PostChartUnit,
} from "@web/app/(main)/(site)/blog/components/post-chart";
import type { Route } from "next";
import NextLink from "next/link";
import {
  type ComponentPropsWithoutRef,
  isValidElement,
  type JSX,
  type ReactNode,
} from "react";

type MdxLinkProps = ComponentPropsWithoutRef<"a">;

/**
 * MDX hands us raw HTML props, which still carry the deprecated presentational
 * `color` and `align` attributes. HeroUI's Typography reserves both as its own
 * props with narrower types, so they are dropped here rather than spread.
 */
type MdxProps<T extends keyof JSX.IntrinsicElements> = Omit<
  ComponentPropsWithoutRef<T>,
  "color" | "align"
>;

function MdxLink({ href = "", children, className, ...props }: MdxLinkProps) {
  const isInternalLink = href.startsWith("/") || href.startsWith("#");
  const linkClassName = [
    "font-medium text-accent-strong underline underline-offset-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isInternalLink) {
    return (
      <NextLink href={href as Route} className={linkClassName} {...props}>
        {children}
      </NextLink>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={linkClassName}
      {...props}
    >
      {children}
    </a>
  );
}

/** Beyond this a chart stops being readable at 400px and the payload bloats. */
const MAX_CHART_POINTS = 24;
/** The chart palette in `globals.css` carries six distinct hues, no more. */
const MAX_CHART_SERIES = 6;

const CHART_TYPES: PostChartType[] = ["area", "bar", "donut", "hbar", "line"];
const CHART_UNITS: PostChartUnit[] = ["count", "currency", "percent"];

/**
 * An earlier draft of the generator contract spelled some of these differently.
 * The prompts emit the names above, but a post generated against the older
 * wording should still draw rather than fall back to a code block — these cost
 * nothing and a published post is not worth losing a chart over.
 *
 * `column` meant a vertical bar chart there, which is what `bar` means here.
 */
const TYPE_ALIASES: Record<string, PostChartType> = { column: "bar" };
const UNIT_ALIASES: Record<string, PostChartUnit> = { sgd: "currency" };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Turns the body of a ```chart fence into a spec, or `null` when it is not one
 * we can draw.
 *
 * Every caller falls back to the plain `<pre>` on `null`: these bodies are
 * model-generated and already published, so a malformed spec has to be a
 * visible failure rather than a 500 on a live post.
 *
 * It lives here rather than beside `PostChart` because `post-chart.tsx` is a
 * client boundary — a function exported from there would be a client reference
 * on the server, where this runs. The type import above is erased, so only the
 * plain spec object crosses.
 */
function parseChartSpec(source: string): PostChartSpec | null {
  let raw: unknown;

  try {
    raw = JSON.parse(source);
  } catch {
    return null;
  }

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }

  const spec = raw as Record<string, unknown>;

  if (!Array.isArray(spec.data) || spec.data.length === 0) {
    return null;
  }

  const rows = spec.data.slice(0, MAX_CHART_POINTS);
  const first = rows[0];

  if (typeof first !== "object" || first === null || Array.isArray(first)) {
    return null;
  }

  // The series are whatever numeric keys the first row carries, so both
  // `{ label, value }` and `{ label, bev, petrol }` work without the generator
  // declaring anything. An explicit `series` array narrows and orders that set
  // when the generator does declare it, and is ignored when it names nothing
  // the rows actually have.
  const numericKeys = Object.entries(first as Record<string, unknown>)
    .filter(([key, value]) => key !== "label" && isFiniteNumber(value))
    .map(([key]) => key);
  const declared = Array.isArray(spec.series)
    ? spec.series.filter(
        (key): key is string =>
          typeof key === "string" && numericKeys.includes(key),
      )
    : [];
  const series = (declared.length ? declared : numericKeys).slice(
    0,
    MAX_CHART_SERIES,
  );

  if (series.length === 0) {
    return null;
  }

  // A row missing any of the series is dropped rather than coerced to zero — a
  // fabricated zero reads as a real datum.
  const data = rows.flatMap((row) => {
    if (typeof row !== "object" || row === null || Array.isArray(row)) {
      return [];
    }

    const entry = row as Record<string, unknown>;
    const point: Record<string, number | string> = {
      label: String(entry.label ?? ""),
    };

    for (const key of series) {
      const value = entry[key];

      if (!isFiniteNumber(value)) {
        return [];
      }

      point[key] = value;
    }

    return [point];
  });

  if (data.length === 0) {
    return null;
  }

  const text = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : undefined;

  const type = typeof spec.type === "string" ? spec.type : "";
  const unit = typeof spec.unit === "string" ? spec.unit : "";

  return {
    caption: text(spec.caption),
    data,
    series,
    // `note` is the older name for the same field — the line that names the
    // denominator or the scope.
    subtitle: text(spec.subtitle) ?? text(spec.note),
    title: text(spec.title),
    // An unrecognised type still draws: columns are the safe default, and
    // losing the chart entirely is worse than drawing the wrong shape.
    type:
      CHART_TYPES.find((candidate) => candidate === type) ??
      TYPE_ALIASES[type] ??
      "bar",
    unit:
      CHART_UNITS.find((candidate) => candidate === unit) ??
      UNIT_ALIASES[unit] ??
      "count",
    valueLabel: text(spec.valueLabel),
  };
}

/**
 * The text of a fenced block tagged `chart`, or `null` for every other fence.
 *
 * `format: "md"` compiles a fence to `<pre><code className="language-chart">`,
 * so the tag arrives as a class on the child element. Nothing here changes the
 * parser — the fence is only a carrier.
 */
function chartFenceSource(children: ReactNode): string | null {
  if (!isValidElement(children)) {
    return null;
  }

  const { className, children: code } = children.props as {
    children?: ReactNode;
    className?: string;
  };

  if (typeof className !== "string" || typeof code !== "string") {
    return null;
  }

  const isChart = className
    .split(/\s+/)
    .some((name) => name === "language-chart" || name === "lang-chart");

  return isChart ? code : null;
}

/**
 * MDX Components Mapping
 *
 * Maps MDX/Markdown HTML elements to our custom Typography components
 * with NYT/Washington Post-inspired editorial styling.
 *
 * Used by MDXRemote in blog post rendering.
 */
export const mdxComponents = {
  // Headings - with generous spacing for editorial feel
  h1: (props: MdxProps<"h1">) => <Typography.Heading level={1} {...props} />,
  h2: (props: MdxProps<"h2">) => (
    <Typography.Heading level={2} className="mt-12 mb-6" {...props} />
  ),
  h3: (props: MdxProps<"h3">) => (
    <Typography.Heading
      level={3}
      className="mt-8 mb-4 border-accent border-l-4 pl-4"
      {...props}
    />
  ),
  h4: (props: MdxProps<"h4">) => (
    <Typography.Heading level={4} className="mt-6 mb-3" {...props} />
  ),

  // Body text
  p: (props: MdxProps<"p">) => (
    <Typography.Paragraph className="mb-6" {...props} />
  ),

  // Blockquotes - editorial style with subtle background
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-8 border-accent border-l-4 bg-default py-4 pr-4 pl-6 text-foreground text-lg italic"
      {...props}
    />
  ),

  // Lists
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-6 ml-6 list-disc space-y-2" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-6 ml-6 list-decimal space-y-2" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="text-base text-foreground leading-7" {...props} />
  ),

  // Code (inline)
  code: (props: MdxProps<"code">) => <Typography.Code {...props} />,

  // Links - styled for blog content
  a: MdxLink,

  // Tables - Editorial style with accent border (HybridStyle)
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-8 w-full overflow-x-auto border-accent border-l-4 pl-4">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-transparent" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      scope="col"
      className="border-foreground border-b-2 px-4 py-3 text-left font-bold text-muted text-xs uppercase tracking-wider [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-4 py-3 text-sm tabular-nums [&:last-child]:font-semibold [&:last-child]:text-accent-strong [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr
      className="border-border border-b transition-colors last:border-none hover:bg-default"
      {...props}
    />
  ),

  // Horizontal rule
  hr: () => <Separator className="my-12" />,

  // Pre-formatted code blocks, and the ```chart fence that rides on them
  pre: (props: ComponentPropsWithoutRef<"pre">) => {
    const source = chartFenceSource(props.children);
    const spec = source === null ? null : parseChartSpec(source);

    if (spec) {
      return <PostChart spec={spec} />;
    }

    return (
      <pre
        className="my-6 overflow-x-auto rounded-lg bg-default p-4 text-sm"
        {...props}
      />
    );
  },

  // Strong/Bold - slightly heavier for emphasis
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),

  // Emphasis/Italic
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="italic" {...props} />
  ),
};
