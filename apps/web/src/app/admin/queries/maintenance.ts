import { auth } from "@web/lib/auth";
import {
  type MaintenanceConfig,
  readMaintenanceConfig,
} from "@web/lib/maintenance";
import { headers } from "next/headers";

export const getMaintenanceConfig = async (): Promise<MaintenanceConfig> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const permission =
    session &&
    (await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions: { maintenance: ["read"] } },
    }));

  if (!permission?.success) {
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
