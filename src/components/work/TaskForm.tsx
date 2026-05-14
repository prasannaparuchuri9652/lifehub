"use client";

import { useState } from "react";
import type { Project } from "@/store/workStore";

interface TaskFormProps {
  projects: Project[];
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: string;
    project_id?: number;
    due_date?: string;
    status: string;
  }) => Promise<void>;
  onCancel: () => void;
  defaultStatus?: string;
}

export default function TaskForm({ projects, onSubmit, onCancel, defaultStatus = "todo" }: TaskFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await onSubmit({
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      priority: form.get("priority") as string,
      project_id: form.get("project_id") ? Number(form.get("project_id")) : undefined,
      due_date: (form.get("due_date") as string) || undefined,
      status: defaultStatus,
    });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white border border-indigo-200 rounded-xl p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">New Task</h3>

      <input
        name="title"
        required
        placeholder="Task title"
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={2}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="flex gap-2">
        <select name="priority" defaultValue="medium"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select name="project_id"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <input
        name="due_date"
        type="date"
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors">
          {loading ? "Adding…" : "Add Task"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
