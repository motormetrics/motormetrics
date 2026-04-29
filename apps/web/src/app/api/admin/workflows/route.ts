import { auth } from "@web/app/admin/lib/auth";
import { headers } from "next/headers";
import { getRun } from "workflow/api";

export async function GET(request: Request) {
  const headersList = await headers();

  const authHeader = request.headers.get("authorization");
  const isBearerAuth =
    authHeader && authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isBearerAuth) {
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return Response.json(
      { error: "runId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const run = getRun(runId);
    const status = await run.status;
    const workflowName = await run.workflowName;
    const createdAt = await run.createdAt;
    const startedAt = await run.startedAt;
    const completedAt = await run.completedAt;

    return Response.json({
      runId,
      status,
      workflowName,
      createdAt,
      startedAt,
      completedAt,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get run status",
      },
      { status: 404 },
    );
  }
}
