import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";
import { authRelations } from "./schema/auth";

/**
 * Drizzle v1 powers `db.query` from a relations config rather than from `schema`
 * alone, so this has to exist for the relational query builder to be available —
 * even though no query in the codebase uses a `with` clause yet.
 *
 * The auth relations are not written by hand: `pnpm auth:generate` emits them as
 * a `defineRelationsPart`, which is why they live in `schema/auth.ts` alongside
 * the tables the same command generates. Everything else belongs here.
 *
 * Spread order matters — the whole-schema object must come first. A part spread
 * ahead of it would be overwritten table-by-table and its relations silently
 * lost.
 */
const appRelations = defineRelations(schema, () => ({}));

export const relations = { ...appRelations, ...authRelations };
