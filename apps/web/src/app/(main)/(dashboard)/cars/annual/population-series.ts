import type { View } from "@web/app/(main)/(dashboard)/cars/annual/search-params";

/** Years drawn in the column chart and the hero sparkline. */
const CHART_YEARS = 10;

/** LTA's label for a battery-electric vehicle, used verbatim. */
export const ELECTRIC = "Electric";

/** One fuel type of an entity, in the selected year and the one before it. */
export interface PopulationFuelRow {
  /** LTA DataMall fuel label, verbatim — never re-grouped. */
  label: string;
  value: number;
  previous: number;
}

/** A row of the population table: one vehicle type, or one make. */
export interface PopulationEntity {
  name: string;
  /** Population at each year of `years`, in the same order. */
  series: number[];
  /** Electric population at each year of `years`. */
  electric: number[];
  /** Fuel split in the selected year, largest first. */
  fuel: PopulationFuelRow[];
}

export interface PopulationSeries {
  /** Ascending, ending at the selected year and capped to `CHART_YEARS`. */
  years: string[];
  /** The year every headline figure is reported at. */
  year: string;
  /** The year the change column measures against, if the data reaches it. */
  previousYear: string | null;
  /** One per vehicle type or make, largest first. */
  entities: PopulationEntity[];
  /** Every entity summed — the selection the page opens on. */
  overall: PopulationEntity;
}

/** The copy that changes with the dimension the page is sliced by. */
export interface DimensionLabels {
  /** Pill in the page head. */
  tab: string;
  /** Title of the table. */
  title: string;
  /** Heading of the table's first column. */
  column: string;
  /** Plural, for the row count. */
  plural: string;
  /** Name given to every entity summed. */
  overall: string;
  /** What one unit of population is, for the hero and the ink panel. */
  noun: string;
}

export const DIMENSION_LABELS: Record<View, DimensionLabels> = {
  "fuel-type": {
    tab: "Vehicle types",
    title: "All vehicle types",
    column: "Vehicle type",
    plural: "vehicle types",
    overall: "All vehicles",
    noun: "vehicles",
  },
  make: {
    tab: "Car makes",
    title: "All makes",
    column: "Make",
    plural: "makes",
    overall: "All cars",
    noun: "cars",
  },
};

/** A population row flattened out of either annual dataset. */
export interface PopulationRow {
  year: string;
  /** Vehicle type or make, whichever the view is sliced by. */
  name: string;
  /** Null where LTA published the count without a fuel split. */
  fuelType: string | null;
  total: number;
}

interface EntityDraft {
  electric: number[];
  fuel: Map<string, PopulationFuelRow>;
  series: number[];
}

function draft(length: number): EntityDraft {
  return {
    electric: Array.from({ length }, () => 0),
    fuel: new Map(),
    series: Array.from({ length }, () => 0),
  };
}

function fuelRow(draftEntity: EntityDraft, label: string): PopulationFuelRow {
  const existing = draftEntity.fuel.get(label);
  if (existing) {
    return existing;
  }
  const row: PopulationFuelRow = { label, previous: 0, value: 0 };
  draftEntity.fuel.set(label, row);
  return row;
}

function finalise(name: string, entity: EntityDraft): PopulationEntity {
  return {
    electric: entity.electric,
    fuel: [...entity.fuel.values()]
      .filter((row) => row.value > 0 || row.previous > 0)
      .sort((first, second) => second.value - first.value),
    name,
    series: entity.series,
  };
}

/**
 * Pivots the flat annual rows into everything the page draws: a yearly series
 * per entity for the chart and the sparkline, a fuel split for the donut and
 * the rail, and the selected year's totals for the table.
 *
 * `selectedYear` is the year the reader picked; a year the dataset does not
 * carry falls back to the latest one on record rather than rendering empty.
 *
 * Returns `null` when the dataset is empty, which the page renders as its
 * empty state.
 */
export function buildPopulationSeries(
  rows: PopulationRow[],
  selectedYear: number | null,
  overallName: string,
): PopulationSeries | null {
  const allYears = [...new Set(rows.map((row) => row.year))].sort();
  if (allYears.length === 0) {
    return null;
  }

  const wanted = selectedYear === null ? null : String(selectedYear);
  const selectedIndex =
    wanted !== null && allYears.includes(wanted)
      ? allYears.indexOf(wanted)
      : allYears.length - 1;
  const year = allYears[selectedIndex];
  const previousYear = allYears[selectedIndex - 1] ?? null;
  const years = allYears.slice(
    Math.max(0, selectedIndex - CHART_YEARS + 1),
    selectedIndex + 1,
  );
  const columnOf = new Map(years.map((value, index) => [value, index]));

  const drafts = new Map<string, EntityDraft>();
  const overall = draft(years.length);

  for (const row of rows) {
    let entity = drafts.get(row.name);
    if (!entity) {
      entity = draft(years.length);
      drafts.set(row.name, entity);
    }

    const column = columnOf.get(row.year);
    if (column !== undefined) {
      entity.series[column] += row.total;
      overall.series[column] += row.total;
      if (row.fuelType === ELECTRIC) {
        entity.electric[column] += row.total;
        overall.electric[column] += row.total;
      }
    }

    if (row.fuelType === null) {
      continue;
    }
    if (row.year === year) {
      fuelRow(entity, row.fuelType).value += row.total;
      fuelRow(overall, row.fuelType).value += row.total;
    } else if (row.year === previousYear) {
      fuelRow(entity, row.fuelType).previous += row.total;
      fuelRow(overall, row.fuelType).previous += row.total;
    }
  }

  const entities = [...drafts.entries()]
    .map(([name, entity]) => finalise(name, entity))
    // A type or make that has left the road entirely is dropped rather than
    // listed as a row of zeros.
    .filter((entity) => (entity.series.at(-1) ?? 0) > 0)
    .sort(
      (first, second) =>
        (second.series.at(-1) ?? 0) - (first.series.at(-1) ?? 0),
    );

  return {
    entities,
    overall: finalise(overallName, overall),
    previousYear,
    year,
    years,
  };
}

/** Signed change of the last year against the one before it, as a ratio. */
export function changeRatio(series: number[]): number | null {
  const current = series.at(-1);
  const previous = series.at(-2);
  if (current === undefined || previous === undefined || previous === 0) {
    return null;
  }
  return (current - previous) / previous;
}
