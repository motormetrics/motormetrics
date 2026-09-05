import { WORKFLOW_REGION } from "@web/config/workflow";
import { logosWorkflow } from "@web/workflows/logos";
import { start } from "workflow/api";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const run = await start(logosWorkflow, { region: WORKFLOW_REGION });

  return Response.json(
    { message: "Workflow started", runId: run.runId },
    { headers: { "X-Run-Id": run.runId } },
  );
}
