import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Drizzle v1 powers `db.query` from a relations config rather than from
 * `schema` alone, so this has to exist for the relational query builder to be
 * available at all — even though no query in the codebase uses a `with` clause
 * yet. It replaces the `relations()` blocks that used to live in
 * `schema/auth.ts`; `relations()` is removed in v1.
 */
export const relations = defineRelations(schema, (r) => ({
  users: {
    sessions: r.many.sessions(),
    accounts: r.many.accounts(),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
}));
