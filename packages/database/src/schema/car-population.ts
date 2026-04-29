import {
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const carPopulation = pgTable(
  "car_population",
  {
    id: uuid().defaultRandom().primaryKey(),
    year: text().notNull(),
    make: text().notNull(),
    fuelType: text(),
    number: integer().notNull().default(0),
  },
  (table) => [
    unique().on(table.year, table.make, table.fuelType).nullsNotDistinct(),
    index().on(table.year, table.make),
    index().on(table.year, table.fuelType),
    index().on(table.year),
    index().on(table.make),
    index().on(table.fuelType),
  ],
);

export type InsertCarPopulation = typeof carPopulation.$inferInsert;
export type SelectCarPopulation = typeof carPopulation.$inferSelect;
