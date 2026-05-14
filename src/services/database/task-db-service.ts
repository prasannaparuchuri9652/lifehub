import { asc, desc, eq, isNull } from "drizzle-orm";
import type { ValidatedWorkTask, ValidatedProject } from "../../validations/schemas/vtask-schema";
import db from "../../database/client";
import { work_tasks } from "../../database/schema/work-tasks";
import { projects } from "../../database/schema/projects";

// ── Projects ──────────────────────────────────────────────

export async function getProjects() {
  return db
    .select()
    .from(projects)
    .where(isNull(projects.deleted_at))
    .orderBy(asc(projects.name));
}

export async function createProject(data: ValidatedProject) {
  const [project] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description,
      status: data.status ?? "active",
      deadline: data.deadline ? new Date(data.deadline) : null,
    })
    .returning();
  return project;
}

// ── Work Tasks ────────────────────────────────────────────

export async function getWorkTasks(projectId?: number) {
  const query = db
    .select({
      id: work_tasks.id,
      title: work_tasks.title,
      description: work_tasks.description,
      status: work_tasks.status,
      priority: work_tasks.priority,
      project_id: work_tasks.project_id,
      due_date: work_tasks.due_date,
      completed_at: work_tasks.completed_at,
      tags: work_tasks.tags,
      created_at: work_tasks.created_at,
      project_name: projects.name,
    })
    .from(work_tasks)
    .leftJoin(projects, eq(work_tasks.project_id, projects.id))
    .where(isNull(work_tasks.deleted_at))
    .orderBy(desc(work_tasks.created_at));

  const rows = await query;
  if (projectId) return rows.filter((r) => r.project_id === projectId);
  return rows;
}

export async function createWorkTask(data: ValidatedWorkTask) {
  const [task] = await db
    .insert(work_tasks)
    .values({
      title: data.title,
      description: data.description,
      status: data.status ?? "todo",
      priority: data.priority ?? "medium",
      project_id: data.project_id ?? null,
      due_date: data.due_date ? new Date(data.due_date) : null,
      tags: data.tags,
    })
    .returning();
  return task;
}

export async function updateWorkTask(id: number, data: Partial<ValidatedWorkTask>) {
  const [task] = await db
    .update(work_tasks)
    .set({
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.project_id !== undefined && { project_id: data.project_id }),
      ...(data.due_date !== undefined && { due_date: data.due_date ? new Date(data.due_date) : null }),
      ...(data.tags !== undefined && { tags: data.tags }),
      updated_at: new Date(),
      ...(data.status === "done" && { completed_at: new Date() }),
      ...(data.status && data.status !== "done" && { completed_at: null }),
    })
    .where(eq(work_tasks.id, id))
    .returning();
  return task;
}

export async function deleteWorkTask(id: number) {
  await db
    .update(work_tasks)
    .set({ deleted_at: new Date() })
    .where(eq(work_tasks.id, id));
}
