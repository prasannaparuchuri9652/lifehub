import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import db from "../../database/client";
import { personal_tasks } from "../../database/schema/personal-tasks";
import { habits } from "../../database/schema/habits";
import { habit_logs } from "../../database/schema/habit-logs";
import type { ValidatedPersonalTask, ValidatedHabit, ValidatedHabitLog } from "../../validations/schemas/vpersonal-schema";

// ── Personal Tasks ────────────────────────────────────────────────────────────

export async function getPersonalTasks() {
  return db
    .select()
    .from(personal_tasks)
    .where(isNull(personal_tasks.deleted_at))
    .orderBy(asc(personal_tasks.created_at));
}

export async function createPersonalTask(data: ValidatedPersonalTask) {
  const [task] = await db
    .insert(personal_tasks)
    .values({
      ...data,
      due_date: data.due_date ? new Date(data.due_date) : null,
    })
    .returning();
  return task;
}

export async function updatePersonalTask(id: number, data: Partial<ValidatedPersonalTask>) {
  const completed_at = data.status === "done" ? new Date() : undefined;
  const [task] = await db
    .update(personal_tasks)
    .set({
      ...data,
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      ...(completed_at !== undefined ? { completed_at } : {}),
      updated_at: new Date(),
    })
    .where(eq(personal_tasks.id, id))
    .returning();
  return task;
}

export async function deletePersonalTask(id: number) {
  await db
    .update(personal_tasks)
    .set({ deleted_at: new Date() })
    .where(eq(personal_tasks.id, id));
}

// ── Habits ────────────────────────────────────────────────────────────────────

export async function getHabits() {
  return db
    .select()
    .from(habits)
    .where(isNull(habits.deleted_at))
    .orderBy(asc(habits.created_at));
}

export async function createHabit(data: ValidatedHabit) {
  const [habit] = await db.insert(habits).values(data).returning();
  return habit;
}

export async function deleteHabit(id: number) {
  await db.update(habits).set({ deleted_at: new Date() }).where(eq(habits.id, id));
}

// ── Habit Logs ────────────────────────────────────────────────────────────────

export async function getHabitLogs(habitId: number) {
  return db
    .select()
    .from(habit_logs)
    .where(and(eq(habit_logs.habit_id, habitId), isNull(habit_logs.deleted_at)))
    .orderBy(desc(habit_logs.logged_date));
}

export async function logHabit(habitId: number, data: ValidatedHabitLog) {
  const [log] = await db
    .insert(habit_logs)
    .values({ habit_id: habitId, ...data })
    .returning();
  return log;
}

export async function deleteHabitLog(id: number) {
  await db.update(habit_logs).set({ deleted_at: new Date() }).where(eq(habit_logs.id, id));
}

// ── Streak calculation ────────────────────────────────────────────────────────

export async function getHabitStreaks() {
  const allLogs = await db
    .select({ habit_id: habit_logs.habit_id, logged_date: habit_logs.logged_date })
    .from(habit_logs)
    .where(isNull(habit_logs.deleted_at))
    .orderBy(desc(habit_logs.logged_date));

  const byHabit: Record<number, string[]> = {};
  for (const log of allLogs) {
    if (!byHabit[log.habit_id]) byHabit[log.habit_id] = [];
    byHabit[log.habit_id].push(log.logged_date as string);
  }

  const streaks: Record<number, { streak: number; total: number; todayDone: boolean }> = {};
  const today = new Date().toISOString().slice(0, 10);

  for (const [habitIdStr, dates] of Object.entries(byHabit)) {
    const habitId = Number(habitIdStr);
    const unique = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
    const todayDone = unique[0] === today;
    let streak = todayDone ? 1 : 0;

    if (todayDone) {
      for (let i = 1; i < unique.length; i++) {
        const prev = new Date(unique[i - 1]);
        const curr = new Date(unique[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86_400_000;
        if (diff === 1) streak++;
        else break;
      }
    }

    streaks[habitId] = { streak, total: unique.length, todayDone };
  }

  return streaks;
}
