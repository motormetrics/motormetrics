export interface Highlight {
  value: string;
  label: string;
  detail?: string;
}

/**
 * The figures the post is about, before the argument starts.
 *
 * The comp draws them in a white card. At the article's full column that
 * reads as a dashboard panel dropped into the copy, so they take the
 * rule-topped form the Learn head uses instead — on the page like the
 * charts further down, not boxed apart from it.
 */
export function KeyHighlights({ highlights }: { highlights?: Highlight[] }) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <dl className="not-prose grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3">
      {highlights.map((item) => (
        <div
          className="flex flex-col gap-1.5 border-border border-t-2 pt-5"
          key={`${item.label}-${item.value}`}
        >
          <dd className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
            {item.value}
          </dd>
          <dt className="font-semibold text-muted text-sm">{item.label}</dt>
          {item.detail ? (
            <dd className="text-muted text-xs">{item.detail}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
