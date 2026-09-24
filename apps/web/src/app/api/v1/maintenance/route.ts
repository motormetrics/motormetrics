import { validateApiToken } from "@web/app/api/v1/lib/auth";
import {
  readMaintenanceConfig,
  writeMaintenanceConfig,
} from "@web/lib/maintenance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  try {
    return NextResponse.json(await readMaintenanceConfig());
  } catch (error) {
    console.error("[API] Failed to read maintenance config:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to read maintenance config",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  const body = await request.json();

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled (boolean) is required" },
      { status: 400 },
    );
  }

  const maintenance = {
    enabled: body.enabled,
    message: typeof body.message === "string" ? body.message : "",
  };

  try {
    await writeMaintenanceConfig(maintenance);

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error("[API] Failed to update maintenance config:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update maintenance config",
      },
      { status: 500 },
    );
  }
}
