import { pgSchema, serial, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper";

const lifehub = pgSchema("lifehub");

export const habits = lifehub.table("habits", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  frequency: varchar({ length: 50 }).notNull().default("daily"),
  color: varchar({ length: 20 }).default("#6366f1"),
  ...timestamps,
});

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
