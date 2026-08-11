import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const missionTasks = sqliteTable(
  "mission_tasks",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: text("status", {
      enum: ["urgent", "todo", "blocked", "backlog", "done"],
    }).notNull(),
    source: text("source", {
      enum: ["slack", "gmail", "calendar", "manual"],
    }).notNull(),
    person: text("person").notNull().default(""),
    dueAt: text("due_at"),
    sourceId: text("source_id"),
    waitingOn: text("waiting_on"),
    url: text("url"),
    isManual: integer("is_manual", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_mission_tasks_owner_status").on(table.ownerId, table.status)],
);

export type MissionTask = typeof missionTasks.$inferSelect;
