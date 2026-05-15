export const EV_FUEL_TYPES = {
  BEV: ["Electric"],
  PHEV: ["Petrol-Electric (Plug-In)", "Diesel-Electric (Plug-In)"],
  Hybrid: ["Petrol-Electric", "Diesel-Electric"],
} as const;

export const EV_COLORS = {
  BEV: "var(--chart-1)",
  PHEV: "var(--chart-3)",
  Hybrid: "var(--chart-5)",
} as const;

export const ALL_EV_FUEL_TYPES = [
  ...EV_FUEL_TYPES.BEV,
  ...EV_FUEL_TYPES.PHEV,
  ...EV_FUEL_TYPES.Hybrid,
];
