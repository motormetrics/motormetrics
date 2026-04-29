import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    slug: text().notNull().unique(),
    content: text().notNull(),
    excerpt: text(),
    heroImage: text(),
    tags: text().array(),
    highlights: jsonb(),
    status: text().default("draft"),
    metadata: jsonb(),
    month: text(),
    dataType: text(),
    embedding: vector({ dimensions: 768 }),
    createdAt: timestamp().defaultNow().notNull(),
    modifiedAt: timestamp().defaultNow().notNull(),
    publishedAt: timestamp(),
  },
  (table) => [
    unique().on(table.month, table.dataType),
    index().using("hnsw", table.embedding.op("vector_cosine_ops")),
  ],
);

export type InsertPost = typeof posts.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;
