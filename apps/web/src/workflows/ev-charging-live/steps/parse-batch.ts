/**
 * Flattens LTA DataMall's EV Charging Points Batch feed into one record per
 * connector.
 *
 * The feed nests station → chargingPoints → plugTypes → evIds. The batch file
 * deviates from section 2.28 of the DataMall API guide in a few places, all
 * observed on 3 Sep 2026 and handled here alongside the documented shape:
 *
 * - stations sit under `evLocationsData` next to a `LastUpdatedTime`
 * - stations carry `postalCode` directly and no `locationId`
 * - charging points use `operatingHours`
 * - plug types put AC/DC in `current` and the kW figure in `powerRating`
 * - `priceType` is `kWh`, empty, or `free`
 */

export type ConnectorStatus = "available" | "occupied" | "unavailable";

export interface ConnectorRecord {
  evCpId: string;
  locationId: string;
  chargerId: string | null;
  stationName: string | null;
  address: string | null;
  postalCode: string | null;
  longitude: number | null;
  latitude: number | null;
  operator: string | null;
  operationHours: string | null;
  position: string | null;
  plugType: string | null;
  powerRating: string | null;
  chargingSpeedKw: number | null;
  price: number | null;
  priceType: string | null;
  status: ConnectorStatus;
}

interface FeedEvId {
  evCpId?: unknown;
  id?: unknown;
  status?: unknown;
}

interface FeedPlugType {
  plugType?: unknown;
  current?: unknown;
  powerRating?: unknown;
  chargingSpeed?: unknown;
  price?: unknown;
  priceType?: unknown;
  evIds?: unknown;
}

interface FeedChargingPoint {
  id?: unknown;
  name?: unknown;
  operator?: unknown;
  operatingHours?: unknown;
  operationHours?: unknown;
  position?: unknown;
  plugTypes?: unknown;
}

interface FeedStation {
  address?: unknown;
  name?: unknown;
  longitude?: unknown;
  longtitude?: unknown;
  latitude?: unknown;
  locationId?: unknown;
  postalCode?: unknown;
  chargingPoints?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export const toText = (value: unknown): string | null => {
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value !== "string") {
    return null;
  }
  return value.trim() || null;
};

export const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * DataMall codes a connector as `0` occupied, `1` available and an empty
 * string for out-of-order, unknown, planned or removed. Anything else is
 * treated as unavailable rather than guessed at.
 */
export const toConnectorStatus = (value: unknown): ConnectorStatus => {
  const text = toText(value);
  if (text === "1") {
    return "available";
  }
  if (text === "0") {
    return "occupied";
  }
  return "unavailable";
};

/**
 * The batch file says `kWh` where the guide says `$/kWh`. Both land as
 * `$/kWh` so the price queries have one value to filter on; anything else
 * (`free`, hourly) is kept as sent.
 */
export const toPriceType = (value: unknown): string | null => {
  const text = toText(value);
  if (!text) {
    return null;
  }
  return text.toLowerCase().replace(/[$/\s]/g, "") === "kwh" ? "$/kWh" : text;
};

/** Singapore postal codes are the trailing six digits of the address. */
export const extractPostalCode = (address: string | null): string | null => {
  const match = address?.match(/\b(\d{6})\b(?!.*\b\d{6}\b)/);
  return match ? match[1] : null;
};

/**
 * The guide defines a station's `locationId` as the first six decimals of its
 * longitude followed by the postal code. The batch file omits the field, so
 * it is rebuilt the same way to stay compatible with the per-postal-code API.
 */
export const deriveLocationId = (
  longitude: number | null,
  postalCode: string | null,
): string | null => {
  if (!postalCode) {
    return null;
  }
  if (longitude == null) {
    return postalCode;
  }
  const decimals = longitude.toFixed(6).split(".")[1] ?? "";
  return `${decimals}${postalCode}`;
};

/** The batch's `LastUpdatedTime` is wall-clock Singapore time without a zone. */
export const extractLastUpdated = (payload: unknown): Date | null => {
  if (!isRecord(payload)) {
    return null;
  }
  const text = toText(payload.LastUpdatedTime ?? payload.lastUpdatedTime);
  if (!text) {
    return null;
  }
  const parsed = new Date(`${text.replace(" ", "T")}+08:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Accept the batch file's `evLocationsData`, the OData `value` wrapper the
 * per-postal-code endpoint uses, and a bare array.
 */
export const extractStations = (payload: unknown): FeedStation[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }
  if (isRecord(payload)) {
    const list = payload.evLocationsData ?? payload.value;
    if (Array.isArray(list)) {
      return list.filter(isRecord);
    }
  }
  return [];
};

export const parseBatch = (payload: unknown): ConnectorRecord[] => {
  const records: ConnectorRecord[] = [];

  for (const station of extractStations(payload)) {
    const address = toText(station.address);
    const postalCode = toText(station.postalCode) ?? extractPostalCode(address);
    const longitude = toNumber(station.longitude ?? station.longtitude);
    const locationId =
      toText(station.locationId) ?? deriveLocationId(longitude, postalCode);
    if (!locationId) {
      continue;
    }

    const stationBase = {
      locationId,
      stationName: toText(station.name),
      address,
      postalCode,
      longitude,
      latitude: toNumber(station.latitude),
    };

    for (const point of asList(station.chargingPoints).filter(isRecord)) {
      const chargingPoint = point as FeedChargingPoint;
      const pointBase = {
        chargerId: toText(chargingPoint.id),
        operator: toText(chargingPoint.operator),
        operationHours: toText(
          chargingPoint.operatingHours ?? chargingPoint.operationHours,
        ),
        position: toText(chargingPoint.position),
      };

      for (const plug of asList(chargingPoint.plugTypes).filter(isRecord)) {
        const plugType = plug as FeedPlugType;
        // Batch file: `current` is AC/DC and `powerRating` is kW. Guide:
        // `powerRating` is AC/DC and `chargingSpeed` is kW.
        const current = toText(plugType.current);
        const plugBase = {
          plugType: toText(plugType.plugType),
          powerRating: current ?? toText(plugType.powerRating),
          chargingSpeedKw: current
            ? toNumber(plugType.powerRating)
            : toNumber(plugType.chargingSpeed),
          price: toNumber(plugType.price),
          priceType: toPriceType(plugType.priceType),
        };

        for (const connector of asList(plugType.evIds).filter(isRecord)) {
          const evId = connector as FeedEvId;
          const evCpId = toText(evId.evCpId) ?? toText(evId.id);
          if (!evCpId) {
            continue;
          }
          records.push({
            evCpId,
            ...stationBase,
            ...pointBase,
            ...plugBase,
            status: toConnectorStatus(evId.status),
          });
        }
      }
    }
  }

  return records;
};
