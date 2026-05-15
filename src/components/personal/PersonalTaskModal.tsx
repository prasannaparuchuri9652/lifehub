"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { useToastStore } from "@/store/toastStore";
import type { PersonalTask } from "@/store/personalStore";

const CATEGORIES = ["Home", "Health", "Family", "Learning", "Other"];
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

interface Props {
  task: PersonalTask | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<PersonalTask>) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function PersonalTaskModal({ task, open, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToastStore((s) => s.show);

  if (!task) return null;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!task) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await onUpdate(task.id, {
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      priority: form.get("priority") as string,
      category: (form.get("category") as string) || undefined,
      due_date: (form.get("due_date") as string) || undefined,
    });
    setSaving(false);
    setEditing(false);
    toast("Task updated");
  }

  function handleDelete() {
    if (!task) return;
    onDelete(task.id);
    toast("Task deleted", "error");
    onClose();
  }

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Modal open={open} onClose={() => { setEditing(false); onClose(); }} title={editing ? "Edit Task" : "Task Detail"} width="sm">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
            <input name="title" required defaultValue={task.title}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
            <textarea name="description" rows={2} defaultValue={task.description ?? ""}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
              <select name="priority" defaultValue={task.priority}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
              <select name="category" defaultValue={task.category ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                <option value="">None</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Due date</label>
            <input name="due_date" type="date"
              defaultValue={task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : ""}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
            {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Status" value={task.status} capitalize />
            <InfoRow label="Priority" value={task.priority} capitalize />
            {task.category && <InfoRow label="Category" value={task.category} />}
            {dueDate && <InfoRow label="Due date" value={dueDate} />}
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setEditing(true)}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Edit
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function InfoRow({ label, value, capitalize }: { label: string; value: React.ReactNode; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
      <div className={`text-sm text-slate-800 ${capitalize ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}
