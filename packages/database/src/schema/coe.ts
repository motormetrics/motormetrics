import {
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const coe = pgTable(
  "coe",
  {
    id: uuid().defaultRandom().primaryKey(),
    month: text().notNull(),
    biddingNo: integer().notNull(),
    vehicleClass: text().notNull(),
    quota: integer().notNull(),
    bidsSuccess: integer().notNull(),
    bidsReceived: integer().notNull(),
    premium: integer().notNull(),
  },
  (table) => [
    unique().on(table.month, table.biddingNo, table.vehicleClass),
    index().on(table.month, table.vehicleClass),
    index().on(table.vehicleClass),
    index().on(table.month, table.biddingNo),
    index().on(table.premium),
    index().on(table.bidsSuccess, table.bidsReceived),
    index().on(table.month.desc(), table.biddingNo.desc(), table.vehicleClass),
  ],
);

export const pqp = pgTable(
  "pqp",
  {
    id: uuid().defaultRandom().primaryKey(),
    month: text().notNull(),
    vehicleClass: text().notNull(),
    pqp: integer().notNull(),
  },
  (table) => [
    unique().on(table.month, table.vehicleClass),
    index().on(table.month, table.vehicleClass),
    index().on(table.vehicleClass),
    index().on(table.pqp),
  ],
);

export type InsertCOE = typeof coe.$inferInsert;
export type SelectCOE = typeof coe.$inferSelect;

export type InsertPqp = typeof pqp.$inferInsert;
export type SelectPqp = typeof pqp.$inferSelect;
