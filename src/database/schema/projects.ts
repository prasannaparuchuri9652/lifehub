import { pgSchema, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

const lifehub = pgSchema("lifehub");

export const projects = lifehub.table("projects", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  status: varchar({ length: 50 }).notNull().default("active"),
  deadline: timestamp("deadline"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
