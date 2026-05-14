import { date, index, integer, numeric, pgSchema, serial, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper";
import { payment_methods } from "./payment-methods";

const lifehub = pgSchema("lifehub");

export const expenses = lifehub.table(
  "expenses",
  {
    id: serial().primaryKey(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    category: varchar({ length: 100 }).notNull(),
    description: text(),
    payment_method_id: integer("payment_method_id").references(() => payment_methods.id),
    expense_date: date("expense_date").notNull(),
    ...timestamps,
  },
  (t) => [index("expenses_category_idx").on(t.category)]
);

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
