import { ac, admin, type Permissions, user } from "@web/lib/permissions";
import { memoryAdapter } from "better-auth/adapters/memory";
import { betterAuth } from "better-auth/minimal";
import { admin as adminPlugin } from "better-auth/plugins";
import { describe, expect, it } from "vitest";

const createdAt = new Date();

const makeUser = (id: string, role: string | null) => ({
  id,
  name: id,
  email: `${id}@example.com`,
  emailVerified: true,
  role,
  banned: false,
  createdAt,
  updatedAt: createdAt,
});

// The real plugin with the real roles, on an in-memory database
const auth = betterAuth({
  secret: "test-secret-test-secret-test-secret",
  baseURL: "http://localhost:3000",
  database: memoryAdapter({
    user: [
      makeUser("admin", "admin"),
      makeUser("user", "user"),
      makeUser("no-role", null),
    ],
    session: [],
    account: [],
    verification: [],
  }),
  plugins: [adminPlugin({ ac, roles: { admin, user } })],
});

const adminPermissions: Permissions[] = [
  { dashboard: ["view"] },
  { post: ["read", "create", "update", "delete"] },
  { maintenance: ["read", "update"] },
  { workflow: ["read", "trigger"] },
];

const hasPermission = async (userId: string, permissions: Permissions) => {
  const { success } = await auth.api.userHasPermission({
    body: { userId, permissions },
  });

  return success;
};

describe("permissions", () => {
  it.each(adminPermissions)("should grant an admin %o", async (permissions) => {
    expect(await hasPermission("admin", permissions)).toBe(true);
  });

  it.each(
    adminPermissions,
  )("should deny a signed-up user %o", async (permissions) => {
    expect(await hasPermission("user", permissions)).toBe(false);
  });

  it.each(
    adminPermissions,
  )("should deny a user without a role %o", async (permissions) => {
    expect(await hasPermission("no-role", permissions)).toBe(false);
  });

  it("should keep the default user management permissions for an admin", async () => {
    expect(await hasPermission("admin", { user: ["set-role"] })).toBe(true);
  });
});
