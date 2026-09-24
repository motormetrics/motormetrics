const VEHICLE_TYPE_MAP: Record<string, string> = {
  "Multi-purpose Vehicle": "MPV",
  "Multi-purpose Vehicle/Station-wagon": "MPV",
  "Sports Utility Vehicle": "SUV",
  "Station-wagon": "Station wagon",
};

export const formatVehicleType = (type: string): string => {
  return VEHICLE_TYPE_MAP[type] ?? type;
};
