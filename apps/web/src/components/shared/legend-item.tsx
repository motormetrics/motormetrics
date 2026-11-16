/**
 * A chart legend swatch and its label, for the figure heads. `className`
 * sets the swatch colour, e.g. `bg-chart-1`.
 */
export function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-muted text-xs">
      <span aria-hidden className={`size-2.5 rounded-xs ${className}`} />
      {label}
    </span>
  );
}
