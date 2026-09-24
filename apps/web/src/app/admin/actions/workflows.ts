"use server";

import { WORKFLOW_REGION } from "@web/config/workflow";
import { auth } from "@web/lib/auth";
import { carPopulationWorkflow } from "@web/workflows/car-population";
import { carsWorkflow } from "@web/workflows/cars";
import { coeWorkflow } from "@web/workflows/coe";
import { deregistrationsWorkflow } from "@web/workflows/deregistrations";
import { monthlyUpdateWorkflow } from "@web/workflows/monthly-update";
import { vehiclePopulationWorkflow } from "@web/workflows/vehicle-population";
import { headers } from "next/headers";
import { start } from "workflow/api";

const WORKFLOWS = {
  cars: carsWorkflow,
  coe: coeWorkflow,
  deregistrations: deregistrationsWorkflow,
  "vehicle-population": vehiclePopulationWorkflow,
  "monthly-update": monthlyUpdateWorkflow,
  "car-population": carPopulationWorkflow,
};

export async function triggerWorkflow(
  workflowId: string,
): Promise<{ success: boolean; error?: string; runId?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorised" };
  }

  if (!Object.hasOwn(WORKFLOWS, workflowId)) {
    return { success: false, error: `Unknown workflow: ${workflowId}` };
  }

  try {
    const workflow = WORKFLOWS[workflowId as keyof typeof WORKFLOWS];
    const run = await start(workflow, { region: WORKFLOW_REGION });
    return { success: true, runId: run.runId };
  } catch (error) {
    console.error(`Error triggering ${workflowId} workflow:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
