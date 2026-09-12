import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  git: {
    deploymentEnabled: {
      "dependabot/**": false,
      "renovate/**": false,
    },
  },
  relatedProjects: ["prj_fyAvupEssH3LO4OQFDWplinVFlaI"],
  // The live EV charging ingest (/api/workflows/ev-charging-live) is not
  // here: Hobby caps crons at once a day, so it runs hourly from
  // a QStash schedule (id `ev-charging-live`) that forwards CRON_SECRET.
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
  ],
  regions: ["sin1"],
};
