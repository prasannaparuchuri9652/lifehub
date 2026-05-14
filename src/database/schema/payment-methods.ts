import { boolean, pgSchema, serial, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper";

const lifehub = pgSchema("lifehub");

export const payment_methods = lifehub.table("payment_methods", {
  id: serial().primaryKey(),
  type: varchar({ length: 50 }).notNull(),
  label: varchar({ length: 255 }).notNull(),
  last_four: varchar({ length: 4 }),
  upi_id: varchar({ length: 255 }),
  is_default: boolean("is_default").default(false),
  ...timestamps,
});

export type PaymentMethod = typeof payment_methods.$inferSelect;
export type NewPaymentMethod = typeof payment_methods.$inferInsert;
