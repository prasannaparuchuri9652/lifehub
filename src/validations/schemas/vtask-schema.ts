import type { InferOutput } from "valibot";
import {
  literal, minLength, nonEmpty, number, object,
  optional, pipe, string, transform, union,
} from "valibot";

export const VProjectSchema = object({
  name: pipe(string(), nonEmpty("Project name is required"), transform((v) => v.trim())),
  description: optional(string()),
  status: optional(union([literal("active"), literal("completed"), literal("archived")])),
  deadline: optional(string()),
});

export const VWorkTaskSchema = object({
  title: pipe(string(), nonEmpty("Title is required"), transform((v) => v.trim())),
  description: optional(string()),
  status: optional(union([literal("todo"), literal("in_progress"), literal("done"), literal("blocked")])),
  priority: optional(union([literal("low"), literal("medium"), literal("high"), literal("urgent")])),
  project_id: optional(number()),
  due_date: optional(string()),
  tags: optional(string()),
});

export const VUpdateTaskStatusSchema = object({
  status: union([literal("todo"), literal("in_progress"), literal("done"), literal("blocked")]),
});

export type ValidatedProject = InferOutput<typeof VProjectSchema>;
export type ValidatedWorkTask = InferOutput<typeof VWorkTaskSchema>;
export type ValidatedTaskStatus = InferOutput<typeof VUpdateTaskStatusSchema>;
