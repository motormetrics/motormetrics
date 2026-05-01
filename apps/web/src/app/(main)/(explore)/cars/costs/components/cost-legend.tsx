import { COST_TERMS } from "@web/app/(main)/(explore)/cars/costs/constants";

export function CostLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {COST_TERMS.map(({ abbr, definition }) => {
        return (
          <div
            key={abbr}
            className="flex items-center gap-2 rounded-full bg-default px-4 py-2"
          >
            <span className="font-medium text-foreground text-xs">{abbr}</span>
            <span className="text-muted text-xs">{definition}</span>
          </div>
        );
      })}
    </div>
  );
}
