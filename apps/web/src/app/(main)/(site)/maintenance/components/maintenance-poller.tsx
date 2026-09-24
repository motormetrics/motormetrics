"use client";

import { useMaintenance } from "@web/app/(main)/(site)/maintenance/hooks/use-maintenance";

/**
 * Polls the maintenance status and redirects once it ends. Renders nothing, so
 * only this leaf waits on `useSearchParams` and the notice stays in the shell.
 */
export function MaintenancePoller() {
  useMaintenance();
  return null;
}
