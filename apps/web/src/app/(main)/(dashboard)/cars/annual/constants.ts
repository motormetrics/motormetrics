export const FUEL_GROUP_MAP: Record<string, string> = {
  Petrol: "Petrol",
  Diesel: "Diesel",
  "Petrol-Electric": "Hybrid",
  "Petrol-Electric (Plug-In)": "Hybrid",
  "Diesel-Electric": "Hybrid",
  "Diesel-Electric (Plug-In)": "Hybrid",
  Electric: "Electric",
  CNG: "CNG",
  "Petrol-CNG": "CNG",
};

export const FUEL_GROUPS = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Electric",
  "CNG",
  "Others",
] as const;

export const FUEL_GROUP_COLORS: Record<string, string> = {
  Petrol: "var(--chart-1)",
  Diesel: "var(--chart-2)",
  Hybrid: "var(--chart-3)",
  Electric: "var(--chart-4)",
  CNG: "var(--chart-5)",
  Others: "var(--chart-6)",
};
