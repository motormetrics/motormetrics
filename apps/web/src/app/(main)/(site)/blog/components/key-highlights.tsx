export interface Highlight {
  value: string;
  label: string;
  detail?: string;
}

/**
 * The figures the post is about, before the argument starts: label, figure
 * and note under a rule, three across, folding on phones into ruled rows with
 * the figure on the right. The comp also rules between columns; that needs a
 * first-of-each-row selector Tailwind has no preset for, so a gap stands in.
 */
export function KeyHighlights({ highlights }: { highlights?: Highlight[] }) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <dl className="not-prose grid grid-cols-1 md:grid-cols-3 md:gap-x-6">
      {highlights.map((item) => (
        <div
          className="flex min-w-0 flex-col gap-0.5 border-separator border-b py-3.5 max-md:grid max-md:grid-cols-2 max-md:items-center max-md:gap-x-3 md:border-border md:border-t"
          key={`${item.label}-${item.value}`}
        >
          <dt className="font-semibold text-muted text-xs">{item.label}</dt>
          <dd className="font-semibold text-2xl tabular-nums tracking-tight max-md:row-span-2 max-md:text-right max-md:text-lg">
            {item.value}
          </dd>
          {item.detail ? (
            <dd className="text-muted text-xs">{item.detail}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
