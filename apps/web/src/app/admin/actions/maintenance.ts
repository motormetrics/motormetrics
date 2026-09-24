"use server";

import { auth } from "@web/app/admin/lib/auth";
import {
  type MaintenanceConfig,
  writeMaintenanceConfig,
} from "@web/lib/maintenance";
import { headers } from "next/headers";

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
