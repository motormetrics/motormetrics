"use server";

import { redis } from "@motormetrics/utils";

interface AppConfig {
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

export interface MaintenanceStatus {
  enabled: boolean;
  message: string;
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    const config = await redis.get<AppConfig>("config");

    return (
      config?.maintenance ?? {
        enabled: false,
        message: "",
      }
    );
  } catch (error) {
    console.error("Error fetching maintenance status from Redis:", error);

    return {
      enabled: false,
      message: "",
    };
  }
}
