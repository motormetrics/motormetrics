export interface Highlight {
  value: string;
  label: string;
  detail?: string;
}

interface KeyHighlightsProps {
  highlights?: Highlight[];
}

export function KeyHighlights({ highlights }: KeyHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-bold text-foreground/60 text-xs uppercase tracking-[0.3em]">
        Key Highlights
      </h2>
      <div className="grid grid-cols-1 gap-0 border-foreground border-t-2 md:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="border-foreground border-r-0 border-b-2 p-5 last:border-r-0 md:border-r-2"
          >
            <div className="mb-1 font-black text-3xl text-primary tabular-nums md:text-4xl">
              {item.value}
            </div>
            <div className="mb-1 font-bold text-foreground text-xs uppercase tracking-wide">
              {item.label}
            </div>
            {item.detail && (
              <div className="text-foreground/60 text-xs">{item.detail}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
