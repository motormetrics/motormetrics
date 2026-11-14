import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  dashboard: ["view"],
  post: ["read", "create", "update", "delete"],
  maintenance: ["read", "update"],
  workflow: ["read", "trigger"],
} as const;

export type Permissions = {
  -readonly [Resource in keyof typeof statement]?: (typeof statement)[Resource][number][];
};

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  dashboard: ["view"],
  post: ["read", "create", "update", "delete"],
  maintenance: ["read", "update"],
  workflow: ["read", "trigger"],
});

// Anyone can sign in with Google and lands here, so this role must never be
// granted anything beyond the Better Auth defaults.
export const user = ac.newRole({ ...userAc.statements });
