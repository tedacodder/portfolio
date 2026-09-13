import { boolean, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { articleStatusEnum } from "./enums";

export const articles = pgTable(
  "articles",
  {
    ...idColumn,
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    // Markdown content. Rendering to HTML is a frontend concern.
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    status: articleStatusEnum("status").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    readingTimeMinutes: integer("reading_time_minutes"),
    featured: boolean("featured").notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("articles_slug_idx").on(table.slug),
    index("articles_status_idx").on(table.status),
    index("articles_published_at_idx").on(table.publishedAt),
  ],
);

export const tags = pgTable(
  "tags",
  {
    ...idColumn,
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ...timestampColumns,
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)],
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.tagId] })],
);
