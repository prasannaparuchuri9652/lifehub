import type { InferOutput } from "valibot";
import { boolean, literal, nonEmpty, object, optional, pipe, string, transform, union } from "valibot";

export const VPersonalTaskSchema = object({
  title: pipe(string(), nonEmpty("Title is required"), transform((v) => v.trim())),
  description: optional(string()),
  status: optional(union([literal("todo"), literal("in_progress"), literal("done")])),
  priority: optional(union([literal("low"), literal("medium"), literal("high"), literal("urgent")])),
  category: optional(string()),
  due_date: optional(string()),
  is_recurring: optional(boolean()),
  recurrence: optional(union([literal("daily"), literal("weekly"), literal("monthly")])),
});

export const VHabitSchema = object({
  name: pipe(string(), nonEmpty("Name is required"), transform((v) => v.trim())),
  description: optional(string()),
  frequency: optional(union([literal("daily"), literal("weekly")])),
  color: optional(string()),
});

export const VHabitLogSchema = object({
  logged_date: pipe(string(), nonEmpty("Date is required")),
  note: optional(string()),
});

export type ValidatedPersonalTask = InferOutput<typeof VPersonalTaskSchema>;
export type ValidatedHabit = InferOutput<typeof VHabitSchema>;
export type ValidatedHabitLog = InferOutput<typeof VHabitLogSchema>;
