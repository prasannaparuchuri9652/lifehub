import { numeric, pgSchema, serial, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper";

const lifehub = pgSchema("lifehub");

export const budgets = lifehub.table("budgets", {
  id: serial().primaryKey(),
  category: varchar({ length: 100 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  month: varchar({ length: 7 }).notNull(),
  ...timestamps,
});

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
