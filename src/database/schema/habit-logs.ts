import { date, integer, pgSchema, serial, text } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper";
import { habits } from "./habits";

const lifehub = pgSchema("lifehub");

export const habit_logs = lifehub.table("habit_logs", {
  id: serial().primaryKey(),
  habit_id: integer("habit_id").notNull().references(() => habits.id),
  logged_date: date("logged_date").notNull(),
  note: text(),
  ...timestamps,
});

export type HabitLog = typeof habit_logs.$inferSelect;
export type NewHabitLog = typeof habit_logs.$inferInsert;
