export const FUEL_TYPE_LABELS: Record<string, string> = {
  E: "Electric",
  H: "Petrol-Electric",
  R: "Petrol-Electric (Plug-In)",
  P: "Petrol",
};

export const FUEL_TYPE_ORDER = ["E", "R", "H", "P"] as const;

export const VES_BAND_ORDER = ["A", "B", "C1", "C2", "C3"] as const;

export const COST_TERMS = [
  { abbr: "OMV", definition: "Open Market Value" },
  { abbr: "ARF", definition: "Additional Registration Fee" },
  { abbr: "VES", definition: "Vehicular Emissions Scheme" },
  { abbr: "COE", definition: "Certificate of Entitlement" },
] as const;
