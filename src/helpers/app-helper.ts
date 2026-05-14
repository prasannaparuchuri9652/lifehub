import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
};
