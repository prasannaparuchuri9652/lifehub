import type { InferOutput } from "valibot";
import { boolean, length, literal, nonEmpty, object, optional, pipe, regex, string, union } from "valibot";

export const VExpenseSchema = object({
  amount: pipe(string(), nonEmpty("Amount is required")),
  category: pipe(string(), nonEmpty("Category is required")),
  description: optional(string()),
  payment_method_id: optional(string()),
  expense_date: pipe(string(), nonEmpty("Date is required")),
});

export const VBudgetSchema = object({
  category: pipe(string(), nonEmpty("Category is required")),
  amount: pipe(string(), nonEmpty("Amount is required")),
  month: pipe(string(), nonEmpty("Month is required")),
});

export const VPaymentMethodSchema = object({
  type: union([literal("card"), literal("upi"), literal("cash"), literal("netbanking")]),
  label: pipe(string(), nonEmpty("Label is required")),
  last_four: optional(
    pipe(string(), length(4, "Must be exactly 4 digits"), regex(/^\d{4}$/, "Must be 4 numeric digits"))
  ),
  upi_id: optional(string()),
  is_default: optional(boolean()),
});

export type ValidatedExpense = InferOutput<typeof VExpenseSchema>;
export type ValidatedBudget = InferOutput<typeof VBudgetSchema>;
export type ValidatedPaymentMethod = InferOutput<typeof VPaymentMethodSchema>;
