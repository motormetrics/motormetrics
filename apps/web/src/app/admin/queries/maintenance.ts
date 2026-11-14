import { hasPermission } from "@web/lib/auth";
import {
  type MaintenanceConfig,
  readMaintenanceConfig,
} from "@web/lib/maintenance";
import { headers } from "next/headers";

export const getMaintenanceConfig = async (): Promise<MaintenanceConfig> => {
  if (!(await hasPermission(await headers(), { maintenance: ["read"] }))) {
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
