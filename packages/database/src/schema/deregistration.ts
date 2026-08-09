import {
  index,
  integer,
  snakeCase,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const deregistrations = snakeCase.table(
  "deregistrations",
  {
    id: uuid().defaultRandom().primaryKey(),
    month: text().notNull(),
    category: text().notNull(),
    number: integer().default(0),
  },
  (table) => [
    unique().on(table.month, table.category),
    index().on(table.month, table.category),
    index().on(table.month),
    index().on(table.category),
    index().on(table.number),
  ],
);

export type InsertDeregistration = typeof deregistrations.$inferInsert;
export type SelectDeregistration = typeof deregistrations.$inferSelect;
