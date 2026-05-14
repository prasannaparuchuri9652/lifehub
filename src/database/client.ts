import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as auth_tables from "./schema/auth";
import * as project_tables from "./schema/projects";
import * as work_task_tables from "./schema/work-tasks";

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
};

const db = drizzle(pool, { schema });

export default db;
