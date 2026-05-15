"use client";

import { useState } from "react";
import { PriorityBadge } from "@/components/shared/StatusBadge";
import type { PersonalTask } from "@/store/personalStore";

const CATEGORIES = ["Home", "Health", "Family", "Learning", "Other"];

interface Props {
  tasks: PersonalTask[];
  onAdd: (data: Partial<PersonalTask>) => Promise<void>;
  onToggle: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  onView: (task: PersonalTask) => void;
}

export default function HomeTaskList({ tasks, onAdd, onToggle, onDelete, onView }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const todo = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await onAdd({
      title: form.get("title") as string,
      priority: (form.get("priority") as string) || "medium",
      category: (form.get("category") as string) || undefined,
      due_date: (form.get("due_date") as string) || undefined,
      status: "todo",
    });
    setLoading(false);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">{todo.length} remaining</p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="px-5 py-4 border-b border-slate-100 space-y-3 bg-violet-50">
          <input
            name="title" required placeholder="Task title"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
          <div className="flex gap-2">
            <select name="priority" defaultValue="medium"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select name="category"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="">No category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input name="due_date" type="date"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg">
              {loading ? "Adding…" : "Add Task"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Todo items */}
      <div className="divide-y divide-slate-50">
        {todo.length === 0 && !showForm && (
          <p className="text-sm text-slate-400 text-center py-8">No tasks — add one above</p>
        )}
        {todo.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onView={onView} />
        ))}
      </div>

      {/* Done section */}
      {done.length > 0 && (
        <details className="border-t border-slate-100">
          <summary className="px-5 py-3 text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-600 select-none">
            Completed ({done.length})
          </summary>
          <div className="divide-y divide-slate-50">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onView={onView} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete, onView }: {
  task: PersonalTask;
  onToggle: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  onView: (task: PersonalTask) => void;
}) {
  const isDone = task.status === "done";
  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null;
  const isOverdue = task.due_date && !isDone ? new Date(task.due_date) < new Date() : false;

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 group">
      <button
        onClick={() => onToggle(task.id, isDone ? "todo" : "done")}
        className={`w-4.5 h-4.5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors
          ${isDone ? "bg-violet-600 border-violet-600" : "border-slate-300 hover:border-violet-400"}`}
      >
        {isDone && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <button onClick={() => onView(task)} className={`text-sm text-left hover:underline ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</button>
        <div className="flex items-center gap-2 mt-0.5">
          {task.category && (
            <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{task.category}</span>
          )}
          {dueDate && (
            <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
              {isOverdue ? "⚠ " : ""}{dueDate}
            </span>
          )}
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1 rounded"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
