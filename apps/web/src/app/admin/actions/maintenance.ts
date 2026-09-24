"use server";

import { auth } from "@web/app/admin/lib/auth";
import {
  type MaintenanceConfig,
  readMaintenanceConfig,
  writeMaintenanceConfig,
} from "@web/lib/maintenance";
import { headers } from "next/headers";

export const getMaintenanceConfig = async (): Promise<MaintenanceConfig> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorised");
  }

  try {
    return await readMaintenanceConfig();
  } catch (error) {
    console.error("Error fetching maintenance config from Redis:", error);

    return {
      enabled: false,
      message: "",
    };
  }
};

export const updateMaintenanceConfig = async (
  maintenanceConfig: MaintenanceConfig,
): Promise<{ success: boolean; error?: string }> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      error: "Unauthorised",
    };
  }

  try {
    await writeMaintenanceConfig(maintenanceConfig);

    return { success: true };
  } catch (error) {
    console.error("Error updating maintenance config:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
