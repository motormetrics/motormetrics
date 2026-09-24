"use server";

import {
  type MaintenanceConfig,
  readMaintenanceConfig,
} from "@web/lib/maintenance";

export async function getMaintenanceStatus(): Promise<MaintenanceConfig> {
  try {
    return await readMaintenanceConfig();
  } catch (error) {
    console.error("Error fetching maintenance status from Redis:", error);

    return {
      enabled: false,
      message: "",
    };
  }
}
