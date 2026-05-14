import { boolean, index, pgSchema, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper";

const lifehub = pgSchema("lifehub");

export const personal_tasks = lifehub.table(
  "personal_tasks",
  {
    id: serial().primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    status: varchar({ length: 50 }).notNull().default("todo"),
    priority: varchar({ length: 50 }).notNull().default("medium"),
    category: varchar({ length: 100 }),
    due_date: timestamp("due_date"),
    is_recurring: boolean("is_recurring").default(false),
    recurrence: varchar({ length: 50 }),
    completed_at: timestamp("completed_at"),
    ...timestamps,
  },
  (t) => [index("personal_tasks_status_idx").on(t.status)]
);

export type PersonalTask = typeof personal_tasks.$inferSelect;
export type NewPersonalTask = typeof personal_tasks.$inferInsert;
