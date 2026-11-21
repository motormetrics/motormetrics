import {
  index,
  integer,
  snakeCase,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Monthly COE revalidations (renewals) from LTA DataMall, by renewal term
 * ("5 Year" or "10 Year") and COE category (A to D).
 */
export const coeRevalidation = snakeCase.table(
  "coe_revalidation",
  {
    id: uuid().defaultRandom().primaryKey(),
    month: text().notNull(),
    type: text().notNull(),
    category: text().notNull(),
    number: integer().notNull().default(0),
  },
  (table) => [
    unique().on(table.month, table.type, table.category),
    index().on(table.month, table.category),
    index().on(table.category),
  ],
);

export type InsertCoeRevalidation = typeof coeRevalidation.$inferInsert;
export type SelectCoeRevalidation = typeof coeRevalidation.$inferSelect;
