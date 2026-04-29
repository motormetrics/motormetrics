import {
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const carCosts = pgTable(
  "car_costs",
  {
    id: uuid().defaultRandom().primaryKey(),
    month: text().notNull(),
    sn: integer().notNull(),
    make: text().notNull(),
    model: text().notNull(),
    coeCat: text().notNull(),
    engineCapacity: text(),
    maxPowerOutput: doublePrecision().notNull(),
    fuelType: text().notNull(),
    co2: doublePrecision().notNull(),
    vesBanding: text().notNull(),
    omv: doublePrecision().notNull(),
    gstExciseDuty: doublePrecision().notNull(),
    arf: doublePrecision().notNull(),
    vesSurchargeRebate: doublePrecision().notNull(),
    eeai: doublePrecision().notNull(),
    registrationFee: doublePrecision().notNull(),
    coePremium: doublePrecision().notNull(),
    totalBasicCostWithoutCoe: doublePrecision().notNull(),
    totalBasicCostWithCoe: doublePrecision().notNull(),
    sellingPriceWithoutCoe: doublePrecision().notNull().default(0),
    sellingPriceWithCoe: doublePrecision().notNull().default(0),
    differenceWithoutCoe: doublePrecision(),
    differenceWithCoe: doublePrecision(),
  },
  (table) => [
    unique().on(table.month, table.make, table.model),
    index().on(table.month, table.make),
    index().on(table.month),
    index().on(table.make),
    index().on(table.fuelType),
  ],
);

export type InsertCarCost = typeof carCosts.$inferInsert;
export type SelectCarCost = typeof carCosts.$inferSelect;
