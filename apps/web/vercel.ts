import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  git: {
    deploymentEnabled: {
      "dependabot/**": false,
      "renovate/**": false,
    },
  },
  relatedProjects: ["prj_fyAvupEssH3LO4OQFDWplinVFlaI"],
  crons: [
    {
      path: "/api/workflows/cars",
      schedule: "0 10 * * *",
    },
    {
      path: "/api/workflows/coe",
      schedule: "0 10 * * *",
    },
    {
      path: "/api/workflows/deregistrations",
      schedule: "0 10 * * *",
    },
    {
      path: "/api/workflows/vehicle-population",
      schedule: "0 10 1 * *",
    },
    {
      path: "/api/workflows/car-population",
      schedule: "0 10 1 * *",
    },
    {
      path: "/api/workflows/car-costs",
      schedule: "0 10 * * *",
    },
    {
      path: "/api/workflows/electric-vehicles",
      schedule: "30 10 * * *",
    },
  ],
  regions: ["sin1"],
};
