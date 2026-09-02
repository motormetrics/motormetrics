import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  snakeCase,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Publicly accessible EV charging points, one row per connector.
 *
 * Sourced from LTA DataMall's quarterly "Electric Vehicle Charging Points"
 * dataset. `evCpId` is the connector ID LTA assigns at registration and is
 * also the key DataMall's real-time EV charging API uses, so this table can
 * later carry live availability without being reshaped.
 */
export const evChargingPoints = snakeCase.table(
  "ev_charging_points",
  {
    id: uuid().defaultRandom().primaryKey(),
    evCpId: text().notNull(),
    registrationCode: text().notNull(),
    operator: text().notNull(),
    outlets: integer().notNull().default(1),
    plugType: text().notNull(),
    chargingSpeedKw: doublePrecision(),
    postalCode: text(),
    blockHouseNo: text(),
    streetName: text(),
    buildingName: text(),
    floorNo: text(),
    lotNo: text(),
    publiclyAccessible: boolean().notNull().default(true),
    longitude: doublePrecision(),
    latitude: doublePrecision(),
    registrationDate: date(),
    parkingLotType: text(),
  },
  (table) => [
    unique().on(table.evCpId),
    index().on(table.operator),
    index().on(table.plugType),
    index().on(table.registrationDate),
  ],
);

export type InsertEvChargingPoint = typeof evChargingPoints.$inferInsert;
export type SelectEvChargingPoint = typeof evChargingPoints.$inferSelect;
