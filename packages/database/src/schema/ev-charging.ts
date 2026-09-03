import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  primaryKey,
  snakeCase,
  text,
  timestamp,
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

/**
 * Latest observed state of every public connector, one row per `evCpId`.
 *
 * Fed every five minutes from LTA DataMall's EV Charging Points Batch API and
 * upserted in place, so this table is always the current snapshot. Station
 * and price attributes travel with the connector because the feed nests them
 * under each station and the batch is the only source that carries prices.
 */
export const evConnectorStatus = snakeCase.table(
  "ev_connector_status",
  {
    evCpId: text().primaryKey(),
    /** DataMall's station key: first six decimals of longitude + postal code. */
    locationId: text().notNull(),
    chargerId: text(),
    stationName: text(),
    address: text(),
    postalCode: text(),
    longitude: doublePrecision(),
    latitude: doublePrecision(),
    operator: text(),
    operationHours: text(),
    position: text(),
    plugType: text(),
    /** "AC" or "DC" as the feed labels it. */
    powerRating: text(),
    chargingSpeedKw: doublePrecision(),
    price: doublePrecision(),
    /** Verbatim from the feed, e.g. "$/kWh" or "$/h". */
    priceType: text(),
    /** "available", "occupied" or "unavailable". */
    status: text().notNull(),
    statusChangedAt: timestamp({ withTimezone: true }).notNull(),
    observedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    index().on(table.locationId),
    index().on(table.operator),
    index().on(table.postalCode),
  ],
);

/**
 * Append-only log of connector transitions between batch snapshots.
 *
 * `status` events give plug-in and unplug times, so sessions, dwell time and
 * busy hours derive from here. `price` events record advertised-rate moves
 * for the "what changed this week" surfaces.
 */
export const evChargingEvents = snakeCase.table(
  "ev_charging_events",
  {
    id: uuid().defaultRandom().primaryKey(),
    evCpId: text().notNull(),
    locationId: text().notNull(),
    /** "status" or "price". */
    kind: text().notNull(),
    previousValue: text(),
    value: text().notNull(),
    observedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    index().on(table.evCpId, table.observedAt),
    index().on(table.locationId, table.observedAt),
    index().on(table.kind, table.observedAt),
  ],
);

/**
 * Per-location utilisation rolled up by hour.
 *
 * Every batch run adds one sample per location: the connector count and how
 * many were occupied or unavailable at that moment. Averages over the past
 * seven days fall out of these counters without scanning the event log.
 */
export const evLocationHourly = snakeCase.table(
  "ev_location_hourly",
  {
    locationId: text().notNull(),
    hour: timestamp({ withTimezone: true }).notNull(),
    samples: integer().notNull().default(0),
    connectorSamples: integer().notNull().default(0),
    occupiedSamples: integer().notNull().default(0),
    unavailableSamples: integer().notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.locationId, table.hour] }),
    index().on(table.hour),
  ],
);

export type InsertEvConnectorStatus = typeof evConnectorStatus.$inferInsert;
export type SelectEvConnectorStatus = typeof evConnectorStatus.$inferSelect;
export type InsertEvChargingEvent = typeof evChargingEvents.$inferInsert;
export type SelectEvChargingEvent = typeof evChargingEvents.$inferSelect;
export type InsertEvLocationHourly = typeof evLocationHourly.$inferInsert;
export type SelectEvLocationHourly = typeof evLocationHourly.$inferSelect;
