/**
 * Flattens LTA DataMall's EV Charging Points Batch feed into one record per
 * connector.
 *
 * The feed nests station → chargingPoints → plugTypes → evIds. Field names
 * follow section 2.28 of the DataMall API guide, including its `longtitude`
 * spelling, which is accepted alongside the correct one in case the batch
 * file differs from the per-postal-code endpoint.
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

/** Singapore postal codes are the trailing six digits of the address. */
export const extractPostalCode = (address: string | null): string | null => {
  const match = address?.match(/\b(\d{6})\b(?!.*\b\d{6}\b)/);
  return match ? match[1] : null;
};

/**
 * The batch endpoint hands back a presigned link to a JSON file. Both the
 * per-postal-code endpoint and DataMall's other OData feeds wrap results in
 * `value`, so accept that shape and a bare array.
 */
export const extractStations = (payload: unknown): FeedStation[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }
  if (isRecord(payload) && Array.isArray(payload.value)) {
    return payload.value.filter(isRecord);
  }
  return [];
};

export const parseBatch = (payload: unknown): ConnectorRecord[] => {
  const records: ConnectorRecord[] = [];

  for (const station of extractStations(payload)) {
    const address = toText(station.address);
    const stationBase = {
      locationId: toText(station.locationId),
      stationName: toText(station.name),
      address,
      postalCode: extractPostalCode(address),
      longitude: toNumber(station.longitude ?? station.longtitude),
      latitude: toNumber(station.latitude),
    };

    for (const point of asList(station.chargingPoints).filter(isRecord)) {
      const chargingPoint = point as FeedChargingPoint;
      const pointBase = {
        chargerId: toText(chargingPoint.id),
        operator: toText(chargingPoint.operator),
        operationHours: toText(chargingPoint.operationHours),
        position: toText(chargingPoint.position),
      };

      for (const plug of asList(chargingPoint.plugTypes).filter(isRecord)) {
        const plugType = plug as FeedPlugType;
        const plugBase = {
          plugType: toText(plugType.plugType),
          powerRating: toText(plugType.powerRating),
          chargingSpeedKw: toNumber(plugType.chargingSpeed),
          price: toNumber(plugType.price),
          priceType: toText(plugType.priceType),
        };

        for (const connector of asList(plugType.evIds).filter(isRecord)) {
          const evId = connector as FeedEvId;
          const evCpId = toText(evId.evCpId) ?? toText(evId.id);
          if (!evCpId) {
            continue;
          }
          // Fall back to the postal code so a station missing `locationId`
          // still groups with its neighbours instead of being dropped.
          const locationId = stationBase.locationId ?? stationBase.postalCode;
          if (!locationId) {
            continue;
          }
          records.push({
            evCpId,
            ...stationBase,
            locationId,
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
