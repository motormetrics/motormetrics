import { COST_TERMS } from "@web/app/(main)/(explore)/cars/costs/constants";

export function CostLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {COST_TERMS.map(({ abbr, definition }) => {
        return (
          <div
            key={abbr}
            className="flex items-center gap-2 rounded-full bg-default-100 px-4 py-2"
          >
            <span className="font-medium text-default-700 text-xs">{abbr}</span>
            <span className="text-default-500 text-xs">{definition}</span>
          </div>
        );
      })}
    </div>
  );
}
