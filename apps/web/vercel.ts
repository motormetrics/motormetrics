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
      path: "/api/workflows/electric-vehicles",
      schedule: "30 10 * * *",
    },
    {
      path: "/api/workflows/ev-charging",
      schedule: "0 10 * * *",
    },
    {
      // After the cars run so newly registered makes are in the database.
      path: "/api/workflows/logos",
      schedule: "0 11 * * *",
    },
    {
      path: "/api/workflows/ev-charging-live",
      // TODO: The DataMall batch refreshes every 5 minutes, but Hobby caps
      // crons at once a day. Change to "*/5 * * * *" once the project is on
      // Vercel Pro.
      schedule: "0 22 * * *",
    },
  ],
  regions: ["sin1"],
};
