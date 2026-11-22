import { WORKFLOW_REGION } from "@web/config/workflow";
import { coeInterimResultsWorkflow } from "@web/workflows/coe-interim-results";
import { start } from "workflow/api";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  // An unset secret must not turn into an accepted "Bearer undefined".
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const run = await start(coeInterimResultsWorkflow, {
    region: WORKFLOW_REGION,
  });

  return Response.json(
    { message: "Workflow started", runId: run.runId },
    { headers: { "X-Run-Id": run.runId } },
  );
}
