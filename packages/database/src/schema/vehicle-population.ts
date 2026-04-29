import {
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const vehiclePopulation = pgTable(
  "vehicle_population",
  {
    id: uuid().defaultRandom().primaryKey(),
    year: text().notNull(),
    category: text().notNull(),
    fuelType: text().notNull(),
    number: integer().notNull().default(0),
  },
  (table) => [
    unique().on(table.year, table.category, table.fuelType),
    index().on(table.year, table.category),
    index().on(table.year, table.fuelType),
    index().on(table.year),
    index().on(table.category),
    index().on(table.fuelType),
  ],
);

export type InsertVehiclePopulation = typeof vehiclePopulation.$inferInsert;
export type SelectVehiclePopulation = typeof vehiclePopulation.$inferSelect;
