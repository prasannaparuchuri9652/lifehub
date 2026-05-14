import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as auth_tables from "./schema/auth";
import * as project_tables from "./schema/projects";
import * as work_task_tables from "./schema/work-tasks";
import * as personal_task_tables from "./schema/personal-tasks";
import * as habit_tables from "./schema/habits";
import * as habit_log_tables from "./schema/habit-logs";
import * as payment_method_tables from "./schema/payment-methods";
import * as expense_tables from "./schema/expenses";
import * as budget_tables from "./schema/budgets";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const schema = {
  ...auth_tables,
  ...project_tables,
  ...work_task_tables,
  ...personal_task_tables,
  ...habit_tables,
  ...habit_log_tables,
  ...payment_method_tables,
  ...expense_tables,
  ...budget_tables,
};

const db = drizzle(pool, { schema });

export default db;
