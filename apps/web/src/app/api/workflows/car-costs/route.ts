import { carCostsWorkflow } from "@web/workflows/car-costs";
import { start } from "workflow/api";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const run = await start(carCostsWorkflow, []);

  return new Response(run.getReadable(), {
    headers: {
      "Content-Type": "application/x-ndjson",
      "X-Run-Id": run.runId,
    },
  });
}
