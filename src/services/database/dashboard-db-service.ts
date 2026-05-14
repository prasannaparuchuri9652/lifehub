import { and, isNull, sql } from "drizzle-orm";
import db from "../../database/client";
import { work_tasks } from "../../database/schema/work-tasks";
import { personal_tasks } from "../../database/schema/personal-tasks";
import { habit_logs } from "../../database/schema/habit-logs";
import { habits } from "../../database/schema/habits";
import { expenses } from "../../database/schema/expenses";

export async function getWorkStats() {
  const rows = await db
    .select({ status: work_tasks.status, count: sql<number>`count(*)::int` })
    .from(work_tasks)
    .where(isNull(work_tasks.deleted_at))
    .groupBy(work_tasks.status);

  return {
    todo: rows.find((r) => r.status === "todo")?.count ?? 0,
    in_progress: rows.find((r) => r.status === "in_progress")?.count ?? 0,
    done: rows.find((r) => r.status === "done")?.count ?? 0,
    blocked: rows.find((r) => r.status === "blocked")?.count ?? 0,
  };
}

export async function getPersonalStats() {
  const rows = await db
    .select({ status: personal_tasks.status, count: sql<number>`count(*)::int` })
    .from(personal_tasks)
    .where(isNull(personal_tasks.deleted_at))
    .groupBy(personal_tasks.status);

  const today = new Date().toISOString().slice(0, 10);
  const [habitTotal, habitDoneToday] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(habits).where(isNull(habits.deleted_at)),
    db.select({ count: sql<number>`count(distinct ${habit_logs.habit_id})::int` })
      .from(habit_logs)
      .where(and(isNull(habit_logs.deleted_at), sql`${habit_logs.logged_date}::text = ${today}`)),
  ]);

  return {
    todo: rows.find((r) => r.status === "todo")?.count ?? 0,
    in_progress: rows.find((r) => r.status === "in_progress")?.count ?? 0,
    done: rows.find((r) => r.status === "done")?.count ?? 0,
    habits_total: habitTotal[0]?.count ?? 0,
    habits_done_today: habitDoneToday[0]?.count ?? 0,
  };
}

export async function getFinanceStats() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const rows = await db
    .select({ total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)` })
    .from(expenses)
    .where(
      and(
        isNull(expenses.deleted_at),
        sql`extract(year from ${expenses.expense_date}::date) = ${year}`,
        sql`extract(month from ${expenses.expense_date}::date) = ${month}`
      )
    );

  const catRows = await db
    .select({ category: expenses.category, total: sql<string>`sum(${expenses.amount}::numeric)` })
    .from(expenses)
    .where(
      and(
        isNull(expenses.deleted_at),
        sql`extract(year from ${expenses.expense_date}::date) = ${year}`,
        sql`extract(month from ${expenses.expense_date}::date) = ${month}`
      )
    )
    .groupBy(expenses.category)
    .limit(3);

  return {
    total_this_month: parseFloat(rows[0]?.total ?? "0"),
    top_categories: catRows.map((r) => ({ category: r.category, total: parseFloat(r.total ?? "0") })),
  };
}
