import { index, integer, pgSchema, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { timestamps } from "../../helpers/app-helper";

const lifehub = pgSchema("lifehub");

export const work_tasks = lifehub.table(
  "work_tasks",
  {
    id: serial().primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    status: varchar({ length: 50 }).notNull().default("todo"),
    priority: varchar({ length: 50 }).notNull().default("medium"),
    project_id: integer("project_id").references(() => projects.id),
    due_date: timestamp("due_date"),
    completed_at: timestamp("completed_at"),
    tags: varchar({ length: 500 }),
    ...timestamps,
  },
  (t) => [index("work_tasks_status_idx").on(t.status)]
);

export type WorkTask = typeof work_tasks.$inferSelect;
export type NewWorkTask = typeof work_tasks.$inferInsert;
