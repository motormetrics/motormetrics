import { redis } from "@motormetrics/utils";
import { NextResponse } from "next/server";
import { validateApiToken } from "../lib/auth";

interface AppConfig {
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

export async function GET(request: Request) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  try {
    const config = await redis.get<AppConfig>("config");

    return NextResponse.json(
      config?.maintenance ?? { enabled: false, message: "" },
    );
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
    const currentConfig =
      (await redis.get<AppConfig>("config")) ??
      ({ maintenance: { enabled: false, message: "" } } satisfies AppConfig);

    currentConfig.maintenance = maintenance;

    await redis.set("config", currentConfig);

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
