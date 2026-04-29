"use server";

import { auth } from "@web/app/admin/lib/auth";
import { regenerateHeroWorkflow } from "@web/workflows/regenerate-hero";
import { headers } from "next/headers";
import { start } from "workflow/api";

export async function regeneratePostHero(
  postId: string,
): Promise<{ success: boolean; error?: string; runId?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorised" };
  }

  try {
    const run = await start(regenerateHeroWorkflow, [{ postId }]);
    return { success: true, runId: run.runId };
  } catch (error) {
    console.error("Error triggering regenerate-hero workflow:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
