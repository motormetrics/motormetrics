import { auth } from "@web/app/admin/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";

const { GET, POST: authPost } = toNextJsHandler(auth);

export { GET };

export async function POST(request: Request) {
  const verification = await checkBotId({
    advancedOptions: {
      checkLevel: "basic",
    },
  });

  if (verification.isBot) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return authPost(request);
}
