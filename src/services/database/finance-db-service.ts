import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import db from "../../database/client";
import { expenses } from "../../database/schema/expenses";
import { budgets } from "../../database/schema/budgets";
import { payment_methods } from "../../database/schema/payment-methods";
import type { ValidatedExpense, ValidatedBudget, ValidatedPaymentMethod } from "../../validations/schemas/vfinance-schema";

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpenses(month?: string) {
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const [year, mon] = currentMonth.split("-");

  return db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      category: expenses.category,
      description: expenses.description,
      expense_date: expenses.expense_date,
      payment_method_id: expenses.payment_method_id,
      created_at: expenses.created_at,
      payment_label: payment_methods.label,
      payment_type: payment_methods.type,
    })
    .from(expenses)
    .leftJoin(payment_methods, eq(expenses.payment_method_id, payment_methods.id))
    .where(
      and(
        isNull(expenses.deleted_at),
        sql`EXTRACT(YEAR FROM ${expenses.expense_date}::date) = ${year}`,
        sql`EXTRACT(MONTH FROM ${expenses.expense_date}::date) = ${mon}`
      )
    )
    .orderBy(desc(expenses.expense_date));
}

export async function createExpense(data: ValidatedExpense) {
  const [expense] = await db
    .insert(expenses)
    .values({
      amount: data.amount,
      category: data.category,
      description: data.description,
      payment_method_id: data.payment_method_id ? Number(data.payment_method_id) : null,
      expense_date: data.expense_date,
    })
    .returning();
  return expense;
}

export async function deleteExpense(id: number) {
  await db.update(expenses).set({ deleted_at: new Date() }).where(eq(expenses.id, id));
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export async function getBudgets(month?: string) {
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  return db
    .select()
    .from(budgets)
    .where(and(eq(budgets.month, currentMonth), isNull(budgets.deleted_at)))
    .orderBy(asc(budgets.category));
}

export async function upsertBudget(data: ValidatedBudget) {
  const [existing] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.category, data.category), eq(budgets.month, data.month), isNull(budgets.deleted_at)));

  if (existing) {
    const [updated] = await db
      .update(budgets)
      .set({ amount: data.amount, updated_at: new Date() })
      .where(eq(budgets.id, existing.id))
      .returning();
    return updated;
  }

  const [budget] = await db.insert(budgets).values(data).returning();
  return budget;
}

// ── Payment Methods ───────────────────────────────────────────────────────────

export async function getPaymentMethods() {
  return db
    .select()
    .from(payment_methods)
    .where(isNull(payment_methods.deleted_at))
    .orderBy(desc(payment_methods.is_default), asc(payment_methods.created_at));
}

export async function createPaymentMethod(data: ValidatedPaymentMethod) {
  const [method] = await db.insert(payment_methods).values(data).returning();
  return method;
}

export async function deletePaymentMethod(id: number) {
  await db.update(payment_methods).set({ deleted_at: new Date() }).where(eq(payment_methods.id, id));
}

// ── Summary ───────────────────────────────────────────────────────────────────

export async function getExpenseSummary(month?: string) {
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const [year, mon] = currentMonth.split("-");

  const rows = await db
    .select({
      category: expenses.category,
      total: sql<string>`SUM(${expenses.amount}::numeric)`,
    })
    .from(expenses)
    .where(
      and(
        isNull(expenses.deleted_at),
        sql`EXTRACT(YEAR FROM ${expenses.expense_date}::date) = ${year}`,
        sql`EXTRACT(MONTH FROM ${expenses.expense_date}::date) = ${mon}`
      )
    )
    .groupBy(expenses.category);

  return rows.map((r) => ({ category: r.category, total: parseFloat(r.total ?? "0") }));
}
