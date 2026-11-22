import {
  index,
  integer,
  snakeCase,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const coe = snakeCase.table(
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

export const pqp = snakeCase.table(
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

/**
 * COE results announced on OneMotoring when an exercise closes, held only until
 * the LTA DataMall CSV publishes the same exercise into `coe` the next day.
 * Same columns as `coe`; `coe` itself only ever holds CSV rows.
 */
export const coeInterimResults = snakeCase.table(
  "coe_interim_results",
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
    index().on(table.month, table.biddingNo),
  ],
);

export type InsertCOE = typeof coe.$inferInsert;
export type SelectCOE = typeof coe.$inferSelect;

export type InsertCoeInterimResult = typeof coeInterimResults.$inferInsert;
export type SelectCoeInterimResult = typeof coeInterimResults.$inferSelect;

export type InsertPqp = typeof pqp.$inferInsert;
export type SelectPqp = typeof pqp.$inferSelect;
