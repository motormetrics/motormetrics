import { and, eq, notExists } from "drizzle-orm";
import {
  index,
  integer,
  pgView,
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

/**
 * Every COE result the site shows: all `coe` rows, plus the same-day rows in
 * `coe_interim_results` whose exercise the DataMall CSV has not yet put in
 * `coe`. The COE page queries read this instead of `coe`.
 */
export const coeResults = pgView("coe_results").as((qb) =>
  qb
    .select({
      month: coe.month,
      biddingNo: coe.biddingNo,
      vehicleClass: coe.vehicleClass,
      quota: coe.quota,
      bidsSuccess: coe.bidsSuccess,
      bidsReceived: coe.bidsReceived,
      premium: coe.premium,
    })
    .from(coe)
    .unionAll(
      qb
        .select({
          month: coeInterimResults.month,
          biddingNo: coeInterimResults.biddingNo,
          vehicleClass: coeInterimResults.vehicleClass,
          quota: coeInterimResults.quota,
          bidsSuccess: coeInterimResults.bidsSuccess,
          bidsReceived: coeInterimResults.bidsReceived,
          premium: coeInterimResults.premium,
        })
        .from(coeInterimResults)
        .where(
          notExists(
            qb
              .select({ month: coe.month })
              .from(coe)
              .where(
                and(
                  eq(coe.month, coeInterimResults.month),
                  eq(coe.biddingNo, coeInterimResults.biddingNo),
                ),
              ),
          ),
        ),
    ),
);

export type InsertCOE = typeof coe.$inferInsert;
export type SelectCOE = typeof coe.$inferSelect;

export type SelectCoeResult = typeof coeResults.$inferSelect;

export type InsertCoeInterimResult = typeof coeInterimResults.$inferInsert;
export type SelectCoeInterimResult = typeof coeInterimResults.$inferSelect;

export type InsertPqp = typeof pqp.$inferInsert;
export type SelectPqp = typeof pqp.$inferSelect;
