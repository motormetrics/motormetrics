import { ac, admin, user } from "@web/lib/permissions";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [adminClient({ ac, roles: { admin, user } })],
});
