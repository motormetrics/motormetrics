/** LTA's label for a battery-electric vehicle, used verbatim. */
export const ELECTRIC = "Electric";

/** LTA's vehicle type for private cars — the class the page is fixed on. */
export const CARS = "Cars";

/** Chart colours the skin carries; ranks past this share the last one. */
const CHART_COLOURS = 6;

/** One fuel type of a class, in the latest year and the one before it. */
export interface PopulationFuelRow {
  /** LTA DataMall fuel label, verbatim — never re-grouped. */
  label: string;
  value: number;
  previous: number;
}

/** A row of the classes table: one vehicle type. */
export interface PopulationEntity {
  name: string;
  /** Population at each year of `years`, in the same order. */
  series: number[];
  /** Electric population at each year of `years`. */
  electric: number[];
  /** Fuel split in the latest year, largest first. */
  fuel: PopulationFuelRow[];
}

export interface PopulationSeries {
  /** Every year on record, ascending. */
  years: string[];
  /** The latest year — the one every headline figure is reported at. */
  year: string;
  /** The year the change column measures against, if the data reaches it. */
  previousYear: string | null;
  /** One per vehicle type, largest first. */
  entities: PopulationEntity[];
}

/** A population row as the annual dataset publishes it. */
export interface PopulationRow {
  year: string;
  /** LTA's vehicle type, e.g. "Cars", "Motorcycles". */
  name: string;
  fuelType: string;
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
 * per vehicle type for the sparkline and the column chart, a fuel split for
 * the ring, and the latest year's totals for the classes table.
 *
 * Returns `null` when the dataset is empty, which the page renders as its
 * empty state.
 */
export function buildPopulationSeries(
  rows: PopulationRow[],
): PopulationSeries | null {
  const years = [...new Set(rows.map((row) => row.year))].sort();
  if (years.length === 0) {
    return null;
  }

  const year = years[years.length - 1];
  const previousYear = years[years.length - 2] ?? null;
  const columnOf = new Map(years.map((value, index) => [value, index]));

  const drafts = new Map<string, EntityDraft>();

  for (const row of rows) {
    let entity = drafts.get(row.name);
    if (!entity) {
      entity = draft(years.length);
      drafts.set(row.name, entity);
    }

    const column = columnOf.get(row.year);
    if (column !== undefined) {
      entity.series[column] += row.total;
      if (row.fuelType === ELECTRIC) {
        entity.electric[column] += row.total;
      }
    }

    if (row.year === year) {
      fuelRow(entity, row.fuelType).value += row.total;
    } else if (row.year === previousYear) {
      fuelRow(entity, row.fuelType).previous += row.total;
    }
  }

  const entities = [...drafts.entries()]
    .map(([name, entity]) => finalise(name, entity))
    // A type that has left the road entirely is dropped rather than listed as
    // a row of zeros.
    .filter((entity) => (entity.series.at(-1) ?? 0) > 0)
    .sort(
      (first, second) =>
        (second.series.at(-1) ?? 0) - (first.series.at(-1) ?? 0),
    );

  return { entities, previousYear, year, years };
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

/** One vehicle class as the table ranks it at the latest year end. */
export interface ClassRank {
  /** Change on the previous year as a ratio; null without a prior year. */
  change: number | null;
  /** Chart token, assigned by size so it survives a re-sort. */
  colour: string;
  name: string;
  population: number;
  /** Share of every class summed, 0–100. */
  share: number;
}

/**
 * Ranks the classes for the table: colour by size, share of the whole fleet
 * and the movement on the year before. Expects `entities` largest first, as
 * `buildPopulationSeries` returns them.
 */
export function rankClasses(entities: PopulationEntity[]): ClassRank[] {
  const populations = entities.map((entity) => entity.series.at(-1) ?? 0);
  const total = populations.reduce((sum, value) => sum + value, 0) || 1;

  return entities.map((entity, index) => ({
    change: changeRatio(entity.series),
    colour: `var(--chart-${Math.min(CHART_COLOURS, index + 1)})`,
    name: entity.name,
    population: populations[index],
    share: (populations[index] / total) * 100,
  }));
}

export type ClassSortKey = "change" | "name" | "population";
export type SortDirection = "asc" | "desc";

/** Sorts a copy of the ranked classes on one column. */
export function sortClasses(
  rows: ClassRank[],
  key: ClassSortKey,
  direction: SortDirection,
): ClassRank[] {
  const sign = direction === "asc" ? 1 : -1;

  return [...rows].sort((first, second) => {
    if (key === "name") {
      return sign * first.name.localeCompare(second.name, "en-SG");
    }
    if (key === "change") {
      // A class with no prior year sorts as the lowest value rather than
      // pretending to be a 0% change.
      const left = first.change ?? Number.NEGATIVE_INFINITY;
      const right = second.change ?? Number.NEGATIVE_INFINITY;
      if (left === right) {
        return 0;
      }
      return sign * (left < right ? -1 : 1);
    }
    return sign * (first.population - second.population);
  });
}
