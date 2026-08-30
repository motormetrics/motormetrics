import { WORKFLOW_REGION } from "@web/config/workflow";
import { deregistrationsWorkflow } from "@web/workflows/deregistrations";
import { start } from "workflow/api";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const run = await start(deregistrationsWorkflow, { region: WORKFLOW_REGION });

  return Response.json(
    { message: "Workflow started", runId: run.runId },
    { headers: { "X-Run-Id": run.runId } },
  );
}
