import { NextResponse } from "next/server";

export function validateApiToken(request: Request): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token || token !== process.env.MOTORMETRICS_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  return null;
}
