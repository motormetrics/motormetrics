import { getMaintenanceStatus } from "@web/app/(main)/(site)/maintenance/actions/maintenance";
import type { MaintenanceConfig } from "@web/lib/maintenance";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type MaintenanceFetcher = () => Promise<MaintenanceConfig>;

export interface UseMaintenanceOptions {
  pollingInterval?: number;
  fetchStatus?: MaintenanceFetcher;
}

const DEFAULT_POLLING_INTERVAL = 30000;

const resolveOptions = (
  options?: number | UseMaintenanceOptions,
): {
  pollingInterval: number;
  fetchStatus: MaintenanceFetcher;
} => {
  if (typeof options === "number") {
    return {
      pollingInterval: options,
      fetchStatus: getMaintenanceStatus,
    };
  }

  return {
    pollingInterval: options?.pollingInterval ?? DEFAULT_POLLING_INTERVAL,
    fetchStatus: options?.fetchStatus ?? getMaintenanceStatus,
  };
};

export function useMaintenance(options?: number | UseMaintenanceOptions) {
  const { pollingInterval, fetchStatus } = resolveOptions(options);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { enabled } = await fetchStatus();

        if (!enabled) {
          const from = searchParams.get("from");
          if (from) {
            router.replace(decodeURIComponent(from));
          } else {
            router.replace("/");
          }
        }
      } catch (e) {
        console.error("Error checking maintenance status:", e);
      }
    };

    const interval = setInterval(checkMaintenance, pollingInterval);

    void checkMaintenance();

    return () => clearInterval(interval);
  }, [fetchStatus, pollingInterval, router, searchParams]);
}
